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
  const [benefits, setBenefits] = useState<{ [packageId: string]: any[] }>({});
  const [isLoading, setIsLoading] = useState(true);

  const [activationVoucherCode, setActivationVoucherCode] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [activationVoucherResult, setActivationVoucherResult] = useState<any>(null);

  const handleClaimActivationVoucher = async () => {
    if (!activationVoucherCode.trim()) return;
    
    setIsClaiming(true);
    setActivationVoucherResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Cari voucher
      const { data: voucher, error } = await supabase
        .from('voucher_codes')
        .select(`
          *,
          subscription_packages (duration_months)
        `)
        .eq('code', activationVoucherCode.toUpperCase().trim())
        .eq('voucher_category', 'activation')
        .single();

      if (error || !voucher) {
        setActivationVoucherResult({ success: false, message: 'Kode voucher tidak ditemukan atau bukan voucher masa aktif.' });
        return;
      }

      if (!voucher.is_active) {
        setActivationVoucherResult({ success: false, message: 'Voucher sudah tidak aktif.' });
        return;
      }

      if (voucher.current_uses >= voucher.max_uses) {
        setActivationVoucherResult({ success: false, message: 'Kuota voucher sudah habis.' });
        return;
      }

      // Ambil info durasi paket dari voucher_codes -> subscription_packages
      const durationMonths = voucher.subscription_packages?.duration_months || 6;
      
      // Base date: jika user masih punya masa aktif, perpanjang dari tanggal tersebut
      const currentExpiry = userProfile?.subscription_valid_until ? new Date(userProfile.subscription_valid_until) : null;
      const baseDate = (currentExpiry && currentExpiry > new Date()) ? currentExpiry : new Date();
      const newExpiry = new Date(baseDate);
      
      if (durationMonths === 999) {
        newExpiry.setFullYear(2099);
      } else {
        newExpiry.setMonth(newExpiry.getMonth() + durationMonths);
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ subscription_valid_until: newExpiry.toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update voucher usage
      await supabase
        .from('voucher_codes')
        .update({ current_uses: voucher.current_uses + 1 })
        .eq('id', voucher.id);

      // Simpan riwayat
      await supabase
        .from('user_activated_vouchers')
        .insert([{
          user_id: user.id,
          voucher_code_id: voucher.id,
          reseller_id: voucher.reseller_id,
          duration_months: durationMonths,
          activated_at: new Date().toISOString()
        }]);

      setActivationVoucherResult({ 
        success: true, 
        message: `✅ Voucher berhasil diklaim! Langganan Anda aktif hingga ${newExpiry.toLocaleDateString('id-ID')}` 
      });
      setActivationVoucherCode('');
      setUserProfile({...userProfile, subscription_valid_until: newExpiry.toISOString()});

    } catch (err: any) {
      setActivationVoucherResult({ success: false, message: 'Error: ' + err.message });
    } finally {
      setIsClaiming(false);
    }
  };

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

      const { data: benefitsData } = await supabase
        .from('subscription_benefits')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (benefitsData) {
        const benefitsMap: { [key: string]: any[] } = {};
        benefitsData.forEach((b: any) => {
          if (!benefitsMap[b.package_id]) benefitsMap[b.package_id] = [];
          benefitsMap[b.package_id].push(b);
        });
        setBenefits(benefitsMap);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [router]);

  const hasSubscription = Boolean(userProfile?.subscription_valid_until);
  const isExpired = hasSubscription 
    ? new Date(userProfile.subscription_valid_until) < new Date() 
    : true;

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
      <div className="min-h-screen bg-white pb-20 md:pb-8 p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        
        {/* HEADER - Welcome Section (Minimalist White & Brand Blue) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
                Selamat Datang di Klinik CPNS
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                {userProfile?.full_name?.split(' ')[0] || 'Member'} 👋
              </h1>
            </div>
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                isExpired 
                  ? 'bg-slate-100 text-slate-700 border-slate-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {isExpired ? (hasSubscription ? '• Paket Kedaluwarsa' : '• Belum Berlangganan') : '✓ Paket Aktif'}
              </span>
            </div>
          </div>
          
          {/* Progress Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm font-medium">Progress Simulasi Belajar</span>
              <span className="text-blue-600 font-bold text-sm">
                {examHistory.length} Ujian Selesai
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 rounded-full h-2 transition-all"
                style={{ width: `${Math.min(examHistory.length * 10, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* NAVIGATION - Tab Menu */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              setActiveTab('overview');
              router.replace('/dashboard');
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'overview' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => {
              setActiveTab('subscription');
              router.replace('/dashboard?tab=subscription');
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'subscription' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💎 Paket
          </button>
          <button
            onClick={() => {
              setActiveTab('notifications');
              router.replace('/dashboard?tab=notifications');
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'notifications' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔔 Notif
          </button>
        </div>

        {/* CONTENT AREA */}
        <div>
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* KLAIM VOUCHER MASA AKTIF */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span>🎟️</span> Klaim Voucher Masa Aktif
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  Punya kode voucher masa aktif dari reseller atau promo? Masukkan di sini untuk mengaktifkan langganan Anda.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={activationVoucherCode}
                    onChange={(e) => setActivationVoucherCode(e.target.value)}
                    placeholder="Contoh: ABC12-XYZ78"
                    className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm uppercase focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    onClick={handleClaimActivationVoucher}
                    disabled={isClaiming}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shadow-blue-600/10"
                  >
                    {isClaiming ? 'Memproses...' : 'Klaim Voucher'}
                  </button>
                </div>

                {activationVoucherResult && (
                  <div className={`mt-3.5 p-3 rounded-xl border text-sm font-medium ${
                    activationVoucherResult.success 
                      ? 'bg-blue-50 border-blue-200 text-blue-800' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    {activationVoucherResult.message}
                  </div>
                )}
              </div>
              
              {/* Quick Actions - Minimalist Cards */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">Aksi Cepat</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4">
                  <Link href="/tryout-list" className="flex-shrink-0 w-32 md:w-auto bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 text-slate-900 p-4 rounded-2xl shadow-sm transition-all text-center group">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📝</div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Try Out</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Simulasi CAT</div>
                  </Link>
                  <Link href="/dashboard/challenge" className="flex-shrink-0 w-32 md:w-auto bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 text-slate-900 p-4 rounded-2xl shadow-sm transition-all text-center group">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔥</div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Challenge</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">30 Hari Rutin</div>
                  </Link>
                  <Link href="/dashboard/materi" className="flex-shrink-0 w-32 md:w-auto bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 text-slate-900 p-4 rounded-2xl shadow-sm transition-all text-center group">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📚</div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Materi</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Modul & Tips</div>
                  </Link>
                  <Link href="/dashboard/orders" className="flex-shrink-0 w-32 md:w-auto bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 text-slate-900 p-4 rounded-2xl shadow-sm transition-all text-center group">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧾</div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Riwayat</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Cek Pembelian</div>
                  </Link>
                </div>
              </div>

              {/* Banners - Horizontal Scroll */}
              {banners.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-3">Promosi</h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2">
                    {banners.map(banner => (
                      <Link 
                        key={banner.id} 
                        href={banner.link_url || '#'} 
                        className="flex-shrink-0 w-64 md:w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
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
                <h2 className="text-lg font-bold text-slate-900 mb-3">Info Terbaru</h2>
                <div className="space-y-3">
                  {updates.map(update => (
                    <div 
                      key={update.id} 
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          update.category === 'CPNS' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          update.category === 'P3K' ? 'bg-slate-100 text-slate-700 border-slate-200' : 
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {update.category}
                        </span>
                        {update.is_important && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                            PENTING
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1 text-base">{update.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{update.content}</p>
                      <p className="text-xs text-slate-400 mt-2 font-medium">
                        {new Date(update.published_date).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Exam History */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">Riwayat Ujian</h2>
                {examHistory.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-slate-600 text-sm font-medium">Belum ada riwayat ujian</p>
                    <Link 
                      href="/tryout-list" 
                      className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                      Mulai Try Out Sekarang
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {examHistory.slice(0, 3).map(result => (
                      <div key={result.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-slate-900 text-sm">{result.tryout_packages?.name}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            result.is_passed 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {result.is_passed ? 'LULUS' : 'BELUM LULUS'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5 text-center">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <div className="text-xs text-slate-500 font-medium">TWK</div>
                            <div className="font-extrabold text-slate-900 text-base">{result.skor_twk}</div>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <div className="text-xs text-slate-500 font-medium">TIU</div>
                            <div className="font-extrabold text-slate-900 text-base">{result.skor_tiu}</div>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <div className="text-xs text-slate-500 font-medium">TKP</div>
                            <div className="font-extrabold text-slate-900 text-base">{result.skor_tkp}</div>
                          </div>
                        </div>
                        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-slate-500 font-medium">Total Skor: </span>
                            <span className="font-bold text-blue-600">{result.skor_total}</span>
                          </div>
                          <div className="text-xs text-slate-400 font-medium">
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
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 text-base">Status Langganan Anda</h3>
                    <p className="text-sm text-slate-600">
                      {isExpired 
                        ? (hasSubscription ? 'Masa aktif langganan telah berakhir' : 'Anda belum memiliki paket langganan aktif')
                        : `Aktif hingga ${new Date(userProfile?.subscription_valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                      }
                    </p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                      isExpired 
                        ? 'bg-slate-100 text-slate-600 border-slate-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {isExpired ? (hasSubscription ? 'Kedaluwarsa' : 'Belum Aktif') : '✓ Langganan Aktif'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Package Cards */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Pilihan Paket Langganan</h2>
                {packages.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                    Belum ada paket langganan yang tersedia.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {packages.map(pkg => {
                      const packageBenefits = benefits[pkg.id] || [];
                      const isLifetime = pkg.duration_months === 999;
                      
                      return (
                        <div key={pkg.id} className="bg-white rounded-2xl border border-slate-200 hover:border-blue-600 overflow-hidden shadow-sm flex flex-col justify-between transition-all">
                          <div>
                            {/* Header Card */}
                            <div className="p-6 border-b border-slate-100">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-extrabold text-slate-900 text-xl">{pkg.name}</h3>
                                  <p className="text-slate-500 text-xs mt-1">{pkg.description}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="font-extrabold text-2xl text-blue-600">
                                    Rp {(pkg.price || 0).toLocaleString('id-ID')}
                                  </div>
                                  <div className="text-xs font-medium text-slate-400 mt-0.5">
                                    {isLifetime ? 'Akses Lifetime' : `Durasi ${pkg.duration_months || 1} Bulan`}
                                  </div>
                                </div>
                              </div>
                              {pkg.discount_label && (
                                <span className="inline-block mt-3 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                  {pkg.discount_label}
                                </span>
                              )}
                            </div>

                            {/* List Benefit Dari Panel Admin */}
                            <div className="p-6">
                              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Benefit Unggulan:
                              </div>
                              <ul className="space-y-2.5">
                                {packageBenefits.length > 0 ? (
                                  packageBenefits.map((benefit: any) => (
                                    <li key={benefit.id} className="flex items-start gap-2.5 text-xs text-slate-700">
                                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                      </svg>
                                      <span className="leading-relaxed">{benefit.benefit_text}</span>
                                    </li>
                                  ))
                                ) : (
                                  <li className="flex items-start gap-2.5 text-xs text-slate-700">
                                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="leading-relaxed">Akses penuh ke semua try out & materi CPNS</span>
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>

                          {/* Tombol Akses / Checkout */}
                          <div className="p-6 pt-0">
                            <Link
                              href={`/checkout/${pkg.id}`}
                              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-xl font-bold text-sm transition-all shadow-sm"
                            >
                              Pilih Paket Ini →
                            </Link>
                          </div>
                        </div>
                      );
                    })}
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
