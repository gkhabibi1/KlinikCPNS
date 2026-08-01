'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import MemberLayout from '../../components/MemberLayout';

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

        console.log(`Menampilkan ${filteredPackages.length} dari ${allPackages?.length || 0} paket (${challengePackageIds.size} di-filter untuk challenge)`);
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
      <div className="space-y-6 p-6 md:p-8 max-w-6xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('CPNS')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'CPNS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Try Out CPNS
          </button>
          <button
            onClick={() => setActiveTab('P3K')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'P3K'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Try Out P3K
          </button>
        </div>

        {/* Status Langganan */}
        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-sm text-red-700">
              <strong>Langganan Expired</strong> - Anda hanya bisa mengakses paket Try Out Gratis.
              <Link href="/dashboard?tab=subscription" className="underline ml-1 font-semibold">Perpanjang Sekarang</Link>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Daftar Paket */}
        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Memuat paket try out...</div>
        ) : packages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Paket Try Out</h3>
            <p className="text-slate-500">
              {activeTab === 'CPNS' 
                ? 'Belum ada paket Try Out CPNS yang tersedia.' 
                : 'Belum ada paket Try Out P3K yang tersedia.'}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Silakan hubungi admin untuk menambahkan paket.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => {
              const isLocked = pkg.is_premium && isExpired;
              const latestScore = latestScores[pkg.id] ?? -1;
              const history = examHistory[pkg.id] ?? [];

              return (
                <div key={pkg.id} className={`bg-white p-5 rounded-xl border shadow-sm relative ${isLocked ? 'opacity-75' : ''}`}>
                  {isLocked && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
                      <div className="text-4xl mb-2">🔒</div>
                      <div className="font-bold text-slate-800">Akses Terkunci</div>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                      pkg.is_premium ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {pkg.is_premium ? 'PREMIUM' : 'GRATIS'}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg mb-2">{pkg.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{pkg.description || 'Tidak ada deskripsi'}</p>

                  {/* Nilai Terakhir */}
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Nilai Terakhir</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {latestScore === -1 ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <span className={latestScore >= 200 ? 'text-green-600' : 'text-blue-600'}>
                          {latestScore}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tombol History */}
                  {history.length > 0 && (
                    <button
                      onClick={() => openHistoryModal(pkg)}
                      className="w-full mb-3 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Lihat History ({history.length}x)
                    </button>
                  )}

                  <Link
                    href={`/tryout/${pkg.id}`}
                    className={`block text-center py-2.5 rounded-lg font-medium transition-colors ${
                      isLocked
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    Mulai Ujian
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal History */}
        {showHistoryModal && selectedPackage && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">📊 History Pengerjaan</h3>
                  <p className="text-sm text-slate-500 mt-1">{selectedPackage.name}</p>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
                >
                  ×
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
