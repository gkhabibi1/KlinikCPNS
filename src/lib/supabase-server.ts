import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  // Use createServerClient with cookie handling or direct supabase-js fallback
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    const cookieStore = cookies();
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return (cookieStore as any).getAll ? (cookieStore as any).getAll() : [];
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              (cookieStore as any).set ? (cookieStore as any).set(name, value, options) : null
            );
          } catch {
            // Ignore when rendered in Server Component
          }
        },
      },
    });
  } catch {
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    });
  }
}
