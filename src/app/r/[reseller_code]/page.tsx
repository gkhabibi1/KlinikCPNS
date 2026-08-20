import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ reseller_code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { reseller_code } = await params;
  const supabase = createClient();
  const { data: reseller } = await supabase
    .from('resellers')
    .select('full_name')
    .eq('reseller_code', reseller_code.toUpperCase())
    .single();

  return {
    title: `${reseller?.full_name || 'Reseller'} - Try Out CPNS & P3K | Klinik CPNS`,
    description: 'Platform Try Out CPNS dan P3K online terbaik dengan sistem penilaian resmi BKN',
  };
}

export default async function ResellerHomePage({ params }: PageProps) {
  const { reseller_code } = await params;
  const supabase = createClient();
  const code = reseller_code.toUpperCase();

  const { data: reseller } = await supabase
    .from('resellers')
    .select('*')
    .eq('reseller_code', code)
    .eq('is_active', true)
    .single();

  if (!reseller) {
    notFound();
  }

  const { data: packages } = await supabase
    .from('subscription_packages')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  const checkoutLink = reseller.checkout_link || '/login?redirect=/dashboard/subscription';

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-xl tracking-tight">
            CPNS<span className="text-blue-600">Master</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/tryout-list" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden md:block">
              Try Out
            </Link>
            <Link href="/reseller-login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
              Reseller Login
            </Link>
            <Link href="/login" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Masuk
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Lolos CPNS 2026 Bersama Kami!
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Platform Try Out CPNS dan P3K online dengan sistem penilaian resmi BKN, pembahasan lengkap, dan simulasi CAT persis seperti ujian asli
          </p>
          <Link 
            href={checkoutLink}
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Mulai Sekarang →
          </Link>
        </div>
      </section>

      {/* Paket Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
            Pilih Paket Langganan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages?.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
                  <h3 className="font-bold text-xl">{pkg.name}</h3>
                  <p className="text-blue-100 text-sm mt-1">{pkg.description}</p>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <div className="text-sm text-slate-600">Durasi</div>
                    <div className="font-bold text-slate-800">
                      {pkg.duration_months === 999 ? 'Lifetime' : `${pkg.duration_months} Bulan`}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-slate-600">Harga</div>
                    <div className="font-bold text-blue-600 text-2xl">
                      Rp {(pkg.price || 0).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <Link
                    href={checkoutLink}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
                  >
                    Pilih Paket
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 Klinik CPNS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
