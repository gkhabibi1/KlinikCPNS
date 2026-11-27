'use client';

import React, { useState, useEffect } from 'react';

interface PackageSummary {
  id: string;
  name: string;
  question_count?: number;
}

interface AdminChallengePoolConfigProps {
  allPackages: PackageSummary[];
}

export default function AdminChallengePoolConfig({
  allPackages,
}: AdminChallengePoolConfigProps) {
  const [mode, setMode] = useState<'static' | 'pool'>('static');
  const [selectedPkgIds, setSelectedPkgIds] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/challenge/session?action=admin_stats');
      const data = await res.json();
      if (data.config) {
        setMode(data.config.mode || 'static');
        setSelectedPkgIds(data.config.source_package_ids || []);
      }
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error('Error loading challenge pool stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const togglePackage = (id: string) => {
    setSelectedPkgIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/challenge/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_config',
          config: {
            mode,
            source_package_ids: selectedPkgIds,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan konfigurasi');
      }
      await loadStats();
      alert('✅ Pengaturan Mode Pool 30 Days Challenge berhasil disimpan!');
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 text-sm text-slate-500">
        Memuat pengaturan Pool Bank Soal Challenge...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Mode Acak Bank Soal Khusus 30 Days Challenge
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Acak 110 soal (30 TWK, 35 TIU, 45 TKP) per hari &amp; per member sesuai tingkat kesulitan AI, serta anti-soal sama saat member mengulang dari Hari ke-1.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs sm:text-sm font-bold cursor-pointer shrink-0"
        >
          {isSaving ? 'Menyimpan...' : 'Simpan Mode Challenge'}
        </button>
      </div>

      {/* Pilihan Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMode('pool')}
          className={`text-left rounded-xl p-4 border-2 transition cursor-pointer ${
            mode === 'pool'
              ? 'border-blue-600 bg-blue-50/50'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="font-bold text-sm text-slate-900">
            Mode Pool Bank Soal Acak (60 Paket / Dinamis)
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Hari 1–10 ambil soal Mudah/Sedang (AI 1–3), Hari 11–20 Sulit (AI 4), Hari 21–30 HOTS (AI 5). Member yang mengulang tidak mendapat soal yang sama.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setMode('static')}
          className={`text-left rounded-xl p-4 border-2 transition cursor-pointer ${
            mode === 'static'
              ? 'border-blue-600 bg-blue-50/50'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="font-bold text-sm text-slate-900">
            Mode Paket Statis per Hari (Default)
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Setiap hari ke-1 s/d ke-30 memakai 1 paket try out tetap yang dipilih pada tabel di bawah.
          </p>
        </button>
      </div>

      {mode === 'pool' && (
        <div className="space-y-4 pt-2">
          {/* Statistik Stok Pool */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="font-bold text-emerald-800">Hari 1–10 (AI 1–3)</p>
                <p className="text-emerald-700 mt-1">
                  TWK: <strong>{stats.sector1.TWK}</strong> · TIU:{' '}
                  <strong>{stats.sector1.TIU}</strong> · TKP:{' '}
                  <strong>{stats.sector1.TKP}</strong>
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                <p className="font-bold text-orange-800">Hari 11–20 (AI 4 · Sulit)</p>
                <p className="text-orange-700 mt-1">
                  TWK: <strong>{stats.sector2.TWK}</strong> · TIU:{' '}
                  <strong>{stats.sector2.TIU}</strong> · TKP:{' '}
                  <strong>{stats.sector2.TKP}</strong>
                </p>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                <p className="font-bold text-rose-800">Hari 21–30 (AI 5 · HOTS)</p>
                <p className="text-rose-700 mt-1">
                  TWK: <strong>{stats.sector3.TWK}</strong> · TIU:{' '}
                  <strong>{stats.sector3.TIU}</strong> · TKP:{' '}
                  <strong>{stats.sector3.TKP}</strong>
                </p>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-3">
                <p className="font-bold text-slate-700">Belum Dicek AI</p>
                <p className="text-slate-600 mt-1">
                  TWK: <strong>{stats.unchecked.TWK}</strong> · TIU:{' '}
                  <strong>{stats.unchecked.TIU}</strong> · TKP:{' '}
                  <strong>{stats.unchecked.TKP}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Pilih Paket Sumber Pool */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Pilih Paket Sumber Pool Challenge ({selectedPkgIds.length} dipilih)
                </p>
                <p className="text-[11px] text-slate-500">
                  Centang hingga ~60 paket soal yang ingin dijadikan Pool Bank Soal Challenge. (Jika kosong, otomatis memakai paket yang ada di tabel 30 Hari).
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPkgIds(allPackages.map((p) => p.id))}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Pilih Semua ({allPackages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPkgIds([])}
                  className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
              {allPackages.map((pkg) => {
                const checked = selectedPkgIds.includes(pkg.id);
                return (
                  <label
                    key={pkg.id}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                      checked
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePackage(pkg.id)}
                      className="accent-blue-600 cursor-pointer"
                    />
                    <span className="truncate flex-1">{pkg.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
