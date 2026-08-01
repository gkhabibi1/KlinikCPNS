'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import Script from 'next/script';

interface SnapOptions {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
}

interface Snap {
  pay: (token: string, options: SnapOptions) => void;
}

declare global {
  interface Window {
    snap?: Snap;
  }
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  created_at?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snapReady, setSnapReady] = useState(false);

  // 1. Ambil data user & daftar paket
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUser(user);

      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('duration_months', { ascending: true });

      if (plansData) {
        setPlans(plansData);
        // Default pilih paket 3 bulan (paling populer)
        setSelectedPlan(plansData.find((p: any) => p.duration_months === 3) || plansData[0]);
      }
    };
    loadData();
  }, [router]);

  // 2. Handle klik tombol "Bayar Sekarang"
  const handlePay = async () => {
    if (!selectedPlan || !user) return;
    setIsProcessing(true);

    // Generate Order ID unik
    const orderId = `TRX-${Date.now()}`;

    try {
      const res = await fetch('/api/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.full_name || 'Peserta',
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          amount: selectedPlan.price,
          order_id: orderId,
        }),
      });

      const result = await res.json();

      if (result.success && window.snap) {
        // Tampilkan pop-up pembayaran Midtrans
        window.snap.pay(result.token, {
          onSuccess: async () => {
            alert('Pembayaran berhasil! ✅');
            router.push('/dashboard');
          },
          onPending: () => {
            alert('Pembayaran sedang diproses. Silakan cek status di dashboard.');
            router.push('/dashboard');
          },
          onError: () => {
            alert('Pembayaran gagal. Silakan coba lagi.');
            setIsProcessing(false);
          },
          onClose: () => {
            setIsProcessing(false);
          },
        });
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Muat Snap.js dari Midtrans */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
        onReady={() => setSnapReady(true)}
      />

      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 border-t-8 border-blue-600">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Perpanjang Langganan</h1>
          <p className="text-slate-500 text-sm mb-6">
            Pilih paket dan lanjutkan pembayaran dengan aman via Midtrans.
          </p>

          {/* Dropdown Pilih Paket */}
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Pilih Paket Langganan
          </label>
          <select
            value={selectedPlan?.id || ''}
            onChange={(e) => {
              const plan = plans.find(p => p.id === e.target.value);
              setSelectedPlan(plan || null);
            }}
            className="w-full border border-slate-300 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.name} — Rp {Number(plan.price).toLocaleString('id-ID')}
              </option>
            ))}
          </select>

          {/* Ringkasan */}
          {selectedPlan && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Paket</span>
                <span className="font-semibold">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Durasi</span>
                <span className="font-semibold">{selectedPlan.duration_months} Bulan</span>
              </div>
              <div className="border-t border-slate-200 my-3"></div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-700">Total Bayar</span>
                <span className="font-bold text-xl text-blue-600">
                  Rp {Number(selectedPlan.price).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}

          {/* Tombol Bayar */}
          <button
            onClick={handlePay}
            disabled={isProcessing || !snapReady || !selectedPlan}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Memproses...' : !snapReady ? 'Memuat sistem pembayaran...' : '💳 Bayar Sekarang'}
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full mt-3 text-slate-500 text-sm hover:text-slate-700"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    </>
  );
}
