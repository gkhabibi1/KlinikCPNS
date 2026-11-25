import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import PanduanCPNS2026Content from '@/components/PanduanCPNS2026Content';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Panduan Lengkap Seleksi CPNS 2026: Jadwal, Formasi & Kisi-Kisi | Klinik CPNS',
  description:
    'Rangkuman resmi seleksi CPNS 2026 berdasarkan PermenPANRB No. 18 Tahun 2026 dan KepmenPANRB No. 674 Tahun 2026: jadwal, 154.052 formasi, syarat, passing grade SKD-SKB, dan checklist dokumen.',
  alternates: {
    canonical: 'https://klinikcpns.com/panduan-cpns-2026',
  },
};

export default function PublicPanduanCPNS2026Page() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Public Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <img
                src="https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png"
                alt="Klinik CPNS Logo"
                className="h-9 md:h-10 w-auto object-contain"
              />
            </Link>
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-full transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Beranda
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login?mode=login"
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-full transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/login?mode=register"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition-colors shadow-sm shadow-blue-200"
            >
              Daftar Gratis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 md:py-10">
        <PanduanCPNS2026Content
          isMember={false}
          defaultTab="semua"
          showPrintButton={true}
        />
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 px-5 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition">
              Beranda
            </Link>
            <Link href="/blog" className="hover:text-white transition">
              Blog
            </Link>
            <Link href="/login?mode=register" className="hover:text-white transition">
              Daftar Akun
            </Link>
          </div>
          <p className="text-slate-500">
            © 2026 KlinikCPNS. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
