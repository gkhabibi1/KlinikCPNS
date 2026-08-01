import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/tryout') || 
                           request.nextUrl.pathname.startsWith('/result') || 
                           request.nextUrl.pathname.startsWith('/checkout');

  // 1. Jika route diproteksi dan user BELUM login -> redirect ke login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // 2. Akses admin diproteksi untuk email tertentu
  if (isAdminRoute && user) {
    if (user.email !== 'gkhabibi1@gmail.com') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // 3. Auto-redirect jika akses '/' atau '/login' saat sudah login
  if ((request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login') && user) {
    const url = request.nextUrl.clone();
    if (user.email === 'gkhabibi1@gmail.com') {
      url.pathname = '/admin';
    } else {
      url.pathname = '/dashboard';
    }
    return NextResponse.redirect(url);
  }

  // 4. Jika semua aman, lanjutkan
  return supabaseResponse;
}

export const config = {
  // Matcher disesuaikan agar lolos dari bug Vercel Edge Runtime
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};