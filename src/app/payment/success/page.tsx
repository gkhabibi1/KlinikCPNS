'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

const supabase = createClient();

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const orderId = searchParams.get('order_id');
      if (!orderId) {
        setError('Order ID tidak ditemukan');
        setIsProcessing(false);
        return;
      }

      try {
        // 1. Verifikasi status pembayaran dari Midtrans
        const response = await fetch(`/api/midtrans/verify?order_id=${orderId}`);
        const data = await response.json();

        const isPaidStatus = data.status && ['paid', 'success', 'settlement'].includes(data.status.toLowerCase());

        if (isPaidStatus) {
          // 2. Update transaksi di database
          const { data: transaction } = await supabase
            .from('transactions')
            .select('user_id, duration, package_id, amount')
            .eq('unique_id', orderId)
            .single();

          if (transaction) {
            // 3. Update profil user dengan subscription baru
            let baseDate = new Date();

            const { data: profile } = await supabase
              .from('profiles')
              .select('subscription_valid_until')
              .eq('id', transaction.user_id)
              .single();

            if (profile?.subscription_valid_until) {
              const currentValidUntil = new Date(profile.subscription_valid_until);
              if (currentValidUntil > new Date()) {
                baseDate = currentValidUntil;
              }
            }

            if (transaction.duration === 999) {
              baseDate.setFullYear(2099);
            } else {
              baseDate.setMonth(baseDate.getMonth() + (transaction.duration || 1));
            }

            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                subscription_valid_until: baseDate.toISOString(),
                subscription_package_id: transaction.package_id
              })
              .eq('id', transaction.user_id);

            if (updateError) {
              console.error('Error updating profile:', updateError);
            }

            // 4. Update status transaksi
            await supabase
              .from('transactions')
              .update({ 
                status: 'paid',
                paid_at: new Date().toISOString()
              })
              .eq('unique_id', orderId);
          }

          // 5. Redirect ke dashboard setelah 3 detik
          setTimeout(() => {
            // Force refresh untuk memastikan data terbaru
            window.location.href = '/dashboard';
          }, 3000);
        } else {
          setError('Pembayaran belum terverifikasi');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Gagal memverifikasi pembayaran');
      } finally {
        setIsProcessing(false);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memverifikasi pembayaran...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Pembayaran Gagal</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-xl p-8 max-w-md text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Pembayaran Berhasil!</h2>
        <p className="text-slate-600 mb-6">
          Akun Anda telah diaktifkan. Anda akan diarahkan ke dashboard dalam 3 detik...
        </p>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Klik di sini jika tidak otomatis redirect
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memverifikasi pembayaran...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
