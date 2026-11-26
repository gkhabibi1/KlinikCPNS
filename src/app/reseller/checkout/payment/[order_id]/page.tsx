'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  MessageCircle,
  Upload,
} from 'lucide-react';

export default function ResellerPaymentPage() {
  const params = useParams();
  const orderId = params.order_id as string;

  const [order, setOrder] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedNominal, setCopiedNominal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `/api/reseller/orders?order_id=${encodeURIComponent(orderId)}`
        );
        const data = await res.json();
        if (!res.ok || !data.order) {
          setOrder(null);
          return;
        }
        setOrder(data.order);
        if (data.order.payment_proof_url) {
          setPreviewUrl(data.order.payment_proof_url);
          setUploadSuccess(true);
        }
        if (data.order.qris_payload) {
          const url = await QRCode.toDataURL(data.order.qris_payload, {
            width: 340,
            margin: 2,
            color: { dark: '#0f172a', light: '#ffffff' },
          });
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error('Error loading reseller payment:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleCopyNominal = () => {
    if (!order) return;
    navigator.clipboard.writeText(String(order.total_amount));
    setCopiedNominal(true);
    setTimeout(() => setCopiedNominal(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QRIS-RESELLER-${orderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert(
        'Ukuran foto melebihi 500 KB. Silakan kompres atau kirim langsung ke WhatsApp Admin (+62 851-9965-5534).'
      );
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadSuccess(false);
  };

  const handleUploadProof = async () => {
    if (!selectedFile) {
      alert('Pilih file bukti transfer terlebih dahulu.');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('file', selectedFile);

      const res = await fetch('/api/reseller/orders', {
        method: 'PATCH',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengunggah bukti transfer');
      }
      setUploadSuccess(true);
      setOrder((prev: any) => ({
        ...prev,
        status: 'waiting_verification',
        payment_proof_url: data.proof_url,
      }));
      alert(
        '✅ Bukti transfer berhasil diunggah! Admin akan memverifikasi dan mengirimkan akses login Reseller Anda.'
      );
    } catch (err: any) {
      alert(err.message || 'Gagal upload bukti transfer');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-11 w-11 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Order Reseller Tidak Ditemukan
          </h2>
          <p className="text-sm text-slate-600 mb-5">
            Pastikan link pembayaran benar atau buat pesanan baru.
          </p>
          <Link
            href="/reseller/checkout"
            className="inline-block bg-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
          >
            Kembali ke Checkout Reseller
          </Link>
        </div>
      </div>
    );
  }

  const waText = encodeURIComponent(
    `Halo Admin KlinikCPNS, saya sudah order Paket Reseller (${order.package_name}) atas nama ${order.full_name} (${order.email}) dengan Order ID ${order.order_id} sebesar Rp ${order.total_amount.toLocaleString('id-ID')}. Mohon verifikasi dan kirimkan akses login reseller.`
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                Pembayaran Reseller
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">
                {order.package_name} ({order.token_amount} Token)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Order ID: {order.order_id}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.status === 'paid'
                  ? 'bg-emerald-100 text-emerald-700'
                  : order.status === 'waiting_verification'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {order.status === 'paid'
                ? 'Lunas'
                : order.status === 'waiting_verification'
                ? 'Menunggu Verifikasi'
                : 'Menunggu Pembayaran'}
            </span>
          </div>

          {/* Nominal + Kode Unik */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-purple-800">
                Total Transfer QRIS (termasuk kode unik {order.unique_code})
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 mt-0.5">
                Rp {order.total_amount?.toLocaleString('id-ID')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyNominal}
              className="inline-flex items-center gap-1.5 bg-white border border-purple-200 text-purple-700 text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-purple-100 transition cursor-pointer"
            >
              {copiedNominal ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedNominal ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>

          {/* QR Code */}
          {qrDataUrl && (
            <div className="flex flex-col items-center mb-6">
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <img src={qrDataUrl} alt="QRIS Pembayaran Reseller" className="w-56 h-56" />
              </div>
              <button
                type="button"
                onClick={handleDownloadQR}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-purple-700 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download QRIS</span>
              </button>
            </div>
          )}

          {/* Upload Bukti Bayar */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Upload Bukti Pembayaran (Maks. 500 KB)
            </h2>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-64 flex justify-center bg-slate-50">
                <img
                  src={previewUrl}
                  alt="Bukti transfer"
                  className="max-h-64 object-contain"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm py-2.5 px-4 rounded-xl cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{selectedFile ? 'Ganti Foto Bukti' : 'Pilih Foto Bukti'}</span>
              </button>

              {selectedFile && !uploadSuccess && (
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleUploadProof}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-sm py-2.5 px-4 rounded-xl cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isUploading ? 'Mengunggah...' : 'Kirim Bukti Bayar'}</span>
                </button>
              )}
            </div>

            <a
              href={`https://wa.me/6285199655534?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-xl transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Konfirmasi ke WhatsApp Admin</span>
            </a>

            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Setelah pembayaran diverifikasi, Admin akan mengirimkan Email &amp; Password sementara untuk login di{' '}
              <Link href="/reseller-login" className="text-purple-700 font-semibold underline">
                /reseller-login
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
