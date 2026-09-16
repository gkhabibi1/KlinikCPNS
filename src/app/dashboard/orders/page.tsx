'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import MemberLayout from '@/components/MemberLayout';

const supabase = createClient();

export default function MemberOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Upload proof modal state
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      let { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          subscription_packages (name, duration_months)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback jika foreign key join belum aktif di database
        const { data: rawData, error: rawError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (rawError) throw rawError;

        const { data: pkgs } = await supabase
          .from('subscription_packages')
          .select('id, name, duration_months');

        const pkgMap = new Map((pkgs || []).map((p: any) => [p.id, p]));
        data = (rawData || []).map((t: any) => ({
          ...t,
          subscription_packages: pkgMap.get(t.package_id) || null
        }));
      }

      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching member orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openUploadModal = (order: any) => {
    setSelectedOrder(order);
    setUploadingOrderId(order.unique_id || order.id);
    setPreviewUrl(order.payment_proof_url || '');
    setSelectedFile(null);
    setFileError(null);
    setShowModal(true);
  };

  const MAX_FILE_SIZE = 500 * 1024; // 500 KB (512.000 bytes)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = Math.round(file.size / 1024);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const displaySize = file.size >= 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`Ukuran file bukti pembayaran (${displaySize}) melebihi batas maksimal 500 KB. Anda tidak dapat mengunggah file ini. Silakan kompres foto atau langsung kirimkan bukti bayar ke WhatsApp Admin kami di +62 851-9965-5534.`);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      alert(`⚠️ FILE TIDAK DAPAT DIUNGGAH!\n\nUkuran file Anda: ${displaySize}\nBatas maksimal: 500 KB\n\nSistem tidak akan memproses file yang melebihi 500 KB. Silakan kompres foto Anda atau kirimkan struk bukti transfer langsung ke WhatsApp Admin (+62 851-9965-5534).`);
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmitProof = async () => {
    if (!uploadingOrderId || !selectedFile) {
      alert('Silakan pilih file bukti transfer');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE || Boolean(fileError)) {
      const sizeKb = Math.round(selectedFile.size / 1024);
      const sizeMb = (selectedFile.size / (1024 * 1024)).toFixed(2);
      const displaySize = selectedFile.size >= 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

      alert(`⚠️ Tidak dapat diproses! Ukuran file (${displaySize}) melebihi batas 500 KB.\n\nSilakan kirimkan bukti pembayaran langsung ke WhatsApp Admin di +62 851-9965-5534.`);
      return;
    }

    try {
      setIsUploading(true);
      setFileError(null);
      const formData = new FormData();
      formData.append('order_id', uploadingOrderId);
      formData.append('file', selectedFile);

      const res = await fetch('/api/payment/upload-proof', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.error && (data.error.includes('500 KB') || data.code === 'FILE_TOO_LARGE')) {
          setFileError(data.error);
        }
        throw new Error(data.error || 'Gagal mengunggah bukti');
      }

      alert('✅ Bukti pembayaran berhasil diunggah! Admin kami akan memverifikasi dalam 1x24 jam.');
      setShowModal(false);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah bukti pembayaran');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (['paid', 'success', 'settlement'].includes(s)) {
      return (
        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          Aktif / Lunas
        </span>
      );
    }
    if (s === 'waiting_verification') {
      return (
        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
          Menunggu Verifikasi Admin
        </span>
      );
    }
    if (['failed', 'expired', 'cancel'].includes(s)) {
      return (
        <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold inline-flex items-center gap-1">
          Kedaluwarsa / Batal
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
        Menunggu Pembayaran
      </span>
    );
  };

  return (
    <MemberLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto font-sans">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Riwayat & Detail Pembelian</h1>
            <p className="text-slate-500 text-sm mt-1">
              Pantau status transaksi paket try out, unggah bukti bayar, dan verifikasi admin 1x24 jam.
            </p>
          </div>
          <Link
            href="/dashboard?tab=subscription"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            + Beli Paket Baru
          </Link>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div className="text-xs sm:text-sm text-blue-900 leading-relaxed">
              <strong>Catatan Verifikasi Admin (1x24 Jam):</strong> Setiap transaksi QRIS akan dicek dan diverifikasi oleh admin secara berkala dalam kurun waktu <strong>1x24 jam</strong> berdasarkan kecocokan kode unik nominal transaksi. Unggah bukti bayar bersifat <strong>opsional</strong> (tidak wajib).
            </div>
          </div>
          <a
            href="https://wa.me/6285199655534?text=Halo%20Admin%20KlinikCPNS,%20saya%20ingin%20menanyakan%20status%20transaksi%20pembelian%20paket%20saya"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <span>WhatsApp Admin</span>
            <span className="font-mono text-[11px] opacity-90">+62 851-9965-5534</span>
          </a>
        </div>

        {/* Orders Table / List */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 font-medium text-sm">Memuat riwayat pembelian...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📦
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Belum Ada Riwayat Transaksi</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Anda belum pernah melakukan pemesanan paket try out. Pilih paket untuk mulai belajar dan simulasi CAT CPNS.
            </p>
            <Link
              href="/dashboard?tab=subscription"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Lihat Pilihan Paket
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">ID Transaksi / Tanggal</th>
                    <th className="py-4 px-6">Paket & Durasi</th>
                    <th className="py-4 px-6">Total Tagihan</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Bukti Bayar</th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                    const total = Number(order.total_amount || order.amount || 0);
                    const uniqueCode = Number(order.unique_code || 0);
                    const isPending = (order.status || '').toLowerCase() === 'pending';
                    const isWaiting = (order.status || '').toLowerCase() === 'waiting_verification';
                    const isPaid = ['paid', 'success', 'settlement'].includes((order.status || '').toLowerCase());

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-mono text-xs font-bold text-slate-900">
                            {order.unique_id || order.id}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">
                            {order.subscription_packages?.name || 'Paket Try Out'}
                          </div>
                          <div className="text-xs text-slate-500">
                            Durasi: {order.duration === 999 ? 'Lifetime' : `${order.duration || 1} Bulan`}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 font-mono text-base">
                            Rp {total.toLocaleString('id-ID')}
                          </div>
                          {uniqueCode > 0 && (
                            <div className="text-[11px] text-amber-600 font-medium">
                              (Termasuk Kode Unik +{uniqueCode})
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          {getStatusBadge(order.status)}
                        </td>

                        <td className="py-4 px-6 text-center">
                          {order.payment_proof_url ? (
                            <button
                              type="button"
                              onClick={() => window.open(order.payment_proof_url, '_blank')}
                              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                            >
                              <span>🖼️</span> Lihat Foto
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Belum Ada</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Tombol Buka Halaman QRIS jika belum lunas */}
                            {!isPaid && (
                              <Link
                                href={`/checkout/payment/${order.unique_id || order.id}`}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1"
                              >
                                <span>📱</span> QRIS
                              </Link>
                            )}

                            {/* Tombol Upload / Ganti Bukti */}
                            {!isPaid && (
                              <button
                                onClick={() => openUploadModal(order)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  order.payment_proof_url
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm'
                                }`}
                              >
                                {order.payment_proof_url ? 'Ganti Bukti' : 'Unggah Bukti (Opsional)'}
                              </button>
                            )}

                            {isPaid && (
                              <span className="text-xs font-semibold text-emerald-600">
                                Sudah Aktif ✓
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL UPLOAD BUKTI TRANSFER */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>📸</span> Unggah Bukti Pembayaran <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Opsional</span>
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Order ID:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedOrder.unique_id || selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Transfer:</span>
                    <span className="font-bold text-amber-600">
                      Rp {Number(selectedOrder.total_amount || selectedOrder.amount || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {fileError && (
                  <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 shadow-sm">
                    <div className="flex items-start gap-2.5">
                      <span className="text-base shrink-0">⚠️</span>
                      <div className="flex-1">
                        <p className="font-semibold text-rose-700 leading-relaxed mb-2">
                          {fileError}
                        </p>
                        <a
                          href={`https://wa.me/6285199655534?text=${encodeURIComponent(
                            `Halo Admin KlinikCPNS, saya ingin mengirimkan bukti transfer pesanan:\n- Order ID: ${selectedOrder?.unique_id || selectedOrder?.id}\n(Karena ukuran file struk saya melebihi 500 KB)`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-sm transition-all"
                        >
                          <span>💬 Kirim Bukti ke WhatsApp Admin</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {previewUrl ? (
                  <div className={`border rounded-xl p-3 flex items-center gap-3 transition-all ${
                    fileError ? 'border-rose-300 bg-rose-50/70' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {selectedFile ? selectedFile.name : 'Bukti saat ini'}
                      </p>
                      {selectedFile && (
                        <p className={`text-[11px] mt-0.5 ${fileError ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                          {(selectedFile.size / 1024).toFixed(1)} KB {fileError ? '— ❌ Melebihi 500 KB' : ''}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-blue-600 hover:underline mt-1 font-medium block"
                      >
                        Pilih foto lain
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50/50 transition-all"
                  >
                    <div className="text-2xl mb-1">📁</div>
                    <p className="text-xs font-semibold text-slate-700">Klik untuk upload foto bukti transfer</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, WEBP (Maks. 500 KB)</p>
                    <p className="text-[10px] text-emerald-600 mt-1 font-medium">Lebih dari 500 KB? Bisa kirim via WhatsApp Admin</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSubmitProof}
                  disabled={!selectedFile || Boolean(fileError) || isUploading}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    fileError 
                      ? 'bg-rose-100 text-rose-600 border border-rose-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Mengunggah...</span>
                    </>
                  ) : fileError ? (
                    '🚫 File Melebihi 500 KB'
                  ) : (
                    'Kirim Bukti Pembayaran'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-all"
                >
                  Batal
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Butuh konfirmasi cepat?</span>
                <a
                  href={`https://wa.me/6285199655534?text=${encodeURIComponent(
                    `Halo Admin KlinikCPNS, saya ingin konfirmasi pesanan ID: ${selectedOrder.unique_id || selectedOrder.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1"
                >
                  <span>WA: +62 851-9965-5534</span> ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
