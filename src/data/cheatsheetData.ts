export interface CheatSheetItem {
  id: string;
  category: 'tiu' | 'tkp' | 'twk';
  title: string;
  badge: string;
  summary: string;
  keyFormula: string;
  exampleOrTrick?: string;
}

export const CHEATSHEET_DATA: CheatSheetItem[] = [
  // ==========================================
  // TIU - RUMUS SAKTI & TRIK HITUNG CEPAT
  // ==========================================
  {
    id: 'tiu-pecahan-istimewa',
    category: 'tiu',
    title: 'Tabel Pecahan & Persen Istimewa',
    badge: 'Trik Aritmatika',
    summary: 'Sering muncul di soal hitung cepat desimal & persen. Jangan dihitung manual, langsung hafalkan padanan pecahannya!',
    keyFormula: `• 1/2 = 50% = 0,5
• 1/3 = 33,33% = 0,333... | 2/3 = 66,67% = 0,667
• 1/4 = 25% = 0,25 | 3/4 = 75% = 0,75
• 1/5 = 20% = 0,2 | 2/5 = 40% | 3/5 = 60% | 4/5 = 80%
• 1/6 = 16,67% = 0,1667 | 5/6 = 83,33% = 0,8333
• 1/8 = 12,5% = 0,125 | 3/8 = 37,5% = 0,375 | 5/8 = 62,5% = 0,625 | 7/8 = 87,5% = 0,875
• 1/9 = 11,11% | 1/11 = 9,09%`,
    exampleOrTrick: 'Contoh: 37,5% dari 640 = (3/8) × 640 = 3 × 80 = 240 (Selesai dalam 3 detik!).'
  },
  {
    id: 'tiu-perbandingan-berbalik',
    category: 'tiu',
    title: 'Perbandingan Berbalik Nilai & Proyek Terhenti',
    badge: 'Aljabar & Cerita',
    summary: 'Digunakan untuk hubungan Pekerja vs Hari, Kecepatan vs Waktu (Semakin banyak pekerja, semakin sedikit waktu).',
    keyFormula: `• Rumus Dasar: P1 × H1 = P2 × H2 (Kali Lurus)

• Rumus Trik Sakti "Proyek Terhenti":
  P_tambahan = (Pekerja Awal × Hari Terhenti) / Sisa Hari`,
    exampleOrTrick: 'Contoh: 20 pekerja target 30 hari. Berjalan 10 hari, lalu libur 5 hari. Berapa pekerja tambahan agar selesai tepat waktu?\nJawab: Sisa hari = 30 - 10 - 5 = 15 hari. P_tambahan = (20 × 5) / 15 = 100 / 15 ≈ 7 orang.'
  },
  {
    id: 'tiu-kecepatan-papasan',
    category: 'tiu',
    title: 'Kecepatan, Jarak & Waktu (Papasan & Susul)',
    badge: 'Gerak Lurus',
    summary: 'Rumus paten papasan dua kendaraan berlawanan arah atau susul-menyusul satu arah.',
    keyFormula: `• Papasan Waktu Berangkat SAMA:
  t_papasan = Jarak Total / (v1 + v2)

• Papasan Waktu Berangkat BEDA:
  t_papasan = (Jarak Total - Jarak yang sudah ditempuh orang pertama) / (v1 + v2)

• Waktu Menyusul (Searah):
  t_susul = (Selisih Jarak Awal) / (v2 - v1)   [dimana v2 > v1]`,
    exampleOrTrick: 'Tips CAT: Selisih jarak awal orang pertama = v1 × selisih jam keberangkatan.'
  },
  {
    id: 'tiu-silogisme-logika',
    category: 'tiu',
    title: 'Hukum Penarikan Kesimpulan (Silogisme)',
    badge: 'Penalaran Logis',
    summary: 'Pedoman mutlak logika agar tidak terjebak opini pribadi.',
    keyFormula: `1. Modus Ponens:
   Premis 1: P → Q
   Premis 2: P
   Kesimpulan: Q

2. Modus Tollens:
   Premis 1: P → Q
   Premis 2: ~Q (Bukan Q)
   Kesimpulan: ~P (Bukan P)

3. Silogisme:
   Premis 1: P → Q
   Premis 2: Q → R
   Kesimpulan: P → R

4. Hukum Ingkaran Kuantor:
   • Ingkaran "Semua A adalah B" = "Ada/Beberapa A yang BUKAN B"
   • Ingkaran "Ada A yang B" = "Semua A BUKAN B"`,
    exampleOrTrick: 'Jebakan: P → Q dan Q terjadi, kesimpulannya BUKAN P! Itu kesimpulan yang tidak sah (fallacy).'
  },
  {
    id: 'tiu-aritmatika-sosial',
    category: 'tiu',
    title: 'Aritmatika Sosial (Untung, Diskon, Bruto-Netto)',
    badge: 'Ekonomi Matematika',
    summary: 'Rumus cepat perdagangan dan persentase.',
    keyFormula: `• %Untung = (Untung / Harga Beli) × 100%
• Harga Jual (Untung) = Harga Beli × (100 + %Untung)%
• Harga Beli (saat Untung) = Harga Jual / (100 + %Untung)%
• Diskon Bertingkat (d1% + d2%):
  Total Bayar = Harga × (1 - d1%) × (1 - d2%)
• Bruto = Netto + Tara | %Tara = (Tara / Bruto) × 100%`,
    exampleOrTrick: 'Trik Diskon 50% + 20%: BUKAN 70%! Tapi bayar 50% × 80% = 40% (Total diskon riil = 60%).'
  },

  // ==========================================
  // TKP - FORMULA KATA KUNCI JAWABAN SKOR 5
  // ==========================================
  {
    id: 'tkp-pelayanan-publik',
    category: 'tkp',
    title: 'Pelayanan Publik (Bobot Paling Sering Muncul)',
    badge: 'Skor 5 TKP',
    summary: 'Kunci pola pikir ASN sebagai pelayan masyarakat, bukan pihak yang minta dilayani.',
    keyFormula: `• KATA KUNCI SKOR 5:
  "Responsif, Cepat & Tuntas, Sopan/Empati, Sesuai SOP, Tidak Diskriminatif, Menolak Gratifikasi"

• Trik Pilihan Terbaik:
  1. Jika ada warga komplain: Dengarkan keluhan tanpa memotong → Minta maaf atas ketidaknyamanan → Segera cari solusi sesuai wewenang.
  2. Jika ada tawaran uang tip / oleh-oleh: Tolak dengan santun dan jelaskan bahwa pelayanan adalah kewajiban dinas yang bebas biaya.`,
    exampleOrTrick: 'Jebakan Skor 1-2: Menyuruh warga datang lagi besok, melimpahkan ke teman padahal itu wewenangnya, atau marah balik.'
  },
  {
    id: 'tkp-jejaring-kerja',
    category: 'tkp',
    title: 'Jejaring Kerja & Kolaborasi Tim',
    badge: 'Skor 5 TKP',
    summary: 'Mengutamakan keberhasilan kelompok dan sinergi lintas divisi daripada kepentingan/ego pribadi.',
    keyFormula: `• KATA KUNCI SKOR 5:
  "Musyawarah, Komunikasi Terbuka, Mau Berbagi Pengetahuan, Menghargai Masukan Rekan, Saling Membantu"

• Trik Pilihan Terbaik:
  1. Bila ada rekan kerja yang kewalahan: Tawarkan bantuan setelah tugas pokok sendiri beres.
  2. Bila terjadi konflik ide antar anggota: Ajak duduk bersama, diskusikan kelebihan & kekurangan tiap ide, ambil keputusan mufakat yang paling menguntungkan organisasi.`,
    exampleOrTrick: 'Jebakan Skor 1: Bekerja sendiri-sendiri tanpa koordinasi atau merasa diri paling pintar.'
  },
  {
    id: 'tkp-sosial-budaya',
    category: 'tkp',
    title: 'Sosial Budaya & Adaptasi Lingkungan',
    badge: 'Skor 5 TKP',
    summary: 'Menghargai keragaman suku, agama, ras, dan adat istiadat di tempat penugasan.',
    keyFormula: `• KATA KUNCI SKOR 5:
  "Toleransi Tinggi, Cepat Menyesuaikan Diri, Tidak Etnosentris, Terbuka Belajar Budaya Baru, Menjaga Kerukunan"

• Trik Pilihan Terbaik:
  Jika ditempatkan di daerah pelosok/asing: Pelajari adat setempat, hormati norma lokal, berbaur secara ramah dengan warga, jangan memaksakan budaya asal.`,
    exampleOrTrick: 'Jebakan: Menolak penempatan karena beda suku/agama atau mengkritik tradisi lokal.'
  },
  {
    id: 'tkp-tik',
    category: 'tkp',
    title: 'Teknologi Informasi & Komunikasi (TIK)',
    badge: 'Skor 5 TKP',
    summary: 'Kesiapan dan antusiasme memanfaatkan teknologi modern untuk mempermudah pekerjaan birokrasi.',
    keyFormula: `• KATA KUNCI SKOR 5:
  "Adaptif Digital, Mau Belajar Aplikasi Baru, Solutif Berbasis Teknologi, Membantu Rekan yang Gagap Teknologi"

• Trik Pilihan Terbaik:
  Jika kantor menerapkan software baru yang rumit: Ikuti pelatihan dengan antusias, pelajari manualnya, terapkan langsung dalam kerja, bantu rekan senior yang belum mahir.`,
    exampleOrTrick: 'Jebakan: Mengeluh sistem baru bikin ribet atau minta tetap memakai cara manual kertas.'
  },
  {
    id: 'tkp-profesionalisme',
    category: 'tkp',
    title: 'Profesionalisme & Integritas Kerja',
    badge: 'Skor 5 TKP',
    summary: 'Mengutamakan tugas negara di atas kepentingan pribadi dan bekerja tuntas sesuai standar mutu.',
    keyFormula: `• KATA KUNCI SKOR 5:
  "Tepat Waktu, Bertanggung Jawab Penuh, Memisahkan Urusan Pribadi & Kantor, Disiplin, Tidak Mudah Terpengaruh"

• Trik Pilihan Terbaik:
  Jika ada urusan keluarga mendesak bersamaan dengan deadline tugas kantor: Selesaikan kewajiban kantor yang kritis terlebih dahulu / delegasikan secara resmi sesuai izin atasan.`,
    exampleOrTrick: 'Jebakan: Meninggalkan pekerjaan dinas tanpa izin atasan demi urusan pribadi.'
  },
  {
    id: 'tkp-anti-radikalisme',
    category: 'tkp',
    title: 'Anti Radikalisme & Komitmen Kebangsaan',
    badge: 'Skor 5 TKP',
    summary: 'Kesetiaan mutlak kepada Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika.',
    keyFormula: `• KATA KUNCI SKOR 5:
  "Tegas Menolak Paham Ekstrem, Mengedepankan Dialog Damai, Berani Melaporkan Indikasi Radikalisme, Tidak Golput"

• Trik Pilihan Terbaik:
  Jika melihat rekan kerja menyebarkan ujaran kebencian/intoleransi di grup WA kantor: Ingatkan dengan santun terlebih dahulu bahwa ASN wajib netral, jika berulang laporkan ke bagian kepegawaian/atasan.`,
    exampleOrTrick: 'Jebakan: Diam saja membiarkan karena takut dimusuhi rekan.'
  },

  // ==========================================
  // TWK - PETA KONSEP PASAL & SEJARAH
  // ==========================================
  {
    id: 'twk-pasal-krusial',
    category: 'twk',
    title: 'Daftar Pasal Paling Sering Diuji di SKD',
    badge: 'Konstitusi UUD 1945',
    summary: 'Hafalan pasal-pasal kunci yang menjadi langganan soal penalaran TWK BKN.',
    keyFormula: `• Pasal 1 (Bentuk & Kedaulatan): (1) Kesatuan/Republik, (2) Kedaulatan rakyat menurut UUD, (3) Negara Hukum.
• Pasal 7A - 7B (Impeachment): DPR usul → MK periksa & uji → MPR putus (hadir min 3/4, setuju min 2/3).
• Pasal 14 (Hak Prerogatif Presiden): Grasi & Rehabilitasi (Pertimbangan MA); Amnesti & Abolisi (Pertimbangan DPR).
• Pasal 18 (Otonomi Daerah): NKRI dibagi atas daerah provinsi, kabupaten, kota yang memiliki asas otonomi seluas-luasnya.
• Pasal 27 (Kedudukan Warga): (1) Hukum & Pemerintahan, (2) Pekerjaan layak, (3) Kewajiban Bela Negara.
• Pasal 28A-J (HAM Lengkap): 28I mengatur Hak Asasi yang TIDAK DAPAT DIKURANGI dalam keadaan apapun (Hak hidup, bebas dari siksaan, hati nurani, beragama, tidak diperbudak).
• Pasal 30 (Hankam): Sishankamrata (TNI pertahanan, Polri ketertiban, rakyat pendukung).
• Pasal 31 (Pendidikan): Anggaran pendidikan minimal 20% dari APBN dan APBD.
• Pasal 33 (Perekonomian): Asas kekeluargaan, cabang produksi penting dikuasai negara, bumi air untuk rakyat.
• Pasal 34 (Kesejahteraan): Fakir miskin dan anak-anak telantar dipelihara oleh negara.`,
    exampleOrTrick: 'Trik Ingat Hak Prerogatif: Grasi & Rehabilitasi = MA (ada huruf M). Amnesti & Abolisi = DPR (ada huruf D).'
  },
  {
    id: 'twk-kronologi-sejarah',
    category: 'twk',
    title: 'Kronologi Detik-Detik Kemerdekaan RI 1945',
    badge: 'Sejarah Kemerdekaan',
    summary: 'Urutan peristiwa sejarah yang sering diuji urutan kronologinya.',
    keyFormula: `1. 1 Maret 1945: Pembentukan BPUPKI (Dokuritsu Junbi Cosakai) oleh Jenderal Kumakichi Harada.
2. 29 Mei - 1 Juni 1945: Sidang BPUPKI I (Perumusan Dasar Negara: Yamin, Soepomo, Soekarno).
3. 22 Juni 1945: Piagam Jakarta (Jakarta Charter) dirumuskan Panitia Sembilan.
4. 10 - 17 Juli 1945: Sidang BPUPKI II (Rancangan Batang Tubuh UUD).
5. 7 Agustus 1945: BPUPKI dibubarkan, PPKI dibentuk (Ketua Soekarno).
6. 6 & 9 Agustus 1945: Bom Atom Hiroshima dan Nagasaki.
7. 16 Agustus 1945: Peristiwa Rengasdengklok (Penculikan Soekarno-Hatta oleh Sukarni, Chaerul Saleh, dll).
8. 17 Agustus 1945 (Jumat, 10.00 WIB): Proklamasi di Jl. Pegangsaan Timur 56 Jakarta.
9. 18 Agustus 1945: Sidang PPKI I (Sahkan UUD 1945, pilih Presiden & Wapres, bentuk KNIP).`,
    exampleOrTrick: 'Tokoh Pengetik Naskah: Sayuti Melik. Penjahit Bendera: Fatmawati. Pengibar Bendera: Latief Hendraningrat & Suhud Sastro Kusumo.'
  },
  {
    id: 'twk-integritas-kpk',
    category: 'twk',
    title: '9 Nilai Integritas Antikorupsi KPK',
    badge: 'Integritas ASN',
    summary: 'Jembatan keledai untuk menghafal 9 nilai integritas.',
    keyFormula: `Jembatan Keledai: "JUMAT BERSEPEDA KK"
1. JUjur (Kesesuaian perkataan dan perbuatan)
2. MAndiri (Tidak bergantung pada orang lain secara berlebihan)
3. Tanggung Jawab (Menanggung segala akibat perbuatan)
4. BERani (Menyuarakan kebenaran dan menolak kecurangan)
5. SEdarhana (Bersahaja, tidak konsumtif/hedon)
6. PEduli (Peka terhadap sesama dan lingkungan)
7. Disiplin (Taat pada aturan dan waktu)
8. Adil (Tidak berat sebelah, memutus secara objektif)
9. Kerja Keras (Pantang menyerah mencapai target)`,
    exampleOrTrick: 'Trik Pengelompokan KPK:\n• Nilai Inti: Jujur, Disiplin, Tanggung Jawab\n• Nilai Sikap: Adil, Berani, Peduli\n• Nilai Kerja: Kerja Keras, Mandiri, Sederhana'
  }
];
