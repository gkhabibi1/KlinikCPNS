'use client';

import React, { useState, useEffect } from 'react';

export interface AdminResellerPackage {
  id: string;
  name: string;
  price: number;
  token_amount: number;
  description: string;
  badge?: string;
  is_active: boolean;
}

export interface AdminResellerOrder {
  order_id: string;
  package_name: string;
  token_amount: number;
  total_amount: number;
  full_name: string;
  email: string;
  phone_number: string;
  notes?: string;
  status: 'pending' | 'waiting_verification' | 'paid' | 'cancelled';
  payment_proof_url?: string;
  approved_reseller_code?: string;
  created_at: string;
}

interface AdminResellerSettingsProps {
  onApproveToCreateReseller: (prefill: {
    full_name: string;
    email: string;
    token_balance: number;
    order_id: string;
  }) => void;
}

export default function AdminResellerSettings({
  onApproveToCreateReseller,
}: AdminResellerSettingsProps) {
  const [packages, setPackages] = useState<AdminResellerPackage[]>([]);
  const [orders, setOrders] = useState<AdminResellerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form tambah/edit paket
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [pkgForm, setPkgForm] = useState({
    name: '',
    price: 0,
    token_amount: 10,
    description: '',
    badge: '',
    is_active: true,
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/reseller/orders?include_inactive=true');
      const data = await res.json();
      if (data.packages) setPackages(data.packages);
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error('Failed to load reseller settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const persistPackages = async (nextPackages: AdminResellerPackage[]) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/reseller/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_packages', packages: nextPackages }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan paket');
      setPackages(nextPackages);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan paket reseller');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgForm.name.trim() || pkgForm.price < 0 || pkgForm.token_amount < 1) {
      alert('Nama paket, harga, dan jumlah token (min. 1) wajib valid.');
      return;
    }

    let next: AdminResellerPackage[];
    if (editingPkgId) {
      next = packages.map((p) =>
        p.id === editingPkgId ? { ...p, ...pkgForm, name: pkgForm.name.trim() } : p
      );
    } else {
      next = [
        ...packages,
        {
          id: `rsl-${Date.now()}`,
          name: pkgForm.name.trim(),
          price: Number(pkgForm.price),
          token_amount: Number(pkgForm.token_amount),
          description: pkgForm.description.trim(),
          badge: pkgForm.badge.trim(),
          is_active: pkgForm.is_active,
        },
      ];
    }

    await persistPackages(next);
    setEditingPkgId(null);
    setPkgForm({
      name: '',
      price: 0,
      token_amount: 10,
      description: '',
      badge: '',
      is_active: true,
    });
    alert('✅ Pengaturan paket reseller berhasil disimpan!');
  };

  const handleEditPackage = (pkg: AdminResellerPackage) => {
    setEditingPkgId(pkg.id);
    setPkgForm({
      name: pkg.name,
      price: pkg.price,
      token_amount: pkg.token_amount,
      description: pkg.description || '',
      badge: pkg.badge || '',
      is_active: pkg.is_active,
    });
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Hapus paket reseller ini?')) return;
    await persistPackages(packages.filter((p) => p.id !== id));
  };

  const handleTogglePackageActive = async (id: string) => {
    const next = packages.map((p) =>
      p.id === id ? { ...p, is_active: !p.is_active } : p
    );
    await persistPackages(next);
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: 'paid' | 'cancelled'
  ) => {
    const res = await fetch('/api/reseller/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, status }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? { ...o, status } : o))
      );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
        Memuat pengaturan paket &amp; order reseller...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bagian 1: Pengaturan Paket & Harga Checkout Reseller */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Paket &amp; Harga Checkout Reseller
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Atur paket &amp; harga yang tampil di halaman checkout publik reseller:{' '}
              <a
                href="/reseller/checkout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 font-semibold hover:underline"
              >
                /reseller/checkout ↗
              </a>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-xl border p-4 flex flex-col justify-between ${
                pkg.is_active
                  ? 'border-slate-200 bg-slate-50/60'
                  : 'border-slate-200 bg-slate-100 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900 text-sm">
                    {pkg.name}
                  </span>
                  {pkg.badge && (
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      {pkg.badge}
                    </span>
                  )}
                </div>
                <p className="text-lg font-extrabold text-purple-700">
                  Rp {pkg.price?.toLocaleString('id-ID')}
                </p>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                  Dapat {pkg.token_amount} Token Voucher
                </p>
                {pkg.description && (
                  <p className="text-xs text-slate-500 mt-1.5">{pkg.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleEditPackage(pkg)}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePackageActive(pkg.id)}
                  className="text-xs font-semibold text-slate-600 hover:underline cursor-pointer"
                >
                  {pkg.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePackage(pkg.id)}
                  className="text-xs font-semibold text-red-600 hover:underline ml-auto cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Form Tambah / Edit Paket Reseller */}
        <form
          onSubmit={handleSavePackage}
          className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {editingPkgId ? 'Edit Paket Reseller' : '+ Tambah Paket Reseller Baru'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Nama Paket (mis. Paket Starter)"
              value={pkgForm.name}
              onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              required
            />
            <input
              type="number"
              placeholder="Harga (Rp)"
              value={pkgForm.price || ''}
              onChange={(e) =>
                setPkgForm({ ...pkgForm, price: parseInt(e.target.value, 10) || 0 })
              }
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              required
            />
            <input
              type="number"
              placeholder="Jumlah Token"
              min={1}
              value={pkgForm.token_amount || ''}
              onChange={(e) =>
                setPkgForm({
                  ...pkgForm,
                  token_amount: parseInt(e.target.value, 10) || 1,
                })
              }
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              required
            />
            <input
              type="text"
              placeholder="Badge (opsional, mis. Terlaris)"
              value={pkgForm.badge}
              onChange={(e) => setPkgForm({ ...pkgForm, badge: e.target.value })}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Deskripsi singkat paket"
              value={pkgForm.description}
              onChange={(e) =>
                setPkgForm({ ...pkgForm, description: e.target.value })
              }
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            />
            <div className="flex gap-2">
              {editingPkgId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPkgId(null);
                    setPkgForm({
                      name: '',
                      price: 0,
                      token_amount: 10,
                      description: '',
                      badge: '',
                      is_active: true,
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg bg-white hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer"
              >
                {isSaving
                  ? 'Menyimpan...'
                  : editingPkgId
                  ? 'Simpan Perubahan'
                  : 'Tambah Paket'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Bagian 2: Order Masuk dari /reseller/checkout */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Order Pendaftaran Reseller Masuk
            </h3>
            <p className="text-xs text-slate-500">
              Setelah calon reseller bayar, tandai Lunas lalu klik &ldquo;Buat Akun Reseller&rdquo; untuk memberi akses login.
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="text-xs font-semibold text-purple-600 hover:underline cursor-pointer"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <tr>
                <th className="p-4">Order &amp; Tanggal</th>
                <th className="p-4">Calon Reseller</th>
                <th className="p-4">Paket</th>
                <th className="p-4">Total Bayar</th>
                <th className="p-4">Bukti</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-mono text-xs font-bold text-slate-800">
                      {order.order_id}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">
                      {order.full_name}
                    </div>
                    <div className="text-xs text-slate-500">{order.email}</div>
                    <div className="text-xs text-emerald-700">{order.phone_number}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800">
                      {order.package_name}
                    </div>
                    <div className="text-xs text-purple-600 font-semibold">
                      {order.token_amount} Token
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    Rp {order.total_amount?.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4">
                    {order.payment_proof_url ? (
                      <a
                        href={order.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Lihat Bukti ↗
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Belum upload</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : order.status === 'waiting_verification'
                          ? 'bg-amber-100 text-amber-700'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {order.status !== 'paid' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateOrderStatus(order.order_id, 'paid')
                          }
                          className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2.5 py-1 rounded font-semibold cursor-pointer"
                        >
                          Tandai Lunas
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          onApproveToCreateReseller({
                            full_name: order.full_name,
                            email: order.email,
                            token_balance: order.token_amount,
                            order_id: order.order_id,
                          })
                        }
                        className="text-xs bg-purple-600 text-white hover:bg-purple-700 px-2.5 py-1 rounded font-semibold cursor-pointer"
                      >
                        Buat Akun Reseller
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Belum ada order pendaftaran reseller masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
