'use client';

import React, { useEffect, useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Share,
  PlusSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallAppCard() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Daftarkan service worker untuk memenuhi syarat PWA installable
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const standaloneCheck =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standaloneCheck);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowGuide((prev) => !prev);
      return;
    }
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsStandalone(true);
        setDeferredPrompt(null);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  if (isStandalone) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-bold text-emerald-900">
            Aplikasi KlinikCPNS Sudah Terpasang
          </p>
          <p className="text-[11px] sm:text-xs text-emerald-700">
            Anda sedang membuka KlinikCPNS dalam mode aplikasi layar penuh.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-full mb-1">
              Versi Aplikasi HP (WebView / PWA)
            </span>
            <h3 className="font-heading text-sm sm:text-base font-extrabold text-white">
              Pasang KlinikCPNS di Layar Utama Handphone
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Buka lebih cepat layaknya aplikasi native tanpa perlu mengetik alamat web ulang setiap belajar.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleInstallClick}
          disabled={isInstalling}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer shrink-0 self-start sm:self-center"
        >
          {deferredPrompt ? (
            <>
              <Download className="w-4 h-4" />
              <span>{isInstalling ? 'Memasang...' : 'Install Aplikasi Sekarang'}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Cara Install di HP</span>
              {showGuide ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </>
          )}
        </button>
      </div>

      {/* Panduan Manual jika browser iOS Safari atau belum memunculkan prompt otomatis */}
      {showGuide && (
        <div className="bg-white/10 border border-white/15 rounded-xl p-4 text-xs text-slate-200 space-y-2.5">
          {isIos ? (
            <>
              <p className="font-bold text-white">
                Panduan Pasang di iPhone / iPad (Safari):
              </p>
              <ol className="space-y-1.5 list-decimal list-inside text-slate-200">
                <li className="flex items-center gap-1.5">
                  <span>1. Ketuk tombol</span>
                  <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded font-semibold text-white">
                    <Share className="w-3.5 h-3.5" /> Share
                  </span>
                  <span>di bagian bawah browser Safari.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span>2. Pilih</span>
                  <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded font-semibold text-white">
                    <PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen
                  </span>
                  <span>lalu ketuk <strong>Add</strong>.</span>
                </li>
              </ol>
            </>
          ) : (
            <>
              <p className="font-bold text-white">
                Panduan Pasang di Android (Chrome / Edge):
              </p>
              <ol className="space-y-1 list-decimal list-inside text-slate-200">
                <li>Ketuk ikon titik tiga (<strong>⋮</strong>) di pojok kanan atas browser Chrome.</li>
                <li>Pilih menu <strong>&ldquo;Install app&rdquo;</strong> atau <strong>&ldquo;Tambahkan ke layar utama&rdquo;</strong>.</li>
                <li>Konfirmasi <strong>Install</strong> — ikon KlinikCPNS akan langsung muncul di layar HP Anda.</li>
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
}
