import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  // Mengambil parameter 'next' jika ada, default ke '/' (halaman utama)
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.headers.get('cookie') ? 
              request.headers.get('cookie')?.split(';').map(c => {
                const [name, ...v] = c.split('=');
                return { name: name.trim(), value: v.join('=') };
              }) ?? [] 
              : [];
          },
          setAll(cookiesToSet) {
            // Di route handler, kita tidak bisa langsung set cookie di response
            // Jadi kita serahkan pada middleware atau client untuk mengelolanya
          },
        },
      }
    );
    
    // Menukar kode dengan sesi login
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Ini bagian paling penting: Mengarahkan user menggunakan URL asal (origin)
  // Jadi tidak akan pernah nyasar ke localhost lagi jika dibuka dari Vercel
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
