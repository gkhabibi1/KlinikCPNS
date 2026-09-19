export interface TIUQuestion {
  tag: string;
  text: string;
  answer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  options: {
    value: string;
    text: string;
  }[];
}

export interface TIUModule {
  id: string;
  categoryTag: 'VERBAL' | 'NUMERIK' | 'FIGURAL';
  stageNumber: string;
  title: string;
  description: string;
  visual: string;
  formulaTitle: string;
  formula: string;
  content: string;
  keys: string[];
  questions: TIUQuestion[];
}

export const TIU_MODULES: TIUModule[] = [
  {
    "id": "m-v1",
    "categoryTag": "VERBAL",
    "stageNumber": "TAHAP 01",
    "title": "Analogi Verbal",
    "description": "Cari relasi A:B lalu terapkan relasi yang sama pada C:D.",
    "visual": "A  →  B   =   C  →  D",
    "formulaTitle": "RUMUS / POLA KUNCI",
    "formula": "Relasi(A, B) = Relasi(C, D)",
    "content": "<h2>Konsep Dasar Analogi Verbal</h2>\n<p>Tes analogi menguji kemampuan Anda dalam mengidentifikasi hubungan logika atau korelasi makna antara dua kata, kemudian mencari pasangan kata lain yang memiliki hubungan yang identik atau setara.</p>\n<p>Kunci utama dalam menyelesaikan soal analogi adalah membuat <strong>kalimat perantara</strong> yang menghubungkan kata pertama dengan kata kedua. Jika kalimat perantara tersebut dapat diterapkan secara tepat dan wajar pada pasangan pilihan jawaban, maka itulah jawaban yang benar.</p>\n<h2>Tipe-Tipe Hubungan Kata Populer di CPNS</h2>\n<ul>\n  <li><strong>Sinonim & Antonim:</strong> Hubungan persamaan makna atau lawan kata (contoh: <em>Haus : Dahaga = Lapar : Kelaparan</em>, <em>Panas : Dingin = Tinggi : Rendah</em>).</li>\n  <li><strong>Profesi & Tempat Kerja / Alat:</strong> Kaitan pelaku dengan tempat bertugas atau instrumen yang digunakan (contoh: <em>Dokter : Rumah Sakit = Guru : Sekolah</em>, <em>Koki : Pisau = Penjahit : Jarum</em>).</li>\n  <li><strong>Benda & Fungsi / Media:</strong> Sarana transportasi atau alat dengan media geraknya (contoh: <em>Kapal : Laut = Pesawat : Udara</em>, <em>Mobil : Bensin = Manusia : Makanan</em>).</li>\n  <li><strong>Sebab - Akibat:</strong> Hubungan kausalitas (contoh: <em>Kekeringan : Kemarau = Banjir : Hujan Deras</em>).</li>\n  <li><strong>Bagian dari Keseluruhan / Jenis:</strong> Hubungan anggota atau bagian spesifik (contoh: <em>Insang : Ikan = Paru-Paru : Manusia</em>).</li>\n</ul>",
    "keys": [
      "Ubah pasangan kata menjadi kalimat sederhana untuk menguji relasi yang paling tepat.",
      "Perhatikan arah relasi: jika A adalah penyebab B, maka C harus menjadi penyebab D, bukan sebaliknya.",
      "Waspadai jebakan sinonim parsial atau asosiasi kata yang tampak berhubungan namun jenis relasinya berbeda."
    ],
    "questions": [
      {
        "tag": "SOAL 1",
        "text": "Kapal : Laut = Pesawat : …",
        "options": [
          {
            "value": "A",
            "text": "Jalan"
          },
          {
            "value": "B",
            "text": "Udara"
          },
          {
            "value": "C",
            "text": "Stasiun"
          },
          {
            "value": "D",
            "text": "Pelabuhan"
          }
        ],
        "answer": "B",
        "explanation": "Kapal adalah moda transportasi yang beroperasi di laut, maka pesawat adalah moda transportasi yang beroperasi di udara."
      },
      {
        "tag": "SOAL 2",
        "text": "Dokter : Rumah Sakit = Guru : …",
        "options": [
          {
            "value": "A",
            "text": "Kantor"
          },
          {
            "value": "B",
            "text": "Sekolah"
          },
          {
            "value": "C",
            "text": "Stasiun"
          },
          {
            "value": "D",
            "text": "Perpustakaan Umum"
          }
        ],
        "answer": "B",
        "explanation": "Dokter bertugas di instansi rumah sakit, sedangkan guru bertugas di instansi sekolah."
      },
      {
        "tag": "SOAL 3",
        "text": "Panas : Dingin = Tinggi : …",
        "options": [
          {
            "value": "A",
            "text": "Panjang"
          },
          {
            "value": "B",
            "text": "Lebar"
          },
          {
            "value": "C",
            "text": "Rendah"
          },
          {
            "value": "D",
            "text": "Jauh"
          }
        ],
        "answer": "C",
        "explanation": "Hubungan antonim (lawan kata): Panas berlawanan dengan dingin, sebagaimana tinggi berlawanan dengan rendah."
      }
    ]
  },
  {
    "id": "m-v2",
    "categoryTag": "VERBAL",
    "stageNumber": "TAHAP 02",
    "title": "Silogisme & Kesimpulan Logis",
    "description": "Tarik kesimpulan sah hanya dari premis yang diberikan tanpa asumsi luar.",
    "visual": "Premis 1 + Premis 2 ⇒ Kesimpulan Sah",
    "formulaTitle": "RUMUS / KAIDAH LOGIKA",
    "formula": "A ⊂ B dan B ⊂ C ⇒ A ⊂ C (Modus Ponens & Tollens)",
    "content": "<h2>Konsep Dasar Silogisme Logis</h2>\n<p>Silogisme menguji ketajaman berpikir deduktif dalam menarik kesimpulan yang sah dari dua atau lebih pernyataan (premis). Patokan utama: <strong>kebenaran silogisme bersifat formal</strong>, artinya Anda dilarang memasukkan pengetahuan umum atau asumsi di luar teks premis.</p>\n<h2>Kaidah Penarikan Kesimpulan</h2>\n<ul>\n  <li><strong>Kaidah Kuantor Umum (Semua / Seluruh):</strong> Jika <em>semua A adalah B</em>, dan <em>X adalah anggota A</em>, maka kesimpulan mutlaknya adalah <em>X adalah B</em>.</li>\n  <li><strong>Kaidah Negasi Kuantor (Modus Tollens):</strong> Jika <em>semua A adalah B</em>, dan <em>X bukan B</em>, maka kesimpulannya <em>X bukan A</em>.</li>\n  <li><strong>Kaidah Kuantor Sebagian (Sebagian / Ada / Beberapa):</strong> Jika premis menggunakan kuantor 'sebagian', maka kesimpulan umumnya juga harus berkuantor 'sebagian'. Jangan pernah menarik kesimpulan berkuantor 'semua' jika salah satu premisnya 'sebagian'.</li>\n  <li><strong>Hukum Transitif:</strong> Jika premis 1: A ⊂ B, dan premis 2: B ⊂ C, maka kesimpulannya A ⊂ C.</li>\n</ul>",
    "keys": [
      "Kesimpulan yang benar hanya bertumpu pada apa yang dinyatakan di dalam premis.",
      "Jika ada satu premis negatif atau partikular (sebagian), maka kesimpulan wajib negatif atau partikular.",
      "Hati-hati dengan pilihan jawaban yang terdengar masuk akal di dunia nyata namun tidak didukung oleh premis."
    ],
    "questions": [
      {
        "tag": "SOAL 1",
        "text": "Semua peserta ujian CPNS memiliki kartu ujian. Budi adalah peserta ujian CPNS. Maka kesimpulannya adalah …",
        "options": [
          {
            "value": "A",
            "text": "Budi tidak memiliki kartu ujian"
          },
          {
            "value": "B",
            "text": "Budi pasti memiliki kartu ujian"
          },
          {
            "value": "C",
            "text": "Budi mungkin memiliki kartu ujian"
          },
          {
            "value": "D",
            "text": "Kartu ujian Budi belum tentu sah"
          }
        ],
        "answer": "B",
        "explanation": "Karena Budi termasuk anggota himpunan peserta CPNS, dan seluruh peserta wajib memiliki kartu ujian, maka Budi pasti memiliki kartu ujian."
      },
      {
        "tag": "SOAL 2",
        "text": "Semua aparatur negara (A) wajib menjaga netralitas (B). Pak Danang terbukti tidak menjaga netralitas (bukan B). Maka …",
        "options": [
          {
            "value": "A",
            "text": "Pak Danang tetap seorang aparatur negara"
          },
          {
            "value": "B",
            "text": "Pak Danang bukan atau telah melanggar syarat aparatur negara"
          },
          {
            "value": "C",
            "text": "Pak Danang mungkin seorang aparatur negara teladan"
          },
          {
            "value": "D",
            "text": "Tidak dapat ditarik kesimpulan"
          }
        ],
        "answer": "B",
        "explanation": "Berdasarkan prinsip Modus Tollens: Jika A maka B. Fakta: bukan B, maka bukan A (Pak Danang melanggar/bukan aparatur negara yang memenuhi syarat)."
      },
      {
        "tag": "SOAL 3",
        "text": "Semua mamalia (A) adalah vertebrata (B). Semua vertebrata (B) adalah hewan berdaging (C). Maka kesimpulannya adalah …",
        "options": [
          {
            "value": "A",
            "text": "Semua hewan berdaging adalah mamalia"
          },
          {
            "value": "B",
            "text": "Semua mamalia adalah hewan berdaging (A ⊂ C)"
          },
          {
            "value": "C",
            "text": "Sebagian mamalia bukan hewan berdaging"
          },
          {
            "value": "D",
            "text": "Vertebrata bukan bagian dari hewan"
          }
        ],
        "answer": "B",
        "explanation": "Berdasarkan hukum transitif: Jika A himpunan bagian dari B, dan B himpunan bagian dari C, maka semua anggota A pasti merupakan anggota C."
      }
    ]
  },
  {
    "id": "m-v3",
    "categoryTag": "VERBAL",
    "stageNumber": "TAHAP 03",
    "title": "Penalaran Analitis",
    "description": "Ubah skenario cerita menjadi diagram, tabel kondisi, lalu uji pilihan jawaban.",
    "visual": "Kondisi Fakta + Aturan Batasan ⇒ Urutan / Posisi Sah",
    "formulaTitle": "METODE PENYELESAIAN",
    "formula": "Fakta + Batasan → Gambar Garis/Tabel → Eliminasi Pilihan Salah",
    "content": "<h2>Konsep Dasar Penalaran Analitis</h2>\n<p>Soal analitis menyajikan suatu skenario berisi sejumlah objek (orang, meja, jadwal, rute) yang terikat oleh seperangkat batasan atau kondisi tertentu. Anda diminta menentukan urutan, posisi duduk, atau pasangan yang valid.</p>\n<h2>Trik Cepat Menjawab Soal Analitis</h2>\n<ul>\n  <li><strong>Gunakan Sketsa Sederhana:</strong> Jika soal mengenai urutan waktu atau nilai, buat garis horizontal (kiri = lebih dulu/tinggi, kanan = lebih lambat/rendah).</li>\n  <li><strong>Gunakan Tabel Matriks:</strong> Jika soal memasangkan nama orang dengan profesi atau ruangan, buat tabel centang (✓) dan silang (✗).</li>\n  <li><strong>Metode Eliminasi Pilihan (Paling Cepat):</strong> Baca satu per satu aturan dari soal, lalu langsung periksa opsi A, B, C, D. Coret opsi mana pun yang melanggar aturan tersebut!</li>\n</ul>",
    "keys": [
      "Jangan mencoba membayangkan semuanya di kepala; selalu coret-coret sketsa visual di kertas buram.",
      "Satu pelanggaran terhadap aturan batasan sudah cukup untuk langsung mengeliminasi pilihan jawaban.",
      "Prioritaskan aturan pasti (fakta absolut) terlebih dahulu sebelum aturan kondisional (jika-maka)."
    ],
    "questions": [
      {
        "tag": "SOAL 1",
        "text": "Dalam antrean loket, ada aturan bahwa Adi harus dilayani sebelum Budi. Jika susunan antreannya adalah Adi - Caca - Budi, maka susunan tersebut …",
        "options": [
          {
            "value": "A",
            "text": "Memenuhi aturan antrean"
          },
          {
            "value": "B",
            "text": "Melanggar aturan antrean"
          },
          {
            "value": "C",
            "text": "Tidak dapat dinilai validitasnya"
          },
          {
            "value": "D",
            "text": "Hanya valid jika Caca dipindahkan"
          }
        ],
        "answer": "A",
        "explanation": "Aturannya adalah Adi dilayani sebelum Budi. Karena posisi Adi berada di depan Budi (meskipun diselingi Caca), susunan tersebut memenuhi aturan."
      },
      {
        "tag": "SOAL 2",
        "text": "Saat memeriksa opsi jawaban pada soal penalaran analitis, sebuah pilihan jawaban yang melanggar satu dari lima aturan yang ditentukan harus …",
        "options": [
          {
            "value": "A",
            "text": "Tetap dipertimbangkan sebagai jawaban utama"
          },
          {
            "value": "B",
            "text": "Langsung dieliminasi/dicoret karena tidak sah"
          },
          {
            "value": "C",
            "text": "Diterima jika aturan lainnya terpenuhi"
          },
          {
            "value": "D",
            "text": "Digabungkan dengan opsi lain"
          }
        ],
        "answer": "B",
        "explanation": "Dalam penalaran analitis, semua batasan bersifat mutlak. Pelanggaran pada satu aturan saja sudah cukup untuk menggugurkan pilihan jawaban."
      },
      {
        "tag": "SOAL 3",
        "text": "Urutan antrean yang ditentukan adalah P - Q - R. Manakah pernyataan yang bertentangan dengan urutan ini?",
        "options": [
          {
            "value": "A",
            "text": "P berada di urutan paling pertama"
          },
          {
            "value": "B",
            "text": "Q dilayani sebelum P"
          },
          {
            "value": "C",
            "text": "R dilayani paling akhir"
          },
          {
            "value": "D",
            "text": "Q berada di antara P dan R"
          }
        ],
        "answer": "B",
        "explanation": "Pada urutan P - Q - R, P berada sebelum Q. Pernyataan 'Q dilayani sebelum P' bertentangan secara langsung dengan urutan sah."
      }
    ]
  },
  {
    "id": "m-n1",
    "categoryTag": "NUMERIK",
    "stageNumber": "TAHAP 04",
    "title": "Pecahan & Operasi Hitung Cepat",
    "description": "Kuasai konversi pecahan biasa, desimal, persen, dan operasi aritmetika dasar.",
    "visual": "Pecahan Biasa ⇄ Campuran ⇄ Desimal ⇄ Persentase",
    "formulaTitle": "RUMUS / POLA KUNCI",
    "formula": "a/b ± c/d = (ad ± bc)/bd  |  (a/b) × (c/d) = ac/bd  |  (a/b) ÷ (c/d) = ad/bc",
    "content": "<h2>Bentuk dan Karakteristik Pecahan</h2>\n<p>Dalam soal TIU CPNS, kemampuan berhitung pecahan menguji ketelitian dan kecepatan kalkulasi tanpa kalkulator. Pemahaman konversi antar bentuk pecahan sangat menghemat waktu pengerjaan.</p>\n<h2>Aturan Operasi Pecahan</h2>\n<ul>\n  <li><strong>Penjumlahan & Pengurangan:</strong> Samakan penyebut dengan mencari KPK dari penyebut, lalu jumlahkan pembilangnya: <code>(a/b) + (c/d) = (ad + bc) / bd</code>.</li>\n  <li><strong>Perkalian:</strong> Kalikan langsung pembilang dengan pembilang, dan penyebut dengan penyebut: <code>(a/b) × (c/d) = (ac) / (bd)</code>. Coret faktor persekutuan terlebih dahulu untuk menyederhanakan.</li>\n  <li><strong>Pembagian:</strong> Balikkan pecahan kedua (pembagi) menjadi perkalian: <code>(a/b) ÷ (c/d) = (a/b) × (d/c) = (ad) / (bc)</code>.</li>\n  <li><strong>Pecahan Istimewa yang Wajib Dihafal:</strong> 1/2 = 50% = 0,5; 1/3 = 33,33% = 0,33; 1/4 = 25% = 0,25; 1/8 = 12,5% = 0,125; 3/4 = 75% = 0,75.</li>\n</ul>",
    "keys": [
      "Pada perkalian pecahan, selalu lakukan penyederhanaan (coret silang angka yang bisa dibagi) sebelum mengalikan angka besar.",
      "Ubah pecahan campuran ke pecahan biasa: a b/c = (a × c + b) / c.",
      "Operasi pembagian pecahan diselesaikan dengan membalik pembilang dan penyebut pada pecahan pembagi."
    ],
    "questions": [
      {
        "tag": "SOAL 1",
        "text": "Hasil dari 2/3 + 1/6 adalah …",
        "options": [
          {
            "value": "A",
            "text": "1/2"
          },
          {
            "value": "B",
            "text": "2/9"
          },
          {
            "value": "C",
            "text": "5/6"
          },
          {
            "value": "D",
            "text": "1"
          }
        ],
        "answer": "C",
        "explanation": "Samakan penyebut ke 6: (2/3 = 4/6). Maka 4/6 + 1/6 = 5/6."
      },
      {
        "tag": "SOAL 2",
        "text": "Hasil perkalian (3/4) × (2/3) adalah …",
        "options": [
          {
            "value": "A",
            "text": "1/2"
          },
          {
            "value": "B",
            "text": "2/9"
          },
          {
            "value": "C",
            "text": "5/6"
          },
          {
            "value": "D",
            "text": "1"
          }
        ],
        "answer": "A",
        "explanation": "(3 × 2) / (4 × 3) = 6/12. Disederhanakan dengan membagi 6 menjadi 1/2."
      },
      {
        "tag": "SOAL 3",
        "text": "Hasil pembagian (2/5) ÷ (4/5) adalah …",
        "options": [
          {
            "value": "A",
            "text": "1/2"
          },
          {
            "value": "B",
            "text": "2/9"
          },
          {
            "value": "C",
            "text": "8/25"
          },
          {
            "value": "D",
            "text": "1"
          }
        ],
        "answer": "A",
        "explanation": "Balikkan pecahan kedua: (2/5) × (5/4) = (2 × 5) / (5 × 4) = 10/20 = 1/2."
      }
    ]
  },
  {
    "id": "m-n2",
    "categoryTag": "NUMERIK",
    "stageNumber": "TAHAP 05",
    "title": "Deret Angka (Barisan Pola)",
    "description": "Temukan aturan perubahan yang konsisten pada seluruh suku barisan angka.",
    "visual": "U₁  —(+3)→  U₂  —(+3)→  U₃  —(+3)→  U₄",
    "formulaTitle": "RUMUS / POLA KUNCI",
    "formula": "Selisih Konstan (Aritmetika)  |  Rasio Konstan (Geometri)  |  Pola Bertingkat / Larik",
    "content": "<h2>Langkah Sistematis Menemukan Pola Deret</h2>\n<p>Soal deret angka dirancang untuk menguji kecepatan melihat pola keteraturan matematis. Jangan menebak acak; ikuti urutan pengecekan terstruktur berikut:</p>\n<h2>Urutan Analisis Pola:</h2>\n<ul>\n  <li><strong>1. Cek Selisih Suku Bersebelahan:</strong> Apakah selisih antar angka konstan (+2, +5) atau selisih bertingkat (+1, +2, +3, +4)?</li>\n  <li><strong>2. Cek Rasio Perkalian / Pembagian:</strong> Apakah suku berikutnya merupakan kelipatan (×2, ×3) atau pembagian tetap (:2, :3)?</li>\n  <li><strong>3. Cek Pola Larik / Melompat (Ganjil-Genap):</strong> Jika deret naik-turun atau panjangnya lebih dari 6 suku, kemungkinan besar ada dua pola yang melompati satu angka (pola suku ganjil dan pola suku genap).</li>\n  <li><strong>4. Cek Bilangan Kuadrat / Kubik / Fibonacci:</strong> Deret berupa n² (1, 4, 9, 16, 25...), n³ (1, 8, 27, 64...), atau suku ke-n adalah jumlah dua suku sebelumnya (1, 1, 2, 3, 5, 8...).</li>\n</ul>",
    "keys": [
      "Jika angka bertambah secara perlahan, carilah operasi penjumlahan atau pengurangan.",
      "Jika angka melesat cepat menjadi besar, kemungkinan operasinya adalah perkalian atau pemangkatan kuadrat.",
      "Jika barisannya panjang dan angkanya fluktuatif (naik lalu turun), periksa pola selang-seling (loncat 1 atau loncat 2)."
    ],
    "questions": [
      {
        "tag": "SOAL 1",
        "text": "Tentukan angka berikutnya: 4, 7, 10, 13, …",
        "options": [
          {
            "value": "A",
            "text": "14"
          },
          {
            "value": "B",
            "text": "15"
          },
          {
            "value": "C",
            "text": "16"
          },
          {
            "value": "D",
            "text": "17"
          }
        ],
        "answer": "C",
        "explanation": "Pola deret aritmetika dengan penambahan konstan +3 (4+3=7, 7+3=10, 10+3=13, 13+3=16)."
      },
      {
        "tag": "SOAL 2",
        "text": "Tentukan angka berikutnya: 3, 6, 12, 24, …",
        "options": [
          {
            "value": "A",
            "text": "36"
          },
          {
            "value": "B",
            "text": "42"
          },
          {
            "value": "C",
            "text": "48"
          },
          {
            "value": "D",
            "text": "54"
          }
        ],
        "answer": "C",
        "explanation": "Pola deret geometri dengan rasio pengali konstan ×2 (3×2=6, 6×2=12, 12×2=24, 24×2=48)."
      },
      {
        "tag": "SOAL 3",
        "text": "Tentukan angka berikutnya: 20, 17, 14, 11, …",
        "options": [
          {
            "value": "A",
            "text": "6"
          },
          {
            "value": "B",
            "text": "7"
          },
          {
            "value": "C",
            "text": "8"
          },
          {
            "value": "D",
            "text": "9"
          }
        ],
        "answer": "C",
        "explanation": "Pola deret pengurangan konstan −3 (20−3=17, 17−3=14, 14−3=11, 11−3=8)."
      }
    ]
  },
  {
    "id": "m-n3",
    "categoryTag": "NUMERIK",
    "stageNumber": "TAHAP 06",
    "title": "Perbandingan Senilai",
    "description": "Dua variabel bergerak searah dengan perbandingan rasio yang selalu tetap.",
    "visual": "Variabel A Naik (↑)  ⇒  Variabel B Naik (↑)",
    "formulaTitle": "RUMUS / POLA KUNCI",
    "formula": "P₁ / Q₁ = P₂ / Q₂   →   P₁ × Q₂ = P₂ × Q₁",
    "content": "<h2>Karakteristik Perbandingan Senilai</h2>\n<p>Perbandingan senilai terjadi apabila peningkatan kuantitas pada variabel pertama akan mengakibatkan peningkatan yang proporsional pada variabel kedua, dan sebaliknya penurunan nilai variabel pertama akan menurunkan nilai variabel kedua.</p>\n<h2>Contoh Kasus Nyata di SKD CPNS:</h2>\n<ul>\n  <li><strong>Jumlah Barang & Total Harga:</strong> Makin banyak buku yang dibeli, makin besar biaya totalnya (contoh: 3 buku = Rp15.000, maka 6 buku = Rp30.000).</li>\n  <li><strong>Jarak Tempuh & Konsumsi BBM:</strong> Makin jauh jarak perjalanan, makin banyak liter bensin yang dibutuhkan.</li>\n  <li><strong>Lama Bekerja & Jumlah Upah:</strong> Makin banyak jam lembur seorang pegawai, makin besar upah yang diterima.</li>\n</ul>",
    "keys": [
      "Gunakan teknik perkalian silang: P₁ / Q₁ = P₂ / Q₂ sehingga P₂ = (P₁ × Q₂) / Q₁.",
      "Bisa juga mencari nilai satuan (harga per unit) terlebih dahulu untuk mempermudah penghitungan cepat."
    ],
    "questions": [
      {
        "tag": "SOAL 1",
        "text": "Harga 3 buah buku tulis adalah Rp15.000. Berapakah harga untuk 6 buah buku tulis serupa?",
        "options": [
          {
            "value": "A",
            "text": "Rp20.000"
          },
          {
            "value": "B",
            "text": "Rp25.000"
          },
          {
            "value": "C",
            "text": "Rp30.000"
          },
          {
            "value": "D",
            "text": "Rp45.000"
          }
        ],
        "answer": "C",
        "explanation": "Harga satuan per buku = Rp15.000 / 3 = Rp5.000. Untuk 6 buku = 6 × Rp5.000 = Rp30.000."
      },
      {
        "tag": "SOAL 2",
        "text": "Harga 2 kg mangga arumanis adalah Rp40.000. Jika seorang pembeli membeli 5 kg, berapa uang yang harus dibayar?",
        "options": [
          {
            "value": "A",
            "text": "Rp60.000"
          },
          {
            "value": "B",
            "text": "Rp80.000"
          },
          {
            "value": "C",
            "text": "Rp100.000"
          },
          {
            "value": "D",
            "text": "Rp120.000"
          }
        ],
        "answer": "C",
        "explanation": "Harga per kg = Rp40.000 / 2 = Rp20.000. Untuk 5 kg = 5 × Rp20.000 = Rp100.000."
      },
      {
        "tag": "SOAL 3",
        "text": "Jika 4 unit barang memiliki bobot total 20 kg, maka bobot dari 8 unit barang sejenis adalah …",
        "options": [
          {
            "value": "A",
            "text": "25 kg"
          },
          {
            "value": "B",
            "text": "30 kg"
          },
          {
            "value": "C",
            "text": "40 kg"
          },
          {
            "value": "D",
            "text": "50 kg"
          }
        ],
        "answer": "C",
        "explanation": "Karena jumlah barang berlipat ganda 2 kali (dari 4 ke 8), bobotnya juga berlipat 2 kali: 20 × 2 = 40 kg."
      }
    ]
  },
  {
    "id": "m-n4",
    "categoryTag": "NUMERIK",
    "stageNumber": "TAHAP 07",
    "title": "Perbandingan Berbalik Nilai",
    "description": "Satu variabel meningkat ketika variabel lain menurun, dengan hasil kali tetap.",
    "visual": "Variabel A Naik (↑)  ⇒  Variabel B Turun (↓)",
    "formulaTitle": "RUMUS / POLA KUNCI",
    "formula": "P₁ × Q₁ = P₂ × Q₂   →   Q₂ = (P₁ × Q₁) / P₂",
    "content": "<h2>Karakteristik Perbandingan Berbalik Nilai</h2>\n<p>Perbandingan berbalik nilai berlaku ketika kenaikan pada variabel pertama mengakibatkan penurunan pada variabel kedua sedemikian rupa sehingga hasil kali kedua variabel selalu konstan.</p>\n<h2>Contoh Kasus Klasik di CPNS:</h2>\n<ul>\n  <li><strong>Jumlah Pekerja vs Waktu Pengerjaan Proyek:</strong> Makin banyak tukang/pekerja, makin singkat hari yang diperlukan untuk menyelesaikan pembangunan gedung.</li>\n  <li><strong>Kecepatan Kendaraan vs Waktu Tempuh:</strong> Makin tinggi kecepatan mobil (km/jam), makin cepat waktu yang dibutuhkan untuk sampai di tujuan.</li>\n  <li><strong>Jumlah Hewan Ternak vs Hari Habisnya Pakan:</strong> Makin banyak sapi yang memakan pakan, makin cepat persediaan rumput habis.</li>\n</ul>",
    "keys": [
      "Rumus kunci perbandingan berbalik nilai adalah hasil kali yang konstan: P₁ × Q₁ = P₂ × Q₂.",
      "Perhatikan jika ada soal tentang penambahan pekerja: pekerja baru = total pekerja akhir - pekerja awal."
    ],
    "questions": [
      {
        "tag": "SOAL 1",
        "text": "Suatu proyek dapat diselesaikan oleh 4 orang pekerja dalam waktu 12 hari. Jika proyek dikerjakan oleh 8 orang, berapa hari waktu yang dibutuhkan?",
        "options": [
          {
            "value": "A",
            "text": "3 hari"
          },
          {
            "value": "B",
            "text": "6 hari"
          },
          {
            "value": "C",
            "text": "12 hari"
          },
          {
            "value": "D",
            "text": "24 hari"
          }
        ],
        "answer": "B",
        "explanation": "P₁ × Q₁ = P₂ × Q₂ → 4 × 12 = 8 × Q₂ → 48 = 8Q₂ → Q₂ = 48 / 8 = 6 hari."
      },
      {
        "tag": "SOAL 2",
        "text": "Pembangunan jembatan diselesaikan oleh 6 pekerja dalam waktu 10 hari. Berapa hari yang dibutuhkan jika dikerjakan oleh 12 pekerja?",
        "options": [
          {
            "value": "A",
            "text": "4 hari"
          },
          {
            "value": "B",
            "text": "5 hari"
          },
          {
            "value": "C",
            "text": "7 hari"
          },
          {
            "value": "D",
            "text": "8 hari"
          }
        ],
        "answer": "B",
        "explanation": "6 × 10 = 12 × Q₂ → 60 = 12Q₂ → Q₂ = 60 / 12 = 5 hari."
      },
      {
        "tag": "SOAL 3",
        "text": "Jika jumlah pekerja dilipatgandakan menjadi 2 kali lebih banyak, maka waktu penyelesaian proyek pada kondisi berbalik nilai akan …",
        "options": [
          {
            "value": "A",
            "text": "2 kali lebih lama"
          },
          {
            "value": "B",
            "text": "Tetap sama"
          },
          {
            "value": "C",
            "text": "Menjadi setengah (1/2) dari waktu semula"
          },
          {
            "value": "D",
            "text": "Menjadi seperempat (1/4) waktu semula"
          }
        ],
        "answer": "C",
        "explanation": "Pada perbandingan berbalik nilai, melipatgandakan pekerja 2 kali akan mengurangi waktu menjadi 1/2 kali semula."
      }
    ]
  },
  {
    "id": "m-n5",
    "categoryTag": "NUMERIK",
    "stageNumber": "TAHAP 08",
    "title": "Perbandingan Kuantitatif (Hubungan A & B)",
    "description": "Bandingkan dua besaran kuantitas x dan y secara efisien dan cermat.",
    "visual": "x > y   |   x < y   |   x = y   |   Hubungan Tidak Dapat Ditentukan",
    "formulaTitle": "RUMUS / POLA KUNCI",
    "formula": "Sederhanakan Aljabar Kedua Sisi Sebelum Menghitung Angka Final",
    "content": "<h2>Format Soal Perbandingan Kuantitatif</h2>\n<p>Soal tipe kuantitatif memberikan dua ekspresi matematis (sering disimbolkan sebagai A dan B, atau x dan y). Opsi pilihan selalu baku: A > B, A < B, A = B, atau Hubungan A dan B tidak dapat ditentukan.</p>\n<h2>Strategi Penyelesaian Efisien:</h2>\n<ul>\n  <li><strong>Jangan Menghitung Angka Utuh yang Rumit:</strong> Seringkali kedua ekspresi memiliki faktor atau suku yang sama. Lakukan pembatalan (coret kedua sisi) sebelum menghitung.</li>\n  <li><strong>Waspadai Variabel Bernilai Negatif atau Nol:</strong> Jika variabel x tidak dinyatakan sebagai bilangan positif, ingat bahwa x bisa bernilai negatif, nol, atau pecahan (contoh: x² = 4 berarti x bisa 2 atau −2, sehingga jika dibandingkan dengan y = 1 hubungan tidak dapat ditentukan).</li>\n</ul>",
    "keys": [
      "Coret suku yang sama di kedua sisi pertidaksamaan untuk menyederhanakan bentuk.",
      "Jika ada informasi variabel yang tidak lengkap (misal tanda bilangan belum pasti), pilihan 'Tidak dapat ditentukan' sering menjadi jawaban yang tepat."
    ],
    "questions": [
      {
        "tag": "SOAL 1",
        "text": "Jika nilai A = 18 dan B = 12, bagaimanakah hubungan kuantitatif antara A dan B?",
        "options": [
          {
            "value": "A",
            "text": "A > B"
          },
          {
            "value": "B",
            "text": "A < B"
          },
          {
            "value": "C",
            "text": "A = B"
          },
          {
            "value": "D",
            "text": "Hubungan A dan B tidak dapat ditentukan"
          }
        ],
        "answer": "A",
        "explanation": "Karena nilai 18 lebih besar dari 12, maka secara pasti A > B."
      },
      {
        "tag": "SOAL 2",
        "text": "Diberikan A = 3 × 4 dan B = 2 × 6. Manakah hubungan yang tepat antara A dan B?",
        "options": [
          {
            "value": "A",
            "text": "A > B"
          },
          {
            "value": "B",
            "text": "A < B"
          },
          {
            "value": "C",
            "text": "A = B"
          },
          {
            "value": "D",
            "text": "Hubungan A dan B tidak dapat ditentukan"
          }
        ],
        "answer": "C",
        "explanation": "A = 12 dan B = 12. Karena nilainya sama persis, maka A = B."
      },
      {
        "tag": "SOAL 3",
        "text": "Jika x² = 25 dan y = 5, manakah pernyataan yang paling tepat mengenai hubungan x dan y?",
        "options": [
          {
            "value": "A",
            "text": "x > y"
          },
          {
            "value": "B",
            "text": "x < y"
          },
          {
            "value": "C",
            "text": "x = y"
          },
          {
            "value": "D",
            "text": "Hubungan x dan y tidak dapat ditentukan"
          }
        ],
        "answer": "D",
        "explanation": "Nilai x² = 25 memiliki dua kemungkinan: x = 5 atau x = −5. Jika x = 5 maka x = y, tetapi jika x = −5 maka x < y. Karena memiliki dua kemungkinan bertentangan, hubungan tidak dapat ditentukan."
      }
    ]
  },
  {
    "id": "m-n6",
    "categoryTag": "NUMERIK",
    "stageNumber": "TAHAP 09",
    "title": "Analisis Data & Tabel",
    "description": "Baca judul, kolom, baris, dan filter hanya data yang ditanyakan oleh soal.",
    "visual": "Filter Baris & Kolom Relevan → Abaikan Informasi Pengalih",
    "formulaTitle": "RUMUS / POLA KUNCI",
    "formula": "Persentase = (Nilai Bagian / Total) × 100%   |   Pertumbuhan = (Akhir - Awal) / Awal × 100%",
    "content": "<h2>Teknik Efisien Membaca Tabel dan Diagram</h2>\n<p>Soal interpretasi tabel sering menampilkan banyak baris angka untuk menguji fokus Anda. Menghitung semua angka dalam tabel akan membuang banyak waktu berharga.</p>\n<h2>Langkah Cepat Mengerjakan:</h2>\n<ul>\n  <li><strong>1. Baca Pertanyaan Terlebih Dahulu:</strong> Ketahui dengan spesifik variabel apa yang dicari (misalnya: tahun tertinggi, persentase kenaikan, atau total kelompok tertentu).</li>\n  <li><strong>2. Cari Baris dan Kolom Sasaran:</strong> Tarik garis pandang hanya ke sel tabel yang ditanyakan; abaikan kolom lain.</li>\n  <li><strong>3. Estimasi Angka Bulat:</strong> Dalam perhitungan persentase, bulatkan angka ke puluhan atau ratusan terdekat untuk memperkirakan opsi yang tepat.</li>\n</ul>",
    "keys": [
      "Jangan membaca seluruh tabel dari awal; baca soalnya dulu untuk mencari target data.",
      "Perhatikan satuan pada judul tabel (misal: dalam ribuan rupiah, dalam ton, atau dalam persen)."
    ],
    "questions": [
      {
        "tag": "SOAL 1",
        "text": "Berdasarkan data kelulusan peserta: Gelombang 1 = 40 orang, Gelombang 2 = 55 orang, Gelombang 3 = 50 orang. Gelombang manakah yang memiliki peserta lulus tertinggi?",
        "options": [
          {
            "value": "A",
            "text": "Gelombang 1"
          },
          {
            "value": "B",
            "text": "Gelombang 2"
          },
          {
            "value": "C",
            "text": "Gelombang 3"
          },
          {
            "value": "D",
            "text": "Semua gelombang sama"
          }
        ],
        "answer": "B",
        "explanation": "Nilai 55 pada Gelombang 2 adalah angka kelulusan tertinggi dibandingkan Gelombang 1 (40) dan Gelombang 3 (50)."
      },
      {
        "tag": "SOAL 2",
        "text": "Jika pada sesi pagi terdapat 20 peserta dan pada sesi siang terdapat 30 peserta, berapa total peserta pada hari tersebut?",
        "options": [
          {
            "value": "A",
            "text": "40"
          },
          {
            "value": "B",
            "text": "45"
          },
          {
            "value": "C",
            "text": "50"
          },
          {
            "value": "D",
            "text": "55"
          }
        ],
        "answer": "C",
        "explanation": "Penjumlahan langsung: 20 + 30 = 50 orang."
      },
      {
        "tag": "SOAL 3",
        "text": "Jika terdapat 25 orang lulus dari total 100 peserta yang mengikuti ujian, berapakah persentase kelulusannya?",
        "options": [
          {
            "value": "A",
            "text": "20%"
          },
          {
            "value": "B",
            "text": "25%"
          },
          {
            "value": "C",
            "text": "30%"
          },
          {
            "value": "D",
            "text": "50%"
          }
        ],
        "answer": "B",
        "explanation": "Persentase = (25 / 100) × 100% = 25%."
      }
    ]
  },
  {
    "id": "m-f1",
    "categoryTag": "FIGURAL",
    "stageNumber": "TAHAP 10",
    "title": "Analogi Gambar (Figural)",
    "description": "Temukan transformasi bentuk gambar A ke B, lalu terapkan pola yang sama ke gambar C.",
    "visual": "▲  ↻ 90°  →  ◀   ||   ■  ↻ 90°  →  ◆",
    "formulaTitle": "RUMUS / POLA TRANSFORMASI",
    "formula": "A —[Transformasi T]→ B   ;   C —[Transformasi T]→ ?",
    "content": "<h2>Kaidah Analogi Gambar Figural</h2>\n<p>Sama seperti analogi verbal, analogi figural menguji kemampuan menemukan pola perubahan visual dari gambar pertama ke gambar kedua, kemudian mereplikasi perubahan yang sama persis pada gambar ketiga.</p>\n<h2>Elemen-Elemen Transformasi Figural:</h2>\n<ul>\n  <li><strong>Rotasi Sudut:</strong> Perputaran sebesar 45°, 90°, atau 180° searah atau berlawanan jarum jam.</li>\n  <li><strong>Pencerminan (Refleksi):</strong> Pembalikan bentuk secara horizontal (kiri-kanan) atau vertikal (atas-bawah).</li>\n  <li><strong>Perubahan Pola Arsiran / Warna:</strong> Dari hitam pekat menjadi putih, atau bergaris menjadi polos.</li>\n  <li><strong>Penambahan / Pengurangan Elemen:</strong> Jumlah titik, garis, atau sudut berkurang satu atau bertambah satu.</li>\n</ul>",
    "keys": [
      "Fokus pada satu elemen visual terlebih dahulu (misal ujung panah atau satu sudut) untuk melihat arah rotasinya.",
      "Periksa apakah objek di dalam dan di luar bertukar posisi atau bertukar warna."
    ],
    "questions": [
      {
        "tag": "SOAL 1",
        "text": "Ketika sebuah segitiga yang menghadap ke atas berputar menjadi menghadap ke kiri, maka jenis transformasi visual yang terjadi adalah …",
        "options": [
          {
            "value": "A",
            "text": "Rotasi 90° berlawanan arah jarum jam"
          },
          {
            "value": "B",
            "text": "Pencerminan vertikal murni"
          },
          {
            "value": "C",
            "text": "Penghapusan objek"
          },
          {
            "value": "D",
            "text": "Pembesaran skala proporsional"
          }
        ],
        "answer": "A",
        "explanation": "Perubahan arah dari atas ke kiri merepresentasikan rotasi sebesar 90° berlawanan arah jarum jam."
      },
      {
        "tag": "SOAL 2",
        "text": "Langkah pertama yang paling krusial dalam memecahkan soal analogi gambar adalah …",
        "options": [
          {
            "value": "A",
            "text": "Langsung menebak gambar pada pilihan C"
          },
          {
            "value": "B",
            "text": "Mengidentifikasi pola transformasi yang mengubah gambar A menjadi gambar B"
          },
          {
            "value": "C",
            "text": "Mengabaikan detail posisi gambar awal"
          },
          {
            "value": "D",
            "text": "Menghitung luas bidang gambar"
          }
        ],
        "answer": "B",
        "explanation": "Kunci analogi gambar adalah menemukan aturan atau pola transformasi antara pasangan pertama (A ke B) terlebih dahulu."
      },
      {
        "tag": "SOAL 3",
        "text": "Jika sebuah elemen bintang kecil yang semula berada di pojok kiri bawah berpindah ke pojok kanan bawah tanpa berputar, maka transformasi tersebut berupa …",
        "options": [
          {
            "value": "A",
            "text": "Pergeseran posisi (Translasi horizontal)"
          },
          {
            "value": "B",
            "text": "Rotasi 180°"
          },
          {
            "value": "C",
            "text": "Pencerminan terhadap sumbu miring"
          },
          {
            "value": "D",
            "text": "Penciutan ukuran"
          }
        ],
        "answer": "A",
        "explanation": "Perpindahan tempat tanpa disertai perubahan orientasi atau perputaran bentuk merupakan translasi (pergeseran posisi)."
      }
    ]
  },
  {
    "id": "m-f2",
    "categoryTag": "FIGURAL",
    "stageNumber": "TAHAP 11",
    "title": "Seri / Deret Pola Gambar",
    "description": "Temukan ritme aturan perubahan berulang pada deretan gambar secara berurutan.",
    "visual": "Pola 1  →  Pola 2  →  Pola 3  →  Pola 4  →  [ ? ]",
    "formulaTitle": "RUMUS / POLA KUNCI",
    "formula": "Gambar(n+1) = Aturan_Perubahan( Gambar(n) )",
    "content": "<h2>Memecah Gambar Menjadi Elemen Tunggal</h2>\n<p>Soal serial gambar menampilkan 3 sampai 4 kotak gambar berurutan dan meminta Anda menentukan gambar kelima. Kesalahan umum adalah mencoba mengamati keseluruhan gambar sekaligus, yang sering membuat bingung.</p>\n<h2>Trik Jitu Penyelesaian:</h2>\n<ul>\n  <li><strong>Pecah Menjadi Komponen-Komponen Kecil:</strong> Amati satu elemen saja (misalnya lingkaran kecil hitam), lalu amati bagaimana lingkaran itu bergerak dari kotak 1 ke kotak 2 ke kotak 3.</li>\n  <li><strong>Cek Pola Jumlah Garis / Sudut:</strong> Hitung jumlah sisi bangun: 3 sisi (segitiga) → 4 sisi (persegi) → 5 sisi (segilima) → maka berikutnya 6 sisi (segienam).</li>\n  <li><strong>Cek Pola Rotasi Bertahap:</strong> Perhatikan jarum jam yang berputar: 45° → 90° → 135° → 180°.</li>\n</ul>",
    "keys": [
      "Perhatikan gerakan elemen: searah jarum jam, berlawanan jarum jam, atau melompat zigzag.",
      "Eliminasi pilihan jawaban yang elemen pertamanya sudah tidak sesuai dengan pola yang Anda temukan."
    ],
    "questions": [
      {
        "tag": "SOAL 1",
        "text": "Tujuan utama dalam menyelesaikan soal serial/deret pola gambar adalah menemukan …",
        "options": [
          {
            "value": "A",
            "text": "Aturan perubahan atau ritme pergerakan elemen yang konsisten"
          },
          {
            "value": "B",
            "text": "Nama software pembuat gambar"
          },
          {
            "value": "C",
            "text": "Tingkat ketebalan garis gambar"
          },
          {
            "value": "D",
            "text": "Gambar yang paling artistik"
          }
        ],
        "answer": "A",
        "explanation": "Kunci menjawab deret gambar adalah melacak aturan perubahan pola yang konsisten dari kotak ke kotak."
      },
      {
        "tag": "SOAL 2",
        "text": "Jika sebuah jarum berputar 90° searah jarum jam pada setiap langkah berurutan, maka pada langkah berikutnya jarum tersebut akan …",
        "options": [
          {
            "value": "A",
            "text": "Melanjutkan putaran 90° searah jarum jam"
          },
          {
            "value": "B",
            "text": "Berbalik arah 180° secara acak"
          },
          {
            "value": "C",
            "text": "Berhenti dan tidak berputar lagi"
          },
          {
            "value": "D",
            "text": "Mengecil menjadi setengah ukuran"
          }
        ],
        "answer": "A",
        "explanation": "Karena polanya konstan sebesar 90° searah jarum jam, maka langkah selanjutnya harus mematuhi pola yang sama."
      },
      {
        "tag": "SOAL 3",
        "text": "Mengapa memecah gambar yang rumit menjadi komponen-komponen kecil sangat dianjurkan?",
        "options": [
          {
            "value": "A",
            "text": "Untuk melacak pergerakan masing-masing komponen secara spesifik dan mudah"
          },
          {
            "value": "B",
            "text": "Agar gambar terlihat lebih sederhana dari aslinya"
          },
          {
            "value": "C",
            "text": "Untuk menghapus bagian yang sulit"
          },
          {
            "value": "D",
            "text": "Agar tidak perlu memilih jawaban"
          }
        ],
        "answer": "A",
        "explanation": "Memisahkan elemen memudahkan kita mendeteksi pola rotasi atau pergeseran tiap komponen secara jelas tanpa terdistraksi elemen lain."
      }
    ]
  },
  {
    "id": "m-f3",
    "categoryTag": "FIGURAL",
    "stageNumber": "TAHAP 12",
    "title": "Ketaksamaan Gambar (Pengecualian)",
    "description": "Temukan satu gambar unik yang melanggar aturan mayoritas dari kelima opsi yang ada.",
    "visual": "[ ✓ ]  [ ✓ ]  [ ✓ ]  [ ✓ ]  VS  [ ✗ Pelanggar Aturan ]",
    "formulaTitle": "RUMUS / POLA KUNCI",
    "formula": "Aturan Mayoritas = R   ⇒   Pilihan Benar = Bukan R (Melanggar Aturan)",
    "content": "<h2>Prinsip Mencari Ketaksamaan Gambar</h2>\n<p>Dalam tes ketaksamaan figural, disajikan 5 buah gambar (A, B, C, D, E). Empat di antaranya memiliki karakteristik atau prinsip logika visual yang seragam, sedangkan tepat satu gambar tidak mengikuti aturan tersebut.</p>\n<h2>Karakteristik Mayoritas yang Sering Muncul:</h2>\n<ul>\n  <li><strong>Simetri Lipat / Putar:</strong> Empat gambar memiliki simetri simetris, satu gambar asimetris.</li>\n  <li><strong>Jumlah Garis Terbuka vs Tertutup:</strong> Empat bangun merupakan kurva tertutup, satu bangun kurva terbuka.</li>\n  <li><strong>Arah Hadap Objek:</strong> Empat objek menghadap atau berputar searah jarum jam, satu objek berputar ke arah sebaliknya.</li>\n  <li><strong>Jumlah Elemen Ganjil vs Genap:</strong> Empat gambar memiliki titik berjumlah ganjil, satu gambar berjumlah genap.</li>\n</ul>",
    "keys": [
      "Temukan aturan yang menyatukan 4 gambar terlebih dahulu, bukan langsung menebak gambar yang 'terlihat aneh'.",
      "Perhatikan apakah ada gambar yang merupakan hasil pencerminan sementara yang lain hanya hasil rotasi."
    ],
    "questions": [
      {
        "tag": "SOAL 1",
        "text": "Dari 5 gambar yang tersedia, terdapat empat gambar yang masing-masing memuat 3 buah bintang kecil, dan satu gambar memuat 4 buah bintang kecil. Gambar manakah yang merupakan pengecualian?",
        "options": [
          {
            "value": "A",
            "text": "Gambar dengan 3 buah bintang"
          },
          {
            "value": "B",
            "text": "Gambar dengan 4 buah bintang"
          },
          {
            "value": "C",
            "text": "Semua gambar sama saja"
          },
          {
            "value": "D",
            "text": "Tidak dapat ditentukan"
          }
        ],
        "answer": "B",
        "explanation": "Gambar dengan 4 buah bintang melanggar aturan mayoritas (yang memiliki 3 buah bintang) sehingga menjadi pengecualian yang dicari."
      },
      {
        "tag": "SOAL 2",
        "text": "Langkah metodis yang paling tepat dalam memecahkan soal ketaksamaan figural adalah …",
        "options": [
          {
            "value": "A",
            "text": "Memilih gambar pertama yang posisinya paling tengah"
          },
          {
            "value": "B",
            "text": "Mengidentifikasi kesamaan sifat pada mayoritas gambar, lalu mencari satu yang menyimpang"
          },
          {
            "value": "C",
            "text": "Mencari gambar yang paling sulit digambar manual"
          },
          {
            "value": "D",
            "text": "Mengabaikan arah perputaran jarum jam"
          }
        ],
        "answer": "B",
        "explanation": "Ketaksamaan ditentukan dengan mencari karakteristik yang mengikat 4 gambar, lalu menentukan satu gambar yang melanggar aturan tersebut."
      },
      {
        "tag": "SOAL 3",
        "text": "Empat gambar memiliki panah yang berputar searah putaran jarum jam, sedangkan satu gambar memiliki panah yang berputar berlawanan jarum jam. Manakah gambar yang harus dipilih?",
        "options": [
          {
            "value": "A",
            "text": "Salah satu gambar yang searah jarum jam"
          },
          {
            "value": "B",
            "text": "Gambar yang memiliki panah berlawanan arah jarum jam"
          },
          {
            "value": "C",
            "text": "Semua gambar yang menghadap ke atas"
          },
          {
            "value": "D",
            "text": "Gambar yang garisnya paling tebal"
          }
        ],
        "answer": "B",
        "explanation": "Gambar yang berputar ke arah sebaliknya adalah pengecualian yang melanggar kaidah mayoritas."
      }
    ]
  }
];
