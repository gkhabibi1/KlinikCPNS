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
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      await supabase.auth.signOut();
      router.push('/');
    }
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
      {/* SIDEBAR - HANYA TAMPIL DI DESKTOP */}
      <aside className={`hidden md:flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 h-screen sticky top-0 overflow-y-auto transition-all duration-300 z-20 flex-shrink-0`}>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <h1 className={`text-2xl font-bold text-blue-600 ${!isSidebarOpen && 'hidden'}`}>CPNSMaster</h1>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        
        {/* User Info */}
        <div className={`p-4 border-b border-slate-200 flex-shrink-0 ${!isSidebarOpen && 'hidden'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {userProfile?.full_name?.charAt(0).toUpperCase() || currentUserEmail?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {userProfile?.full_name || currentUserEmail?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {userProfile?.email || currentUserEmail || 'user@email.com'}
              </p>
            </div>
          </div>
          {isExpired && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
              EXPIRED
            </span>
          )}
        </div>
        
        {/* Navigation Menu - Desktop */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <Link
            href="/dashboard"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isDashboardActive 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className={`${!isSidebarOpen && 'hidden'}`}>Dashboard</span>
          </Link>
          
          <Link 
            href="/tryout-list" 
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === '/tryout-list' 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className={`${!isSidebarOpen && 'hidden'}`}>Try Out</span>
          </Link>
          
          <Link 
            href="/dashboard/challenge" 
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === '/dashboard/challenge' 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`${!isSidebarOpen && 'hidden'}`}>30 Day Challenge</span>
          </Link>
          
          <Link 
            href="/dashboard/materi" 
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === '/dashboard/materi' 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className={`${!isSidebarOpen && 'hidden'}`}>Materi Pembelajaran</span>
          </Link>
          
          <Link
            href="/dashboard?tab=subscription"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isSubscriptionActive 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className={`${!isSidebarOpen && 'hidden'}`}>Beli Langganan</span>
          </Link>
          
          <Link 
            href="/dashboard/profile" 
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === '/dashboard/profile' 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className={`${!isSidebarOpen && 'hidden'}`}>Profil Saya</span>
          </Link>
          
          <Link 
            href="/dashboard?tab=notifications" 
            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isNotificationsActive 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors mt-4 border-t border-slate-100 pt-4"
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`${!isSidebarOpen && 'hidden'}`}>Logout</span>
          </button>
        </nav>
      </aside>

      {/*================= MAIN CONTENT =================*/}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 z-10 flex-shrink-0">
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

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* BOTTOM NAVIGATION - MOBILE (REVISI 1) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe">
        <div className="grid grid-cols-5 gap-1 px-2 pt-2">
          {/* Home */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center py-2 transition-all ${
              isDashboardActive ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          {/* Materi */}
          <Link 
            href="/dashboard/materi" 
            className={`flex flex-col items-center py-2 transition-all ${
              pathname === '/dashboard/materi' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[10px] font-medium">Materi</span>
          </Link>

          {/* Try Out - TENGAH HIGHLIGHT */}
          <Link 
            href="/tryout-list" 
            className="flex flex-col items-center -mt-6"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 ring-4 ring-white">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-blue-600 mt-1">Try Out</span>
          </Link>

          {/* Paket */}
          <Link
            href="/dashboard?tab=subscription"
            className={`flex flex-col items-center py-2 transition-all ${
              isSubscriptionActive ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-[10px] font-medium">Paket</span>
          </Link>

          {/* Profil */}
          <Link 
            href="/dashboard/profile" 
            className={`flex flex-col items-center py-2 transition-all ${
              pathname === '/dashboard/profile' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-medium">Profil</span>
          </Link>
        </div>
        
        {/* Safe area untuk iPhone */}
        <div className="h-safe-area-inset-bottom bg-white"></div>
      </nav>
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
