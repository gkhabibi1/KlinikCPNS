'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import PageLoadingSpinner from '@/components/PageLoadingSpinner';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Wallet,
  Award,
  FileText,
  RefreshCw,
  Clock,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';

type RangeFilter = '7d' | '14d' | '30d' | '6m';

interface DailyBucket {
  key: string;
  label: string;
  registrants: number;
  buyers: number;
  revenue: number;
}

function formatRupiah(val: number) {
  return `Rp ${Math.round(val).toLocaleString('id-ID')}`;
}

function formatCompactRupiah(val: number) {
  if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)}M`;
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}jt`;
  if (val >= 1_000) return `Rp ${Math.round(val / 1_000)}rb`;
  return `Rp ${val}`;
}

export default function AdminAnalyticsPanel() {
  const [range, setRange] = useState<RangeFilter>('14d');
  const [isLoading, setIsLoading] = useState(true);

  const [profiles, setProfiles] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [resellerOrders, setResellerOrders] = useState<any[]>([]);
  const [extraCounts, setExtraCounts] = useState({
    tryoutPackages: 0,
    examResults: 0,
    resellers: 0,
    questionBank: 0,
  });

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [
        { data: profData },
        { data: txData },
        { data: pkgData },
        { count: tryoutPkgCount },
        { count: examCount },
        { count: resellerCount },
        { count: qbCount },
        resellerOrdersRes,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, created_at, subscription_valid_until'),
        supabase
          .from('transactions')
          .select('id, package_id, status, total_amount, amount, created_at, paid_at'),
        supabase.from('subscription_packages').select('id, name, price'),
        supabase
          .from('tryout_packages')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('exam_results')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('resellers')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('question_bank')
          .select('*', { count: 'exact', head: true }),
        fetch('/api/reseller/orders').then((r) => r.json()).catch(() => ({})),
      ]);

      setProfiles(profData || []);
      setTransactions(txData || []);
      setPackages(pkgData || []);
      setResellerOrders(resellerOrdersRes?.orders || []);
      setExtraCounts({
        tryoutPackages: tryoutPkgCount || 0,
        examResults: examCount || 0,
        resellers: resellerCount || 0,
        questionBank: qbCount || 0,
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const summary = useMemo(() => {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const paidTx = transactions.filter((t) => t.status === 'paid');
    const waitingTx = transactions.filter(
      (t) => t.status === 'waiting_verification'
    );
    const pendingTx = transactions.filter((t) => t.status === 'pending');

    const paidResellerOrders = resellerOrders.filter((o) => o.status === 'paid');

    const txRevenue = paidTx.reduce(
      (sum, t) => sum + Number(t.total_amount ?? t.amount ?? 0),
      0
    );
    const resellerRevenue = paidResellerOrders.reduce(
      (sum, o) => sum + Number(o.total_amount ?? 0),
      0
    );
    const totalRevenue = txRevenue + resellerRevenue;

    const todayRevenue =
      paidTx
        .filter((t) => (t.paid_at || t.created_at || '').slice(0, 10) === todayKey)
        .reduce((sum, t) => sum + Number(t.total_amount ?? t.amount ?? 0), 0) +
      paidResellerOrders
        .filter((o) => (o.paid_at || o.created_at || '').slice(0, 10) === todayKey)
        .reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);

    const monthRevenue =
      paidTx
        .filter((t) => new Date(t.paid_at || t.created_at) >= monthStart)
        .reduce((sum, t) => sum + Number(t.total_amount ?? t.amount ?? 0), 0) +
      paidResellerOrders
        .filter((o) => new Date(o.paid_at || o.created_at) >= monthStart)
        .reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);

    const totalRegistrants = profiles.length;
    const todayRegistrants = profiles.filter(
      (p) => (p.created_at || '').slice(0, 10) === todayKey
    ).length;
    const weekRegistrants = profiles.filter(
      (p) => p.created_at && new Date(p.created_at) >= weekAgo
    ).length;

    const activeSubscribers = profiles.filter(
      (p) =>
        p.subscription_valid_until && new Date(p.subscription_valid_until) > now
    ).length;

    const totalBuyers = paidTx.length + paidResellerOrders.length;
    const conversionRate =
      totalRegistrants > 0
        ? Math.min(100, Math.round((paidTx.length / totalRegistrants) * 1000) / 10)
        : 0;

    // Top packages breakdown
    const pkgMap = new Map<string, { name: string; count: number; revenue: number }>();
    packages.forEach((p) => {
      pkgMap.set(p.id, { name: p.name, count: 0, revenue: 0 });
    });
    paidTx.forEach((t) => {
      const existing = pkgMap.get(t.package_id) || {
        name: 'Paket Lainnya',
        count: 0,
        revenue: 0,
      };
      existing.count += 1;
      existing.revenue += Number(t.total_amount ?? t.amount ?? 0);
      pkgMap.set(t.package_id || 'other', existing);
    });
    const topPackages = Array.from(pkgMap.values())
      .filter((p) => p.count > 0)
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      txRevenue,
      resellerRevenue,
      todayRevenue,
      monthRevenue,
      totalRegistrants,
      todayRegistrants,
      weekRegistrants,
      activeSubscribers,
      totalBuyers,
      paidMemberCount: paidTx.length,
      paidResellerCount: paidResellerOrders.length,
      waitingCount: waitingTx.length,
      pendingCount: pendingTx.length,
      conversionRate,
      topPackages,
    };
  }, [profiles, transactions, packages, resellerOrders]);

  // Buckets untuk Grafik Pendaftar, Pembeli, & Omset
  const chartBuckets = useMemo<DailyBucket[]>(() => {
    const now = new Date();
    const buckets: DailyBucket[] = [];

    if (range === '6m') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('id-ID', {
          month: 'short',
          year: '2-digit',
        });
        buckets.push({ key, label, registrants: 0, buyers: 0, revenue: 0 });
      }
    } else {
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 14;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
        });
        buckets.push({ key, label, registrants: 0, buyers: 0, revenue: 0 });
      }
    }

    const bucketMap = new Map(buckets.map((b) => [b.key, b]));
    const sliceLen = range === '6m' ? 7 : 10;

    profiles.forEach((p) => {
      const k = (p.created_at || '').slice(0, sliceLen);
      const b = bucketMap.get(k);
      if (b) b.registrants += 1;
    });

    transactions
      .filter((t) => t.status === 'paid')
      .forEach((t) => {
        const k = (t.paid_at || t.created_at || '').slice(0, sliceLen);
        const b = bucketMap.get(k);
        if (b) {
          b.buyers += 1;
          b.revenue += Number(t.total_amount ?? t.amount ?? 0);
        }
      });

    resellerOrders
      .filter((o) => o.status === 'paid')
      .forEach((o) => {
        const k = (o.paid_at || o.created_at || '').slice(0, sliceLen);
        const b = bucketMap.get(k);
        if (b) {
          b.buyers += 1;
          b.revenue += Number(o.total_amount ?? 0);
        }
      });

    return buckets;
  }, [range, profiles, transactions, resellerOrders]);

  const maxPeople = Math.max(
    1,
    ...chartBuckets.map((b) => Math.max(b.registrants, b.buyers))
  );
  const maxRevenue = Math.max(1, ...chartBuckets.map((b) => b.revenue));

  if (isLoading) {
    return (
      <PageLoadingSpinner
        title="Menghitung Analitik & Omset..."
        subtitle="Sedang merekap data pendaftar, transaksi, dan grafik."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Filter Rentang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Ringkasan Analitik &amp; Omset
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pantau pertumbuhan pendaftar, konversi pembeli, omset masuk, dan aktivitas platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
            {[
              { id: '7d', label: '7 Hari' },
              { id: '14d', label: '14 Hari' },
              { id: '30d', label: '30 Hari' },
              { id: '6m', label: '6 Bulan' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRange(item.id as RangeFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  range === item.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={loadAnalytics}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Kartu KPI Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
              Total Omset Lunas
            </span>
            <Wallet className="w-5 h-5 text-blue-200" />
          </div>
          <p className="text-2xl font-black tracking-tight">
            {formatRupiah(summary.totalRevenue)}
          </p>
          <p className="text-xs text-blue-100 mt-1.5">
            Bulan ini: <strong>{formatRupiah(summary.monthRevenue)}</strong>
          </p>
          <p className="text-[11px] text-blue-200 mt-0.5">
            Hari ini: {formatRupiah(summary.todayRevenue)}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Pendaftar
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {summary.totalRegistrants.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1.5">
            +{summary.weekRegistrants} pendaftar 7 hari terakhir
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Hari ini: +{summary.todayRegistrants} · Member Aktif: {summary.activeSubscribers}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Pembeli Lunas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {summary.totalBuyers.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-slate-600 mt-1.5">
            Member: <strong>{summary.paidMemberCount}</strong> · Reseller:{' '}
            <strong>{summary.paidResellerCount}</strong>
          </p>
          <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
            Konversi Pendaftar → Pembeli: {summary.conversionRate}%
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Aktivitas Platform
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {extraCounts.examResults.toLocaleString('id-ID')}
            <span className="text-xs font-semibold text-slate-500 ml-1.5">ujian</span>
          </p>
          <p className="text-xs text-slate-600 mt-1.5">
            Paket Tryout: <strong>{extraCounts.tryoutPackages}</strong> · Reseller:{' '}
            <strong>{extraCounts.resellers}</strong>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Bank Soal: {extraCounts.questionBank.toLocaleString('id-ID')} butir
          </p>
        </div>
      </div>

      {/* 2 Grafik Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik 1: Pendaftar vs Pembeli */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Grafik Pendaftar vs Pembeli</span>
              </h3>
              <p className="text-xs text-slate-500">
                Perbandingan jumlah akun baru dan transaksi lunas
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-500" />
                Pendaftar
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                Pembeli
              </span>
            </div>
          </div>

          <div className="h-52 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 border-b border-slate-100 overflow-x-auto">
            {chartBuckets.map((b) => {
              const regPct = Math.round((b.registrants / maxPeople) * 100);
              const buyPct = Math.round((b.buyers / maxPeople) * 100);
              return (
                <div
                  key={b.key}
                  className="flex-1 min-w-[24px] h-full flex flex-col items-center justify-end group relative"
                  title={`${b.label}: ${b.registrants} pendaftar, ${b.buyers} pembeli`}
                >
                  <div className="w-full h-full flex items-end justify-center gap-0.5">
                    <div
                      className="w-1/2 max-w-[14px] bg-blue-500 hover:bg-blue-600 rounded-t transition-all"
                      style={{ height: `${Math.max(b.registrants > 0 ? 6 : 2, regPct)}%` }}
                    />
                    <div
                      className="w-1/2 max-w-[14px] bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all"
                      style={{ height: `${Math.max(b.buyers > 0 ? 6 : 2, buyPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between gap-1 text-[10px] text-slate-400 overflow-x-auto">
            {chartBuckets.map((b, idx) => (
              <span
                key={b.key}
                className={`flex-1 text-center truncate ${
                  chartBuckets.length > 14 && idx % 2 === 1 ? 'hidden sm:inline' : ''
                }`}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* Grafik 2: Omset Harian / Bulanan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Grafik Omset Masuk</span>
              </h3>
              <p className="text-xs text-slate-500">
                Total omset lunas periode terpilih:{' '}
                <strong className="text-slate-800">
                  {formatRupiah(chartBuckets.reduce((s, b) => s + b.revenue, 0))}
                </strong>
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              Puncak: {formatCompactRupiah(maxRevenue === 1 ? 0 : maxRevenue)}
            </span>
          </div>

          <div className="h-52 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 border-b border-slate-100 overflow-x-auto">
            {chartBuckets.map((b) => {
              const revPct = Math.round((b.revenue / maxRevenue) * 100);
              return (
                <div
                  key={b.key}
                  className="flex-1 min-w-[20px] h-full flex flex-col items-center justify-end group"
                  title={`${b.label}: ${formatRupiah(b.revenue)}`}
                >
                  <div
                    className="w-full max-w-[24px] bg-gradient-to-t from-emerald-600 to-teal-400 hover:from-emerald-500 hover:to-teal-300 rounded-t-md transition-all"
                    style={{ height: `${Math.max(b.revenue > 0 ? 6 : 2, revPct)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between gap-1 text-[10px] text-slate-400 overflow-x-auto">
            {chartBuckets.map((b, idx) => (
              <span
                key={b.key}
                className={`flex-1 text-center truncate ${
                  chartBuckets.length > 14 && idx % 2 === 1 ? 'hidden sm:inline' : ''
                }`}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Lainnya: Status Transaksi & Paket Terlaris */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ringkasan Status Transaksi */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Ringkasan Status Transaksi</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>Lunas (Paid)</span>
              </div>
              <p className="text-xl font-black text-emerald-900 mt-1">
                {summary.paidMemberCount}
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {formatRupiah(summary.txRevenue)}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <p className="font-bold text-amber-800">Perlu Verifikasi</p>
              <p className="text-xl font-black text-amber-900 mt-1">
                {summary.waitingCount}
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Sudah upload bukti bayar
              </p>
            </div>

            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5">
              <p className="font-bold text-slate-700">Pending (Belum Bayar)</p>
              <p className="text-xl font-black text-slate-900 mt-1">
                {summary.pendingCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Menunggu transfer QRIS
              </p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-purple-900">Omset Pendaftaran Reseller</p>
              <p className="text-purple-700 mt-0.5">
                {summary.paidResellerCount} order reseller lunas
              </p>
            </div>
            <span className="text-base font-black text-purple-800">
              {formatRupiah(summary.resellerRevenue)}
            </span>
          </div>
        </div>

        {/* Paket Subscribe Terlaris */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Performa Paket Subscribe Terlaris</span>
          </h3>

          {summary.topPackages.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Belum ada transaksi paket yang lunas.
            </p>
          ) : (
            <div className="space-y-3">
              {summary.topPackages.map((pkg, idx) => {
                const maxPkgRev = summary.topPackages[0]?.revenue || 1;
                const pct = Math.max(8, Math.round((pkg.revenue / maxPkgRev) * 100));
                return (
                  <div key={pkg.name + idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        #{idx + 1} {pkg.name}
                      </span>
                      <span className="text-slate-600 font-semibold">
                        {pkg.count} pembeli ·{' '}
                        <strong className="text-slate-900">
                          {formatRupiah(pkg.revenue)}
                        </strong>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
