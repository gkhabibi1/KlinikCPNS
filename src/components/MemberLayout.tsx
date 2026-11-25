'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  LayoutDashboard,
  ClipboardCheck,
  Flame,
  BookOpen,
  Target,
  Zap,
  Layers,
  FileText,
  CreditCard,
  Receipt,
  User,
  Bell,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Home
} from 'lucide-react';

interface MemberLayoutProps {
  children: React.ReactNode;
}

function MemberLayoutContent({ children }: MemberLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams ? searchParams.get('tab') : null;

  const isDashboardActive = pathname === '/dashboard' && tab !== 'subscription' && tab !== 'notifications';
  const isSubscriptionActive = pathname === '/dashboard/subscription' || (pathname === '/dashboard' && tab === 'subscription');
  const isNotificationsActive = (pathname === '/dashboard' && tab === 'notifications') || pathname === '/dashboard/notifications';
  const isOrdersActive = pathname === '/dashboard/orders';

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let channel: any = null;

    const loadUnreadCount = async (userId: string) => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (isMounted) {
        setUnreadCount(count || 0);
      }
    };

    const setupNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        await loadUnreadCount(user.id);
        if (!isMounted) return;

        const channelName = `notifications:${user.id}`;

        const existingChannel = supabase.getChannels().find(
          (ch: any) => ch.topic === `realtime:${channelName}` || ch.topic === channelName || ch.name === channelName
        );
        if (existingChannel) {
          await supabase.removeChannel(existingChannel);
        }

        if (!isMounted) return;

        channel = supabase.channel(channelName);
        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              if (isMounted) {
                loadUnreadCount(user.id);
              }
            }
          )
          .subscribe();

      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        if (isMounted) {
          setCurrentUserEmail(user.email || '');
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (isMounted && profile) setUserProfile(profile);
        }
      } catch (err) {
        console.error('Error fetching user in MemberLayout:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari akun?')) {
      await supabase.auth.signOut();
      router.push('/');
    }
  };

  const isExpired = userProfile?.subscription_valid_until
    ? new Date(userProfile.subscription_valid_until) < new Date()
    : true;

  if (isLoading && !userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-xs font-medium text-slate-500">Memuat ruang belajar...</p>
        </div>
      </div>
    );
  }

  const navItemClass = (active: boolean) =>
    `flex items-center ${isSidebarOpen ? 'px-3 justify-start' : 'px-2 justify-center'} py-2.5 rounded-xl text-[13.5px] transition-all ${
      active
        ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
    }`;

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR - DESKTOP */}
      <aside
        className={`hidden md:flex flex-col ${
          isSidebarOpen ? 'w-64' : 'w-[74px]'
        } bg-white border-r border-slate-200/80 h-screen sticky top-0 overflow-y-auto transition-all duration-300 z-20 flex-shrink-0`}
      >
        {/* Brand & Collapse */}
        <div className={`h-16 px-4 border-b border-slate-100 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} flex-shrink-0`}>
          <Link href="/dashboard" className={`flex items-center ${!isSidebarOpen && 'hidden'}`}>
            <img
              src="https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png"
              alt="Logo Klinik CPNS"
              className="h-7 w-auto object-contain"
            />
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? 'Perkecil Sidebar' : 'Perluas Sidebar'}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4.5 h-4.5" strokeWidth={1.75} />
            ) : (
              <PanelLeftOpen className="w-4.5 h-4.5" strokeWidth={1.75} />
            )}
          </button>
        </div>

        {/* User Info */}
        <div className={`px-4 py-3.5 border-b border-slate-100 flex-shrink-0 ${!isSidebarOpen && 'hidden'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-xs">
              {userProfile?.full_name?.charAt(0).toUpperCase() || currentUserEmail?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {userProfile?.full_name || currentUserEmail?.split('@')[0] || 'User'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {userProfile?.email || currentUserEmail || 'user@email.com'}
              </p>
            </div>
          </div>
          <div className="mt-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                isExpired
                  ? 'bg-slate-50 text-slate-500 border-slate-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-slate-400' : 'bg-emerald-500'}`} />
              {isExpired ? 'Akun Free' : 'Paket Aktif'}
            </span>
          </div>
        </div>

        {/* Navigation Menu - Desktop */}
        <nav className="p-3 space-y-5 flex-1 overflow-y-auto">
          {/* GROUP 1: UTAMA */}
          <div className="space-y-1">
            {isSidebarOpen && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Utama
              </div>
            )}
            <Link
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                router.push('/dashboard');
              }}
              title="Dashboard"
              className={navItemClass(isDashboardActive)}
            >
              <LayoutDashboard className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarOpen && 'mr-3'}`} strokeWidth={1.75} />
              <span className={`${!isSidebarOpen && 'hidden'}`}>Dashboard</span>
            </Link>

            <Link
              href="/dashboard/panduan-cpns-2026"
              title="Panduan CPNS 2026"
              className={`flex items-center ${isSidebarOpen ? 'px-3 justify-between' : 'px-2 justify-center'} py-2.5 rounded-xl text-[13.5px] transition-all ${
                pathname === '/dashboard/panduan-cpns-2026'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
              }`}
            >
              <div className="flex items-center min-w-0">
                <FileText className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarOpen && 'mr-3'}`} strokeWidth={1.75} />
                <span className={`${!isSidebarOpen && 'hidden'} truncate`}>Panduan 2026</span>
              </div>
              {isSidebarOpen && (
                <span
                  className={`ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    pathname === '/dashboard/panduan-cpns-2026'
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}
                >
                  RESMI
                </span>
              )}
            </Link>
          </div>

          {/* GROUP 2: LATIHAN & MATERI */}
          <div className="space-y-1">
            {isSidebarOpen && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Latihan &amp; Materi
              </div>
            )}
            <Link
              href="/tryout-list"
              title="Try Out CAT"
              className={navItemClass(pathname === '/tryout-list')}
            >
              <ClipboardCheck className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarOpen && 'mr-3'}`} strokeWidth={1.75} />
              <span className={`${!isSidebarOpen && 'hidden'}`}>Try Out CAT</span>
            </Link>

            <Link
              href="/dashboard/challenge"
              title="30 Day Challenge"
              className={navItemClass(pathname === '/dashboard/challenge')}
            >
              <Flame className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarOpen && 'mr-3'}`} strokeWidth={1.75} />
              <span className={`${!isSidebarOpen && 'hidden'}`}>30 Day Challenge</span>
            </Link>

            <Link
              href="/dashboard/materi"
              title="Materi Belajar"
              className={navItemClass(pathname === '/dashboard/materi')}
            >
              <BookOpen className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarOpen && 'mr-3'}`} strokeWidth={1.75} />
              <span className={`${!isSidebarOpen && 'hidden'}`}>Materi Belajar</span>
            </Link>

            <Link
              href="/dashboard/evaluasi"
              title="Buku Evaluasi"
              className={navItemClass(pathname === '/dashboard/evaluasi')}
            >
              <Target className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarOpen && 'mr-3'}`} strokeWidth={1.75} />
              <span className={`${!isSidebarOpen && 'hidden'}`}>Buku Evaluasi</span>
            </Link>

            <Link
              href="/dashboard/speed-drill"
              title="Speed Drill (50s)"
              className={navItemClass(pathname === '/dashboard/speed-drill')}
            >
              <Zap className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarOpen && 'mr-3'}`} strokeWidth={1.75} />
              <span className={`${!isSidebarOpen && 'hidden'}`}>Speed Drill</span>
            </Link>

            <Link
              href="/dashboard/flashcards"
              title="Flashcard TWK"
              className={navItemClass(pathname === '/dashboard/flashcards')}
            >
              <Layers className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarOpen && 'mr-3'}`} strokeWidth={1.75} />
              <span className={`${!isSidebarOpen && 'hidden'}`}>Flashcard TWK</span>
            </Link>
          </div>

          {/* GROUP 3: AKUN & PAKET */}
          <div className="space-y-1">
            {isSidebarOpen && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Akun &amp; Paket
              </div>
            )}
            <Link
              href="/dashboard?tab=subscription"
              onClick={(e) => {
                e.preventDefault();
                router.push('/dashboard?tab=subscription');
              }}
              title="Beli Langganan"
              className={navItemClass(isSubscriptionActive)}
            >
              <CreditCard className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarOpen && 'mr-3'}`} strokeWidth={1.75} />
              <span className={`${!isSidebarOpen && 'hidden'}`}>Paket Langganan</span>
            </Link>

            <Link
              href="/dashboard/orders"
              title="Riwayat Pembelian"
              className={navItemClass(isOrdersActive)}
            >
              <Receipt className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarOpen && 'mr-3'}`} strokeWidth={1.75} />
              <span className={`${!isSidebarOpen && 'hidden'}`}>Riwayat Order</span>
            </Link>

            <Link
              href="/dashboard/profile"
              title="Profil Saya"
              className={navItemClass(pathname === '/dashboard/profile')}
            >
              <User className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarOpen && 'mr-3'}`} strokeWidth={1.75} />
              <span className={`${!isSidebarOpen && 'hidden'}`}>Profil Saya</span>
            </Link>

            <Link
              href="/dashboard?tab=notifications"
              title="Notifikasi"
              className={`flex items-center ${isSidebarOpen ? 'px-3 justify-between' : 'px-2 justify-center'} py-2.5 rounded-xl text-[13.5px] transition-all ${
                isNotificationsActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
              }`}
            >
              <div className="flex items-center">
                <Bell className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarOpen && 'mr-3'}`} strokeWidth={1.75} />
                <span className={`${!isSidebarOpen && 'hidden'}`}>Notifikasi</span>
              </div>
              {unreadCount > 0 && isSidebarOpen && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isNotificationsActive ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Logout Footer */}
        <div className="p-3 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={handleLogout}
            title="Keluar"
            className={`w-full flex items-center ${
              isSidebarOpen ? 'px-3 justify-start' : 'px-2 justify-center'
            } py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-[13.5px] font-medium transition-colors cursor-pointer`}
          >
            <LogOut className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarOpen && 'mr-3'}`} strokeWidth={1.75} />
            <span className={`${!isSidebarOpen && 'hidden'}`}>Keluar</span>
          </button>
        </div>
      </aside>

      {/*================= MAIN CONTENT =================*/}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-[#f8fafc]">
        <header className="h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/70 flex items-center justify-between px-4 sm:px-6 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="md:hidden shrink-0">
              <img
                src="https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png"
                alt="Logo"
                className="h-7 w-auto object-contain"
              />
            </Link>
            <h1 className="font-heading text-base sm:text-lg font-bold text-slate-900 truncate pr-2 tracking-tight">
              {pathname === '/dashboard' && (
                tab === 'subscription' ? 'Paket Langganan' :
                tab === 'notifications' ? 'Notifikasi' :
                'Dashboard Member'
              )}
              {pathname === '/dashboard/subscription' && 'Beli Langganan'}
              {pathname === '/dashboard/orders' && 'Riwayat Pembelian'}
              {pathname === '/tryout-list' && 'Daftar Paket Try Out'}
              {pathname === '/dashboard/challenge' && '30 Day CPNS Challenge'}
              {pathname === '/dashboard/materi' && 'Materi Pembelajaran'}
              {pathname === '/dashboard/evaluasi' && 'Buku Evaluasi & Bank Soal Salah'}
              {pathname === '/dashboard/speed-drill' && 'Speed Drill CAT (50s)'}
              {pathname === '/dashboard/flashcards' && 'Flashcard Hafalan TWK'}
              {pathname === '/dashboard/panduan-cpns-2026' && 'Panduan Resmi CPNS 2026'}
              {pathname === '/dashboard/profile' && 'Profil Saya'}
              {pathname === '/dashboard/notifications' && 'Notifikasi'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-3 py-1 rounded-full hidden md:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              CAT BKN 2026 Ready
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Keluar dari Akun"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 bg-[#f8fafc]">
          {children}
        </main>
      </div>

      {/* BOTTOM NAVIGATION - MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200/80 z-50 pb-safe shadow-lg">
        <div className="grid grid-cols-5 gap-1 px-2 pt-1.5 pb-1">
          {/* Home */}
          <Link
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              router.push('/dashboard');
            }}
            className={`flex flex-col items-center py-1.5 transition-all ${
              isDashboardActive ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5 mb-1" strokeWidth={isDashboardActive ? 2.2 : 1.75} />
            <span className="text-[10px]">Home</span>
          </Link>

          {/* Materi */}
          <Link
            href="/dashboard/materi"
            className={`flex flex-col items-center py-1.5 transition-all ${
              pathname === '/dashboard/materi' ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-1" strokeWidth={pathname === '/dashboard/materi' ? 2.2 : 1.75} />
            <span className="text-[10px]">Materi</span>
          </Link>

          {/* Try Out - TENGAH HIGHLIGHT */}
          <Link
            href="/tryout-list"
            className="flex flex-col items-center -mt-5"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 ring-4 ring-white">
              <ClipboardCheck className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-bold text-blue-600 mt-1">Try Out</span>
          </Link>

          {/* Paket */}
          <Link
            href="/dashboard?tab=subscription"
            onClick={(e) => {
              e.preventDefault();
              router.push('/dashboard?tab=subscription');
            }}
            className={`flex flex-col items-center py-1.5 transition-all ${
              isSubscriptionActive ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <CreditCard className="w-5 h-5 mb-1" strokeWidth={isSubscriptionActive ? 2.2 : 1.75} />
            <span className="text-[10px]">Paket</span>
          </Link>

          {/* Profil */}
          <Link
            href="/dashboard/profile"
            className={`flex flex-col items-center py-1.5 transition-all ${
              pathname === '/dashboard/profile' ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className="w-5 h-5 mb-1" strokeWidth={pathname === '/dashboard/profile' ? 2.2 : 1.75} />
            <span className="text-[10px]">Profil</span>
          </Link>
        </div>

        {/* Safe area untuk iPhone */}
        <div className="h-safe-area-inset-bottom bg-white/90"></div>
      </nav>
    </div>
  );
}

export default function MemberLayout(props: MemberLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
          <div className="text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-3 text-xs text-slate-500 font-medium">Memuat...</p>
          </div>
        </div>
      }
    >
      <MemberLayoutContent {...props} />
    </Suspense>
  );
}
