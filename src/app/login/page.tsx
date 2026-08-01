"use client";

import { Suspense, FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Image from 'next/image';

type AuthMode = "login" | "register";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
    
    const urlMode = searchParams.get('mode');
    if (urlMode === 'register') {
      setMode('register');
    } else if (urlMode === 'login') {
      setMode('login');
    }
  }, [searchParams]);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    setSuccess(null);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      setForgotMessage('Error: ' + error.message);
    } else {
      setForgotMessage('Link reset password telah dikirim ke email Anda. Silakan cek inbox/spam.');
    }
    setForgotLoading(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    console.log("Submitting auth mode:", mode, "email:", email);

    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === "login") {
        const { error: signInError, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error("SignIn Error:", signInError);
          if (signInError.message === 'Invalid login credentials') {
            setError("Email atau password salah. Silakan periksa kembali kombinasi email dan password Anda.");
          } else if (signInError.message === 'Email not confirmed') {
            setError("Email Anda belum dikonfirmasi. Silakan periksa inbox/spam email Anda untuk verifikasi.");
          } else {
            setError(signInError.message || "Gagal masuk. Silakan coba lagi.");
          }
          return;
        }

        if (data.user) {
          // Pastikan data profil pengguna ada di database
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (!profile) {
            console.log("Creating default profile for user:", data.user.id);
            await supabase.from('profiles').insert([{
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Member',
              subscription_valid_until: new Date().toISOString()
            }]);
          }

          if (redirectUrl && redirectUrl !== '/dashboard') {
            window.location.href = redirectUrl;
          } else {
            if (profile?.role === 'admin' || data.user.email === 'gkhabibi1@gmail.com') {
              window.location.href = '/admin';
            } else {
              window.location.href = '/dashboard';
            }
          }
        }
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0]
          }
        }
      });

      if (signUpError) {
        console.error("SignUp Error:", signUpError);
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        await supabase.from('profiles').insert([{
          id: data.user.id,
          email: data.user.email,
          full_name: email.split('@')[0],
          subscription_valid_until: new Date().toISOString()
        }]);
      }

      if (data.session) {
        window.location.href = redirectUrl;
        return;
      }

      setSuccess(
        "Akun berhasil dibuat! Silakan masuk dengan email dan password Anda.",
      );
    } catch (err: any) {
      console.error("Unexpected Auth Error:", err);
      setError("Terjadi kesalahan: " + (err.message || "Silakan coba lagi."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}` },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image src="/login_logo.png" alt="Logo" width={80} height={80} className="mx-auto mb-4" />
          <button type="button" onClick={() => router.back()} className="mb-4 flex items-center text-sm text-blue-600 hover:underline">
            ← Kembali
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Try Out CPNS
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Persiapkan diri Anda menghadapi seleksi CPNS
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl shadow-blue-900/5">
          <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50/80 p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                mode === "login"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                mode === "register"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-8">
            {redirectUrl !== '/dashboard' && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                Anda akan diarahkan ke halaman checkout setelah login berhasil.
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              {mode === "login" && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotMessage('');
                      setShowForgotPassword(true);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    Lupa Password?
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Memproses..."
                : mode === "login"
                  ? "Masuk"
                  : "Buat Akun"}
            </button>
          </form>

          <div className="px-8 pb-8">
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                  ATAU
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Masuk dengan Google
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Try Out CPNS. Semua hak dilindungi.
        </p>
      </div>

      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Reset Password</h3>
              <button type="button" onClick={() => setShowForgotPassword(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            
            <p className="text-sm text-slate-500 mb-4">
              Masukkan email Anda. Kami akan mengirimkan link untuk mereset password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                placeholder="nama@email.com"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              
              {forgotMessage && (
                <div className={`text-xs p-2 rounded ${forgotMessage.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {forgotMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {forgotLoading ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="text-center text-slate-500 font-medium">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
