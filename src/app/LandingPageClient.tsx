"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
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
  const links = [
    { label: "Kenapa Sekarang", href: "#peluang" },
    { label: "Resep Kami", href: "#resep" },
    { label: "Paket", href: "#paket" },
    { label: "Testimoni", href: "#testimoni" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "#faq" },
  ];
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <img
            src="https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png"
            alt="Klinik CPNS Logo"
            className="h-9 md:h-10 w-auto object-contain"
          />
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
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
        <div className="lg:hidden border-t border-slate-100 bg-white px-5 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-slate-700"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
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

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-14 pb-20 md:pt-20 md:pb-28 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
            <FileText className="w-3.5 h-3.5" />
            Resep Sukses KlinikCPNS 2026
          </div>

          <h1 className="text-4xl md:text-[42px] lg:text-5xl font-extrabold text-slate-900 leading-[1.12] tracking-tight">
            Persiapkan Lolos CPNS 2026 bersama{" "}
            <span className="text-blue-600">KlinikCPNS</span> dengan Resep Simulasi CAT Terlengkap
          </h1>

          <p className="mt-5 text-base md:text-lg text-slate-600 leading-relaxed max-w-xl">
            Satu-satunya bimbel CPNS di{" "}
            <span className="font-semibold text-slate-900">KlinikCPNS</span> yang{" "}
            <span className="font-semibold text-slate-900">
              berani kasih GARANSI UANG KEMBALI
            </span>
            . Bukan janji kosong — ada resep dan aturan mainnya.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <a
              href="#paket"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-full transition-colors shadow-lg shadow-blue-200"
            >
              <Coffee className="w-4.5 h-4.5" />
              Mulai Try Out KlinikCPNS, Cuma Seharga Kopi
            </a>
            <a
              href="#resep"
              className="inline-flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-300 text-slate-700 font-semibold px-6 py-3.5 rounded-full transition-colors"
            >
              Lihat Resepnya
            </a>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-500"
                >
                  {i}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              <span className="font-bold text-slate-900">7.800+ member KlinikCPNS</span>{" "}
              sudah terdaftar dan latihan bareng kami
            </p>
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
              {["399 paket try out", "Simulasi CAT asli", "Materi terbaru"].map(
                (t) => (
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
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
            Kenapa Harus KlinikCPNS Sekarang
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Tahun ini, peluangmu lolos CPNS 2026 bersama KlinikCPNS lebih besar
          </h2>
          <p className="mt-5 text-slate-600 leading-relaxed">
            Berdasarkan data formasi yang dibuka, kesempatan CPNS 2026 lebih
            banyak dibanding tahun-tahun sebelumnya. Instansi butuh lebih
            banyak ASN baru — artinya peluangmu untuk diterima juga lebih
            terbuka.
          </p>
          <p className="mt-4 text-slate-900 font-semibold leading-relaxed">
            Tapi ingat: kalau cuma belajar teori tanpa latihan soal di KlinikCPNS, kamu
            tetap nggak akan lolos.
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Maka dari itu, di{" "}
            <span className="font-semibold text-slate-900">
              KlinikCPNS
            </span>
            , kami nggak cuma kasih materi — kami kasih{" "}
            <span className="font-semibold text-blue-600">resep KlinikCPNS</span>: satu
            paket latihan terarah yang sudah terbukti bikin member kami
            terbiasa menghadapi ujian asli.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 overflow-hidden rounded-2xl border border-slate-100 shadow-md">
            <img
              src="https://ik.imagekit.io/e2yna5qg8/Home%202.jpg"
              alt="Peluang Lolos CPNS 2026 - KlinikCPNS"
              className="w-full h-auto rounded-2xl"
            />
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 flex flex-col gap-1">
            <TrendingUp className="w-5 h-5 text-blue-600 mb-1" />
            <p className="text-2xl font-extrabold text-slate-900">Naik</p>
            <p className="text-xs text-slate-600 leading-snug">
              formasi dibuka dibanding tahun sebelumnya*
            </p>
          </div>
          <div className="bg-slate-900 rounded-2xl p-5 flex flex-col gap-1">
            <Users className="w-5 h-5 text-blue-400 mb-1" />
            <p className="text-2xl font-extrabold text-white">7.800+</p>
            <p className="text-xs text-slate-300 leading-snug">
              member sudah latihan bareng KlinikCPNS
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
    <section id="resep" className="bg-blue-50/50 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
            Resep Lolos KlinikCPNS
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            3 resep latihan KlinikCPNS yang bikin persiapanmu beda
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Setiap resep di KlinikCPNS dirancang untuk satu tujuan: bikin kamu terbiasa,
            bukan cuma tahu.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <RxCard
            eyebrow="Dosis Latihan KlinikCPNS"
            icon={ClipboardCheck}
            title="399 Paket Try Out CPNS Lengkap + Pembahasan KlinikCPNS"
            desc="Bank soal terbesar di KlinikCPNS dengan pembahasan detail di setiap butir, biar kamu ngerti bukan cuma hafal jawaban."
            imageLabel="Screenshot / bukti visual jumlah paket soal (399 paket) di dashboard"
            imageUrl="https://ik.imagekit.io/e2yna5qg8/ChatGPT%20Image%20Aug%2023,%202026,%2005_55_53%20AM_11zon.png"
          />
          <RxCard
            eyebrow="Simulasi Nyata KlinikCPNS"
            icon={Stethoscope}
            title="Simulasi CAT BKN Seperti Ujian Asli di KlinikCPNS"
            desc="Tampilan, waktu, dan sistem penilaian dibuat semirip mungkin dengan CAT BKN — nggak ada kejutan di hari-H."
            imageLabel="Screenshot tampilan simulasi CAT / interface ujian di aplikasi"
            imageUrl="https://ik.imagekit.io/e2yna5qg8/ChatGPT%20Image%20Aug%2023,%202026,%2005_59_08%20AM_11zon.png"
            reverse
          />
          <RxCard
            eyebrow="Materi Terkini KlinikCPNS"
            icon={FileText}
            title="Materi Terbaru Sesuai Kisi-Kisi Resmi KlinikCPNS"
            desc="Selalu diperbarui mengikuti kisi-kisi resmi terbaru, jadi kamu latihan soal CPNS yang relevan — bukan soal basi."
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
                Fitur Unggulan KlinikCPNS — Garansi Uang Kembali
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
                30 Days CPNS Challenge KlinikCPNS: Rahasia konsisten tanpa tapi
              </h2>

              <p className="mt-4 text-slate-300 text-base md:text-lg leading-relaxed">
                Tiap hari kamu wajib selesaikan 1 paket try out di KlinikCPNS dengan target
                nilai yang terus meningkat. Selesaikan 30 hari tanpa putus —
                kalau kamu tetap nggak lolos tes CPNS,{" "}
                <span className="font-bold text-white underline decoration-blue-400 underline-offset-4">
                  uangmu kami kembalikan 100% dari KlinikCPNS
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
                    Target: Total Skor ≥ 460
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
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
            Pilihan Resep Paket KlinikCPNS
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Investasi Paket KlinikCPNS Seharga Kopi untuk Masa Depan ASN
          </h2>
          <p className="mt-4 text-slate-600 text-base leading-relaxed">
            Pilih durasi resep KlinikCPNS yang paling sesuai dengan target persiapanmu.
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
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
            Testimoni Peserta KlinikCPNS
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Peserta KlinikCPNS Lolos Karena Rajin Latihan, Bukan Kebetulan
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
      q: "Apakah soal-soal try out di KlinikCPNS selalu di-update?",
      a: "Ya! Tim KlinikCPNS selalu memperbarui bank soal sesuai kisi-kisi resmi KemenPAN-RB & BKN terbaru.",
    },
  ];

  return (
    <section id="faq" className="bg-white py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
            FAQ KlinikCPNS
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Pertanyaan yang Sering Ditanyakan Tentang KlinikCPNS
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
    <section className="bg-blue-600 text-white py-20 md:py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 md:px-8 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
          Siap lolos CPNS 2026 bersama KlinikCPNS?
        </h2>
        <p className="mt-5 text-blue-100 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          Mulai latihan bersama KlinikCPNS sekarang sebelum pendaftaran dibuka. Makin awal kamu
          mulai di KlinikCPNS, makin besar peluangmu lolos.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#paket"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-extrabold text-base px-8 py-4 rounded-full transition-colors shadow-xl"
          >
            <Coffee className="w-5 h-5" />
            Ambil Resep Try Out KlinikCPNS Sekarang
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
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
          <a href="#peluang" className="hover:text-white transition-colors">
            Kenapa Sekarang
          </a>
          <a href="#resep" className="hover:text-white transition-colors">
            Resep Kami
          </a>
          <a href="#paket" className="hover:text-white transition-colors">
            Paket
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
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
