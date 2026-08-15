import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyouhave|outbrain|pinterest|slackbot|vkShare|W3C_Validator|Google-InspectionTool/i.test(userAgent);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
                           request.nextUrl.pathname.startsWith('/tryout/') || 
                           request.nextUrl.pathname.startsWith('/result');

  // Bots (Googlebot, dll) selalu diizinkan mengakses halaman publik (/, /tryout-list, /checkout, sitemap, robots, dll)
  if (isBot && !isProtectedRoute && !isAdminRoute) {
    return supabaseResponse;
  }

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

  // 3. Redirect ke dashboard jika sudah login dan membuka /login
  if (request.nextUrl.pathname === '/login' && user && !isBot) {
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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};