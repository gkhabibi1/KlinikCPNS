'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

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

        // Fetch initial unread count
        await loadUnreadCount(user.id);
        if (!isMounted) return;

        const channelName = `notifications:${user.id}`;

        // Hapus channel lama jika sudah terdaftar di Supabase client singleton untuk mencegah error subscribe
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

    // Cleanup function
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
      // Hanya tampilkan loading penuh jika userProfile belum pernah dimuat (mencegah flickering saat pindah tab)
      if (!userProfile) {
        setIsLoading(true);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      if (isMounted) {
        setCurrentUserEmail(user.email || 'user@example.com');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (isMounted) {
        if (profile) setUserProfile(profile);
        setIsLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isExpired = userProfile?.subscription_valid_until
    ? new Date(userProfile.subscription_valid_until) < new Date()
    : true;

  if (isLoading && !userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/*================= SIDEBAR =================*/}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-20`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 flex-shrink-0">
          <div className={`font-extrabold text-xl tracking-tight text-slate-900 ${!isSidebarOpen && 'hidden'}`}>
            CPNS<span className="text-blue-600 font-light">Master</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        {/* User Info */}
        <div className={`px-6 py-5 border-b border-slate-100 flex-shrink-0 ${!isSidebarOpen && 'hidden'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
              {currentUserEmail ? currentUserEmail.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-slate-800 truncate">
                {userProfile?.full_name || currentUserEmail.split('@')[0] || 'User'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {currentUserEmail}
              </div>
            </div>
          </div>
          
          {/* Status Indikator */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            {isExpired ? (
              <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> EXPIRED
              </div>
            ) : (
              <div className="text-[10px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> AKTIF
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isDashboardActive
                  ? 'bg-slate-900 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span className={`${!isSidebarOpen && 'hidden'}`}>Dashboard</span>
            </Link>

            {/* Try Out */}
            <Link
              href="/tryout-list"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/tryout-list'
                  ? 'bg-slate-900 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <span className={`${!isSidebarOpen && 'hidden'}`}>Try Out</span>
            </Link>

            {/* 30 Day Challenge */}
            <Link
              href="/dashboard/challenge"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/dashboard/challenge'
                  ? 'bg-slate-900 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
              <span className={`${!isSidebarOpen && 'hidden'}`}>30 Day Challenge</span>
            </Link>

            {/* Materi Pembelajaran */}
            <Link
              href="/dashboard/materi"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/dashboard/materi'
                  ? 'bg-slate-900 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              <span className={`${!isSidebarOpen && 'hidden'}`}>Materi Pembelajaran</span>
            </Link>

            {/* Beli Langganan */}
            <Link
              href="/dashboard/subscription"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isSubscriptionActive
                  ? 'bg-slate-900 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className={`${!isSidebarOpen && 'hidden'}`}>Beli Langganan</span>
            </Link>

            {/* Profil Saya */}
            <Link
              href="/dashboard/profile"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/dashboard/profile'
                  ? 'bg-slate-900 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span className={`${!isSidebarOpen && 'hidden'}`}>Profil Saya</span>
            </Link>

            {/* Notifikasi */}
            <Link 
              href="/dashboard?tab=notifications" 
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isNotificationsActive
                  ? 'bg-slate-900 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className={`${!isSidebarOpen && 'hidden'}`}>Notifikasi</span>
              </div>
              {unreadCount > 0 && (
                <span className={`bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ${!isSidebarOpen && 'hidden'}`}>
                  {unreadCount}
                </span>
              )}
            </Link>

            <button
                onClick={async () => {
                    if(confirm('Apakah Anda yakin ingin keluar?')){
                        await supabase.auth.signOut();
                        router.push('/');
                    }
                }}
                className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors mt-4 border-t border-slate-100 pt-4"
            >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span className={`${!isSidebarOpen && 'hidden'}`}>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/*================= MAIN CONTENT =================*/}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 flex-shrink-0">
          <h1 className="text-lg font-bold text-slate-800">
            {pathname === '/dashboard' && (
              tab === 'subscription' ? 'Paket Langganan' :
              tab === 'notifications' ? 'Notifikasi' :
              'Dashboard Member'
            )}
            {pathname === '/dashboard/subscription' && 'Beli Langganan'}
            {pathname === '/tryout-list' && 'Daftar Paket Try Out'}
            {pathname === '/dashboard/challenge' && '30 Day CPNS Challenge'}
            {pathname === '/dashboard/materi' && 'Materi Pembelajaran'}
            {pathname === '/dashboard/profile' && 'Profil Saya'}
            {pathname === '/dashboard/notifications' && 'Notifikasi'}
          </h1>
          <div className="text-sm text-slate-500 font-medium hidden sm:block">Sistem Ujian CAT</div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function MemberLayout(props: MemberLayoutProps) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">Memuat...</p>
        </div>
      </div>
    }>
      <MemberLayoutContent {...props} />
    </Suspense>
  );
}
