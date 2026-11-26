export type MainSkdCategory = 'TWK' | 'TIU' | 'TKP';

export const SKD_SUBCATEGORIES: Record<MainSkdCategory, string[]> = {
  TWK: [
    'Pilar Negara',
    'Nasionalisme',
    'Bela Negara',
    'Integritas',
    'Bahasa Negara',
    'TWK Umum',
  ],
  TIU: [
    'Verbal - Analogi',
    'Verbal - Silogisme',
    'Verbal - Analitis',
    'Numerik - Deret Angka',
    'Numerik - Perbandingan Kuantitatif',
    'Numerik - Berhitung',
    'Numerik - Soal Cerita',
    'Figural',
    'TIU Umum',
  ],
  TKP: [
    'Pelayanan Publik',
    'Jejaring Kerja',
    'Sosial Budaya',
    'Teknologi Informasi & Komunikasi',
    'Profesionalisme',
    'Anti Radikalisme',
    'TKP Umum',
  ],
};

export function normalizeCategory(raw?: string | null): MainSkdCategory {
  const upper = (raw || '').toUpperCase().trim();
  if (upper.includes('TIU')) return 'TIU';
  if (upper.includes('TKP')) return 'TKP';
  return 'TWK';
}

const SUBCATEGORY_RULES: Record<
  MainSkdCategory,
  Array<{ subCategory: string; keywords: RegExp[] }>
> = {
  TWK: [
    {
      subCategory: 'Bahasa Negara',
      keywords: [
        /\b(eyd|puebi|kalimat efektif|kata baku|tidak baku|ide pokok|gagasan utama|paragraf|imbuhan|afiks|konjungsi|tanda baca|ejaan|kutipan|daftar pustaka|sinonim baku|kesalahan penulisan|judul karangan)\b/i,
      ],
    },
    {
      subCategory: 'Integritas',
      keywords: [
        /\b(integritas|korupsi|kpk|gratifikasi|suap|nepotisme|kolusi|kkn|kejujuran|transparansi|akuntabilitas|amanah|kode etik|disiplin|benturan kepentingan|whistleblower|antikorupsi)\b/i,
      ],
    },
    {
      subCategory: 'Bela Negara',
      keywords: [
        /\b(bela negara|pertahanan|keamanan nasional|sishankamrata|tni|polri|ancaman militer|ancaman nonmiliter|agresi|spionase|sabotase|radikalisme|wawasan nusantara|geopolitik|geostrategi|ketahanan nasional|pasal 27 ayat 3|pasal 30)\b/i,
      ],
    },
    {
      subCategory: 'Pilar Negara',
      keywords: [
        /\b(pancasila|uud 1945|amandemen|pembukaan uud|alinea|pasal\s+\d+|mpr|dpr|dpd|mahkamah konstitusi|mahkamah agung|komisi yudisial|bpk|nkri|otonomi daerah|bhinneka tunggal ika|sila ke|butir pancasila|lambang negara|garuda|konstitusi|negara hukum|pemerintahan daerah)\b/i,
      ],
    },
    {
      subCategory: 'Nasionalisme',
      keywords: [
        /\b(nasionalisme|sumpah pemuda|budi utomo|proklamasi|kemerdekaan|bpupki|ppki|pergerakan nasional|pahlawan|patriotisme|cinta tanah air|persatuan bangsa|kolonialisme|penjajahan|kongres pemuda|piagam jakarta|bandung lautan api|soekarno|hatta)\b/i,
      ],
    },
  ],
  TIU: [
    {
      subCategory: 'Figural',
      keywords: [
        /\b(gambar|figural|rotasi|pencerminan|cermin|bangun datar|pola gambar|jaring-jaring|kubus|segitiga berikut|simetri)\b/i,
      ],
    },
    {
      subCategory: 'Verbal - Silogisme',
      keywords: [
        /\b(silogisme|premis|kesimpulan|simpulan|semua\b.*\bsebagian|sebagian\b.*\bsemua|jika\b.*\bmaka|tidak ada\b.*\byang|ekuivalen|negasi|modus ponens|modus tollens)\b/i,
      ],
    },
    {
      subCategory: 'Verbal - Analitis',
      keywords: [
        /\b(analitis|meja bundar|duduk bersebelahan|urutan|peringkat|jadwal|lebih tinggi dari|lebih tua dari|sebelah kiri|sebelah kanan|antrean|mengunjungi|rute)\b/i,
      ],
    },
    {
      subCategory: 'Verbal - Analogi',
      keywords: [
        /\b(analogi|padanan kata|hubungan kata)\b/i,
        /:\s*[^=]+::/,
        /\s:\s/,
      ],
    },
    {
      subCategory: 'Numerik - Deret Angka',
      keywords: [
        /\b(deret|barisan|pola bilangan|suku berikutnya|angka selanjutnya|lanjutkan pola)\b/i,
        /(\d+\s*,\s*){3,}\d+/,
      ],
    },
    {
      subCategory: 'Numerik - Perbandingan Kuantitatif',
      keywords: [
        /\b(perbandingan kuantitatif|hubungan\s+x\s+dan\s+y|hubungan\s+p\s+dan\s+q|manakah hubungan|kuantitas\s+p|kuantitas\s+q|x\s*[><=]\s*y|p\s*[><=]\s*q)\b/i,
      ],
    },
    {
      subCategory: 'Numerik - Soal Cerita',
      keywords: [
        /\b(kecepatan|jarak|waktu tempuh|berangkat pukul|tiba pukul|menyusul|berpapasan|usia|umur|pekerja|hari selesai|modal|untung|rugi|diskon|bunga|tabungan|koperasi|perbandingan senilai|berbalik nilai|rata-rata|peluang|kombinasi|permutasi|luas|keliling|volume)\b/i,
      ],
    },
    {
      subCategory: 'Numerik - Berhitung',
      keywords: [
        /\b(pecahan|desimal|persen|akar|kuadrat|pangkat|hitunglah|hasil dari|nilai dari|operasi hitung)\b/i,
        /[\d)]\s*[\+\-\*\/×÷]\s*[\d(]/,
      ],
    },
  ],
  TKP: [
    {
      subCategory: 'Anti Radikalisme',
      keywords: [
        /\b(radikal|radikalisme|terorisme|intoleran|intoleransi|ekstremisme|ujaran kebencian|hoaks provokatif|anti pancasila|memecah belah|diskriminatif|sara|kelompok garis keras|ideologi menyimpang)\b/i,
      ],
    },
    {
      subCategory: 'Teknologi Informasi & Komunikasi',
      keywords: [
        /\b(teknologi|aplikasi|sistem informasi|digital|komputer|laptop|software|perangkat lunak|online|daring|internet|website|database|e-government|otomatisasi|qr|barcode|media sosial|keamanan data|spreadsheet)\b/i,
      ],
    },
    {
      subCategory: 'Pelayanan Publik',
      keywords: [
        /\b(pelayanan publik|masyarakat|warga|pemohon|pasien|pelanggan|loket|antrean|keluhan|komplain|aduan|front office|sop pelayanan|ramah|disabilitas|lansia|ibu hamil|birokrasi)\b/i,
      ],
    },
    {
      subCategory: 'Sosial Budaya',
      keywords: [
        /\b(budaya|adat|tradisi|suku|agama|ras|bahasa daerah|toleransi|keberagaman|multikultural|lingkungan sekitar|tetangga|gotong royong|warga baru|penempatan daerah|mutasi daerah)\b/i,
      ],
    },
    {
      subCategory: 'Jejaring Kerja',
      keywords: [
        /\b(jejaring kerja|kerja sama|kerjasama|kolaborasi|tim kerja|rekan kerja|divisi lain|antar unit|lintas instansi|mitra|relasi|koordinasi|rapat|musyawarah|konflik tim|anggota tim)\b/i,
      ],
    },
    {
      subCategory: 'Profesionalisme',
      keywords: [
        /\b(profesional|atasan|pimpinan|tenggat waktu|deadline|lembur|target kerja|tanggung jawab|tugas mendadak|mutu|kualitas kerja|prioritas|kinerja|evaluasi kerja|cuti|liburan|tugas dinas)\b/i,
      ],
    },
  ],
};

/**
 * Mengklasifikasikan soal CPNS secara otomatis ke dalam sub-bidang resmi SKD.
 */
export function detectQuestionSubcategory(
  category: string | null | undefined,
  questionText: string | null | undefined,
  explanation?: string | null
): string {
  const mainCat = normalizeCategory(category);
  const combined = `${questionText || ''} ${explanation || ''}`;

  const rules = SUBCATEGORY_RULES[mainCat];
  for (const rule of rules) {
    if (rule.keywords.some((regex) => regex.test(combined))) {
      return rule.subCategory;
    }
  }

  return `${mainCat} Umum`;
}

export interface QuestionBankPayloadInput {
  source_question_id?: string | null;
  source_package_id?: string | null;
  source_package_name?: string | null;
  question_category?: string | null;
  category?: string | null;
  sub_category?: string | null;
  question_text: string;
  question_image_url?: string | null;
  option_a?: string | null;
  option_a_image_url?: string | null;
  option_b?: string | null;
  option_b_image_url?: string | null;
  option_c?: string | null;
  option_c_image_url?: string | null;
  option_d?: string | null;
  option_d_image_url?: string | null;
  option_e?: string | null;
  option_e_image_url?: string | null;
  correct_answer?: string | null;
  explanation?: string | null;
  tkp_scores?: any;
}

/**
 * Menyiapkan payload standar untuk penyimpanan ke tabel question_bank.
 */
export function buildQuestionBankPayload(input: QuestionBankPayloadInput) {
  const category = normalizeCategory(input.question_category || input.category);
  const subCategory =
    input.sub_category && input.sub_category.trim()
      ? input.sub_category.trim()
      : detectQuestionSubcategory(category, input.question_text, input.explanation);

  return {
    source_question_id: input.source_question_id || null,
    source_package_id: input.source_package_id || null,
    source_package_name: input.source_package_name || null,
    category,
    sub_category: subCategory,
    question_text: input.question_text,
    question_image_url: input.question_image_url || null,
    option_a: input.option_a || '',
    option_a_image_url: input.option_a_image_url || null,
    option_b: input.option_b || '',
    option_b_image_url: input.option_b_image_url || null,
    option_c: input.option_c || '',
    option_c_image_url: input.option_c_image_url || null,
    option_d: input.option_d || '',
    option_d_image_url: input.option_d_image_url || null,
    option_e: input.option_e || '',
    option_e_image_url: input.option_e_image_url || null,
    correct_answer: input.correct_answer || 'A',
    explanation: input.explanation || '',
    tkp_scores: input.tkp_scores || null,
  };
}
