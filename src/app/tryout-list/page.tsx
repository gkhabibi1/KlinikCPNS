'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import MemberLayout from '../../components/MemberLayout';
import {
  FileText,
  Briefcase,
  AlertCircle,
  Inbox,
  Lock,
  Clock,
  BarChart3,
  Play,
  X,
  Flame,
  ArrowRight,
  ShieldCheck,
  Trophy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function TryoutListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'CPNS' | 'P3K'>('CPNS');
  const [packages, setPackages] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [examHistory, setExamHistory] = useState<{ [key: string]: any[] }>({});
  const [latestScores, setLatestScores] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    fetch('/api/tryout/leaderboard')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.leaderboard)) setLeaderboard(d.leaderboard);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Cek user login
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error('Auth error:', authError);
          router.push('/');
          return;
        }

        // 2. Ambil profil user
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) setUserProfile(profile);

        // 1. Ambil semua paket try out yang aktif
        let { data: allPackages, error: pkgError } = await supabase
          .from('tryout_packages')
          .select('*')
          .eq('exam_type', activeTab)
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        // Fallback jika kolom belum ada
        if (pkgError) {
          console.warn('Query dengan filter exam_type/is_active gagal, mencoba fallback:', pkgError.message);
          
          const fallback = await supabase
            .from('tryout_packages')
            .select('*')
            .order('created_at', { ascending: true });
          
          allPackages = fallback.data;
          pkgError = fallback.error;
        }

        if (pkgError) {
          console.error('Error fetching packages:', pkgError);
          setError('Gagal memuat paket try out: ' + pkgError.message);
          setIsLoading(false);
          return;
        }

        // 2. Ambil daftar package_id yang sudah digunakan untuk challenge
        const { data: challengePackages } = await supabase
          .from('challenge_packages')
          .select('package_id')
          .eq('is_active', true);

        // 3. Buat Set dari package_id challenge untuk filter cepat
        const challengePackageIds = new Set(
          challengePackages?.map((c: any) => c.package_id) || []
        );

        // 4. Filter paket: hanya yang TIDAK ada di challenge
        const filteredPackages = (allPackages || []).filter(
          (pkg: any) => !challengePackageIds.has(pkg.id)
        );

        setPackages(filteredPackages);

        const pkgData = filteredPackages;

        // 4. Fetch history untuk semua paket
        if (pkgData && pkgData.length > 0) {
          const historyPromises = pkgData.map(async (pkg: any) => {
            const { data } = await supabase
              .from('exam_results')
              .select('*')
              .eq('user_id', user.id)
              .eq('package_id', pkg.id)
              .order('created_at', { ascending: false });

            if (data && data.length > 0) {
              setExamHistory(prev => ({ ...prev, [pkg.id]: data }));
              const firstItem = data[0];
              const calculatedTotal = (firstItem.skor_twk ?? firstItem.score_twk ?? 0) +
                                      (firstItem.skor_tiu ?? firstItem.score_tiu ?? 0) +
                                      (firstItem.skor_tkp ?? firstItem.score_tkp ?? 0);
              const firstScore = firstItem.skor_total ?? firstItem.total_score ?? calculatedTotal;
              setLatestScores(prev => ({ ...prev, [pkg.id]: firstScore }));
            } else {
              setExamHistory(prev => ({ ...prev, [pkg.id]: [] }));
              setLatestScores(prev => ({ ...prev, [pkg.id]: -1 }));
            }
          });

          await Promise.all(historyPromises);
        }

      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Terjadi kesalahan tak terduga.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, router]);

  const isExpired = userProfile ? new Date(userProfile.subscription_valid_until) < new Date() : false;

  const openHistoryModal = (pkg: any) => {
    setSelectedPackage(pkg);
    setShowHistoryModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MemberLayout>
      <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
        {/* Segmented Tab Navigation + Akses Cepat 30 Days Challenge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap gap-1.5 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200/70">
            <button
              onClick={() => setActiveTab('CPNS')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'CPNS'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" strokeWidth={1.8} />
              <span>Try Out CPNS</span>
            </button>
            <button
              onClick={() => setActiveTab('P3K')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'P3K'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" strokeWidth={1.8} />
              <span>Try Out P3K</span>
            </button>
            <Link
              href="/dashboard/challenge"
              className="px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80"
            >
              <Flame className="w-4 h-4 text-amber-600" strokeWidth={2} />
              <span>30 Days Challenge</span>
            </Link>
          </div>
        </div>

        {/* Banner Cepat 30 Days Challenge (Mudah ditemukan di Mobile) */}
        <Link
          href="/dashboard/challenge"
          className="block bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-all group"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-sm sm:text-base font-extrabold tracking-tight">
                    30 Days CPNS Challenge
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    Syarat Garansi 100%
                  </span>
                </div>
                <p className="text-xs text-white/90 mt-0.5 leading-relaxed">
                  Latihan konsisten 1 paket try out setiap hari selama 30 hari penuh.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center justify-center gap-1.5 bg-white text-orange-600 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs group-hover:translate-x-0.5 transition-transform shrink-0 self-start sm:self-center">
              <span>Buka Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Peringkat Nasional Top 10 (Collapsible) */}
        {leaderboard.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowLeaderboard((v) => !v)}
              className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Top {leaderboard.length} Peringkat Nasional Try Out SKD
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Skor tertinggi peserta · Klik untuk {showLeaderboard ? 'menyembunyikan' : 'melihat'} papan peringkat
                  </p>
                </div>
              </div>
              {showLeaderboard ? (
                <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
              )}
            </button>

            {showLeaderboard && (
              <div className="border-t border-slate-100 divide-y divide-slate-100">
                {leaderboard.map((row) => (
                  <div
                    key={`${row.rank}-${row.display_name}`}
                    className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
                          row.rank === 1
                            ? 'bg-amber-400 text-slate-950'
                            : row.rank === 2
                            ? 'bg-slate-300 text-slate-900'
                            : row.rank === 3
                            ? 'bg-orange-300 text-slate-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {row.rank}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">
                          {row.display_name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {row.package_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline text-[11px] text-slate-500">
                        TWK {row.skor_twk} · TIU {row.skor_tiu} · TKP {row.skor_tkp}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-extrabold">
                        {row.skor_total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Status Langganan */}
        {isExpired && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4.5 h-4.5" strokeWidth={1.8} />
            </div>
            <p className="text-xs sm:text-sm text-amber-900">
              <strong className="font-bold">Akun Free</strong> — Anda saat ini hanya dapat mengakses paket Try Out Gratis.{' '}
              <Link href="/dashboard?tab=subscription" className="underline font-bold text-blue-700 hover:text-blue-800">
                Upgrade ke Premium →
              </Link>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Daftar Paket */}
        {isLoading ? (
          <div className="text-center py-12 text-sm text-slate-500">Memuat paket try out...</div>
        ) : packages.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl text-center py-16 px-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-heading text-base font-bold text-slate-800 mb-1">Belum Ada Paket Try Out</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {activeTab === 'CPNS' 
                ? 'Belum ada paket Try Out CPNS yang tersedia.' 
                : 'Belum ada paket Try Out P3K yang tersedia.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map(pkg => {
              const isLocked = pkg.is_premium && isExpired;
              const latestScore = latestScores[pkg.id] ?? -1;
              const history = examHistory[pkg.id] ?? [];
              const isFree = pkg.is_free || !pkg.is_premium;

              return (
                <div 
                  key={pkg.id} 
                  className={`bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 overflow-hidden shadow-xs hover:shadow-md transition-all relative flex flex-col p-5 ${
                    isLocked ? 'opacity-80' : ''
                  }`}
                >
                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
                      <div className="text-center text-white p-3 bg-slate-900/70 rounded-2xl border border-white/10 backdrop-blur-md">
                        <Lock className="w-6 h-6 mx-auto mb-1 text-amber-300" strokeWidth={1.8} />
                        <p className="text-xs font-bold">Khusus Premium</p>
                      </div>
                    </div>
                  )}

                  {/* Header Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isFree 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {isFree ? 'Gratis' : 'Premium'}
                    </span>

                    {history.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setShowHistoryModal(true);
                        }}
                        className="text-[11px] text-blue-600 font-semibold px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Clock className="w-3 h-3" strokeWidth={1.8} />
                        Riwayat ({history.length}x)
                      </button>
                    )}
                  </div>

                  {/* Nama Paket */}
                  <div className="flex-1 mb-4">
                    <h3 className="font-heading font-bold text-slate-900 text-base leading-snug line-clamp-2 mb-1.5">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {pkg.description || 'Simulasi CAT BKN 110 Soal (TWK, TIU, TKP)'}
                    </p>
                  </div>

                  {/* Nilai Terakhir */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-slate-500">Skor Terakhir</span>
                    <span className={`font-bold text-lg font-mono ${
                      latestScore === -1 
                        ? 'text-slate-400' 
                        : latestScore >= 311 
                        ? 'text-emerald-600' 
                        : 'text-blue-600'
                    }`}>
                      {latestScore === -1 ? '-' : latestScore}
                    </span>
                  </div>

                  {/* Tombol Mulai Ujian */}
                  <Link
                    href={`/tryout/${pkg.id}`}
                    className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                      isLocked 
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                        : 'bg-slate-900 hover:bg-blue-600 text-white shadow-xs'
                    }`}
                    onClick={(e) => isLocked && e.preventDefault()}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Terkunci</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Mulai Ujian</span>
                      </>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal History */}
        {showHistoryModal && selectedPackage && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-slate-200">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-slate-900">History Pengerjaan</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedPackage.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {examHistory[selectedPackage.id]?.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">Belum ada riwayat pengerjaan</div>
                ) : (
                  <div className="space-y-3">
                    {examHistory[selectedPackage.id]?.map((result: any, index: number) => {
                      const totalScore = result.skor_total ?? result.total_score ?? 0;
                      const scoreTwk = result.skor_twk ?? result.score_twk ?? 0;
                      const scoreTiu = result.skor_tiu ?? result.score_tiu ?? 0;
                      const scoreTkp = result.skor_tkp ?? result.score_tkp ?? 0;

                      return (
                        <div key={result.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div className="text-sm text-slate-500">{formatDate(result.created_at)}</div>
                            </div>
                            <div className={`text-2xl font-bold ${result.is_passed ? 'text-green-600' : 'text-red-600'}`}>
                              {totalScore}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="bg-slate-50 rounded p-2 text-center">
                              <div className="text-xs text-slate-500 mb-1">TWK</div>
                              <div className={`font-bold ${scoreTwk >= 65 ? 'text-green-600' : 'text-slate-700'}`}>
                                {scoreTwk}
                              </div>
                              <div className="text-[10px] text-slate-400">PG: 65</div>
                            </div>
                            <div className="bg-slate-50 rounded p-2 text-center">
                              <div className="text-xs text-slate-500 mb-1">TIU</div>
                              <div className={`font-bold ${scoreTiu >= 80 ? 'text-green-600' : 'text-slate-700'}`}>
                                {scoreTiu}
                              </div>
                              <div className="text-[10px] text-slate-400">PG: 80</div>
                            </div>
                            <div className="bg-slate-50 rounded p-2 text-center">
                              <div className="text-xs text-slate-500 mb-1">TKP</div>
                              <div className={`font-bold ${scoreTkp >= 166 ? 'text-green-600' : 'text-slate-700'}`}>
                                {scoreTkp}
                              </div>
                              <div className="text-[10px] text-slate-400">PG: 166</div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              result.is_passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {result.is_passed ? '✓ LULUS' : ' BELUM LULUS'}
                            </span>
                            {index === 0 && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                                Terakhir
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
