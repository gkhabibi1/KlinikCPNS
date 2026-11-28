'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import MemberLayout from '../../components/MemberLayout';
import NotificationCenter from '../../components/NotificationCenter';
import InstallAppCard from '../../components/InstallAppCard';
import {
  Trophy,
  Award,
  Target,
  Zap,
  Lock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  LayoutGrid,
  Gem,
  Bell,
  Ticket,
  ClipboardCheck,
  Layers,
  Flame,
  BookOpen,
  FileText,
  Crown,
  Check,
  ClipboardList,
  ArrowRight
} from 'lucide-react';

const DEFAULT_PROMO_BANNERS = [
  {
    id: 'default-promo-1',
    title: 'Siap Lolos SKD CPNS 2026',
    image_url: '/banners/promo-cpns-2026.jpg',
    link_url: '/tryout-list',
  },
  {
    id: 'default-promo-2',
    title: 'Upgrade Paket Belajar Pro',
    image_url: '/banners/promo-upgrade-premium.jpg',
    link_url: '/dashboard/subscription',
  },
  {
    id: 'default-promo-3',
    title: '30 Days SKD Challenge',
    image_url: '/banners/promo-30-days-challenge.jpg',
    link_url: '/dashboard/challenge',
  },
];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bannerScrollRef = useRef<HTMLDivElement>(null);
  const [failedBannerIds, setFailedBannerIds] = useState<Record<string, boolean>>({});
  
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
        .limit(10);
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

  const hasPassedPG = examHistory.some(h => (h.is_passed || (h.skor_twk >= 65 && h.skor_tiu >= 80 && h.skor_tkp >= 166)));
  const isMasterTIU = examHistory.some(h => h.skor_tiu >= 120);
  const isElite400 = examHistory.some(h => h.skor_total >= 400);
  const isConsistent = examHistory.length >= 3;

  const badges = [
    {
      id: 'pg_hunter',
      title: 'Passing Grade Hunter',
      desc: 'Lulus threshold PG di salah satu tryout',
      Icon: Target,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      unlocked: hasPassedPG,
    },
    {
      id: 'tiu_master',
      title: 'Master TIU',
      desc: 'Skor TIU mencapai >= 120 poin',
      Icon: Zap,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      unlocked: isMasterTIU,
    },
    {
      id: 'elite_400',
      title: 'Elite 400+ Club',
      desc: 'Skor total simulasi tembus >= 400',
      Icon: Crown,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/15 border-purple-500/30',
      unlocked: isElite400,
    },
    {
      id: 'pejuang_rutin',
      title: 'Pejuang Tangguh',
      desc: 'Telah menuntaskan minimal 3 tryout',
      Icon: Flame,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15 border-blue-500/30',
      unlocked: isConsistent,
    },
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  // Target SKD CPNS 2026 Countdown (Estimasi SKD mulai Januari 2027)
  const targetSKD = new Date('2027-01-15T08:00:00');
  const now = new Date();
  const diffTime = Math.max(0, targetSKD.getTime() - now.getTime());
  const daysLeftToSKD = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Daily Quests State
  const [dailyQuests, setDailyQuests] = useState<{ [id: string]: boolean }>({
    evaluasi: false,
    speedDrill: false,
    flashcards: false,
  });

  useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`cpns_daily_quests_${today}`);
      if (saved) {
        setDailyQuests(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleQuest = (id: string) => {
    const updated = { ...dailyQuests, [id]: !dailyQuests[id] };
    setDailyQuests(updated);
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`cpns_daily_quests_${today}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const quests = [
    {
      id: 'speedDrill',
      title: 'Latihan Speed Drill 50 Detik',
      subtext: 'Latih reflek di bawah 50 detik/soal',
      link: '/dashboard/speed-drill',
      isCompleted: Boolean(dailyQuests.speedDrill),
    },
    {
      id: 'evaluasi',
      title: 'Ulas Soal di Buku Evaluasi',
      subtext: 'Kuasai kembali soal yang pernah salah',
      link: '/dashboard/evaluasi',
      isCompleted: Boolean(dailyQuests.evaluasi),
    },
    {
      id: 'flashcards',
      title: 'Hafalan Flashcard TWK',
      subtext: 'Hafal pasal atau sejarah kemerdekaan',
      link: '/dashboard/flashcards',
      isCompleted: Boolean(dailyQuests.flashcards),
    },
  ];

  const completedQuestsCount = quests.filter(q => q.isCompleted).length;

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
      <div className="min-h-screen bg-[#f8fafc] pb-20 md:pb-10 p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        
        {/* HEADER - Welcome Section */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">
                Selamat Datang Kembali
              </p>
              <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Halo, {userProfile?.full_name?.split(' ')[0] || 'Pejuang ASN'}
              </h1>
            </div>
            <div>
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                isExpired 
                  ? 'bg-slate-50 text-slate-600 border-slate-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
                {isExpired ? (hasSubscription ? 'Paket Kedaluwarsa' : 'Akun Free') : 'Paket Aktif'}
              </span>
            </div>
          </div>
          
          {/* Progress Card */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-xs sm:text-sm font-medium">Progress Simulasi Belajar</span>
              <span className="text-blue-600 font-bold text-xs sm:text-sm font-mono">
                {examHistory.length} Ujian Selesai
              </span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full h-2 transition-all duration-500"
                style={{ width: `${Math.min(examHistory.length * 10, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* NAVIGATION - Segmented Tab Menu */}
        <div className="flex gap-1.5 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200/70">
          <button
            onClick={() => {
              setActiveTab('overview');
              router.replace('/dashboard');
            }}
            className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" strokeWidth={1.8} />
            <span>Overview</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('subscription');
              router.replace('/dashboard?tab=subscription');
            }}
            className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'subscription' 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gem className="w-4 h-4" strokeWidth={1.8} />
            <span>Paket</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('notifications');
              router.replace('/dashboard?tab=notifications');
            }}
            className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'notifications' 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" strokeWidth={1.8} />
            <span>Notifikasi</span>
          </button>
        </div>

        {/* CONTENT AREA */}
        <div>
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* KLAIM VOUCHER MASA AKTIF */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Ticket className="w-4.5 h-4.5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                      Klaim Voucher Masa Aktif
                    </h2>
                    <p className="text-xs text-slate-500">
                      Masukkan kode voucher dari reseller atau promo untuk mengaktifkan langganan.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2.5 mt-4">
                  <input
                    type="text"
                    value={activationVoucherCode}
                    onChange={(e) => setActivationVoucherCode(e.target.value)}
                    placeholder="Contoh: ABC12-XYZ78"
                    className="flex-1 border border-slate-200 bg-slate-50/70 focus:bg-white rounded-xl px-4 py-2.5 text-sm uppercase focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition"
                  />
                  <button
                    onClick={handleClaimActivationVoucher}
                    disabled={isClaiming}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer"
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
              
              {/* TARGET BELAJAR HARIAN & COUNTDOWN SKD */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Countdown SKD CPNS Banner */}
                <div className="md:col-span-1 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-blue-100 text-[11px] font-bold mb-2">
                      <Clock className="w-3 h-3 text-amber-300" /> Target Ujian SKD
                    </div>
                    <h3 className="text-lg font-black text-white leading-tight">Hitung Mundur SKD CPNS 2026</h3>
                    <p className="text-[11px] text-blue-100 mt-1">Maksimalkan sisa hari persiapan untuk mengunci NIP impian!</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-black font-mono text-amber-300">{daysLeftToSKD}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Hari Tersisa</div>
                    </div>
                    <Link 
                      href="/tryout-list"
                      className="px-3 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-xs transition"
                    >
                      Mulai Simulasi →
                    </Link>
                  </div>
                </div>

                {/* 2. Misi Harian ("Daily Quests") */}
                <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Target className="w-4.5 h-4.5" strokeWidth={1.8} />
                        </div>
                        <div>
                          <h3 className="font-heading text-sm md:text-base font-bold text-slate-900">Misi Belajar Hari Ini</h3>
                          <p className="text-[11px] text-slate-500">Tuntaskan 3 misi harian untuk membangun konsistensi CAT</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-blue-600">{completedQuestsCount} / 3 Misi</span>
                        <span className="text-[10px] text-slate-400 block font-mono">+{completedQuestsCount * 50} XP</span>
                      </div>
                    </div>

                    {/* Quest Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1 mb-3">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(completedQuestsCount / 3) * 100}%` }}
                      />
                    </div>

                    {/* Quest Items */}
                    <div className="space-y-2">
                      {quests.map((q) => (
                        <div 
                          key={q.id}
                          className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                            q.isCompleted ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950' : 'bg-slate-50/80 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => toggleQuest(q.id)}
                              className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                q.isCompleted ? 'bg-emerald-500 text-white' : 'border border-slate-300 hover:border-slate-400 bg-white'
                              }`}
                            >
                              {q.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                            <div className="truncate">
                              <span className={`text-xs font-bold ${q.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {q.title}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">{q.subtext}</span>
                            </div>
                          </div>
                          <Link
                            href={q.link}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition ${
                              q.isCompleted 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                            }`}
                          >
                            {q.isCompleted ? '✓ Selesai' : 'Mulai →'}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* INFO RESMI CPNS 2026 BANNER */}
              <Link
                href="/dashboard/panduan-cpns-2026"
                className="block bg-white border border-blue-200/80 hover:border-blue-400 rounded-2xl p-4 sm:p-5 shadow-xs transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">
                          Info Resmi CASN
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          Pembukaan SSCASN: 27 Nov 2026 · 154.052 Formasi
                        </span>
                      </div>
                      <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
                        Panduan Lengkap Seleksi CPNS 2026: Jadwal, Syarat, Kebijakan Baru &amp; Kisi-Kisi SKD–SKB
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-3.5 py-2 rounded-xl transition-colors shrink-0 self-start sm:self-center">
                    <span>Buka Panduan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>

              {/* Banners - Horizontal Slide (Promosi) */}
              {(() => {
                const validDbBanners = banners.filter(
                  (b) => b?.image_url && !failedBannerIds[b.id]
                );
                const mergedBanners =
                  validDbBanners.length >= 3
                    ? validDbBanners
                    : [
                        ...validDbBanners,
                        ...DEFAULT_PROMO_BANNERS.filter(
                          (def) =>
                            !validDbBanners.some(
                              (dbB) => dbB.image_url === def.image_url
                            )
                        ),
                      ];

                const scrollBanners = (direction: 'prev' | 'next') => {
                  const el = bannerScrollRef.current;
                  if (!el) return;
                  const amount = Math.max(280, Math.round(el.clientWidth * 0.75));
                  el.scrollBy({
                    left: direction === 'next' ? amount : -amount,
                    behavior: 'smooth',
                  });
                };

                return (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">Promosi</h2>
                      {mergedBanners.length > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => scrollBanners('prev')}
                            aria-label="Banner sebelumnya"
                            className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollBanners('next')}
                            aria-label="Banner berikutnya"
                            className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div
                      ref={bannerScrollRef}
                      className="flex gap-3.5 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
                    >
                      {mergedBanners.map((banner) => (
                        <Link
                          key={banner.id}
                          href={banner.link_url || '#'}
                          className="flex-shrink-0 w-[86%] sm:w-[62%] md:w-[calc(50%-8px)] snap-start overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-900 shadow-xs hover:shadow-md transition-all group"
                        >
                          <img
                            src={banner.image_url}
                            alt={banner.title}
                            onError={() =>
                              setFailedBannerIds((prev) => ({
                                ...prev,
                                [banner.id]: true,
                              }))
                            }
                            className="w-full aspect-video object-cover group-hover:scale-[1.015] transition-transform duration-300"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Quick Actions - Minimalist Modern Cards */}
              <div>
                <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900 mb-3">Aksi Cepat</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <Link href="/tryout-list" className="bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 text-slate-900 p-4 rounded-2xl shadow-xs transition-all flex flex-col items-center text-center group">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <ClipboardCheck className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Try Out</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Simulasi CAT</div>
                  </Link>
                  <Link href="/dashboard/speed-drill" className="bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 text-slate-900 p-4 rounded-2xl shadow-xs transition-all flex flex-col items-center text-center group">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Zap className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">Speed Drill</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">50s / Soal</div>
                  </Link>
                  <Link href="/dashboard/flashcards" className="bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 text-slate-900 p-4 rounded-2xl shadow-xs transition-all flex flex-col items-center text-center group">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Layers className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Flashcard</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Hafalan TWK</div>
                  </Link>
                  <Link href="/dashboard/evaluasi" className="bg-white border border-slate-200/80 hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5 text-slate-900 p-4 rounded-2xl shadow-xs transition-all flex flex-col items-center text-center group">
                    <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Target className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">Evaluasi</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Bank Soal Salah</div>
                  </Link>
                  <Link href="/dashboard/challenge" className="bg-white border border-slate-200/80 hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 text-slate-900 p-4 rounded-2xl shadow-xs transition-all flex flex-col items-center text-center group">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Flame className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">Challenge</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">30 Hari Rutin</div>
                  </Link>
                  <Link href="/dashboard/materi" className="bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 text-slate-900 p-4 rounded-2xl shadow-xs transition-all flex flex-col items-center text-center group">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Materi</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Modul &amp; Rumus</div>
                  </Link>
                </div>
              </div>

              {/* Gamifikasi & Lencana Prestasi */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 md:p-6 shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold mb-1.5">
                        <Trophy className="w-3.5 h-3.5" /> Gamifikasi & Pencapaian
                      </div>
                      <h3 className="text-lg md:text-xl font-black text-white tracking-tight">Lencana Prestasi Pejuang CPNS</h3>
                      <p className="text-xs text-slate-300 mt-0.5">Buktikan progres dan konsistensi belajarmu dengan membuka setiap badge eksklusif!</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-2xl self-start sm:self-auto shadow-inner">
                      <Award className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-xs text-slate-400 font-semibold leading-none">Terbuka</div>
                        <div className="text-base font-black text-white leading-none mt-1">
                          <span className="text-amber-400">{unlockedCount}</span> / {badges.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid 4 Badges */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {badges.map((b) => {
                      const BadgeIcon = b.Icon;
                      return (
                      <div 
                        key={b.id}
                        className={`rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                          b.unlocked 
                            ? `bg-slate-900/90 border-slate-700 hover:border-slate-600 shadow-md` 
                            : 'bg-slate-900/40 border-slate-800/70 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${b.iconBg}`}>
                              <BadgeIcon className={`w-5 h-5 ${b.iconColor}`} strokeWidth={1.8} />
                            </div>
                            {b.unlocked ? (
                              <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="p-1 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-white mb-1 leading-snug">{b.title}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{b.desc}</p>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                          <span className={`font-semibold ${b.unlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {b.unlocked ? 'Terbuka' : 'Terkunci'}
                          </span>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section Install Aplikasi HP (PWA / WebView) */}
              <InstallAppCard />

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
                <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900 mb-3">Riwayat Ujian</h2>
                {examHistory.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <ClipboardList className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    <p className="text-slate-600 text-sm font-medium">Belum ada riwayat ujian</p>
                    <Link 
                      href="/tryout-list" 
                      className="inline-flex items-center gap-1.5 mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs"
                    >
                      <span>Mulai Try Out Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
