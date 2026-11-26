'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Coins,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const supabase = createClient();

interface SubscriptionPackage {
  id: string;
  name: string;
  description?: string;
  duration_months: number;
  price: number;
  reseller_price?: number | null;
  discount_label?: string | null;
  subscription_benefits?: Array<{ id: string; benefit_text: string }>;
}

const DEFAULT_RESELLER_DISCOUNT_PERCENT = 20;

export default function ResellerCheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reseller, setReseller] = useState<any>(null);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(10);
  const [phone, setPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) {
          router.push('/reseller-login');
          return;
        }

        const { data: resellerData } = await supabase
          .from('resellers')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        if (!resellerData) {
          router.push('/reseller-login');
          return;
        }

        setUser(currentUser);
        setReseller(resellerData);
        setPhone(resellerData.phone_number || '');

        const { data: pkgData } = await supabase
          .from('subscription_packages')
          .select('*, subscription_benefits(*)')
          .eq('is_active', true)
          .order('display_order');

        if (pkgData && pkgData.length > 0) {
          setPackages(pkgData);
          setSelectedPackageId(pkgData[0].id);
        }
      } catch (err) {
        console.error('Error loading reseller checkout:', err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [router]);

  const selectedPackage = packages.find((p) => p.id === selectedPackageId) || null;

  // Gunakan reseller_price jika disetting di Admin, jika tidak pakai diskon default 20%
  const getUnitResellerPrice = (pkg: SubscriptionPackage) => {
    if (typeof pkg.reseller_price === 'number' && pkg.reseller_price > 0) {
      return pkg.reseller_price;
    }
    return Math.round((pkg.price || 0) * (1 - DEFAULT_RESELLER_DISCOUNT_PERCENT / 100));
  };

  const unitNormalPrice = selectedPackage?.price || 0;
  const unitResellerPrice = selectedPackage ? getUnitResellerPrice(selectedPackage) : 0;
  const totalNormal = unitNormalPrice * quantity;
  const totalPayable = unitResellerPrice * quantity;
  const totalSavings = Math.max(0, totalNormal - totalPayable);

  const handleCreateOrder = async () => {
    if (!user || !reseller || !selectedPackage) return;

    if (quantity < 1 || quantity > 500) {
      alert('Jumlah paket harus antara 1 sampai 500.');
      return;
    }

    if (!phone.trim()) {
      alert('Nomor WhatsApp aktif wajib diisi untuk konfirmasi pesanan.');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/payment/create-qris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          package_id: selectedPackage.id,
          duration: selectedPackage.duration_months || 1,
          base_amount: totalPayable,
          customer_name: `[RESELLER ${reseller.reseller_code}] ${reseller.full_name} (${quantity}x Token - ${selectedPackage.name})`,
          customer_email: reseller.email || user.email,
          customer_phone: phone.trim(),
          voucher_code_id: null,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/reseller/dashboard"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 px-3 py-1.5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                Checkout Paket Reseller
              </h1>
              <p className="text-xs text-slate-500">
                Kode: <span className="font-mono font-bold text-purple-600">{reseller?.reseller_code}</span> · Sisa Token:{' '}
                <span className="font-bold text-slate-800">{reseller?.token_balance ?? 0}</span>
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Harga Khusus Reseller
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {packages.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Package className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800 mb-1">
              Belum Ada Paket Aktif
            </h2>
            <p className="text-sm text-slate-500">
              Admin belum mengaktifkan paket langganan. Silakan hubungi admin terlebih dahulu.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Kolom Kiri: Pilih Paket & Jumlah */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Pilih Paket dari Admin */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                    Langkah 1
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Pilih Paket yang Ingin Diorder
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Daftar paket berikut sinkron langsung dengan pengaturan paket di panel Admin.
                  </p>
                </div>

                <div className="space-y-3">
                  {packages.map((pkg) => {
                    const isSelected = pkg.id === selectedPackageId;
                    const resellerUnit = getUnitResellerPrice(pkg);
                    const durationLabel =
                      pkg.duration_months === 999
                        ? 'Lifetime'
                        : `${pkg.duration_months} Bulan`;

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
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm sm:text-base">
                                {pkg.name}
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {durationLabel}
                              </span>
                            </div>
                            {pkg.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {pkg.description}
                              </p>
                            )}
                          </div>

                          <div className="sm:text-right shrink-0">
                            <p className="text-xs text-slate-400 line-through">
                              Rp {pkg.price?.toLocaleString('id-ID')}
                            </p>
                            <p className="text-base sm:text-lg font-extrabold text-purple-700">
                              Rp {resellerUnit.toLocaleString('id-ID')}
                              <span className="text-xs font-medium text-slate-500">
                                /voucher
                              </span>
                            </p>
                          </div>
                        </div>

                        {pkg.subscription_benefits && pkg.subscription_benefits.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1">
                            {pkg.subscription_benefits.slice(0, 3).map((b) => (
                              <span
                                key={b.id}
                                className="inline-flex items-center gap-1 text-[11px] text-slate-600"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                {b.benefit_text}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 2. Jumlah Token / Voucher & Kontak */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                    Langkah 2
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Jumlah Token / Voucher &amp; Konfirmasi
                  </h2>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                    Jumlah Order (1 Token = 1 Kode Voucher)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setQuantity(isNaN(val) ? 1 : Math.max(1, Math.min(500, val)));
                        }}
                        className="w-16 text-center font-bold text-slate-900 text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(500, q + 1))}
                        className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {[5, 10, 25, 50, 100].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setQuantity(preset)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            quantity === preset
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {preset}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Nomor WhatsApp Reseller
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Digunakan untuk konfirmasi status order &amp; penambahan saldo token.
                  </p>
                </div>
              </section>
            </div>

            {/* Kolom Kanan: Ringkasan Order */}
            <aside className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Ringkasan Order Reseller
                    </h3>
                    <p className="text-xs text-slate-500">
                      Atas nama {reseller?.full_name}
                    </p>
                  </div>
                </div>

                {selectedPackage && (
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Paket Dipilih</span>
                      <span className="font-semibold text-slate-900 text-right">
                        {selectedPackage.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Jumlah Token</span>
                      <span className="font-semibold text-slate-900">
                        {quantity} Token ({quantity} Voucher)
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Harga Normal</span>
                      <span className="line-through text-slate-400">
                        Rp {totalNormal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Potongan Reseller</span>
                      <span>- Rp {totalSavings.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                      <span className="font-bold text-slate-900">Total Bayar</span>
                      <span className="text-2xl font-extrabold text-purple-700">
                        Rp {totalPayable.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isProcessing || !selectedPackage}
                  onClick={handleCreateOrder}
                  className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-md shadow-purple-600/20 transition cursor-pointer"
                >
                  <span>
                    {isProcessing ? 'Membuat QRIS...' : 'Lanjut Pembayaran QRIS'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="bg-slate-50 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Setelah melakukan pembayaran QRIS dan verifikasi, token akan masuk ke akun reseller Anda dan langsung siap digunakan untuk generate kode voucher.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
