'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk form edit / tambah
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    benefits: [''], // Array string untuk daftar keuntungan
    is_active: true,
  });

  // 1. Ambil Data Paket dari Supabase
  const fetchPackages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching packages:', error);
    } else {
      setPackages(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // 2. Handler untuk mulai mengedit
  const handleEdit = (pkg: any) => {
    setEditingId(pkg.id);
    let parsedBenefits: string[] = [''];
    if (Array.isArray(pkg.benefits)) {
      parsedBenefits = pkg.benefits;
    } else if (typeof pkg.benefits === 'string') {
      try {
        parsedBenefits = JSON.parse(pkg.benefits);
      } catch {
        parsedBenefits = [pkg.benefits];
      }
    }

    setFormData({
      name: pkg.name || '',
      price: pkg.price || 0,
      description: pkg.description || '',
      benefits: parsedBenefits.length > 0 ? parsedBenefits : [''],
      is_active: pkg.is_active ?? true,
    });
  };

  // 3. Handler untuk membuat paket baru
  const handleAddNew = () => {
    setEditingId('new');
    setFormData({
      name: '',
      price: 0,
      description: '',
      benefits: [''],
      is_active: true,
    });
  };

  // 4. Handler untuk menghapus paket
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus paket "${name}"?\nTindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      // Hapus benefit terkait di subscription_benefits jika ada
      await supabase.from('subscription_benefits').delete().eq('package_id', id);

      // Hapus paket dari subscription_packages
      const { error } = await supabase
        .from('subscription_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert(`✅ Paket "${name}" berhasil dihapus!`);

      if (editingId === id) {
        setEditingId(null);
      }
      fetchPackages();
    } catch (err: any) {
      console.error('Error deleting package:', err);
      alert('Gagal menghapus paket: ' + (err.message || 'Terjadi kesalahan saat menghapus'));
    }
  };

  // 5. Handler untuk menyimpan perubahan (Create/Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    // Bersihkan array benefits dari string kosong
    const cleanBenefits = formData.benefits.filter((b) => b.trim() !== '');

    if (editingId === 'new') {
      // Create new package
      const { error } = await supabase
        .from('subscription_packages')
        .insert([{
          name: formData.name,
          price: formData.price,
          description: formData.description,
          benefits: cleanBenefits,
          is_active: formData.is_active,
        }]);

      if (error) {
        alert('Gagal menambah paket: ' + error.message);
      } else {
        alert('✅ Paket baru berhasil ditambahkan!');
        setEditingId(null);
        fetchPackages();
      }
    } else {
      // Update existing package
      const { error } = await supabase
        .from('subscription_packages')
        .update({
          name: formData.name,
          price: formData.price,
          description: formData.description,
          benefits: cleanBenefits,
          is_active: formData.is_active,
        })
        .eq('id', editingId);

      if (error) {
        alert('Gagal memperbarui paket: ' + error.message);
      } else {
        alert('✅ Paket berhasil diperbarui!');
        setEditingId(null);
        fetchPackages();
      }
    }
  };

  // Handler untuk mengelola input dinamis pada kolom "Benefits/Keuntungan"
  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const addBenefitRow = () => {
    setFormData({ ...formData, benefits: [...formData.benefits, ''] });
  };

  const removeBenefitRow = (index: number) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData({ ...formData, benefits: newBenefits.length > 0 ? newBenefits : [''] });
  };

  if (isLoading) return <div className="p-10 text-center text-slate-500 font-medium">Memuat data paket...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Paket Langganan</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola paket subscribe, harga, fitur, dan hapus paket yang sudah tidak digunakan.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm flex items-center gap-1.5"
        >
          <span>+</span> Tambah Paket Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI: Daftar Paket */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">Daftar Paket ({packages.length})</h2>
          {packages.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
              Belum ada paket langganan. Klik "Tambah Paket Baru" untuk membuat paket.
            </div>
          ) : (
            packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`bg-white p-5 rounded-xl shadow-sm border transition-all ${
                  editingId === pkg.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-800">{pkg.name}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="text-blue-600 font-bold text-lg mb-2">Rp {Number(pkg.price).toLocaleString('id-ID')}</p>
                <p className="text-sm text-slate-500 mb-4">{pkg.description || 'Tidak ada keterangan'}</p>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => handleEdit(pkg)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
                  >
                    ✏️ Edit Paket
                  </button>
                  <button 
                    onClick={() => handleDelete(pkg.id, pkg.name)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition border border-red-200 flex items-center gap-1.5"
                    title="Hapus paket ini"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* KOLOM KANAN: Form Edit / Tambah */}
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            {editingId === 'new' ? '✨ Tambah Paket Baru' : editingId ? '📝 Edit Paket' : 'Pilih paket untuk diedit atau buat paket baru'}
          </h2>
          
          {editingId ? (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Paket *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Contoh: Paket Premium 3 Bulan"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rp) *</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  placeholder="150000"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan Singkat</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Deskripsi singkat paket..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Apa saja yang didapatkan? (Benefits)</label>
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      value={benefit}
                      onChange={(e) => handleBenefitChange(index, e.target.value)}
                      placeholder={`Keuntungan ${index + 1}`}
                      className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm"
                    />
                    {formData.benefits.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeBenefitRow(index)}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addBenefitRow}
                  className="text-sm text-blue-600 font-semibold hover:underline mt-1 flex items-center gap-1"
                >
                  + Tambah Keuntungan
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Paket Aktif (Ditampilkan ke member)
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition shadow-md"
                >
                  {editingId === 'new' ? 'Simpan Paket Baru' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-10 text-center text-slate-500">
              Pilih salah satu paket di sebelah kiri untuk mengedit, atau klik tombol <strong>"+ Tambah Paket Baru"</strong> di atas.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
