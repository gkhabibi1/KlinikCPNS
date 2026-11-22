// ==============================================================================
// KNOWLEDGE BASE RESMI KLINIK CPNS
// Digunakan oleh AI Auto-Responder untuk menjawab pertanyaan customer secara otomatis
// ==============================================================================

export interface KnowledgeItem {
  keywords: string[];
  topic: string;
  answer: string;
}

export const KLINIK_CPNS_KNOWLEDGE: KnowledgeItem[] = [
  {
    topic: 'Sapaan & Bantuan Awal',
    keywords: ['halo', 'hai', 'hello', 'assalam', 'pagi', 'siang', 'sore', 'malam', 'permisi', 'tes', 'test', 'siang min', 'pagi min'],
    answer: `Halo! Selamat datang di Klinik CPNS. 👋

Senang bisa menyapa Anda! Saya Asisten Virtual AI siap membantu memberikan informasi seputar:
• Aturan & target **30 Days CPNS Challenge**
• Standar **Passing Grade SKD BKN** (TWK, TIU, TKP)
• Program **Garansi Uang Kembali 100%**
• Paket simulasi CAT dan cara aktivasi otomatis (QRIS)

Ada yang ingin Anda tanyakan atau butuh panduan latihan hari ini?`
  },
  {
    topic: '30 Days Challenge & Aturan Anti-Curang',
    keywords: ['30 day', '30 days', 'challenge', 'tantangan', '30 hari', 'anti curang', 'kalkulator', 'pindah tab', 'gagal', 'ulang'],
    answer: `🏆 **Tentang 30 Days CPNS Challenge:**
Program tantangan intensif 30 hari berturut-turut untuk melatih konsistensi dan kesiapan CAT BKN:
• **Hari 1–10:** Minimal Passing Grade SKD (TWK ≥ 65, TIU ≥ 80, TKP ≥ 166).
• **Hari 11–20:** Target Total Skor ≥ 400.
• **Hari 21–30:** Target Total Skor ≥ 500.

🛡️ **Aturan Anti-Curang (Proctoring) Ketat:**
Selama ujian challenge berlangsung, Anda **dilarang berpindah tab browser atau membuka aplikasi lain (seperti kalkulator)**. Sistem akan mendeteksi otomatis; jika keluar dari halaman ujian atau terlewat 1 hari saja, challenge hari itu **langsung GAGAL** dan wajib diulang dari Hari ke-1.`
  },
  {
    topic: 'Garansi Uang Kembali 100%',
    keywords: ['garansi', 'klaim', 'uang kembali', 'refund', '100%', 'forms', 'klaim garansi'],
    answer: `💰 **Garansi Uang Kembali 100% Klinik CPNS:**
Jika Anda menyelesaikan seluruh **30 hari tantangan 30 Days Challenge** dengan nilai target tercapai tanpa putus, namun tetap tidak lolos tes CPNS resmi BKN, **uang Anda kami kembalikan 100%**!

Tombol *"Klaim Garansi"* akan otomatis aktif di dashboard Challenge Anda setelah Hari ke-30 berhasil diselesaikan.`
  },
  {
    topic: 'Passing Grade SKD CPNS',
    keywords: ['passing grade', 'ambang batas', 'pg', 'skor minimal', 'twk', 'tiu', 'tkp', 'syarat kelulusan'],
    answer: `📊 **Standar Passing Grade SKD CPNS Resmi BKN:**
1. **TWK (Tes Wawasan Kebangsaan):** Minimal 65 (30 soal, benar +5, salah/kosong 0)
2. **TIU (Tes Inteligensi Umum):** Minimal 80 (35 soal, benar +5, salah/kosong 0)
3. **TKP (Tes Karakteristik Pribadi):** Minimal 166 (45 soal, pembobotan nilai 1 sampai 5)

• Total soal: **110 soal** dalam waktu **100 menit**.
• Di 30 Days Challenge fase akhir (Hari 21–30), target ditingkatkan menjadi **Total Skor ≥ 500** agar Anda aman masuk peringkat teratas!`
  },
  {
    topic: 'Paket Langganan & Fitur Premium',
    keywords: ['harga', 'paket', 'biaya', 'beli', 'langganan', 'premium', 'fitur', 'berbayar', 'gratis'],
    answer: `✨ **Paket Belajar di Klinik CPNS:**
Kami menyediakan latihan try out gratis dan paket langganan Premium dengan benefit:
1. Akses puluhan paket try out simulasi CAT BKN persis ujian asli.
2. Pembahasan mendalam per soal (teks & rumus cepat).
3. Akses program eksklusif **30 Days CPNS Challenge** bergaransi 100%.
4. Analisis grafik perkembangan nilai & ranking nasional realtime.

Untuk melihat daftar harga paket aktif dan diskon hari ini, silakan kunjungi menu **Langganan** di dashboard akun Anda.`
  },
  {
    topic: 'Pembayaran & Aktivasi Paket',
    keywords: ['bayar', 'pembayaran', 'qris', 'midtrans', 'konfirmasi', 'transfer', 'belum aktif', 'pending'],
    answer: `💳 **Panduan Pembayaran & Aktivasi:**
• Pembayaran melalui **QRIS Dinamis Otomatis** akan langsung aktif dalam hitungan detik setelah Anda sukses melakukan scan dan transfer.
• Jika status pembayaran masih *"Pending"*, silakan tunggu 1–2 menit lalu coba **refresh halaman dashboard** Anda.
• Jika dalam 5 menit belum aktif atau butuh bantuan konfirmasi manual, Anda bisa langsung menghubungi WhatsApp Admin kami di **+62 851-9965-5534** dengan menyertakan bukti pembayaran.`
  },
  {
    topic: 'Kendala Akun & Login',
    keywords: ['lupa password', 'reset password', 'tidak bisa login', 'ganti email', 'password', 'akun'],
    answer: `🔐 **Bantuan Akun & Akses:**
• **Lupa Password:** Silakan klik tombol *"Lupa Password"* pada halaman login (/login), masukkan email Anda, dan periksa tautan reset password yang dikirimkan ke kotak masuk atau folder spam email Anda.
• **Ganti Nama/Profil:** Dapat dilakukan di menu **Profil Saya** di dashboard.
• Jika Anda tidak menerima email verifikasi, hubungi Admin via WhatsApp agar dapat dibantu reset langsung oleh tim teknis kami.`
  },
  {
    topic: 'Kontak WhatsApp Admin / Bantuan Manusia',
    keywords: ['hubungi admin', 'wa', 'whatsapp', 'admin', 'cs', 'customer service', 'manusia', 'telepon', 'kontak'],
    answer: `💬 **Layanan WhatsApp Admin Klinik CPNS:**
Jika Anda membutuhkan bantuan teknis langsung dari tim admin kami:
• **WhatsApp Admin:** [+62 851-9965-5534](https://wa.me/6285199655534)
• **Jam Operasional:** Setiap hari pukul 08.00 - 22.00 WIB.

Admin kami juga memantau percakapan di live chat ini secara berkala dan akan membalas pesan Anda di sini.`
  }
];

/**
 * Intelligent Fallback Intent Matching
 * Mencocokkan pertanyaan user dengan Knowledge Base secara akurat tanpa perlu API eksternal
 */
export function getKnowledgeAnswer(userQuestion: string): string | null {
  const normalized = userQuestion.toLowerCase().trim();

  // 1. Cek kecocokan berdasarkan topik & kata kunci
  let bestMatch: KnowledgeItem | null = null;
  let highestScore = 0;

  for (const item of KLINIK_CPNS_KNOWLEDGE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (normalized.includes(kw)) {
        score += kw.length; // Bobot lebih besar untuk kata kunci yang lebih spesifik
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore >= 3) {
    return bestMatch.answer;
  }

  return null;
}
