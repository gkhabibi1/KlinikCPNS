export interface TKPQuestion {
  tag: string;
  text: string;
  answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  options: {
    value: string;
    text: string;
  }[];
}

export interface TKPModule {
  id: string;
  stageNumber: string;
  categoryTag: string;
  title: string;
  subtitle: string;
  intro: string;
  tags: string[];
  content: string;
  keys: string[];
  illustrationType: 'professional' | 'public' | 'network' | 'culture' | 'tik' | 'peace';
  questions: TKPQuestion[];
}

export const TKP_MODULES: TKPModule[] = [
  {
    id: "tkp-1",
    stageNumber: "TAHAP 01",
    categoryTag: "PROFESIONALISME",
    title: "Profesionalisme",
    subtitle: "Tanggung jawab & prioritas kerja",
    intro: "Mengukur bagaimana seseorang tetap menjaga tanggung jawab pekerjaan ketika muncul gangguan atau persoalan pribadi.",
    illustrationType: "professional",
    tags: ["Prioritas kerja", "Tanggung jawab", "Urgensi", "Profesional"],
    content: `<h2>Inti Materi</h2>
<p>Dalam konteks TKP CPNS, profesionalisme berhubungan dengan kemampuan menjaga pelaksanaan tugas dan integritas kinerja ketika terdapat hambatan, godaan, atau persoalan personal.</p>
<p>Situasi soal biasanya menempatkan peserta pada pilihan dilematis antara meneruskan pekerjaan penting atau menangani persoalan pribadi terlebih dahulu.</p>
<p>Arah utamanya adalah menjaga pekerjaan tetap berjalan optimal. Namun, apabila persoalan pribadi benar-benar sangat penting dan mendesak (misal: darurat medis darurat keluarga inti), kondisi tersebut perlu dikelola secara tepat, transparan, dan prosedural tanpa mengabaikan tanggung jawab kedinasan.</p>
<h2>Cara Membaca Skenario</h2>
<ul>
  <li><strong>Langkah 1:</strong> Tentukan apakah persoalan pribadi tersebut dapat ditunda atau didelegasikan.</li>
  <li><strong>Langkah 2:</strong> Jika masih dapat dikelola kemudian, pekerjaan dinas tetap menjadi prioritas utama.</li>
  <li><strong>Langkah 3:</strong> Jika kondisinya sangat penting dan mendesak, cari tindakan yang paling bertanggung jawab untuk menangani keduanya tanpa meninggalkan tugas secara sepihak.</li>
</ul>`,
    keys: [
      "Prioritas kerja: Kerjakan tugas kedinasan jika urusan pribadi masih dapat ditunda.",
      "Tanggung jawab: Jangan pernah meninggalkan tugas kantor tanpa kepastian dan koordinasi.",
      "Urgensi terukur: Bedakan antara urusan mendesak sungguhan dan sekadar keinginan personal."
    ],
    questions: [
      {
        tag: "SOAL 1",
        text: "Anda sedang menyelesaikan tugas penting. Pada saat yang sama muncul urusan pribadi yang masih dapat ditunda. Sikap paling tepat adalah...",
        answer: "B",
        explanation: "Penyelesaian pekerjaan kedinasan merupakan prioritas utama ketika persoalan pribadi belum bersifat sangat penting dan mendesak.",
        options: [
          { value: "A", text: "Meninggalkan pekerjaan karena semua urusan pribadi harus didahulukan." },
          { value: "B", text: "Tetap menyelesaikan pekerjaan dan menangani urusan pribadi setelah tugas terkendali." },
          { value: "C", text: "Meminta rekan mengambil alih seluruh pekerjaan tanpa penjelasan." },
          { value: "D", text: "Mengabaikan pekerjaan sampai masalah pribadi selesai." }
        ]
      },
      {
        tag: "SOAL 2",
        text: "Jika persoalan pribadi benar-benar sangat penting dan mendesak, pendekatan yang sesuai adalah...",
        answer: "B",
        explanation: "Materi memberi ruang untuk kondisi darurat personal, namun tetap menekankan manajemen tanggung jawab, komunikasi izin yang tepat, dan koordinasi pekerjaan.",
        options: [
          { value: "A", text: "Mengabaikan seluruh kewajiban pekerjaan." },
          { value: "B", text: "Mengelola kondisi tersebut secara tepat sambil tetap memperhatikan tanggung jawab pekerjaan." },
          { value: "C", text: "Memaksakan diri bekerja tanpa mempertimbangkan keadaan." },
          { value: "D", text: "Menunda semua pekerjaan tanpa memberi informasi." }
        ]
      },
      {
        tag: "SOAL 3",
        text: "Apa pertanyaan pertama yang berguna ketika menghadapi dilema pekerjaan dan urusan pribadi?",
        answer: "B",
        explanation: "Kunci utama profesionalisme adalah membedakan persoalan biasa yang dapat ditunda dengan kondisi yang benar-benar genting dan mendesak.",
        options: [
          { value: "A", text: "Mana yang paling mudah dilakukan?" },
          { value: "B", text: "Apakah persoalan pribadi benar-benar mendesak dan tidak dapat ditunda?" },
          { value: "C", text: "Apa pilihan yang paling menguntungkan diri sendiri?" },
          { value: "D", text: "Siapa yang dapat menggantikan saya?" }
        ]
      }
    ]
  },
  {
    id: "tkp-2",
    stageNumber: "TAHAP 02",
    categoryTag: "PELAYANAN PUBLIK",
    title: "Pelayanan Publik",
    subtitle: "Adil & sesuai prosedur",
    intro: "Menilai cara memberikan layanan kepada masyarakat dengan tetap menjaga keadilan, keramahan, dan kepatuhan prosedur operasional.",
    illustrationType: "public",
    tags: ["Keadilan", "Prosedur", "Antrean", "Masyarakat"],
    content: `<h2>Inti Materi</h2>
<p>Peserta diposisikan sebagai aparatur sipil negara yang memegang amanah memberikan pelayanan prima kepada masyarakat umum.</p>
<p>Contoh konteks soal dapat berupa pengurusan dokumen perizinan, loket tiket transportasi, pengaturan antrean layanan kesehatan, atau penanganan keluhan pelanggan publik.</p>
<p>Dilema yang lazim diuji berada di antara pelayanan yang adil dan prosedural dengan godaan memberikan perlakuan istimewa (nepotisme, suap, atau simpati berlebihan yang melanggar antrean).</p>
<h2>Prinsip Utama Pelayanan</h2>
<ul>
  <li><strong>Adil & Non-Diskriminatif:</strong> Utamakan pelayanan yang setara bagi seluruh lapisan warga tanpa membedakan status sosial.</li>
  <li><strong>Kepatuhan SOP:</strong> Jangan menjadikan alasan personal, koneksi keluarga, atau desakan sepihak sebagai pembenaran untuk mengabaikan aturan baku.</li>
  <li><strong>Empati Tanpa Melanggar Aturan:</strong> Ketika beberapa pilihan sama-sama tampak membantu, prioritaskan opsi yang tetap menjaga keadilan bagi antrean pengguna layanan lain.</li>
</ul>`,
    keys: [
      "Keadilan antrean: Semua pengguna layanan berhak dilayani sesuai nomor urut dan syarat yang sah.",
      "Prosedur sebagai pelindung: SOP dibuat agar pelayanan terhindar dari kesewenang-wenangan.",
      "Integritas: Tolak segala bentuk imbalan ilegal atau titipan yang merugikan masyarakat luas."
    ],
    questions: [
      {
        tag: "SOAL 1",
        text: "Seorang pengguna layanan meminta didahulukan tanpa dasar prosedural. Respons yang paling sesuai adalah...",
        answer: "B",
        explanation: "Prinsip dasar pelayanan publik menuntut keadilan, kesetaraan, dan kepatuhan penuh terhadap antrean serta prosedur resmi.",
        options: [
          { value: "A", text: "Mendahulukannya agar tidak terjadi konflik." },
          { value: "B", text: "Tetap memberikan layanan sesuai antrean dan prosedur yang berlaku." },
          { value: "C", text: "Meminta imbalan agar permintaannya dapat diproses." },
          { value: "D", text: "Menyuruhnya mencari petugas lain." }
        ]
      },
      {
        tag: "SOAL 2",
        text: "Dalam soal pelayanan publik, ketika pilihan jawaban menawarkan perlakuan khusus dan pelayanan prosedural, prinsip yang perlu diprioritaskan adalah...",
        answer: "C",
        explanation: "Aparatur wajib menjunjung tinggi keadilan bagi seluruh pemohon dan menaati tata tertib dinas.",
        options: [
          { value: "A", text: "Kedekatan dengan petugas." },
          { value: "B", text: "Keuntungan petugas." },
          { value: "C", text: "Keadilan dan prosedur pelayanan." },
          { value: "D", text: "Keinginan pengguna yang paling keras." }
        ]
      },
      {
        tag: "SOAL 3",
        text: "Mengapa aturan pelayanan perlu tetap diperhatikan?",
        answer: "B",
        explanation: "Prosedur berfungsi sebagai landasan objektif agar pelayanan publik tidak diberikan secara diskriminatif atau sewenang-wenang.",
        options: [
          { value: "A", text: "Agar petugas terlihat tegas." },
          { value: "B", text: "Agar layanan diberikan secara adil dan konsisten." },
          { value: "C", text: "Agar proses selalu lebih lambat." },
          { value: "D", text: "Agar masyarakat tidak dapat bertanya." }
        ]
      }
    ]
  },
  {
    id: "tkp-3",
    stageNumber: "TAHAP 03",
    categoryTag: "JEJARING KERJA",
    title: "Jejaring Kerja",
    subtitle: "Kolaborasi & tanggung jawab tim",
    intro: "Menguji kemampuan membangun hubungan kerja yang produktif, menyelesaikan gesekan, dan memberikan kontribusi nyata dalam sinergi kelompok.",
    illustrationType: "network",
    tags: ["Kolaborasi", "Konflik", "Kontribusi", "Proporsional"],
    content: `<h2>Inti Materi</h2>
<p>Jejaring kerja (networking & teamwork) berkaitan dengan kompetensi membangun, merawat, dan mengembangkan hubungan kerja yang harmonis dengan rekan sejawat, atasan, bawahan, maupun instansi eksternal.</p>
<p>Skenario ujian kerap menghadirkan gesekan komunikasi, perbedaan gaya kerja, atau friksi kepribadian yang mengancam kinerja kelompok.</p>
<p>Setiap tindakan dalam kerja sama tim harus dilandasi etika profesional, akuntabilitas, dan berorientasi pada pencapaian tujuan bersama.</p>
<h2>Ketika Menjadi Anggota atau Pemimpin</h2>
<ul>
  <li><strong>Peran Anggota Tim:</strong> Berinisiatif aktif, menjadi solusi konstruktif, serta menyelesaikan tanggung jawab bagian sendiri tanpa melempar beban.</li>
  <li><strong>Peran Pemimpin Tim:</strong> Melakukan pembagian beban kerja secara adil, proporsional, serta mengayomi kebutuhan tim secara bijak.</li>
  <li><strong>Mediasi Konflik:</strong> Pilih respons diplomatis yang meredam permusuhan, mencari akar masalah bersama, dan memulihkan kolaborasi kerja.</li>
</ul>`,
    keys: [
      "Kolaborasi positif: Jadilah rekan kerja yang solutif, suportif, dan dapat diandalkan.",
      "Manajemen beban proporsional: Pemimpin mendistribusikan tugas sesuai kapasitas dan keahlian tim.",
      "Resolusi konflik: Fokus pada solusi masalah bersama (win-win solution), bukan mencari kambing hitam."
    ],
    questions: [
      {
        tag: "SOAL 1",
        text: "Tim mengalami konflik yang membuat pekerjaan terganggu. Respons yang paling sesuai dengan prinsip jejaring kerja adalah...",
        answer: "B",
        explanation: "Kunci jejaring kerja adalah aktif meredam ketegangan, memulihkan keharmonisan komunikasi, dan mendorong kerja sama kembali.",
        options: [
          { value: "A", text: "Membiarkan konflik sampai salah satu pihak menyerah." },
          { value: "B", text: "Memilih tindakan yang membantu menyelesaikan konflik dan memulihkan kerja sama." },
          { value: "C", text: "Menyebarkan konflik kepada anggota tim lain." },
          { value: "D", text: "Menghindari semua komunikasi." }
        ]
      },
      {
        tag: "SOAL 2",
        text: "Jika Anda menjadi pemimpin tim, pembagian tugas sebaiknya...",
        answer: "B",
        explanation: "Kepemimpinan yang efektif dan beretika membagi tugas secara transparan, proporsional, dan adil sesuai porsi pekerjaan.",
        options: [
          { value: "A", text: "Diberikan seluruhnya kepada anggota yang paling dekat dengan Anda." },
          { value: "B", text: "Dibagi secara adil dan proporsional." },
          { value: "C", text: "Diberikan secara acak tanpa melihat kondisi pekerjaan." },
          { value: "D", text: "Dikerjakan sendiri oleh pemimpin." }
        ]
      },
      {
        tag: "SOAL 3",
        text: "Sikap yang menggambarkan anggota tim yang berguna adalah...",
        answer: "B",
        explanation: "Seorang ASN diharapkan memiliki proaktivitas tinggi, kontribusi nyata terhadap target tim, dan berani bertanggung jawab atas pekerjaannya.",
        options: [
          { value: "A", text: "Hanya mengikuti keputusan tanpa kontribusi." },
          { value: "B", text: "Memberi kontribusi nyata dan bertanggung jawab atas tindakannya." },
          { value: "C", text: "Menghindari tugas sulit." },
          { value: "D", text: "Melepaskan tanggung jawab kepada rekan." }
        ]
      }
    ]
  },
  {
    id: "tkp-4",
    stageNumber: "TAHAP 04",
    categoryTag: "SOSIOKULTURAL",
    title: "Sosiokultural",
    subtitle: "Keberagaman & empati",
    intro: "Menguji kemampuan beradaptasi di tengah heterogenitas suku, agama, ras, dan budaya dengan sikap saling menghargai dan berempati.",
    illustrationType: "culture",
    tags: ["Empati", "Toleransi", "Keberagaman", "Menghargai"],
    content: `<h2>Inti Materi</h2>
<p>Aspek sosiokultural mengukur kompetensi sosial dalam berinteraksi dengan masyarakat majemuk Indonesia, memiliki kepekaan emosional, serta menjunjung nilai toleransi.</p>
<p>Skenario tes sering kali menghadapkan peserta pada situasi ketika tradisi lokal, tata krama daerah, atau keyakinan rekan berlainan dengan latar belakang pribadi.</p>
<p>Perbedaan tersebut tidak boleh dipandang sebagai ancaman atau alasan merendahkan pihak lain, melainkan kekayaan bangsa yang harus dihormati bersama.</p>
<h2>Jika Terdapat Perbedaan / Tidak Sepaham</h2>
<ul>
  <li><strong>Integritas Prinsip:</strong> Seseorang tetap dapat memegang teguh keyakinan atau prinsip moral pribadi tanpa perlu mencela orang lain.</li>
  <li><strong>Komunikasi Santun:</strong> Jika ada ajakan atau tradisi yang tidak sesuai keyakinan agama/pribadi, sampaikan penolakan atau batasan secara halus, santun, dan tidak melukai perasaan.</li>
  <li><strong>Pemisahan Sikap:</strong> Kuncinya adalah memisahkan preferensi pribadi dari kewajiban menghormati martabat sesama rekan kerja dan masyarakat.</li>
</ul>`,
    keys: [
      "Empati & Kepekaan: Pahami sudut pandang orang lain sebelum menghakimi perbedaan.",
      "Toleransi aktif: Bekerja sama dengan harmonis tanpa mempersoalkan latar belakang SARA.",
      "Santun dalam berprinsip: Menolak hal yang tidak sesuai dengan cara yang diplomatis dan penuh respek."
    ],
    questions: [
      {
        tag: "SOAL 1",
        text: "Anda menemukan kebiasaan budaya rekan kerja yang berbeda dengan kebiasaan Anda. Sikap yang paling sesuai adalah...",
        answer: "B",
        explanation: "Sikap utama sosiokultural adalah keterbukaan, toleransi, dan menghargai keragaman tanpa memaksakan standar budaya sendiri.",
        options: [
          { value: "A", text: "Langsung menyatakan kebiasaan tersebut salah." },
          { value: "B", text: "Menghargai perbedaan dan tetap menjaga interaksi yang baik." },
          { value: "C", text: "Meminta semua orang mengikuti kebiasaan Anda." },
          { value: "D", text: "Menghindari rekan tersebut." }
        ]
      },
      {
        tag: "SOAL 2",
        text: "Jika nilai tertentu bertentangan dengan keyakinan pribadi, tindakan yang sesuai adalah...",
        answer: "C",
        explanation: "Menjaga keyakinan pribadi tetap wajib dilakukan, namun penolakan harus diungkapkan secara santun dan elegan agar tidak memicu permusuhan.",
        options: [
          { value: "A", text: "Menolak dengan cara yang merendahkan." },
          { value: "B", text: "Menerima semuanya tanpa batas." },
          { value: "C", text: "Menyampaikan ketidaksetujuan secara halus tanpa menyinggung pihak lain." },
          { value: "D", text: "Memaksa pihak lain mengubah keyakinannya." }
        ]
      },
      {
        tag: "SOAL 3",
        text: "Kemampuan yang penting dalam aspek sosiokultural antara lain...",
        answer: "A",
        explanation: "Aspek sosial budaya berakar pada kepekaan hati nurani, empati terhadap sesama, dan kemampuan merajut harmoni di tengah keberagaman.",
        options: [
          { value: "A", text: "Kepekaan dan empati terhadap orang lain." },
          { value: "B", text: "Kemampuan memaksakan pendapat." },
          { value: "C", text: "Kemampuan memenangkan perdebatan." },
          { value: "D", text: "Kemampuan menghindari semua perbedaan." }
        ]
      }
    ]
  },
  {
    id: "tkp-5",
    stageNumber: "TAHAP 05",
    categoryTag: "TIK",
    title: "Teknologi Informasi & Komunikasi",
    subtitle: "Manfaat, penggunaan & dampak",
    intro: "Mengukur kecakapan digital, keterbukaan adopsi teknologi, serta analisis kritis terhadap dampak positif dan risiko negatif TIK.",
    illustrationType: "tik",
    tags: ["Teknologi", "Manfaat", "Risiko", "Dampak"],
    content: `<h2>Inti Materi</h2>
<p>Aspek TIK dalam seleksi CPNS mencakup wawasan teknologi digital, percepatan efisiensi birokrasi melalui sistem elektronik (SPBE), dan mitigasi bahaya dunia maya.</p>
<p>Peserta dituntut untuk selalu adaptif terhadap modernisasi aplikasi kerja, otomatisasi data, serta pemanfaatan sarana komunikasi daring secara positif.</p>
<p>Evaluasi keputusan tidak boleh hanya silau pada kecanggihan semata, melainkan wajib memperhitungkan keamanan data, etika digital, dan konsekuensi penggunaannya.</p>
<h2>Kerangka Berpikir Pengambilan Keputusan TIK</h2>
<ul>
  <li><strong>Pahami Konteks & Platform:</strong> Kenali fungsi sistem, aplikasi, atau instrumen digital yang dihadapi.</li>
  <li><strong>Tentukan Sasaran Pelayanan:</strong> Pastikan pemanfaatan teknologi memang bertujuan meningkatkan kecepatan dan transparansi layanan.</li>
  <li><strong>Timbang Manfaat Nyata:</strong> Efisiensi waktu, paperless, dan akurasi data.</li>
  <li><strong>Mitigasi Risiko & Kelemahan:</strong> Ancaman kebocoran privasi, hoaks, disinformasi, atau kesenjangan akses pengguna.</li>
  <li><strong>Keputusan Solutif:</strong> Adopsi teknologi secara cermat, aman, dan beretika.</li>
</ul>`,
    keys: [
      "Adaptasi digital: ASN wajib terbuka mempelajari sistem teknologi baru demi efisiensi kerja.",
      "Keseimbangan manfaat & risiko: Manfaatkan kecanggihan teknologi seraya memperketat keamanan data.",
      "Etika berkomunikasi: Jaga netralitas, validitas info, dan hindari penyebaran hoaks di kanal digital."
    ],
    questions: [
      {
        tag: "SOAL 1",
        text: "Saat menilai penggunaan suatu teknologi, pertimbangan yang sesuai adalah...",
        answer: "B",
        explanation: "Penilaian teknologi yang bijak harus menimbang potensi efisiensi sekaligus mengantisipasi risiko negatif yang mungkin timbul.",
        options: [
          { value: "A", text: "Hanya melihat apakah teknologinya populer." },
          { value: "B", text: "Melihat manfaat serta dampak positif dan negatifnya." },
          { value: "C", text: "Memilih teknologi terbaru tanpa pertimbangan lain." },
          { value: "D", text: "Menghindari semua teknologi." }
        ]
      },
      {
        tag: "SOAL 2",
        text: "Urutan berpikir yang paling tepat ketika menghadapi skenario TIK adalah...",
        answer: "B",
        explanation: "Alur rasional mencakup pemahaman situasi, identifikasi tujuan, komparasi manfaat vs dampak, lalu mengeksekusi langkah terbaik.",
        options: [
          { value: "A", text: "Pilih teknologi → abaikan risiko → selesai." },
          { value: "B", text: "Pahami penggunaan → lihat tujuan → timbang manfaat dan dampak → tentukan respons." },
          { value: "C", text: "Cari pilihan yang paling cepat tanpa membaca situasi." },
          { value: "D", text: "Ikuti pilihan mayoritas tanpa analisis." }
        ]
      },
      {
        tag: "SOAL 3",
        text: "Mengapa dampak negatif perlu diperhitungkan?",
        answer: "B",
        explanation: "Setiap perangkat atau sistem digital membawa potensi dampak sampingan (misal keamanan siber atau kesalahan data) yang wajib dimitigasi.",
        options: [
          { value: "A", text: "Karena semua teknologi pasti buruk." },
          { value: "B", text: "Karena penggunaan teknologi dapat membawa konsekuensi selain manfaat." },
          { value: "C", text: "Agar teknologi tidak pernah digunakan." },
          { value: "D", text: "Agar keputusan selalu menjadi lebih lambat." }
        ]
      }
    ]
  },
  {
    id: "tkp-6",
    stageNumber: "TAHAP 06",
    categoryTag: "ANTI RADIKALISME",
    title: "Anti Radikalisme",
    subtitle: "Persatuan, damai & anti-kekerasan",
    intro: "Menguji komitmen kebangsaan, penolakan ideologi pemecah belah bangsa, serta keberanian menjaga perdamaian dalam kebinekaan.",
    illustrationType: "peace",
    tags: ["Persatuan", "Perdamaian", "Anti-kekerasan", "Kebersamaan"],
    content: `<h2>Inti Materi</h2>
<p>Materi Anti Radikalisme dirancang untuk memastikan calon aparatur negara memiliki imunitas kuat terhadap paham ekstremis, intoleransi, dan radikalisme.</p>
<p>Skenario soal menguji sikap tegas ketika berhadapan dengan provokasi berbau sentimen SARA, ajakan intoleran, maupun bibit separatisme di lingkungan masyarakat atau kantor.</p>
<p>Prinsip absolut yang dipegang teguh adalah menolak segala upaya penggantian konsensus bangsa melalui intimidasi maupun kekerasan, serta aktif merawat koeksistensi damai.</p>
<h2>Arah Respons Utama</h2>
<ul>
  <li><strong>Tolak Ekstremisme:</strong> Menolak tegas paham radikal, ujaran kebencian, dan pembenaran aksi kekerasan.</li>
  <li><strong>Penjaga NKRI:</strong> Menjaga persatuan dan kesatuan nasional berlandaskan Pancasila dan UUD 1945.</li>
  <li><strong>Penyelesaian Damai:</strong> Mendorong musyawarah mufakat dan jalur hukum yang sah ketika terjadi ketegangan sosial.</li>
  <li><strong>Membina Hidup Berdampingan:</strong> Membangun kesadaran kolektif bahwa keberagaman Indonesia adalah takdir kekuatan bersama (coexistence).</li>
</ul>`,
    keys: [
      "Anti-kekerasan: Tolak mentah-mentah ideologi perubahan melalui jalan anarkis dan ekstremis.",
      "Perekat bangsa: ASN adalah motor persatuan yang membela keutuhan NKRI dan Pancasila.",
      "Dialog damai: Selesaikan setiap perselisihan antarwarga melalui pendekatan dialogis dan kekeluargaan."
    ],
    questions: [
      {
        tag: "SOAL 1",
        text: "Ketika muncul konflik antarkelompok karena perbedaan, respons yang paling sesuai adalah...",
        answer: "B",
        explanation: "Sebagai penjaga harmoni bangsa, aparatur negara wajib mempromosikan penyelesaian damai, menenangkan suasana, dan menjaga keutuhan persatuan.",
        options: [
          { value: "A", text: "Memperbesar konflik agar salah satu pihak menang." },
          { value: "B", text: "Mendorong penyelesaian damai dan menjaga persatuan." },
          { value: "C", text: "Mendukung kekerasan sebagai jalan keluar." },
          { value: "D", text: "Menyebarkan informasi yang memperuncing konflik." }
        ]
      },
      {
        tag: "SOAL 2",
        text: "Sikap terhadap gagasan perubahan yang mendorong kekerasan adalah...",
        answer: "B",
        explanation: "Pancasila dan hukum NKRI menolak tegas segala bentuk perubahan tatanan kenegaraan atau sosial yang menggunakan jalan kekerasan dan teror.",
        options: [
          { value: "A", text: "Mendukungnya jika tujuan dianggap baik." },
          { value: "B", text: "Menolaknya dan memilih penyelesaian tanpa kekerasan." },
          { value: "C", text: "Menyebarkannya kepada kelompok lain." },
          { value: "D", text: "Membiarkannya berkembang." }
        ]
      },
      {
        tag: "SOAL 3",
        text: "Dalam masyarakat yang beragam, tindakan yang perlu diperkuat adalah...",
        answer: "B",
        explanation: "Kunci ketahanan nasional adalah memupuk rasa persaudaraan sebangsa dan kesediaan untuk hidup berdampingan secara damai di tengah perbedaan.",
        options: [
          { value: "A", text: "Pemaksaan keseragaman." },
          { value: "B", text: "Kebersamaan dan pemahaman untuk hidup berdampingan." },
          { value: "C", text: "Pemisahan kelompok berdasarkan latar belakang." },
          { value: "D", text: "Konflik terbuka." }
        ]
      }
    ]
  }
];
