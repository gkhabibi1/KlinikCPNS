import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  let next = requestUrl.searchParams.get('next') ?? '/dashboard';

  // 🛡️ KEAMANAN: Cegah Serangan Open Redirect
  if (!next.startsWith('/')) {
    next = '/dashboard';
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set({ name, value, ...options });
              });
            } catch (error) {
              // Ignore if called from Server Component
            }
          },
        },
      }
    );
    
    // Menukar authorization code dengan sesi login Supabase SSR
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('OAuth exchange error:', error.message);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    // Cek profil user & berikan role admin otomatis jika email gkhabibi1@gmail.com
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const isAdmin = user.email === 'gkhabibi1@gmail.com';
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.from('profiles').insert([{
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
          role: isAdmin ? 'admin' : 'member',
          subscription_valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }]);
      } else if (isAdmin && profile.role !== 'admin') {
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      }

      // Jika admin login tanpa custom next route, langsung ke /admin
      if (isAdmin && (next === '/dashboard' || !requestUrl.searchParams.has('next'))) {
        next = '/admin';
      }
    }
  }

  // Gunakan origin request secara dinamis
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  
  if (isLocalEnv) {
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`);
  } else {
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  }
}
