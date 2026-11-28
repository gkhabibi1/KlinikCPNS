import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function maskName(fullName?: string | null): string {
  const clean = (fullName || 'Pejuang ASN').trim();
  if (!clean) return 'Pejuang ASN';
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].length <= 3
      ? `${parts[0]}***`
      : `${parts[0].slice(0, 3)}***`;
  }
  return `${parts[0]} ${parts[1].slice(0, 1)}***`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get('package_id');
    const supabaseAdmin = getSupabaseAdmin();

    let query = supabaseAdmin
      .from('exam_results')
      .select('id, user_id, package_id, skor_twk, skor_tiu, skor_tkp, skor_total, is_passed, created_at')
      .order('skor_total', { ascending: false })
      .limit(30);

    if (packageId && packageId !== 'ALL') {
      query = query.eq('package_id', packageId);
    }

    const { data: results, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!results || results.length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }

    // Ambil 1 skor terbaik per user agar tidak duplikat orang yang sama
    const bestByUser = new Map<string, any>();
    for (const row of results) {
      const total =
        Number(row.skor_total) ||
        Number(row.skor_twk || 0) + Number(row.skor_tiu || 0) + Number(row.skor_tkp || 0);
      const prev = bestByUser.get(row.user_id);
      if (!prev || total > prev.__total) {
        bestByUser.set(row.user_id, { ...row, __total: total });
      }
      if (bestByUser.size >= 10) break;
    }

    const topRows = Array.from(bestByUser.values()).slice(0, 10);
    const userIds = Array.from(new Set(topRows.map((r) => r.user_id).filter(Boolean)));
    const pkgIds = Array.from(new Set(topRows.map((r) => r.package_id).filter(Boolean)));

    const [{ data: profiles }, { data: pkgs }] = await Promise.all([
      userIds.length > 0
        ? supabaseAdmin.from('profiles').select('id, full_name').in('id', userIds)
        : Promise.resolve({ data: [] }),
      pkgIds.length > 0
        ? supabaseAdmin.from('tryout_packages').select('id, name').in('id', pkgIds)
        : Promise.resolve({ data: [] }),
    ]);

    const nameMap = new Map((profiles || []).map((p: any) => [p.id, p.full_name]));
    const pkgMap = new Map((pkgs || []).map((p: any) => [p.id, p.name]));

    const leaderboard = topRows.map((r, idx) => ({
      rank: idx + 1,
      display_name: maskName(nameMap.get(r.user_id)),
      package_name: pkgMap.get(r.package_id) || 'Simulasi CAT SKD',
      skor_twk: Number(r.skor_twk || 0),
      skor_tiu: Number(r.skor_tiu || 0),
      skor_tkp: Number(r.skor_tkp || 0),
      skor_total: r.__total,
      is_passed: Boolean(r.is_passed),
    }));

    return NextResponse.json({ leaderboard });
  } catch (err: any) {
    console.error('Leaderboard API error:', err);
    return NextResponse.json({ leaderboard: [] });
  }
}
