import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export interface ChallengePoolConfig {
  mode: 'static' | 'pool';
  source_package_ids: string[];
}

const POOL_CONFIG_KEY = 'challenge_pool_config';
const REVIEWS_SETTING_KEY = 'question_ai_reviews';

const DEFAULT_POOL_CONFIG: ChallengePoolConfig = {
  mode: 'static',
  source_package_ids: [],
};

async function readSettingJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (!data?.value) return fallback;
    return JSON.parse(data.value) as T;
  } catch {
    return fallback;
  }
}

async function writeSettingJson(key: string, value: unknown) {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.from('system_settings').upsert({
    key,
    value: JSON.stringify(value),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeCat(raw?: string): 'TWK' | 'TIU' | 'TKP' {
  const up = (raw || 'TWK').toUpperCase();
  if (up.includes('TIU')) return 'TIU';
  if (up.includes('TKP')) return 'TKP';
  return 'TWK';
}

function getTargetDifficultiesForDay(dayNumber: number): {
  primary: number[];
  fallback: number[];
} {
  if (dayNumber <= 10) {
    // Hari 1-10: Mudah & Sedang (AI skor 1-3)
    return { primary: [1, 2, 3], fallback: [4, 5] };
  }
  if (dayNumber <= 20) {
    // Hari 11-20: Sulit (AI skor 4)
    return { primary: [4], fallback: [3, 5, 2, 1] };
  }
  // Hari 21-30: HOTS / Sangat Sulit (AI skor 5)
  return { primary: [5], fallback: [4, 3, 2, 1] };
}

async function fetchPoolQuestions(packageIds: string[]) {
  const supabaseAdmin = getSupabaseAdmin();
  let targetPkgIds = packageIds;

  if (targetPkgIds.length === 0) {
    const { data: challengePkgs } = await supabaseAdmin
      .from('challenge_packages')
      .select('package_id')
      .not('package_id', 'is', null);
    targetPkgIds = Array.from(
      new Set((challengePkgs || []).map((c: any) => c.package_id).filter(Boolean))
    );
  }

  if (targetPkgIds.length === 0) {
    return { questions: [], fallbackPackageId: null as string | null };
  }

  let allQuestions: any[] = [];
  const chunkSize = 30;
  for (let i = 0; i < targetPkgIds.length; i += chunkSize) {
    const chunk = targetPkgIds.slice(i, i + chunkSize);
    const { data } = await supabaseAdmin
      .from('questions')
      .select('*')
      .in('package_id', chunk);
    if (data) allQuestions = allQuestions.concat(data);
  }

  return {
    questions: allQuestions,
    fallbackPackageId: targetPkgIds[0] || null,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const config = await readSettingJson<ChallengePoolConfig>(
      POOL_CONFIG_KEY,
      DEFAULT_POOL_CONFIG
    );

    if (action === 'config_only') {
      return NextResponse.json({ config });
    }

    const reviewsMap = await readSettingJson<Record<string, any>>(
      REVIEWS_SETTING_KEY,
      {}
    );

    // Bangun map review per question_id maupun source_question_id
    let qbMap = new Map<string, string>();
    if (Object.keys(reviewsMap).length > 0) {
      const supabaseAdmin = getSupabaseAdmin();
      const { data: qbRows } = await supabaseAdmin
        .from('question_bank')
        .select('id, source_question_id');
      (qbRows || []).forEach((r: any) => {
        if (r.source_question_id) qbMap.set(r.source_question_id, r.id);
      });
    }

    const getDifficulty = (q: any): number | null => {
      const rev = reviewsMap[q.id] || reviewsMap[qbMap.get(q.id) || ''];
      return rev?.difficulty ? Number(rev.difficulty) : null;
    };

    if (action === 'admin_stats') {
      const { questions } = await fetchPoolQuestions(config.source_package_ids);
      const stats = {
        total: questions.length,
        sector1: { TWK: 0, TIU: 0, TKP: 0 }, // 1-3 Mudah/Sedang
        sector2: { TWK: 0, TIU: 0, TKP: 0 }, // 4 Sulit
        sector3: { TWK: 0, TIU: 0, TKP: 0 }, // 5 HOTS
        unchecked: { TWK: 0, TIU: 0, TKP: 0 },
      };

      questions.forEach((q) => {
        const cat = normalizeCat(q.category);
        const diff = getDifficulty(q);
        if (!diff) {
          stats.unchecked[cat]++;
        } else if (diff <= 3) {
          stats.sector1[cat]++;
        } else if (diff === 4) {
          stats.sector2[cat]++;
        } else {
          stats.sector3[cat]++;
        }
      });

      return NextResponse.json({ config, stats });
    }

    // Mode sesi ujian untuk member
    const userId = searchParams.get('user_id');
    const dayNumber = Math.max(1, Math.min(30, Number(searchParams.get('day_number')) || 1));

    if (config.mode !== 'pool') {
      return NextResponse.json({ mode: 'static', config });
    }

    if (!userId) {
      return NextResponse.json({ error: 'user_id wajib diisi' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: userProgress } = await supabaseAdmin
      .from('challenge_progress')
      .select('id, current_day')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    const progressId = userProgress?.id || 'default';
    const sessionKey = `challenge_session_${userId}_${progressId}_${dayNumber}`;
    const seenKey = `challenge_seen_${userId}`;

    const { questions: poolQuestions, fallbackPackageId } = await fetchPoolQuestions(
      config.source_package_ids
    );

    if (poolQuestions.length === 0) {
      return NextResponse.json(
        { error: 'Bank Soal Pool Challenge masih kosong. Hubungi Admin.' },
        { status: 404 }
      );
    }

    const existingSessionIds = await readSettingJson<string[]>(sessionKey, []);
    const poolById = new Map(poolQuestions.map((q) => [q.id, q]));

    if (existingSessionIds.length > 0) {
      const restored = existingSessionIds
        .map((id) => poolById.get(id))
        .filter(Boolean)
        .map((q, idx) => ({ ...q, question_number: idx + 1 }));

      if (restored.length > 0) {
        return NextResponse.json({
          mode: 'pool',
          dayNumber,
          progressId: userProgress?.id || null,
          fallbackPackageId,
          questions: restored,
        });
      }
    }

    // Generate 110 soal baru (30 TWK, 35 TIU, 45 TKP) dengan anti-soal sama
    const seenIds = new Set(await readSettingJson<string[]>(seenKey, []));
    const { primary, fallback } = getTargetDifficultiesForDay(dayNumber);

    const quotas: Array<{ cat: 'TWK' | 'TIU' | 'TKP'; count: number }> = [
      { cat: 'TWK', count: 30 },
      { cat: 'TIU', count: 35 },
      { cat: 'TKP', count: 45 },
    ];

    const selectedQuestions: any[] = [];

    for (const { cat, count } of quotas) {
      const catPool = poolQuestions.filter((q) => normalizeCat(q.category) === cat);

      const p1UnseenPrimary = shuffleArray(
        catPool.filter((q) => {
          const d = getDifficulty(q);
          return !seenIds.has(q.id) && d !== null && primary.includes(d);
        })
      );
      const p2UnseenUncheckedOrFallback = shuffleArray(
        catPool.filter((q) => {
          const d = getDifficulty(q);
          return !seenIds.has(q.id) && (d === null || fallback.includes(d));
        })
      );
      const p3SeenPrimary = shuffleArray(
        catPool.filter((q) => {
          const d = getDifficulty(q);
          return seenIds.has(q.id) && d !== null && primary.includes(d);
        })
      );
      const p4SeenFallback = shuffleArray(
        catPool.filter((q) => {
          const d = getDifficulty(q);
          return seenIds.has(q.id) && (d === null || fallback.includes(d));
        })
      );

      const orderedCandidates = [
        ...p1UnseenPrimary,
        ...p2UnseenUncheckedOrFallback,
        ...p3SeenPrimary,
        ...p4SeenFallback,
      ];

      const picked: any[] = [];
      const pickedIds = new Set<string>();
      for (const item of orderedCandidates) {
        if (picked.length >= count) break;
        if (!pickedIds.has(item.id)) {
          pickedIds.add(item.id);
          picked.push(item);
        }
      }

      selectedQuestions.push(...picked);
    }

    const numberedQuestions = selectedQuestions.map((q, idx) => ({
      ...q,
      question_number: idx + 1,
    }));
    const newSessionIds = numberedQuestions.map((q) => q.id);

    // Simpan sesi & tambahkan ke daftar seen user agar jika gagal & mengulang tidak dapat soal yang sama
    const updatedSeen = Array.from(new Set([...seenIds, ...newSessionIds]));
    await Promise.all([
      writeSettingJson(sessionKey, newSessionIds),
      writeSettingJson(seenKey, updatedSeen),
    ]);

    return NextResponse.json({
      mode: 'pool',
      dayNumber,
      progressId: userProgress?.id || null,
      fallbackPackageId,
      questions: numberedQuestions,
    });
  } catch (err: any) {
    console.error('Challenge session error:', err);
    return NextResponse.json(
      { error: err?.message || 'Gagal memproses sesi 30 Days Challenge' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'save_config') {
      const nextConfig: ChallengePoolConfig = {
        mode: body.config?.mode === 'pool' ? 'pool' : 'static',
        source_package_ids: Array.isArray(body.config?.source_package_ids)
          ? body.config.source_package_ids
          : [],
      };
      await writeSettingJson(POOL_CONFIG_KEY, nextConfig);
      return NextResponse.json({ success: true, config: nextConfig });
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Gagal menyimpan konfigurasi Challenge Pool' },
      { status: 500 }
    );
  }
}
