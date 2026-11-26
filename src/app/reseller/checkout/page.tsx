'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  KeyRound,
  Package,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface ResellerPackage {
  id: string;
  name: string;
  price: number;
  token_amount: number;
  description: string;
  badge?: string;
  is_active: boolean;
}

export default function ResellerCheckoutPage() {
  const [packages, setPackages] = useState<ResellerPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [config, setConfig] = useState({
    hero_title: 'Gabung Jadi Reseller KlinikCPNS',
    hero_subtitle:
      'Pilih paket reseller di bawah ini dan selesaikan pembayaran tanpa perlu login terlebih dahulu. Setelah pembayaran diverifikasi Admin, akses login dashboard reseller akan langsung dikirimkan ke WhatsApp & Email Anda.',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    notes: '',
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/reseller/orders');
        const data = await res.json();
        if (data?.packages && data.packages.length > 0) {
          setPackages(data.packages);
          setSelectedPackageId(data.packages[0].id);
        }
        if (data?.config) {
          setConfig((prev) => ({ ...prev, ...data.config }));
        }
      } catch (err) {
        console.error('Error loading reseller packages:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const selectedPackage = packages.find((p) => p.id === selectedPackageId) || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) {
      alert('Pilih paket reseller terlebih dahulu.');
      return;
    }
    if (!form.full_name.trim() || !form.email.trim() || !form.phone_number.trim()) {
      alert('Nama lengkap, email, dan nomor WhatsApp wajib diisi.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/reseller/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: selectedPackage.id,
          full_name: form.full_name,
          email: form.email,
          phone_number: form.phone_number,
          notes: form.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuat pesanan reseller');
      }

      window.location.href = data.redirect_url;
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Terjadi kesalahan saat memproses order'));
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-11 w-11 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src="https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png"
              alt="Klinik CPNS"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Pendaftaran &amp; Checkout Reseller
            </span>
            <Link
              href="/reseller-login"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 px-3.5 py-2 rounded-full transition-colors"
            >
              Sudah punya akun? Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-7 sm:py-12">
        {/* Intro Banner */}
        <div className="mb-7 sm:mb-9">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-100/80 px-3 py-1 rounded-full mb-2.5">
            Program Kemitraan KlinikCPNS
          </span>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {config.hero_title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            {config.hero_subtitle}
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Package className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800 mb-1">
              Paket Reseller Belum Tersedia
            </h2>
            <p className="text-sm text-slate-500">
              Admin belum mengaktifkan paket reseller. Silakan hubungi Admin via WhatsApp.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Kolom Kiri: Pilih Paket & Data Diri */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Pilihan Paket Reseller dari Admin */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                    Langkah 1
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Pilih Paket Reseller
                  </h2>
                </div>

                <div className="space-y-3">
                  {packages.map((pkg) => {
                    const isSelected = pkg.id === selectedPackageId;
                    const pricePerToken =
                      pkg.token_amount > 0
                        ? Math.round(pkg.price / pkg.token_amount)
                        : pkg.price;

                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`w-full text-left rounded-xl p-4 border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-purple-300 bg-white'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm sm:text-base">
                                {pkg.name}
                              </span>
                              {pkg.badge && (
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                  {pkg.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              {pkg.description}
                            </p>
                            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                              <Coins className="w-3.5 h-3.5" />
                              <span>
                                Dapat {pkg.token_amount} Token Voucher (~Rp{' '}
                                {pricePerToken.toLocaleString('id-ID')}/voucher)
                              </span>
                            </div>
                          </div>

                          <div className="sm:text-right shrink-0 pt-1 sm:pt-0">
                            <p className="text-xl font-extrabold text-purple-700">
                              Rp {pkg.price?.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 2. Data Calon Reseller */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                    Langkah 2
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Data Diri Calon Reseller
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Email &amp; WhatsApp ini akan digunakan Admin untuk mengirimkan akun login reseller Anda.
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                      Email untuk Login Reseller *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="budi@email.com"
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone_number}
                      onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                      placeholder="081234567890"
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Catatan / Domisili (Opsional)
                  </label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Contoh: Komunitas CPNS Bandung"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </section>
            </div>

            {/* Kolom Kanan: Ringkasan & Alur Aktivasi */}
            <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
                <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
                  Ringkasan Order Reseller
                </h3>

                {selectedPackage && (
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Paket Dipilih</span>
                      <span className="font-semibold text-slate-900 text-right">
                        {selectedPackage.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Stok Token Didapat</span>
                      <span className="font-semibold text-emerald-700">
                        {selectedPackage.token_amount} Token Voucher
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                      <span className="font-bold text-slate-900">Total Bayar</span>
                      <span className="text-2xl font-extrabold text-purple-700">
                        Rp {selectedPackage.price?.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || !selectedPackage}
                  className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-md shadow-purple-600/20 transition cursor-pointer"
                >
                  <span>
                    {isProcessing ? 'Membuat QRIS...' : 'Lanjut Pembayaran QRIS'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4 space-y-2.5">
                  <p className="text-xs font-bold text-purple-900">
                    Alur Setelah Pembayaran:
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>Bayar via QRIS &amp; upload bukti transfer.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <UserCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>Admin membuatkan akun Reseller Anda beserta saldo tokennya.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <KeyRound className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>Login di /reseller-login, ganti password Anda, dan mulai daftarkan pelanggan!</span>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}
