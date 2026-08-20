'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

const supabase = createClient();

export default function ResellerDashboard() {
  const router = useRouter();
  const [reseller, setReseller] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [generatedVouchers, setGeneratedVouchers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'generate' | 'vouchers' | 'settings'>('overview');
  
  // Form generate voucher
  const [generateForm, setGenerateForm] = useState({
    package_id: '',
    quantity: 1,
    voucher_category: 'activation' as 'discount' | 'activation'
  });

  // Form settings
  const [checkoutLink, setCheckoutLink] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/reseller-login');
      return;
    }

    const { data: resellerData } = await supabase
      .from('resellers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!resellerData) {
      router.push('/reseller-login');
      return;
    }

    setReseller(resellerData);
    setCheckoutLink(resellerData.checkout_link || '');
    fetchPackages();
    fetchGeneratedVouchers(resellerData.id);
    setIsLoading(false);
  };

  const fetchPackages = async () => {
    const { data } = await supabase
      .from('subscription_packages')
      .select('id, name, duration_months, price')
      .eq('is_active', true)
      .order('display_order');
    
    if (data) setPackages(data);
  };

  const fetchGeneratedVouchers = async (resellerId: string) => {
    const { data } = await supabase
      .from('voucher_codes')
      .select(`
        *,
        subscription_packages (name, duration_months)
      `)
      .eq('reseller_id', resellerId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setGeneratedVouchers(data);
  };

  const handleGenerateVouchers = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!generateForm.package_id) {
      alert('Pilih paket terlebih dahulu!');
      return;
    }

    if (generateForm.quantity > reseller.token_balance) {
      alert(`Token tidak cukup! Sisa token Anda: ${reseller.token_balance}`);
      return;
    }

    if (generateForm.quantity < 1 || generateForm.quantity > 200) {
      alert('Jumlah harus antara 1-200!');
      return;
    }

    try {
      const codesToInsert = [];
      for (let i = 0; i < generateForm.quantity; i++) {
        const uniqueCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        const finalCode = `${reseller.reseller_code}-${uniqueCode}`;
        
        codesToInsert.push({
          reseller_id: reseller.id,
          package_id: generateForm.package_id,
          code: finalCode,
          type: 'free',
          value: 0,
          max_uses: 1,
          current_uses: 0,
          is_active: true,
          voucher_category: generateForm.voucher_category
        });
      }

      const { error: insertError } = await supabase
        .from('voucher_codes')
        .insert(codesToInsert);

      if (insertError) throw insertError;

      // Kurangi token balance
      const newBalance = reseller.token_balance - generateForm.quantity;
      await supabase
        .from('resellers')
        .update({ token_balance: newBalance })
        .eq('id', reseller.id);

      alert(`✅ Berhasil generate ${generateForm.quantity} voucher!\nToken tersisa: ${newBalance}`);
      
      setReseller({...reseller, token_balance: newBalance});
      fetchGeneratedVouchers(reseller.id);
      setGenerateForm({ ...generateForm, quantity: 1 });
    } catch (err: any) {
      alert('Gagal generate: ' + err.message);
    }
  };

  const handleSaveCheckoutLink = async () => {
    const { error } = await supabase
      .from('resellers')
      .update({ checkout_link: checkoutLink })
      .eq('id', reseller.id);
    
    if (error) {
      alert('Gagal update: ' + error.message);
    } else {
      setReseller({...reseller, checkout_link: checkoutLink});
      alert('✅ Link checkout berhasil diupdate!');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/reseller-login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Dashboard Reseller</h1>
            <p className="text-sm text-slate-500">
              Kode: <span className="font-mono font-bold text-purple-600">{reseller?.reseller_code}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href={`/r/${reseller?.reseller_code}`} 
              target="_blank"
              className="text-sm text-purple-600 hover:underline"
            >
              Lihat Home Page →
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'generate', label: '🎁 Generate Voucher' },
            { id: 'vouchers', label: '📋 Daftar Voucher' },
            { id: 'settings', label: '⚙️ Pengaturan' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="text-sm text-slate-500 mb-1">Token Tersisa</div>
                <div className={`text-3xl font-bold ${
                  reseller.token_balance > 10 ? 'text-green-600' : 
                  reseller.token_balance > 0 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {reseller.token_balance}
                </div>
                <div className="text-xs text-slate-500 mt-1">1 token = 1 voucher</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="text-sm text-slate-500 mb-1">Total Voucher Dibuat</div>
                <div className="text-3xl font-bold text-slate-800">
                  {generatedVouchers.length}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="text-sm text-slate-500 mb-1">Kode Reseller</div>
                <div className="text-3xl font-bold text-purple-600 font-mono">
                  {reseller?.reseller_code}
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h3 className="font-bold text-purple-800 mb-2">🎟️ Cara Kerja Token</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Setiap 1 token = 1 voucher yang bisa di-generate</li>
                <li>• Anda bebas memilih paket apa saja saat generate</li>
                <li>• Token akan berkurang otomatis setiap kali generate</li>
                <li>• Hubungi admin jika token habis untuk penambahan</li>
              </ul>
            </div>

            {/* Home Page Link */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-3"> Home Page Reseller</h3>
              <p className="text-sm text-slate-600 mb-3">
                Home page Anda dapat diakses di:
              </p>
              <a 
                href={`/r/${reseller?.reseller_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200"
              >
                klinikcpns.com/r/{reseller?.reseller_code} →
              </a>
            </div>
          </div>
        )}

        {/* TAB: GENERATE */}
        {activeTab === 'generate' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">🎁 Generate Voucher Baru</h3>
                <div className="text-sm">
                  Token: <span className="font-bold text-purple-600">{reseller.token_balance}</span>
                </div>
              </div>
              
              <form onSubmit={handleGenerateVouchers} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Paket *</label>
                  <select
                    value={generateForm.package_id}
                    onChange={(e) => setGenerateForm({...generateForm, package_id: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                    required
                  >
                    <option value="">-- Pilih Paket --</option>
                    {packages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - {pkg.duration_months === 999 ? 'Lifetime' : `${pkg.duration_months} Bulan`} - Rp {(pkg.price || 0).toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Voucher *</label>
                  <select
                    value={generateForm.voucher_category}
                    onChange={(e) => setGenerateForm({...generateForm, voucher_category: e.target.value as any})}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                  >
                    <option value="activation">🎟️ Voucher Masa Aktif (Gratis Akses)</option>
                    <option value="discount">💰 Voucher Diskon Harga</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah (1-200) *</label>
                  <input
                    type="number"
                    min="1"
                    max={Math.min(200, reseller.token_balance)}
                    value={generateForm.quantity}
                    onChange={(e) => setGenerateForm({...generateForm, quantity: parseInt(e.target.value) || 1})}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Maksimal: {Math.min(200, reseller.token_balance)} (sesuai token tersisa)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={reseller.token_balance === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold py-3 rounded-lg"
                >
                  Generate Voucher ({generateForm.quantity} token)
                </button>
              </form>

              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>💡 Format Kode:</strong> {reseller?.reseller_code || 'XXXXX'}-XXXXX
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  Contoh: {reseller?.reseller_code || 'ABC12'}-K7X9P
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: VOUCHERS */}
        {activeTab === 'vouchers' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">📋 Daftar Voucher yang Sudah Digenerate</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold text-slate-600">Kode</th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-600">Paket</th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-600">Tipe</th>
                    <th className="p-4 text-center text-xs font-semibold text-slate-600">Status</th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-600">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {generatedVouchers.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono text-sm font-bold text-purple-600">
                        {v.code}
                      </td>
                      <td className="p-4 text-sm text-slate-800">
                        {v.subscription_packages?.name || '-'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          v.voucher_category === 'activation' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {v.voucher_category === 'activation' ? 'Masa Aktif' : 'Diskon'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          v.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {v.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {new Date(v.created_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                  {generatedVouchers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        Belum ada voucher yang digenerate
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4">⚙️ Pengaturan</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Link Checkout Custom</label>
                  <input
                    type="url"
                    value={checkoutLink}
                    onChange={(e) => setCheckoutLink(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                    placeholder="https://klinikcpns.com/checkout/..."
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Link ini akan digunakan di semua tombol pembelian di home page reseller Anda
                  </p>
                  <button
                    onClick={handleSaveCheckoutLink}
                    className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Simpan Link
                  </button>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-slate-800 mb-2">Informasi Reseller</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Nama:</span>
                      <span className="font-medium">{reseller.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Email:</span>
                      <span className="font-medium">{reseller.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Kode:</span>
                      <span className="font-mono font-bold text-purple-600">{reseller.reseller_code}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
