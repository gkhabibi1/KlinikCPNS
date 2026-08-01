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
  
  // Baca parameter 'tab' dari URL
  const tabFromUrl = searchParams ? searchParams.get('tab') : null;
  const initialTab = (tabFromUrl === 'subscription' || tabFromUrl === 'notifications') ? tabFromUrl : 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'subscription' | 'notifications'>(initialTab);
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [pkg, setPkg] = useState<any>({ id: 'a00b4411-0f33-4492-a7b2-b4fb8c09906a' });

  // Sinkronisasi activeTab dengan URL parameter
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

      // REFRESH data profil terbaru
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_valid_until, subscription_package_id, full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (!profile?.subscription_valid_until) return;

      const expiryDate = new Date(profile.subscription_valid_until);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Jika 7 hari atau kurang sebelum expired
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        // Cek apakah sudah ada notifikasi untuk ini dalam 24 jam terakhir
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('title', '⏰ Langganan Segera Berakhir')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1);

        // Buat notifikasi hanya jika belum ada dalam 24 jam terakhir
        if (!existingNotif || existingNotif.length === 0) {
          await supabase.from('notifications').insert([{
            user_id: user.id,
            title: '⏰ Langganan Segera Berakhir',
            message: `Halo ${profile.full_name || 'Member'}, langganan Anda akan berakhir dalam ${daysUntilExpiry} hari (${expiryDate.toLocaleDateString('id-ID')}). Perpanjang sekarang untuk tetap menikmati semua fitur!`,
            type: 'warning',
            link: '/dashboard?tab=subscription'
          }]);
        }
      }

      // Jika sudah expired
      if (daysUntilExpiry <= 0) {
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('title', '🔒 Langganan Telah Berakhir')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (!existingNotif || existingNotif.length === 0) {
          await supabase.from('notifications').insert([{
            user_id: user.id,
            title: '🔒 Langganan Telah Berakhir',
            message: 'Langganan Anda telah berakhir. Perpanjang sekarang untuk tetap bisa mengakses semua fitur premium.',
            type: 'error',
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

      // Ambil profil user
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) setUserProfile(profile);

      // Ambil histori ujian
      const { data: history } = await supabase
        .from('exam_results')
        .select('*, tryout_packages(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (history) {
        // Map database columns to local state names
        const mappedHistory = history.map((item: any) => {
          const twk = item.skor_twk ?? item.score_twk ?? 0;
          const tiu = item.skor_tiu ?? item.score_tiu ?? 0;
          const tkp = item.skor_tkp ?? item.score_tkp ?? 0;
          const total = item.skor_total ?? item.total_score ?? (twk + tiu + tkp);
          return {
            ...item,
            skor_twk: twk,
            skor_tiu: tiu,
            skor_tkp: tkp,
            skor_total: total,
          };
        });
        setExamHistory(mappedHistory);
      }

      // Ambil banner aktif
      const { data: bannerData } = await supabase
        .from('promotional_banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (bannerData) setBanners(bannerData);

      // Ambil info terbaru
      const { data: updatesData } = await supabase
        .from('latest_updates')
        .select('*')
        .order('published_date', { ascending: false })
        .limit(5);
      if (updatesData) setUpdates(updatesData);

      // Ambil paket langganan
      const { data: packagesData } = await supabase
        .from('subscription_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (packagesData) setPackages(packagesData);

      // Ambil first premium package (paket yang paling awal dibuat)
      const { data: premiumPkgs } = await supabase
        .from('tryout_packages')
        .select('id')
        .eq('is_premium', true)
        .order('created_at', { ascending: true })
        .limit(1);
      if (premiumPkgs && premiumPkgs.length > 0) {
        setPkg(premiumPkgs[0]);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [router]);

  const handleSubscribe = async (plan: any) => {
    setIsProcessing(plan.id);
    
    try {
      const orderId = `TRX-${Date.now()}`;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('transactions').insert([{
        order_id: orderId,
        user_id: user.id,
        plan_id: plan.id,
        gross_amount: plan.price,
        status: 'pending'
      }]);

      alert(`✅ Anda memilih ${plan.name}\nHarga: Rp ${Number(plan.price).toLocaleString('id-ID')}\n\nPop-up pembayaran akan muncul (integrasi Midtrans nanti).`);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsProcessing(null);
    }
  };

  const isExpired = userProfile ? new Date(userProfile.subscription_valid_until) < new Date() : true;

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-slate-500 font-medium">Memuat data dashboard...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6 p-6 md:p-8 max-w-6xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-slate-200">
          <button
            onClick={() => {
              setActiveTab('overview');
              router.replace('/dashboard');
            }}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'overview' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => {
              setActiveTab('subscription');
              router.replace('/dashboard?tab=subscription');
            }}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'subscription' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            💎 Paket Langganan
          </button>
          <button
            onClick={() => {
              setActiveTab('notifications');
              router.replace('/dashboard?tab=notifications');
            }}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'notifications' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            🔔 Notifikasi
          </button>
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Banner Carousel */}
            {banners.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map(banner => (
                  <Link key={banner.id} href={banner.link_url || '#'} className="block overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                    <img src={banner.image_url} alt={banner.title} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" />
                  </Link>
                ))}
              </div>
            )}

            {/* Info Terbaru */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">📢 Info Terbaru CPNS & P3K 2026</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {updates.map(update => (
                  <div key={update.id} className={`p-4 rounded-xl border transition-all duration-300 ${update.is_important ? 'bg-red-50/50 border-red-200 shadow-sm' : 'bg-white border-slate-200 hover:shadow-sm'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        update.category === 'CPNS' ? 'bg-blue-100 text-blue-700' : 
                        update.category === 'P3K' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {update.category}
                      </span>
                      {update.is_important && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          PENTING
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold mt-2 text-slate-800">{update.title}</h3>
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{update.content}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      📅 {new Date(update.published_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Histori Ujian */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">📊 Riwayat Pengerjaan Ujian</h2>
              {examHistory.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 shadow-sm">
                  Anda belum pernah mengerjakan try out. Yuk mulai sekarang!
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-4 text-left text-sm font-semibold text-slate-600">Paket</th>
                          <th className="p-4 text-left text-sm font-semibold text-slate-600">TWK</th>
                          <th className="p-4 text-left text-sm font-semibold text-slate-600">TIU</th>
                          <th className="p-4 text-left text-sm font-semibold text-slate-600">TKP</th>
                          <th className="p-4 text-left text-sm font-semibold text-slate-600">Total</th>
                          <th className="p-4 text-left text-sm font-semibold text-slate-600">Status</th>
                          <th className="p-4 text-left text-sm font-semibold text-slate-600">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examHistory.map(result => (
                          <tr key={result.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-semibold text-slate-800">{result.tryout_packages?.name}</td>
                            <td className="p-4 text-slate-600">{result.skor_twk}</td>
                            <td className="p-4 text-slate-600">{result.skor_tiu}</td>
                            <td className="p-4 text-slate-600">{result.skor_tkp}</td>
                            <td className="p-4 font-bold text-blue-600">{result.skor_total}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${result.is_passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {result.is_passed ? 'LULUS' : 'BELUM LULUS'}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-slate-500 font-medium">
                              {new Date(result.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: SUBSCRIPTION */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {/* Status Langganan */}
            <div className={`p-6 rounded-xl border ${
              isExpired 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">Status Langganan</h3>
                  <p className="text-sm text-slate-600">
                    {isExpired 
                      ? 'Langganan Anda telah berakhir. Silakan perpanjang untuk melanjutkan akses.' 
                      : `Berlangganan aktif hingga ${new Date(userProfile.subscription_valid_until).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}`
                    }
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  isExpired 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {isExpired ? 'EXPIRED' : 'AKTIF'}
                </div>
              </div>
            </div>

            {/* Paket Langganan */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Paket Langganan</h2>
              <p className="text-slate-600 mb-6">Pilih paket yang sesuai dengan kebutuhan persiapan CPNS Anda</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map(pkg => (
                  <div key={pkg.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
                      <h3 className="font-bold text-xl">{pkg.name}</h3>
                      <p className="text-blue-100 text-sm mt-1">{pkg.description}</p>
                    </div>
                    
                    <div className="p-6">
                      <Link
                        href={`/checkout/${pkg.id}`}
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
                      >
                        Pilih Paket
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Garansi */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-100 pt-8">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🔒</div>
                <h4 className="font-bold text-slate-800 mb-1">Pembayaran Aman</h4>
                <p className="text-sm text-slate-500">Transaksi diproses melalui Midtrans yang terenkripsi</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-bold text-slate-800 mb-1">Akses Instant</h4>
                <p className="text-sm text-slate-500">Langsung aktif setelah pembayaran berhasil</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">💬</div>
                <h4 className="font-bold text-slate-800 mb-1">Support 24/7</h4>
                <p className="text-sm text-slate-500">Tim kami siap membantu Anda kapan saja</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <NotificationCenter />
        )}
      </div>
    </MemberLayout>
  );
}

export default function DashboardMember() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">Memuat data dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
