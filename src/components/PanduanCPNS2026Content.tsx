'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Scale,
  Users,
  Sparkles,
  CheckCircle2,
  ClipboardList,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  FileCheck2,
  ArrowRight,
  Award,
  Printer,
  CheckSquare,
  Square
} from 'lucide-react';

export type PanduanTabId =
  | 'jadwal'
  | 'formasi'
  | 'kebijakan'
  | 'kisi'
  | 'alur'
  | 'semua';

interface PanduanCPNS2026ContentProps {
  isMember?: boolean;
  defaultTab?: PanduanTabId;
  showPrintButton?: boolean;
}

const CHECKLIST_STORAGE_KEY = 'klinikcpns_2026_doc_checklist';

const FORMASI_KLASTER_A = [
  {
    bidang: 'Kehutanan',
    alokasi: 70000,
    alokasiStr: '70.000',
    fokus: 'Polisi Hutan, Manggala Agni, dan teknis lapangan kehutanan'
  },
  {
    bidang: 'Dosen & Teknis Kependidikan Tinggi',
    alokasi: 26614,
    alokasiStr: '26.614',
    fokus: 'Tenaga pendidik perguruan tinggi dan tenaga penunjang akademik'
  },
  {
    bidang: 'Tenaga Kesehatan',
    alokasi: 13362,
    alokasiStr: '13.362',
    fokus: 'Dokter, perawat, bidan, dan tenaga medis pelayanan publik'
  },
  {
    bidang: 'Guru & Tenaga Kependidikan',
    alokasi: 3612,
    alokasiStr: '3.612',
    fokus: 'Sekolah terintegrasi dan Sekolah Unggul Garuda'
  },
  {
    bidang: 'Audit Internal Pemerintah',
    alokasi: 2007,
    alokasiStr: '2.007',
    fokus: 'Pengawasan keuangan dan tata kelola internal instansi'
  },
  {
    bidang: 'Pelayanan Pemenuhan Gizi',
    alokasi: 1618,
    alokasiStr: '1.618',
    fokus: 'Tenaga teknis program gizi nasional'
  },
  {
    bidang: 'Pengawasan Koperasi',
    alokasi: 986,
    alokasiStr: '986',
    fokus: 'Pengawas dan penguatan kelembagaan koperasi'
  }
];

const FORMASI_KLASTER_B = [
  { bidang: 'Hukum, HAM, Peradilan, dan Pemasyarakatan', alokasi: '19.016' },
  { bidang: 'Statistik dan Data Pembangunan', alokasi: '7.285' },
  { bidang: 'Swasembada Pangan dan Ekonomi Biru', alokasi: '4.496' },
  { bidang: 'Penerimaan dan Pengawasan Keuangan', alokasi: '2.867' },
  { bidang: 'Pembangunan Generasi Unggul Nasional', alokasi: '1.395' },
  { bidang: 'Keamanan, Siber, dan Diplomasi', alokasi: '785' }
];

const DOKUMEN_CHECKLIST = [
  {
    id: 'ktp',
    title: 'KTP Elektronik',
    desc: 'Atau surat keterangan kependudukan yang sah'
  },
  {
    id: 'kk',
    title: 'Kartu Keluarga (KK)',
    desc: 'Untuk validasi data kependudukan (NIK & Nomor KK)'
  },
  {
    id: 'transkrip',
    title: 'Transkrip Nilai / Akademik Asli',
    desc: 'Pindaian jelas sesuai ketentuan (cukup transkrip, tanpa unggah ijazah terpisah)'
  },
  {
    id: 'surat_gabungan',
    title: 'Gabungan Surat Lamaran & Surat Pernyataan',
    desc: '1 file PDF tunggal, bermeterai tempel/e-meterai dan bertanda tangan basah/digital'
  },
  {
    id: 'sertifikat',
    title: 'Sertifikat Pendukung / STR / Serdik / Akreditasi',
    desc: 'Khusus jabatan atau jalur afirmasi yang mensyaratkan'
  },
  {
    id: 'izin_ppk',
    title: 'Surat Persetujuan PPK/PyB',
    desc: 'Khusus pelamar berstatus PPPK atau PPPK Paruh Waktu'
  }
];

export default function PanduanCPNS2026Content({
  isMember = false,
  defaultTab = 'jadwal',
  showPrintButton = true
}: PanduanCPNS2026ContentProps) {
  const [activeTab, setActiveTab] = useState<PanduanTabId>(defaultTab);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (saved) {
        setCheckedDocs(JSON.parse(saved));
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const toggleDoc = (id: string) => {
    const updated = { ...checkedDocs, [id]: !checkedDocs[id] };
    setCheckedDocs(updated);
    try {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore localStorage errors
    }
  };

  const completedChecklistCount = DOKUMEN_CHECKLIST.filter(
    (d) => checkedDocs[d.id]
  ).length;

  const tabs: { id: PanduanTabId; label: string; icon: React.ElementType }[] = [
    { id: 'jadwal', label: 'Regulasi & Jadwal', icon: Calendar },
    { id: 'formasi', label: '154.052 Formasi', icon: Users },
    { id: 'kebijakan', label: 'Kebijakan Baru & Syarat', icon: Sparkles },
    { id: 'kisi', label: 'Kisi-Kisi & Passing Grade', icon: BookOpen },
    { id: 'alur', label: 'Alur & Checklist', icon: ClipboardList },
    { id: 'semua', label: 'Tampilkan Semua', icon: FileCheck2 }
  ];

  const showSection = (id: Exclude<PanduanTabId, 'semua'>) =>
    activeTab === 'semua' || activeTab === id;

  return (
    <div className="space-y-6">
      {/* INFO UTAMA BANNER */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> Informasi Resmi CASN 2026
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-blue-50 text-[11px] font-semibold">
                PermenPANRB No. 18/2026 &amp; KepmenPANRB No. 674/2026
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
              Panduan Lengkap Seleksi CPNS 2026: Jadwal, Formasi, Syarat &amp; Kisi-Kisi Resmi
            </h2>

            <p className="text-sm md:text-base text-blue-100 leading-relaxed">
              Pendaftaran seleksi CPNS Tahun Anggaran 2026 resmi dibuka mulai{' '}
              <strong className="text-white underline decoration-amber-400/80 underline-offset-4">
                Jumat, 27 November 2026
              </strong>{' '}
              melalui satu portal nasional di{' '}
              <a
                href="https://sscasn.bkn.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-amber-300 hover:text-amber-200 underline inline-flex items-center gap-1"
              >
                sscasn.bkn.go.id
                <ExternalLink className="w-3.5 h-3.5" />
              </a>{' '}
              dengan total <strong className="text-white">154.052 formasi</strong> prioritas nasional. Seluruh tahapan seleksi{' '}
              <strong className="text-emerald-300">tidak dipungut biaya (GRATIS)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 shrink-0">
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 text-center">
              <div className="text-xl md:text-2xl font-black text-amber-300 font-mono">
                154.052
              </div>
              <div className="text-[11px] font-semibold text-blue-100">
                Total Formasi Nasional
              </div>
            </div>
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 text-center">
              <div className="text-lg md:text-xl font-black text-white">
                27 Nov 2026
              </div>
              <div className="text-[11px] font-semibold text-blue-100">
                Pembukaan SSCASN
              </div>
            </div>
            {showPrintButton && (
              <button
                type="button"
                onClick={() => window.print()}
                className="col-span-2 sm:col-span-1 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer print:hidden"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / PDF Panduan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB NAVIGASI INTERAKTIF */}
      <div className="bg-slate-100/90 border border-slate-200 p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar print:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1 & 2. DASAR HUKUM & JADWAL TAHAPAN */}
      {showSection('jadwal') && (
        <div className="space-y-6">
          {/* 1. Dasar Hukum & Regulasi Resmi */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  1. Dasar Hukum &amp; Regulasi Resmi
                </h3>
                <p className="text-xs text-slate-500">
                  Kerangka regulasi pengadaan CPNS Tahun Anggaran 2026 (ditetapkan November 2026)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                  Regulasi 01
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  Undang-Undang Nomor 20 Tahun 2023
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tentang <em>Aparatur Sipil Negara (ASN)</em>.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                  Regulasi 02
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  PermenPANRB Nomor 18 Tahun 2026
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tentang <em>Pengadaan Pegawai Aparatur Sipil Negara</em>.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                  Regulasi 03 • 20 Nov 2026
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  KepmenPANRB Nomor 674 Tahun 2026
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mekanisme Seleksi Pengadaan PNS &amp; Nilai Ambang Batas SKD TA 2026.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Jadwal Tahapan Seleksi CPNS 2026 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  2. Jadwal Tahapan Seleksi CPNS 2026
                </h3>
                <p className="text-xs text-slate-500">
                  Linimasa utama berdasarkan kesepakatan Panitia Seleksi Nasional (Panselnas)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                    <th className="p-3.5">Tahapan Seleksi</th>
                    <th className="p-3.5">Jadwal Pelaksanaan</th>
                    <th className="p-3.5">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3.5 font-bold text-slate-900">
                      Pembukaan Pendaftaran &amp; Buat Akun
                    </td>
                    <td className="p-3.5 font-bold text-blue-600 whitespace-nowrap">
                      Mulai 27 November 2026
                    </td>
                    <td className="p-3.5 text-slate-600">
                      Daring melalui portal{' '}
                      <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">
                        sscasn.bkn.go.id
                      </code>
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3.5 font-bold text-slate-900">
                      Seleksi Administrasi
                    </td>
                    <td className="p-3.5 font-bold text-slate-800 whitespace-nowrap">
                      Pekan Pertama Desember 2026
                    </td>
                    <td className="p-3.5 text-slate-600">
                      Verifikasi dokumen unggahan oleh panitia instansi
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3.5 font-bold text-slate-900">
                      Seleksi Kompetensi Dasar (SKD)
                    </td>
                    <td className="p-3.5 font-bold text-indigo-700 whitespace-nowrap">
                      Januari – Maret 2027
                    </td>
                    <td className="p-3.5 text-slate-600">
                      Sistem CAT BKN di <strong>143 titik lokasi</strong> dalam negeri &amp; luar negeri
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3.5 font-bold text-slate-900">
                      Seleksi Kompetensi Bidang (SKB)
                    </td>
                    <td className="p-3.5 font-bold text-indigo-700 whitespace-nowrap">
                      Januari – Maret 2027
                    </td>
                    <td className="p-3.5 text-slate-600">
                      Dilaksanakan setelah pengumuman hasil SKD
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Catatan:</strong> Tanggal detail penutupan pendaftaran, masa sanggah, dan jadwal ujian per instansi mengikuti pengumuman resmi masing-masing kementerian/lembaga pada laman SSCASN.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* 3. RINCIAN 154.052 FORMASI */}
      {showSection('formasi') && (
        <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  3. Rincian 154.052 Formasi CPNS 2026
                </h3>
                <p className="text-xs text-slate-500">
                  Terbagi ke dalam dua klaster utama pembangunan nasional
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                PHTC: 118.208
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                Prioritas Lain: 35.844
              </span>
            </div>
          </div>

          {/* Klaster A */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[11px]">
                KLASTER A
              </span>
              <span>Program Hasil Terbaik Cepat (PHTC) &amp; Prioritas Presiden (118.208 Formasi)</span>
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                    <th className="p-3">Bidang / Sektor Prioritas</th>
                    <th className="p-3 text-center w-36">Alokasi Formasi</th>
                    <th className="p-3">Fokus Kebutuhan Jabatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {FORMASI_KLASTER_A.map((row) => (
                    <tr key={row.bidang} className="hover:bg-slate-50/70">
                      <td className="p-3 font-bold text-slate-900">{row.bidang}</td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold font-mono text-xs border border-blue-200">
                          {row.alokasiStr}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{row.fokus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Klaster B */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px]">
                KLASTER B
              </span>
              <span>Sektor Prioritas Nasional Lainnya (35.844 Formasi)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FORMASI_KLASTER_B.map((row) => (
                <div
                  key={row.bidang}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    {row.bidang}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-extrabold font-mono text-xs border border-indigo-200 shrink-0">
                    {row.alokasi}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4 & 5. KEBIJAKAN BARU & PERSYARATAN UMUM */}
      {showSection('kebijakan') && (
        <div className="space-y-6">
          {/* 4. Kebijakan Baru & Penyederhanaan Dokumen */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  4. Kebijakan Baru &amp; Penyederhanaan Dokumen 2026
                </h3>
                <p className="text-xs text-slate-500">
                  7 pembaruan penting yang mempermudah proses pendaftaran pelamar
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[
                {
                  title: 'Tanpa Unggah Ijazah Terpisah',
                  desc: 'Pelamar cukup mengunggah Transkrip Nilai/Akademik karena telah memuat identitas program studi dan indeks prestasi yang dibutuhkan.'
                },
                {
                  title: 'Tanpa Unggah Pasfoto di Awal',
                  desc: 'Kewajiban mengunggah file pasfoto terpisah pada tahap awal pendaftaran dihapuskan.'
                },
                {
                  title: 'Surat Lamaran & Pernyataan Digabung',
                  desc: 'Kedua surat digabung menjadi 1 dokumen PDF tunggal sehingga proses unggah lebih ringkas.'
                },
                {
                  title: 'Fleksibilitas Meterai & Tanda Tangan',
                  desc: 'Diperbolehkan menggunakan meterai tempel (kertas) maupun e-meterai, serta tanda tangan basah maupun tanda tangan digital.'
                },
                {
                  title: 'Peluang bagi PPPK & PPPK Paruh Waktu',
                  desc: 'Pegawai PPPK dan PPPK Paruh Waktu yang telah ber-NIP diperbolehkan mendaftar CPNS 2026 tanpa mengundurkan diri di awal (minimal masa kerja 1 tahun, kinerja min. baik, izin PPK/PyB).'
                },
                {
                  title: 'Opsi Menggunakan Skor SKD 2024',
                  desc: 'Pelamar SKD CPNS 2024 dapat memakai nilai SKD 2024 asalkan NIK sama, jenjang pendidikan sama, lulus administrasi 2026, dan nilai memenuhi passing grade 2026.'
                },
                {
                  title: 'Perluasan 143 Titik Lokasi CAT',
                  desc: 'Ujian CAT dilaksanakan di 143 titik lokasi dalam negeri (36 kantor BKN + 107 titik lokasi mandiri tambahan) serta titik lokasi luar negeri melalui perwakilan RI.'
                }
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className={`p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start gap-3 ${
                    idx === 6 ? 'md:col-span-2 bg-blue-50/50 border-blue-200' : ''
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Persyaratan Umum Pelamar */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  5. Persyaratan Umum Pelamar
                </h3>
                <p className="text-xs text-slate-500">
                  Ketentuan dasar yang wajib dipenuhi seluruh calon pelamar CPNS 2026
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  no: '1',
                  title: 'Usia Pelamar',
                  desc: 'Minimal 18 tahun dan maksimal 35 tahun saat melamar. (Batas maksimal hingga 40 tahun khusus Dokter Spesialis, Dokter Gigi Spesialis, Dokter Pendidik Klinis, serta Dosen/Peneliti S3/Doktor).'
                },
                {
                  no: '2',
                  title: 'Rekam Jejak Hukum',
                  desc: 'Tidak pernah dipidana penjara berdasarkan putusan pengadilan berkekuatan hukum tetap karena melakukan tindak pidana dengan pidana penjara 2 tahun atau lebih.'
                },
                {
                  no: '3',
                  title: 'Riwayat Kepegawaian',
                  desc: 'Tidak pernah diberhentikan dengan hormat tidak atas permintaan sendiri atau tidak dengan hormat sebagai PNS, PPPK, prajurit TNI, anggota Polri, atau pegawai swasta.'
                },
                {
                  no: '4',
                  title: 'Status Kepegawaian',
                  desc: 'Tidak berkedudukan sebagai calon PNS, PNS, prajurit TNI, atau anggota Polri.'
                },
                {
                  no: '5',
                  title: 'Netralitas Politik',
                  desc: 'Bukan anggota atau pengurus partai politik dan tidak terlibat politik praktis.'
                },
                {
                  no: '6',
                  title: 'Kualifikasi & Kesehatan',
                  desc: 'Memiliki kualifikasi pendidikan sesuai syarat jabatan, sehat jasmani dan rohani, serta bersedia ditempatkan di seluruh wilayah NKRI atau negara lain sesuai ketentuan instansi.'
                }
              ].map((req) => (
                <div
                  key={req.no}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3"
                >
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {req.no}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{req.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {req.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 6. KISI-KISI & PASSING GRADE SKD-SKB */}
      {showSection('kisi') && (
        <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  6. Kisi-Kisi &amp; Passing Grade SKD–SKB 2026
                </h3>
                <p className="text-xs text-slate-500">
                  Berdasarkan Lampiran I &amp; II KepmenPANRB Nomor 674 Tahun 2026 (substansi kisi-kisi tetap konsisten)
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>110 Soal | 100 Menit</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            <strong>Info Durasi Khusus:</strong> Durasi pengerjaan SKD bagi pelamar penyandang disabilitas sensorik netra adalah <strong>130 menit</strong>.
          </div>

          {/* A. Rincian Sub-Tes SKD */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                  <th className="p-3.5">Sub-Tes</th>
                  <th className="p-3.5 text-center">Soal</th>
                  <th className="p-3.5">Bobot Skor</th>
                  <th className="p-3.5 text-center">Passing Grade Umum</th>
                  <th className="p-3.5">Cakupan Materi Uji Resmi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                <tr>
                  <td className="p-3.5">
                    <div className="font-extrabold text-slate-900">TWK</div>
                    <div className="text-[11px] text-slate-500">(Wawasan Kebangsaan)</div>
                  </td>
                  <td className="p-3.5 text-center font-bold font-mono">30</td>
                  <td className="p-3.5 text-xs">
                    Benar: <strong className="text-emerald-700">+5</strong>
                    <br />
                    Salah/Kosong: <strong>0</strong>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-black font-mono border border-blue-200">
                      65
                    </span>
                  </td>
                  <td className="p-3.5 text-xs text-slate-700 space-y-0.5">
                    <div>• <strong>Nasionalisme</strong> &amp; <strong>Integritas</strong></div>
                    <div>• <strong>Bela Negara</strong> &amp; <strong>Bahasa Negara</strong></div>
                    <div>• <strong>Pilar Negara</strong> (Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika)</div>
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5">
                    <div className="font-extrabold text-slate-900">TIU</div>
                    <div className="text-[11px] text-slate-500">(Intelegensia Umum)</div>
                  </td>
                  <td className="p-3.5 text-center font-bold font-mono">35</td>
                  <td className="p-3.5 text-xs">
                    Benar: <strong className="text-emerald-700">+5</strong>
                    <br />
                    Salah/Kosong: <strong>0</strong>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-black font-mono border border-blue-200">
                      80
                    </span>
                  </td>
                  <td className="p-3.5 text-xs text-slate-700 space-y-0.5">
                    <div>• <strong>Verbal:</strong> Analogi, silogisme, analitis</div>
                    <div>• <strong>Numerik:</strong> Berhitung, deret angka, perbandingan kuantitatif, soal cerita</div>
                    <div>• <strong>Figural:</strong> Analogi gambar, ketidaksamaan, serial gambar</div>
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5">
                    <div className="font-extrabold text-slate-900">TKP</div>
                    <div className="text-[11px] text-slate-500">(Karakteristik Pribadi)</div>
                  </td>
                  <td className="p-3.5 text-center font-bold font-mono">45</td>
                  <td className="p-3.5 text-xs">
                    Skala: <strong className="text-emerald-700">1 – 5</strong>
                    <br />
                    Kosong: <strong>0</strong>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-black font-mono border border-blue-200">
                      166
                    </span>
                  </td>
                  <td className="p-3.5 text-xs text-slate-700 space-y-0.5">
                    <div>• <strong>Pelayanan Publik</strong>, <strong>Jejaring Kerja</strong> &amp; <strong>Sosial Budaya</strong></div>
                    <div>• <strong>Teknologi Informasi &amp; Komunikasi (TIK)</strong></div>
                    <div>• <strong>Profesionalisme</strong> &amp; <strong>Anti-Radikalisme</strong></div>
                  </td>
                </tr>
                <tr className="bg-slate-900 text-white">
                  <td className="p-3.5 font-extrabold">Total SKD</td>
                  <td className="p-3.5 text-center font-black font-mono">110</td>
                  <td className="p-3.5 font-bold text-amber-300">Maks. 550</td>
                  <td className="p-3.5 text-center font-black text-emerald-300 font-mono">
                    Min. 311
                  </td>
                  <td className="p-3.5 text-xs text-slate-300">
                    Wajib memenuhi ambang batas di setiap sub-tes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* B & C: Jalur Khusus & SKB */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* B. Jalur Kebutuhan Khusus */}
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/70 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" />
                B. Passing Grade Jalur Kebutuhan Khusus
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="font-bold text-slate-900">Lulusan Terbaik (Cum Laude) &amp; Diaspora</div>
                  <div className="text-slate-600 mt-0.5">
                    Nilai kumulatif minimal <strong>311</strong> dan nilai TIU minimal <strong>85</strong>.
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="font-bold text-slate-900">Penyandang Disabilitas &amp; Putra/Putri Papua</div>
                  <div className="text-slate-600 mt-0.5">
                    Nilai kumulatif minimal <strong>286</strong> dan nilai TIU minimal <strong>60</strong>.
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="font-bold text-slate-900">Olahragawan Berprestasi</div>
                  <div className="text-slate-600 mt-0.5">
                    Berdasarkan nilai terendah pelamar pada kategori kebutuhan khusus tersebut.
                  </div>
                </div>
              </div>
            </div>

            {/* C. Ketentuan SKB */}
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/70 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                C. Ketentuan Ujian CAT SKB (90 Menit)
              </h4>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900">
                Durasi pengerjaan bagi pelamar penyandang disabilitas sensorik netra adalah <strong>120 menit</strong>.
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>80 butir soal</strong> untuk jabatan yang materi SKB-nya <strong>dominan memuat operasi perhitungan</strong>.
                  </span>
                </li>
                <li className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>100 butir soal</strong> untuk jabatan yang materi SKB-nya <strong>tidak dominan memuat operasi perhitungan</strong>.
                  </span>
                </li>
                <li className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    Rincian materi pokok SKB per jabatan diterbitkan oleh KemenPANRB menjelang pelaksanaan tahap SKB.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 7. ALUR PENDAFTARAN & CHECKLIST INTERAKTIF */}
      {showSection('alur') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Langkah Pendaftaran SSCASN */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ArrowRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  7A. Alur Pendaftaran di SSCASN
                </h3>
                <p className="text-xs text-slate-500">
                  6 langkah resmi pendaftaran CPNS 2026
                </p>
              </div>
            </div>

            <ol className="space-y-3">
              {[
                <>
                  Akses portal resmi{' '}
                  <a
                    href="https://sscasn.bkn.go.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 underline"
                  >
                    https://sscasn.bkn.go.id
                  </a>{' '}
                  dan pilih menu <strong>Buat Akun</strong>.
                </>,
                <>
                  Validasi identitas kependudukan menggunakan <strong>NIK</strong>, <strong>Nomor KK</strong>, nama lengkap, tempat/tanggal lahir, nomor ponsel aktif, dan email pribadi.
                </>,
                <>
                  Lakukan swafoto (<em>selfie</em>) sesuai panduan sistem dan tetapkan kata sandi akun.
                </>,
                <>
                  Masuk (<em>login</em>) kembali ke akun SSCASN, lengkapi biodata, pilih jenis seleksi (<strong>CPNS</strong>), instansi, dan formasi jabatan sesuai kualifikasi pendidikan.
                </>,
                <>
                  Unggah dokumen yang dipersyaratkan sesuai format dan ukuran pada sistem.
                </>,
                <>
                  Periksa kembali seluruh data pada halaman resume, lakukan <strong>Akhiri Proses Pendaftaran (Submit)</strong>, lalu cetak <strong>Kartu Pendaftaran SSCASN 2026</strong>.
                </>
              ].map((step, i) => (
                <li
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed"
                >
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Interactive Checklist Dokumen Wajib */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      7B. Checklist Dokumen Wajib
                    </h3>
                    <p className="text-xs text-slate-500">
                      Centang berkas yang sudah Anda siapkan (tersimpan otomatis)
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-xs font-mono shrink-0">
                  {completedChecklistCount}/{DOKUMEN_CHECKLIST.length} Siap
                </span>
              </div>

              <div className="space-y-2.5">
                {DOKUMEN_CHECKLIST.map((doc) => {
                  const isChecked = Boolean(checkedDocs[doc.id]);
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => toggleDoc(doc.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50/60 border-emerald-300'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div
                          className={`text-xs sm:text-sm font-bold ${
                            isChecked ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {doc.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{doc.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-white">Siap Uji Kemampuan SKD 2026?</div>
                <div className="text-[11px] text-slate-300">
                  Latih 110 soal dalam 100 menit sesuai KepmenPANRB No. 674/2026.
                </div>
              </div>
              {isMember ? (
                <Link
                  href="/tryout-list"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs whitespace-nowrap text-center transition"
                >
                  Mulai Try Out →
                </Link>
              ) : (
                <Link
                  href="/login?mode=register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs whitespace-nowrap text-center transition"
                >
                  Daftar &amp; Latihan Gratis →
                </Link>
              )}
            </div>
          </section>
        </div>
      )}

      {/* SUMBER RESMI FOOTER */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          <strong>Sumber resmi:</strong> Kementerian PANRB (
          <a
            href="https://menpan.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            menpan.go.id
          </a>
          ), JDIH KemenPANRB (
          <a
            href="https://jdih.menpan.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            jdih.menpan.go.id
          </a>
          ), dan Badan Kepegawaian Negara (
          <a
            href="https://sscasn.bkn.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            sscasn.bkn.go.id
          </a>
          ).
        </div>
        {isMember && (
          <div className="flex items-center gap-2 shrink-0 print:hidden">
            <Link
              href="/dashboard/materi"
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 text-slate-700 font-bold rounded-lg transition"
            >
              📚 Buka Materi SKD
            </Link>
            <Link
              href="/tryout-list"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
            >
              📝 Mulai Try Out
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
