"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import PanduanCPNS2026Content from "@/components/PanduanCPNS2026Content";
import {
  Stethoscope,
  ClipboardCheck,
  FileText,
  Timer,
  ShieldCheck,
  Coffee,
  Star,
  ChevronDown,
  CheckCircle2,
  Users,
  TrendingUp,
  Flame,
  Menu,
  X,
  ArrowRight,
  Image as ImageIcon,
  BadgeCheck,
} from "lucide-react";

/* ----------------------------------------------------------------------- */
/*  Reusable: labeled placeholder for photos you'll swap in later          */
/* ----------------------------------------------------------------------- */
interface ImageSlotProps {
  label: string;
  ratio?: string;
  className?: string;
}

function ImageSlot({ label, ratio = "aspect-[4/3]", className = "" }: ImageSlotProps) {
  return (
    <div
      className={`${ratio} ${className} relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/60 flex flex-col items-center justify-center gap-2 text-center px-6`}
    >
      <ImageIcon className="w-6 h-6 text-blue-300" strokeWidth={1.5} />
      <p className="text-xs font-medium text-blue-400 leading-snug max-w-[220px]">
        {label}
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Header                                                                  */
/* ----------------------------------------------------------------------- */
function Header() {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => {
      setCurrentUser(data?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setCurrentUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      await supabase.auth.signOut();
      setCurrentUser(null);
      window.location.reload();
    }
  };

  const links = [
    { label: "Peluang 2026", href: "#peluang", isGuide: false },
    { label: "Panduan 2026", href: "#panduan-2026", isGuide: true },
    { label: "Fitur & Resep", href: "#resep", isGuide: false },
    { label: "Paket", href: "#paket", isGuide: false },
    { label: "Testimoni", href: "#testimoni", isGuide: false },
    { label: "Blog", href: "/blog", isGuide: false },
    { label: "FAQ", href: "#faq", isGuide: false },
  ];
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <img
            src="https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png"
            alt="Klinik CPNS Logo"
            className="h-8 md:h-9 w-auto object-contain"
          />
        </a>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-[13.5px] font-medium transition-colors inline-flex items-center gap-1.5 ${
                l.isGuide
                  ? "text-blue-700 font-semibold bg-blue-50/90 hover:bg-blue-100/80 px-3 py-1.5 rounded-full"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {l.isGuide && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              <span>{l.label}</span>
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4.5 py-2 rounded-full transition-colors shadow-sm shadow-blue-200"
              >
                Dashboard
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <a
                href="/login?mode=login"
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-full transition-colors"
              >
                Masuk
              </a>
              <a
                href="/login?mode=register"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4.5 py-2.5 rounded-full transition-colors shadow-sm shadow-blue-200"
              >
                Daftar
                <ArrowRight className="w-4 h-4" />
              </a>
            </>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-700"
            aria-label="Buka menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-5 py-4 flex flex-col gap-3.5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`text-sm font-medium inline-flex items-center gap-2 ${
                l.isGuide ? "text-blue-700 font-semibold" : "text-slate-700"
              }`}
            >
              {l.isGuide && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              <span>{l.label}</span>
            </a>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="w-full text-center text-sm font-semibold text-white bg-blue-600 py-2.5 rounded-xl shadow-sm"
                >
                  Buka Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-xl border border-red-200 transition-colors"
                >
                  Keluar dari Akun
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login?mode=login"
                  onClick={() => setOpen(false)}
                  className="w-full text-center text-sm font-semibold text-slate-700 py-2 rounded-xl border border-slate-200"
                >
                  Masuk
                </a>
                <a
                  href="/login?mode=register"
                  onClick={() => setOpen(false)}
                  className="w-full text-center text-sm font-semibold text-white bg-blue-600 py-2.5 rounded-xl shadow-sm"
                >
                  Daftar Sekarang
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ----------------------------------------------------------------------- */
/*  Hero                                                                    */
/* ----------------------------------------------------------------------- */
function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-white">
      {/* subtle grid + glow, kept quiet on purpose */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(#EEF3FF 1px, transparent 1px), linear-gradient(90deg, #EEF3FF 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to bottom, black, transparent 75%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-14 pb-20 md:pt-24 md:pb-28 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50/90 border border-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-7">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            CPNS 2026 Resmi Dibuka · 154.052 Formasi
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-slate-900 leading-[1.08] tracking-tight text-balance">
            CPNS 2026 Resmi Dibuka.{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Amankan Kursi ASN Sekarang.
            </span>
          </h1>

          <p className="mt-6 text-base md:text-[17.5px] text-slate-600 leading-[1.7] max-w-lg">
            Pendaftaran SSCASN dimulai <strong className="font-semibold text-slate-900">27 November 2026</strong> dan SKD berlangsung Januari 2027. Latih dirimu dengan simulasi CAT yang sudah disesuaikan penuh dengan{" "}
            <strong className="font-semibold text-slate-900">PermenPANRB 18/2026 &amp; KepmenPANRB 674/2026</strong>.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="#paket"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-full transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
            >
              Mulai Try Out Sekarang
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#panduan-2026"
              className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-full transition-colors"
            >
              Lihat Panduan 2026
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Sesuai KepmenPANRB 674/2026
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              7.800+ Member Aktif
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Garansi Uang Kembali 100%
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-xl shadow-blue-100/60">
            <img
              src="https://ik.imagekit.io/e2yna5qg8/Home%201.jpg"
              alt="Persiapkan Lolos CPNS 2026 di KlinikCPNS"
              className="w-full h-auto max-h-[520px] object-cover rounded-3xl"
            />
          </div>

          {/* floating "prescription" card — signature element preview */}
          <div className="absolute -bottom-6 -left-6 md:-left-10 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/70 p-4">
            <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-dashed border-blue-200">
              <span className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                Rx
              </span>
              <p className="text-[11px] font-bold text-slate-900 tracking-tight">
                Resep KlinikCPNS
              </p>
            </div>
            <ul className="space-y-1.5">
              {[
                "Sesuai KepmenPANRB 674/2026",
                "399 paket try out CAT",
                "110 Soal | 100 Menit Resmi"
              ].map((t) => (
                  <li
                    key={t}
                    className="flex items-center gap-1.5 text-[11px] text-slate-600"
                  >
                    <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                    {t}
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="absolute -top-4 -right-3 md:-right-6 bg-blue-600 text-white rounded-2xl px-4 py-3 shadow-lg shadow-blue-200 rotate-3">
            <p className="text-[10px] font-medium text-blue-100 uppercase tracking-wide">
              Rating Pengguna
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span className="font-bold text-sm">4.9 / 5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guarantee ribbon */}
      <div className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-3.5 flex items-center justify-center gap-2.5 text-center">
          <ShieldCheck className="w-4.5 h-4.5 text-blue-400 shrink-0" />
          <p className="text-xs md:text-sm text-white font-medium">
            KlinikCPNS — Satu-satunya yang berani{" "}
            <span className="font-extrabold text-blue-400">
              GARANSI UANG KEMBALI
            </span>{" "}
            — bukan cuma try out, tapi jaminan usaha.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Opportunity / Problem framing                                          */
/* ----------------------------------------------------------------------- */
function Opportunity() {
  return (
    <section id="peluang" className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
            Momentum CPNS 2026
          </p>
          <h2 className="font-heading text-3xl md:text-[38px] font-extrabold text-slate-900 leading-[1.15] tracking-tight text-balance">
            154.052 Formasi Dibuka. Peluangmu Lolos Tahun Ini Lebih Besar.
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-[1.7]">
            Pendaftaran resmi dibuka mulai <strong className="font-semibold text-slate-900">27 November 2026</strong> di{" "}
            <span className="font-semibold text-blue-600">sscasn.bkn.go.id</span> dengan alokasi prioritas nasional mulai dari Kehutanan, Dosen, Tenaga Kesehatan, hingga Hukum &amp; HAM.
          </p>

          <div className="mt-7 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Timer className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Jangan Buang Waktu</h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-0.5">
                  Seleksi administrasi berjalan Desember 2026 dan ujian SKD CAT BKN dimulai Januari–Maret 2027. Mulai lebih awal berarti selangkah di depan pesaing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <ClipboardCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">100% Sesuai Regulasi Pemerintah 2026</h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-0.5">
                  Seluruh soal, pembobotan, dan ambang batas sudah disesuaikan menurut <strong className="font-semibold text-slate-800">PermenPANRB 18/2026</strong> &amp; <strong className="font-semibold text-slate-800">KepmenPANRB 674/2026</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Terbiasa Menghadapi CAT BKN</h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-0.5">
                  Bukan sekadar teori — latihan rutin membuatmu menguasai manajemen waktu 100 menit dan pola soal asli.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 overflow-hidden rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
            <img
              src="https://ik.imagekit.io/e2yna5qg8/Home%202.jpg"
              alt="Peluang Lolos CPNS 2026 - KlinikCPNS"
              className="w-full h-auto rounded-3xl"
            />
          </div>
          <div className="bg-blue-50/80 border border-blue-100/80 rounded-2xl p-5 flex flex-col gap-1">
            <TrendingUp className="w-5 h-5 text-blue-600 mb-1" />
            <p className="font-heading text-2xl font-extrabold text-slate-900">154.052</p>
            <p className="text-xs text-slate-600 leading-snug">
              formasi resmi dibuka di SSCASN 2026
            </p>
          </div>
          <div className="bg-slate-900 rounded-2xl p-5 flex flex-col gap-1">
            <Users className="w-5 h-5 text-blue-400 mb-1" />
            <p className="font-heading text-2xl font-extrabold text-white">7.800+</p>
            <p className="text-xs text-slate-300 leading-snug">
              member sudah latihan sesuai kisi-kisi 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Resep / Benefits — the signature "prescription card" section          */
/* ----------------------------------------------------------------------- */
interface RxCardProps {
  eyebrow: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  imageLabel: string;
  imageUrl?: string;
  reverse?: boolean;
}

function RxCard({ eyebrow, title, desc, icon: Icon, imageLabel, imageUrl, reverse }: RxCardProps) {
  return (
    <div
      className={`bg-white rounded-3xl border border-slate-100 shadow-sm shadow-slate-100 overflow-hidden flex flex-col lg:items-stretch ${
        reverse ? "lg:flex-row-reverse" : "lg:flex-row"
      }`}
    >
      <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col justify-center">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b-2 border-dashed border-blue-200">
          <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            Rx
          </span>
          <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">
            {eyebrow}
          </p>
        </div>
        <Icon className="w-7 h-7 text-blue-600 mb-3" strokeWidth={1.75} />
        <h3 className="text-xl font-bold text-slate-900 leading-snug">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
      </div>
      <div className="lg:w-1/2 p-6 pt-0 lg:p-8">
        {imageUrl ? (
          <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        ) : (
          <ImageSlot
            label={imageLabel}
            ratio="aspect-[16/10] lg:aspect-auto lg:h-full"
          />
        )}
      </div>
    </div>
  );
}

function Resep() {
  return (
    <section id="resep" className="bg-blue-50/40 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
            Metode Latihan Terarah
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-slate-900 leading-[1.15] tracking-tight text-balance">
            3 Pilar Persiapan yang Disesuaikan Standar Resmi 2026
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-[1.7]">
            Seluruh bank soal, sistem penilaian, dan modul materi disusun mengacu pada{" "}
            <strong className="font-semibold text-slate-800">PermenPANRB 18/2026</strong> &amp;{" "}
            <strong className="font-semibold text-slate-800">KepmenPANRB 674/2026</strong>.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <RxCard
            eyebrow="01 · Bank Soal Lengkap"
            icon={ClipboardCheck}
            title="399 Paket Try Out + Pembahasan Detail"
            desc="Format resmi 110 soal (30 TWK, 35 TIU, 45 TKP) dalam 100 menit lengkap dengan pembahasan langkah demi langkah di setiap butir soal."
            imageLabel="Screenshot / bukti visual jumlah paket soal (399 paket) di dashboard"
            imageUrl="https://ik.imagekit.io/e2yna5qg8/ChatGPT%20Image%20Aug%2023,%202026,%2005_55_53%20AM_11zon.png"
          />
          <RxCard
            eyebrow="02 · Simulasi CAT BKN"
            icon={Stethoscope}
            title="Tampilan & Passing Grade Resmi CPNS 2026"
            desc="Timer 100 menit dan sistem ambang batas (TWK 65, TIU 80, TKP 166, Total min. 311) dirancang persis seperti ujian CAT BKN sesungguhnya."
            imageLabel="Screenshot tampilan simulasi CAT / interface ujian di aplikasi"
            imageUrl="https://ik.imagekit.io/e2yna5qg8/ChatGPT%20Image%20Aug%2023,%202026,%2005_59_08%20AM_11zon.png"
            reverse
          />
          <RxCard
            eyebrow="03 · Kurikulum Terkini"
            icon={FileText}
            title="Materi & Kisi-Kisi Terbaru KepmenPANRB 674/2026"
            desc="Selalu selaras dengan Lampiran I & II regulasi pemerintah 2026 — mulai dari Pilar Negara, Verbal/Numerik/Figural, hingga 6 aspek TKP termasuk Anti-Radikalisme."
            imageLabel="Foto modul / rangkuman materi terbaru sesuai kisi-kisi"
            imageUrl="https://ik.imagekit.io/e2yna5qg8/ChatGPT%20Image%20Aug%2023,%202026,%2006_42_10%20AM_11zon.png"
          />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  30 Day Challenge — signature highlight                                 */
/* ----------------------------------------------------------------------- */
function Challenge() {
  return (
    <section className="bg-white py-20 md:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="relative rounded-3xl bg-slate-900 p-8 md:p-14 text-white overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
                <Flame className="w-4 h-4 text-amber-400" />
                Program Unggulan · Garansi Uang Kembali
              </div>

              <h2 className="font-heading text-3xl md:text-4xl font-extrabold leading-[1.15] tracking-tight text-balance">
                30 Days CPNS Challenge: Rahasia Konsisten Tanpa Tapi
              </h2>

              <p className="mt-4 text-slate-300 text-base md:text-lg leading-[1.7]">
                Selesaikan 1 paket try out setiap hari dengan target skor yang terus naik. Jika kamu menuntaskan 30 hari tanpa putus namun belum lolos seleksi CPNS 2026,{" "}
                <span className="font-bold text-white underline decoration-blue-400 underline-offset-4">
                  uangmu kami kembalikan 100%
                </span>
                .
              </p>

              <div className="mt-8 grid sm:grid-cols-3 gap-4 border-t border-slate-800 pt-8">
                <div>
                  <p className="text-2xl font-extrabold text-blue-400">
                    Hari 1–10
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Target: Lolos Passing Grade SKD
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-blue-400">
                    Hari 11–20
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Target: Total Skor ≥ 400
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-blue-400">
                    Hari 21–30
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Target: Total Skor ≥ 500
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl flex items-center justify-center">
                <img
                  src="https://ik.imagekit.io/e2yna5qg8/ChatGPT%20Image%20Aug%2023,%202026,%2006_30_27%20AM_11zon.png"
                  alt="30 Days CPNS Challenge: Rahasia konsisten tanpa tapi"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Pricing / Prescription options                                         */
/* ----------------------------------------------------------------------- */
interface PlanCardProps {
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  badge?: string;
  popular?: boolean;
  desc: string;
  features: string[];
  ctaText: string;
  href: string;
}

function PlanCard({
  name,
  price,
  originalPrice,
  period,
  badge,
  popular,
  desc,
  features,
  ctaText,
  href,
}: PlanCardProps) {
  return (
    <div
      className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all ${
        popular
          ? "bg-slate-900 text-white shadow-2xl shadow-blue-900/30 ring-2 ring-blue-500 scale-[1.02]"
          : "bg-white text-slate-900 border border-slate-200 shadow-sm hover:border-blue-200"
      }`}
    >
      {badge && (
        <span
          className={`absolute -top-3.5 left-7 text-[11px] font-bold px-3 py-1 rounded-full ${
            popular
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-blue-50 text-blue-700 border border-blue-100"
          }`}
        >
          {badge}
        </span>
      )}

      <div>
        <h3 className="text-xl font-extrabold tracking-tight mb-1">{name}</h3>
        <p
          className={`text-xs mb-6 ${
            popular ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {desc}
        </p>

        <div className="flex flex-col mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          {originalPrice && (
            <div className="flex items-center gap-2 mb-1">
              <span className="line-through text-xs text-slate-400 font-semibold">
                {originalPrice}
              </span>
              <span className="bg-red-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                Hemat 10%
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {price}
            </span>
            <span
              className={`text-xs ${
                popular ? "text-slate-400" : "text-slate-500"
              }`}
            >
              /{period}
            </span>
          </div>
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-xs md:text-sm">
              <CheckCircle2
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  popular ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <span className={popular ? "text-slate-300" : "text-slate-600"}>
                {f}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <a
        href={href}
        className={`w-full inline-flex items-center justify-center font-bold text-sm py-3.5 px-6 rounded-2xl transition-all ${
          popular
            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
            : "bg-blue-50 hover:bg-blue-100 text-blue-700"
        }`}
      >
        {ctaText}
      </a>
    </div>
  );
}

const formatExternalUrl = (url?: string) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

function Pricing({
  resellerCode,
  customCheckoutLink,
  discountPercentage = 0,
}: {
  resellerCode?: string;
  customCheckoutLink?: string;
  discountPercentage?: number;
}) {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from('subscription_packages')
        .select('*, subscription_benefits(*)')
        .eq('is_active', true)
        .order('display_order');
      if (data && data.length > 0) {
        setPlans(data);
      }
    };
    fetchPlans();
  }, []);

  const formattedCustomLink = formatExternalUrl(customCheckoutLink);
  const fallbackUrl = formattedCustomLink || "/login?mode=register";

  return (
    <section id="paket" className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
            Pilihan Paket Belajar
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-slate-900 leading-[1.15] tracking-tight text-balance">
            Investasi Seharga Kopi untuk Masa Depan ASN
          </h2>
          <p className="mt-4 text-slate-600 text-base leading-relaxed">
            Pilih durasi paket yang paling sesuai dengan target persiapan ujianmu.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.length > 0 ? (
            plans.map((pkg, idx) => {
              const rawPrice = pkg.price || 0;
              const hasDiscount = discountPercentage > 0 && rawPrice > 0;
              const finalPriceVal = hasDiscount
                ? Math.round(rawPrice * (1 - discountPercentage / 100))
                : rawPrice;

              const formatPrice = (val: number) => {
                if (val === 0) return 'Gratis';
                return `Rp${val.toLocaleString('id-ID')}`;
              };

              const benefitsList = pkg.subscription_benefits
                ? pkg.subscription_benefits.map((b: any) => b.benefit_text)
                : ['Akses Try Out SKD KlinikCPNS', 'Pembahasan Soal Detail', 'Sistem Ranking Nasional'];

              const checkoutUrl = formattedCustomLink
                ? formattedCustomLink
                : resellerCode
                ? `/checkout/${pkg.id}?ref=${resellerCode}`
                : `/checkout/${pkg.id}`;

              return (
                <PlanCard
                  key={pkg.id || idx}
                  name={pkg.name}
                  price={formatPrice(finalPriceVal)}
                  originalPrice={hasDiscount ? formatPrice(rawPrice) : undefined}
                  period={`${pkg.duration_days} hari`}
                  badge={idx === 1 ? 'Paling Populer' : hasDiscount ? 'Harga Reseller 10% Off' : undefined}
                  popular={idx === 1}
                  desc={pkg.description || 'Akses penuh ke semua fitur simulasi CAT KlinikCPNS.'}
                  features={benefitsList}
                  ctaText="Pilih Paket KlinikCPNS Ini"
                  href={checkoutUrl}
                />
              );
            })
          ) : (
            <>
              <PlanCard
                name="Resep 1 Bulan KlinikCPNS"
                price="Rp49.000"
                period="bulan"
                desc="Cocok untuk pemanasan dan latihan cepat menjelang tes di KlinikCPNS."
                features={[
                  "399 paket try out TWK, TIU, TKP KlinikCPNS",
                  "Simulasi CAT BKN realtime KlinikCPNS",
                  "Pembahasan detail & kunci jawaban",
                  "Ranking nasional realtime",
                ]}
                ctaText="Ambil Resep 1 Bulan"
                href={fallbackUrl}
              />
              <PlanCard
                name="Resep 3 Bulan KlinikCPNS + Garansi"
                price="Rp99.000"
                period="3 bulan"
                badge="Rekomendasi Utama"
                popular
                desc="Paket paling banyak dipilih member KlinikCPNS."
                features={[
                  "Semua fitur Resep 1 Bulan KlinikCPNS",
                  "Akses 30 Days CPNS Challenge KlinikCPNS",
                  "GARANSI UANG KEMBALI 100%",
                  "Grup diskusi & konsultasi KlinikCPNS",
                  "Update materi kisi-kisi 2026",
                ]}
                ctaText="Ambil Resep 3 Bulan"
                href={fallbackUrl}
              />
              <PlanCard
                name="Resep 6 Bulan KlinikCPNS (Intensif)"
                price="Rp149.000"
                period="6 bulan"
                desc="Untuk kamu yang mau persiapan matang jauh-jauh hari di KlinikCPNS."
                features={[
                  "Semua fitur Resep 3 Bulan KlinikCPNS",
                  "Garansi Uang Kembali 100% KlinikCPNS",
                  "Akses materi P3K (opsional)",
                  "Bank soal HOTS eksklusif KlinikCPNS",
                ]}
                ctaText="Ambil Resep 6 Bulan"
                href={fallbackUrl}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Testimonials                                                            */
/* ----------------------------------------------------------------------- */
interface TestimonialCardProps {
  name: string;
  role: string;
  quote: string;
}

function TestimonialCard({ name, role, quote }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col shadow-sm shadow-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <ImageSlot
          label="Foto member lolos, mengenakan Korpri"
          ratio="aspect-square"
          className="w-14 h-14 rounded-full !p-0"
        />
        <div>
          <p className="font-bold text-slate-900 text-sm">{name}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm text-slate-600 leading-relaxed flex-1">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 w-fit px-2.5 py-1 rounded-full">
        <BadgeCheck className="w-3.5 h-3.5" />
        Lolos CPNS bersama KlinikCPNS
      </div>
    </div>
  );
}

function Testimonials() {
  const items = [
    {
      name: "Dian A.",
      role: "Lolos di Kementerian Keuangan",
      quote:
        "Karena rutin latihan try out di KlinikCPNS tiap hari, pas ujian asli rasanya kayak udah pernah ngerjain sebelumnya. Nggak grogi sama sekali.",
    },
    {
      name: "Rangga P.",
      role: "Lolos di Pemkab, Formasi Guru",
      quote:
        "30 Days Challenge KlinikCPNS bener-bener bantu saya konsisten. Biasanya males belajar, sekarang jadi ada targetnya tiap hari.",
    },
    {
      name: "Sri W.",
      role: "Lolos di Kemenkes",
      quote:
        "Pembahasan soal di KlinikCPNS detail banget, jadi saya ngerti pola soal CAT bukan cuma nebak jawaban. Worth it banget.",
    },
  ];
  return (
    <section id="testimoni" className="bg-blue-50/50 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
            Cerita Alumni
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-slate-900 leading-[1.15] tracking-tight text-balance">
            Lolos Karena Rajin Latihan, Bukan Kebetulan
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  FAQ                                                                     */
/* ----------------------------------------------------------------------- */
interface FAQItemProps {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ q, a, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-slate-100 py-5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 text-left"
      >
        <span className="font-semibold text-slate-900 text-sm md:text-base">
          {q}
        </span>
        <ChevronDown
          className={`w-4.5 h-4.5 text-blue-600 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <p className="mt-3 text-sm text-slate-600 leading-relaxed pr-8">
          {a}
        </p>
      )}
    </div>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = [
    {
      q: "Apa itu platform KlinikCPNS?",
      a: "KlinikCPNS adalah platform latihan try out dan simulasi CAT BKN terdepan untuk membantu kamu bersiap menghadapi seleksi CPNS 2026, lengkap dengan pembahasan dan materi sesuai kisi-kisi terbaru.",
    },
    {
      q: "Gimana cara kerja garansi uang kembali di KlinikCPNS?",
      a: "Kamu perlu menyelesaikan 30 Days CPNS Challenge di KlinikCPNS dan mencapai target nilai yang ditentukan. Kalau syarat itu terpenuhi tapi kamu tetap belum lolos tes CPNS 2026, uangmu akan dikembalikan 100% oleh KlinikCPNS.",
    },
    {
      q: "Saya pemula banget, cocok nggak ikut KlinikCPNS?",
      a: "Sangat cocok! Pembahasan di KlinikCPNS dirancang mudah dipahami dari dasar, lengkap dengan statistik perkembangan nilai biar kamu tahu bagian mana yang harus ditingkatkan.",
    },
    {
      q: "Apakah soal-soal try out di KlinikCPNS sudah sesuai aturan CPNS 2026?",
      a: "Ya! Seluruh soal try out, pembobotan nilai, waktu 100 menit (110 soal), dan passing grade (TWK 65, TIU 80, TKP 166) di KlinikCPNS telah disesuaikan 100% menurut dokumen resmi pemerintah terbaru: PermenPANRB Nomor 18 Tahun 2026 dan KepmenPANRB Nomor 674 Tahun 2026.",
    },
    {
      q: "Kapan CPNS 2026 dibuka dan bagaimana jadwal SKD-nya?",
      a: "Berdasarkan pengumuman resmi, pendaftaran CPNS 2026 dibuka mulai Jumat, 27 November 2026 di portal sscasn.bkn.go.id dengan total 154.052 formasi, dilanjutkan seleksi administrasi pada pekan pertama Desember 2026, serta ujian SKD & SKB pada Januari–Maret 2027. Jangan tunda latihanmu dari sekarang!",
    },
  ];

  return (
    <section id="faq" className="bg-white py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
            Pertanyaan Umum
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
            Yang Sering Ditanyakan Peserta
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((f, i) => (
            <FAQItem
              key={f.q}
              q={f.q}
              a={f.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Final CTA                                                               */
/* ----------------------------------------------------------------------- */
function FinalCTA() {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20 md:py-24 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-5 md:px-8 text-center relative z-10">
        <h2 className="font-heading text-3xl md:text-5xl font-extrabold leading-[1.12] tracking-tight text-balance">
          CPNS 2026 Sudah Dibuka. Mulai Latihanmu Hari Ini.
        </h2>
        <p className="mt-5 text-blue-100 text-base md:text-lg leading-[1.7] max-w-xl mx-auto">
          Jangan tunggu mendekati ujian SKD Januari 2027. Kuasai soal standar{" "}
          <strong className="text-white font-semibold">KepmenPANRB 674/2026</strong> lebih dulu bersama 7.800+ pejuang ASN lainnya.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#paket"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-base px-8 py-4 rounded-full transition-colors shadow-xl"
          >
            Pilih Paket Try Out Sekarang
            <ArrowRight className="w-4.5 h-4.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Footer                                                                  */
/* ----------------------------------------------------------------------- */
function Footer() {
  return (
    <footer className="bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-5 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <img
            src="https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png"
            alt="KlinikCPNS Logo"
            className="h-8 md:h-9 w-auto object-contain brightness-0 invert"
          />
        </a>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
          <a href="#peluang" className="hover:text-white transition-colors">
            Kenapa Sekarang
          </a>
          <Link href="/panduan-cpns-2026" className="text-amber-300 hover:text-amber-200 font-semibold transition-colors">
            Panduan CPNS 2026
          </Link>
          <a href="#resep" className="hover:text-white transition-colors">
            Resep Kami
          </a>
          <a href="#paket" className="hover:text-white transition-colors">
            Paket
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
          <a href="/blog" className="hover:text-white transition-colors">
            Blog
          </a>
          <a
            href="https://wa.me/6285199655534?text=Halo%20Admin%20KlinikCPNS,%20saya%20ingin%20bertanya"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>💬 WA Admin: +62 851-9965-5534</span>
          </a>
        </nav>
        <p className="text-xs text-slate-500">
          © 2026 KlinikCPNS. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}

/* ----------------------------------------------------------------------- */
/*  Sticky mobile CTA — keeps the button always visible                    */
/* ----------------------------------------------------------------------- */
function StickyCTA() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 backdrop-blur border-t border-slate-100 px-4 py-3">
      <a
        href="#paket"
        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-5 py-3 rounded-full"
      >
        <Coffee className="w-4 h-4" />
        Mulai Try Out KlinikCPNS, Cuma Seharga Kopi
      </a>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Panduan CPNS 2026 Tabbed Showcase                                       */
/* ----------------------------------------------------------------------- */
function Panduan2026Section() {
  return (
    <section id="panduan-2026" className="bg-slate-50/70 border-y border-slate-100 py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-5 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2.5">
              Pusat Informasi Resmi CASN 2026
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              Panduan Lengkap Seleksi CPNS 2026
            </h2>
            <p className="mt-2.5 text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed">
              Cek jadwal resmi, rincian 154.052 formasi, kebijakan dokumen terbaru, hingga kisi-kisi &amp; passing grade SKD–SKB 2026 sebelum mendaftar.
            </p>
          </div>
          <Link
            href="/panduan-cpns-2026"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-4 py-2.5 rounded-full shadow-xs transition-colors shrink-0 self-start md:self-auto"
          >
            Buka Halaman Panduan Khusus
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <PanduanCPNS2026Content
          isMember={false}
          defaultTab="jadwal"
          showPrintButton={true}
        />
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Page                                                                    */
/* ----------------------------------------------------------------------- */
export interface LandingPageProps {
  resellerCode?: string;
  resellerName?: string;
  customCheckoutLink?: string;
  discountPercentage?: number;
}

export default function KlinikCPNSLandingPage({
  resellerCode,
  resellerName,
  customCheckoutLink,
  discountPercentage = 0,
}: LandingPageProps = {}) {
  useEffect(() => {
    if (resellerCode) {
      try {
        localStorage.setItem('reseller_code', resellerCode);
      } catch (e) {
        console.error('Error saving reseller_code to localStorage:', e);
      }
    }
  }, [resellerCode]);

  return (
    <main className="font-sans antialiased bg-white pb-16 sm:pb-0">
      {resellerCode && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white text-xs md:text-sm font-semibold py-3 px-4 text-center sticky top-0 z-[60] shadow-lg flex items-center justify-center gap-2">
          <span className="bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider shadow-sm">
            Promo Reseller {discountPercentage || 10}% OFF
          </span>
          <span>
            Anda diundang oleh <strong>{resellerName || resellerCode}</strong>! Semua paket otomatis hemat {discountPercentage || 10}%.
          </span>
        </div>
      )}
      <Header />
      <Hero />
      <Opportunity />
      <Panduan2026Section />
      <Resep />
      <Challenge />
      <Pricing resellerCode={resellerCode} customCheckoutLink={customCheckoutLink} discountPercentage={discountPercentage} />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
      <StickyCTA />
    </main>
  );
}
