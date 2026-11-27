"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import PanduanCPNS2026Content from "@/components/PanduanCPNS2026Content";
import PlatformHeader from "@/components/PlatformHeader";
import {
  PlatformTab,
  PlanCard,
  resolvePackageCards,
  KeunggulanDetailTab,
  HargaPerbandinganTab,
  TestimoniFaqTab,
} from "@/components/LandingTabsContent";
import {
  ClipboardCheck,
  Timer,
  ShieldCheck,
  Coffee,
  Star,
  CheckCircle2,
  Users,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Scale,
  Calendar,
  Award,
  Bot,
  BrainCircuit,
  Zap,
  Layers,
  Printer,
} from "lucide-react";

const VALID_TABS: PlatformTab[] = [
  "beranda",
  "keunggulan",
  "panduan",
  "harga",
  "testimoni",
];

/* ----------------------------------------------------------------------- */
/*  Tab 1 (Beranda): Ringkas, Storytelling Awal, & Biaya                  */
/* ----------------------------------------------------------------------- */
function Hero({ onSwitchTab }: { onSwitchTab: (tab: PlatformTab) => void }) {
  return (
    <section id="top" className="relative overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(#EEF3FF 1px, transparent 1px), linear-gradient(90deg, #EEF3FF 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to bottom, black, transparent 75%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-10 pb-16 md:pt-20 md:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50/90 border border-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            CPNS 2026 Resmi Dibuka · 154.052 Formasi
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl lg:text-[50px] font-extrabold text-slate-900 leading-[1.09] tracking-tight text-balance">
            CPNS 2026 Resmi Dibuka.{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Amankan Kursi ASN Sekarang.
            </span>
          </h1>

          <p className="mt-5 text-base md:text-[17px] text-slate-600 leading-[1.7] max-w-lg">
            Pendaftaran SSCASN dimulai{" "}
            <strong className="font-semibold text-slate-900">
              27 November 2026
            </strong>{" "}
            dan SKD berlangsung Januari 2027. Berlatih lebih awal di platform CAT
            yang sudah disesuaikan penuh dengan{" "}
            <strong className="font-semibold text-slate-900">
              PermenPANRB 18/2026 &amp; KepmenPANRB 674/2026
            </strong>
            .
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <a
              href="#paket"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-full transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
            >
              Mulai Try Out Sekarang
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => onSwitchTab("panduan")}
              className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 font-semibold px-6 py-3.5 rounded-full transition-colors cursor-pointer"
            >
              Lihat Panduan 2026
            </button>
          </div>

          <div className="mt-7 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              399+ Paket CAT Standar BKN
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
              className="w-full h-auto max-h-[500px] object-cover rounded-3xl"
            />
          </div>

          <div className="absolute -bottom-4 left-2 sm:-bottom-6 sm:-left-6 md:-left-10 w-52 sm:w-56 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/70 p-3.5 sm:p-4">
            <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-dashed border-blue-200">
              <span className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                Rx
              </span>
              <p className="text-[11px] font-bold text-slate-900 tracking-tight">
                Platform KlinikCPNS
              </p>
            </div>
            <ul className="space-y-1.5">
              {[
                "Sesuai KepmenPANRB 674/2026",
                "399 paket try out CAT",
                "110 Soal | 100 Menit Resmi",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-1.5 text-[11px] text-slate-600"
                >
                  <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="absolute -top-3 right-2 sm:-top-4 sm:-right-3 md:-right-6 bg-blue-600 text-white rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-lg shadow-blue-200 rotate-3">
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
              GARANSI UANG KEMBALI 100%
            </span>{" "}
            — bukan cuma try out, tapi jaminan usaha.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Storytelling Awal (Ringkas & Padat di Beranda)                         */
/* ----------------------------------------------------------------------- */
function StorytellingOverview({
  onSwitchTab,
}: {
  onSwitchTab: (tab: PlatformTab) => void;
}) {
  return (
    <section className="bg-slate-50/70 border-b border-slate-100 py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
            Kenapa Mempersiapkan Sejak Sekarang
          </p>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 leading-[1.15] tracking-tight text-balance">
            154.052 Formasi Dibuka. Jangan Tunggu Sampai Mendekati Ujian.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-[1.75]">
            Pendaftaran SSCASN dimulai{" "}
            <strong className="font-semibold text-slate-900">
              27 November 2026
            </strong>
            , seleksi administrasi berjalan Desember 2026, dan SKD CAT BKN
            digelar Januari–Maret 2027. Banyak peserta gugur bukan karena kurang
            pintar, tetapi karena belum terbiasa dengan pola soal baru dan
            tekanan waktu 100 menit.
          </p>

          <div className="mt-6 space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Timer className="w-4 h-4" />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Mulai Lebih Awal:</strong>{" "}
                Terbiasa mengerjakan 110 soal dalam 100 menit jauh sebelum
                hari-H.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Kurikulum 2026 Resmi:</strong>{" "}
                Materi, soal, dan passing grade mengacu penuh pada PermenPANRB
                18/2026 &amp; KepmenPANRB 674/2026.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onSwitchTab("keunggulan")}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-full transition cursor-pointer"
            >
              Pelajari Detail Fitur &amp; Keunggulan
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onSwitchTab("panduan")}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 px-4 py-2.5 rounded-full bg-blue-50 hover:bg-blue-100/80 transition cursor-pointer"
            >
              Cek Jadwal &amp; Formasi 2026
            </button>
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
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-1 shadow-2xs">
            <TrendingUp className="w-5 h-5 text-blue-600 mb-1" />
            <p className="font-heading text-2xl font-extrabold text-slate-900">
              154.052
            </p>
            <p className="text-xs text-slate-600 leading-snug">
              formasi resmi dibuka di SSCASN 2026
            </p>
          </div>
          <div className="bg-slate-900 rounded-2xl p-5 flex flex-col gap-1">
            <Users className="w-5 h-5 text-blue-400 mb-1" />
            <p className="font-heading text-2xl font-extrabold text-white">
              7.800+
            </p>
            <p className="text-xs text-slate-300 leading-snug">
              member berlatih sesuai kisi-kisi 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Ringkasan Info CPNS 2026 (Preview dari Tab Panduan 2026)               */
/* ----------------------------------------------------------------------- */
function HomeInfoCPNS2026Summary({
  onSwitchTab,
}: {
  onSwitchTab: (tab: PlatformTab) => void;
}) {
  const infoCards = [
    {
      icon: Calendar,
      badge: "Jadwal Resmi",
      title: "Timeline Seleksi 2026–2027",
      points: [
        "27 Nov 2026: Pendaftaran SSCASN dibuka",
        "Des 2026: Seleksi administrasi berkas",
        "Jan–Mar 2027: Ujian SKD & SKB CAT BKN",
      ],
    },
    {
      icon: Users,
      badge: "154.052 Formasi",
      title: "Alokasi Formasi Prioritas",
      points: [
        "Kehutanan (70.000) & Dosen/Dikti (26.614)",
        "Hukum & HAM (19.016) & Nakes (13.362)",
        "Statistik, Guru, Audit, Pangan & Lainnya",
      ],
    },
    {
      icon: Award,
      badge: "KepmenPANRB 674/2026",
      title: "Aturan Main & Passing Grade SKD",
      points: [
        "110 Soal CAT dalam waktu 100 menit",
        "TWK min. 65 · TIU min. 80 · TKP min. 166",
        "Cukup unggah transkrip nilai (tanpa ijazah)",
      ],
    },
  ];

  return (
    <section className="bg-white border-b border-slate-100 py-14 md:py-20">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
              Ringkasan Informasi CPNS 2026
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              Fakta Penting Seleksi CASN 2026 yang Wajib Kamu Tahu
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab("panduan")}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-full transition cursor-pointer shrink-0 self-start md:self-auto"
          >
            Buka Panduan Lengkap 2026
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {infoCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-slate-900 mb-3">
                    {card.title}
                  </h3>
                  <ul className="space-y-2">
                    {card.points.map((pt) => (
                      <li
                        key={pt}
                        className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Ringkasan Value & Keunggulan Belajar (Preview Tab Keunggulan)          */
/* ----------------------------------------------------------------------- */
function HomeValueSummary({
  onSwitchTab,
}: {
  onSwitchTab: (tab: PlatformTab) => void;
}) {
  const highlights = [
    {
      icon: BookOpen,
      title: "Materi Berjenjang 32 Subbab",
      desc: "TWK, TIU, dan TKP terstruktur dari dasar dengan sistem unlock & checkpoint.",
    },
    {
      icon: Bot,
      title: "AI Tutor Interaktif",
      desc: "Tanya konsep atau rumus langsung di dalam modul untuk penjelasan langkah demi langkah.",
    },
    {
      icon: Layers,
      title: "399+ Paket Simulasi CAT BKN",
      desc: "Timer 100 menit, 110 soal, penanda ragu-ragu, dan pembobotan PG resmi 2026.",
    },
    {
      icon: BrainCircuit,
      title: "Buku Evaluasi & Bank Soal Salah",
      desc: "Otomatis mencatat soal yang keliru untuk remedial terarah + cetak PDF A4.",
    },
    {
      icon: Zap,
      title: "Speed Drill & Mode Hafalan",
      desc: "Latih kecepatan hitung & baca bersama Flashcard dan Cheat Sheet Rumus Sakti.",
    },
    {
      icon: Printer,
      title: "Ranking Nasional & Sertifikat",
      desc: "Bandingkan skormu dengan ribuan peserta lain dan unduh sertifikat simulasi.",
    },
  ];

  return (
    <section className="bg-slate-50/70 border-b border-slate-100 py-14 md:py-20">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
              Apa yang Kamu Dapatkan
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              Ekosistem Belajar Lengkap, Bukan Sekadar Try Out Biasa
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab("keunggulan")}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-full transition cursor-pointer shrink-0 self-start md:self-auto"
          >
            Lihat Detail Semua Fitur
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-start gap-3.5 shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-slate-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Ringkasan Testimoni Alumni (Preview Tab Testimoni & FAQ)               */
/* ----------------------------------------------------------------------- */
function HomeTestimonialSummary({
  onSwitchTab,
}: {
  onSwitchTab: (tab: PlatformTab) => void;
}) {
  const alumni = [
    {
      name: "Dian A.",
      role: "Lolos di Kementerian Keuangan",
      photo: "/testimonials/testimonial-dian.jpg",
      quote:
        "Karena rutin latihan try out tiap hari, pas ujian asli rasanya kayak udah pernah ngerjain sebelumnya.",
    },
    {
      name: "Rangga P.",
      role: "Lolos di Pemkab, Formasi Guru",
      photo: "/testimonials/testimonial-rangga.jpg",
      quote:
        "30 Days Challenge bener-bener bantu konsisten. Sekarang belajar jadi ada target jelas setiap hari.",
    },
    {
      name: "Sri W.",
      role: "Lolos di Kemenkes",
      photo: "/testimonials/testimonial-sri.jpg",
      quote:
        "Pembahasan soalnya detail banget, jadi ngerti pola soal CAT bukan cuma nebak jawaban.",
    },
  ];

  return (
    <section className="bg-slate-50/70 border-t border-slate-100 py-14 md:py-20">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
              Cerita Alumni &amp; Tanya Jawab
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              Dipercaya 7.800+ Pejuang ASN di Seluruh Indonesia
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab("testimoni")}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-full transition cursor-pointer shrink-0 self-start md:self-auto"
          >
            Baca Testimoni &amp; FAQ Lengkap
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {alumni.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-11 h-11 rounded-full object-cover shrink-0 border-2 border-blue-100 bg-blue-50"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{item.role}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>
              <div className="flex gap-0.5 mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Biaya di Home Page (Ringkas + Link ke Tab Perbandingan Harga)          */
/* ----------------------------------------------------------------------- */
function HomePricingSection({
  plans,
  resellerCode,
  customCheckoutLink,
  discountPercentage = 0,
  onSwitchTab,
}: {
  plans: any[];
  resellerCode?: string;
  customCheckoutLink?: string;
  discountPercentage?: number;
  onSwitchTab: (tab: PlatformTab) => void;
}) {
  const cards = resolvePackageCards(
    plans,
    resellerCode,
    customCheckoutLink,
    discountPercentage
  );

  return (
    <section id="paket" className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2.5">
            Biaya &amp; Pilihan Paket Belajar
          </p>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 leading-[1.15] tracking-tight text-balance">
            Investasi Seharga Kopi untuk Masa Depan ASN
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Pilih durasi paket yang paling sesuai dengan target persiapan ujianmu.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-7 items-stretch">
          {cards.map((card, i) => (
            <PlanCard key={card.name + i} {...card} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => onSwitchTab("harga")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            <Scale className="w-4 h-4 text-blue-600" />
            <span>Lihat Tabel Perbandingan Fitur &amp; Biaya Lengkap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Final CTA                                                               */
/* ----------------------------------------------------------------------- */
function FinalCTA({
  onSwitchTab,
}: {
  onSwitchTab: (tab: PlatformTab) => void;
}) {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16 md:py-20 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-5 md:px-8 text-center relative z-10">
        <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold leading-[1.12] tracking-tight text-balance">
          CPNS 2026 Sudah Dibuka. Mulai Latihanmu Hari Ini.
        </h2>
        <p className="mt-4 text-blue-100 text-sm sm:text-base md:text-lg leading-[1.7] max-w-xl mx-auto">
          Jangan tunggu mendekati ujian SKD Januari 2027. Kuasai soal standar{" "}
          <strong className="text-white font-semibold">
            KepmenPANRB 674/2026
          </strong>{" "}
          lebih dulu bersama 7.800+ pejuang ASN lainnya.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={() => onSwitchTab("harga")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm sm:text-base px-7 py-3.5 rounded-full transition-colors shadow-xl cursor-pointer"
          >
            Bandingkan &amp; Pilih Paket
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
          <a
            href="/login?mode=register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-500/30 hover:bg-blue-500/40 border border-white/30 text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-full transition-colors"
          >
            Daftar Akun Gratis
          </a>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Footer                                                                  */
/* ----------------------------------------------------------------------- */
function Footer({ onSwitchTab }: { onSwitchTab: (tab: PlatformTab) => void }) {
  return (
    <footer className="bg-slate-950 py-10">
      <div className="max-w-6xl mx-auto px-5 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <button
          type="button"
          onClick={() => onSwitchTab("beranda")}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer"
        >
          <img
            src="https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png"
            alt="KlinikCPNS Logo"
            className="h-8 md:h-9 w-auto object-contain brightness-0 invert"
          />
        </button>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
          <button
            type="button"
            onClick={() => onSwitchTab("beranda")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Beranda
          </button>
          <button
            type="button"
            onClick={() => onSwitchTab("keunggulan")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Keunggulan &amp; Fitur
          </button>
          <button
            type="button"
            onClick={() => onSwitchTab("panduan")}
            className="text-amber-300 hover:text-amber-200 font-semibold transition-colors cursor-pointer"
          >
            Panduan CPNS 2026
          </button>
          <button
            type="button"
            onClick={() => onSwitchTab("harga")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Harga
          </button>
          <button
            type="button"
            onClick={() => onSwitchTab("testimoni")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            FAQ
          </button>
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <a
            href="https://wa.me/6285199655534?text=Halo%20Admin%20KlinikCPNS,%20saya%20ingin%20bertanya"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>WA Admin: +62 851-9965-5534</span>
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
/*  Sticky mobile CTA                                                      */
/* ----------------------------------------------------------------------- */
function StickyCTA({
  onSwitchTab,
}: {
  onSwitchTab: (tab: PlatformTab) => void;
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 backdrop-blur border-t border-slate-100 px-4 py-3">
      <button
        type="button"
        onClick={() => onSwitchTab("harga")}
        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-5 py-3 rounded-full text-xs cursor-pointer"
      >
        <Coffee className="w-4 h-4" />
        Lihat Paket Belajar KlinikCPNS (Mulai Rp49rb)
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Page Orchestrator                                                      */
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
  const [activeTab, setActiveTab] = useState<PlatformTab>("beranda");
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    if (resellerCode) {
      try {
        localStorage.setItem("reseller_code", resellerCode);
      } catch (e) {
        console.error("Error saving reseller_code to localStorage:", e);
      }
    }
  }, [resellerCode]);

  // Baca tab aktif dari query ?tab=... agar URL sinkron tanpa Suspense issues
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as PlatformTab | null;
      if (tabParam && VALID_TABS.includes(tabParam)) {
        setActiveTab(tabParam);
      }
    } catch {
      // Abaikan jika window tidak tersedia
    }
  }, []);

  // Fetch paket dari Supabase sekali untuk digunakan di Beranda & Tab Perbandingan Harga
  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from("subscription_packages")
        .select("*, subscription_benefits(*)")
        .eq("is_active", true)
        .order("display_order");
      if (data && data.length > 0) {
        setPlans(data);
      }
    };
    fetchPlans();
  }, []);

  const switchTab = (nextTab: PlatformTab) => {
    setActiveTab(nextTab);
    try {
      const url = new URL(window.location.href);
      if (nextTab === "beranda") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", nextTab);
      }
      window.history.replaceState(null, "", url.pathname + url.search);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // Abaikan
    }
  };

  return (
    <main className="font-sans antialiased bg-white pb-16 sm:pb-0 min-h-screen flex flex-col">
      {resellerCode && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white text-xs md:text-sm font-semibold py-3 px-4 text-center sticky top-0 z-[60] shadow-lg flex items-center justify-center gap-2">
          <span className="bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider shadow-sm">
            Promo Reseller {discountPercentage || 10}% OFF
          </span>
          <span>
            Anda diundang oleh <strong>{resellerName || resellerCode}</strong>!
            Semua paket otomatis hemat {discountPercentage || 10}%.
          </span>
        </div>
      )}

      <PlatformHeader activeTab={activeTab} onSwitchTab={switchTab} />

      <div className="flex-1">
        {activeTab === "beranda" && (
          <>
            <Hero onSwitchTab={switchTab} />
            <StorytellingOverview onSwitchTab={switchTab} />
            <HomeInfoCPNS2026Summary onSwitchTab={switchTab} />
            <HomeValueSummary onSwitchTab={switchTab} />
            <HomePricingSection
              plans={plans}
              resellerCode={resellerCode}
              customCheckoutLink={customCheckoutLink}
              discountPercentage={discountPercentage}
              onSwitchTab={switchTab}
            />
            <HomeTestimonialSummary onSwitchTab={switchTab} />
            <FinalCTA onSwitchTab={switchTab} />
          </>
        )}

        {activeTab === "keunggulan" && (
          <KeunggulanDetailTab onSwitchTab={switchTab} />
        )}

        {activeTab === "panduan" && (
          <section className="bg-slate-50/70 py-10 md:py-14">
            <div className="max-w-6xl mx-auto px-5 md:px-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                    Pusat Informasi Resmi CASN 2026
                  </p>
                  <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                    Panduan Lengkap Seleksi CPNS 2026
                  </h1>
                  <p className="mt-2 text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed">
                    Cek jadwal resmi, rincian 154.052 formasi, kebijakan dokumen
                    terbaru, hingga kisi-kisi &amp; passing grade SKD–SKB 2026.
                  </p>
                </div>
                <Link
                  href="/panduan-cpns-2026"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-4 py-2.5 rounded-full shadow-xs transition-colors shrink-0 self-start md:self-auto"
                >
                  Buka Versi Halaman Penuh
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
        )}

        {activeTab === "harga" && (
          <HargaPerbandinganTab
            plans={plans}
            resellerCode={resellerCode}
            customCheckoutLink={customCheckoutLink}
            discountPercentage={discountPercentage}
          />
        )}

        {activeTab === "testimoni" && (
          <TestimoniFaqTab onSwitchTab={switchTab} />
        )}
      </div>

      <Footer onSwitchTab={switchTab} />
      <StickyCTA onSwitchTab={switchTab} />
    </main>
  );
}
