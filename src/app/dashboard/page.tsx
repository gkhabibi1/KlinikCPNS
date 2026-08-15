'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import MemberLayout from '../../components/MemberLayout';
import NotificationCenter from '../../components/NotificationCenter';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const tabFromUrl = searchParams ? searchParams.get('tab') : null;
  const initialTab = (tabFromUrl === 'subscription' || tabFromUrl === 'notifications') ? tabFromUrl : 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'subscription' | 'notifications'>(initialTab);
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tabFromUrl = searchParams ? searchParams.get('tab') : null;
    if (tabFromUrl === 'subscription') {
      setActiveTab('subscription');
    } else if (tabFromUrl === 'notifications') {
      setActiveTab('notifications');
    } else {
      setActiveTab('overview');
    }
  }, [searchParams]);

  useEffect(() => {
    const checkExpiringSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_valid_until, subscription_package_id, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.subscription_valid_until) return;

      const expiryDate = new Date(profile.subscription_valid_until);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('title', '⏰ Langganan Segera Berakhir')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (!existingNotif || existingNotif.length === 0) {
          await supabase.from('notifications').insert([{
            user_id: user.id,
            title: '⏰ Langganan Segera Berakhir',
            message: `Halo ${profile.full_name || 'Member'}, langganan Anda akan berakhir dalam ${daysUntilExpiry} hari. Perpanjang sekarang!`,
            type: 'warning',
            link: '/dashboard?tab=subscription'
          }]);
        }
      }
    };

    checkExpiringSubscription();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (profile) setUserProfile(profile);

      const { data: history } = await supabase
        .from('exam_results')
        .select('*, tryout_packages(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (history) {
        const mappedHistory = history.map((item: any) => {
          const twk = item.skor_twk ?? item.score_twk ?? 0;
          const tiu = item.skor_tiu ?? item.score_tiu ?? 0;
          const tkp = item.skor_tkp ?? item.score_tkp ?? 0;
          const total = item.skor_total ?? item.total_score ?? (twk + tiu + tkp);
          return { ...item, skor_twk: twk, skor_tiu: tiu, skor_tkp: tkp, skor_total: total };
        });
        setExamHistory(mappedHistory);
      }

      const { data: bannerData } = await supabase
        .from('promotional_banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(4);
      if (bannerData) setBanners(bannerData);

      const { data: updatesData } = await supabase
        .from('latest_updates')
        .select('*')
        .order('published_date', { ascending: false })
        .limit(3);
      if (updatesData) setUpdates(updatesData);

      const { data: packagesData } = await supabase
        .from('subscription_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (packagesData) setPackages(packagesData);

      setIsLoading(false);
    };

    fetchData();
  }, [router]);

  const hasSubscription = Boolean(userProfile?.subscription_valid_until);
  const isExpired = hasSubscription 
    ? new Date(userProfile.subscription_valid_until) < new Date() 
    : true;

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    if (!price) return 'Gratis';
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const formatDuration = (months: number) => {
    if (!months) return '';
    if (months === 999) return 'Selamanya';
    if (months === 1) return '1 Bulan';
    return `${months} Bulan`;
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-6 md:p-6">
        
        {/* MOBILE HEADER - Welcome Section */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-4 pt-8 pb-16 md:rounded-2xl md:mx-6 md:mt-6 md:p-8 md:mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Selamat Datang!</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {userProfile?.full_name?.split(' ')[0] || 'Member'} 👋
              </h1>
            </div>
            <div className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-full">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {isExpired ? (hasSubscription ? 'EXPIRED' : 'BELUM AKTIF') : 'AKTIF'}
              </span>
            </div>
          </div>
          
          {/* Progress Card */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/90 text-sm">Progress Belajar</span>
              <span className="text-white font-bold">
                {examHistory.length} Ujian Selesai
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${Math.min(examHistory.length * 20, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* MOBILE NAVIGATION - Tab Menu */}
        <div className="flex gap-2 px-4 -mt-10 mb-6 md:mx-6 md:mt-0">
          <button
            onClick={() => {
              setActiveTab('overview');
              router.replace('/dashboard');
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm shadow-lg transition-all ${
              activeTab === 'overview' 
                ? 'bg-white text-blue-600' 
                : 'bg-white/80 text-slate-600'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => {
              setActiveTab('subscription');
              router.replace('/dashboard?tab=subscription');
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm shadow-lg transition-all ${
              activeTab === 'subscription' 
                ? 'bg-white text-blue-600' 
                : 'bg-white/80 text-slate-600'
            }`}
          >
            💎 Paket
          </button>
          <button
            onClick={() => {
              setActiveTab('notifications');
              router.replace('/dashboard?tab=notifications');
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm shadow-lg transition-all ${
              activeTab === 'notifications' 
                ? 'bg-white text-blue-600' 
                : 'bg-white/80 text-slate-600'
            }`}
          >
            🔔 Notif
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="px-4 md:px-6">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Quick Actions - Horizontal Scroll */}
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-3">Aksi Cepat</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                  <Link href="/tryout-list" className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg w-32 hover:opacity-90 transition-opacity">
                    <div className="text-2xl mb-2">📝</div>
                    <div className="text-sm font-bold">Try Out</div>
                  </Link>
                  <Link href="/dashboard/challenge" className="flex-shrink-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-lg w-32 hover:opacity-90 transition-opacity">
                    <div className="text-2xl mb-2">🔥</div>
                    <div className="text-sm font-bold">Challenge</div>
                  </Link>
                  <Link href="/dashboard/materi" className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg w-32 hover:opacity-90 transition-opacity">
                    <div className="text-2xl mb-2">📚</div>
                    <div className="text-sm font-bold">Materi</div>
                  </Link>
                  <Link href="/dashboard/redeem" className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg w-32 hover:opacity-90 transition-opacity">
                    <div className="text-2xl mb-2">🎁</div>
                    <div className="text-sm font-bold">Voucher</div>
                  </Link>
                </div>
              </div>

              {/* Banners - Horizontal Scroll */}
              {banners.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-3">Promosi</h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2">
                    {banners.map(banner => (
                      <Link 
                        key={banner.id} 
                        href={banner.link_url || '#'} 
                        className="flex-shrink-0 w-64 md:w-full overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow"
                      >
                        <img 
                          src={banner.image_url} 
                          alt={banner.title} 
                          className="w-full h-32 md:h-48 object-cover"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Latest Updates - Card List */}
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-3">Info Terbaru</h2>
                {updates.length === 0 ? (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
                    Belum ada pengumuman terbaru.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {updates.map(update => (
                      <div 
                        key={update.id} 
                        className={`p-4 rounded-xl border ${
                          update.is_important 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            update.category === 'CPNS' ? 'bg-blue-100 text-blue-700' : 
                            update.category === 'P3K' ? 'bg-green-100 text-green-700' : 
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {update.category || 'INFO'}
                          </span>
                          {update.is_important && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                              PENTING
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">{update.title}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2">{update.content}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(update.published_date).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Exam History */}
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-3">Riwayat Ujian</h2>
                {examHistory.length === 0 ? (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-slate-500 text-sm">Belum ada riwayat ujian</p>
                    <Link 
                      href="/tryout-list" 
                      className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Mulai Try Out
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {examHistory.slice(0, 3).map(result => (
                      <div key={result.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-slate-800 text-sm">{result.tryout_packages?.name || 'Try Out'}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            result.is_passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {result.is_passed ? 'LULUS' : 'BELUM LULUS'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-blue-50 rounded-lg p-2">
                            <div className="text-xs text-slate-500">TWK</div>
                            <div className="font-bold text-blue-600">{result.skor_twk}</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2">
                            <div className="text-xs text-slate-500">TIU</div>
                            <div className="font-bold text-green-600">{result.skor_tiu}</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-2">
                            <div className="text-xs text-slate-500">TKP</div>
                            <div className="font-bold text-orange-600">{result.skor_tkp}</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-slate-500">Total: </span>
                            <span className="font-bold text-blue-600">{result.skor_total}</span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(result.created_at).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SUBSCRIPTION */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              {/* Status Card */}
              <div className={`p-4 rounded-xl border ${
                isExpired ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Status Langganan</h3>
                    <p className="text-sm text-slate-600">
                      {isExpired 
                        ? (hasSubscription ? 'Langganan Anda telah berakhir' : 'Anda belum berlangganan paket premium')
                        : `Aktif hingga ${new Date(userProfile.subscription_valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                      }
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {isExpired ? (hasSubscription ? 'EXPIRED' : 'BELUM AKTIF') : 'AKTIF'}
                  </div>
                </div>
              </div>

              {/* Package Cards */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800">Pilih Paket Langganan</h2>
                {packages.length === 0 ? (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
                    Belum ada paket langganan yang tersedia.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packages.map(pkg => (
                      <div key={pkg.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 text-white flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-lg">{pkg.name}</h3>
                              {pkg.duration_months && (
                                <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                                  {formatDuration(pkg.duration_months)}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-extrabold">{formatPrice(pkg.price)}</div>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="text-slate-600 text-sm mb-3">{pkg.description || 'Akses penuh ke materi & tryout premium.'}</p>
                          </div>
                        </div>
                        <div className="p-4 pt-0">
                          <Link
                            href={`/checkout/${pkg.id}`}
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-lg font-medium transition-colors text-sm"
                          >
                            Pilih Paket
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <NotificationCenter />
          )}
        </div>
      </div>
    </MemberLayout>
  );
}

export default function DashboardMember() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
