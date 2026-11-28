import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

interface LeaderboardEntry {
  rank?: number;
  display_name: string;
  package_name: string;
  skor_twk: number;
  skor_tiu: number;
  skor_tkp: number;
  skor_total: number;
  is_passed: boolean;
}

const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  {
    display_name: 'Rizky P***',
    package_name: 'Try Out SKD CPNS #04',
    skor_twk: 115,
    skor_tiu: 155,
    skor_tkp: 212,
    skor_total: 482,
    is_passed: true,
  },
  {
    display_name: 'Nadia K***',
    package_name: 'Try Out SKD CPNS #03',
    skor_twk: 110,
    skor_tiu: 150,
    skor_tkp: 208,
    skor_total: 468,
    is_passed: true,
  },
  {
    display_name: 'Fajar A***',
    package_name: 'Try Out SKD CPNS #02',
    skor_twk: 105,
    skor_tiu: 145,
    skor_tkp: 205,
    skor_total: 455,
    is_passed: true,
  },
  {
    display_name: 'Siti R***',
    package_name: 'Try Out SKD CPNS #05',
    skor_twk: 100,
    skor_tiu: 140,
    skor_tkp: 204,
    skor_total: 444,
    is_passed: true,
  },
  {
    display_name: 'Bagus W***',
    package_name: 'Try Out SKD CPNS #01',
    skor_twk: 100,
    skor_tiu: 135,
    skor_tkp: 199,
    skor_total: 434,
    is_passed: true,
  },
  {
    display_name: 'Putri M***',
    package_name: 'Try Out SKD CPNS #04',
    skor_twk: 95,
    skor_tiu: 130,
    skor_tkp: 197,
    skor_total: 422,
    is_passed: true,
  },
  {
    display_name: 'Andi S***',
    package_name: 'Try Out SKD CPNS #02',
    skor_twk: 95,
    skor_tiu: 125,
    skor_tkp: 192,
    skor_total: 412,
    is_passed: true,
  },
  {
    display_name: 'Dewi L***',
    package_name: 'Try Out SKD CPNS #03',
    skor_twk: 90,
    skor_tiu: 120,
    skor_tkp: 191,
    skor_total: 401,
    is_passed: true,
  },
  {
    display_name: 'Hendra T***',
    package_name: 'Try Out SKD CPNS #01',
    skor_twk: 85,
    skor_tiu: 115,
    skor_tkp: 192,
    skor_total: 392,
    is_passed: true,
  },
  {
    display_name: 'Aulia N***',
    package_name: 'Try Out SKD CPNS #02',
    skor_twk: 85,
    skor_tiu: 110,
    skor_tkp: 189,
    skor_total: 384,
    is_passed: true,
  },
];

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

export async function GET() {
  let realEntries: LeaderboardEntry[] = [];

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: results } = await supabaseAdmin
      .from('exam_results')
      .select('user_id, package_id, skor_twk, skor_tiu, skor_tkp, skor_total, is_passed')
      .order('skor_total', { ascending: false })
      .limit(30);

    if (results && results.length > 0) {
      // Ambil 1 skor terbaik per user
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

      const topReal = Array.from(bestByUser.values());
      const userIds = Array.from(new Set(topReal.map((r) => r.user_id).filter(Boolean)));
      const pkgIds = Array.from(new Set(topReal.map((r) => r.package_id).filter(Boolean)));

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

      realEntries = topReal.map((r) => ({
        display_name: maskName(nameMap.get(r.user_id)),
        package_name: pkgMap.get(r.package_id) || 'Simulasi CAT SKD',
        skor_twk: Number(r.skor_twk || 0),
        skor_tiu: Number(r.skor_tiu || 0),
        skor_tkp: Number(r.skor_tkp || 0),
        skor_total: r.__total,
        is_passed: Boolean(r.is_passed),
      }));
    }
  } catch (err) {
    console.warn('Leaderboard fallback to sample baseline:', err);
  }

  // Gabungkan skor real + dummy, urutkan dari tertinggi, ambil Top 10
  const merged = [...realEntries, ...SAMPLE_LEADERBOARD]
    .sort((a, b) => b.skor_total - a.skor_total)
    .slice(0, 10)
    .map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));

  return NextResponse.json({ leaderboard: merged });
}
