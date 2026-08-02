import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  let next = requestUrl.searchParams.get('next') ?? '/dashboard';

  // 🛡️ KEAMANAN 1: Cegah Serangan Open Redirect
  // Memastikan rute 'next' selalu dimulai dengan '/' (rute internal website Anda)
  if (!next.startsWith('/')) {
    next = '/dashboard';
  }

  if (code) {
    // 🛡️ FUNGSI: Menggunakan fungsi cookies() bawaan Next.js App Router
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
              // Menyimpan sesi login (Token) ke browser user dengan aman
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set({ name, value, ...options });
              });
            } catch (error) {
              // Tangkap error diam-diam jika dieksekusi di Server Component
            }
          },
        },
      }
    );
    
    // Menukar kode tiket dengan sesi login resmi
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    // Jika token kadaluarsa atau terjadi error saat login
    if (error) {
      return NextResponse.redirect(`https://klinikcpns.com/login?error=GagalLogin`);
    }
  }

  // 🛡️ LOGIKA ANTI NYASAR VERCEL (Tetap Dipertahankan)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  
  if (isLocalEnv) {
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`);
  } else {
    // Jalur Darurat
    return NextResponse.redirect(`https://klinikcpns.com${next}`);
  }
}
