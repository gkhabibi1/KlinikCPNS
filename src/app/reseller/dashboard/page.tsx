'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

const supabase = createClient();

export default function ResellerDashboard() {
  const router = useRouter();
  const [reseller, setReseller] = useState<any>(null);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [generatedVouchers, setGeneratedVouchers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'generate' | 'vouchers' | 'settings'>('overview');
  
  // Form generate voucher
  const [generateForm, setGenerateForm] = useState({
    package_id: '',
    quantity: 1,
    voucher_category: 'activation' as 'discount' | 'activation'
  });

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
    fetchAllocations(resellerData.id);
    fetchGeneratedVouchers(resellerData.id);
    setIsLoading(false);
  };

  const fetchAllocations = async (resellerId: string) => {
    const { data } = await supabase
      .from('reseller_voucher_allocations')
      .select(`
        *,
        subscription_packages (name, duration_months, price)
      `)
      .eq('reseller_id', resellerId);
    
    if (data) setAllocations(data);
  };

  const fetchGeneratedVouchers = async (resellerId: string) => {
    const { data } = await supabase
      .from('voucher_codes')
      .select(`
        *,
        subscription_packages (name)
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

    // Cek quota
    const allocation = allocations.find(a => a.package_id === generateForm.package_id);
    if (!allocation) {
      alert('Anda tidak memiliki alokasi untuk paket ini!');
      return;
    }

    if (generateForm.quantity > allocation.remaining_quota) {
      alert(`Quota tersisa hanya ${allocation.remaining_quota} voucher!`);
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
          batch_id: null,
          reseller_id: reseller.id,
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

      // Update quota
      await supabase
        .from('reseller_voucher_allocations')
        .update({
          used_quota: allocation.used_quota + generateForm.quantity,
          remaining_quota: allocation.remaining_quota - generateForm.quantity
        })
        .eq('id', allocation.id);

      alert(`✅ Berhasil generate ${generateForm.quantity} voucher!`);
      fetchAllocations(reseller.id);
      fetchGeneratedVouchers(reseller.id);
      setGenerateForm({ ...generateForm, quantity: 1 });
    } catch (err: any) {
      alert('Gagal generate: ' + err.message);
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
            <p className="text-sm text-slate-500">Kode: <span className="font-mono font-bold text-purple-600">{reseller?.reseller_code}</span></p>
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
                <div className="text-sm text-slate-500 mb-1">Total Voucher Digenerate</div>
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
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="text-sm text-slate-500 mb-1">Link Checkout</div>
                <div className="text-sm font-medium text-blue-600 truncate">
                  {reseller?.checkout_link || 'Belum diset'}
                </div>
              </div>
            </div>

            {/* Quota per Paket */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4">📦 Quota Voucher per Paket</h3>
              <div className="space-y-3">
                {allocations.map(alloc => (
                  <div key={alloc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-800">
                        {alloc.subscription_packages?.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {alloc.subscription_packages?.duration_months === 999 
                          ? 'Lifetime' 
                          : `${alloc.subscription_packages?.duration_months} Bulan`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="font-bold text-green-600">{alloc.remaining_quota}</span>
                        <span className="text-slate-500"> / {alloc.total_quota}</span>
                      </div>
                      <div className="text-xs text-slate-500">tersisa</div>
                    </div>
                  </div>
                ))}
                {allocations.length === 0 && (
                  <p className="text-center text-slate-500 py-4">Belum ada alokasi voucher</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: GENERATE */}
        {activeTab === 'generate' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4">🎁 Generate Voucher Baru</h3>
              
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
                    {allocations.filter(a => a.remaining_quota > 0).map(alloc => (
                      <option key={alloc.id} value={alloc.package_id}>
                        {alloc.subscription_packages?.name} (Sisa: {alloc.remaining_quota})
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
                    max="200"
                    value={generateForm.quantity}
                    onChange={(e) => setGenerateForm({...generateForm, quantity: parseInt(e.target.value) || 1})}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg"
                >
                  Generate Voucher
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
                      <td colSpan={4} className="p-8 text-center text-slate-500">
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
                    value={reseller?.checkout_link || ''}
                    onChange={async (e) => {
                      const { error } = await supabase
                        .from('resellers')
                        .update({ checkout_link: e.target.value })
                        .eq('id', reseller.id);
                      
                      if (error) {
                        alert('Gagal update: ' + error.message);
                      } else {
                        setReseller({...reseller, checkout_link: e.target.value});
                        alert('✅ Link berhasil diupdate!');
                      }
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                    placeholder="https://klinikcpns.com/checkout/..."
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Link ini akan digunakan di semua tombol pembelian di home page reseller
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-slate-800 mb-2">Home Page Reseller</h4>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
