'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  RefreshCw,
  Loader2,
} from 'lucide-react';

type CalibratorProvider = 'gemini' | 'groq' | 'openrouter' | 'mistral';
type TargetDifficulty = 'sulit' | 'sangat_sulit';

interface ActivityLogItem {
  id: string;
  category: string;
  sub_category: string;
  answerCorrected: boolean;
  oldAnswer: string;
  newAnswer: string;
  notes: string;
  timestamp: string;
}

interface AiCalibratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const STORAGE_KEYS = {
  provider: 'klinikcpns_calibrator_provider',
  keysByProvider: 'klinikcpns_calibrator_apikeys_v1',
  delaySec: 'klinikcpns_calibrator_delay_sec',
  batchSize: 'klinikcpns_calibrator_batch_size',
  difficulty: 'klinikcpns_calibrator_difficulty',
};

export default function AiCalibratorModal({
  isOpen,
  onClose,
  onUpdated,
}: AiCalibratorModalProps) {
  const [provider, setProvider] = useState<CalibratorProvider>('gemini');
  const [autoSwitchProvider, setAutoSwitchProvider] = useState<boolean>(true);
  const [targetDifficulty, setTargetDifficulty] = useState<TargetDifficulty>('sangat_sulit');
  const [batchSize, setBatchSize] = useState<number>(2);
  const [delaySeconds, setDelaySeconds] = useState<number>(4);
  const [keysMap, setKeysMap] = useState<Record<CalibratorProvider, string>>({
    gemini: '',
    groq: '',
    openrouter: '',
    mistral: '',
  });

  const [stats, setStats] = useState({
    migrationReady: true,
    total: 0,
    calibratedCount: 0,
    remaining: 0,
  });
  const [envKeys, setEnvKeys] = useState<Record<CalibratorProvider, boolean>>({
    gemini: false,
    groq: false,
    openrouter: false,
    mistral: false,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Siap menjalankan kalibrasi otomatis.'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);

  const pauseRequestedRef = useRef(false);

  // Load settings from localStorage once
  useEffect(() => {
    try {
      const savedProvider = localStorage.getItem(STORAGE_KEYS.provider) as CalibratorProvider | null;
      if (savedProvider && ['gemini', 'groq', 'openrouter', 'mistral'].includes(savedProvider)) {
        setProvider(savedProvider);
      }
      const savedKeys = localStorage.getItem(STORAGE_KEYS.keysByProvider);
      if (savedKeys) {
        const parsed = JSON.parse(savedKeys);
        setKeysMap({
          gemini: String(parsed?.gemini || ''),
          groq: String(parsed?.groq || ''),
          openrouter: String(parsed?.openrouter || ''),
          mistral: String(parsed?.mistral || ''),
        });
      }
      const savedDelay = Number(localStorage.getItem(STORAGE_KEYS.delaySec));
      if (!Number.isNaN(savedDelay) && savedDelay >= 1) {
        setDelaySeconds(savedDelay);
      }
      const savedBatch = Number(localStorage.getItem(STORAGE_KEYS.batchSize));
      if (!Number.isNaN(savedBatch) && savedBatch >= 1 && savedBatch <= 5) {
        setBatchSize(savedBatch);
      }
      const savedDiff = localStorage.getItem(STORAGE_KEYS.difficulty) as TargetDifficulty | null;
      if (savedDiff === 'sulit' || savedDiff === 'sangat_sulit') {
        setTargetDifficulty(savedDiff);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/calibrate-questions', { cache: 'no-store' });
      const rawText = await res.text();
      const data = rawText ? JSON.parse(rawText) : {};
      if (res.ok && typeof data.total === 'number') {
        setStats({
          migrationReady: data.migrationReady !== false,
          total: data.total,
          calibratedCount: data.calibratedCount || 0,
          remaining: data.remaining || 0,
        });
        if (data.envKeys) {
          setEnvKeys({
            gemini: Boolean(data.envKeys.gemini),
            groq: Boolean(data.envKeys.groq),
            openrouter: Boolean(data.envKeys.openrouter),
            mistral: Boolean(data.envKeys.mistral),
          });
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const updateKeysForProvider = (value: string) => {
    setKeysMap((prev) => {
      const next = { ...prev, [provider]: value };
      try {
        localStorage.setItem(STORAGE_KEYS.keysByProvider, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleProviderChange = (nextProvider: CalibratorProvider) => {
    setProvider(nextProvider);
    try {
      localStorage.setItem(STORAGE_KEYS.provider, nextProvider);
    } catch {}
  };

  const handleDelayChange = (val: number) => {
    const safe = Math.max(1, Math.min(30, val || 4));
    setDelaySeconds(safe);
    try {
      localStorage.setItem(STORAGE_KEYS.delaySec, String(safe));
    } catch {}
  };

  const handleBatchSizeChange = (val: number) => {
    const safe = Math.max(1, Math.min(5, val || 2));
    setBatchSize(safe);
    try {
      localStorage.setItem(STORAGE_KEYS.batchSize, String(safe));
    } catch {}
  };

  const handleDifficultyChange = (val: TargetDifficulty) => {
    setTargetDifficulty(val);
    try {
      localStorage.setItem(STORAGE_KEYS.difficulty, val);
    } catch {}
  };

  const parsedApiKeys = keysMap[provider]
    .split(/\r?\n/)
    .map((k) => k.trim())
    .filter(Boolean);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleStartCalibration = async () => {
    if (parsedApiKeys.length === 0 && !envKeys[provider]) {
      setErrorMessage(
        `Masukkan minimal 1 API Key ${provider.toUpperCase()} terlebih dahulu (atau set di Vercel Env).`
      );
      return;
    }

    pauseRequestedRef.current = false;
    setIsRunning(true);
    setErrorMessage(null);
    setStatusMessage('Memulai kalibrasi batch pertama...');

    let activeProv: CalibratorProvider = provider;
    let currentBatchSize = Math.max(1, Math.min(5, batchSize || 2));
    const allProviders: CalibratorProvider[] = ['gemini', 'groq', 'openrouter', 'mistral'];
    const parseKeysFor = (p: CalibratorProvider) =>
      keysMap[p]
        .split(/\r?\n/)
        .map((k) => k.trim())
        .filter(Boolean);

    try {
      while (!pauseRequestedRef.current) {
        const currentKeys = parseKeysFor(activeProv);
        const fallbackProviders = autoSwitchProvider
          ? allProviders
              .filter((p) => p !== activeProv)
              .map((p) => ({ provider: p, apiKeys: parseKeysFor(p) }))
              .filter((entry) => entry.apiKeys.length > 0 || envKeys[entry.provider])
          : [];

        const res = await fetch('/api/calibrate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batchSize: currentBatchSize,
            provider: activeProv,
            apiKeys: currentKeys,
            fallbackProviders,
            targetDifficulty,
          }),
        });

        const rawText = await res.text();
        let data: any = null;
        try {
          data = rawText ? JSON.parse(rawText) : {};
        } catch {
          const isVercelTimeout =
            res.status === 504 ||
            res.status === 502 ||
            rawText.trim().startsWith('An error') ||
            rawText.trim().startsWith('<');
          if (isVercelTimeout && currentBatchSize > 1) {
            currentBatchSize = 1;
            handleBatchSizeChange(1);
            setStatusMessage(
              'Server timeout pada batch sebelumnya — otomatis menurunkan batch ke 1 soal & mencoba ulang...'
            );
            await sleep(2000);
            continue;
          }
          setErrorMessage(
            isVercelTimeout
              ? 'Server Vercel mencapai batas waktu eksekusi (10 detik). Turunkan Batch ke 1 soal atau pilih provider yang lebih cepat (OpenRouter Free / Groq).'
              : `Respons server tidak valid (HTTP ${res.status}): ${rawText.slice(0, 140)}`
          );
          setStatusMessage('Kalibrasi dihentikan karena respons server tidak valid.');
          break;
        }

        if (data?.usedProvider && data.usedProvider !== activeProv) {
          activeProv = data.usedProvider as CalibratorProvider;
          handleProviderChange(activeProv);
        }

        if (!res.ok) {
          setErrorMessage(data?.error || 'Gagal memproses batch kalibrasi.');
          setStatusMessage('Kalibrasi dihentikan karena terjadi error.');
          break;
        }

        if (typeof data.total === 'number') {
          setStats({
            migrationReady: true,
            total: data.total,
            calibratedCount: data.calibratedCount || 0,
            remaining: data.remaining || 0,
          });
        }

        if (Array.isArray(data.results) && data.results.length > 0) {
          const timeStr = new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          const newEntries: ActivityLogItem[] = data.results.map((r: any) => ({
            ...r,
            timestamp: timeStr,
          }));
          setLogs((prev) => [...newEntries, ...prev].slice(0, 60));
        }

        if (data.rateLimited) {
          setErrorMessage(
            data.error ||
              'Seluruh API Key mencapai batas limit hari ini (HTTP 429). Loop dihentikan dengan aman.'
          );
          setStatusMessage('Berhenti otomatis (Rate Limit 429).');
          break;
        }

        if (data.completed || data.remaining === 0) {
          setStatusMessage('Seluruh soal di Bank Soal sudah terkalibrasi AI!');
          break;
        }

        if (pauseRequestedRef.current) {
          setStatusMessage('Kalibrasi dijeda oleh admin.');
          break;
        }

        setStatusMessage(
          `[${(data.usedProvider || activeProv).toUpperCase()}] Batch selesai (${data.processedCount || 0} soal)${data.switchedFromPrimary ? ' — auto-switch provider aktif!' : ''}. Menunggu ${delaySeconds} detik...`
        );
        await sleep(delaySeconds * 1000);
      }

      if (pauseRequestedRef.current) {
        setStatusMessage('Kalibrasi dijeda. Klik Lanjutkan kapan saja untuk meneruskan.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Koneksi terputus saat menjalankan kalibrasi.');
      setStatusMessage('Kalibrasi terhenti.');
    } finally {
      setIsRunning(false);
      onUpdated();
    }
  };

  const handlePause = () => {
    pauseRequestedRef.current = true;
    setStatusMessage('Menjeda setelah batch saat ini selesai...');
  };

  if (!isOpen) return null;

  const progressPct =
    stats.total > 0 ? Math.min(100, Math.round((stats.calibratedCount / stats.total) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white text-black w-full max-w-3xl max-h-[92vh] rounded-2xl border-2 border-black shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ddff00] border border-black flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-black">
                AI Kalibrasi &amp; Upgrade Soal
              </h2>
              <p className="text-xs text-slate-600">
                Validasi kunci jawaban &amp; tingkatkan soal menjadi HOTS secara bertahap tanpa proses ulang.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isRunning && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ddff00] border border-black text-[11px] font-black text-black">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
                </span>
                AI Sedang Berjalan
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                if (!isRunning) onClose();
              }}
              disabled={isRunning}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              title={isRunning ? 'Jeda kalibrasi terlebih dahulu sebelum menutup' : 'Tutup'}
            >
              <X className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {!stats.migrationReady && (
            <div className="p-3.5 rounded-xl border-2 border-black bg-[#ddff00]/30 text-xs text-black flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Migrasi SQL belum dijalankan di Supabase</p>
                <p className="mt-0.5 text-slate-800">
                  Jalankan file{' '}
                  <code className="px-1.5 py-0.5 bg-white border border-black/20 rounded font-mono">
                    supabase/migration_ai_calibrator.sql
                  </code>{' '}
                  di Supabase SQL Editor terlebih dahulu agar kolom tracking &amp; backup tersedia.
                </p>
              </div>
            </div>
          )}

          {/* Real-time Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Soal
              </div>
              <div className="text-2xl font-black text-black mt-1">
                {isLoadingStats ? '...' : stats.total}
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-black bg-[#ddff00]/25">
              <div className="text-[11px] font-bold uppercase tracking-wider text-black">
                Sudah Dikalibrasi
              </div>
              <div className="text-2xl font-black text-black mt-1">
                {isLoadingStats ? '...' : stats.calibratedCount}
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Belum Dikalibrasi
              </div>
              <div className="text-2xl font-black text-black mt-1">
                {isLoadingStats ? '...' : stats.remaining}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className={`p-4 rounded-xl border space-y-2 transition-colors ${
              isRunning
                ? 'border-black bg-[#ddff00]/15'
                : 'border-slate-200 bg-slate-50/70'
            }`}
          >
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-black">
              <span className="flex items-center gap-2">
                {isRunning && <Loader2 className="w-4 h-4 animate-spin text-black shrink-0" />}
                <span>{statusMessage}</span>
              </span>
              <span className="shrink-0">{progressPct}%</span>
            </div>
            <div className="w-full h-3.5 bg-white border border-black rounded-full overflow-hidden">
              <div
                className={`h-full bg-[#ddff00] transition-all duration-300 ${
                  isRunning ? 'animate-pulse' : ''
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Provider AI
              </label>
              <select
                value={provider}
                disabled={isRunning}
                onChange={(e) => handleProviderChange(e.target.value as CalibratorProvider)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-black bg-white disabled:bg-slate-100"
              >
                <option value="gemini">Google Gemini Flash (3.8)</option>
                <option value="groq">Groq (GPT-OSS 120B)</option>
                <option value="openrouter">OpenRouter Free (Auto-Router)</option>
                <option value="mistral">Mistral AI (Berbayar)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Level HOTS
              </label>
              <select
                value={targetDifficulty}
                disabled={isRunning}
                onChange={(e) => handleDifficultyChange(e.target.value as TargetDifficulty)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-black bg-white disabled:bg-slate-100"
              >
                <option value="sulit">Sulit (HOTS Analitis)</option>
                <option value="sangat_sulit">Sangat Sulit (HOTS Level 5)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Batch
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  disabled={isRunning}
                  value={batchSize}
                  onChange={(e) => handleBatchSizeChange(Number(e.target.value))}
                  title="Rekomendasi: 1-2 soal per batch agar bebas timeout 10 detik Vercel"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-black bg-white disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Jeda (dtk)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  disabled={isRunning}
                  value={delaySeconds}
                  onChange={(e) => handleDelayChange(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-black bg-white disabled:bg-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Multiple API Keys Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Daftar API Key {provider.toUpperCase()} (1 key per baris untuk rotasi otomatis)
              </label>
              <span className="text-[11px] font-bold text-black bg-slate-100 px-2 py-0.5 rounded-full">
                {parsedApiKeys.length > 0
                  ? `${parsedApiKeys.length} key aktif (rotasi)`
                  : envKeys[provider]
                  ? '✓ Pakai Key Vercel Env'
                  : '0 key'}
              </span>
            </div>
            <textarea
              rows={3}
              disabled={isRunning}
              value={keysMap[provider]}
              onChange={(e) => updateKeysForProvider(e.target.value)}
              placeholder={
                envKeys[provider]
                  ? `Opsional: kosongkan untuk memakai ${provider.toUpperCase()}_API_KEY dari Vercel, atau tempel beberapa key (1 per baris) untuk rotasi otomatis...`
                  : `Tempel beberapa API Key ${provider.toUpperCase()} dipisah baris baru (disimpan aman di browser localStorage)...`
              }
              className="w-full border border-slate-300 rounded-xl p-3 text-xs font-mono text-black bg-white focus:outline-none focus:border-black disabled:bg-slate-100"
            />
            <label className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-black cursor-pointer">
              <input
                type="checkbox"
                disabled={isRunning}
                checked={autoSwitchProvider}
                onChange={(e) => setAutoSwitchProvider(e.target.checked)}
                className="w-4 h-4 rounded border-black accent-black"
              />
              <span>
                Auto-switch ke provider cadangan (Groq / Mistral / Gemini) jika kuota gratis habis (429)
              </span>
            </label>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={fetchStats}
              disabled={isRunning || isLoadingStats}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-black flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
              Refresh Statistik
            </button>

            <div className="flex items-center gap-2">
              {isRunning ? (
                <button
                  type="button"
                  onClick={handlePause}
                  className="px-5 py-2.5 rounded-xl border-2 border-black bg-white hover:bg-slate-100 text-xs sm:text-sm font-black text-black flex items-center gap-2 cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  Jeda (Pause)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartCalibration}
                  disabled={!stats.migrationReady || stats.remaining === 0}
                  className="px-5 py-2.5 rounded-xl border-2 border-black bg-[#ddff00] hover:brightness-95 disabled:opacity-40 text-xs sm:text-sm font-black text-black flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  {stats.calibratedCount > 0 && stats.remaining > 0
                    ? 'Lanjutkan Kalibrasi'
                    : 'Mulai Kalibrasi'}
                </button>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Log Aktivitas Kalibrasi
              </span>
              <span className="text-[11px] text-slate-500">{logs.length} entri terakhir</span>
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white">
              {logs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  Belum ada log pada sesi ini. Klik &quot;Mulai Kalibrasi&quot; untuk memproses batch soal.
                </div>
              ) : (
                logs.map((entry, idx) => (
                  <div
                    key={`${entry.id}-${idx}`}
                    className="px-3.5 py-2.5 text-xs flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono font-bold text-black">
                          #{entry.id.slice(0, 8)}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700">
                          {entry.category}
                        </span>
                        {entry.answerCorrected ? (
                          <span className="px-2 py-0.5 rounded bg-[#ddff00] border border-black text-[10px] font-black text-black">
                            Kunci Dikoreksi: {entry.oldAnswer} → {entry.newAnswer}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            Kunci Valid ({entry.newAnswer})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{entry.notes}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {entry.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
