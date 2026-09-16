'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { generateDynamicQRIS } from '@/lib/qrisHelper';
import QRCode from 'qrcode';
import Link from 'next/link';

const supabase = createClient();

export default function PaymentQRISPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.order_id as string;

  const [tx, setTx] = useState<any>(null);
  const [packageData, setPackageData] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State upload bukti bayar
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copiedNominal, setCopiedNominal] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchTransaction = async () => {
      try {
        setIsLoading(true);

        // Periksa apakah orderId berbentuk UUID atau String TRX/QRIS
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

        let query = supabase.from('transactions').select('*');
        if (isUuid) {
          query = query.or(`unique_id.eq.${orderId},id.eq.${orderId}`);
        } else {
          query = query.eq('unique_id', orderId);
        }

        const { data: transaction, error } = await query.maybeSingle();

        if (error || !transaction) {
          console.error('Fetch transaction error:', error);
          alert('Pesanan tidak ditemukan');
          router.push('/dashboard');
          return;
        }

        setTx(transaction);

        // Ambil data paket langganan secara terpisah agar aman dari error foreign key
        if (transaction.package_id) {
          const { data: pkg } = await supabase
            .from('subscription_packages')
            .select('*')
            .eq('id', transaction.package_id)
            .maybeSingle();

          if (pkg) setPackageData(pkg);
        }

        if (transaction.payment_proof_url) {
          setPreviewUrl(transaction.payment_proof_url);
          setUploadSuccess(true);
        }

        // Generate QR Code dari qris_payload (atau fallback generate on the fly)
        let payload = transaction.qris_payload;
        if (!payload) {
          const totalAmount = Number(transaction.total_amount || transaction.amount || 0);
          payload = generateDynamicQRIS(totalAmount);
        }

        if (payload) {
          const url = await QRCode.toDataURL(payload, {
            width: 340,
            margin: 2,
            color: {
              dark: '#0f172a',
              light: '#ffffff'
            }
          });
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error('Error fetching QRIS page data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [orderId, router]);

  // Realtime countdown timer
  useEffect(() => {
    if (!tx?.expired_at) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const exp = new Date(tx.expired_at).getTime();
      const diff = exp - now;

      if (diff <= 0) {
        setTimeLeft('Waktu pembayaran habis');
        setIsExpired(true);
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tx?.expired_at]);

  const handleCopy = (text: string, type: 'nominal' | 'orderId') => {
    navigator.clipboard.writeText(text);
    if (type === 'nominal') {
      setCopiedNominal(true);
      setTimeout(() => setCopiedNominal(false), 2000);
    } else {
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QRIS-${orderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadSuccess(false);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile) {
      alert('Silakan pilih file bukti transfer terlebih dahulu');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('file', selectedFile);

      const res = await fetch('/api/payment/upload-proof', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengunggah bukti pembayaran');
      }

      setUploadSuccess(true);
      setTx((prev: any) => ({
        ...prev,
        status: 'waiting_verification',
        payment_proof_url: data.proof_url
      }));

      alert('✅ Bukti pembayaran berhasil diunggah! Admin kami akan memverifikasinya dalam 1x24 jam.');
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah bukti pembayaran');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-sans">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Menyiapkan QRIS Dinamis...</p>
        </div>
      </div>
    );
  }

  if (!tx) return null;

  const totalAmount = Number(tx.total_amount || tx.amount || 0);
  const baseAmount = Number(tx.base_amount || (totalAmount - (tx.unique_code || 0)));
  const uniqueCode = Number(tx.unique_code || 0);

  const isPaid = ['paid', 'success', 'settlement'].includes((tx.status || '').toLowerCase());
  const isWaitingVerification = tx.status === 'waiting_verification';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src="https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png"
              alt="Klinik CPNS"
              className="h-9 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Pembayaran QRIS Dinamis</h1>
              <p className="text-xs text-slate-400">Merchant Resmi: TOKO JUALANDIGITAL ID (Klinik CPNS)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPaid ? (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                ✓ Lunas / Aktif
              </span>
            ) : isWaitingVerification ? (
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Menunggu Verifikasi Admin
              </span>
            ) : isExpired ? (
              <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Kedaluwarsa
              </span>
            ) : (
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                Menunggu Pembayaran
              </span>
            )}
          </div>
        </div>

        {/* Status Alert Banner */}
        {isPaid ? (
          <div className="mt-6 bg-emerald-950/60 border border-emerald-700/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
              ✓
            </div>
            <h2 className="text-xl font-bold text-emerald-300 mb-1">Pembayaran Terverifikasi!</h2>
            <p className="text-sm text-emerald-200/80 mb-4">
              Paket langganan Anda telah diaktifkan oleh admin. Anda dapat langsung mengakses semua try out dan materi.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
            >
              Menuju Dashboard Member →
            </Link>
          </div>
        ) : isWaitingVerification ? (
          <div className="mt-6 bg-amber-950/40 border border-amber-600/40 rounded-2xl p-5 flex items-start gap-4">
            <div className="text-2xl mt-0.5">⏳</div>
            <div>
              <h3 className="font-bold text-amber-300 text-base mb-1">Bukti Transfer Berhasil Diunggah!</h3>
              <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                Terima kasih! Bukti transfer Anda sudah tersimpan di sistem kami. Admin akan memverifikasi pembayaran Anda dalam kurun waktu <strong>1x24 jam</strong>. Anda juga dapat memantau status pesanan kapan saja melalui menu <strong>Riwayat Pembelian</strong> di Dashboard.
              </p>
              <div className="mt-3 flex gap-3">
                <Link
                  href="/dashboard/orders"
                  className="inline-flex items-center text-xs font-semibold text-amber-300 hover:text-amber-200 underline"
                >
                  Lihat Riwayat Pembelian →
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {/* Main 2-Column Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: QRIS Code & Countdown */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl">
            {/* Timer countdown */}
            <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-5">
              <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider font-medium">
                Sisa Waktu Pembayaran
              </span>
              <div className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
                {timeLeft || '23:59:59'}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Batas bayar 1x24 jam</span>
            </div>

            {/* QR Box */}
            <div className="relative p-3 bg-white rounded-2xl shadow-md border-4 border-slate-700/50 group">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QRIS Dinamis"
                  className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-lg"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-slate-400 text-xs">
                  Memuat QR...
                </div>
              )}

              {/* Watermark Logo QRIS */}
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between px-2 text-[10px] text-slate-600 font-semibold">
                <span>QRIS Standard EMVCo</span>
                <span className="text-blue-600">SpeedCash</span>
              </div>
            </div>

            {/* Button Unduh QR */}
            <button
              onClick={handleDownloadQR}
              disabled={!qrDataUrl || isExpired}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-700 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Unduh Gambar QRIS
            </button>

            <p className="text-[11px] text-slate-500 mt-3 leading-tight">
              Dapat di-scan melalui BCA Mobile, Livin Mandiri, BRImo, BNI Mobile, GoPay, OVO, Dana, ShopeePay, LinkAja, dsb.
            </p>
          </div>

          {/* Kolom Kanan: Rincian Nominal & Form Bukti Transfer */}
          <div className="lg:col-span-7 space-y-6">
            {/* Box Rincian Tagihan */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <span className="text-xs text-slate-400">Order ID:</span>
                  <div className="font-mono text-sm font-semibold text-slate-200 flex items-center gap-2">
                    {orderId}
                    <button
                      onClick={() => handleCopy(orderId, 'orderId')}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      {copiedOrderId ? '✓ Tersalin' : 'Salin'}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Paket:</span>
                  <div className="text-sm font-bold text-white">
                    {packageData?.name || 'Paket Try Out'}
                  </div>
                </div>
              </div>

              {/* Rincian Harga */}
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Harga Paket:</span>
                  <span>Rp {baseAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-amber-400 font-medium bg-amber-950/20 px-2 py-1 rounded-lg">
                  <span className="flex items-center gap-1">
                    Kode Unik Identifikasi:
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">Otomatis</span>
                  </span>
                  <span>+Rp {uniqueCode.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Total Wajib Transfer */}
              <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950/60 -mx-6 -mb-6 p-6 rounded-b-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
                      Total Nominal Transfer (Wajib Sama)
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                      Rp {totalAmount.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(totalAmount.toString(), 'nominal')}
                    className="self-start sm:self-center px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    {copiedNominal ? '✓ Nominal Tersalin' : 'Salin Nominal'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  ⚠️ <strong className="text-slate-200">Penting:</strong> Nominal pada QRIS Dinamis sudah terkunci otomatis ke <strong>Rp {totalAmount.toLocaleString('id-ID')}</strong>. Jika Anda mentransfer manual, pastikan nominal persis hingga 3 digit terakhir untuk mempercepat verifikasi admin.
                </p>
              </div>
            </div>

            {/* Box Upload Bukti Transfer */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>📸</span> Unggah Bukti Transfer
                </h3>
                {uploadSuccess && (
                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    ✓ Bukti Sudah Terunggah
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Setelah melakukan transfer/scan QRIS, silakan unggah foto tangkapan layar (screenshot) bukti pembayaran Anda di bawah ini:
              </p>

              {/* Area Preview File */}
              {previewUrl ? (
                <div className="relative mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-4">
                  <img
                    src={previewUrl}
                    alt="Bukti Transfer"
                    className="w-20 h-20 object-cover rounded-lg border border-slate-700 cursor-pointer"
                    onClick={() => window.open(previewUrl, '_blank')}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {selectedFile ? selectedFile.name : 'Bukti_Transfer.jpg'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Tersimpan di sistem'}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                      >
                        Ganti Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => window.open(previewUrl, '_blank')}
                        className="text-xs text-slate-400 hover:text-slate-300"
                      >
                        Lihat Ukuran Penuh ↗
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-950/40 rounded-xl p-6 text-center cursor-pointer transition-all mb-4"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-300 block">
                    Klik untuk memilih foto bukti transfer
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Format: JPG, PNG, WEBP (Maksimal 5MB)
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Tombol Aksi Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleUploadProof}
                  disabled={!selectedFile || isUploading}
                  className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Mengunggah Bukti...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Bukti Pembayaran</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>

                <Link
                  href="/dashboard/orders"
                  className="w-full sm:w-auto py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold text-center border border-slate-700 transition-all"
                >
                  Riwayat Pembelian
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Petunjuk Cara Pembayaran */}
        <div className="mt-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span>💡</span> Panduan Langkah Pembayaran QRIS Dinamis:
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400 leading-relaxed">
            <li>Buka aplikasi Mobile Banking (BCA, Mandiri, BRI, BNI) atau E-Wallet (GoPay, OVO, Dana, ShopeePay, LinkAja).</li>
            <li>Pilih menu <strong>Bayar / Scan QRIS</strong> lalu arahkan kamera ke kode QR di atas (atau unggah dari galeri jika mengunduh gambar QR).</li>
            <li>Periksa nama penerima merchant: <strong>TOKO JUALANDIGITAL ID (Wonogiri)</strong>.</li>
            <li>Nominal tagihan sebesar <strong>Rp {totalAmount.toLocaleString('id-ID')}</strong> akan terisi secara otomatis tanpa perlu Anda ketik.</li>
            <li>Konfirmasi pembayaran dan selesaikan transaksi dengan PIN Anda.</li>
            <li>Ambil tangkapan layar (screenshot) bukti transfer, lalu unggah pada kolom di atas agar admin memverifikasi akun Anda.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
