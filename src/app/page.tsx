"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
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
            Resep Sukses CPNS 2026
          </div>

          <h1 className="text-4xl md:text-[42px] lg:text-5xl font-extrabold text-slate-900 leading-[1.12] tracking-tight">
            Persiapkan Lolos CPNS 2026 dengan{" "}
            <span className="text-blue-600">Resep Simulasi CAT</span>{" "}
            Terlengkap
          </h1>

          <p className="mt-5 text-base md:text-lg text-slate-600 leading-relaxed max-w-xl">
            Satu-satunya bimbel CPNS yang{" "}
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
              Mulai Try Out, Cuma Seharga Kopi
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
              <span className="font-bold text-slate-900">7.800+ member</span>{" "}
              sudah terdaftar dan latihan bareng kami
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-xl shadow-blue-100/60">
            <img
              src="https://ik.imagekit.io/e2yna5qg8/Home%201.jpg"
              alt="Persiapkan Lolos CPNS 2026"
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
                Resep Klinik CPNS
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
            Satu-satunya yang berani{" "}
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
            Kenapa Harus Sekarang
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Tahun ini, peluangmu lolos CPNS lebih besar dari biasanya
          </h2>
          <p className="mt-5 text-slate-600 leading-relaxed">
            Berdasarkan data formasi yang dibuka, kesempatan CPNS 2026 lebih
            banyak dibanding tahun-tahun sebelumnya. Instansi butuh lebih
            banyak ASN baru — artinya peluangmu untuk diterima juga lebih
            terbuka.
          </p>
          <p className="mt-4 text-slate-900 font-semibold leading-relaxed">
            Tapi ingat: kalau cuma belajar teori tanpa latihan soal, kamu
            tetap nggak akan lolos.
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Maka dari itu, di{" "}
            <span className="font-semibold text-slate-900">
              Klinik CPNS
            </span>
            , kami nggak cuma kasih materi — kami kasih{" "}
            <span className="font-semibold text-blue-600">resep</span>: satu
            paket latihan terarah yang sudah terbukti bikin member kami
            terbiasa menghadapi ujian asli.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 overflow-hidden rounded-2xl border border-slate-100 shadow-md">
            <img
              src="https://ik.imagekit.io/e2yna5qg8/Home%202.jpg"
              alt="Peluang CPNS 2026"
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
              member sudah latihan bareng Klinik CPNS
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
  reverse?: boolean;
}

function RxCard({ eyebrow, title, desc, icon: Icon, imageLabel, reverse }: RxCardProps) {
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
        <ImageSlot
          label={imageLabel}
          ratio="aspect-[16/10] lg:aspect-auto lg:h-full"
        />
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
            Resep Klinik CPNS
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            3 resep yang bikin persiapanmu beda
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Setiap resep dirancang untuk satu tujuan: bikin kamu terbiasa,
            bukan cuma tahu.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <RxCard
            eyebrow="Dosis Latihan"
            icon={ClipboardCheck}
            title="399 Paket Try Out Lengkap + Pembahasan"
            desc="Bank soal terbesar dengan pembahasan detail di setiap butir, biar kamu ngerti bukan cuma hafal jawaban."
            imageLabel="Screenshot / bukti visual jumlah paket soal (399 paket) di dashboard"
          />
          <RxCard
            eyebrow="Simulasi Nyata"
            icon={Stethoscope}
            title="Simulasi CAT Seperti Ujian Asli"
            desc="Tampilan, waktu, dan sistem penilaian dibuat semirip mungkin dengan CAT BKN — nggak ada kejutan di hari-H."
            imageLabel="Screenshot tampilan simulasi CAT / interface ujian di aplikasi"
            reverse
          />
          <RxCard
            eyebrow="Materi Terkini"
            icon={FileText}
            title="Materi Terbaru Sesuai Kisi-Kisi"
            desc="Selalu diperbarui mengikuti kisi-kisi resmi terbaru, jadi kamu latihan soal yang relevan — bukan soal basi."
            imageLabel="Foto modul / rangkuman materi terbaru sesuai kisi-kisi"
          />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  30 Days Challenge                                                      */
/* ----------------------------------------------------------------------- */
function Challenge() {
  return (
    <section className="bg-slate-900 py-20 md:py-28 relative overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
            <Flame className="w-3.5 h-3.5" />
            Buat yang Mageran, Wajib Coba
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
            30 Days CPNS Challenge
          </h2>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Latihan konsisten itu berat kalau sendirian. Makanya kami bikin
            tantangan 30 hari — satu resep harian yang bikin kamu tetap jalan
            sampai hari ujian.
          </p>

          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-sm font-bold text-white mb-1">Hadiahnya?</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-blue-300">
                Garansi 100% uang kembali
              </span>{" "}
              kalau kamu sudah berhasil menyelesaikan 30 Days CPNS Challenge
              dan belum lolos tes CPNS 2026.
            </p>
          </div>

          <div className="mt-7 max-w-sm">
            <div className="aspect-[16/10] w-full rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center gap-2 text-center px-6">
              <ImageIcon className="w-6 h-6 text-white/30" strokeWidth={1.5} />
              <p className="text-xs font-medium text-white/40 leading-snug max-w-[220px]">
                Screenshot progres / tampilan 30 Days CPNS Challenge di
                aplikasi
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-2xl">
          <div className="flex items-center gap-2.5 mb-5">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-slate-900">
              Syarat Garansi 100% Uang Kembali
            </h3>
          </div>
          <ul className="space-y-4">
            {[
              "Menyelesaikan 30 Hari Challenge*",
              "Mendapatkan nilai sesuai target*",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 font-medium">
                  {t}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 pt-5 border-t border-dashed border-slate-200 text-xs text-slate-400">
            *Syarat dan ketentuan berlaku. Detail lengkap syarat &amp; target
            nilai dijelaskan saat kamu bergabung dengan challenge.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Pricing                                                                 */
/* ----------------------------------------------------------------------- */
/*  Pricing                                                                 */
/* ----------------------------------------------------------------------- */
interface PricingCardProps {
  id?: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  highlight?: boolean;
}

function formatPriceLabel(price: number): string {
  if (price >= 1000 && price % 1000 === 0) {
    return `Rp ${price / 1000}rb`;
  }
  return `Rp ${price.toLocaleString("id-ID")}`;
}

function PricingCard({ id, name, price, period, desc, features, highlight }: PricingCardProps) {
  const checkoutHref = id ? `/checkout/${id}` : "#paket";
  return (
    <div
      className={`relative rounded-3xl p-7 flex flex-col ${
        highlight
          ? "bg-slate-900 border border-slate-900 shadow-xl shadow-blue-100 lg:-translate-y-3"
          : "bg-white border border-slate-100"
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3.5 py-1 rounded-full">
          Paling Populer
        </span>
      )}
      <p
        className={`text-sm font-bold uppercase tracking-wide ${
          highlight ? "text-blue-400" : "text-blue-600"
        }`}
      >
        {name}
      </p>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span
          className={`text-3xl font-extrabold ${
            highlight ? "text-white" : "text-slate-900"
          }`}
        >
          {price}
        </span>
        <span
          className={`text-sm ${
            highlight ? "text-slate-400" : "text-slate-500"
          }`}
        >
          /{period}
        </span>
      </div>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          highlight ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {desc}
      </p>

      <ul className="mt-6 space-y-3 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <CheckCircle2
              className={`w-4.5 h-4.5 mt-0.5 shrink-0 ${
                highlight ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <span
              className={`text-sm ${
                highlight ? "text-slate-200" : "text-slate-600"
              }`}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={checkoutHref}
        className={`mt-7 inline-flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-full transition-colors ${
          highlight
            ? "bg-blue-600 hover:bg-blue-500 text-white"
            : "bg-blue-50 hover:bg-blue-100 text-blue-700"
        }`}
      >
        Pilih Paket Ini
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}

const DEFAULT_PLANS = [
  {
    id: "default-1",
    name: "Paket Pemula",
    price: 15000,
    period: "akses",
    desc: "Buat kamu yang mau coba dulu rasanya simulasi CAT asli.",
    features: [
      "5 paket try out pilihan",
      "Pembahasan singkat per soal",
      "Akses 7 hari",
    ],
  },
  {
    id: "default-2",
    name: "Paket Intensif",
    price: 49000,
    period: "bulan",
    desc: "Paket paling banyak dipilih member Klinik CPNS.",
    features: [
      "Akses 399 paket try out",
      "Pembahasan lengkap tiap soal",
      "Ikut 30 Days CPNS Challenge",
      "Progress & analisis nilai",
    ],
  },
  {
    id: "default-3",
    name: "Paket All Access",
    price: 99000,
    period: "sampai lolos",
    desc: "Paket lengkap dengan perlindungan Garansi Uang Kembali.",
    features: [
      "Semua fitur Paket Intensif",
      "Materi update otomatis",
      "Garansi 100% uang kembali*",
      "Prioritas grup diskusi mentor",
    ],
  },
];

function Pricing() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPricingPlans() {
      try {
        setIsLoading(true);
        // Ambil maksimal 3 paket aktif dari subscription_packages
        const { data: packagesData } = await supabase
          .from("subscription_packages")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true })
          .order("price", { ascending: true })
          .limit(3);

        let fetchedPlans: any[] = packagesData || [];

        // Fallback jika subscription_packages belum diisi di DB
        if (!fetchedPlans || fetchedPlans.length === 0) {
          const { data: plansData } = await supabase
            .from("subscription_plans")
            .select("*")
            .order("price", { ascending: true })
            .limit(3);
          if (plansData) fetchedPlans = plansData;
        }

        if (fetchedPlans && fetchedPlans.length > 0) {
          // Ambil maksimal 3 teratas
          const top3 = fetchedPlans.slice(0, 3);

          const plansWithBenefits = await Promise.all(
            top3.map(async (pkg) => {
              let bList: string[] = [];

              if (Array.isArray(pkg.benefits) && pkg.benefits.length > 0) {
                bList = pkg.benefits;
              } else if (typeof pkg.benefits === "string") {
                try {
                  bList = JSON.parse(pkg.benefits);
                } catch {
                  bList = [pkg.benefits];
                }
              }

              if (bList.length === 0) {
                const { data: bData } = await supabase
                  .from("subscription_benefits")
                  .select("benefit_text")
                  .eq("package_id", pkg.id)
                  .eq("is_active", true)
                  .order("display_order", { ascending: true });

                if (bData && bData.length > 0) {
                  bList = bData.map((b: any) => b.benefit_text);
                }
              }

              return {
                ...pkg,
                parsedBenefits: bList,
              };
            })
          );

          setPlans(plansWithBenefits);
        }
      } catch (err) {
        console.error("Error loading pricing plans:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPricingPlans();
  }, []);

  const displayPlans = plans.length > 0 ? plans : DEFAULT_PLANS;

  // Cari paket dengan harga di tengah-tengah (median) dari paket yang ditampilkan
  const sortedByPrice = [...displayPlans].sort(
    (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)
  );
  const middleIndex = Math.floor(sortedByPrice.length / 2);
  const middleTarget = sortedByPrice[middleIndex];
  const middleKey = middleTarget?.id || middleTarget?.name;

  return (
    <section id="paket" className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
            Paket Latihan
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Pilih resep yang sesuai kebutuhanmu
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Investasi kecil hari ini, peluang besar buat masa depan sebagai
            ASN. Semua paket bisa mulai dari harga secangkir kopi.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-5 items-start">
            {displayPlans.map((pkg) => {
              const currentKey = pkg.id || pkg.name;
              const isHighlight = currentKey === middleKey;
              const priceFormatted =
                typeof pkg.price === "number"
                  ? formatPriceLabel(pkg.price)
                  : pkg.price || "Rp 0";
              const periodFormatted = pkg.duration_months
                ? pkg.duration_months === 1
                  ? "bulan"
                  : pkg.duration_months >= 99
                  ? "sampai lolos"
                  : `${pkg.duration_months} bulan`
                : pkg.period || "akses";
              const features =
                pkg.parsedBenefits && pkg.parsedBenefits.length > 0
                  ? pkg.parsedBenefits
                  : pkg.features || [];

              return (
                <PricingCard
                  key={currentKey}
                  id={pkg.id}
                  name={pkg.name}
                  price={priceFormatted}
                  period={periodFormatted}
                  desc={pkg.description || pkg.desc || ""}
                  features={features}
                  highlight={isHighlight}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/*  Testimonials                                                           */
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
        Lolos CPNS
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
        "Karena rutin latihan try out tiap hari, pas ujian asli rasanya kayak udah pernah ngerjain sebelumnya. Nggak grogi sama sekali.",
    },
    {
      name: "Rangga P.",
      role: "Lolos di Pemkab, Formasi Guru",
      quote:
        "30 Days Challenge bener-bener bantu saya konsisten. Biasanya males belajar, sekarang jadi ada targetnya tiap hari.",
    },
    {
      name: "Sri W.",
      role: "Lolos di Kemenkes",
      quote:
        "Pembahasan soalnya detail banget, jadi saya ngerti pola soal CAT bukan cuma nebak jawaban. Worth it banget.",
    },
  ];
  return (
    <section id="testimoni" className="bg-blue-50/50 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
            Testimoni
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Mereka lolos karena rajin latihan, bukan kebetulan
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
      q: "Apa itu Klinik CPNS?",
      a: "Klinik CPNS adalah platform latihan try out dan simulasi CAT untuk membantu kamu bersiap menghadapi seleksi CPNS 2026, lengkap dengan pembahasan dan materi sesuai kisi-kisi terbaru.",
    },
    {
      q: "Gimana cara kerja garansi uang kembali?",
      a: "Kamu perlu menyelesaikan 30 Days CPNS Challenge dan mencapai target nilai yang ditentukan. Kalau syarat itu terpenuhi tapi kamu tetap belum lolos tes CPNS 2026, uangmu akan dikembalikan sesuai ketentuan yang berlaku.",
    },
    {
      q: "Soal try out-nya beneran mirip ujian asli?",
      a: "Iya. Simulasi CAT kami dibuat semirip mungkin dengan sistem CAT BKN, dari tampilan, waktu pengerjaan, sampai cara penilaian.",
    },
    {
      q: "Apakah materinya selalu update?",
      a: "Materi dan bank soal kami diperbarui mengikuti kisi-kisi resmi terbaru, jadi kamu nggak latihan pakai soal yang sudah ketinggalan zaman.",
    },
    {
      q: "Saya pemula banget, cocok nggak ikut Klinik CPNS?",
      a: "Cocok. Paket Pemula dirancang khusus buat kamu yang baru mulai, biar terbiasa dulu dengan format soal sebelum lanjut latihan intensif.",
    },
  ];
  return (
    <section id="faq" className="bg-white py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Pertanyaan yang sering ditanyakan
          </h2>
        </div>
        <div>
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
/*  Final CTA + Footer                                                     */
/* ----------------------------------------------------------------------- */
function FinalCTA() {
  return (
    <section className="bg-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
        <Timer className="w-8 h-8 text-blue-400 mx-auto mb-5" />
        <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
          Jangan tunggu sampai kuota formasi penuh
        </h2>
        <p className="mt-4 text-slate-300 max-w-xl mx-auto leading-relaxed">
          Mulai latihan hari ini, seharga secangkir kopi — dan biarkan resep
          kami yang membantu kamu siap menghadapi CAT CPNS 2026.
        </p>
        <a
          href="#paket"
          className="mt-8 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3.5 rounded-full transition-colors"
        >
          <Coffee className="w-4.5 h-4.5" />
          Mulai Try Out Sekarang
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-5 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <img
            src="https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png"
            alt="Klinik CPNS Logo"
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
          © 2026 Klinik CPNS. Semua hak dilindungi.
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
        Mulai Try Out, Cuma Seharga Kopi
      </a>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Page                                                                    */
/* ----------------------------------------------------------------------- */
export default function KlinikCPNSLandingPage() {
  return (
    <main className="font-sans antialiased bg-white pb-16 sm:pb-0">
      <Header />
      <Hero />
      <Opportunity />
      <Resep />
      <Challenge />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
      <StickyCTA />
    </main>
  );
}
