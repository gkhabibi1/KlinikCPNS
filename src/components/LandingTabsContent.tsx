"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Stethoscope,
  FileText,
  Flame,
  ShieldCheck,
  Star,
  BadgeCheck,
  ChevronDown,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Zap,
  Layers,
  Bot,
  Printer,
  Check,
  Minus,
  Sparkles,
  Image as ImageIcon,
  Award,
} from "lucide-react";

export type PlatformTab = "beranda" | "keunggulan" | "panduan" | "harga" | "testimoni";

export const formatExternalUrl = (url?: string) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export function resolvePackageCards(
  plans: any[],
  resellerCode?: string,
  customCheckoutLink?: string,
  discountPercentage = 0
): PlanCardProps[] {
  const formattedCustomLink = formatExternalUrl(customCheckoutLink);
  const fallbackUrl = formattedCustomLink || "/login?mode=register";

  if (plans.length > 0) {
    return plans.map((pkg, idx) => {
      const rawPrice = pkg.price || 0;
      const hasDiscount = discountPercentage > 0 && rawPrice > 0;
      const finalPriceVal = hasDiscount
        ? Math.round(rawPrice * (1 - discountPercentage / 100))
        : rawPrice;

      const formatPrice = (val: number) =>
        val === 0 ? "Gratis" : `Rp${val.toLocaleString("id-ID")}`;

      const benefitsList = pkg.subscription_benefits
        ? pkg.subscription_benefits.map((b: any) => b.benefit_text)
        : [
            "Akses Try Out SKD KlinikCPNS",
            "Pembahasan Soal Detail",
            "Sistem Ranking Nasional",
          ];

      const checkoutUrl = formattedCustomLink
        ? formattedCustomLink
        : resellerCode
        ? `/checkout/${pkg.id}?ref=${resellerCode}`
        : `/checkout/${pkg.id}`;

      return {
        name: pkg.name,
        price: formatPrice(finalPriceVal),
        rawPriceVal: finalPriceVal,
        durationDays: pkg.duration_days || 30,
        originalPrice: hasDiscount ? formatPrice(rawPrice) : undefined,
        period: `${pkg.duration_days} hari`,
        badge:
          idx === 1
            ? "Paling Populer"
            : hasDiscount
            ? "Harga Reseller 10% Off"
            : undefined,
        popular: idx === 1,
        desc:
          pkg.description ||
          "Akses penuh ke semua fitur simulasi CAT KlinikCPNS.",
        features: benefitsList,
        ctaText: "Pilih Paket Ini",
        href: checkoutUrl,
      };
    });
  }

  return [
    {
      name: "Paket 1 Bulan",
      price: "Rp49.000",
      rawPriceVal: 49000,
      durationDays: 30,
      period: "bulan",
      desc: "Cocok untuk pemanasan dan latihan cepat menjelang tes.",
      features: [
        "399 paket try out TWK, TIU, TKP",
        "Simulasi CAT BKN realtime (110 soal / 100 menit)",
        "Pembahasan detail & kunci jawaban",
        "Ranking nasional realtime",
      ],
      ctaText: "Ambil Paket 1 Bulan",
      href: fallbackUrl,
    },
    {
      name: "Paket 3 Bulan + Garansi",
      price: "Rp99.000",
      rawPriceVal: 99000,
      durationDays: 90,
      period: "3 bulan",
      badge: "Rekomendasi Utama",
      popular: true,
      desc: "Paket paling banyak dipilih member KlinikCPNS.",
      features: [
        "Semua fitur Paket 1 Bulan",
        "Akses 30 Days CPNS Challenge",
        "GARANSI UANG KEMBALI 100%",
        "Buku Evaluasi & AI Tutor Interaktif",
        "Update materi kisi-kisi 2026",
      ],
      ctaText: "Ambil Paket 3 Bulan",
      href: fallbackUrl,
    },
    {
      name: "Paket 6 Bulan Intensif",
      price: "Rp149.000",
      rawPriceVal: 149000,
      durationDays: 180,
      period: "6 bulan",
      desc: "Untuk persiapan matang jangka panjang sampai tahap SKB.",
      features: [
        "Semua fitur Paket 3 Bulan",
        "Garansi Uang Kembali 100%",
        "Akses materi P3K (opsional)",
        "Bank soal HOTS eksklusif & Speed Drill",
      ],
      ctaText: "Ambil Paket 6 Bulan",
      href: fallbackUrl,
    },
  ];
}

export interface PlanCardProps {
  name: string;
  price: string;
  rawPriceVal?: number;
  durationDays?: number;
  originalPrice?: string;
  period: string;
  badge?: string;
  popular?: boolean;
  desc: string;
  features: string[];
  ctaText: string;
  href: string;
}

export function PlanCard({
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
      className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
        popular
          ? "bg-slate-900 text-white shadow-2xl shadow-blue-900/25 ring-2 ring-blue-500 lg:scale-[1.02]"
          : "bg-white text-slate-900 border border-slate-200 shadow-sm hover:border-blue-200"
      }`}
    >
      {badge && (
        <span
          className={`absolute -top-3.5 left-6 sm:left-7 text-[11px] font-bold px-3 py-1 rounded-full ${
            popular
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-blue-50 text-blue-700 border border-blue-100"
          }`}
        >
          {badge}
        </span>
      )}

      <div>
        <h3 className="font-heading text-lg sm:text-xl font-extrabold tracking-tight mb-1">
          {name}
        </h3>
        <p
          className={`text-xs mb-5 ${
            popular ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {desc}
        </p>

        <div
          className={`flex flex-col mb-5 pb-5 border-b ${
            popular ? "border-slate-800" : "border-slate-100"
          }`}
        >
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

        <ul className="space-y-2.5 mb-7">
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

/* ----------------------------------------------------------------------- */
/*  Tab 2: Detail Keunggulan & Fitur Platform                              */
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

function RxCard({
  eyebrow,
  title,
  desc,
  icon: Icon,
  imageLabel,
  imageUrl,
  reverse,
}: RxCardProps) {
  return (
    <div
      className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:items-stretch ${
        reverse ? "lg:flex-row-reverse" : "lg:flex-row"
      }`}
    >
      <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col justify-center">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b-2 border-dashed border-blue-100">
          <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            Rx
          </span>
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            {eyebrow}
          </p>
        </div>
        <Icon className="w-7 h-7 text-blue-600 mb-3" strokeWidth={1.75} />
        <h3 className="font-heading text-xl font-bold text-slate-900 leading-snug">
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
          <div className="aspect-[16/10] rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/60 flex flex-col items-center justify-center gap-2 text-center px-6">
            <ImageIcon className="w-6 h-6 text-blue-300" />
            <p className="text-xs font-medium text-blue-400">{imageLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function KeunggulanDetailTab({
  onSwitchTab,
}: {
  onSwitchTab: (tab: PlatformTab) => void;
}) {
  const memberModules = [
    {
      icon: BookOpen,
      title: "Materi Berjenjang Sistem Unlock",
      desc: "32 subbab terstruktur untuk TWK (14 tahap), TIU (12 tahap), dan TKP (6 tahap) lengkap dengan checkpoint wajib lulus sebelum membuka materi berikutnya.",
    },
    {
      icon: Bot,
      title: "AI Tutor Interaktif di Setiap Modul",
      desc: "Bingung saat membaca konsep atau rumus? Tanya langsung ke asisten AI di dalam modul materi untuk penjelasan langkah demi langkah.",
    },
    {
      icon: BrainCircuit,
      title: "Buku Evaluasi & Bank Soal Salah",
      desc: "Setiap soal yang dijawab salah saat try out otomatis terkumpul agar kamu bisa remedial terarah dan mencetak rangkuman PDF A4.",
    },
    {
      icon: Zap,
      title: "Speed Drill & Mode Hafalan Cepat",
      desc: "Latih refleks membaca & berhitung di bawah tekanan waktu ditambah Flashcard interaktif dan Cheat Sheet Rumus Sakti.",
    },
    {
      icon: Layers,
      title: "Simulasi CAT Akurat Standar BKN",
      desc: "Navigasi nomor soal, penanda ragu-ragu, timer real-time 100 menit, dan pembobotan PG resmi (TWK 65, TIU 80, TKP 166).",
    },
    {
      icon: Printer,
      title: "Sertifikat Kelulusan & Ranking Nasional",
      desc: "Pantau posisi skor total terhadap ribuan peserta lain sekaligus unduh sertifikat hasil simulasi CAT.",
    },
  ];

  return (
    <div className="bg-slate-50/60 py-12 md:py-16 space-y-16">
      {/* Intro Header */}
      <section className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Ekosistem Belajar CPNS 2026
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Semua Fitur &amp; Keunggulan Platform KlinikCPNS
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              Dirancang bukan hanya sebagai tempat try out biasa, melainkan workspace belajar lengkap dari nol hingga siap menghadapi seleksi SKD CAT BKN 2026 sesuai{" "}
              <strong className="text-slate-900">PermenPANRB 18/2026</strong> &amp;{" "}
              <strong className="text-slate-900">KepmenPANRB 674/2026</strong>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onSwitchTab("harga")}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-full transition shadow-sm cursor-pointer"
            >
              Lihat Perbandingan Paket
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="/login?mode=register"
              className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm px-6 py-3 rounded-full transition"
            >
              Coba Akun Gratis
            </a>
          </div>
        </div>
      </section>

      {/* 6 Fitur Platform Member */}
      <section className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="mb-8">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            Fitur Di Dalam Member Area
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lebih Dari Sekadar Latihan Soal
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {memberModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <h3 className="font-heading text-base font-bold text-slate-900 mb-2">
                  {mod.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {mod.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 Pilar Resep */}
      <section className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            Metode Latihan Terarah
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
            3 Pilar Persiapan Standar Resmi 2026
          </h2>
        </div>
        <div className="flex flex-col gap-6">
          <RxCard
            eyebrow="01 · Bank Soal Lengkap"
            icon={ClipboardCheck}
            title="399 Paket Try Out + Pembahasan Detail"
            desc="Format resmi 110 soal (30 TWK, 35 TIU, 45 TKP) dalam 100 menit lengkap dengan pembahasan langkah demi langkah di setiap butir soal."
            imageLabel="Screenshot paket try out KlinikCPNS"
            imageUrl="https://ik.imagekit.io/e2yna5qg8/ChatGPT%20Image%20Aug%2023,%202026,%2005_55_53%20AM_11zon.png"
          />
          <RxCard
            eyebrow="02 · Simulasi CAT BKN"
            icon={Stethoscope}
            title="Tampilan & Passing Grade Resmi CPNS 2026"
            desc="Timer 100 menit dan sistem ambang batas (TWK 65, TIU 80, TKP 166, Total min. 311) dirancang persis seperti ujian CAT BKN sesungguhnya."
            imageLabel="Screenshot interface ujian CAT"
            imageUrl="https://ik.imagekit.io/e2yna5qg8/ChatGPT%20Image%20Aug%2023,%202026,%2005_59_08%20AM_11zon.png"
            reverse
          />
          <RxCard
            eyebrow="03 · Kurikulum Terkini"
            icon={FileText}
            title="Materi & Kisi-Kisi Terbaru KepmenPANRB 674/2026"
            desc="Selalu selaras dengan Lampiran I & II regulasi pemerintah 2026 — mulai dari Pilar Negara, Verbal/Numerik/Figural, hingga 6 aspek TKP termasuk Anti-Radikalisme."
            imageLabel="Rangkuman materi sesuai kisi-kisi"
            imageUrl="https://ik.imagekit.io/e2yna5qg8/ChatGPT%20Image%20Aug%2023,%202026,%2006_42_10%20AM_11zon.png"
          />
        </div>
      </section>

      {/* 30 Days Challenge Highlight */}
      <section className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="relative rounded-3xl bg-slate-900 p-7 sm:p-10 md:p-12 text-white overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5">
                <Flame className="w-4 h-4 text-amber-400" />
                Program Unggulan · Garansi Uang Kembali
              </div>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold leading-[1.15] tracking-tight">
                30 Days CPNS Challenge: Rahasia Konsisten Tanpa Tapi
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-[1.7]">
                Selesaikan 1 paket try out setiap hari dengan target skor yang terus naik. Jika kamu menuntaskan 30 hari tanpa putus namun belum lolos seleksi CPNS 2026,{" "}
                <span className="font-bold text-white underline decoration-blue-400 underline-offset-4">
                  uangmu kami kembalikan 100%
                </span>
                .
              </p>

              <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-6">
                <div>
                  <p className="text-xl font-extrabold text-blue-400">Hari 1–10</p>
                  <p className="text-xs text-slate-400 mt-1">Target: Lolos Passing Grade SKD</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-blue-400">Hari 11–20</p>
                  <p className="text-xs text-slate-400 mt-1">Target: Total Skor ≥ 400</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-blue-400">Hari 21–30</p>
                  <p className="text-xs text-slate-400 mt-1">Target: Total Skor ≥ 500</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl">
                <img
                  src="https://ik.imagekit.io/e2yna5qg8/ChatGPT%20Image%20Aug%2023,%202026,%2006_30_27%20AM_11zon.png"
                  alt="30 Days CPNS Challenge"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Tab 4: Harga & Perbandingan Detail                                     */
/* ----------------------------------------------------------------------- */
export function HargaPerbandinganTab({
  plans,
  resellerCode,
  customCheckoutLink,
  discountPercentage = 0,
}: {
  plans: any[];
  resellerCode?: string;
  customCheckoutLink?: string;
  discountPercentage?: number;
}) {
  const cards = resolvePackageCards(
    plans,
    resellerCode,
    customCheckoutLink,
    discountPercentage
  );

  // Gunakan hingga 3 kolom utama dari DB atau fallback untuk tabel perbandingan
  const colPlans = cards.slice(0, 3);

  const comparisonRows: Array<{
    feature: string;
    category: string;
    free: string | boolean;
    values: Array<string | boolean>;
  }> = [
    {
      category: "Bank Soal & Simulasi CAT",
      feature: "Akses 399+ Paket Try Out CAT BKN",
      free: "Paket Gratis Terbatas",
      values: colPlans.map(() => true),
    },
    {
      category: "Bank Soal & Simulasi CAT",
      feature: "Simulasi Timer 100 Menit & PG 2026 Resmi",
      free: true,
      values: colPlans.map(() => true),
    },
    {
      category: "Bank Soal & Simulasi CAT",
      feature: "Pembahasan Detail Tiap Butir Soal",
      free: "Terbatas",
      values: colPlans.map(() => true),
    },
    {
      category: "Bank Soal & Simulasi CAT",
      feature: "Sistem Ranking Nasional Realtime",
      free: false,
      values: colPlans.map(() => true),
    },
    {
      category: "Materi & Fitur Remedial",
      feature: "Materi Interaktif TWK, TIU, TKP",
      free: "Maks. Tahap 2 per Bidang",
      values: colPlans.map(() => "Seluruh 32 Tahap Terbuka"),
    },
    {
      category: "Materi & Fitur Remedial",
      feature: "AI Tutor Interaktif di Setiap Modul",
      free: "Tahap 1–2",
      values: colPlans.map(() => true),
    },
    {
      category: "Materi & Fitur Remedial",
      feature: "Rumus Sakti & Cheat Sheet + Cetak PDF",
      free: true,
      values: colPlans.map(() => true),
    },
    {
      category: "Materi & Fitur Remedial",
      feature: "Buku Evaluasi Soal Salah & Ekspor PDF",
      free: false,
      values: colPlans.map(() => true),
    },
    {
      category: "Materi & Fitur Remedial",
      feature: "Mode Kilat Speed Drill & Flashcard",
      free: false,
      values: colPlans.map(() => true),
    },
    {
      category: "Jaminan & Program Intensif",
      feature: "30 Days CPNS Challenge (Anti-Curang)",
      free: false,
      values: colPlans.map((_, idx) => (idx === 0 ? "Opsional" : true)),
    },
    {
      category: "Jaminan & Program Intensif",
      feature: "Garansi Uang Kembali 100%",
      free: false,
      values: colPlans.map((_, idx) => (idx === 0 ? false : true)),
    },
    {
      category: "Jaminan & Program Intensif",
      feature: "Update Soal Kisi-Kisi KepmenPANRB 674/2026",
      free: false,
      values: colPlans.map(() => "Gratis Selama Aktif"),
    },
  ];

  const renderCellValue = (val: string | boolean, highlight = false) => {
    if (val === true) {
      return (
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
            highlight
              ? "bg-blue-600 text-white"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
          <Minus className="w-3.5 h-3.5" />
        </span>
      );
    }
    return (
      <span
        className={`text-xs font-semibold ${
          highlight ? "text-blue-700" : "text-slate-700"
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <div className="bg-slate-50/60 py-12 md:py-16 space-y-16">
      {/* Pricing Cards Header */}
      <section className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold mb-3">
            <Award className="w-3.5 h-3.5" />
            Transparan · Tanpa Biaya Tersembunyi
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Pilihan Biaya &amp; Perbandingan Lengkap Paket Belajar
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Bandingkan fitur antar paket secara detail, hitung estimasi biaya harian, dan pilih durasi belajar yang sesuai jadwal ujian CPNS 2026-mu.
          </p>
        </div>

        {/* Kartu Paket */}
        <div className="grid md:grid-cols-3 gap-7 items-stretch">
          {cards.map((card, i) => (
            <PlanCard key={card.name + i} {...card} />
          ))}
        </div>

        {/* Breakdown Biaya Per Hari */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {colPlans.map((c) => {
            const perDay =
              c.rawPriceVal && c.durationDays
                ? Math.max(0, Math.round(c.rawPriceVal / c.durationDays))
                : 0;
            return (
              <div
                key={c.name}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-500">{c.name}</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {perDay === 0
                      ? "Gratis"
                      : `≈ Rp${perDay.toLocaleString("id-ID")} / hari`}
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  {c.period}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tabel Perbandingan Lengkap */}
      <section className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900">
              Tabel Perbandingan Fitur Antar Paket
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Lihat perbedaan akses akun gratis vs setiap paket berlangganan KlinikCPNS.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  <th className="py-4 px-5 w-[34%]">Fitur Platform</th>
                  <th className="py-4 px-4 text-center w-[16%] text-slate-500">
                    Akun Gratis
                  </th>
                  {colPlans.map((c, idx) => (
                    <th
                      key={c.name}
                      className={`py-4 px-4 text-center ${
                        idx === 1 ? "bg-blue-50/70 text-blue-700" : ""
                      }`}
                    >
                      <div>{c.name}</div>
                      <div className="text-[11px] font-bold text-slate-500 normal-case mt-0.5">
                        {c.price} / {c.period}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {row.category}
                      </div>
                      <div className="font-semibold text-slate-800 text-xs sm:text-sm mt-0.5">
                        {row.feature}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {renderCellValue(row.free)}
                    </td>
                    {row.values.map((v, vIdx) => (
                      <td
                        key={vIdx}
                        className={`py-3.5 px-4 text-center ${
                          vIdx === 1 ? "bg-blue-50/30" : ""
                        }`}
                      >
                        {renderCellValue(v, vIdx === 1)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Perbandingan Nilai vs Bimbel Offline */}
      <section className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              Perbandingan Nilai Investasi
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-extrabold leading-tight">
              Kenapa Lebih Hemat Dibanding Bimbel Tatap Muka?
            </h3>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Bimbel tatap muka umumnya memakan biaya Rp1.500.000 – Rp3.500.000 dengan jadwal kaku dan jumlah simulasi CAT terbatas. Di KlinikCPNS, cukup mulai dari harga segelas kopi per minggu dengan akses 24 jam penuh.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5">
              <p className="text-xs font-semibold text-slate-400">Bimbel Offline</p>
              <p className="text-xl font-extrabold text-slate-200 mt-1">Rp1,5jt–3,5jt</p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                <li>• Jadwal pertemuan tetap</li>
                <li>• Simulasi CAT terbatas</li>
                <li>• Tanpa garansi uang kembali</li>
              </ul>
            </div>
            <div className="bg-blue-600 border border-blue-400 rounded-2xl p-5 shadow-lg">
              <p className="text-xs font-bold text-blue-100">KlinikCPNS Pro</p>
              <p className="text-xl font-extrabold text-white mt-1">Mulai Rp49rb</p>
              <ul className="mt-3 space-y-1.5 text-xs text-blue-50">
                <li>✓ Akses 24/7 Web &amp; Mobile</li>
                <li>✓ 399+ Paket CAT + AI Tutor</li>
                <li>✓ Garansi Uang Kembali 100%</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Tab 5: Testimoni & FAQ                                                 */
/* ----------------------------------------------------------------------- */
export function TestimoniFaqTab({
  onSwitchTab,
}: {
  onSwitchTab: (tab: PlatformTab) => void;
}) {
  const [openIndex, setOpenIndex] = useState(0);

  const testimonials = [
    {
      name: "Dian A.",
      role: "Lolos di Kementerian Keuangan",
      photo: "/testimonials/testimonial-dian.jpg",
      quote:
        "Karena rutin latihan try out di KlinikCPNS tiap hari, pas ujian asli rasanya kayak udah pernah ngerjain sebelumnya. Nggak grogi sama sekali.",
    },
    {
      name: "Rangga P.",
      role: "Lolos di Pemkab, Formasi Guru",
      photo: "/testimonials/testimonial-rangga.jpg",
      quote:
        "30 Days Challenge KlinikCPNS bener-bener bantu saya konsisten. Biasanya males belajar, sekarang jadi ada targetnya tiap hari.",
    },
    {
      name: "Sri W.",
      role: "Lolos di Kemenkes",
      photo: "/testimonials/testimonial-sri.svg",
      quote:
        "Pembahasan soal di KlinikCPNS detail banget, jadi saya ngerti pola soal CAT bukan cuma nebak jawaban. Worth it banget.",
    },
  ];

  const faqs = [
    {
      q: "Apa itu platform KlinikCPNS?",
      a: "KlinikCPNS adalah platform latihan try out dan simulasi CAT BKN terdepan untuk membantu kamu bersiap menghadapi seleksi CPNS 2026, lengkap dengan pembahasan, AI Tutor, dan materi sesuai kisi-kisi terbaru.",
    },
    {
      q: "Gimana cara kerja garansi uang kembali di KlinikCPNS?",
      a: "Kamu perlu menyelesaikan 30 Days CPNS Challenge di KlinikCPNS dan mencapai target nilai yang ditentukan. Kalau syarat itu terpenuhi tapi kamu tetap belum lolos tes CPNS 2026, uangmu akan dikembalikan 100% oleh KlinikCPNS.",
    },
    {
      q: "Saya pemula banget, cocok nggak ikut KlinikCPNS?",
      a: "Sangat cocok! Materi dirancang berjenjang dari dasar hingga tahap lanjutan, lengkap dengan statistik perkembangan nilai dan Buku Evaluasi agar kamu tahu bagian mana yang harus ditingkatkan.",
    },
    {
      q: "Apakah soal-soal try out di KlinikCPNS sudah sesuai aturan CPNS 2026?",
      a: "Ya! Seluruh soal try out, pembobotan nilai, waktu 100 menit (110 soal), dan passing grade (TWK 65, TIU 80, TKP 166) di KlinikCPNS telah disesuaikan 100% menurut dokumen resmi pemerintah terbaru: PermenPANRB Nomor 18 Tahun 2026 dan KepmenPANRB Nomor 674 Tahun 2026.",
    },
    {
      q: "Kapan CPNS 2026 dibuka dan bagaimana jadwal SKD-nya?",
      a: "Berdasarkan pengumuman resmi, pendaftaran CPNS 2026 dibuka mulai Jumat, 27 November 2026 di portal sscasn.bkn.go.id dengan total 154.052 formasi, dilanjutkan seleksi administrasi pada pekan pertama Desember 2026, serta ujian SKD & SKB pada Januari–Maret 2027.",
    },
  ];

  return (
    <div className="bg-slate-50/50 py-12 md:py-16 space-y-16">
      {/* Testimoni */}
      <section className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            Cerita Alumni
          </p>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
            Lolos Karena Rajin Latihan, Bukan Kebetulan
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600">
            Pengalaman nyata peserta yang mempersiapkan ujian CAT bersama ekosistem KlinikCPNS.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={t.photo}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-blue-100 bg-blue-50"
                />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 w-fit px-2.5 py-1 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5" />
                Lolos CPNS bersama KlinikCPNS
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-5 md:px-8">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
              Pertanyaan Umum
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Yang Sering Ditanyakan Peserta
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {faqs.map((f, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={f.q} className="py-4 sm:py-5">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className="font-semibold text-slate-900 text-sm md:text-base">
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`w-4.5 h-4.5 text-blue-600 shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed pr-4 sm:pr-8">
                      {f.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-slate-600">
              Siap mulai simulasi CAT sesuai standar CPNS 2026?
            </p>
            <button
              type="button"
              onClick={() => onSwitchTab("harga")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full transition cursor-pointer"
            >
              Pilih Paket Belajar
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
