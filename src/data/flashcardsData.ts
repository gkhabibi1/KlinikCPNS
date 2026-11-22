export interface Flashcard {
  id: string;
  deck: 'uud1945' | 'pancasila' | 'sejarah' | 'bela_negara' | 'tata_negara';
  deckName: string;
  question: string;
  answer: string;
  keyNote?: string;
}

export const FLASHCARD_DECKS = [
  { id: 'all', name: 'Semua Materi', icon: '📚' },
  { id: 'uud1945', name: 'Pasal UUD 1945', icon: '⚖️' },
  { id: 'pancasila', name: 'Pancasila & Nilai', icon: '🦅' },
  { id: 'sejarah', name: 'BPUPKI, PPKI & Sejarah', icon: '🏛️' },
  { id: 'bela_negara', name: 'Bela Negara & Integritas', icon: '🛡️' },
  { id: 'tata_negara', name: 'Lembaga & Tata Negara', icon: '🏛️' },
];

export const FLASHCARD_ITEMS: Flashcard[] = [
  // --- UUD 1945 ---
  {
    id: 'uud-1',
    deck: 'uud1945',
    deckName: 'Pasal UUD 1945',
    question: 'Apa isi Pasal 1 Ayat (2) dan Ayat (3) UUD 1945?',
    answer: '• Ayat (2): "Kedaulatan berada di tangan rakyat dan dilaksanakan menurut Undang-Undang Dasar."\n• Ayat (3): "Negara Indonesia adalah negara hukum."',
    keyNote: 'Ayat (2) diamandemen dari kedaulatan di tangan rakyat dilakukan sepenuhnya oleh MPR.'
  },
  {
    id: 'uud-2',
    deck: 'uud1945',
    deckName: 'Pasal UUD 1945',
    question: 'Pasal berapakah yang mengatur tentang Hak Asasi Manusia (HAM) secara lengkap?',
    answer: 'Pasal 28A sampai dengan Pasal 28J UUD 1945 (Hasil Amandemen Kedua tahun 2000).',
    keyNote: 'Pasal 28A (hak hidup), 28B (berkeluarga), 28C (pendidikan & teknologi), 28I (hak yang tidak dapat dikurangi).'
  },
  {
    id: 'uud-3',
    deck: 'uud1945',
    deckName: 'Pasal UUD 1945',
    question: 'Apa isi dan makna Pasal 27 Ayat (3) UUD 1945?',
    answer: '"Setiap warga negara berhak dan wajib ikut serta dalam upaya pembelaan negara."',
    keyNote: 'Ini adalah landasan konstitusional utama kewajiban bela negara bagi seluruh rakyat.'
  },
  {
    id: 'uud-4',
    deck: 'uud1945',
    deckName: 'Pasal UUD 1945',
    question: 'Apa bunyi Pasal 30 Ayat (1) dan Sistem Pertahanan apa yang digunakan?',
    answer: '• Bunyi: "Tiap-tiap warga negara berhak dan wajib ikut serta dalam usaha pertahanan dan keamanan negara."\n• Sistem: Sishankamrata (Sistem Pertahanan dan Keamanan Rakyat Semesta) dengan TNI & Polri sebagai kekuatan utama, rakyat sebagai kekuatan pendukung.',
    keyNote: 'TNI (Pertahanan), Polri (Keamanan & Ketertiban).'
  },
  {
    id: 'uud-5',
    deck: 'uud1945',
    deckName: 'Pasal UUD 1945',
    question: 'Sebutkan 4 periode Amandemen UUD 1945 beserta tahunnya!',
    answer: '1. Amandemen I: 19 Oktober 1999\n2. Amandemen II: 18 Agustus 2000\n3. Amandemen III: 9 November 2001\n4. Amandemen IV: 10 Agustus 2002',
    keyNote: 'Hafalan tahun: 1999, 2000, 2001, 2002 (4 tahun berturut-turut pada Sidang MPR).'
  },
  {
    id: 'uud-6',
    deck: 'uud1945',
    deckName: 'Pasal UUD 1945',
    question: 'Apa isi Pasal 33 Ayat (1), (2), dan (3) UUD 1945 tentang Perekonomian?',
    answer: '• Ayat (1): Perekonomian disusun sebagai usaha bersama berdasar atas asas kekeluargaan.\n• Ayat (2): Cabang produksi yang penting bagi negara dan menguasai hajat hidup orang banyak dikuasai oleh negara.\n• Ayat (3): Bumi, air, dan kekayaan alam yang terkandung di dalamnya dikuasai oleh negara dan dipergunakan untuk sebesar-besar kemakmuran rakyat.',
    keyNote: 'Bapak Ekonomi Indonesia Mohammad Hatta mendasarkan Koperasi pada Pasal 33 Ayat 1.'
  },

  // --- PANCASILA & NILAI ---
  {
    id: 'pan-1',
    deck: 'pancasila',
    deckName: 'Pancasila & Nilai',
    question: 'Sebutkan 3 tokoh perumus dasar negara pada sidang BPUPKI I beserta tanggal pidatonya!',
    answer: '1. Mr. Mohammad Yamin (29 Mei 1945)\n2. Prof. Dr. Soepomo (31 Mei 1945)\n3. Ir. Soekarno (1 Juni 1945 - hari lahir istilah Pancasila)',
    keyNote: 'Gagasan Soekarno: Kebangsaan, Internasionalisme/Perikemanusiaan, Mufakat/Demokrasi, Kesejahteraan Sosial, Ketuhanan.'
  },
  {
    id: 'pan-2',
    deck: 'pancasila',
    deckName: 'Pancasila & Nilai',
    question: 'Apa perbedaan Sila ke-1 dalam Piagam Jakarta (22 Juni 1945) dengan Pembukaan UUD 1945?',
    answer: '• Piagam Jakarta: "Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya (7 kata)."\n• Pembukaan UUD 1945: Diubah menjadi "Ketuhanan Yang Maha Esa" atas usul Mohammad Hatta demi menjaga persatuan bangsa Indonesia timur.',
    keyNote: 'Perubahan disepakati pada sidang PPKI tanggal 18 Agustus 1945.'
  },
  {
    id: 'pan-3',
    deck: 'pancasila',
    deckName: 'Pancasila & Nilai',
    question: 'Bagaimana membedakan butir pengamalan Sila ke-2 vs Sila ke-5?',
    answer: '• Sila ke-2 (Kemanusiaan): Fokus pada HAK ASASI MANUSIA, tenggang rasa, tidak semena-mena, menjunjung tinggi nilai kemanusiaan antar individu.\n• Sila ke-5 (Keadilan Sosial): Fokus pada HAK BERSAMA / KELOMPOK, tidak bergaya hidup mewah, suka bekerja keras, menghargai karya orang lain, keseimbangan hak & kewajiban.',
    keyNote: 'Trik Soal TKP/TWK: Jika ada perilaku boros / hedonisme -> pelanggaran Sila ke-5. Jika ada bullying / diskriminasi martabat -> Sila ke-2.'
  },

  // --- SEJARAH & TOKOH ---
  {
    id: 'sej-1',
    deck: 'sejarah',
    deckName: 'BPUPKI, PPKI & Sejarah',
    question: 'Kapan BPUPKI dibentuk, siapa ketuanya, dan apa bahasa Jepangnya?',
    answer: '• Dibentuk: 1 Maret 1945 (diresmikan 29 April 1945).\n• Nama Jepang: Dokuritsu Junbi Cosakai.\n• Ketua: Dr. K.R.T. Radjiman Wedyodiningrat.\n• Wakil Ketua: Ichibangase Yosio (Jepang) & R.P. Soeroso.',
    keyNote: 'Sidang I: 29 Mei - 1 Juni 1945 (Dasar Negara). Sidang II: 10 - 17 Juli 1945 (Rancangan UUD).'
  },
  {
    id: 'sej-2',
    deck: 'sejarah',
    deckName: 'BPUPKI, PPKI & Sejarah',
    question: 'Sebutkan 3 keputusan penting Sidang PPKI Pertama (18 Agustus 1945)!',
    answer: '1. Mengesahkan UUD 1945 (Pembukaan & Batang Tubuh).\n2. Memilih Ir. Soekarno sebagai Presiden dan Drs. Mohammad Hatta sebagai Wakil Presiden.\n3. Tugas presiden sementara dibantu oleh sebuah Komite Nasional (KNIP).',
    keyNote: 'PPKI dibentuk 7 Agustus 1945 (Dokuritsu Junbi Inkai) beranggotakan 21 orang (kemudian ditambah 6 tanpa sepengetahuan Jepang).'
  },
  {
    id: 'sej-3',
    deck: 'sejarah',
    deckName: 'BPUPKI, PPKI & Sejarah',
    question: 'Apa isi 3 butir ikrar Sumpah Pemuda 28 Oktober 1928?',
    answer: '1. Kami putra dan putri Indonesia, mengaku bertumpah darah yang satu, tanah air Indonesia.\n2. Kami putra dan putri Indonesia, mengaku berbangsa yang satu, bangsa Indonesia.\n3. Kami putra dan putri Indonesia, menjunjung bahasa persatuan, bahasa Indonesia.',
    keyNote: 'Ketua Kongres Pemuda II: Sugondo Djojopuspito. Lagu Indonesia Raya pertama kali dimainkan instrumen biolanya oleh W.R. Supratman.'
  },

  // --- BELA NEGARA & INTEGRITAS ---
  {
    id: 'bn-1',
    deck: 'bela_negara',
    deckName: 'Bela Negara & Integritas',
    question: 'Sebutkan 5 Unsur Dasar Nilai Bela Negara menurut UU No. 23 Tahun 2019!',
    answer: '1. Cinta Tanah Air\n2. Kesadaran Berbangsa dan Bernegara\n3. Setia pada Pancasila sebagai Ideologi Negara\n4. Rela Berkorban untuk Bangsa dan Negara\n5. Memiliki Kemampuan Awal Bela Negara (fisik & psikis)',
    keyNote: 'Bela negara tidak harus militeristik, profesi ASN yang melayani dengan integritas adalah wujud nyata bela negara.'
  },
  {
    id: 'bn-2',
    deck: 'bela_negara',
    deckName: 'Bela Negara & Integritas',
    question: 'Hafalkan rumus jembatan keledai 9 Nilai Integritas Antikorupsi KPK!',
    answer: '"JUMAT BERSEPEDA KK"\n1. JUjur\n2. MAndiri\n3. Tanggung Jawab\n4. BERani\n5. SEdarhana\n6. PEduli\n7. Disiplin\n8. Adil\n9. Kerja Keras',
    keyNote: 'Nilai Inti: Jujur, Disiplin, Tanggung jawab. Nilai Sikap: Adil, Berani, Peduli. Nilai Kerja: Kerja keras, Mandiri, Sederhana.'
  },

  // --- LEMBAGA & TATA NEGARA ---
  {
    id: 'tn-1',
    deck: 'tata_negara',
    deckName: 'Lembaga & Tata Negara',
    question: 'Apa perbedaan wewenang Mahkamah Konstitusi (MK) vs Mahkamah Agung (MA)?',
    answer: '• MK: Menguji UU terhadap UUD 1945, memutus sengketa kewenangan lembaga negara, memutus pembubaran parpol, memutus perselisihan hasil pemilu.\n• MA: Menguji peraturan perundang-undangan di bawah UU terhadap UU (misal PP/Perpres thd UU), kasasi, peninjauan kembali (PK).',
    keyNote: 'Trik: Jika menguji UU ke UUD -> MK. Jika menguji Perda/PP ke UU -> MA.'
  },
  {
    id: 'tn-2',
    deck: 'tata_negara',
    deckName: 'Lembaga & Tata Negara',
    question: 'Berapa anggota Hakim Konstitusi pada MK dan siapa yang mengajukannya?',
    answer: 'Berjumlah 9 orang Hakim Konstitusi yang ditetapkan oleh Presiden:\n• 3 orang diajukan oleh Mahkamah Agung (MA)\n• 3 orang diajukan oleh DPR\n• 3 orang diajukan oleh Presiden',
    keyNote: 'Ketua dan Wakil Ketua MK dipilih dari dan oleh para Hakim Konstitusi.'
  }
];
