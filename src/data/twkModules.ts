export interface TWKQuestion {
  tag: string;
  text: string;
  answer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  options: {
    value: string;
    text: string;
  }[];
}

export interface TWKModule {
  id: string;
  stageNumber: string;
  title: string;
  content: string;
  keys: string[];
  questions: TWKQuestion[];
}

export const TWK_MODULES: TWKModule[] = [
  {
    "id": "m0",
    "stageNumber": "TAHAP 01",
    "title": "Nasionalisme: Fondasi dan Perkembangannya",
    "content": "<h2>Apa Itu Nasionalisme?</h2><p>Jika dilihat dari asal katanya, nasionalisme berasal dari kata nation yang berarti bangsa. Dalam pengertian istilah dalam Kamus Besar Bahasa Indonesia (KBBI), nasionalisme dipahami sebagai paham atau ajaran untuk mencintai bangsa dan negara sendiri.</p><p>Di samping itu, nasionalisme bermakna tentang kesadaran keanggotaan dalam suatu bangsa yang secara potensial atau aktual bersama-sama mencapai, mempertahankan, dan mengabadikan identitas, integritas, kemakmuran, dan kekuatan bangsa itu.</p><p>Dengan kata lain, nasionalisme dapat dimaknai sebagai suatu konsep atau ideologi yang mementingkan identitas, kesatuan, dan kepentingan nasional suatu bangsa atau negara.</p><p>Nasionalisme secara garis besar menitikberatkan loyalitas dan kesetiaan anggota suatu bangsa terhadap negara mereka, dan perasaan kebanggaan terhadap identitas nasional mereka.</p><h2>Ciri-Ciri Nasionalisme</h2><p>Ciri-ciri nasionalisme di Indonesia di antaranya adalah sebagai berikut: 1. Menempatkan kepentingan individu dan kelompok di bawah kepentingan bangsa. 2. Berkomitmen untuk bekerja demi kemakmuran bangsa. 3. Tujuan bersosial politik yang berfokus pada kesejahteraan bangsa. 4. Selalu memperkuat kemakmuran bangsa. 5. Taat dan patuh terhadap kebijakan dan hukum negara. 6. Merawat dan menjaga keutuhan bangsa. 7. Mempertahankan keunggulan dan kemakmuran bangsa.</p><h2>Tujuan Nasionalisme</h2><p>Arah utama nasionalisme pada dasarnya adalah tentang persatuan dan kesatuan di tengah kemajemukan yang ada di Indonesia. Berikut ini adalah tujuan yang juga sekaligus menjadi sikap- sikap yang bisa menumbuhkan sikap nasionalisme: 1. Cinta Tanah Air: Membangun rasa cinta yang mendalam terhadap tanah air. 2. Rela Berkorban: Bersedia berkorban demi kepentingan negara dan bangsa. 3. Menempatkan Kepentingan Bangsa: Prioritaskan kepentingan bangsa dan negara di atas kepentingan pribadi atau kelompok. 4. Memajukan Persatuan dan Kesatuan: Mendorong persatuan dan kesatuan dalam keragaman bangsa. 5. Kebanggaan Kebangsaan: Membangun rasa kebanggaan menjadi bagian dari suatu bangsa dan menjaga ketertiban dunia. 6. Bhinneka Tunggal Ika: Mendorong persatuan Indonesia dengan tetap menghormati keragaman budaya dan agama.</p><h2>Fase-Fase Perkembangan Nasionalisme Indonesia</h2><p>1. Fase Pertama Gerakan kebangkitan nasionalisme Indonesia pada suatu dinamika sejarah diawali oleh masa Boedi Oetomo pada tahun 1908, yang dimotori oleh para mahasiswa sekolahan anak para priyayi Jawa, kedokteran Stovia, dan sekolah yang kemudian disediakan Belanda di Jakarta.</p><p>2. Fase Kedua Fase kedua adalah pada proses kebangkitan nasionalisme yang terjadi di tahun 1928, yaitu 20 tahun setelah proses kebangkitan nasional terjadi.</p><p>Pada fase ini kemudian dijumpai suatu kesadaran menyatukan negara, bangsa dan bahasa ke dalam satu negara yang telah disadari oleh para pemuda dan sudah terkotak-kotak dengan suatu organisasi kedaerahan seperti Jong Celebes, Jong Sumatera, Jong Java, dan lain sebagainya. Hal ini kemudian diwujudkan secara nyata dengan menyelenggarakan Sumpah Pemuda pada 1928.</p><p>3. Fase Ketiga Fase berikutnya atau juga dikenal sebagai dengan masa “Revolusi Fisik Kemerdekaan”. Peranan nyata pemuda pada masa revolusi fisik kemerdekaan terjadi saat mereka menyandera Soekarno-Hatta ke Rengasdengklok, supaya segera memproklamasikan kemerdekaan Indonesia. Mereka dengan sangat bersemangat mewujudkan nation state yang berdaulat dalam kerangka kemerdekaan.</p><p>4. Fase Keempat</p><p>Fase berikutnya kemudian perkembangan nasionalisme di tahun 1966, yang menandai tatanan baru dalam suatu pemerintahan Indonesia. Selama 20 tahun setelah kemerdekaan kemudian terjadi huru- hara pemberontakan Gestapu dan eksesnya.</p><p>5. Fase Kelima Pergolakan masa Orde Baru kemudian melahirkan fase kelima, yang juga dikenal sebagai sebagai “Masa Reformasi”. Nasionalisme kemudian tidak selesai hanya pada masa pemerintahan Soeharto, tetapi terus bergulir ketika reformasi menjadi sumber inspirasi perjuangan suatu bangsa meskipun melalui suatu perjalanan sejarah yang cukup panjang.</p><h2>Faktor Munculnya Nasionalisme Di Indonesia</h2><p>1. FAKTOR INTERN - Timbulnya kembali golongan pertengahan, kaum terpelajar. - Adanya penderitaan dan kesengsaraan seluruh rakyat - Pengaruh golongan peranakan - Adanya keinginan untuk melepaskan diri dari imperialisme</p><p>2. FAKTOR EKSTERN - Faham-faham modern dari Eropa (liberalisme, komunisme, dll) - Gerakan pan-islamisme - Pergerakan bangsa terjajah di Asia - Kemenangan Rusia atas Jepang</p><h2>Prinsip/ Pilar Nasionalisme</h2><ul><li>Kesatuan (unity), dalam wilayah teritorial, bangsa, bahasa, ideologi, dan doktrin kenegaraan, sistem politik atau pemerintahan, sistem perekonomian, sistem pertahanan keamanan, dan policy kebudayan;</li><li>Kebebasan (liberty, freedom, independence), dalam beragama, berbicara dan berpendapat lisan dan tertulis, berkelompok dan berorganisasi;</li><li>Kesamaan (equality) dalam kedudukan hukum, hak dan kewajiban;</li><li>Kepribadian (personality) dan identitas (identity), yaitu memiliki harga diri, rasa bangga dan rasa sayang terhadap kepribadian dan identitas bangsanya yang tumbuh dari dan sesuai dengan sejarah dan kebudayaannya;</li><li>Prestasi (achievement) yaitu cita-cita untuk mewujudkan kesejahteraan dan kebesaran dan kemanusiaan dari bangsanya.</li></ul><p>HUBUNGAN NASIONALISME DENGAN WAWASAN NUSANTARA Rasa Kebangsaan : rasa yang lahir secara alamiah karena adanya kebersamaan sosial yang tumbuh dari kebudayaan, sejarah dan aspirasi perjuangan masa lampau, dan kebersaamaan dalam menghadapi tantangan sejarah masa kini. Rasa Kebangsaan melahirkan wawasan kebangsaan. Wawasan Kebangsaan : cara pandang bangsa Indonesia berdasarkan Pancasila dan Undang-Undang Dasar 1945 tentang diri dan lingkungannya dalam mengekspresikan diri sebagai bangsa Indonesia di tengah-tengah lingkungan Nusantara. Wawasan kebangsaan melahirkan wawasan nusantara. Wasasan Nusantara : cara pandang bangsa Indonesia tentang diri dan Lingkungannya berdasarkan Pancasila dan Undang-Undang Dasar 1945 yang menjiwai kehidupan bangsa dalam mencapai tujuan nasional atau cita-cita Naionalisme. “KESIMPULANNYA ADALAH BAHWA NASIONALISME MERUPAKANM CITA-CITA DAN TUJUAN DARI WAWASAN NUSANTARA”</p><p>PAHAM-PAHAM YANG BERTENTANGAN DENGAN NASIONALISME 1. Egoisme : Sikap mementingkan diri sendiri 2. Chauvinisme : Paham/ ajaran cinta tanah air yang berlebihan. Memandang remeh bangsa lain dan mengunggulkan bangsanya sendiri. 3. Ekstrimisme : Sikap keras mempertahankan pendirian dengan menghalalkan segala cara untuk mencapai tujuan pribadi 4. Terorisme : Adalah tindakan sistematis yang bertujuan menciptakan kepanikan, keresahan dan suasana tidak aman dalam masyarakat 5. Primordialisme : sikap mementingkan daerah, suku, agama, ras, antar golongan sendiri 6. Separatisme : gerakan yang dilakukan oleh orang, kelompok, atau golongan untuk membuat negara sendiri. Tujuan dari separatisme yaitu untuk mendapatkan kedaulatan sendiri di suatu wilayah atau bahkan negara baru.</p>",
    "keys": [
      "Jika dilihat dari asal katanya, nasionalisme berasal dari kata nation yang berarti bangsa. Dalam pengertian istilah dalam Kamus Besar Bahasa Indonesia (KBBI), nasionalisme dipahami sebagai paham atau ajaran untuk mencintai bangsa dan negara sendiri.",
      "Di samping itu, nasionalisme bermakna tentang kesadaran keanggotaan dalam suatu bangsa yang secara potensial atau aktual bersama-sama mencapai, mempertahankan, dan mengabadikan identitas, integritas, kemakmuran, dan kekuatan bangsa itu.",
      "Dengan kata lain, nasionalisme dapat dimaknai sebagai suatu konsep atau ideologi yang mementingkan identitas, kesatuan, dan kepentingan nasional suatu bangsa atau negara."
    ],
    "questions": [
      {
        "answer": "B",
        "tag": "SOAL 1",
        "text": "Sikap yang paling sesuai dengan prinsip nasionalisme adalah …",
        "explanation": "Materi menempatkan kepentingan bangsa, persatuan, dan penghargaan terhadap keberagaman sebagai ciri penting nasionalisme.",
        "options": [
          {
            "value": "A",
            "text": "Mengutamakan kepentingan kelompok sendiri"
          },
          {
            "value": "B",
            "text": "Menempatkan kepentingan bangsa di atas kepentingan pribadi sambil menghormati keberagaman"
          },
          {
            "value": "C",
            "text": "Menolak semua budaya dari luar"
          },
          {
            "value": "D",
            "text": "Menganggap kelompok sendiri selalu paling unggul"
          }
        ]
      },
      {
        "answer": "B",
        "tag": "SOAL 2",
        "text": "Peristiwa yang menjadi tonggak fase kedua perkembangan nasionalisme dalam materi adalah …",
        "explanation": "Fase kedua dikaitkan dengan 1928 dan diwujudkan melalui Sumpah Pemuda.",
        "options": [
          {
            "value": "A",
            "text": "Boedi Oetomo 1908"
          },
          {
            "value": "B",
            "text": "Sumpah Pemuda 1928"
          },
          {
            "value": "C",
            "text": "Rengasdengklok 1945"
          },
          {
            "value": "D",
            "text": "Reformasi 1998"
          }
        ]
      },
      {
        "answer": "B",
        "tag": "SOAL 3",
        "text": "Sikap yang terlalu mengutamakan suku atau daerah sendiri disebut …",
        "explanation": "Primordialisme dalam materi merujuk pada kecenderungan mengutamakan daerah, suku, agama, ras, atau golongan sendiri.",
        "options": [
          {
            "value": "A",
            "text": "Integrasi"
          },
          {
            "value": "B",
            "text": "Primordialisme"
          },
          {
            "value": "C",
            "text": "Patriotisme"
          },
          {
            "value": "D",
            "text": "Nasionalisme"
          }
        ]
      }
    ]
  },
  {
    "id": "m1",
    "stageNumber": "TAHAP 02",
    "title": "Integrasi, Identitas, dan Ketahanan Nasional",
    "content": "<h2>Nasionalisme Dan Integrasi Nasional</h2><p>Integrasi nasional dipahami sebagai proses menyatukan berbagai kelompok sosial dan budaya di dalam sebuah kesatuan wilayah hingga membentuk suatu identitas nasional. Sementara itu faktor pembentuk integrasi nasional adalah 1) Faktor sejarah yang menimbulkan rasa senasib dan seperjuangan 2) Keinginan untuk bersatu di kalangan bangsa Indonesia sebagaimana dinyatakan dalam Sumpah Pemuda tanggal 28 Oktober 1928 3) Rasa cinta tanah air di kalangan bangsa Indonesia. 4) Kesepakatan atau konsensus nasional dalam perwujudan Proklamasi Kemerdekaan, Pancasila, dan UUD 1945, bendera Merah Putih, lagu kebangsaan Indonesia Raya, bahasa kesatuan Bahasa Indonesia. Disintegrasi nasional adalah situasi yang dapat menjadi penyebab perpecahan bangsa. Disintegrasi bisa merusak persatuan-kesatuan bangsa, dan bahkan mengancam keutuhan negara. Sementara itu faktor terjadinya disintegrasi nasional adalah 1) Kurangnya penghargaan terhadap kemajemukan yang bersifat heterogen 2) Kurang toleransi antar golongan 3) Kurangnya kesadaran dari masyarakat Indonesia terhadap ancaman dan gangguan dari luar 4) Adanya ketidakpuasan terhadap ketimpangan dan ketidakmerataan hasil-hasil pembangunan</p><p>IDENTITAS NASIONAL Identitas Nasional adalah istilah yang terdiri dari dua kata yaitu identitas dan nasional. Secara harfiah, identitas adalah ciri-ciri, jatidiri atau tanda yang melekat pada seseorang atau sesuatu yang berguna untuk membedakannya dengan sesuatu yang lain. Identitas nasional adalah kepribadian nasional atau jati diri nasional yang dimiliki suatu bangsa yang membedakan bangsa satu dengan bangsa yang lainnya. Fungsi Identitas nasional: 1) Sebagai pemersatu bangsa 2) Sebagai pembeda dari bangsa lain 3) Sebagai jati diri bangsa 4) Sebagai pelindung dari dampak buruk globalisasi 5) Sebagai alat interaksi (bahasa Indonesia) 6) Sebagai landasan dan dasar negara (Pancasila)</p><p>Unsur Identitas Nasional 1) Bahasa 2) Semboyan negara (Bhineka Tunggal Ika), 3) Dasar/ Falsafah negara, 4) Bentuk negara, 5) Sistem negara, 6) Lagu Kebangsaan, 7) Bendera Merah Putih, 8) konstitusi negara, 9) Lambang negara</p><h2>Ketahanan Nasional</h2><p>Melansir dari situs Perpustakaan Lembaga Ketahanan Nasional (Lemhannas) RI, ketahanan nasional adalah kondisi dinamis Bangsa Indonesia yang berisikan keuletan dan ketangguhan dalam menghadapi dan mengatasi segala bentuk ancaman, gangguan ataupun hambatan dari dalam ataupun luar negeri. Konsepsi Ketahanan Nasional adalah prasyarat dalam mewujudkan geostrategi nasional.</p><h2>Asas Ketahanan Nasional</h2><p>1. Asas Kesejahteraan dan Keamanan</p><p>Kesejahteraan dan keamanan adalah kebutuhan manusia yang mendasar dan esensial, Dalam realisasinya, kondisi kesejahteraan dan keamanan dapat dicapai dengan menitikberatkan pada kesejahteraan, tetapi tidak berarti mengabaikan keamanan. Sebaliknya, memberikan prioritas pada keamanan tidak boleh mengabaikan kesejahteraan. Baik kesejahteraan ataupun keamanan harus selalu ada, berdampingan pada kondisi apapun.</p><p>2. Asas Komprehensif Integral atau Menyeluruh</p><p>Sistem kehidupan nasional mencakup segenap aspek kehidupan bangsa secara utuh, menyeluruh, dan terpadu dalam bentuk perwujudan persatuan dan perpaduan yang seimbang, serasi, dan selaras dari seluruh aspek kehidupan bermasyarakat, berbangsa, dan bernegara.</p><p>3. Asas Kekeluargaan</p><p>Asas kekeluargaan memuat keadilan, kearifan, kebersamaan, kesetaraan, gotong royong, tenggang rasa, dan tanggung jawab dalam menjalani kehidupan bermasyarakat, berbangsa, dan bernegara. Dalam asas ini diakui adanya perbedaan, dan perbedaan tersebut harus dikembangkan secara serasi dalam hubungan kemitraan, dan dijaga supaya tidak berkembang menjadi konflik yang bersifat antagonistik yang saling menghancurkan.</p><h2>Sifat Ketahanan Nasional</h2><ul><li>Manunggal: Memiliki sifat integratif yang diartikan terwujud kesatuan dan perpaduan yang seimbang, serasi, dan selaras seluruh aspek kehidupan berbangsa dan bernegara.</li><li>Mawas Kedalam: Ketahanan Nasional terutama diarahkan kepada diri bangsa dan negara itu sendiri, karena Ketahanan Nasional bertujuan mewujudkan hakekat dan sifat nasionalnya sendiri dengan kemandirian hingga memberikan dampak keluar yang memiliki unsur daya saing.</li><li>Kewibawaan: Ketahanan Nasional, yang bersifat manunggal, mewujudkan kewibawaan nasional yang akan diperhitungkan oleh pihak lain hingga adalah daya tangkal (deterrent) dalam artian makin tinggi tingkat kewibawaan, makin besar daya tangkal tersebut.</li><li>Dinamis: Ketahanan Nasional suatu negara tidak tetap melainkan dapat meningkat dan menurun tergantung pada situasi dan kondisi bangsa dan negara itu sendiri.</li><li>Menitikberatkan Konsultasi dan Saling Menghargai: Ketahanan Nasional tidak mendahulukan sikap adu kekuasaan dan adu kekuatan karena akan bertumpu pada kekuatan fisik. Ketahanan Nasional tidak mengutamakan kekuatan fisik tetapi memanfaatkan daya dan kekuatan lain, seperti kekuatan moral yang ada pada suatu bangsa.</li></ul>",
    "keys": [
      "Integrasi nasional dipahami sebagai proses menyatukan berbagai kelompok sosial dan budaya di dalam sebuah kesatuan wilayah hingga membentuk suatu identitas nasional. Sementara itu faktor pembentuk integrasi nasional adalah 1) Faktor sejarah yang menimbulkan ra…",
      "IDENTITAS NASIONAL Identitas Nasional adalah istilah yang terdiri dari dua kata yaitu identitas dan nasional. Secara harfiah, identitas adalah ciri-ciri, jatidiri atau tanda yang melekat pada seseorang atau sesuatu yang berguna untuk membedakannya dengan sesua…",
      "Unsur Identitas Nasional 1) Bahasa 2) Semboyan negara (Bhineka Tunggal Ika), 3) Dasar/ Falsafah negara, 4) Bentuk negara, 5) Sistem negara, 6) Lagu Kebangsaan, 7) Bendera Merah Putih, 8) konstitusi negara, 9) Lambang negara"
    ],
    "questions": [
      {
        "answer": "B",
        "tag": "SOAL 1",
        "text": "Salah satu faktor pembentuk integrasi nasional adalah …",
        "explanation": "Sejarah yang melahirkan rasa senasib dan seperjuangan disebut sebagai faktor pembentuk integrasi.",
        "options": [
          {
            "value": "A",
            "text": "Kurangnya toleransi"
          },
          {
            "value": "B",
            "text": "Rasa senasib dan seperjuangan"
          },
          {
            "value": "C",
            "text": "Ketimpangan pembangunan"
          },
          {
            "value": "D",
            "text": "Fanatisme kelompok"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 2",
        "text": "Yang termasuk unsur identitas nasional dalam materi adalah …",
        "explanation": "Bahasa termasuk unsur identitas nasional yang disebutkan dalam materi.",
        "options": [
          {
            "value": "A",
            "text": "Bahasa Indonesia"
          },
          {
            "value": "B",
            "text": "Gaya hidup pribadi"
          },
          {
            "value": "C",
            "text": "Hobi masyarakat"
          },
          {
            "value": "D",
            "text": "Preferensi politik individu"
          }
        ]
      },
      {
        "answer": "B",
        "tag": "SOAL 3",
        "text": "Ketahanan nasional digambarkan sebagai kondisi yang …",
        "explanation": "Ketahanan nasional dijelaskan sebagai kondisi dinamis yang menghadapi ancaman, gangguan, hambatan, dan tantangan.",
        "options": [
          {
            "value": "A",
            "text": "Tetap dan tidak berubah"
          },
          {
            "value": "B",
            "text": "Dinamis serta berisi keuletan dan ketangguhan"
          },
          {
            "value": "C",
            "text": "Hanya berhubungan dengan militer"
          },
          {
            "value": "D",
            "text": "Hanya ditentukan faktor luar negeri"
          }
        ]
      }
    ]
  },
  {
    "id": "m2",
    "stageNumber": "TAHAP 03",
    "title": "Bela Negara: Nilai dan Sikap Dasar",
    "content": "<h2>Apa Itu Bela Negara?</h2><p>Bela negara adalah istilah konstitusi yang dijumpai dalam pasal 27 ayat (3) UUD NRI Tahun 1945 yang berbunyi “Setiap warga negara berhak dan wajib ikut dan dalam upaya pembelaan negara&quot;.</p><p>Maknanya,  secara konstitusional bela negara mengikat seluruh bangsa Indonesia sebagai hak dan kewajiban setiap warga negara. Bela Negara terkait erat dengan terjaminnya eksistensi NKRI dan terwujudnya cita-cita bangsa sebagaimana termuat dalam Pembukaan UUD NRI Tahun 1945 yakni: Melindungi segenap bangsa Indonesia dan seluruh tumpah darah Indonesia, Memajukan kesejahteraan umum, Mencerdaskan kehidupan bangsa, dan Ikut dan melaksanakan ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi dan keadilan sosial.</p><p>Menyimak berbagai peraturan dan perundang-undangan yang berlaku seperti UU No. 3 Tahun 2002 tentang Pertahanan Negara (Penjelasan Pasal 9 Ayat (1), memperlihatkan bahwa pengertian upaya bela negara adalah: “Sikap dan perilaku warga negara yang dijiwai oleh kecintaannya kepada Negara Kesatuan Republik Indonesia yang berdasarkan Pancasila dan Undang-Undang Dasar 1945 dalam menjamin kelangsungan hidup bangsa dan negara. Upaya bela negara, selain sebagai kewajiban dasar manusia, juga adalah kehormatan bagi setiap warga negara yang dilaksanakan dengan penuh kesadaran, tanggung jawab, dan rela berkorban dalam pengabdian kepada negara dan bangsa”.</p><p>Oleh karena itu, secara definisi Bela Negara sendiri sebenarnya adalah: 1. Jiwa kecintaan kepada NKRI yang berdasarkan Pancasila dan UUD NRI 1945 dalam menjamin kelangsungan hidup bangsa dan negara 2. Kewajiban dasar manusia sebagai warga negara 3. Kehormatan bagi setiap warga negara yang dilaksanakan dengan penuh kesadaran, tanggung jawab, dan rela berkorban dalam pengabdian kepada negara dan bangsa, yang Ketika diwujudkan dalam bentuk sikap dan perilaku, maka jiwa, kewajiban, dan kehormatan tersebut menjelma menjadi “Upaya Bela Negara”</p><p>Mengalir dari pemahaman bela negara dari berbagai sumber, nilai-nilai dasar bela negara dapat dikelompokkan dalam enam kelompok ruang lingkup nilai yakni: 1. Rasa Cinta Tanah Air, 2. Sadar Berbangsa dan Bernegara, 3. Setia Kepada Pancasila Sebagai Ideologi Negara, 4. Rela berkorban Untuk Bangsa dan Negara, 5. Mempunyai Kemampuan awal Bela Negara, dan 6. Mempunyai Semangat Untuk Mewujudkan Negara yang Berdaulat, Adil dan makmur.</p><h2>Nilai Dasar Bela Negara</h2><p>1. CINTA TANAH AIR</p><p>Cinta adalah perasaan (rasa) yang tumbuh dari hati yang paling dalam tiap warga negara terhadap Tanah Air yakni Negara Kesatuan Republik Indonesia berdasarkan Pancasila dan UUD NRI Tahun 1945. Untuk menumbuhkan nilai-nilai rasa cinta Tanah Air perlu memahami Indonesia secara utuh mencakup: pengetahuan tentang sejarah perjuangan kemerdekaan Indonesia, potensi sumber daya alam, potensi sumber daya manusia dan posisi geografi yang sangat strategis dan terkenal dengan keindahan alamnya sebagai zamrud khatulistiwa yang adalah anugerah dari Tuhan Yang Maha Esa kepada bangsa Indonesia.</p><p>Cinta Tanah Air terkait erat dengan hati dan perasaan tiap warga negara terhadap bangsa dan negara Indonesia. Rasa cinta Tanah Air yang tumbuh secara tulus dan ikhlas dari lubuk hati yang paling dalam sebagai ungkapan rasa syukur kepada Tuhan Yang Maha Kuasa dan sebagai ungkapan tanggung jawab etik dan moral kepada para pahlawan dan tanggung jawab fungsi dan peran sesuai dengan konstitusi yang berlaku, adalah kekuatan bangsa Indonesia yang sangat menentukan dalam menumbuhkan kesadaran berbangsa dan bernegara.</p><p>Dalam praktiknya, Sikap dan perilaku cinta tanah air dalam bela negara diantaranya: 1) Mencintai, menjaga dan melestarikan Lingkungan Hidup 2) Menghargai dan menggunakan karya anak bangsa. 3) Menggunakan produk dalam negeri. 4) Menjaga dan memahami seluruh ruang wilayah NKRI 5) Menjaga nama baik bangsa dan negara. 6) Mengenal wilayah tanah air tanpa rasa fanatisme kedaerahan</p><p>2. KESADARAN BERBANGSA DAN BERNEGARA</p><p>Salah satu urgensi membangun kesadaran berbangsa dan bernegara adalah supaya tiap warga negara bersikap mental sadar berbangsa dan bernegara sebagai satu kesatuan bangsa dan negara Indonesia sesuai dengan semboyan Bhinneka Tunggal Ika. Sebagai bangsa yang majemuk, Indonesia memiliki kekayaan nilai-nilai budaya yang telah tumbuh dan berkembang secara turun temurun di daerah masing-masing. Namun di lain pihak keberagaman ini dapat menjadi ancaman jika tidak dikelola dengan baik. Pada intinya menumbuhkan sadar berbangsa dan bernegara adalah membangun karakter bangsa yang memiliki semangat kebangsaan sebagai suatu sikap yang dilandasi oleh tekad dalam persatuan dan kesatuan mewujudkan cita-cita bersama sebagai bangsa Indonesia tanpa membedakan suku, ras, agama dan antar kelompok.</p><p>Dalam praktiknya, Sikap dan perilaku sadar berbangsa dan bernegara: 1) Disiplin dan bertanggung jawab terhadap tugas yang dibebankan. 2) Menghargai dan menghormati Keanekaragaman suku, agama, ras dan antar golongan. 3) Mendahulukan kepentingan umum di atas kepentingan pribadi dan golongan. 4) Bangga terhadap bangsa dan negara sendiri. 5) Rukun dan berjiwa gotong royong dalam masyarakat. 6) Menjalankan hak dan kewajiban sesuai dengan peraturan dan undang-undang</p><p>3. SETIA KEPADA PANCASILA SEBAGAI IDEOLOGI NEGARA</p><p>Kekuatan bangsa Indonesia dalam mengawal, melindungi, mempertahankan dan membangun NKRI berdasarkan ideologi Pancasila hanya akan terwujud jika seluruh komponen bangsa konsisten dan konsekuen terhadap pengamalan nilai-nilai Pancasila dalam menjalani kehidupan berbangsa dan bernegara.</p><p>Dalam praktiknya, Sikap dan perilaku setia kepada Pancasila 1) Menjalankan kewajiban agama dan kepercayaan secara baik dan benar. 2) Memahami dan Mengamalkan nilai-nilai pancasila dalam menjalani kehidupan sehari-hari. 3) Meyakini Pancasila sebagai dasar negara 4) Menjadikan Pancasila sebagai pemersatu bangsa dan negara. 5) Menerapkan prinsip-prinsip dan nilai-nilai musyawarah mufakat 6) Menghormati dan menjunjung tinggi Hak Asasi Manusia. 7) Saling membantu dan tolong menolong antar sesama sesuai nilai-nilai Luhur Pancasila</p><p>4. RELA BERORBAN UNTUK BANGSA DAN NEGARA</p><p>Salah satu urgensi membangun karakter sikap rela berkorban untuk bangsa dan negara adalah tumbuhnya kemandirian bangsa dan negara untuk berubah dan maju mengikuti perkembangan jaman. Sikap rela berkorban memiliki peran penting untuk menumbuhkan kemandirian dan meningkatkan daya saing yang kreatif, inovatif, dan kompetitif. Sehingga strategi untuk menumbuhkan sikap rela berkorban bagi generasi bangsa dapat ditempuh dengan: menumbuhkan sikap cinta karya anak bangsa, menumbuhkan sikap saling memiliki dan sikap kemandirian.</p><p>Dalam praktiknya, Sikap dan perilaku rela berkorban bagi bangsa dan negara: 1) Rela menolong sesama warga masyarakat yang mengalami kesulitan tanpa melihat latar belakang sosio-kulturalnya. 2) Mendahulukan kepentingan Bangsa dan Negara dari pada kepentingan pribadi dan golongan. 3) Menyumbangkan tenaga, pikiran, kemampuan untuk kepentingan masyarakat, kemajuan bangsa dan negara. 4) Membela bangsa dan negara sesuai dengan profesi dan kemampuan masing-masing. 5) Berpartisipasi aktif dan peduli dalam pembangunan masyarakat bangsa dan negara. 6) Rela berkorban untuk kepentingan bangsa dan Negara tanpa pamrih.</p><p>5. MEMPUNYAI KEMAMPUAN AWAL BELA NEGARA</p><p>Kemampuan awal bela negara dari tiap warga negara, dipahami sebagai potensi dan kesiapan untuk melakukan aksi bela negara sesuai dengan profesi dan kemampuannya di lingkungan masing-masing atau di lingkungan publik yang memerlukan peran dan dalam upaya bela negara. Kemampuan awal bela negara adalah kesiapan tiap warga negara dalam melaksanakan upaya pembelaan negara, baik secara psikis ataupun secara fisik. Kemampuan awal bela negara secara psikis mencakup jati diri, pengetahuan dan sikap dan perilaku bela negara yang setia kepada Pancasila dan rela berkorban demi bangsa dan negara.</p><p>Sikap dan Perilaku Kemampuan Awal Bela Negara 1. Memiliki kemampuan, integritas dan kepercayaan diri yang tinggi dalam membela bangsa dan negara. 2. Mempunyai kemampuan memahami dan mengidentifikasi bentuk-bentuk ancaman di lingkungan masing- masing hingga selalu siap tanggap dan lapor dini setiap ada kegiatan yang merugikan dan mengganggu keamanan dan ketertiban masyarakat di lingkungannya masing-masing. 3. Senantiasa menjaga kesehatannya hingga memiliki kesehatan fisik dan mental yang baik. 4. Memiliki Kecerdasan Emosional dan spiritual dan Intelegensi yang tinggi. 5. Memiliki pengetahuan tentang kearifan lokal dalam menyikapi setiap ancaman. 6. Memiliki kemampuan dalam memberdayakan kekayaan sumber daya alam dan keragaman hayati.</p><p>6. SEMANGAT MEWUJDUKAN NEGARA YANG BERDAULAT ADIL DAN MAKMUR</p><p>Semangat untuk mewujudkan cita-cita bangsa, adalah sikap dan tekad kebangsaan yang dilandasi oleh tekad persatuan dan kesatuan untuk mewujudkan cita-cita bersama. Sikap dan tekad bersama adalah kekuatan untuk mencapai cita-cita bangsa sebagaimana tertuang dalam Pembukaan UUD NRI Tahun 1945, yakni: melindungi segenap bangsa Indonesia dan seluruh tumpah darah Indonesia, memajukan kesejahteraan umum, mencerdaskan kehidupan bangsa, dan ikut</p><p>melaksanakan ketertiban dunia. Pada intinya bangsa Indonesia berjuang untuk merdeka, berdaulat dan berkeadilan, memberantas kemiskinan dan kebodohan dan mendambakan perdamaian dunia yang damai</p><p>Sikap dan Perilaku: 1. Tidak berputus asa ketika menghadapi persoalan kehidupan bermasyarakat berbangsa dan bernegara. 2. Bekerja keras untuk kesejahteraan diri dan masyarakat 3. Memperjuangkan Kedaulatan Rakyat, Keadilan dan Hak Asasi Manusia 4. Mempraktikkan Clean and Good Governance dalam bermasyarakat berbangsa dan bernegara. 5. Menerapkan Jiwa, Semangat dan Nilai kejuangan 1945. 6. Memanfaatkan kearifan lokal untuk Kesejahteraan Rakyat.</p><h2>Fungsi Bela Negara</h2><p>Fungsi bela negara yang utama pada dasaranya adalah mempertahankan dan menjaga kedaulatan NKRI berdasarkan Pancasila. Sementara itu secara lebih rinci, beberapa fungsi bela negara adalah: 1. Mempertahankan negara dari berbagai ancaman. 2. Menjaga keutuhan wilayah negara. 3. Merupakan kewajiban setiap warga negara. 4. Merupakan panggilan sejarah.</p><h2>Tujuan Bela Negara</h2><p>Arah utama bela negara yang utama pada dasaranya adalah mempertahankan kelangsungan hidup bangsa dan negara berdasarkan Pancasila dan UUD NRI 1945. Secara rinci, tujuan bela negara adalah sebagai berikut: 1. Mempertahankan kelangsungan hidup bangsa dan negara. 2. Melestarikan budaya. 3. Menjalankan nilai-nilai Pancasila dan Undang-Undang Dasar 1945. 4. Berbuat yang terbaik bagi bangsa dan negara. 5. Menjaga identitas dan integritas bangsa atau negara.</p><h2>Spectrum Bela Negara</h2><p>CINTA TANAH AIR, NASIONALISME, BELA NEGARA DAN PATRIOTISME</p>",
    "keys": [
      "Bela negara adalah istilah konstitusi yang dijumpai dalam pasal 27 ayat (3) UUD NRI Tahun 1945 yang berbunyi “Setiap warga negara berhak dan wajib ikut dan dalam upaya pembelaan negara&quot;.",
      "Maknanya,  secara konstitusional bela negara mengikat seluruh bangsa Indonesia sebagai hak dan kewajiban setiap warga negara. Bela Negara terkait erat dengan terjaminnya eksistensi NKRI dan terwujudnya cita-cita bangsa sebagaimana termuat dalam Pembukaan UUD N…",
      "Menyimak berbagai peraturan dan perundang-undangan yang berlaku seperti UU No. 3 Tahun 2002 tentang Pertahanan Negara (Penjelasan Pasal 9 Ayat (1), memperlihatkan bahwa pengertian upaya bela negara adalah: “Sikap dan perilaku warga negara yang dijiwai oleh kec…"
    ],
    "questions": [
      {
        "answer": "A",
        "tag": "SOAL 1",
        "text": "Menggunakan produk dalam negeri termasuk contoh …",
        "explanation": "Menggunakan produk dalam negeri termasuk perilaku cinta tanah air.",
        "options": [
          {
            "value": "A",
            "text": "Cinta tanah air"
          },
          {
            "value": "B",
            "text": "Primordialisme"
          },
          {
            "value": "C",
            "text": "Separatisme"
          },
          {
            "value": "D",
            "text": "Individualisme"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 2",
        "text": "Mendahulukan kepentingan bangsa dan negara daripada kepentingan pribadi merupakan contoh …",
        "explanation": "Rela berkorban ditunjukkan antara lain dengan menempatkan kepentingan bangsa dan negara di atas kepentingan pribadi/golongan.",
        "options": [
          {
            "value": "A",
            "text": "Rela berkorban"
          },
          {
            "value": "B",
            "text": "Chauvinisme"
          },
          {
            "value": "C",
            "text": "Hedonisme"
          },
          {
            "value": "D",
            "text": "Westernisasi"
          }
        ]
      },
      {
        "answer": "C",
        "tag": "SOAL 3",
        "text": "Kemampuan awal bela negara mencakup kesiapan …",
        "explanation": "Materi menjelaskan kemampuan awal bela negara sebagai kesiapan psikis sekaligus fisik.",
        "options": [
          {
            "value": "A",
            "text": "Hanya secara fisik"
          },
          {
            "value": "B",
            "text": "Hanya secara mental"
          },
          {
            "value": "C",
            "text": "Psikis dan fisik"
          },
          {
            "value": "D",
            "text": "Hanya secara ekonomi"
          }
        ]
      }
    ]
  },
  {
    "id": "m3",
    "stageNumber": "TAHAP 04",
    "title": "Pertahanan Negara, Kewaspadaan, dan Ancaman",
    "content": "<h2>Pertahanan Negara</h2><p>Bab XII UUD 1945 mengatur masalah pertahanan negara dan keamanan negara. Sementara itu bunyi Pasal 30 UUD 1945 adalah:</p><ul><li>Tiap-tiap warga negara berhak dan wajib ikut dan dalam usaha pertahanan dan keamanan negara.</li><li>Usaha pertahanan dan keamanan negara dilaksanakan melalui sistem pertahanan dan keamanan rakyat semesta oleh Tentara Nasional Indonesia dan Kepolisian Negara Republik Indonesia, sebagai kekuatan utama, dan rakyat sebagai kekuatan pendukung.</li><li>Tentara Nasional Indonesia terdiri atas Angkatan Darat, Angkatan Laut, dan Angkatan Udara sebagai alat negara bertugas mempertahankan, melindungi, dan memelihara keutuhan dan kedaulatan negara.</li><li>Kepolisian Negara Republik Indonesia sebagai alat negara yang menjaga keamanan dan ketertiban masyarakat bertugas melindungi, mengayomi, melayani masyarakat, dan menegakkan hukum.</li><li>Susunan dan kedudukan Tentara Nasional Indonesia, Kepolisian Negara Republik Indonesia, hubungan dan kewenangan Tentara Nasional Indonesia dan Kepolisian Negara Republik Indonesia di dalam menjalankan tugasnya, syarat-syarat keikutdanan warga negara dalam usaha pertahanan dan keamanan diatur dengan undang-undang.</li></ul><p>Pertahanan negara pada hakikatnya adalah pertahanan negara yang bersifat semesta, yang penyelenggaraannya didasarkan pada kesadaran terhadap hak dan kewajiban seluruh warga negara dan keyakinan akan kekuatan sendiri. Kesemestaan memuat makna pelibatan seluruh rakyat dan segenap sumber daya nasional, sarana prasarana nasional, dan seluruh wilayah negara sebagai satu kesatuan pertahanan yang utuh dan menyeluruh dalam tatanan kehidupan berbangsa dan bernegara.</p><p>Pertahanan negara adalah segala usaha untuk mempertahankan kedaulatan negara, keutuhan wilayah Negara Kesatuan Republik Indonesia, dan keselamatan segenap bangsa dari ancaman dan gangguan terhadap keutuhan bangsa dan negara.</p><p>Sistem pertahanan negara adalah sistem pertahanan yang bersifat semesta yang melibatkan seluruh warga negara, wilayah, dan sumber daya nasional lainnya, dan dipersiapkan secara dini oleh pemerintah dan diselenggarakan secara total, terpadu, terarah, dan berlanjut untuk menegakkan kedaulatan negara, keutuhan wilayah, dan keselamatan segenap bangsa dari segala ancaman.</p><p>Pertahanan negara digunakan untuk mewujudkan dan mempertahankan seluruh wilayah NKRI sebagai satu kesatuan pertahanan, yang mampu melindungi kedaulatan negara, keutuhan wilayah, dan keselamatan segenap bangsa dari setiap ancaman, baik yang datangdari luar ataupun yang timbul di dalam negeri.</p><p>Pertahanan negara ditujukan untuk menjaga dan melindungi kedaulatan negara, keutuhan wilayah NKRI dan keselamatan segenap bangsa dari segala bentuk ancaman baik yang berasal dari luar ataupun dari dalam negeri</p><p>Pertahanan Indonesia disusun dalam suatu sistem pertahanan semesta untuk mencapai tujuan nasional. Pertahanan yang bersifat semesta pada hakikatnya adalah suatu pertahanan yang melibatkan seluruh warga negara sesuai peran dan fungsinya.</p><p>Sistem Pertahanan Negara yang bersifat semesta bercirikan kerakyatan, kesemestaan, dan kewilayahan.</p><ul><li>Ciri kerakyatan memuat makna bahwa orientasi pertahanan diabdikan oleh dan untuk kepentingan seluruh rakyat.</li><li>Ciri kesemeStaan memuat makna bahwa seluruh sumber daya nasional didayagunakan untuk upaya pertahanan.</li><li>Ciri kewilayahan memuat makna bahwa gelar kekuatan pertahanan dilaksa- nakan secara menyebar di seluruh wilayah NKRI, sesuai dengan kondisi geografi sebagai negara kepulauan. Usaha untuk menjaga dan memperta- hankan keutuhan wilayah (territorial integrity) sesuatu negara sangat erat hubungannya dengan hak keberadaan suatu negara (the right of national or state existence) yang dijamin dalam hukum inter- nasional</li></ul><p>Arah utama nasional tercantum dalam Pembukaan UUD NRI 1945, yaitu melindungi segenap bangsa Indonesia dan seluruh tumpah darah Indonesia, memajukan kesejahteraan umum, mencerdaskan kehidupan bangsa, dan ikut melaksanakan ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi dan keadilan sosial.</p><p>Kepentingan nasional adalah menjaga tetap tegaknya NKRI berdasarkan Pancasila dan UUD NRI 1945 dan terjaminnya kelancaran pembangunan nasional guna mewujudkan tujuan nasional. Kepentingan nasional diwujudkan dengan memperhatikan tiga kaidah pokok, yaitu</p><ul><li>Pertama, tata kehidupan masyarakat, bangsa, dan negara Indonesia berdasarkan Pancasila dan UUD NRI</li><li>Kedua, pembangunan nasional yang berkelanjutan, berwawasan lingkungan, dan berketahanan nasional berdasarkan Wawasan Nusantara.</li><li>Ketiga, mendayagunakan sarana, potensi dan kekuatan nasional secara menyeluruh dan terpadu.</li></ul><h2>Kewaspadaan Nasional</h2><p>Kewaspadaan nasional adalah serangkaian upaya/tindakan untuk menangkal segala potensi ancaman, tantangan, hambatan dengan gangguan (ATHG) dengan meningkatkan kewaspadaan dan pencegahan dini. ATHG sendiri dipahami sebagai upaya, pekerjaan, kegiatan, dan tindakan, baik dari dalam ataupun luar negeri, yang dinilai dan/atau dibuktikan dapat membahayakan keselamatan bangsa, keamanan, kedaulatan, keutuhan wilayah Negara Kesatuan Republik Indonesia, dan kepentingan nasional diberbagai aspek baik ideologi, politik, ekonomi, sosial, dan budaya ataupun pertahanan dan keamanan.</p><p>Bentuk-bentuk ancaman dalam berbagai bidang:</p><p>1. Ancaman di bidang Ideologi</p><p>Pancasila sebagai ideologi bangsa masih sangat rawan terhadap berbagai bentuk ancaman. Salah satunya dari paham komunisme yang masih harus di waspadai. Usaha untuk mengganti pancasila</p><p>2. Ancaman di bidang Politik</p><p>Ancaman di bidang politik dapat bersumber dari luar negeri ataupun dalam negeri. Ancaman politik dari dalam negeri dapat dilihat dari gerakan separatis. Dari luar negeri, Ancaman di</p><p>bidang politik dilakukan oleh suatu negara dengan melakukan tekanan politik terhadap Indonesia. Intimidasi, provokasi, atau blokade politik adalah bentuk ancaman non-militer berdimensi politik yang sering kali digunakan oleh pihak-pihak lain untuk menekan negara lain. Gerakan separatis atau separatisme kegiatan yang dilakukan oleh sekelompok masyarakat Indonesia yang ingin memisahkan diri dari negara Indonesia.</p><p>3. Ancaman di bidang Ekonomi</p><p>Ancaman Internal</p><ul><li>Inflansi, adalah kemerosotan nilai uang (kertas) karena banyaknya dan cepatnya uang (kertas) beredar hingga menyebabkan naiknya harga barang- barang.</li><li>Pengangguran, hal atau keadaan menganggur, tidak ada pekerjaan dan tidak ada penghasilan</li><li>Infrastruktur, sarana dan prasarana yang tidak memadai</li><li>Kebijakan ekonomi yang merugikan rakyat</li></ul><p>Ancaman eksternal</p><ul><li>Ketergantungan terhadap asing, adalah kehidupan ekonomi negara–negara tertentu dipengaruhi oleh perkembangan dan ekspansi dari kehidupan ekonomi negara– negara lain, di mana negara–negara tertentu ini hanya berperan sebagai penerima akibat saja.</li><li>Daya saing yang rendah, karen aproduk yang dihasilkan belum mampu bersaing dengan produk negara lain</li><li>Kinerja ekonomi yang buruk, hasil atau tingkat keberhasilan seseorang secara keseluruhan selama periode tertentu dalam melaksanakan tugas dibandingkan dengan berbagai kemungkinan, seperti standar hasil kerja, target atau sasaran tidak sesuai yang diharapkan</li></ul><p>4. Ancaman di bidang Sosial Budaya</p><p>Ancaman yang berdimensi sosial budaya dapat dibedakan atas ancaman dari dalam, dan ancaman dari luar. Ancaman dari dalam didorong oleh isu-isu kemiskinan, kebodohan, keterbelakangan, dan ketidakadilan. Isu tersebut menjadi titik pangkal timbulnya permasalahan, seperti separatisme, terorisme, kekerasan, dan bencana akibat perbuatan manusia. Ancaman dari luar timbul sebagai akibat dari pengaruh negatif globalisasi, diantaranya adalah:</p><ul><li>Munculnya gaya hidup konsumtif dan selalu mengkonsumsi barang-barang dari luar negeri.</li><li>Munculnya sifat hedonisme, yaitu kenikmatan pribadi dianggap sebagai suatu nilai hidup tertinggi. Hal ini membuat manusia suka memaksakan diri untuk mencapai kepuasan dan kenikmatan pribadinya tersebut, meskipun harus melanggar norma- norma yang berlaku di masyarakat. Seperti mabuk-mabukan, pergaulan bebas, foya- foya dan sebagainya.</li><li>Adanya sikap individualisme, yaitu sikap selalu mementingkan diri sendiri dan memandang orang lain itu tidak ada dan tidak bermakna. Sikap seperti ini dapat menimbulkan ketidakpedulian terhadap orang lain, misalnya sikap selalu menghardik pengemis, pengamen dan sebagainya.</li></ul><ul><li>Munculnya gejala westernisasi, yaitu gaya hidup yang selalu berorientasi kepada budaya barat tanpa diseleksi terlebih dahulu, seperti meniru model pakain yang biasa dipakai orang-orang barat yang sebenarnya bertentangan dengan nilai dan norma- norma yang berlaku misalnya memakai rok mini, lelaki memakai anting- anting dan sebagainya.</li><li>Semakin memudarnya semangat gotong royong, solidaritas, kepedulian dan kesetiakawanan sosial.</li><li>Semakin lunturnya nilai-nilai keagamaan dalam menjalani kehidupan bermasyarakat.</li></ul><p>5. Ancaman di bidang Pertahanan dan Keamanan</p><p>Wujud ancaman di bidang pertahanan dan keamanan pada umumnya berupa Ancaman militer. Ancaman militer adalah ancaman yang menggunakan kekuatan bersenjata dan terorganisasi yang dinilai mempunyai kemampuan membahayakan kedaulatan negara, keutuhan wilayah, dan keselamatan segenap bangsa. Ancaman militer dapat berupa :</p><ul><li>Agresi suatu negara yang dikategorikan mengancam kedaulatan negara, keutuhan wilayah, dan keselamatan segenap bangsa Indonesia mempunyai bentuk-bentuk mulai dari yang berskala paling besar sampai dengan yang terendah. Invasi adalah bentuk agresi yang berskala paling besar dengan menggunakan kekuatan militer bersenjata yang dikerahkan untuk menyerang dan menduduki wilayah Indonesia</li><li>Pelanggaran wilayah :Bentuk lain dari ancaman militer yang peluang terjadinya cukup tinggi adalah tindakan pelanggaran wilayah (wilayah laut, ruang udara dan daratan) Indonesia oleh negara lain. Konsekuensi Indonesia yang memiliki wilayah yang sangat luas dan terbuka berpotensi terjadinya pelanggaran wilayah</li><li>Pemberontakan bersenjata melawan pemerintah Indonesia yang sah adalah bentuk ancaman militer yang dapat merongrong kewibawaan negara dan jalannya roda pemerintahan.</li><li>Sabotase dan spionase : Indonesia memiliki sejumlah objek vital nasional dan instalasi strategis yang rawan terhadap aksi sabotase, hingga harus dilindungi. kegiatan spionase dilakukan oleh agen-agen rahasia dalam mencari dan mendapatkan rahasia pertahanan negara dari negara lain</li><li>Aksi terrorisme: adalah bentuk kegiatan terorisme yang mengancam keselamatan bangsa dengan menebarkan rasa ketakutan yang mendalam dan menimbulkan korban tanpa mengenal rasa perikemanusiaan</li><li>Ancaman keamanan laut dan udara :Kondisi geografi Indonesia dengan wilayah perairan dan wilayah udara Indonesia yang terbentang pada pelintasan transportasi dunia yang padat, baik transportasi maritim ataupun dirgantara, berimplikasi terhadap tingginya potensi gangguan ancaman keamanan laut dan udara.</li><li>Konflik komunal : Gangguan keamanan dalam negeri yang terjadi antar kelompok masyarakat</li></ul><h2>Ketahanan Nasional</h2><p>Pengerian Ketahanan Nasional menurut Lembaga Ketahanan Nasional adalah kondisi dinamis bangsa Indonesia yang berisi keuletan dan ketangguhan dalam menghadapi dan mengatasi segala ancaman, gangguan, hambatan dan tantangan baik yang datang dari luar ataupun dari dalam negeri langsung atau tidak langsung yang dapat membahayakan integritas,identitas dan kelangsungan hidup bangsa dan negara.</p>",
    "keys": [
      "Bab XII UUD 1945 mengatur masalah pertahanan negara dan keamanan negara. Sementara itu bunyi Pasal 30 UUD 1945 adalah:",
      "1) Tiap-tiap warga negara berhak dan wajib ikut dan dalam usaha pertahanan dan keamanan negara. 2) Usaha pertahanan dan keamanan negara dilaksanakan melalui sistem pertahanan dan keamanan rakyat semesta oleh Tentara Nasional Indonesia dan Kepolisian Negara Rep…",
      "Pertahanan negara pada hakikatnya adalah pertahanan negara yang bersifat semesta, yang penyelenggaraannya didasarkan pada kesadaran terhadap hak dan kewajiban seluruh warga negara dan keyakinan akan kekuatan sendiri. Kesemestaan memuat makna pelibatan seluruh …"
    ],
    "questions": [
      {
        "answer": "A",
        "tag": "SOAL 1",
        "text": "Sistem pertahanan Indonesia dalam materi berciri …",
        "explanation": "Tiga ciri sistem pertahanan semesta adalah kerakyatan, kesemestaan, dan kewilayahan.",
        "options": [
          {
            "value": "A",
            "text": "Kerakyatan, kesemestaan, kewilayahan"
          },
          {
            "value": "B",
            "text": "Federal, liberal, individual"
          },
          {
            "value": "C",
            "text": "Sentralistik, tertutup, eksklusif"
          },
          {
            "value": "D",
            "text": "Ekonomi, sosial, budaya"
          }
        ]
      },
      {
        "answer": "B",
        "tag": "SOAL 2",
        "text": "Intimidasi, provokasi, atau blokade politik termasuk contoh ancaman berdimensi …",
        "explanation": "Materi memasukkan intimidasi, provokasi, dan blokade politik sebagai ancaman politik.",
        "options": [
          {
            "value": "A",
            "text": "Ekonomi"
          },
          {
            "value": "B",
            "text": "Politik"
          },
          {
            "value": "C",
            "text": "Sosial"
          },
          {
            "value": "D",
            "text": "Budaya"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 3",
        "text": "Pencegahan dini terhadap ancaman, tantangan, hambatan, dan gangguan merupakan bagian dari …",
        "explanation": "Kewaspadaan nasional diarahkan pada peningkatan kewaspadaan dan pencegahan dini terhadap ATHG.",
        "options": [
          {
            "value": "A",
            "text": "Kewaspadaan nasional"
          },
          {
            "value": "B",
            "text": "Integrasi budaya"
          },
          {
            "value": "C",
            "text": "Identitas nasional"
          },
          {
            "value": "D",
            "text": "Ideologi terbuka"
          }
        ]
      }
    ]
  },
  {
    "id": "m4",
    "stageNumber": "TAHAP 05",
    "title": "Empat Pilar dan Kedudukan Pancasila",
    "content": "<h2>I. Empat Pilar Kehidupan Berbangsa Dan Bernegara</h2><p>Empat Pilar Kehidupan Berbangsa dan Bernegara adalah kumpulan nilai-nilai luhur yang harus dipahami oleh seluruh masyarakat dan menjadi panduan dalam menjalani kehidupan ketatanegaraan untuk mewujudkan bangsa dan Negara yang adil, makmur, sejahtera, dan bermartabat.</p><p>Sementara itu empat pilar negara tersebut adalah 1. Undang-Undang Dasar 1945 2. Pancasila 3. Negara Kesatuan Republik Indonesia 4. Bhineka Tunggal Ika</p><h2>Ii. Pancasila</h2><p>A. Kedudukan dan Fungsi Pancaslia</p><p>Pancasila adalah simbol sekaligus pilar ideologis negara Indonesia. Pancasila sendiri berasal dari bahasa Sansekerta, terdiri dari dua kata, yaitu &#x27;panca&#x27; artinya lima dan kata &#x27;sila&#x27; artinya dasar. Jadi Pancasila adalah sebuah lima dasar milik Negara Kesatuan Republik Indonesia (NKRI).</p><p>Lahir pada tanggal 1 Juni 1945, Pancasila pertama kali dicetuskan oleh presiden pertama Indonesia, Ir. Soekarno, dalam sidang Badan Penyelidikan Usaha-Usaha Persiapan Kemerdekaan Indonesia (BPUPKI). Soekarno menyebut Pancasila sebagai philosopische grondslag atau pandangan hidup bangsa Indonesia dengan dua kepentingan sekaligus fungsi, yaitu sebagai berikut.</p><p>a. Pancasila diharapkan senantiasa menjadi pedoman dan petunjuk dalam menjalani keseharian hidup masyarakat Indonesia baik dalam berkeluarga, bermasyarakat ataupun berbangsa.</p><p>b. Pancasila diharapkan sebagai dasar negara hingga suatu kewajiban bahwa dalam segala tatanan kenegaraan baik dalam bidang hukum, politik, ekonomi ataupun sosial, masyarakat harus berdasar pada Pancasila.</p><p>1. Pancasila Sebagai Dasar Negara</p><p>Pancasila menjadi dasar dari berlakunya norma-norma yang ada di kehidupan masyarakat Indonesia. Nilai-nilai dalam bernegara dan penyelenggaraan harus berlandaskan pada Pancasila sebagai dasar negara Indonesia.</p><p>Pancasila sebagai dasar negara Republik Indonesia ditetapkan pada tanggal 18 Agustus 1945. Sebagai dasar negara, maka nilai-nilai kehidupan bernegara dan berpemerintahan sejak saat itu haruslah berdasarkan pada Pancasila. Pancasila sebagai dasar negara, ini berarti pula bahwa nilai-nilai yang terkandung dalam Pancasila ini dijadikan dasar dan pedoman dalam mengatur tata kehidupan bernegara seperti diatur dalam UUD 1945 dan peraturan perundang-undangan RI lainnya. Karena itulah melalui Ketetapan No. III/MPR/2000 dinyatakan bahwa sumber hukum dasar nasional adalah Pancasila, yaitu Ketuhanan Yang Maha Esa, Kemanusiaan Yang Adil dan Beradab, Persatuan Indonesia, Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan dan dengan mewujudkan suatu keadilan sosial bagi seluruh rakyat Indonesia.</p><p>Kedudukan Pancasila sebagai dasar negara sesuai dengan apa yang tersirat dalam pembukaan Undang-Undang Dasar 1945 alenia 4 di antaranya menegaskan: “…..,maka disusunlah kemerdekaan kebangsaan itu dalam suatu susunan negara republik Indonesia yang berkedaulatan rakyat dengan berdasar kepada: Ketuhanan Yang Maha Esa, kemanusiaan yang adil dan beradab, persatuan Indonesia, kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan perwakilan, dan dengan mewujudkan suatu keadilan sosial bagi seluruh rakyat Indonesia”.</p><p>Kedudukan Pancasila sebagai dasar negara dapat dirinci sebagai berikut: 1) Pancasila sebagai dasar negara adalah sumber dari segala sumber hukum (sumber tertib hukum) Indonesia 2) Pancasila adalah asas kerohanian tertib hukum Indonesia yang dalam Pembukaan UUD 1945 dijabarkan dalam empat pokok pikiran 3) Mewujudkan cita-cita hukum bagi hukum dasar negara baik hukum dasar tertulis ataupun tidak tertulis. 4) Pancasila memuat norma yang mengharuskan UUD 1945 memuat isi yang mewajibkan pemerintah dan penyelenggara negara termasuk penyelenggara partai.</p><p>2. Pancasila Sebagai Sumber Hukum</p><p>Pancasila menjadi sumber dari segala sumber hukum yang ada di Indonesia, baik hukum tidak tertulis ataupun hukum tertulis. Oleh karena itu, setiap produk hukum yang dihasilkan negara tidak boleh bertentangan dengan nilai dasar Pancasila.</p><p>Pancasila sebagai sumber dari segala sumber hukum juga memuat arti semua sumber hukum atau peraturan-peraturan harus berpijak pada Pancasila sebagai landasan hukumnya. Semua produk hukum harus sesuai dengan Pancasila dan tidak boleh bertentangan dengannya. Oleh sebab itu, bila Pancasila diubah, maka seluruh produk hukum yang ada di negara RI sejak tahun 1945 sampai sekarang, secara otomatis produk hukum itu tidak berlaku lagi. Karena sumber dari segala sumber hukum yaitu Pancasila. Oleh sebab itu Pancasila tidak bisa diubah dan tidak boleh diubah.</p><p>3. Pancasila Sebagai Perjanjian Luhur Bangsa</p><p>Pancasila sebagai perjanjian luhur, yaitu Pancasila hadir karena adanya kesepakatan dari seluruh rakyat Indonesia. Kesepakatan tersebut diwakilkan oleh para pendiri bangsa Indonesia (Founding Father) sesuai dengan cita-cita dan sejarah leluhur bangsa Indonesia.</p><p>4. Pancasila Sebagai Kepribadian Bangsa</p><p>Pancasila sebagai kepribadian bangsa mesti tercermin dalam sikap, mental, dan perilaku sehari-hari masyarakatnya, termasuk tidak mudah terpengaruh oleh kepribadian bangsa lain.</p><p>5. Pancasila Sebagai Ideologi Negara</p><p>Pancasila sebagai ideologi negara berarti Pancasila menjadi pedoman bagi cara berpikir masyarakat. Pancasila sebagai perwujudan dari nilai yang menjadi cita- cita luhur bangsa Indonesia yang tercermin dalam menjalani kehidupan warga negara Indonesia.</p><p>Pancasila sebagai ideologi bangsa, yang artinya Pancasila sebagai cita-cita bangsa atau cita- cita yang menjadi basis bagi suatu teori atau sistem kenegaraan untuk seluruh rakyat dan bangsa Indonesia. Makna Pancasila sebagai ideologi bangsa adalah sebagai keseluruhan pandangan, cita-cita, keyakinan dan nilai-nilai bangsa Indonesia yang secara normatif perlu diimplementasikan dalam menjalani kehidupan bermasyarakat, berbangsa dan bernegara.</p><p>Hal ini secara tegas tercantum dalam pembukaan UUD 1945 yang bunyinya “…membentuk suatu pemerintah negara Indonesia yang melindungi segenap bangsa Indonesia dan seluruh tumpah darah Indonesia untuk memajukan kesejahteraan umum, mencerdaskan kehidupan bangsa, dan ikut melaksanakan ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi dan keadilan sosial…”</p><p>6. Pancasila Sebagai Pandangan Hidup Bangsa</p><p>Pancasila adalah kristalisasi dari pengalaman hidup dalam sejarah panjang bangsa Indonesia yang telah membentuk karakter, perilaku, etika, tata nilai, dan norma yang telahm membentuk menjadi pandangan hidup bangsa (way of life).</p><p>Pandangan hidup bangsa adalah nilai yang dimiliki oleh suatu bangsa yang diyakini kebenarannya hingga menumbuhkan tekad untuk mewujudkannya. Pandangan Hidu Bangsa Indonesia adalah Pancasila. Pancasila sebagai pandangan hidup bangsa Indonesia dinilai sangat penting bagi Masyarakat Indonesia sendiri karena Pancasila dijadikan petunjuk atau pedoman hidup bagi masyarakat Indonesia dalam segala kegiatan manusia. Oleh karena Pancasila sebagai pandangan hidup bangsa adalah suatu kristalisasi dari nilai-nilai yang hidup dalam masyarakat Indonesia, maka pandangan hidup tersebut dijunjung tinggi oleh warganya karena pandangan hidup Pancasila berakar pada budaya dan pandangan hidup masyarakat.</p><p>Lebih lengkapnya, berikut kedudukan Pancasila sebagai pandangan hidup bangsa yaitu: 1) Petunjuk Menyelesaikan Masalah Selain menjadi pedoman untuk berperilaku, Pancasila juga menjadi petunjuk untuk menyelesaikan masalah atau konflik di Indonesia. Baik konflik budaya, sosial, ekonomi, ataupun politik. 2) Pembangunan Karakter Nilai-nilai yang dijumpai dalam Pancasila dapat dijadikan pandangan hidup dan pembangunan karakter. Dengan kata lain, masyarakat diharuskan memiliki kepribadian yang sesuai dengan nilai dan norma Pancasila. 3) Pemersatu Bangsa Pancasila memiliki kedudukan sebagai alat pemersatu bangsa. Kehadiran Pancasila telah menyatukan keberagaman masyarakat Indonesia yang terdiri dari beragam ras, suku, dan budaya. Tanpa kehadiran Pancasila, masyarakat tidak akan bisa bersatu sebagai nusa dan bangsa seperti sekarang.</p><p>Jadi, Pancasila sebagai pandangan hidup bangsa Indonesia memiliki fungsi sebagai pegangan atau acuan bagi manusia Indonesia dalam bersikap dan bertingkah laku, berkaitan dengan sistem nilai, tentang baik dan buruk, adil, jujur, bohong, dan sebagainya. Dengan demikian membahas pancasila sebagai pandangan hidup akan memasuki domain etika, masalah moral yang menjadi kepedulian manusia sepanjang masa, membahas hal ihwal yang selayaknya dikerjakan dan yang selayaknya dihindari.</p>",
    "keys": [
      "Empat Pilar Kehidupan Berbangsa dan Bernegara adalah kumpulan nilai-nilai luhur yang harus dipahami oleh seluruh masyarakat dan menjadi panduan dalam menjalani kehidupan ketatanegaraan untuk mewujudkan bangsa dan Negara yang adil, makmur, sejahtera, dan bermar…",
      "Sementara itu empat pilar negara tersebut adalah 1. Undang-Undang Dasar 1945 2. Pancasila 3. Negara Kesatuan Republik Indonesia 4. Bhineka Tunggal Ika",
      "Pancasila adalah simbol sekaligus pilar ideologis negara Indonesia. Pancasila sendiri berasal dari bahasa Sansekerta, terdiri dari dua kata, yaitu &#x27;panca&#x27; artinya lima dan kata &#x27;sila&#x27; artinya dasar. Jadi Pancasila adalah sebuah lima dasar milik Negara Kesatuan…"
    ],
    "questions": [
      {
        "answer": "A",
        "tag": "SOAL 1",
        "text": "Empat Pilar Kehidupan Berbangsa dan Bernegara yang disebut dalam materi adalah …",
        "explanation": "Keempatnya disebut langsung sebagai empat pilar kehidupan berbangsa dan bernegara.",
        "options": [
          {
            "value": "A",
            "text": "Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika"
          },
          {
            "value": "B",
            "text": "Pancasila, DPR, Presiden, MA"
          },
          {
            "value": "C",
            "text": "UUD, APBN, Pemilu, DPR"
          },
          {
            "value": "D",
            "text": "NKRI, TNI, Polri, DPR"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 2",
        "text": "Pancasila sebagai dasar negara berarti …",
        "explanation": "Sebagai dasar negara, nilai Pancasila menjadi landasan penyelenggaraan kehidupan bernegara.",
        "options": [
          {
            "value": "A",
            "text": "Nilai penyelenggaraan negara berlandaskan Pancasila"
          },
          {
            "value": "B",
            "text": "Pancasila hanya menjadi simbol"
          },
          {
            "value": "C",
            "text": "Pancasila hanya berlaku di sekolah"
          },
          {
            "value": "D",
            "text": "Pancasila dapat diganti setiap pergantian pemerintahan"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 3",
        "text": "Pancasila sebagai pandangan hidup berfungsi terutama sebagai …",
        "explanation": "Pandangan hidup memberikan pegangan dalam bersikap dan bertindak.",
        "options": [
          {
            "value": "A",
            "text": "Pedoman bersikap dan bertingkah laku"
          },
          {
            "value": "B",
            "text": "Alat mengganti konstitusi"
          },
          {
            "value": "C",
            "text": "Dasar pembagian provinsi"
          },
          {
            "value": "D",
            "text": "Sistem ekonomi tunggal"
          }
        ]
      }
    ]
  },
  {
    "id": "m5",
    "stageNumber": "TAHAP 06",
    "title": "Pancasila sebagai Ideologi Terbuka dan Pengamalan Sila",
    "content": "<h2>B. Pancasila Sebagai Ideologi Terbuka</h2><p>Pancasila berakar pada pandangan hidup bangsa dan falsafah bangsa hingga memenuhi prasyarat menjadi ideologi yang terbuka. Keterbukaan Pancasila, memuat pengertian bahwa Pancasila senantiasa mampu berinteraksi secara dinamis. Nilai-nilai Pancasila tidak berubah, namun pelaksanaannya disesuaikan dengan kebutuhan dan tantangan nyata yang kita hadapi dalam setiap waktu. Hal ini dimaksudkan untuk menegaskan bahwa ideologi Pancasila bersifat aktual, dinamis, antisipatif, dan senantiasa mampu menyesuaikan diri dengan perkembangan zaman, ilmu pengetahuan, teknologi, dan dinamika perkembangan aspirasi masyarakat.</p><p>Keterbukaan ideologi Pancasila harus selalu memperhatikan: 1) stabilitas nasional yang dinamis; 2) larangan untuk memasukan pemikiran-pemikiran yang memuat nilai- nilai ideologi marxisme, leninisme dan komunisme; 3) mencegah berkembangnya paham liberal; 4) larangan terhadap pandangan ekstrim yang menggelisahkan kehidupan masyarakat; 5) penciptaan norma yang harus melalui kesepakatan.</p><p>Berdasarkan uraian di atas, keterbukaan ideologi Pancasila memuat nilai-nilai sebagai berikut.</p><p>1) Nilai dasar Nilai dasar yaitu hakikat kelima sila Pancasila: Ketuhanan Yang Maha Esa; kemanusiaan yang adil dan beradab; persatuan Indonesia; kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/ perwakilan; keadilan sosial bagi seluruh rakyat Indonesia. Nilai-nilai dasar tersebut, bersifat universal hingga di dalamnya terkandung cita- cita, tujuan, dan nilai-nilai yang baik dan benar. Nilai dasar ini bersifat tetap dan melekat pada kelangsungan hidup negara. Nilai dasar Pancasila selanjutnya dijabarkan dalam pasal-pasal Undang-Undang Dasar Negara Republik Indonesia Tahun 1945.</p><p>2) Nilai instrumental Nilai instrumental ini sebagai penjabaran dari nilai-nilai dasar ideologi Pancasila berupa peraturan perundangan dan lembaga pelaksanaannya. Misalnya; UUD, UU dan peraturan perundang- undangan lainnya. Dapat disesuaikan dengan perkembangan zaman dan aspirasi masyarakat berdasarkan nilai-nilai Pancasila.</p><p>3) Nilai praksis Nilai Praksis adalah realisasi dari nilai-nilai instrumental berupa suatu pengalaman nyata dalam menjalani kehidupan sehari-hari dalam bermasyarakat, berbangsa, dan bernegara. Dalam realisasi praksis inilah, penjabaran nilai-nilai Pancasila senantiasa berkembang dan selalu dapat ditempuh perubahan dan perbaikan (reformasi) sesuai dengan perkembangan zaman dan aspirasi masyarakat, hingga Pancasila adalah ideologi terbuka</p><p>Suatu ideologi, selain memiliki aspek-aspek yang bersifat ideal berupa cita-cita, pemikiran- pemikiran, dan nilai-nilai yang dianggap baik, juga harus memiliki norma yang jelas. Hal ini dikarenakan suatu ideologi harus mampu direalisasikan dalam menjalani kehidupan nyata. Oleh karena itu, Pancasila sebagai ideologi terbuka secara struktural memiliki tiga dimensi. Sementara itu ketiga dimensi Pancasila tersebut, diantaranya sebagai berikut.</p><p>1) Dimensi idealisme Dimensi ini menitikberatkan bahwa nilai-nilai dasar yang terkandung dalam Pancasila yang bersifat sistematis, rasional, dan menyeluruh itu, pada hakikatnya bersumber pada filsafat Pancasila. Hal tersebut karena setiap ideologi, bersumber pada suatu nilai-nilai filosofis atau sistem filsafat. Dimensi idealisme yang terkandung dalam Pancasila, mampu memberikan harapan, optimisme, dan memberikan motivasi pendukungnya untuk berupaya mewujudkan cita-citanya. Ideologi memuat cita-cita yang ingin dicapai dalam berbagai bidang kehidupan bermasyarakat, berbangsa, dan bernegara, hingga masyarakat atau bangsa dapat mengetahui ke arah mana mereka ingin membangun kehidupan bersama.</p><p>2) Dimensi normatif Dimensi ini memuat pengertian bahwa nilai-nilai yang terkandung dalam Pancasila, perlu dijabarkan dalam suatu sistem norma. Artinya, Pancasila terkandung dalam Pembukaan Undang-Undang Dasar Negara Republik Indonesia Tahun 1945 yang adalah tertib hukum tertinggi dalam Negara Republik Indonesia dan adalah staatsfundamentalnorm (pokok kaidah negara yang fundamental). Dengan kata lain, supaya Pancasila mampu dijabarkan ke dalam langkah-langkah yang bersifat operasional, maka perlu memiliki norma atau aturan hukum yang jelas.</p><p>3) Dimensi realitas Dimensi ini memuat makna bahwa suatu ideologi harus mampu mencerminkan realitas kehidupan yang berkembang dalam masyarakat. Pancasila memiliki keluwesan yang memungkinkan adanya pengembangan pemikiran-pemikiran baru yang relevan tentang dirinya, tanpa menghilangkan atau mengingkari hakikat yang terkandung dalam nilai- nilai dasarnya. Oleh karena itu, Pancasila harus mampu dijabarkan dalam menjalani kehidupan masyarakatnya secara nyata, baik dalam menjalani kehidupan sehari-hari ataupun dalam penyelenggaraan negara.</p><h2>C. Butir-Butir Pengamalan Pancasila</h2><p>1. SILA KETUHANAN YANG MAHA ESA</p><p>Nilai ketuhanan dalam Pancasila adalah bentuk hubungan warga negara Indonesia sebagai insan pribadi atau makhluk individu dengan Tuhan Yang Maha Esa pencipta alam semesta. Bangsa Indonesia sebagai bangsa yang religius atau bangsa yang beragama memiliki keyakinan dan kepercayaan terhadap adanya Tuhan Yang Maha Esa. Hal tersebut dibuktikan dengan pemelukan salah satu agama yang diakui negara atau menganut aliran kepercayaan tertentu terhadap Tuhan Yang Maha Esa. Sementara itu butir pengamalannya adalah sebagi berikut: 1) Bangsa Indonesia menyatakan kepercayaannya dan ketaqwaannya terhadap Tuhan Yang Maha Esa. 2) Manusia Indonesia percaya dan taqwa terhadap Tuhan Yang Maha Esa, sesuai dengan agama dan kepercayaannya masing-masing menurut dasar kemanusiaan yang adil dan beradab. 3) Mengembangkan sikap hormat menghormati dan bekerjasama antara pemeluk agama dengan penganut kepercayaan yang berbeda-beda terhadap Tuhan Yang Maha Esa. 4) Membina kerukunan hidup di antara sesama umat beragama dan kepercayaan terhadap Tuhan Yang Maha Esa.</p><ul><li>Agama dan kepercayaan terhadap Tuhan Yang Maha Esa adalah masalah yang menyangkut hubungan pribadi manusia dengan Tuhan Yang Maha Esa.</li><li>Mengembangkan sikap saling menghormati kebebasan menjalankan ibadah sesuai dengan agama dan kepercayaannya masing-masing.</li><li>Tidak memaksakan suatu agama dan kepercayaan terhadap Tuhan Yang Maha Esa kepada orang lain.</li></ul><p>2. KEMANUSIAAN YANG ADIL DAN BERADAB</p><p>Nilai kemanusiaan dalam Pancasila, diwujudkan dalam bentuk hubungan warga negara Indonesia dengan sesama manusia sebagai insan sosial. Manusia tidak dapat hidup sendiri senantiasa hidup saling membutuhkan. Oleh karena itu, harus dijalin sikap kekeluargaan dan tolong menolong antarsesama manusia tanpa membedakan suku bangsa, agama, ras, antargolongan, ataupun antarbangsa. Butir pengamalan sila ini adalah sebagai berikut: 1) Mengakui dan memperlakukan manusia sesuai dengan harkat dan martabatnya sebagai makhluk Tuhan 2) Mengakui persamaan derajad, persamaan hak dan kewajiban asasi setiap manusia, tanpa membeda-bedakan suku, keturrunan, agama, kepercayaan, jenis kelamin, kedudukan sosial, warna kulit dan sebagainya. 3) Mengembangkan sikap saling mencintai sesama manusia. 4) Mengembangkan sikap saling tenggang rasa dan tepa selira. 5) Mengembangkan sikap tidak semena-mena terhadap orang lain. 6) Menjunjung tinggi nilai-nilai kemanusiaan. 7) Gemar melakukan kegiatan kemanusiaan. 8) Berani membela kebenaran dan keadilan. 9) Bangsa Indonesia merasa dirinya sebagai bagian dari seluruh umat manusia. 10) Mengembangkan sikap hormat menghormati dan bekerjasama dengan bangsa lain.</p><p>3. PERSATUAN INDONESIA</p><p>Nilai persatuan dalam Pancasila, diwujudkan dalam bentuk hubungan warga negara Indonesia dengan bangsa dan negaranya sebagai insan politik. Setiap warga negara, terikat oleh peraturan perundang- undangan yang berlaku di negara tersebut. Oleh karena itu setiap warga negara dituntut untuk menaati peraturan itu sebagai wujud rasa cinta tanah air, mengutamakan kepentingan bangsa dan negara di atas kepentingan pribadi dan golongannya. Sementara itu butir pengamalannya adalah sebagi berikut: 1) Mampu menempatkan persatuan, kesatuan, dankepentingan dan keselamatan bangsa dan negara sebagai kepentingan bersama di atas kepentingan pribadi dan golongan. 2) Sanggup dan rela berkorban untuk kepentingan negara dan bangsa apabila diperlukan. 3) Mengembangkan rasa cinta kepada tanah air dan bangsa. 4) Mengembangkan rasa kebanggaan berkebangsaan dan bertanah air Indonesia. 5) Memelihara ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi dan keadilan sosial. 6) Mengembangkan persatuan Indonesia atas dasar Bhinneka Tunggal Ika. 7) Memajukan pergaulan demi persatuan dan kesatuan bangsa.</p><p>4. KERAKYATAN YANG DIPIMPIN OLEH HIKMAT DAN KEBIJAKSANAAN DALAM PERMUSYAWARATAN PERWAKILAN</p><p>Nilai kerakyatan dalam Pancasila, diwujudkan dalam bentuk hubungan warga negara Indonesia dengan kekuasaan dan pemerintahan sebagai pemegang kedaulatan rakyat. Setiap warga negara memiliki hak dan kewajiban untuk ikut dan dalam pemerintahan. Sementara itu pengamalannya adalah sebagai berikut: 1) Sebagai warga negara dan warga masyarakat, setiap manusia Indonesia mempunyai kedudukan, hak dan kewajiban yang sama. 2) Tidak boleh memaksakan kehendak kepada orang lain. 3) Mengutamakan musyawarah dalam mengambil keputusan untuk kepentingan bersama. 4) Musyawarah untuk mencapai mufakat diliputi oleh semangat kekeluargaan. 5) Menghormati dan menjunjung tinggi setiap keputusan yang dicapai sebagai hasil musyawarah. 6) Dengan i’tikad baik dan rasa tanggung jawab menerima dan melaksanakan hasil keputusan musyawarah. 7) Di dalam musyawarah diutamakan kepentingan bersama di atas kepentingan pribadi dan golongan. 8) Musyawarah dilakukan dengan akal sehat dan sesuai dengan hati nurani yang luhur. 9) Keputusan yang diambil harus dapat dipertanggungjawabkan secara moral kepada Tuhan Yang Maha Esa, menjunjung tinggi harkat dan martabat manusia, nilai-nilai kebenaran dan keadilan mengutamakan persatuan dan kesatuan demi kepentingan bersama. 10) Memberikan kepercayaan kepada wakil-wakil yang dipercayai untuk melaksanakan pemusyawaratan.</p><p>5. KEADILAN SOSIAL BAGI SELURUH RAKYAT INDONESIA</p><p>Nilai keadilan dalam Pancasila, diwujudkan dalam hubungan warga negara Indonesia dengan kesejahteraan dan keadilan dalam menjalani kehidupan bermasyarakat, berbangsa, dan bernegara. Setiap warga negara, dituntut untuk meningkatkan taraf hidupnya yang lebih baik dengan berusaha dan bekerja keras, menerapkan pola hidup sederhana, berlaku adil, dan menghargai karya orang lain. Berikut ini adalah butir pengamalannya: 1) Mengembangkan perbuatan yang luhur, yang mencerminkan sikap dan suasana kekeluargaan dan kegotongroyongan. 2) Mengembangkan sikap adil terhadap sesama. 3) Menjaga keseimbangan antara hak dan kewajiban. 4) Menghormati hak orang lain. 5) Suka memberi pertolongan kepada orang lain supaya dapat berdiri sendiri. 6) Tidak menggunakan hak milik untuk usaha-usaha yang bersifat pemerasan terhadap orang lain. 7) Tidak menggunakan hak milik untuk hal-hal yang bersifat pemborosan dan gaya hidup mewah. 8) Tidak menggunakan hak milik untuk bertentangan dengan atau merugikan kepentingan umum. 9) Suka bekerja keras. 10) Suka menghargai hasil karya orang lain yang bermanfaat bagi kemajuan danm kesejahteraan bersama.</p>",
    "keys": [
      "Pancasila berakar pada pandangan hidup bangsa dan falsafah bangsa hingga memenuhi prasyarat menjadi ideologi yang terbuka. Keterbukaan Pancasila, memuat pengertian bahwa Pancasila senantiasa mampu berinteraksi secara dinamis. Nilai-nilai Pancasila tidak beruba…",
      "Keterbukaan ideologi Pancasila harus selalu memperhatikan: 1) stabilitas nasional yang dinamis; 2) larangan untuk memasukan pemikiran-pemikiran yang memuat nilai- nilai ideologi marxisme, leninisme dan komunisme; 3) mencegah berkembangnya paham liberal; 4) lar…",
      "Berdasarkan uraian di atas, keterbukaan ideologi Pancasila memuat nilai-nilai sebagai berikut."
    ],
    "questions": [
      {
        "answer": "B",
        "tag": "SOAL 1",
        "text": "Nilai Pancasila yang diwujudkan dalam peraturan perundang-undangan disebut nilai …",
        "explanation": "Nilai instrumental adalah penjabaran nilai dasar dalam aturan dan perangkat pelaksanaannya.",
        "options": [
          {
            "value": "A",
            "text": "Dasar"
          },
          {
            "value": "B",
            "text": "Instrumental"
          },
          {
            "value": "C",
            "text": "Praksis"
          },
          {
            "value": "D",
            "text": "Historis"
          }
        ]
      },
      {
        "answer": "C",
        "tag": "SOAL 2",
        "text": "Dimensi ideologi Pancasila yang menekankan kemampuan mencerminkan realitas kehidupan masyarakat disebut …",
        "explanation": "Dimensi realitas menuntut ideologi mampu mencerminkan perkembangan kehidupan nyata masyarakat.",
        "options": [
          {
            "value": "A",
            "text": "Idealisme"
          },
          {
            "value": "B",
            "text": "Normatif"
          },
          {
            "value": "C",
            "text": "Realitas"
          },
          {
            "value": "D",
            "text": "Formal"
          }
        ]
      },
      {
        "answer": "C",
        "tag": "SOAL 3",
        "text": "Mengambil keputusan melalui musyawarah dan menghormati hasilnya merupakan pengamalan sila …",
        "explanation": "Musyawarah dan penghormatan terhadap hasil musyawarah berkaitan dengan sila keempat.",
        "options": [
          {
            "value": "A",
            "text": "Pertama"
          },
          {
            "value": "B",
            "text": "Kedua"
          },
          {
            "value": "C",
            "text": "Keempat"
          },
          {
            "value": "D",
            "text": "Kelima"
          }
        ]
      }
    ]
  },
  {
    "id": "m6",
    "stageNumber": "TAHAP 07",
    "title": "Konstitusi dan UUD NRI 1945",
    "content": "<p>11) Suka melakukan kegiatan untuk mewujudkan kemajuan yang merata dan berkeadilan sosial.</p><h2>Iii. Undang-Undang Dasar Nri 1945</h2><h2>A. Pengertian Konstitusi Dan Undang-Undang Dasar Nri 1945</h2><p>Secara literal, “konstitusi” berasal dari bahasa Perancis, constituir, dan bahasa Inggris, constitution, yang berarti membentuk, menyusun, dan menyatakan. Dalam konteks ketatanegaraan, konstitusi dimaksudkan sebagai pembentukan suatu negara, atau menyusun dan menyatakan sebuah negara. Konstitusi juga bisa berarti peraturan dasar (awal) mengenai pembentukan suatu negara.( Tim ICCE UIN Jakarta, 2000 : 89).</p><p>Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, atau disingkat UUD NRI 1945 atau UUD &#x27;45, adalah hukum dasar tertulis (basic law), konstitusi pemerintahan negara Republik Indonesia saat ini. UUD 1945 disahkan sebagai undang-undang dasar negara oleh PPKI pada tanggal 18 Agustus 1945. Sejak tanggal 27 Desember 1949, di Indonesia berlaku Konstitusi RIS, dan sejak tanggal 17 Agustus 1950 di Indonesia berlaku UUDS 1950. Dekrit Presiden 5 Juli 1959 kembali memberlakukan UUD 1945, dengan dikukuhkan secara aklamasi oleh DPR pada tanggal 22 Juli 1959.</p><p>Dengan kata lain, konstitusi adalah sejumlah aturan dasar dan ketentuan-ketentuasn hukum yang dibentuk untuk mengatur fungsi dan struktur lembaga pemerintahan, termasuk dasar hubungan kerja sama antara negara dan masyarakat dalam konteks kehidupan berbangsa dan bernegara. Berdasarkan pengertian ini, sedikitnya ada tiga unsur yang menonjol dalam konstitusi, yakni: 1) Konstitusi dipandang sebagai perwujudan perjanjian mayarakat (kontrak sosial), artinya konstitusi adalah hasil dari kesepakatan masyarakat untuk membina negara dan pemerintahan yang akan mengatur mereka. 2) Konstitusi sebagai piagam yang menjamin hak-hak asasi manusia dan warga negara sekaligus menentukan batas-batas hak dan kewajiban warga negara dan alat-alat pemerintahannya. 3) Konstitusi sebagai forma regimenis, yaitu kerangka bangunan pemerintahan</p><p>Konstitusi atau Undang-Undang Dasar (UUD) disebut sebagai hukum dasar yang tertulis, memuat tiga pengertian, yaitu: 1) Pertama, sebagai hukum, maka Undang- Undang Dasar bersipat mengikat, baik pada pemerintah, pada setiap lembaga negara, lembaga masyarakat ataupun mengikat pada setiap warganegaranya. 2) Kedua, sebagai hukum, Undang-Undang Dasar berisi norma-norma, kaidah-kaidah, aturan-aturan, atau ketentuan yang harus dilaksanakan dan ditaati oleh semua pihak yang terikat dalam negara tersebut. 3) Ketiga, selaku hukum dasar, maka Undang-Undang Dasar berfungsi sebagai sumber hukum. Setiap produk hukum seperti Undang-Undang (UU), Peraturan Pemerintah (PP), Peraturan Pengganti Undang- Undang (Perpu), dan sebagainya, termasuk juga setiap tindakan pemerintah dengan berbagai kebijakannya harus berdasarkan pada peraturan yang tertinggi yaitu Undang- Undang Dasar.</p><p>Arah utama adanya konstitusi ini, secara ringkas dapat diklasifikasikan menjadi tiga, yaitu: 1) Konstitusi ditujukan untuk memberikan pembatasan sekaligus pengawasan terhadap kekuasaan politik. 2) Konstitusi ditujukan untuk melepaskan kontroL kekuasaan dari penguasa sendiri. 3) Konstitusi ditujukan untuk memberikan batasan- batasan keketetapan bagi para penguasa dalam menjalankan kekuasaannya. UUD 1945 menganut paham konstitusionalisme, yaitu upaya membatasai kekuasaan negara. Pembatasan itu dapat dilihat dari hal-hal sebagai berikut: 1) Penegasan tujuan negara di dalam Pembukaan yang berarti siapapun pemegang kekuasaan negara harus bekerja untuk mencapai tujuan tersebut. 2) Penentuan Lima dasar negara (Pancasila) dalam pembukaan UUD 1945. Hal ini berarti setiap lembaga negara yang memiliki kekuasaan harus menjalankan kekuasaan yang dimiliki berdasarkan lima dasar negara. 3) Ketentuan bahwa negara Indonesia adalah hukum. Artinya kekuasaan harus dijalankan sesuai dengan aturan hukum dan prosedur yang jelas. 4) Pengaturan kelembagaan negara ditentukan bahwa masing-masing memilikI kekuasaan yang terbagi dan antar organ dapat saling mengawasi dan mengimbangi, dan bekerjasama. 5) Terdapat jaminan penghormatan, perlindungan, dan pemajuan hak asasi manusia yang menjadi kewajiban dan tanggungjawab negara. 6) Pembatasan masa jabatan Presiden dan periodesasi anggota DPR untuk mencegah penyalahgunaan dan sekaligus mengevaluasi. 7) Pengakuan hak berpartisipasi dalam pemerintahan dan dalam proses pengambilan keputusan pemerintahan. 8) Pengakuan dan perlindungan hak untuk memilih dan dipilih baik untuk anggota DPR, DPRD, DPD, ataupun Presiden dan Wakil Presiden. 9) Adanya pengadilan yang bebas dan tidak memihak yang melindungi hak warga negara, yaitu MA dan MK</p><h2>B. Pembukaan Uud Nri 1945</h2><h2>1. Makna Pembukaan Uud Nri 1945</h2><p>Pembukaan UUD 1945 berisi pokok pikiran pemberontakan melawan imperialisme, kolonialisme, dan fasisme, dan memuat dasar pembentukan Negara Kesatuan Republik Indonesia. Selain daripada itu, Pembukaan UUD 1945 yang telah dirumuskan dengan padat dan khidmat dalam empat alinea, dimana setiap alinea memuat arti dan makna yang sangat dalam, mempunyai nilai-nilai yang universal dan lestari. Teks proklamasi yang dibacakan pada tanggal 17 Agustus 1945 sangatlah singkat. Oleh karena itu Pembukaan UUD 1945 sering dikatakan sebagai teks proklamasi yang terperinci. Pembukaan UUD 1945 terdiri dari 4 alinea. Namun makna yang terkandung didalamnya baik yang tersurat ataupun yang tersirat sangat penting, karena menyangkut filosofi dasar dan dasar dasar normatif bagi berdirinya negara Indonesia. Berikut ini adalah makna di dalam alinea pembukaan UUD NRI 1945:</p><p>Alinea I : memuat penghargaan dan penghormatan terhadap hak asasi manusia khususnya hak merdeka bagi suatu bangsa. Secara obyektif dapat dinilai bahwa penjajahan itu bertentangan dengan peri kemanusiaan dan peri keadilan.</p><p>Alinea 2 : Memuat bahwa kemerdekaan itu dicapai melalui perjuangan seluruh rakyat Indonesia dan bukan hadiah dari negara manapun. Selain itu terkandung pulacita-cita bangsa Indonesia yaitu ingin mewujudkan suatu negara yang merdeka, bersatu, berdaulat, adil dan makmur.</p><p>Alinea 3 : Memuat keyakinan bahwa bangsa Indonesia adalah bangsa yang religius. Hal ini dapat kita amati dari pernyataan bahwa kemerdekaan Indonesia itu adalah berkat rahmat Allah Yang Maha Kuasa. Hal berikutnya didalam alinea ketiga ini juga dijumpai. Pernyataan Kemerdekaan atau Declaration of Independence.</p><p>Alinea 4 : Memuat hal yang sangat penting yaitu : 1. Tujuan Negara yang ingin dicapai a. melindungi segenap bangsa Indonesia dan seluruh tumpah darah Indonesia. b. mencerdaskan kehidupan bangsa. c. memajukan kesejahteraan umum d. ikut dan melaksanakan ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi dan keadilan sosial. 2. Bentuk negara yaitu negara kesatuan Republik Indonesia 3. Terdapat rumusan dasar negara yang sah dan resmi yaitu Pancasila dengan 4. Kedaulatan yang dianut di Indonesia adalah kedaulatan rakyat. 5. Negara berdasar pada Undang-undang dasar yang tertulis/konstitusi.</p><h2>2. Pokok Pikiran Pembukaan Uud Nri 1945</h2><p>Pembukaan Undang-Undang Dasar 1945 mempunyai fungsi atau hubungan langsung dengan pasal-pasal Undang-Undang Dasar 1945 dengan menyatakan bahwa Pembukaan Undang-Undang Dasar 1945 itu memuat pokok-pokok pikiran yang diciptakan dan dijelmakan dalam Pasal-pasal Undang-Undang Dasar 1945. Ada empat pokok pikiran yang memiliki makna sangat dalam , yaitu :</p><p>1) Pokok pikiran pertama; &quot;Negara ... begitu bunyinya ... melindungi segenap bangsa Indonesia dan seluruh tumpah darah Indonesia dengan berdasar atas persatuan dengan mewujudkan keadilan sosial bagi seluruh rakyat Indonesia.&quot; Dalam pembukaan ini diterima aliran pengertian negara persatuan, negara yang melindungi dan mencakup segenap bangsa seluruhnya. Jadi negara mengatasi segala paham golongan, mengatasi segala paham perseorangan. Negara, menurut pengertian &quot;pembukaan&quot; itu menghendaki persatuan, mencakup segenap bangsa Indonesia seluruhnya. Inilah suatu dasar negara yang tidak boleh dilupakan. Rumusan ini memperlihatkan pokok pikiran persatuan. Dengan pengertian yang lazim, negara, penyelenggara negara, dan setiap warga negara wajib mengutamakan kepentingan negara di atas kepentingan golongan ataupun perorangan.</p><p>2) Pokok pikiran kedua, &quot;Negara hendak mewujudkan keadilan sosial bagi seluruh rakyat Indonesia&quot;, ini adalah pokok pikiran keadilan sosial. Pokok pikiran yang hendak diwujudkan oleh negara bagi seluruh rakyat ini didasarkan pada kesadaran yang sama untuk menciptakan keadilan sosial dalam menjalani kehidupan masyarakat.</p><p>3) Pokok pikiran ketiga, &quot;negara yang berkedaulatan rakyat berdasar atas kerakyatan dan permusyawaratan perwakilan. Oleh karena itu sistem negara yang terbentuk dalam Undang-Undang Dasar harus berdasar atas kedaulatan rakyat dan berdasarkan atas permusyawaratan/perwakilan. Memang aliran ini sesuai dengan sifat masyarakat Indonesia&quot;. Ini adalah pokok pikiran kedaulatan rakyat, yang menyatakan bahwa kedaulatan adalah di tangan rakyat dan dilakukan sepenuhnya oleh Majelis Permusyawaratan Rakyat.</p><p>4) Pokok pikiran keempat, &quot;Negara berdasarkan Ketuhanan Yang Maha Esa, menurut dasar kemanusiaan yang adil dan beradab”. Oleh karena itu, undang-undang dasar harus memuat isi yang mewajibkan pemerintah dan lain-lain penyelenggara negara untuk memelihara budi pekerti kemanusiaan yang luhur dan memegang teguhcita-cita moral rakyat yang luhur&quot;. Ini menegaskan pokok pikiran Ketuhanan Yang Maha Esa dan Kemanusiaan yang adil dan beradab. Apabila anda perhatikan keempat pokok pikiran itu tampaklah bahwa pokok-pokok pikiran itu tidak lain adalah pancaran dari falsafah negara, Pancasila.</p><h2>3. Amandemen/ Perubahan Uud Nri 1945</h2><p>Perubahan UUD 1945 diperlukan karena pengalaman sejarah memperlihatkan bahwa sepanjang berlakunya ternyata menimbulkan pemerintahan otoriter baik pada masa Orde Lama ataupun Orde Baru. Dengan kata lain, dalam pengalaman sejarah UUD 1945 belum pernah menghasilkan satu sistem yang demokratis karena UUD 1945 memang membuka peluang bagi penguasa untuk melakukan akumulasi kekuasaan. Beberapa kelemahan tersebut di antaranya adalah:</p><ul><li>UUD 1945 Sebelum Perubahan melahirkan sistem politik yang executive heavy, menghimpun kekuasaan terlalu besar pada lembaga eksekutif terutama lembaga kepresidenan, dan tidak memuat mekanisme checks and balances.</li><li>UUD 1945 Sebelum Perubahan memuat pasal-pasal yang multi-interpretable, berwayuh arti, yang dalam real politiknya interprestasi penguasalah yang harus diterima sebagai interpretasi yang benar.</li><li>UUD 1945 Sebelum Perubahan terlalu banyak memberi atribusi kewenangan kepadalembaga legislatif untuk mengatur hal-hal penting dengan UU, padahal dengan sistem executive heavy pembuatan UU didominasi oleh Presiden hingga UU menjadi sarana bagi Presiden untuk mengakumulasi kekuasaan.</li><li>UUD 1945 Sebelum Perubahan terlalu percaya kepada semangat dan iktikad baik orang yang berkuasa hingga lebih menggantungkan pada semangat penyelenggara negara daripada mengatur pembatasan kekuasaan secara tegas.</li></ul><p>Pada awal MPR melakukan pembahasan perubahan UUD 1945 dalam Sidang Umum yang berisi kesepakatan:</p><ul><li>tidak mengubah Pembukaan UUD 1945;</li><li>mempertahankan bentuk Negara Kesatuan Republik Indonesia;</li><li>mempertahankan sistem presidensiil (dalam pengertian sekaligus menyempumakan supaya betul-betul memenuhi ciri-ciri umum sistem presidensial);</li></ul>",
    "keys": [
      "11) Suka melakukan kegiatan untuk mewujudkan kemajuan yang merata dan berkeadilan sosial.",
      "Secara literal, “konstitusi” berasal dari bahasa Perancis, constituir, dan bahasa Inggris, constitution, yang berarti membentuk, menyusun, dan menyatakan. Dalam konteks ketatanegaraan, konstitusi dimaksudkan sebagai pembentukan suatu negara, atau menyusun dan …",
      "Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, atau disingkat UUD NRI 1945 atau UUD &#x27;45, adalah hukum dasar tertulis (basic law), konstitusi pemerintahan negara Republik Indonesia saat ini. UUD 1945 disahkan sebagai undang-undang dasar negara oleh P…"
    ],
    "questions": [
      {
        "answer": "A",
        "tag": "SOAL 1",
        "text": "Salah satu fungsi konstitusi adalah …",
        "explanation": "Materi menjelaskan konstitusi sebagai instrumen pembatasan dan pengawasan kekuasaan.",
        "options": [
          {
            "value": "A",
            "text": "Membatasi dan mengawasi kekuasaan"
          },
          {
            "value": "B",
            "text": "Menghapus hak warga negara"
          },
          {
            "value": "C",
            "text": "Menghilangkan lembaga negara"
          },
          {
            "value": "D",
            "text": "Menyerahkan semua kekuasaan kepada satu pihak"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 2",
        "text": "Tujuan negara yang tercantum dalam Pembukaan UUD NRI 1945 adalah …",
        "explanation": "Mencerdaskan kehidupan bangsa merupakan salah satu tujuan negara.",
        "options": [
          {
            "value": "A",
            "text": "Mencerdaskan kehidupan bangsa"
          },
          {
            "value": "B",
            "text": "Memperluas wilayah negara lain"
          },
          {
            "value": "C",
            "text": "Menghapus keberagaman"
          },
          {
            "value": "D",
            "text": "Mengutamakan satu golongan"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 3",
        "text": "Perubahan UUD 1945 dibahas sebagai upaya antara lain untuk …",
        "explanation": "Materi mengaitkan amandemen dengan perbaikan sistem dan pembatasan kekuasaan.",
        "options": [
          {
            "value": "A",
            "text": "Memperjelas pembatasan kekuasaan"
          },
          {
            "value": "B",
            "text": "Menghapus seluruh lembaga negara"
          },
          {
            "value": "C",
            "text": "Menghilangkan sistem konstitusi"
          },
          {
            "value": "D",
            "text": "Menghapus hak warga negara"
          }
        ]
      }
    ]
  },
  {
    "id": "m7",
    "stageNumber": "TAHAP 08",
    "title": "NKRI dan Wawasan Nusantara",
    "content": "<ul><li>memindahkan hal-hal normatif yang ada dalam Penjelasan UUD 1945 Ke dalam pasal-pasal UUD 1945; dan</li><li>menempuh cara adendum dalam melakukan amandemen terhadap UUD 1945.</li></ul><h2>Iv. Negara Kesatuan Republik Indonesia (Nkri)</h2><h2>A. Nkri Dan Pemahamannya</h2><p>NKRI adalah singkatan dari “Negara Kesatuan Republik Indonesia”. NKRI adalah Negara kesatuan yang mencakup persatuan seluruh wilayah Indonesia dari sabang sampai merauke. Untuk lebih memahami pengertian ini, maka dapat dilihat dari fungsi dan tujuan NKRI sebagai sebuah negara kesatuan yang merdeka dan berdaulat. Sebagaimana pada umumnya fungsi negara, NKRI digunakan untuk mewujudkan harapan atau cita-cita negara menjadi kenyataan, atau dengan kata lain, sebagai alat untuk mencapai tujuan negara. Dalam pembukaan UUD 1945, tujuan NKRI adalah:</p><p>Arah utama nasional (ke dalam), mencakup : melindungi segenap dan seluruh tumpah darah Indonesia; memajukan kesejahteraan umum; dan mencerdaskan kehidupan bangsa.</p><p>Arah utama internasional (ke luar), yaitu ikut dan melaksanakan ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi dan keadilan sosial.</p><p>Keberadaan Negara Kesatuan Republik Indonesia (NKRI) tidak dapat dipisahkan dari peristiwa Proklamasi Kemerdekaan 17 Agustus 1945, karena melalui peristiwa proklamasi tersebut bangsa Indonesia berhasil mendirikan negara sekaligus menyatakan kepada dunia luar (bangsa lain) bahwa sejak saat itu telah ada negara baru yaitu Negara Kesatuan Republik Indonesia.</p><p>Apabila ditnjau dari sudut hukum tata negara, Negara Kesatuan Republik Indonesia yang lahir pada tanggal 17 Agustus 1945 belum sempurna sebagai negara, mengingat saat itu Negara Kesatuan Republik Indonesia baru sebagian memiliki unsur konstitutif berdirinya negara. Untuk itu PPKI dalam sidangnya tanggal 18 Agustus 1945 telah melengkapi persyaratan berdirinya negara yaitu berupa pemerintah yang berdaulat dengan mengangkat Presiden dan Wakil Presiden, hingga PPKI disebut sebagai pembentuk negara. Disamping itu PPKI juga telah menetapkan UUD 1945, dasar negara dan tujuan negara.</p><p>Para pendiri bangsa (the founding fathers) sepakat memilih bentuk negara kesatuan karena bentuk negara kesatuan itu dipandang paling cocok bagi bangsa Indonesia yang memiliki berbagai keanekaragaman, untuk mewujudkan paham negara integralistik (persatuan) yaitu negara hendak mengatasi segala paham individu atau golongan dan negara mengutamakan kepentingan umum.</p><p>Negara Kesatuan Republik Indonesia adalah negara yang dibentuk berdasarkan semangat kebangsaan (nasionalisme) oleh bangsa Indonesia yang bertujuan melindungi segenap bangsa dan seluruh tampah darah Indonesia, memajukan kesejahteraan umum, mencerdaskan kehidupan bangsa dan ikut dan melaksanakan ketertiban dunia berdasarkan kemerdekaan, perdamaian abadi dan keadilan sosial.</p><p>Nilai wawasan kebangsaan yang terwujud dalam persatuan dan kesatuan bangsa memiliki enam dimensi manusia yang bersipat mendasar dan fundamental, yaitu :</p><ul><li>Penghargaan terhadap harkat dan martabat manusia sebagai mahluk ciptaan Tuhan Yang Maha Kuasa;</li><li>Tekad bersama untuk berkehidupan ke-bangsaan yang bebas, merdeka, dan bersatu;</li><li>Cinta akan Tanah Air dan Bangsa;</li><li>Demokrasi atau kedaulatan rakyat;</li><li>Kesetiakawanan sosial;</li><li>masyarakat adil-makmur.</li></ul><p>Asas-asas negara kebangsaan (nation state) ditegakkan dalam integritas NKRI dengan sistem negara kesatuan, negara bangsa, negara kekeluargaan dan asas wawasan nusantara. Hal ini tercermin dalam prinsip- prinsip di bawah ini :</p><ul><li>Keunggulan sistem kenegaraan Pancasila sebagai negara Proklamasi 17 Agustus 1945; terjabar dalam asas konstitusional UUD 45:</li><li>NKRI sebagai negara berkedaulatan rakyat (demokrasi);</li><li>NKRI sebagai negara hukum (Rechtsstaat);</li><li>NKRI sebagai negara bangsa (nation state);</li><li>NKRI sebagai negara berasas kekeluargaan (paham persatuan, wawasan nasional dan wawasan nusantara).</li></ul><h2>Ciri-Ciri Negara Kesatuan</h2><ul><li>Pada Negara kesatuan peraturan dasarnya didasarkan pada satu Undang-Undang Negara. Selain itu Negara kesatuan juga memiliki hanya satu kepala Negara, dewan perwakilan rakyat dan juga dewan Negara. Pada Negara kesatuan maka semuanya terpusat dan berdasarkan dari satu undang-undang tersebut, pemerintahannyapun terorganisir pada pusat. Hal ini memiliki manfaat yang baik dimana peraturan dan roda pemerintahan pun selalu seragam namun ada kalanya mengundang kesulitan ketika ada hal-hal yang harus diselesaikan di daerah namun harus menunggu keputusan dari pusat terlebih dulu.</li><li>Semua hal yang berkaitan dengan kedaulatan Negara baik itu kedaulatan untuk urusan dalam negeri ataupun urusan luar negeri semuanya diserahkan kepada pusat untuk disetujui dan ditandatangani.</li><li>Berbagai macam masalah seperti budaya, ekonomi, politik, keamanan, sosial dan pertahanan hanya memiliki satu buah kebijakan saja.</li></ul><h2>Ciri Khas Indonesia Sebagai Negara Kesatuan</h2><ul><li>Indonesia sudah bertekad untuk menjadi negara kesatuan sejak dimulainya zaman kemerdekaan, yaitu pada tanggal 17 Agustus 1945</li><li>Pembentukan negara kesatuan sesuai dengan tekad yang tertuang pada alinea kedua Pembukaan UUD RI Tahun 1945, yang berbunyi “dan perjuangan pergerakan kemerdekaan Indonesia telah sampailah pada saat yang berbahagia dengan selamat sentausa mengantarkan rakyat Indonesia ke depan pintu gerbang kemerdekaan negara Indonesia yang merdeka, bersatu, berdaulat adil dan makmur.”</li><li>Prinsip kesatuan Negara Kesatuan Republik Indonesia diperkuat lagi pada alinea keempat Pembukaan UUD 1945, yaitu “…. dalam upaya membentuk suatu Pemerintahan negara Indonesia yang melindungi segenap bangsa Indonesia dan seluruh tumpah darah Indonesia”.</li></ul><ul><li>Pasal 1 ayat (1) UUD 1945 memuat dasar bahwa ”Negara Indonesia ialah negara kesatuan, yang berbentuk Republik. Hal ini sesuai dengan Sumpah Pemuda tahun 1928 yaitu satu nusa, satu bangsa, dan satu bahasa.</li><li>Pada perubahan UUD 1945, adanya ketetapan dari Majelis Permusyawaratan Rakyat yang mengatur untuk tidak mengubah apapun dalam Pembukaan UUD 1945 dan menetapkan NKRI sebagai bentuk mutlak bagi Indonesia.</li><li>Dalam segi kewilayahan, karakterisitik Indonesia dapat dilihat pada Pasal 25A UUD 1945 yang menyebutkan bahwa “Negara Kesatuan Republik Indonesia adalah sebuah negara kepulauan yang berciri Nusantara dengan wilayah yang batas-batas dan hak- haknya ditetapkan oleh undang-undang”. Istilah Nusantara digunakan untuk memperlihatkan kesatuan wilayah perairan dan barisan pulau- pulau Indonesia. Walaupun wilayah Indonesia terdiri atas ribuan pulau, namun semuanya bersatu dalam satu kesatuan yaitu Negara Kesatuan Republik Indonesia.</li></ul><h2>Faktor Pembentuk Negara Indonesia</h2><ul><li>Adanya persamaan nasib, yaitu penderitaan bersama di bawah penjajahan bangsa asing selama kurang lebih 350 tahun.</li><li>Adanya keinginan bersama untuk merdeka, melepaskan diri dari belenggu penjajahan.</li><li>Adanya kesatuan tempat tinggal, yaitu wilayah nusantara yang membentang dari Sabang sampai Merauke.</li><li>Adanya cita-cita bersama untuk mencapai kemakmuran dan keadilan sebagai suatu bangsa</li></ul><h2>B. Wawasan Nusantara</h2><h2>1. Pengertian Wawasan Nusantara</h2><p>Wawasan Nusantara adalah cara pandang terhadap bangsa dengan tujuan menjaga persatuan dan kesatuan, yang diwujudkan dengan mengutamakan kepentingan nasional dibanding kepentingan pribadi, kelompok atau golongan tertentu.</p><p>Wawasan Nusantara sendiri digunakan sebagai pedoman, motivasi, dorongan, dan rambu-rambu dalam menentukan kebijaksanaan, keputusan, tindakan dalam penyelenggaraan negara di tingkat pusat dan daerah ataupun bagi seluruh rakyat Indonesia dalam menjalani kehidupan bermasyarakat, berbangsa, dan bernegara.</p><p>Pengertian wawasan nusantara secara etimologi berasal dari bahasa Jawa wawas yang berarti pandangan, nusa yang berarti kesatuan kepulauan dan antara yang bermakna dua samudera.</p><p>Jadi pengertian secara umum dari Wawasan nusantara adalah cara pandang atau cara melihat kesatuan kepulauan yang terletak diantara (Asia dan Australia) juga dua samudera (Hindia dan Pasifik).</p><p>Berdasarkan TAP MPR tahun 1993 dan 1998 tentang GBHN, wawasan nusantara adalah cara pandang dan sikap bangsa Indonesia, tentang jati diri dan lingkungan</p><p>yang mengutamakan persatuan dan kesatuan bangsa, dan kesatuan wilayah demi tercapainya tujuan nasional.</p><h2>2. Tujuan Wawasan Nusantara</h2><p>Wawasan nusantara memiliki dua tujuan yaitu</p><p>Arah utama wawasan nusantara ke Luar adalah menjamin kepentingan nasional dalam era globalisasi yang kian mendunia ataupun kehidupan dalam negeri. Kemudian turut dan melaksanakan ketertiban dunia berdasarkan kemerdekaan, perdamaian abadi, keadilan sosial, dengan sikap saling menghormati.</p><p>Bangsa Indonesia harus terus-menerus mengamankan dan menjaga kepentingan nasionalnya dalam menjalani kehidupan internasionalnya di semua aspek kehidupan, baik politik, ekonomi, sosial budaya ataupun pertahanan dan keamanan demi tercapainya tujuan nasional yang tertera dalam UUD 1945.</p><p>Arah utama wawasan nusantara ke dalam adalah menjamin persatuan dan kesatuan di segenap aspek kehidupan nasional, baik aspek alamiah ataupun aspek sosial.</p><p>Bangsa Indonesia harus meningkatkan kepekaannya dan berupaya mencegah faktor-faktor penyebab timbulnya disintegrasi bangsa sedini mungkin, juga terus mengupayakan terjaganya persatuan dan kesatuan dalam kebhinekaan.</p><h2>3. Fungsi Wawasan Nusantara</h2><p>Fungsi wawasan nusantara sendiri terbagi lagi ke dalam 4 kategori, yaitu:</p><ul><li>Wawasan Pertahanan dan Keamanan nasional: Mengarah pada pandangan geopolitik Negara Indonesia. Pandangan tersebut mencakup tanah air dan segenap wilayah Negara Kesatuan Republik Indonesia.</li><li>Wawasan Kewilayahan Indonesia: Termasuk pemahaman mengenai batas wilayah Indonesia supaya terhindar dari potensi sengketa dengan negara lain.</li><li>Wawasan Pembangunan: Dengan beberapa unsur di dalamnya, seperti sosial politik, kesatuan politik, pertahanan dan keamanan negara, ekonomi, dan sosial ekonomi.</li><li>Konsep Ketahanan Nasional: Konsep ketahanan sosial yang memegang peranan penting dalam perencanaan pembangunan, kewilayahan, dan pertahanan keamanan nasional.</li></ul><h2>4. Implementasi Wawasan Nusantara</h2><p>Wawasan Nusantara bisa diimplentasikan dalam berbagai bidang di anntaranya adalah:</p><p>1) Implementasi di Bidang Pertahanan dan Keamanan : membentuk sikap dan kedisiplinan diri dalam membela Tanah Air, dan melaporkan segala hal yang mengganggu keamanan pada aparat yang berwenang, meningkatkan rasa persatuan dan solidaritas baik dalam satu daerah yang sama atau daerah yang berbeda. Terakhir membangun sarana dan prasarana bagi kegiatan atau aktivitas pengamanan wilayah Indonesia.</p><p>2) Implementasi di Bidang Politik : dijumpai dalam Undang-Undang, misalnya UU Partai Politik, dan UU Pemilu. Implementasi wawasan nusantara di bidang politik juga dimaksudkan untuk menciptakan pemerintahan yang kuat, bersih, dan dapat dipercaya oleh masyarakatnya. Contoh implementasi wawasan nusantara di bidang politik yakni: a) Menjalankan komitmen politik pada lembaga pemerintahan dan partai politik untuk meningkatkan persatuan dan kesatuan bangsa. b) Keikutdanan Indonesia di dalam politik luar negeri, dan memperkuat korps diplomatik untuk menjaga seluruh wilayah Indonesia. c) Pelaksanaan Pemilu dengan sistem demokrasi yang menjunjung tinggi keadilan. d) Mengembangkan sikap pluralisme dan HAM untuk mempersatukan keberagaman di Indonesia.</p><p>3) Implementasi di Bidang Ekonomi : dijumpai pada pemanfaatan kekayaan alam di indonesia sambil menjaga kelestarian lingkungan hidupnya. Kekayaan dan letak geografis Indonesia yang strategis dapat dimanfaatkan dengan maksimal untuk perekonomian negara. Orientasi bidang ekonomi di sektor pemerintahan, industri, dan pertanian. Pembangunan ekonomi yang seimbang dan adil di tiap-tiap daerah Indonesia hingga tidak terjadi kemiskinan di daerah tertentu.</p><p>4) Implementasi di Bidang Sosial : berada pada saling menghargai dan menghormati setiap perbedaan atau keragaman yang ada di Tanah Air. Mulai dari perbedaan, suku, ras, agama hingga budaya. Upaya lainnya juga ada pada pelestarian dan pengembangan budaya Indonesia dan menjadikan budaya sebagai tujuan wisata yang memberikan sumber penghasilan daerah atau nasional. Menjaga keberagaman Indonesia, baik dari segi budaya, bahasa, dan status sosial, dan juga mengembangkan keserasian di dalam menjalani kehidupan bermasyarakat.</p><h2>5. Tantangan Wawasan Nusantara</h2><p>Dalam melaksanakan wawasan nusantara, setidaknya ada 3 tantangan mendasar yang harus dihadapi, yaitu: 1) Perkembangan Pesat Teknologi : Perkembangan teknologi dan perkembangan masyarakat global dikaitkan dengan dunia tanpa batas yang tentu saja menjadi tantangan tersendiri untuk Wawasan Nusantara, mengingat perkembangan ini dapat mempengaruhi pola pikir, pola sikap dan pola tindak masyarakat dalam berbangsa dan bernegara.</p><p>2) Kapitalisme : Kapitalisme adalah suatu sistem ekonomi yang berdasarkan kepada hak milik swasta atas beragam barang dan kebebasan individu untuk mengadakan perjanjian dengan pihak lain dan berkecimpung dalam aktivitas- aktivitas ekonomi yang dipilihnya sendiri berdasarkan kepentingan sendiri dan mencapai laba untuk dirinya sendiri.</p><p>3) Pemberdayaan Masyarakat : Memberi peranan dalam bentuk aktivitas dan partisipasi masyarakat untuk mencapai tujuan nasional hanya dapat</p>",
    "keys": [
      "4) memindahkan hal-hal normatif yang ada dalam Penjelasan UUD 1945 Ke dalam pasal-pasal UUD 1945; dan 5) menempuh cara adendum dalam melakukan amandemen terhadap UUD 1945.",
      "NKRI adalah singkatan dari “Negara Kesatuan Republik Indonesia”. NKRI adalah Negara kesatuan yang mencakup persatuan seluruh wilayah Indonesia dari sabang sampai merauke. Untuk lebih memahami pengertian ini, maka dapat dilihat dari fungsi dan tujuan NKRI sebag…",
      "Arah utama nasional (ke dalam), mencakup : melindungi segenap dan seluruh tumpah darah Indonesia; memajukan kesejahteraan umum; dan mencerdaskan kehidupan bangsa."
    ],
    "questions": [
      {
        "answer": "B",
        "tag": "SOAL 1",
        "text": "Ciri negara kesatuan adalah …",
        "explanation": "Negara kesatuan mempertahankan kedaulatan dalam satu negara, bukan dalam negara-negara bagian.",
        "options": [
          {
            "value": "A",
            "text": "Kedaulatan negara terbagi menjadi negara bagian"
          },
          {
            "value": "B",
            "text": "Kedaulatan negara tetap berada dalam satu negara"
          },
          {
            "value": "C",
            "text": "Setiap provinsi menjadi negara berdaulat"
          },
          {
            "value": "D",
            "text": "Tidak ada pemerintahan pusat"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 2",
        "text": "Wawasan Nusantara merupakan …",
        "explanation": "Materi mendefinisikan Wawasan Nusantara sebagai cara pandang bangsa Indonesia terhadap diri dan lingkungan berdasarkan Pancasila dan UUD.",
        "options": [
          {
            "value": "A",
            "text": "Cara pandang bangsa Indonesia terhadap diri dan lingkungannya dengan mengutamakan persatuan"
          },
          {
            "value": "B",
            "text": "Sistem ekonomi daerah"
          },
          {
            "value": "C",
            "text": "Bentuk pemerintahan"
          },
          {
            "value": "D",
            "text": "Sistem kepartaian"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 3",
        "text": "Salah satu tantangan Wawasan Nusantara adalah …",
        "explanation": "Bagian tantangan membahas perubahan dan pengaruh perkembangan zaman terhadap kehidupan nasional.",
        "options": [
          {
            "value": "A",
            "text": "Globalisasi dan perkembangan teknologi yang dapat memengaruhi kehidupan nasional"
          },
          {
            "value": "B",
            "text": "Tidak adanya keberagaman"
          },
          {
            "value": "C",
            "text": "Tidak adanya wilayah kepulauan"
          },
          {
            "value": "D",
            "text": "Hilangnya seluruh teknologi"
          }
        ]
      }
    ]
  },
  {
    "id": "m8",
    "stageNumber": "TAHAP 09",
    "title": "Bhinneka Tunggal Ika",
    "content": "<p>dilaksanakan oleh negara-negara maju dengan Buttom Up Planning, sedang untuk negara berkembang dengan adanya keterbatasan kualitas SDM hingga diperlukan landasan operasional berupa GBHN. Kondisi nasional (Pembangunan) yang tidak merata mengakibatkan keterbelakangan dan kondisi tersebut adalah ancaman bagi integritas. Pemberdayaan masyarakat diperlukan terutama untuk daerah-daerah tertinggal.</p><h2>V. Bhineka Tunggal Ika.</h2><p>Bhinneka Tunggal Ika memuat arti “berbeda- beda tetapi satu jua”. Istilah ini berasal dari buku Sutasoma karangan Empu Tantular. Pengertian Bhineka Tunggal Ika ini memperlihatkan bahwa bangsa Indonesia memiliki banyak suku, agama, ras, kesenian, adat, bahasa, dan lain sebagainya, namun tetap satu kesatuan yang sebangsa dan setanah air. Dipersatukan dengan bendera, lagu kebangsaan, mata uang, bahasa dan lain-lain yang sama. Kata-kata Bhinneka Tunggal Ika, dijumpai pada lambang negara Republik Indonesia yaitu Burung Garuda. Di kaki Burung Garuda, Pancasila mencengkram sebuah pita yang bertuliskan “Bhinneka Tunggal Ika”.</p><p>Bhinneka Tunggal Ika berfungsi sebagai motto negara, yang diangkat dari penggalan kakawin Sutasoma karya besar Mpu Tantular pada jaman Keprabonan Majapahit (abad 14). Sesanti atau semboyan Bhinneka Tunggal Ika diungkapkan pertama kali oleh Mpu Tantular, pujangga agung kerajaan Majapahit yang hidup pada masa pemerintahan Raja Hayamwuruk, di abad ke empatbelas (1350-1389). Sesanti tersebut berbunyi “Bhinna ika tunggal ika, tan hana dharma mangrwa,” yang artinya, “berbeda-beda itu, satu itu, tak ada pengabdian yang mendua.” Semboyan yang kemudian dijadikan prinsip dalam peme- rintahan kerajaan Majapahit untuk mengantisipasi adanya keanekaragaman agama yang dipeluk oleh rakyat Majapahit pada waktu itu. Meskipun mereka berbeda agama tetapi mereka tetap satu dalam pengabdian.</p><p>Pada tahun 1951, sekitar 600 tahun setelah pertama kali semboyan Bhinneka Tunggal Ika yang diungkap oleh Empu Tan-tular, ditetapkan oleh pemerintah Indonesia sebagai semboyan resmi Negara Republik Indonesia dengan Peraturan Pemerintah No.66 tahun 1951. Peraturan Pemerintah tersebut menentukan bahwa sejak 17 Agustus 1950, Bhinneka Tunggal Ika ditetapkan sebagai semboyan yang dijumpai dalam Lambang Negara Republik Indonesia, “Garuda Pancasila.” Kata “bhinna ika,” kemudian dirangkai menjadi satu kata “bhinneka”. Pada perubahan UUD 1945 yang kedua, Bhinneka Tunggal Ika dikukuhkan sebagai semboyan resmi yang dijumpai dalam Lambang Negara, dan tercantum dalam pasal 36a UUD 1945.</p><p>Jika dikaji secara akademis, bhinneka tunggal ika tersebut dapat dimaknai dalam konteks konsep generik multiculturalism. Dalam wacana masyarakat Barat kontemporer, multikulturalisme setidaknya menunjuk pada tigal hal :</p><ul><li>sebagai bagian dari pragmatism movement pada akhir abad ke 19 di Eropa dan Amerika Serikat;</li><li>sebagai political and cultural pluralism pada abad ke 20 yang adalah bentuk respon terhadap imperialisme Eropa di Afrika dan imigrasi besar-besaran orang Eropa ke Amerika Serikat dan Amerika Latin.</li><li>sebagai official national policy yang dilakukan di Canada pada tahun 1971 dan Australia tahun 1973, dan berikutnya di beberapa Negara Eropa.</li></ul><p>Pada perubahan UUD 1945 yang kedua, Bhinneka Tunggal Ika dikukuhkan sebagai semboyan resmi yang dijumpai dalam Lambang Negara, dan tercantum dalam pasal 36a UUD 1945. Lambang Negara terdiri atas tiga bagian, yaitu:</p><ul><li>Burung Garuda yang menengok dengan kepalanya lurus ke sebelah kanannya;</li><li>Perisai berupa jantung yang digantung dengan rantai pada leher Garuda, dan</li><li>Semboyan yang ditulis di atas pita yang dicengkeram oleh Garuda. Di atas pita tertulis dengan huruf Latin sebuah semboyan dalam bahasa Jawa Kuno yang berbunyi : BHINNEKA TUNGGAL IKA.</li></ul><p>Semboyan Bhinneka Tunggal Ika memuat rasa kebangsaan yang sangat dalam, terutama semboyan ini tidak dapat dipisahkan dari Hari Kemerdekaan Bangsa Indonesia, dan Dasar Negara Pancasila. Hal ini sesuai dengan komponen yang dijumpai dalam Lambang Negara Indonesia. Bhinneka tunggal ika sebagai Lambang Negara dapat digali nilai wawasan kebangsaannya sebagai berikut:</p><ul><li>Burung Garuda, disamping menggambarkan tenaga pembangunan yang kokoh dan kuat, juga melambangkan tanggal kemerdekaan bangsa Indonesia yang digambarkan oleh bulu-bulu yang dijumpai pada Burung Garuda tersebut. Jumlah bulu sayap sebanyak 17 di tiap sayapnya melambangkan tanggal 17, jumlah bulu pada ekor sebanyak 8 melambangkan bulan 8, jumlah bulu dibawah perisai sebanyak 19, sedang jumlah bulu pada leher sebanyak</li><li>Dengan demikian jumlah bulu-bulu burung garuda tersebut melambangkan tanggal hari kemerdekaan bangsa Indonesia, yakni 17 Agustus</li><li>Perisai, yang tergantung di leher garuda menggambarkan Negara Indonesia yang terletak di garis khalustiwa, dilambangkan dengan garis hitam horizontal yang membagi perisai, sedang lima segmen menggambarkan sila-sila Pancasila.</li><li>Lima sila yang dijumpai dalam perisai adalah: Ketuhanan Yang Maha Esa dilam- bangkan dengan “bintang bersudut lima” yang terletak di tengah perisai yang menggambarkan “sinar ilahi”. Rantai yang adalah rangkaian yang tidak terputus dari bulatan dan persegi menggambarkan kemanusiaan yang adil dan beradab, yang sekaligus melambangkan monodualistik manusia Indonesia. Kebangsaan dilam- bangkan oleh “pohon beringin”, sebagai “tempat berlindung”. Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawa- rakatan/perwakilan dilambangkan dengan banteng yang menggambarkan “kekuatan” dan “kedaulatan rakyat”. Sedangkan Keadilan sosial bagi seluruh rakyat Indonesia dengan kapas dan padi yang menggambarkan “kesejahteraan” dan “kemakmuran”.</li></ul><p>Bhineka Tunggal Ika dalam hal wawasan kebangsaan memuat beberapa makna sebagai berikut:</p><p>1) Demokrasi;</p><p>Indonesia dikonsepsikan dan dibangun sebagai multicultural nation-state dalam konteks negara-kebangsaan Indonesia modern, bukan sebagai monocultural nation-state. Hal itu dapat dicermati dari dinamika praksis kehidupan bernegara Indonesia sejak Proklamasi Kemerdekaan Indonesia 17 Agustus 1945 sampai saat ini dengan mengacu pada konstitusi yang pernah dan sedang berlaku, yakni UUD 1945, Konstitusi RIS 1949, dan UUDS 1950, dan praksis kehidupan bernegara dan bermasyarakat yang menjadi dampak langsung dan dampak pengiring dari</p><p>berlakunya setiap konstitusi dan dampak perkembangan internasional pada setiap jamannya itu. Demokrasi adalah nilai dasar yang tercermin dari bhinneka tunggal ika. Cita-cita, nilai, dan konsep demokrasi, yang secara substantif dan prosedural menghargai persamaan dalam perbeda-an dan persatuan dalam keberagaman, secara formal konstitusional dianut oleh ketiga konstitusi tersebut.</p><p>2) Persatuan Nasional;</p><p>Untuk mewadahi multikulturalisme yang ada Secara instrumental dalam ketiga konstitusi tersebut juga telah digariskan adanya sejumlah perangkat demokrasi seperti lembaga perwakilan rakyat, pemilihan umum yang bersifat umum, langsung, bebas dan rahasia untuk mengisi lembaga perwakilan rakyat; partisipasi politik rakyat melalui partai politik; kepemimpinan nasional dengan sistem presidentil atau parlementer, perlin-dungan terhadap hak azasi manusia; sistem desentralisasi dalam wadah negara kesatuan (UUD45 dan UUDS 50) atau sistem negara federal (KRIS 49); pembagian kekuasaan legislatif, ekse-kutif, dan yudikatif; orientasi pada keadilan dan kesejahteraan rakyat; dan demokrasi yang ber- Ketuhanan Yang Maha Esa.</p><p>3) Kesadaran Berbangsa dan Bernegara</p><p>Adanya kesadaran warga negara terhadap kehidupan berbangsa dan bernegara lebih disebabkan oleh beberapa hal penting, yaitu: 1) karena adanya rasa kebangsaan,2) tertanamnya faham kebangsaan, 3) tingginya semangat kebangsaan,dan 4) kuatnya wawasan kebangsaan. Keempat aspek ini memiliki kesatuan arti yang utuh, dan memiliki hubungan dan kesamaan yang tidak dapat dipisahkan antara satu dengan lainnya. Karena adanya rasa kebangsaan juga akan menanamkan faham kebangsaan, dan tertanamnya faham kebangsaan akan mempertinggi semangat kebangsaan, sementara tingginya semangat kebangsaan juga akan memperkuat wawasan kebangsaan, dan pada gilirannya kuatnya wawasan kebangsaan juga akan meningkatkan semangat nasionalisme yang tinggi.</p><p>Kemajemukan bangsa Indonesia disadari sebagai hal yang menjadikan bangsa ini unik, karena terdiri dari berbagai suku dan bahasa, dengan keanekaragaman budaya. Kemajemukan itu bisa berpotensi disintegrasi jika antara satu dan lain tidak merasa sebagai bagian dari entitas bernama Indonesia. Oleh karena itu Bhinneka Tunggal Ika menjadi semboyan bangsa Indonesia, untuk menyadarkan bahwa kita memiliki keanekaragaman, namun kesemuanya satu, suatu tekad yang telah dicanangkan sejak Sumpah Pemuda. Tanpanya, setiap daerah, setiap entitas etnis, suku, dan kelompok akan merasa dapat berdiri sendiri tanpa suatu wadah negara Indonesia.</p><p>Sejalan dengan perkembangan pemikiran dan dinamika partisipasi seluruh warga negara, pada masa yang akan datang instrumentasi dan praksis berkehidupan demokrasi di Indonesia akan mengalami penyempurnaan yang terus menerus. Dalam konteks multi- kulturalisme, hal itu menujukkan bahwa konsep final tentang NKRI, Pembukaan UUD 1945 yang diterima secara konsisten dengan Pancasila di dalamnya, wawasan Nusantara yang mempersatukan wilayah Indonesia dari Merauke sampai Sabang, dan pengakuan kebudayaan Indonesia yang merajut puncak-puncak budaya dari semua etnis yang ada di Indonesia, adalah indikasi yang kuat bahwa Indonesia memiliki landasan yang kuat dengan konsepsi Bhinneka Tunggal Ika.</p><p>Berikut ini prinsip-prinsip Bhinneka Tunggal Ika:</p><p>1. Common Denominator</p><p>Terdapat 5 agama di Indonesia, namun sesuai dengan prinsip pertama Bhinneka Tunggal Ika perbedaan dalam hal keagamaan haruslah dicari common denominatornya, atau dengan kata lain menemukan persamaan dalam perbedaan hingga semua rakyat Indonesia dapat hidup rukun berdampingan.</p><p>Demikian juga dengan berbagai aspek lain dengan segala perbedaannya di Indonesia, seperti adat dan kebudayaan di setiap daerah. Semua keberagaman adat dan budaya tersebut tetap diakui keabsahannya dengan segala perbedaan yang ada tetap Bersatu dalam Negara kesatuan republik Indonesia.</p><p>2. Tidak Sektarian dan Enklusif</p><p>Tidak Sektarian dan Eksklusif maksudnya dalam menjalani kehidupan berbangsa dan bernegara setiap rakyat Indonesia tidak dibenarkan untuk menganggap bahwa diri atau kelompoknya sebagai yang paling benar dibanding orang atau kelompok lain.</p><p>Pandangan-pandangan sektarian dan eksklusif harus dihilangkan, karena ketika sifat sektarian dan eksklusif sudah terbentuk, maka akan ada banyak konflik yang terjadi dikarenakan kecemburuan, kecurigaan, sikap yang berlebih-lebihan dan kurang memperhitungkan keberadaan kelompok atau pribadi lain.</p><p>3. Tidak Formalistis</p><p>Bhinneka Tunggal Ika sifatnya universal dan menyeluruh. Hal ini dilandasi oleh adanya rasa cinta mencintai, rasa hormat menghormati, saling percaya mempercayai, dan saling rukun antar sesama. Dengan cara tersebutlah keanekaragaman kemudian dapat disatukan dalam bingkai ke-Indonesiaan.</p><p>4. Bersifat Konvergen</p><p>Bersifat Konvergen maksudnya segala keanekaragaman bukan untuk dibesar-besarkan, tetapi harus dicari titik temu yang dapat membuat segala kepentingan bertemu di tengah. Hal ini dapat dicapai jika dijumpai sikap toleran, saling percaya, rukun, non sektarian, dan inklusif di antara masyarakat.</p><p>5. Prinsip Pluralistik dan Multikultural</p><p>Bhinneka Tunggal Ika memuat nilai di antaranya: toleransi, inklusif, damai dan kebersamaan, dan setara. Nilai-nilai tersebut tidak menghendaki sifat yang tertutup atau eksklusif hingga memungkinkan untuk mengakomodasi keanekaragaman budaya bangsa dan menghadapi arus globalisasi.</p><p>Saling menghormati antar agama, suku bangsa, menghargai hasil karya orang lain, bergotong royong membangun bangsa tanpa memandang perbedaan suku, budaya dan agama, tidak saling membedakan bahkan mencaci karena kondisi tersebut dapat menimbulkan konflik dan menjadi sumber awal pemecah persatuan dan kesatuan bangsa.</p>",
    "keys": [
      "dilaksanakan oleh negara-negara maju dengan Buttom Up Planning, sedang untuk negara berkembang dengan adanya keterbatasan kualitas SDM hingga diperlukan landasan operasional berupa GBHN. Kondisi nasional (Pembangunan) yang tidak merata mengakibatkan keterbelak…",
      "Bhinneka Tunggal Ika memuat arti “berbeda- beda tetapi satu jua”. Istilah ini berasal dari buku Sutasoma karangan Empu Tantular. Pengertian Bhineka Tunggal Ika ini memperlihatkan bahwa bangsa Indonesia memiliki banyak suku, agama, ras, kesenian, adat, bahasa, …",
      "Bhinneka Tunggal Ika berfungsi sebagai motto negara, yang diangkat dari penggalan kakawin Sutasoma karya besar Mpu Tantular pada jaman Keprabonan Majapahit (abad 14). Sesanti atau semboyan Bhinneka Tunggal Ika diungkapkan pertama kali oleh Mpu Tantular, pujang…"
    ],
    "questions": [
      {
        "answer": "B",
        "tag": "SOAL 1",
        "text": "Prinsip Bhinneka Tunggal Ika menuntut masyarakat untuk …",
        "explanation": "Materi menekankan persatuan dalam keberagaman, sikap inklusif, kesetaraan, dan kerukunan.",
        "options": [
          {
            "value": "A",
            "text": "Menghapus semua perbedaan"
          },
          {
            "value": "B",
            "text": "Menyatukan keberagaman tanpa bersikap sektarian"
          },
          {
            "value": "C",
            "text": "Mengutamakan satu kelompok"
          },
          {
            "value": "D",
            "text": "Menolak kerja sama antarbudaya"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 2",
        "text": "Bhinneka Tunggal Ika berasal dari karya …",
        "explanation": "Materi mengaitkan semboyan tersebut dengan Kakawin Sutasoma karya Mpu Tantular.",
        "options": [
          {
            "value": "A",
            "text": "Kakawin Sutasoma"
          },
          {
            "value": "B",
            "text": "Nagarakretagama"
          },
          {
            "value": "C",
            "text": "Negarakertagama Baru"
          },
          {
            "value": "D",
            "text": "Serat Centhini"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 3",
        "text": "Sikap memeriksa informasi sebelum menyebarkannya dapat mendukung Bhinneka Tunggal Ika karena …",
        "explanation": "Materi mengaitkan gotong royong dan verifikasi informasi dengan upaya melawan hoaks.",
        "options": [
          {
            "value": "A",
            "text": "Mengurangi potensi konflik akibat hoaks"
          },
          {
            "value": "B",
            "text": "Membatasi komunikasi"
          },
          {
            "value": "C",
            "text": "Menghapus perbedaan pendapat"
          },
          {
            "value": "D",
            "text": "Menutup semua media"
          }
        ]
      }
    ]
  },
  {
    "id": "m9",
    "stageNumber": "TAHAP 10",
    "title": "Integrasi Nasional",
    "content": "<p>6. Semangat Gotong-Royong</p><p>Semangat gotong-royong tidak melulu tentang bahu-membahu membersihkan lingkungan, atau menjaga keamanan lingkungan sekitar rumahmu. Tapi juga pada semangat gotong- royong dalam melawan hoax atau berita bohong yang kini tersebar dimana-mana atas nama clickbait.</p><p>Biasakan untuk memverifikasi data atau berita yang diterima dan ingin disebarkan. Karena jejak digital sangat sulit untuk dihilangkan, pasalanya, setiap harinya, ada ribuah hoax yang menyebar dan siap merusak generasi dan keBhinnekaan negara ini.</p><h2>Vi. Integrasi Nasional</h2><h2>A. Pengertian Dan Tujuan</h2><p>Integrasi Nasional adalah proses penyatuan berbagai suku, agama, budaya, dan daerah yang berbeda-beda menjadi satu kesatuan bangsa Indonesia yang utuh dan berdaulat.</p><p>Integrasi Nasional ditujukan untuk mempertahankan keutuhan dan keberlangsungan bangsa Indonesia sebagai sebuah negara yang berdaulat dan mandiri.</p><p>Integrasi Nasional mencakup upaya-upaya yang dilakukan oleh pemerintah dan seluruh elemen masyarakat untuk memperkuat persatuan dan kesatuan bangsa, menghormati keanekaragaman budaya dan agama, dan membangun rasa cinta tanah air yang kuat. Integrasi Nasional sangat penting bagi keberlangsungan dan kemajuan bangsa Indonesia, karena akan memudahkan dalam melakukan pembangunan, menjaga stabilitas politik, sosial dan ekonomi, dan memperkuat posisi Indonesia di mata dunia internasional.</p><h2>B. Faktor Pendorong Integrasi Nasional</h2><p>Dalam kehidupan berbangsa dan bernegara terutama di Indonesia sebagai negara kepulauan dengan berbagai suku, adat dan budaya, banyak faktor yang mempengaruhi integrasi nasional yaitu:</p><ul><li>Sejarah Perjuangan Kemerdekaan : Sejarah perjuangan kemerdekaan Indonesia menjadi faktor pendorong Integrasi Nasional karena dalam perjuangan tersebut, semua elemen masyarakat bersatu padu untuk mencapai kemerdekaan dan mempertahankan kesatuan bangsa.</li><li>Kebijakan Pemerintah : Kebijakan pemerintah yang mengedepankan kesatuan dan kebersamaan bangsa Indonesia seperti Pancasila dan Bhinneka Tunggal Ika, menjadi faktor penting dalam memperkuat Integrasi Nasional. Kebijakan-kebijakan pemerintah lainnya seperti pembangunan infrastruktur dan pengentasan kemiskinan juga dapat memperkuat Integrasi Nasional.</li><li>Identitas Nasional : Kesadaran akan identitas nasional menjadi faktor penting dalam memperkuat Integrasi Nasional. Identitas nasional yang kuat dapat mempertahankan kebersamaan dalam keragaman suku, agama, dan budaya.</li><li>Pendidikan : Pendidikan adalah faktor penting dalam membentuk kesadaran nasional dan memperkuat Integrasi Nasional. Melalui pendidikan, masyarakat</li></ul><p>Indonesia dapat memahami dan mempertahankan identitas nasional dan membangun rasa cinta tanah air yang kuat. 5. Sosial Budaya : Kebudayaan dan agama menjadi faktor penting dalam memperkuat Integrasi Nasional. Keberagaman budaya dan agama di Indonesia menjadi potensi besar dalam memperkuat persatuan dan kesatuan bangsa. Dalam kehidupan sosial masyarakat, perlu adanya upaya untuk memperkuat kerukunan dan kebersamaan. 6. Ekonomi : Ekonomi juga berperan penting dalam memperkuat Integrasi Nasional. Pemerintah perlu memberikan kesempatan yang sama bagi semua lapisan masyarakat dalam mengakses sumber daya dan peluang ekonomi. Hal ini dapat diwujudkan melalui kebijakan-kebijakan yang menjamin distribusi kekayaan secara adil, pengembangan sektor ekonomi yang merata, dan penguatan industri dalam negeri. 7. Pertahanan dan Keamanan : Pertahanan dan keamanan juga adalah faktor penting dalam memperkuat Integrasi Nasional. Pemerintah perlu menjaga keamanan negara dan memberikan perlindungan kepada seluruh rakyat Indonesia dari ancaman dalam ataupun luar negeri. Upaya-upaya pengamanan nasional juga harus dilakukan dengan mengedepankan hak asasi manusia dan menghindari tindakan-tindakan yang merugikan masyarakat.</p><p>Secara keseluruhan, faktor-faktor pendorong Integrasi Nasional di Indonesia mencakup sejarah perjuangan kemerdekaan, kebijakan pemerintah, identitas nasional, pendidikan, sosial budaya, ekonomi, dan pertahanan dan keamanan. Semua faktor tersebut harus dikelola dengan baik dan diintegrasikan secara sinergis untuk memperkuat Integrasi Nasional.</p><h2>C. Syarat Terbentuknya Integrasi Nasional</h2><p>Integrasi nasional membutuhkan beberapa syarat yang perlu dipenuhi supaya tercapai. Berikut adalah beberapa syarat:</p><ul><li>Persamaan hak bagi setiap warga negara, hingga tidak ada diskriminasi dalam perlakuan antarwarga negara.</li><li>Jaminan keadilan bagi setiap warga negara, hingga tidak ada ketidakadilan dalam pemenuhan hak dan kewajiban.</li><li>Dukungan partisipasi masyarakat dalam proses penyelenggaraan negara, hingga tercipta kesadaran dan tanggung jawab bersama untuk membangun negara.</li><li>Sikap keterbukaan yang dapat menumbuhkan saling pengertian, menghormati, dan kerja sama antara berbagai kelompok sosial dan budaya.</li><li>Masyarakat dapat menemukan dan menyepakati nilai-nilai fundamental yang dapat dijadikan rujukan bersama.</li><li>Masyarakat terhimpun dalam unit sosial sekaligus memiliki anggota dari berbagai kesatuan sosial hingga menghasilkan loyalitas ganda.</li><li>Masyarakat saling ketergantungan dalam pemenuhan kebutuhan ekonomi.</li></ul><h2>D. Faktor Penghambat Dan Pendukung Integrasi Nasional</h2><p>Faktor Pembentuk Integrasi Nasional</p><p>a. Faktor sejarah yang menimbulkan rasa senasib dan seperjuangan</p><p>b. Keinginan untuk bersatu di kalangan bangsa Indonesia sebagaimana dinyatakan dalam Sumpah Pemuda tanggal 28 Oktober 1928 c. Rasa cinta tanah air di kalangan bangsa Indonesia, sebagaimana dibuktikan oleh banyak pahlawan bangsa yang gugur di medan perjuangan. d. Kesepakatan atau konsensus nasional dalam perwujudan Proklamasi Kemerdekaan, Pancasila, dan UUD 1945, bendera Merah Putih, lagu kebangsaan Indonesia Raya, bahasa kesatuan Bahasa Indonesia.</p><p>Faktor Penghambat Integrasi Nasional</p><p>a. Kurangnya penghargaan terhadap kemajemukan yang bersifat heterogen b. Kurang toleransi antar golongan c. Kurangnya kesadaran dari masyarakat Indonesia terhadap ancaman dan gangguan dari luar d. Adanya ketidakpuasan terhadap ketimpangan dan ketidakmerataan hasil-hasil pembangunan</p><h2>E. Contoh Integrasi Nasional</h2><p>Berikut adalah contoh implementasi dalam menjalani kehidupan sehari-hari di lingkungan sekolah dan masyarakat:</p><ul><li>Seragam Sekolah : Penerapan seragam sekolah yang sama untuk semua murid, tanpa memandang latar belakang kelas sosial, agama, ras, atau suku. Hal ini melambangkan integrasi dalam mencapai tujuan bersama.</li><li>Gotong Royong : Pelaksanaan gotong royong sebagai bentuk kerja sama yang menyatukan beragam latar belakang dalam masyarakat. Gotong royong adalah nilai kemanusiaan yang tinggi di masyarakat Indonesia dan dapat memudahkan dalam menyelesaikan masalah yang ada.</li><li>Menghargai dan Menghormati : Saling menghargai dan menghormati di antara orang-orang yang memiliki perbedaan suku, agama, budaya, dan adat istiadat. Hal ini penting untuk hidup rukun dan damai dalam masyarakat majemuk Indonesia.</li><li>Akulturasi dan Asimilasi Budaya : Akulturasi dan asimilasi budaya untuk menciptakan budaya negara yang lebih maju tanpa mengabaikan budaya lokal. Proses ini melibatkan integrasi budaya yang sejalan dan bersatu dalam satu identitas negara.</li><li>Kepatuhan Terhadap Hukum : Kepatuhan terhadap hukum sebagai bentuk kepentingan umum yang memastikan hak individu tidak bertentangan dengan hak orang lain. Hal ini membantu mencapai integrasi melalui kepatuhan terhadap peraturan dan aturan yang berlaku.</li><li>Sikap Toleransi Beragama : Toleransi beragama yang tinggi di Indonesia, yang menjamin hak asasi manusia dan kebebasan menjalankan agama sesuai dengan keyakinannya. Hal ini adalah suatu keberhasilan integrasi dalam beberapa dekade kemerdekaan.</li><li>Upacara Bendera : Upacara bendera sebagai identitas nasional dan bagian dari integrasi nasional yang dirayakan dalam beberapa perayaan nasional dan di sekolah setiap hari Senin. Hal ini memperkuat rasa cinta tanah air dan memperkuat disiplin siswa untuk menaati peraturan.</li></ul>",
    "keys": [
      "Semangat gotong-royong tidak melulu tentang bahu-membahu membersihkan lingkungan, atau menjaga keamanan lingkungan sekitar rumahmu. Tapi juga pada semangat gotong- royong dalam melawan hoax atau berita bohong yang kini tersebar dimana-mana atas nama clickbait.",
      "Biasakan untuk memverifikasi data atau berita yang diterima dan ingin disebarkan. Karena jejak digital sangat sulit untuk dihilangkan, pasalanya, setiap harinya, ada ribuah hoax yang menyebar dan siap merusak generasi dan keBhinnekaan negara ini.",
      "Integrasi Nasional adalah proses penyatuan berbagai suku, agama, budaya, dan daerah yang berbeda-beda menjadi satu kesatuan bangsa Indonesia yang utuh dan berdaulat."
    ],
    "questions": [
      {
        "answer": "A",
        "tag": "SOAL 1",
        "text": "Salah satu syarat terbentuknya integrasi nasional adalah adanya …",
        "explanation": "Materi membahas syarat integrasi yang berhubungan dengan kesepakatan dan kehidupan bersama.",
        "options": [
          {
            "value": "A",
            "text": "Kesepakatan nilai bersama"
          },
          {
            "value": "B",
            "text": "Persaingan antarwilayah"
          },
          {
            "value": "C",
            "text": "Fanatisme kelompok"
          },
          {
            "value": "D",
            "text": "Penolakan keberagaman"
          }
        ]
      },
      {
        "answer": "C",
        "tag": "SOAL 2",
        "text": "Yang termasuk faktor penghambat integrasi adalah …",
        "explanation": "Kurangnya penghargaan terhadap kemajemukan termasuk faktor penghambat.",
        "options": [
          {
            "value": "A",
            "text": "Toleransi"
          },
          {
            "value": "B",
            "text": "Gotong royong"
          },
          {
            "value": "C",
            "text": "Kurangnya penghargaan terhadap kemajemukan"
          },
          {
            "value": "D",
            "text": "Cinta tanah air"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 3",
        "text": "Contoh integrasi nasional dalam kehidupan sehari-hari adalah …",
        "explanation": "Gotong royong lintas latar belakang memperkuat persatuan dan kebersamaan.",
        "options": [
          {
            "value": "A",
            "text": "Gotong royong lintas latar belakang"
          },
          {
            "value": "B",
            "text": "Menolak kerja sama dengan kelompok lain"
          },
          {
            "value": "C",
            "text": "Mengutamakan daerah sendiri"
          },
          {
            "value": "D",
            "text": "Menyebarkan konflik"
          }
        ]
      }
    ]
  },
  {
    "id": "m10",
    "stageNumber": "TAHAP 11",
    "title": "Kelembagaan Negara",
    "content": "<p>Kelembagaan negara adalah lembaga-lembaga negara yang diatur dalam UUD 1945. Setelah UUD 1945 diamandemen sebanyak empat kali, lembaga-lembaga negara yang ada adalah: MPR, Presiden, DPR, DPD, MA, MK, BPK, sedangkan DPA telah dihapus. Lembaga-lembaga negara tersebut dibekali dengan tugas, wewenang, dan hak masing-masing, yang dapat diuraikan sebagai berikut:</p><h2>A. Majelis Permusyawaratan Rakyat (Mpr)</h2><p>Kedudukan:</p><p>Sebagai Lembaga Negara, dengan susunan keanggotaan terdiri dari anggota DPR dan DPD hasil pemilihan umum;</p><p>Sebagai pelaksana fungsi konstitutif Tugas dan wewenang:</p><ul><li>Bersidang sedikitnya sekali dalam lima tahun;</li><li>Mengubah dan menetapkan undang-undang dasar. Usul perubahan secara tertulis diajukan oleh sekurang-kurangnya 1/3 dari jumlah anggota MPR, sidang dihadiri sekurang-kurangnya 2/3 dari jumlah anggota MPR, dan putusan dilakukan dengan persetujuan sekurangkurangnya lima puluh persen ditambah satu dari seluruh anggota MPR.</li><li>Melantik Presiden dan Wakil Presiden berdasarkan hasil pemilihan umum, dalam Sidang Paripurna MPR;</li><li>Memutuskan usul DPR berdasarkan putusan Mahkamah Konstitusi untuk memberhentikan Presiden dan/atau Wakil Presiden dalam masa jabatannya setelah Presiden dan/atau Wakil Presiden diberi kesempatan Nuntuk menyampaikan penjelasan di dalam Sidang Paripurna MPR;</li><li>Menyelenggarakan sidang untuk memutuskan usul DPR tersebut di atas paling lambat tiga puluh hari sejak diterimanya usul tersebut;</li><li>Melantik Wakil Presiden menjadi Presiden apabila Presiden mangkat, berhenti, diberhentikan, atau tidak dapat melaksanakan kewajibannya dalam masa jabatannya;</li><li>Memilih Wakil Presiden dari dua calon yang diajukan Presiden, apabila terjadi kekosongan Wakil Presiden dalam masa jabatan selambatlambatnya dalam waktu enam puluh hari;</li><li>Memilih Presiden dan Wakil Presiden apabila keduanya berhenti secara bersamaan dalam masa jabatannya, dari dua paket calon Presiden dan Wakil Presiden yang diusulkan oleh partai politik atau gabungan partai politik yang paket calon presiden dan wakil presiden meraih suara terbanyak pertama dan kedua dalam pemilihan sebelumnya, sampai habis masa jabatannya selambat-lambatnya dalam waktu tiga puluh hari;</li></ul><p>Dalam melaksanakan tugas dan wewenangnya tersebut, anggota MPR mempunyai hak-hak sebagai berikut :</p><ul><li>Mengajukan usul perubahan pasal-pasal Undang-Undang Dasar oleh sekurang-kurangnya 1/3 dari jumlah anggota MPR;</li><li>Memilih dan dipilih;</li><li>Membela diri;</li><li>Imunitas;</li><li>Protokoler;</li></ul><p>6) Keuangan dan administrastif</p><h2>B. Presiden</h2><p>Kedudukan:</p><ul><li>Sebagai pengemban amanat rakyat yang mempunyai kedudukan: selaku Kepala Pemerintahan (fungsi eksekutif dan fungsi legislatif) dan Kepala Negara;</li><li>Dipilih secara langsung oleh rakyat dalam suatu pemilihan umum;</li><li>Memegang jabatan selama lima tahun dan sesudahnya dapat dipilih kembali dalam jabatan yang sama untuk satu kali;</li><li>Dapat diberhentikan dari jabatannya oleh MPR atas usul DPR berdasarkan putusan Mahkamah Konstitusi;</li><li>Tidak dapat membekukan atau membubarkan DPR;</li><li>Jika mangkat, berhenti, diberhentikan, atau tidak dapat melakukankewajibannya dalam masa jabatannya diganti Wakil Presiden sampai habis masa jabatannya;</li><li>Jika mangkat, berhenti, diberhentikan, atau tidak dapat melakukan kewajibannya dalam masa jabatannya dalam waktu yang bersamaan, maka Pelaksana Tugas Kepresidenan adalah Menteri Luar Negeri, Menteri Dalam Negeri, dan Menteri Pertahanan secara bersama-sama.</li></ul><p>Tugas dan wewenangnya selaku Kepala Pemerintahan (fungsi eksekutif dan fungsi legislatif):</p><ul><li>Menjalankan kekuasaan pemerintahan negara menurut Undang-undang Dasar;</li><li>Menetapkan Peraturan Pemerintah untuk menjalankan undang-undang sebagaimana mestinya;</li><li>Mengajukan dan membahas rancangan undang-undang bersama DPR;</li><li>Menetapkan Peraturan Pemerintah Pengganti Undang-undang (Perpu);</li><li>Mengajukan dan membahas usul RAPBN bersama DPR.</li></ul><p>Tugas dan wewenangnya sebagai Kepala Negara:</p><ul><li>Memegang kekuasaan tertinggi atas Angkatan Darat, Angkatan Laut, dan Angkatan Udara;</li><li>Dengan persetujuan DPR, menyatakan perang, membuat perdamaian dan perjanjian internasional dengan negara lain;</li><li>Menyatakan keadaan bahaya, yang syarat-syarat dan akibatnya ditetapkan dengan undang-undang;</li><li>Dengan memperhatikan pertimbangan Dewan Perwakilan Rakyat, mengangkat duta dan konsul, dan menerima penempatan duta negara lain;</li><li>Dengan memperhatikan pertimbangan Mahkamah Agung, memberi grasi dan rehabilitasi;</li><li>Dengan memperhatikan pertimbangan Dewan Perwakilan Rakyat, memberi amnesti dan abolisi;</li><li>Memberi gelaran, tanda jasa dan lain-lain tanda kehormatan sesuai dengan undang- undang;</li><li>Membentuk suatu dewan pertimbangan yang bertugas memberikan nasehat dan pertimbangan kepada Presiden;</li><li>Mengangkat dan memberhentikan menteri-menteri negara.</li></ul><h2>C. Dewan Perwakilan Rakyat (Dpr)</h2><p>Kedudukan:</p><ul><li>Sebagai Lembaga Negara;</li><li>Susunannya diatur dalam undang-undang;</li><li>Anggota DPR dipilih melalui pemilihan umum;</li><li>Seluruh anggota DPR adalah anggota MPR;</li><li>DPR tidak dapat dibekukan atau dibubarkan oleh Presiden;</li><li>Anggota DPR dapat diberhentikan dari jabatannya yang diatur dalam undang-undang.</li></ul><p>Tugas dan wewenang:</p><ul><li>Bersidang sedikitnya sekali dalam setahun;</li><li>Membentuk undang-undang yang dibahas dengan Presiden untuk mendapat persetujuan bersama;</li><li>Membahas dan memberikan persetujuan peraturan pemerintah penggati undang- undang;</li><li>Menerima dan membahas usulan RUU yang diajukan DPD yang berkaitan dengan bidang tertentu dan mengikutdankan dalam pembahasan;</li><li>Memperhatikan pertimbangan DPD atas RUU APBN dan RUU yang berkaitan dengan Pajak, pendidikan, dan agama;</li><li>Menetapkan APBN bersama Presiden dengan memperhatikan pertimbangan DPD;</li><li>Melaksanakan pengawasan terhadap pelaksanaan UU, APBN, dan kebijakan pemerintah;</li><li>Membahas dan menindaklanjuti hasil pengawasan yang diajukan oleh DPD terhadap pelaksanaan UU mengenai otonomi daerah, pembentukan, pemekaran, dan penggabungan daerah, sumber daya alam dan sumber Daya ekonomi lainnya, pelaksanaan APBN, pajak, pendidikan, dan agama;</li><li>Memilih anggota Badan Pemeriksa Keuangan dengan memperhatikan pertimbangan DPD;</li><li>Membahas dan menindaklanjuti hasil pemeriksaan atas pertanggungjawaban keuangan negara yang disampaikan BPK;</li><li>Memberikan persetujuan kepada Presiden atas pengangkatan daN pemberhentian anggota Komisi Yudisial;</li><li>Memberikan persetujuan calon hakim agung yang diusulkan Komisi Yudisial untuk ditetapkan sebagai hakim agung oleh Presiden;</li><li>Memilih tiga orang calon anggota hakim konstitusi dan mengajukannya kepada Presiden untuk ditetapkan;</li><li>Memberikan pertimbangan kepada Presiden untuk mengangkat duta, menerima penempatan duta negara lain, dan memberikan pertimbangan dalam pemberian amnesti dan abolisi;</li><li>Memberikan persetujuan kepada Presiden untuk menyatakan perang, membuat perdamaian, dan perjanjian dengan negara lain, dan membuat perjanjian internasional lainnya yang menimbulkan akibat yang luas daN mendasar bagi kehidupan rakyat yang terkait dengan beban keuangan negara dan/atau pembentukan UU.</li></ul><h2>D. Dewan Perwakilan Daerah</h2><p>Kedudukan :</p><ul><li>DPD adalah lembaga perwakilan daerah yang berkedudukan sebagai lembaga negara;</li><li>Anggota DPD dipilih dari setiap provinsi melalui pemilihan umum;</li><li>Jumlah anggota DPD di setiap provinsi sama dan jumlah seluruh anggota DPD tidak boleh lebih dari 1/3 dari jumlah anggota DPR;</li><li>Seluruh anggota DPD adalah anggota MPR;</li><li>Anggota DPD dapat diberhentikan dari jabatannya, yang syarat-syarat dan tatacaranya diatur dalam undang-undang.</li></ul><p>Tugas dan Wewenang:</p><ul><li>Bersidang sedikitnya sekali dalam setahun;</li><li>Dapat mengajukan kepada DPR RUU yang berkaitan dengan otonomi daerah, hubungan pusat dan daerah, pembentukan dan pemekaran, dan penggabungan daerah, pengelolaan sumber daya alam dan sumber daya ekonomi lainnya dan yang berkaitan dengan perimbangan keuangan pusat dan daerah;</li><li>Membahas RUU pada huruf b tersebut bersama-sama DPR atas undangan DPR sesuai tata teritb DPR, sebelum DPR membahas RUU tersebut dengan pemerintah;</li><li>Melakukan pengawasan sebagai pertimbangan DPR atas pelaksanaan:</li></ul><p>a. Undang-undang mengenai otonomi daerah; b. Undang-undang mengenai pembentukan, pemekaran, dan penggabungan daerah; c. Undang-undang mengenai hubungan pusat dan daerah; d. Undang-undang mengenai pengelolaan sumber daya alam dan sumber daya ekonomi lainnya; e. Undang-undang mengenai pajak, pendidikan, dan agama;</p><ul><li>Memberikan pertimbangan kepada DPR atas RUU APBN dan RUU yang berkaitan dengan pajak, pendidikan, dan agama.</li><li>Memberikan pertimbangan kepada DPR dalam pemilihan anggota Badan Pemeriksa Keuangan</li></ul><h2>E. Mahkamah Agung</h2><p>Sebagai pemegang kekuasaan kehakiman dan penyelenggara peradilan yang merdeka untuk menegakkan hukum dan keadilan.</p><p>Kedudukan:</p><ul><li>Sebagai Lembaga Negara yang berfungsi sebagai pengadilan tertinggi bagi semua peradilan terlepas dari pengaruh Pemerintah dan pengaruhpengaruh lainnya;</li><li>Susunan Mahkamah Agung diatur dengan undang-undang;</li><li>Calon Hakim Agung diusulkan oleh Komisi Yudisial kepada DPR untukmendapatkan persetujuan dan ditetapkan sebagai Hakim Agung oleh Presiden;</li><li>Ketua dan Wakil Ketua Mahkamah Agung dipilih dari dan oleh Hakim Agung;</li><li>Susunan, kedudukan, keanggotaan, dan hukum acara Mahkamah Agung diatur dalam undang-undang.</li></ul><p>Tugas dan Wewenang:</p><ul><li>Memeriksa dan memutus permohonan peninjauan kembali pada tingkat pertama dan terakhir atas putusan pengadilan yang telah memperoleh kekuatan hukum tetap;</li><li>Memutus permohonan kasasi terhadap putusan pengadilan tingkat banding atau tingkat terakhir dari semua lingkungan peradilan;</li><li>Menguji secara materil terhadap peraturan perundangan di bawah undang- undang terhadap undang-undang;</li><li>Memberikan pertimbangan kepada Presiden dalam memberikan grasi dan rehabilitasi.</li></ul><h2>F. Komisi Yudisial (Ky)</h2><p>Kedudukan:</p><ul><li>Bersifat mandiri;</li><li>Diangkat dan diberhentikan oleh Presiden dengan persetujuan DPR;</li><li>Susunan, kedudukan, dan keanggotaan Komisi Yudisial diatur dengan undang-undang.</li></ul><p>Tugas dan wewenang:</p><ul><li>Mengusulkan pengangkatan Hakim Agung;</li><li>Memiliki wewenang lain untuk menjaga dan menegakkan kehormatan, keluhuran martabat, dan perilaku hakim.</li></ul><h2>G. Mahkamah Konstitusi (Mk)</h2><p>Kedudukan :</p><ul><li>Mahkamah Konstitusi adalah salah satu lembaga negara yangmelakukan kekuasaan kehakiman yang merdeka untuk menyelenggarakan peradilan guna menegakkan hukum dan keadilan;</li><li>Susunan Mahkamah Konstitusi diatur dalam undang-undang;</li><li>Mempunyai sembilan orang anggota Hakim Konstitusi yang diusulkan oleh masing- masinG Presiden tiga orang, DPR tiga orang, dan Mahkamah Agung tiga orang;</li><li>Ketua dan Wakil Ketua dipilih dari dan oleh Hakim Konstitusi.</li></ul><p>Tugas dan Wewenang:</p><ul><li>Menguji undang-undang terhadap Undang-Undang Dasar Negara Republik Indonesia 1945</li><li>Memutus sengketa kewenangan lembaga negara yang kewenangannya diberikan oleh Undang-Undang Dasar Negara Republik Indonesia 1945;</li><li>Memutus pembubaran partai politik;</li><li>Memutus perselisihan hasil pemilihan umum;</li><li>Memberikan putusan atas pendapat DPR bahwa Presiden dan/atau Wakil Presiden diduga telah melakukan pelanggaran hukum berupa penghianatan terhadap negara, korupsi, penyuapan, tindak pidana berat lainnya, atau perbuatan tercela, dan/atau tidak lagi memenuhi syarat sebagai Presiden dan/atau Wakil Presiden, paling lama sembilan puluh hari.</li></ul><h2>H. Badan Pemeriksa Keuangan (Bpk)</h2>",
    "keys": [
      "Kelembagaan negara adalah lembaga-lembaga negara yang diatur dalam UUD 1945 setelah amandemen, meliputi MPR, Presiden, DPR, DPD, MA, MK, dan BPK.",
      "Sebagai Lembaga Negara, dengan susunan keanggotaan terdiri dari anggota DPR dan DPD hasil pemilihan umum;",
      "1) Bersidang sedikitnya sekali dalam lima tahun; 2) Mengubah dan menetapkan undang-undang dasar. Usul perubahan secara tertulis diajukan oleh sekurang-kurangnya 1/3 dari jumlah anggota MPR, sidang dihadiri sekurang-kurangnya 2/3 dari jumlah anggota MPR, dan putusan dilakukan dengan persetujuan sekurang-kurangnya 50% + 1."
    ],
    "questions": [
      {
        "answer": "A",
        "tag": "SOAL 1",
        "text": "Lembaga yang memeriksa pengelolaan dan tanggung jawab keuangan negara adalah …",
        "explanation": "BPK memiliki fungsi pemeriksaan terhadap pengelolaan dan tanggung jawab keuangan negara.",
        "options": [
          {
            "value": "A",
            "text": "BPK"
          },
          {
            "value": "B",
            "text": "KY"
          },
          {
            "value": "C",
            "text": "DPD"
          },
          {
            "value": "D",
            "text": "MK"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 2",
        "text": "Lembaga yang berperan mengusulkan pengangkatan Hakim Agung adalah …",
        "explanation": "Kewenangan tersebut merupakan salah satu tugas Komisi Yudisial.",
        "options": [
          {
            "value": "A",
            "text": "KY"
          },
          {
            "value": "B",
            "text": "DPR"
          },
          {
            "value": "C",
            "text": "BPK"
          },
          {
            "value": "D",
            "text": "DPD"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 3",
        "text": "DPR memiliki fungsi utama yang mencakup …",
        "explanation": "Materi membahas fungsi DPR dalam pembentukan UU, anggaran, dan pengawasan.",
        "options": [
          {
            "value": "A",
            "text": "Legislasi, anggaran, dan pengawasan"
          },
          {
            "value": "B",
            "text": "Kasasi, grasi, dan rehabilitasi"
          },
          {
            "value": "C",
            "text": "Pemeriksaan keuangan saja"
          },
          {
            "value": "D",
            "text": "Pengujian peraturan daerah saja"
          }
        ]
      }
    ]
  },
  {
    "id": "m11",
    "stageNumber": "TAHAP 12",
    "title": "Integritas dan Nilai-Nilainya",
    "content": "<h2>Apa Itu Integritas?</h2><p>Integritas adalah bertindak dengan cara yang konsisten dengan apa yang dikatakan. Nilai integritas adalah kesatuan antara pola pikir, perasaan, ucapan, dan perilaku yang selaras dengan hati nurani dan norma yang berlaku.</p><p>Integritas adalah salah satu nilai-nilai dasar pribadi yang harus dimiliki masyarakat yakni dengan bersikap, berperilaku dan bertindak jujur terhadap diri sendiri dan lingkungan, konsisten dalam bersikap dan bertindak, memiliki komitmen terhadap misi pemberantasan korupsi, objektif terhadap permasalahan, berani dan tegas dalam mengambil keputusan dan resiko kerja, disiplin dan bertanggung jawab dalam menjalankan tugas dan amanah. Nilai-nilai dapat berasal dari nilai kode etik di tempat dia bekerja, nilai masyarakat atau nilai moral pribadi (SKKNI, 2016)</p><p>Manfaat Integritas dalam menjalani kehidupan: 1) Manfaat Materi: orang yang berintegritas cenderung mengalami keuntungan materi. Misalnya, merasa lebih sehat dan lincah saat melakukan aktivitas. 2) Manfaat Intelektual: integritas seringkali lebih mampu memaksimalkan kemampuan intelektual seseorang 3) Manfaat Emosional: ecara umum orang yang berintegritas juga memiliki motivasi, disiplin diri, solidaritas yang besar, empati, simpati, dan kestabilan emosi. 4) Manfaat spiritual: integritas menjadikan seseorang lebih bijak dalam memaknai seluruh pengalaman hidupnya. 5) Manfaat Sosial sosial: integritas seseorang memfasilitasi terjalinnya hubungan baik dengan orang lain dan kerjasama dalam masyarakat</p><h2>Nilai-Nilai Integritas</h2><p>Komisi Pembarantasan Korupsi (KPK) merumuskan ada 9 sikap integritas yang harus ada di dalam diri seseorang supaya terhindar dari melakukan korupsi. Selanjutnya 9 sikap tersebut dibagi lagi ke dalam 3 aspek yaitu Integritas Inti, Integritas Sikap dan Integritas Etos Kerja sebagai berikut:</p><p>NILAI INTI NILAI SIKAP NILAI ETOS KERJA JUJUR MANDIRI BERANI DISIPLIN KERJA KERAS ADIL TANGGUNGJAWAB SEDERHANA PEDULI</p><h2>Nilai Integritas Inti</h2><p>JUJUR TANGGUNGJAWAB DISIPLIN 1. Berintegritas “jujur” adalah 1. Orang yang bertangung 1. Disiplin adalah sikap mental lurus hati, tidak curang dan jawab adalah mereka yang untuk melakukan hal-hal tidak berbohong. Seorang berani mengakui kesalahan yang seharusnya pada saat yang jujur adalah konsisten atas apa yang yang yang tepat dan benar-benar apa yang dikatakan dan dilakukan. Mereka juga menghargai waktu. yang dilakukan, satunya amanah dan dapat 2. Disiplin berada pada diri kata dan perbuatan. diandalkan. sendiri, dirinyalah yang 2. Berintegritas jujur adalah 2. Orang yang bertanggung berjanji untuk komit pada berani menolak jawab adalah yang mau yang sudah ditetapkannya. ketidakjujuran. Memang menanggung, memikul Disiplin sangat diperlukan berat untuk melakukan hah segala akibat atas pekerjaan oleh seorang pemimpin, apa itu, tetapi harus dicoba. yang dilakukannya yang dilakukan akan</p><ul><li>Orang yang jujur adalah</li><li>Bertanggung jawab adalah dicontoh anak buahnya. orang yang berani menegur tidak mengelak, berani Disiplin adalah kunci perbuatan yang tidak menghadapi, dan kesuksesan seorang benar. Hal tersebut tidak konsekuen dengan apa yang pemimpin. mudah untuk dijalankan, dikatakan.</li><li>Contoh: menyerahkan tugas tetapi dengan niat yang tepat waktu, datang rapat kuat, akan dapat ditempuh. sesuai undangan, atau</li><li>Orang yang berintegritas laporan diserahkan pada jujur akan selalu waktunya. berpegang pada prinsip. Prinsip yang diyakini itu.</li></ul><h2>Integritas Etos Kerja</h2><p>MANDIRI KERJA KERAS SEDERHANA 1. Menurut KBBI, kata mandiri 1. Kerja keras adalah kegiatan 1. Sederhana berarti dimaknai dalam keadaan yang dikerjakan secara membebaskan segala ikatan dapat berdiri sendiri; tidak sungguh-sungguh tanpa yang tidak di perlukan. bergantung pada orang mengenal lelah atau Berbeda dengan lain. Sementara itu kemandirian berhenti sebelum target kemiskinan, kesederhanaan adalah hal atau kerja tercapai dan selalu adalah suatu pilahan, keadaan dapat berdiri mengutamakan atau keputusan untuk menjalani sendiri tanpa bergantung memperhatikan kepuasan hidup yang berfokus pada pada orang lain. hasil pada setiap kegiatan apa yang benar-benar 2. Ciri-ciri orang mandiri yang dilakukan. Kerja keras berarti. antaralain: dapat diartikan bekerja 2. Ciri-ciri orang sederhana a) Adanya tendensi untuk mempunyai sifat yang antaralain: berperilaku bebas dan bersungguh-sungguh untuk a) Tidak berlebihan, hidup berinisiatif, mampu mencapai sasaran yang wajar dan hidup bersikap dan ingin dicapai. bersahaja berpendapat. 2. Ciri-ciri orang kerja keras b) Tidak menjadikan b) Adanya tendensi untuk antaralain: keinginan sebagai percaya diri dan tidak a) Tidak bersifat malas dan kebutuhan tergantung pada orang mengeluh. c) Memiliki skala prioritas lain. b) Memiliki semangat dan dalam memenuhi c) Adanya sikap original etos kerja tinggi. kebutuhan (keaslian) yang bukan c) Tidak suka menunda- d) Hidup sederhana tidak sekedar menerima nunda pekerjaan. boros dan tidak berfoya- orang lain. d) Tidak cepat merasa foya d) Tidak mengharapkan puas. e) Menggunakan harta pengarahan dari orang e) Berusaha mengerjakan sesuai kebutuhan lain. segala sesuatu dengan e) Adanya tendensi untuk penuh rasa tanggung mencoba segala jawab. sesuatunya sendiri. f) Tetap optimis dan tidak mudah putus asa apabila menemukan suatu kegagalan.</p><h2>Integritas Sikap</h2><p>BERANI PEDULI ADIL 1. Berani adalah tidak takut 1. Peduli bermakna 1. Adil berasal dari bahasa menghadapi bahaya atau mengindahkan, Arab yang berarti berada di kesulitan. Orang yang memperhatikan, tengah-tengah, jujur, lurus, berani tidak akan takut menghiraukan. Sementara itu dan tulus. menghadapai musuh kepedulian berarti perihal 2. Secara terminologis adil Demikian juga orang yang sangat peduli, sikap bermakna suatu sikap yang berani adalah mereka yang mengindahkan bebas dari diskriminasi, berani melaporkan (memprihatinkan). ketidakjujuran. Dengan terjadinya ketidakjujuran 2. Peduli berarti kita demikian orang yang adil dan korupsi di sekitarnya. mengasihi orang lain seperti adalah orang yang sesuai 2. Berani berarti mempunyai kita mengasihi diri kita. dengan standar hukum baik hati yang mantap dan rasa 3. Peduli berarti kita hukum agama, hukum percaya diri yang besar memperlakukan orang lain positif (hukum negara), dalam menghadapi bahaya sebagaimana kita ingin ataupun hukum sosial atau kesulitan, tidak gentar, diperlakukan. (hukum adat) yang berlaku. pantang mundur, dan maju 4. Peduli berarti kita membuka 3. Adil ialah meletakkan terus. lebar-lebar pintu hati kita sesuatu pada tempatnya 3. Orang yang berani adalah demi kebahagiaan dan 4. Adil adalah menerima hak yang tidak takut kesejahteraan semua tanpa lebih dan memperlihatkan kebenaran makhluk. memberikan hak orang lain dan keadilan. tanpa kurang 5. Adil adalah memberikan hak setiap yang berhak secara lengkap tanpa lebih tanpa kurang.</p><h2>Norma Di Dalam Masyarakat</h2><p>Norma berkaitan dengan aturan yang berlaku pada masyarakat tertentu. Aturan ini berkaitan dengan tingkah laku manusia, jika melanggar dapat terkena sanksi. Norma adalah aturan atau kaidah untuk perilaku manusia yang berisi perintah, larangan, dan sanksi. Perintah ini adalah sesuatu yang harus dilakukan, sementara larangan yaitu sesuatu yang tidak boleh dilakukan. Ada beberapa jenis norma di masyarakat yaitu: 1. Norma agama: norma agama berdasarkan akidah atau aturan yang ada di dalam agama. Norma ini sifatnya mutlak dan penganutnya harus menaati aturan dalam agama tersebut. Jika tidak seseorang akan kehilangan iman dan keyakinan. Contoh norma agama yaitu beribadah sesuatu dengan keyakinan, berdoa, melakukan hal positif, mematuhi orang tua, dilarang membunuh, mencuri, dan menipu. 2. Norma Kesusilaan: norma ini berdasarkan hati nurani atau akhlak manusia dan sifatnya umum. Arti umum yaitu setiap orang memilikinya meski bentuknya bisa berbeda. Norma kesusilaan berkaitan dengan nilai kemanusiaan. Jika melanggar akan terjerat hukum pidana dan sanksi di masyarakat. Contoh kasus yang melanggar norma kesusilaan yaitu penghianatan, pelecehan seksual, penyimpangan perilaku yang membuat masyarakat menolak seseorang. 3. Norma Kesopanan: norma kesopanan dari tingkah laku masyarakat yang berlaku di daerah tertentu. Norma ini bersifat relatif, artinya penerapannya bisa berbeda satu sama lain. Contoh</p>",
    "keys": [
      "Integritas adalah bertindak dengan cara yang konsisten dengan apa yang dikatakan. Nilai integritas adalah kesatuan antara pola pikir, perasaan, ucapan, dan perilaku yang selaras dengan hati nurani dan norma yang berlaku.",
      "Integritas adalah salah satu nilai-nilai dasar pribadi yang harus dimiliki masyarakat yakni dengan bersikap, berperilaku dan bertindak jujur terhadap diri sendiri dan lingkungan, konsisten dalam bersikap dan bertindak, memiliki komitmen terhadap misi pemberant…",
      "Manfaat Integritas dalam menjalani kehidupan: 1) Manfaat Materi: orang yang berintegritas cenderung mengalami keuntungan materi. Misalnya, merasa lebih sehat dan lincah saat melakukan aktivitas. 2) Manfaat Intelektual: integritas seringkali lebih mampu memaksi…"
    ],
    "questions": [
      {
        "answer": "A",
        "tag": "SOAL 1",
        "text": "Integritas pada intinya menuntut kesesuaian antara …",
        "explanation": "Materi menggambarkan integritas sebagai keselarasan pola pikir, perasaan, ucapan, dan perilaku dengan nilai/norma.",
        "options": [
          {
            "value": "A",
            "text": "Pikiran, perasaan, ucapan, dan tindakan"
          },
          {
            "value": "B",
            "text": "Jabatan dan gaji"
          },
          {
            "value": "C",
            "text": "Hobi dan pekerjaan"
          },
          {
            "value": "D",
            "text": "Pendapat pribadi dan kelompok"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 2",
        "text": "Yang termasuk nilai inti integritas adalah …",
        "explanation": "Tiga nilai tersebut termasuk kelompok nilai integritas inti dalam materi.",
        "options": [
          {
            "value": "A",
            "text": "Jujur, tanggung jawab, disiplin"
          },
          {
            "value": "B",
            "text": "Hedonisme, konsumtif, individualisme"
          },
          {
            "value": "C",
            "text": "Fanatisme, eksklusivisme, egoisme"
          },
          {
            "value": "D",
            "text": "Kompetisi, popularitas, kekuasaan"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 3",
        "text": "Sikap yang berani melaporkan ketidakjujuran termasuk nilai …",
        "explanation": "Nilai sikap berani dikaitkan dengan keberanian menghadapi dan melaporkan tindakan yang salah.",
        "options": [
          {
            "value": "A",
            "text": "Berani"
          },
          {
            "value": "B",
            "text": "Sederhana"
          },
          {
            "value": "C",
            "text": "Mandiri"
          },
          {
            "value": "D",
            "text": "Peduli lingkungan"
          }
        ]
      }
    ]
  },
  {
    "id": "m12",
    "stageNumber": "TAHAP 13",
    "title": "Kode Etik ASN dan Pemberantasan Korupsi",
    "content": "<p>norma kesopanan yaitu: Siswa tidak memakai perhiasan dan riasan terlalu mencolok ketika sekolah. Mengucapkan terimakasih setelah mendapatkan bantuan. Meminta maaf jika berbuat salah kepada orang lain. Tidak memakai pakaian dan riasan yang berlebihan ketika menghadiri pemakaman. 4. Norma Hukum: norma hukum berfungsi mengatur tata tertib di suatu negara. Masyarakat akan mendapat sanksi jika melanggar aturan yang sudah ditetapkan dalam negara. Sanksi ini dilakukan oleh lembaga pemerintah resmi. Ciri-ciri norma hukum yaitu diakui oleh masyarakat, adanya penegak hukum, dan pihak berwenang yang memberi sanksi. Tujuan dari norma hukum ini untuk menciptakan lingkungan yang tertib dan aman.</p><p>KODE ETIK DAN KODE PRILAKU ASN Sebagai abdi negara, aparatur sipil negara (ASN) harus mematuhi kode etik yang telah ditentukan peraturan perundang-undangan. Kode etik ASN adalah pedoman sikap, tingkah laku, dan perbuatan ASNl di dalam melaksanakan tugasnya dan pergaulan hidup sehari-hari. Adanya kode etik ini ditujukan untuk menjaga martabat dan kehormatan ASN.</p><p>Secara umum, kode etik ASN tertuang dalam UU Nomor 5 Tahun 2014 tentang Aparatur Sipil Negara. Undang-undang ini menyebut kode etik bersamaan dengan kode perilaku. Kode etik dan kode perilaku yang tertuang dalam UU ASN berisi pengaturan perilaku supaya pegawai ASN:</p><ul><li>melaksanakan tugasnya dengan jujur, bertanggung jawab, dan berintegritas tinggi;</li><li>melaksanakan tugasnya dengan cermat dan disiplin;</li><li>melayani dengan sikap hormat, sopan, dan tanpa tekanan;</li><li>melaksanakan tugasnya sesuai dengan ketentuan peraturan perundang-undangan;</li><li>melaksanakan tugasnya sesuai dengan perintah atasan atau pejabat yang berwenang sejauh tidak bertentangan dengan ketentuan peraturan perundang-undangan dan etika pemerintahan; menjaga kerahasiaan yang menyangkut kebijakan negara;</li><li>menggunakan kekayaan dan barang milik negara secara bertanggung jawab, efektif, dan efisien;</li><li>menjaga supaya tidak terjadi konflik kepentingan dalam melaksanakan tugasnya;</li><li>memberikan informasi secara benar dan tidak menyesatkan kepada pihak lain yang memerlukan informasi terkait kepentingan kedinasan;</li><li>tidak menyalahgunakan informasi intern negara, tugas, status, kekuasaan, dan jabatannya untuk mendapat atau mencari keuntungan atau manfaat bagi diri sendiri atau untuk orang lain;</li><li>memegang teguh nilai dasar ASN dan selalu menjaga reputasi dan integritas ASN;</li><li>dan melaksanakan ketentuan peraturan perundang-undangan mengenai disiplin Pegawai ASN.</li></ul><p>Dalam menjalankan tugasnya dalam pemerintahan, setiap pegawai wajib berpikir, berkata, berperilaku, dan bertindak dengan baik dan benar dan mengikuti kode etik dan prinsip-prinsip moral berikut: a) Tidak memperlihatkan gaya hidup hedonisme di depan sesama pegawai b) Tidak dengan sengaja bersikap, berkata, dan berperilaku yang tidak sesuai dengan identitas seksual yang bersangkutan c) Senantiasa bijak dalam penggunaan media sosial d) Tidak memasuki tempat yang dipandang tidak pantas secara etika dan moral yang berlaku di masyarakat e) Tidak dengan sengaja menemui pihak-pihak yang berpotensi menimbulkan konflik kepentingan kecuali dengan penugasan</p><p>f) Tidak bertindak sewenang-wenang, melakukan bullying dan/atau pelecehan terhadap pegawai pihak lain di dalam ataupun di luar lingkungan kerja</p><p>TRISULA PEMBERANTASAN KORUPSI Memberantas korupsi di Indonesia bukan pekerjaan mudah dan perlu kerja berkelanjutan yang melibatkan semua pihak. Ada tiga strategi pemberantasan korupsi yang tengah dijalankan di Indonesia, KPK menyebutnya: Trisula Pemberantasan Korupsi. Layaknya trisula yang memiliki tiga ujung tajam, Trisula Pemberantasan Korupsi memiliki tiga strategi utama, yaitu Penindakan, Pencegahan, dan Pendidikan. Sula Penindakan menyasar peristiwa hukum yang secara aktual telah memenuhi unsur tindak pidana korupsi sesuai undang-undang. Sula ini tidak hanya mengganjar hukuman penjara dan denda bagi para pelaku korupsi, tapi juga memberikan efek jera bagi para korupsi dan masyarakat. Sementara Sula Pencegahan adalah perbaikan sistem untuk menutup celah-celah korupsi, dilengkapi oleh sosialisasi dan kampanye antikorupsi melalui Sula Pendidikan. 1. Sula Penindakan Sula Penindakan adalah strategi represif KPK dalam menyeret koruptor ke meja hijau, membacakan tuntutan, dan menghadirkan saksi-saksi dan alat bukti yang menguatkan. Strategi ini terdiri dari beberapa tahapan, yaitu penanganan laporan aduan masyarakat, penyelidikan, penyidikan, penuntutan, hingga eksekusi. Pengaduan masyarakat adalah sumber informasi yang sangat penting bagi upaya pemberantasan korupsi. Karena itulah, KPK memperkuat whistleblowing system yang menguatkan masyarakat mengadukan tindak pidana korupsi. Pengaduan masyarakat atas dugaan tindak pidana korupsi bisa dilakukan di situs KPK. KPK akan melakukan proses verifikasi dan penelaahan untuk memastikan apakah sebuah aduan bisa ditindaklanjuti ke tahap penyelidikan. Di tahap penyelidikan, KPK akan mencari sekurang- kurangnya dua alat bukti untuk melanjutkan kasus ke proses penyidikan. Pada tahap ini, salah satunya ditandai dengan ditetapkannya seseorang menjadi tersangka. Selanjutnya adalah tahap penuntutan dan pelimpahan ke Pengadilan Tindak Pidana Korupsi. Tahapan berikutnya adalah pelaksanaan putusan pengadilan. Eksekusi yang telah memperoleh kekuatan hukum tetap, dilakukan oleh jaksa. 2. Sula Pencegahan Harus diakui masih banyak sistem di Indonesia yang membuka peluang terjadinya korupsi. Misalnya, rumitnya prosedur pelayanan publik atau berbelitnya proses perizinan hingga memicu terjadinya penyuapan dan penyalahgunaan kekuasaan. Sistem dengan celah korupsi juga kerap terjadi pada proses pengadaan barang dan jasa yang sarat konflik kepentingan. Sula Pencegahan mencakup perbaikan pada sistem hingga meminimalisasi terjadinya tindak pidana korupsi. Pada strategi ini, KPK akan melakukan berbagai kajian untuk kemudian memberikan rekomendasi kepada kementerian atau lembaga terkait untuk melakukan langkah perbaikan. Di antara perbaikan yang bisa dilakukan misalnya, pelayanan publik yang dibuat transparan melalui sistem berbasis online atau sistem pengawasan terintegrasi. KPK juga menguatkan penataan layanan publik melalui koordinasi dan supervisi pencegahan (korsupgah), dan transparansi penyelenggara negara (PN).</p>",
    "keys": [
      "norma kesopanan yaitu: Siswa tidak memakai perhiasan dan riasan terlalu mencolok ketika sekolah. Mengucapkan terimakasih setelah mendapatkan bantuan. Meminta maaf jika berbuat salah kepada orang lain. Tidak memakai pakaian dan riasan yang berlebihan ketika men…",
      "KODE ETIK DAN KODE PRILAKU ASN Sebagai abdi negara, aparatur sipil negara (ASN) harus mematuhi kode etik yang telah ditentukan peraturan perundang-undangan. Kode etik ASN adalah pedoman sikap, tingkah laku, dan perbuatan ASNl di dalam melaksanakan tugasnya dan…",
      "Secara umum, kode etik ASN tertuang dalam UU Nomor 5 Tahun 2014 tentang Aparatur Sipil Negara. Undang-undang ini menyebut kode etik bersamaan dengan kode perilaku. Kode etik dan kode perilaku yang tertuang dalam UU ASN berisi pengaturan perilaku supaya pegawai…"
    ],
    "questions": [
      {
        "answer": "A",
        "tag": "SOAL 1",
        "text": "Penggunaan barang milik negara secara bertanggung jawab termasuk bagian dari …",
        "explanation": "Materi kode etik ASN menekankan penggunaan kekayaan/barang milik negara secara bertanggung jawab.",
        "options": [
          {
            "value": "A",
            "text": "Kode etik/perilaku ASN"
          },
          {
            "value": "B",
            "text": "Primordialisme"
          },
          {
            "value": "C",
            "text": "Separatisme"
          },
          {
            "value": "D",
            "text": "Chauvinisme"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 2",
        "text": "Trisula pemberantasan korupsi terdiri atas …",
        "explanation": "Tiga strategi yang dibahas adalah penindakan, pencegahan, dan pendidikan.",
        "options": [
          {
            "value": "A",
            "text": "Penindakan, Pencegahan, Pendidikan"
          },
          {
            "value": "B",
            "text": "Legislasi, Pemilu, Diplomasi"
          },
          {
            "value": "C",
            "text": "Pengawasan, Mediasi, Rehabilitasi"
          },
          {
            "value": "D",
            "text": "Penangkapan, Pembinaan, Rekonsiliasi"
          }
        ]
      },
      {
        "answer": "A",
        "tag": "SOAL 3",
        "text": "Pencegahan korupsi terutama diarahkan untuk …",
        "explanation": "Materi menjelaskan pencegahan sebagai upaya memperbaiki sistem dan menutup peluang korupsi.",
        "options": [
          {
            "value": "A",
            "text": "Menutup celah dan memperbaiki sistem"
          },
          {
            "value": "B",
            "text": "Menghapus semua aturan"
          },
          {
            "value": "C",
            "text": "Menghukum semua pegawai"
          },
          {
            "value": "D",
            "text": "Mengurangi transparansi"
          }
        ]
      }
    ]
  },
  {
    "id": "m13",
    "stageNumber": "TAHAP 14",
    "title": "Bahasa Indonesia: Ejaan dan Penulisan",
    "content": "<h2>Penggunaan Huruf Kapital</h2><p>Huruf kapital digunakan sebagai huruf pertama awal kalimat. Misalnya: a) Apa maksudnya? b) Tolong ambilkan buku itu! c) Kita harus bekerja keras. d) Pekerjaan itu akan selesai dalam 1 jam.</p><p>Huruf kapital digunakan sebagai huruf pertama unsur nama orang, termasuk julukan. Misalnya: a) Amir Hamzah b) Dewi Sartika c) André-Marie Ampère d) James Watt</p><p>Huruf kapital tidak digunakan sebagai huruf pertama nama orang yang digunakan sebagai nama jenis atau satuan ukuran. Misalnya: a) 5 ampere b) 15 watt c) ikan mujair d) mesin diesel</p><p>Huruf kapital digunakan pada nama orang seperti pada nama teori, hukum, dan rumus. Misalnya: a) teori Darwin b) hukum Archimedes c) rumus Phytagoras</p><p>Huruf kapital tidak digunakan untuk menuliskan huruf pertama kata yang bermakna &#x27;anak dari&#x27;, seperti bin, binti, boru, dan van, kecuali dituliskan sebagai awal nama atau huruf pertama kata tugas dari. Misalnya: a) Abdul Rahman bin Zaini b) Fatimah binti Salim c) Ayam Jantan dari Timur d) Charles Adriaan van Ophuijsen</p><p>Huruf kapital digunakan pada awal kalimat dalam petikan langsung. Misalnya: a) Ibu berpesan, &quot;Berhati-hatilah, Nak!&quot; b) &quot;Mereka berhasil meraih medali emas,&quot; katanya. c) &quot;Besok pagi,&quot; kata Rino, &quot;mereka akan berangkat.&quot;</p><p>Huruf kapital digunakan sebagai huruf pertama dalam hal tertentu yang berkaitan dengan nama agama, kitab suci, dan Tuhan, termasuk sebutan dan kata ganti Tuhan dan singkatan nama Tuhan. Misalnya: a) Buddha, Hindu, Islam, Al-Qur&#x27;an, Alkitab, Weda b) Allah Yang Maha Kuasa akan memperlihatkan jalan-Nya. c) Ya, Tuhan, bimbinglah hamba ke jalan yang Engkau beri rahmat.</p><p>Huruf kapital digunakan pada huruf pertama unsur nama peristiwa sejarah. Misalnya: a) Konferensi Asia Afrika b) Perang Dunia II c) Proklamasi Kemerdekaan Indonesia d) Hari Pendidikan Nasional</p><p>Huruf pertama peristiwa sejarah yang tidak digunakan sebagai nama ditulis dengan huruf nonkapital. Misalnya: a) Kami memperingati proklamasi kemerdekaan setiap tahun. b) Perlombaan senjata membawa risiko pecahnya perang dunia.</p><p>Huruf kapital digunakan sebagai huruf pertama nama geografi. Misalnya: a) Benua Afrika b) Asia Tenggara c) Dataran Tinggi Dieng d) Gunung Semeru e) Kabupaten Konawe f) Lantai II Gedung Tabrani g) Ruang Poerwadarminta Gedung Yudistira</p><p>Huruf pertama unsur geografi yang tidak diikuti nama diri ditulis dengan huruf nonkapital. Misalnya: a) berlayar ke teluk b) mandi di sungai c) menyeberangi selat d) berenang di danau Huruf pertama nama diri geografi yang digunakan sebagai nama jenis ditulis dengan huruf nonkapital. Misalnya: a) jeruk bali (Citrus maxima) b) kacang bogor (Voandzeia subterranea) c) nangka belanda (Anona muricata) d) petai cina (Leucaena glauca)</p><h2>Penggunaan Huruf Miring</h2><p>Huruf miring digunakan untuk menuliskan judul buku, judul film, judul album lagu, judul acara televisi, judul siniar, judul lakon, dan nama media massa yang dikutip dalam tulisan, termasuk dalam daftar pustaka. a) Saya sudah membaca buku Salah Asuhan karangan Abdoel Moeis. b) Majalah Poedjangga Baroe menggelorakan semangat kebangsaan. c) Berita itu muncul dalam surat kabar Cakrawala. d) Badan Pengembangan dan Pembinaan Bahasa. 2018. Kamus Besar Bahasa Indonesia. Edisi Kelima. Cetakan Kedua. Jakarta: Balai Pustaka. e) Acara Bulan Bahasa dimuat di kabarbahasa.com. f) Film Habibie dan Ainun diangkat dari kisah nyata.</p><p>Huruf miring digunakan untuk menuliskan kata atau ungkapan dalam bahasa daerah atau bahasa asing.</p><ul><li>Kita perlu memperhitungkan rencana kegiatan dengan baik supaya tidak malapeh awo.</li><li>Nama ilmiah buah manggis ialah Garcinia mangostana.</li><li>Weltanschauung bermakna &#x27;pandangan dunia&#x27;.</li><li>Ungkapan tut wuri handayani adalah semboyan pendidikan.</li><li>Istilah men sana in corpore sano sering digunakan dalam bidang olahraga.</li></ul><h2>Penulisan Kata Di</h2><ul><li>dimana atau di mana Jawaban benar : di mana.</li><li>diatas atau di atas Jawaban yang benar : di atas.</li><li>diantara atau di antara Jawaban yang benar : di antara</li><li>dibawah atau di bawah Jawaban yang benar : di bawah</li></ul><p>Kaidah ejaan dan tanda baca di atas merupakan rangkuman ketentuan penting yang sering diujikan dalam tes TWK CPNS berdasarkan Pedoman Umum Ejaan Bahasa Indonesia (EYD).</p><h2>Penulisan Judul</h2><p>Sebelum menjelaskan tentang penulisan judul yang benar, perlu dipahami beberapa fungsi judul sebagai berikut:</p><ul><li>Menggambarkan isi tulisan</li><li>Memudahkan orang mencari referensi</li><li>Bagian tulisan yang pertama yang dilihat</li></ul><p>Penulisan judul yang tepat perlu memperhatikan hal berikut: 1. Judul adalah gambaran isi sebuah tulisan 2. Menggunakan EYD yang benar 3. Setiap awal kata ditulis huruf besar kecuali kata imbuhan 4. Penggunaan huruf kapital pada kata ulang 5. Kata atau kalimat asing ditulis miring</p><p>Contoh:</p><ul><li>Pengantar Ilmu Keperawatan Judul di atas sudahlah tepat, karena tiap awalan katanya diberi huruf kapital.</li><li>Berjalan-jalan di Kota Semarang</li></ul><p>Judul di atas sudahlah tepat. Karena tiap awalan katanya diberi huruf kapital, kecuali kata berulang dan preposisi (kata yang biasanya diletakkan di depan kata benda). c) Nelly, Si Pemberani Judul di atas sudahlah tepat. Karena tiap awalan katanya menggunakan huruf kapital. d) 5 Cara Mudah Membersihkan Sepatu Judul di atas sudahlah tepat, karena tiap awalan katanya menggunakan huruf kapital. e) Pengalamanku Memelihara Kura-Kura Judul di atas sudahlah tepat, karena tiap awal katanya diberi huruf kapital. Untuk kata &#x27;kura- kura&#x27; memang menggunakan huruf kapital karena termasuk kata ulang murni. f) Efektivitas Work From Home (WFH) di Yogyakarta Judul di atas sudah tepat karena tiap awal kata ditulis kapital, imbuhan di diitulis kata kecil dan kata asing ditulis miring.</p><h2>Penulisan Daftar Pustaka</h2><p>Umumnya, daftar pustaka ditulis berdasarkan urutan berikut:</p><ul><li>Nama Penulis: Nama penulis disebutkan sebagai elemen pertama. Penulisannya dimulai dengan nama belakang atau nama keluarga, diikuti oleh tanda koma (,) dan nama depan dan nama tengah (jika ada).</li><li>Tahun Terbit: Setelah nama penulis, langkah berikutnya adalah mencantumkan tahun terbit tulisan. Tahun terbit buku biasanya dapat ditemukan di halaman awal setelah halaman judul. Sementara itu, tahun terbit artikel jurnal dan makalah biasanya tertera di header bagian atas.</li><li>Judul Buku atau Artikel yang Dirujuk: Unsur berikutnya adalah judul tulisan yang dirujuk. Judul harus ditulis secara lengkap sesuai dengan yang tercantum pada sumber, baik itu berupa buku, artikel jurnal, makalah, atau sumber lainnya.</li><li>Nama Penerbit: Setelah mencantumkan judul tulisan, informasi berikutnya adalah nama penerbit. Nama penerbit buku biasanya dijumpai di sampul depan, sampul belakang, atau pada halaman yang sama dengan tahun terbit buku. Jika sumbernya adalah artikel jurnal, cantumkan nama jurnal yang memuat artikel tersebut.</li><li>Tempat Terbit/Keterangan Terbitan: Langkah terakhir dalam penulisan daftar pustaka adalah mencantumkan keterangan penerbitan. Keterangan ini bisa berupa tempat terbit atau informasi lainnya yang relevan. Tempat terbit sering digunakan untuk sumber berupa buku dan biasanya dapat ditemukan di halaman yang sama dengan tahun terbit buku. Sementara itu, informasi penerbitan pada artikel jurnal atau makalah dapat berupa nomor dan volume tulisan yang mana informasinya bisa ditemukan di bagian header.</li></ul><p>CONTOH:</p><p>Cara Menulis Daftar Pustaka dari Artikel Jurnal Untuk menulis daftar pustaka dari jurnal, formatnya adalah Nama Belakang, Inisial Nama Depan dan Nama Tengah (jika ada). (Tahun Terbit). Judul Artikel. Nama Jurnal, Volume Jurnal(Issue atau Nomor), Halaman.</p><p>Penulisan daftar pustaka dari jurnal dengan satu pengarang</p><p>Contoh: Diniati, A. (2018). Konstruksi Sosial Melalui Komunikasi Intrapribadi di Lingkungan Perguruan Tinggi. Jurnal Kajian Komunikasi, 6(2), 147-159.</p><p>Penulisan daftar pustaka dari jurnal dengan lebih dari satu pengarang</p><p>Contoh: Diniati, A., Suryana, A., &amp; Bajari, A. (2022). Pengalaman Edukasi Anak tentang Perilaku Komunikasinya. Jurnal Komunikasi, 14(2), 322-345.</p><p>Cara Menulis Daftar Pustaka dari Buku Untuk menulis daftar pustaka dari buku, formatnya adalah Nama Belakang, Inisial Nama Depan dan Nama Tengah (jika ada). (Tahun). Judul Buku. Kota: Penerbit Buku.</p><p>Contoh: Putra, D. K. S. (2019). Political Social Responsibility: Dinamika Komunikasi Publik. Jakarta: Penerbit Pustaka Aksara.</p><p>Cara Menulis Daftar Pustaka dari Website Media Online</p><p>Untuk menulis daftar pustaka dari website media online, formatnya adalah Penulis/Domain Halaman Website. (Tahun, Tanggal Terbit Artikel). Judul. Tanggal Diaksesnya, Tautan Website.</p><p>Contoh: Sanjaya, A. (2023, 20 Oktober). Transformasi Tata Kelola Publik Digital di Era Modern. Diakses pada 25 Oktober 2023.</p><p>Cara Menulis Daftar Pustaka dari Video / Media Digital</p><p>Untuk menulis daftar pustaka dari media digital, formatnya adalah Nama Pembuat/Lembaga. (Tahun, Tanggal Unggahan). Judul Unggahan [Format Media]. Jenis Media Sosial. Tautan</p><p>Contoh: Humas Nasional. (2023, 17 Agustus). Peringatan Hari Kemerdekaan Republik Indonesia ke-78. [Video]. Dokumentasi Resmi Kenegaraan.</p><h2>Penulisan Gelar</h2><h2>Aturan Penulisan Gelar Adalah Sebagai Berikut:</h2><p>1. Cara penulisan gelar bisa di belakang ataupun di depan nama.</p><p>2. Setiap unsur singkatan gelar ditulis dengan diawali huruf kapital dan diakhiri dengan tanda titik (.), kecuali untuk beberapa singkatan khusus yang sudah dibakukan.</p>\n<p>3. Antara nama orang dan gelar akademik yang mengikutinya dibubuhkan tanda koma (,).</p>\n<p>4. Jika seseorang memiliki lebih dari satu gelar akademik, di antara gelar-gelar tersebut dipisahkan dengan tanda koma (,).</p>\n<p>5. Gelar kehormatan, keturunan, keagamaan, profesi, atau jabatan yang diikuti nama orang ditulis dengan huruf kapital di awal kata dan diakhiri titik jika disingkat, tanpa tanda koma sebelum nama diri.</p>\n<p><strong>Contoh Penulisan Gelar yang Tepat:</strong></p>\n<ul>\n  <li>S.Pd. (Sarjana Pendidikan), S.E. (Sarjana Ekonomi), S.Kom. (Sarjana Komputer), S.H. (Sarjana Hukum)</li>\n  <li>M.Si. (Magister Sains), M.M. (Magister Manajemen), M.Pd. (Magister Pendidikan), M.T. (Magister Teknik)</li>\n  <li>Dr. (Doktor - S3), dr. (dokter medis), drg. (dokter gigi), Ir. (Insinyur), Prof. (Profesor)</li>\n  <li>Contoh dalam nama lengkap: <em>Dr. Ir. Budi Raharjo, M.T., Ph.D.</em> atau <em>Dra. Hj. Nur Aini, M.Pd.</em></li>\n</ul>",
    "keys": [
      "Huruf kapital dipakai sebagai huruf pertama awal kalimat, unsur nama orang/gelar kehormatan yang diikuti nama, nama agama/kitab suci/Tuhan, dan nama peristiwa sejarah resmi.",
      "Huruf miring dipakai untuk menuliskan judul buku/majalah/surat kabar yang dikutip dalam tulisan, serta kata atau ungkapan dalam bahasa daerah atau bahasa asing.",
      "Kata depan 'di' ditulis terpisah dari kata yang mengikutinya (menunjukkan tempat/arah), sedangkan imbuhan/awalan 'di-' ditulis serangkai dengan kata dasarnya (bentuk pasif).",
      "Penulisan gelar di belakang nama dipisahkan dengan tanda koma (,) dari nama orang, dan setiap singkatan gelar menggunakan tanda titik (.) di setiap unsurnya."
    ],
    "questions": [
      {
        "tag": "SOAL 1",
        "text": "Penulisan nama lengkap beserta gelar akademik berikut yang paling tepat sesuai kaidah EYD adalah …",
        "options": [
          {
            "value": "A",
            "text": "Ir. Hendra Wijaya, S.T., M.T."
          },
          {
            "value": "B",
            "text": "Ir Hendra Wijaya S.T., M.T."
          },
          {
            "value": "C",
            "text": "Ir. Hendra Wijaya, ST, MT"
          },
          {
            "value": "D",
            "text": "Ir. Hendra Wijaya S.T, M.T"
          }
        ],
        "answer": "A",
        "explanation": "Gelar di depan nama disingkat dengan tanda titik (Ir.), gelar di belakang nama dipisahkan tanda koma dari nama dan antargelar dipisahkan koma, serta setiap singkatan gelar menggunakan tanda titik (S.T., M.T.)."
      },
      {
        "tag": "SOAL 2",
        "text": "Penulisan kata depan atau imbuhan 'di' yang benar menurut kaidah bahasa Indonesia terdapat pada kalimat …",
        "options": [
          {
            "value": "A",
            "text": "Buku materi tersebut diletakkan diatas meja belajar."
          },
          {
            "value": "B",
            "text": "Surat keputusan pengangkatan ASN telah ditandatangani oleh pejabat yang berwenang."
          },
          {
            "value": "C",
            "text": "Di mana pun kita berada, aturan kedisiplinan harus di patuhi bersama."
          },
          {
            "value": "D",
            "text": "Rapat koordinasi mingguan akan di laksanakan diruang pertemuan lantai dua."
          }
        ],
        "answer": "B",
        "explanation": "'ditandatangani' merupakan kata kerja pasif berimbuhan 'di-' sehingga ditulis serangkai/digabung. Pada pilihan A 'diatas' salah (harus 'di atas'), pada C 'di patuhi' salah (harus 'dipatuhi'), dan pada D 'di laksanakan' serta 'diruang' salah."
      },
      {
        "tag": "SOAL 3",
        "text": "Penggunaan huruf kapital yang tepat menurut kaidah EYD terdapat pada kalimat …",
        "options": [
          {
            "value": "A",
            "text": "Para peserta CPNS sedang mempelajari sejarah Perang Dunia II di perpustakaan."
          },
          {
            "value": "B",
            "text": "Ibu membeli pisang Ambon dan jeruk Bali di pasar tradisional."
          },
          {
            "value": "C",
            "text": "Kami mengunjungi paman yang tinggal di desa sukamaju, jawa barat."
          },
          {
            "value": "D",
            "text": "Presiden mengajak seluruh Rakyat Indonesia untuk menjaga persatuan bangsa."
          }
        ],
        "answer": "A",
        "explanation": "'Perang Dunia II' merupakan nama resmi peristiwa sejarah sehingga diawali huruf kapital. Pada pilihan B 'pisang ambon' dan 'jeruk bali' merupakan nama jenis buah sehingga ditulis huruf kecil. Pada pilihan C nama geografi diri harus kapital, dan pada D kata 'rakyat' bukan nama diri."
      }
    ]
  }
];
