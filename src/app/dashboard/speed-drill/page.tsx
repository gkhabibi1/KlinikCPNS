'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import MemberLayout from '@/components/MemberLayout';
import { supabase } from '@/lib/supabaseClient';
import FormattedText from '@/components/FormattedText';
import { 
  Zap, 
  Timer, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  Target, 
  Clock, 
  Flame,
  Award,
  BookOpen
} from 'lucide-react';

interface QuestionItem {
  id: string;
  category: 'TWK' | 'TIU' | 'TKP';
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  explanation: string;
  // Untuk TKP (skor bobot 1-5)
  points_a?: number;
  points_b?: number;
  points_c?: number;
  points_d?: number;
  points_e?: number;
}

// Built-in Question Pool untuk Speed Drill instan tanpa delay
const FALLBACK_QUESTIONS: QuestionItem[] = [
  {
    id: 'sd-twk-1',
    category: 'TWK',
    question_text: 'Sumpah Pemuda yang diikrarkan pada 28 Oktober 1928 merupakan hasil dari Kongres Pemuda II yang dipimpin oleh...',
    option_a: 'Soegondo Djojopoespito',
    option_b: 'R.M. Djoko Marsaid',
    option_c: 'Mohammad Yamin',
    option_d: 'Amir Sjarifoeddin',
    option_e: 'W.R. Soepratman',
    correct_answer: 'A',
    explanation: 'Kongres Pemuda II dipimpin oleh Soegondo Djojopoespito (PPPI), wakil ketua R.M. Djoko Marsaid (Jong Java), dan sekretaris Mohammad Yamin (Jong Sumatranen Bond).'
  },
  {
    id: 'sd-tiu-1',
    category: 'TIU',
    question_text: 'Jika 3x + 5 = 20, berapakah nilai dari 6x - 4?',
    option_a: '26',
    option_b: '30',
    option_c: '24',
    option_d: '32',
    option_e: '28',
    correct_answer: 'A',
    explanation: '3x = 15 -> x = 5. Maka 6x - 4 = 6(5) - 4 = 30 - 4 = 26.'
  },
  {
    id: 'sd-twk-2',
    category: 'TWK',
    question_text: 'Pemberian grasi dan rehabilitasi oleh Presiden Republik Indonesia harus memperhatikan pertimbangan dari...',
    option_a: 'Dewan Perwakilan Rakyat (DPR)',
    option_b: 'Mahkamah Agung (MA)',
    option_c: 'Mahkamah Konstitusi (MK)',
    option_d: 'Komisi Yudisial (KY)',
    option_e: 'Menteri Hukum dan HAM',
    correct_answer: 'B',
    explanation: 'Berdasarkan Pasal 14 ayat (1) UUD 1945: "Presiden memberi grasi dan rehabilitasi dengan memperhatikan pertimbangan Mahkamah Agung."'
  },
  {
    id: 'sd-tiu-2',
    category: 'TIU',
    question_text: 'MOBIL : BENSIN = MANUSIA : ...',
    option_a: 'Energi',
    option_b: 'Makanan',
    option_c: 'Oksigen',
    option_d: 'Rumah',
    option_e: 'Pakaian',
    correct_answer: 'B',
    explanation: 'Analogi sumber bahan bakar: Mobil membutuhkan bensin untuk bergerak, manusia membutuhkan makanan sebagai sumber energi utama untuk beraktivitas.'
  },
  {
    id: 'sd-tkp-1',
    category: 'TKP',
    question_text: 'Rekan kerja satu tim Anda melakukan kesalahan input data yang menyebabkan keterlambatan laporan kepada atasan. Sikap Anda adalah...',
    option_a: 'Membantunya memperbaiki kesalahan tersebut bersama-sama agar laporan lekas selesai.',
    option_b: 'Menegurnya dengan tegas agar tidak mengulangi kelalaian tersebut di masa mendatang.',
    option_c: 'Melaporkan kepada atasan bahwa keterlambatan bukan disebabkan oleh bagian tugas Anda.',
    option_d: 'Membiarkannya menyelesaikan sendiri karena itu adalah tanggung jawab pribadinya.',
    option_e: 'Menghiburnya agar tidak merasa terlalu bersalah.',
    correct_answer: 'A',
    points_a: 5,
    points_b: 3,
    points_c: 1,
    points_d: 2,
    points_e: 4,
    explanation: 'Aspek Kerja Sama dan Orientasi pada Pelayanan: Mengutamakan penyelesaian masalah tim secara proaktif dan solutif (Poin 5).'
  },
  {
    id: 'sd-tiu-3',
    category: 'TIU',
    question_text: 'Lanjutan dari deret angka berikut: 4, 9, 16, 25, 36, ...',
    option_a: '48',
    option_b: '49',
    option_c: '50',
    option_d: '64',
    option_e: '45',
    correct_answer: 'B',
    explanation: 'Pola bilangan kuadrat: 2^2, 3^2, 4^2, 5^2, 6^2, maka selanjutnya 7^2 = 49.'
  },
  {
    id: 'sd-twk-3',
    category: 'TWK',
    question_text: 'Tokoh yang mengusulkan perubahan kalimat "Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya" menjadi "Ketuhanan Yang Maha Esa" adalah...',
    option_a: 'Drs. Mohammad Hatta',
    option_b: 'Ir. Soekarno',
    option_c: 'Mr. A.A. Maramis',
    option_d: 'K.H. Wahid Hasyim',
    option_e: 'Ki Bagoes Hadikoesoemo',
    correct_answer: 'A',
    explanation: 'Mohammad Hatta berinisiatif melobi tokoh-tokoh Islam setelah menerima aspirasi perwakilan Indonesia timur demi keutuhan NKRI pada 18 Agustus 1945.'
  },
  {
    id: 'sd-tiu-4',
    category: 'TIU',
    question_text: 'Semua ilmuwan adalah orang pintar. Sebagian orang pintar gemar membaca buku. Kesimpulan yang sah adalah...',
    option_a: 'Semua orang yang gemar membaca buku adalah ilmuwan.',
    option_b: 'Sebagian ilmuwan gemar membaca buku.',
    option_c: 'Tidak ada ilmuwan yang tidak pintar.',
    option_d: 'Semua ilmuwan gemar membaca buku.',
    option_e: 'Sebagian orang pintar bukan ilmuwan.',
    correct_answer: 'C',
    explanation: 'Pernyataan "Semua ilmuwan adalah orang pintar" setara secara logika dengan "Tidak ada ilmuwan yang tidak pintar". Hubungan ilmuwan dan gemar membaca belum tentu beririsan.'
  },
  {
    id: 'sd-twk-4',
    category: 'TWK',
    question_text: 'Sikap tidak bergaya hidup mewah dan suka menghargai hasil karya orang lain merupakan wujud pengamalan Pancasila, khususnya...',
    option_a: 'Sila Pertama',
    option_b: 'Sila Kedua',
    option_c: 'Sila Ketiga',
    option_d: 'Sila Keempat',
    option_e: 'Sila Kelima',
    correct_answer: 'E',
    explanation: 'Menghargai hasil karya orang lain serta tidak bergaya hidup mewah dan boros tercantum secara tegas dalam butir-butir pengamalan Sila Kelima (Keadilan Sosial).'
  },
  {
    id: 'sd-tkp-2',
    category: 'TKP',
    question_text: 'Ketika Anda sedang terburu-buru menghadiri rapat penting, seorang warga lanjut usia meminta bantuan untuk menggunakan mesin antrean otomatis. Sikap Anda...',
    option_a: 'Dengan sabar membantunya menggunakan mesin antrean dengan cepat lalu bergegas menuju ruang rapat.',
    option_b: 'Meminta petugas keamanan terdekat untuk membantu warga tersebut.',
    option_c: 'Mengabaikannya karena rapat pimpinan jauh lebih mendesak.',
    option_d: 'Memberitahukan cara penggunaannya secara lisan sambil berjalan cepat.',
    option_e: 'Menolak dengan sopan dan meminta maaf karena sedang ada urusan dinas.',
    correct_answer: 'A',
    points_a: 5,
    points_b: 4,
    points_c: 1,
    points_d: 3,
    points_e: 2,
    explanation: 'Aspek Pelayanan Publik & Kepedulian Sosial: Membantu langsung dengan efisien menunjukkan dedikasi pelayanan tanpa mengorbankan tanggung jawab dinas.'
  }
];

export default function SpeedDrillPage() {
  const [drillState, setDrillState] = useState<'config' | 'playing' | 'result'>('config');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'TWK' | 'TIU' | 'TKP'>('ALL');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Waktu per soal (50 detik)
  const [timeLeft, setTimeLeft] = useState(50);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [index: number]: string }>({});
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<{ [index: number]: number }>({});
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  // Mulai sesi Speed Drill
  const handleStartDrill = async () => {
    let pool = [...FALLBACK_QUESTIONS];

    // Coba ambil dari database jika tersedia
    try {
      let query = supabase.from('questions').select('*');
      if (selectedCategory !== 'ALL') {
        query = query.eq('category', selectedCategory);
      }
      const { data } = await query.limit(30);
      if (data && data.length >= 5) {
        pool = data.map((q: any) => ({
          id: q.id,
          category: q.category || 'TIU',
          question_text: q.question_text || '',
          option_a: q.option_a || '',
          option_b: q.option_b || '',
          option_c: q.option_c || '',
          option_d: q.option_d || '',
          option_e: q.option_e || '',
          correct_answer: q.correct_answer || 'A',
          explanation: q.explanation || '',
          points_a: q.points_a,
          points_b: q.points_b,
          points_c: q.points_c,
          points_d: q.points_d,
          points_e: q.points_e
        }));
      }
    } catch {
      // ignore
    }

    // Filter kategori jika fallback
    if (selectedCategory !== 'ALL') {
      const filtered = pool.filter(q => q.category === selectedCategory);
      if (filtered.length > 0) pool = filtered;
    }

    // Acak soal
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, questionCount);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setTimeSpentPerQuestion({});
    setTimeLeft(50);
    setDrillState('playing');
    questionStartTimeRef.current = Date.now();
  };

  // Timer Countdown 50 Detik per soal
  useEffect(() => {
    if (drillState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Waktu habis untuk soal ini! Otomatis ke soal berikutnya
          handleAutoNext();
          return 50;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [drillState, currentIndex, questions.length]);

  // Pindah otomatis saat 50 detik habis
  const handleAutoNext = () => {
    recordCurrentTime();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(50);
      questionStartTimeRef.current = Date.now();
    } else {
      finishDrill();
    }
  };

  const recordCurrentTime = () => {
    const elapsedSeconds = Math.max(1, Math.min(50, Math.round((Date.now() - questionStartTimeRef.current) / 1000)));
    setTimeSpentPerQuestion(prev => ({
      ...prev,
      [currentIndex]: elapsedSeconds
    }));
  };

  // Pilih jawaban dan segera lanjut jika user klik opsi
  const handleSelectAnswer = (optionKey: string) => {
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionKey }));
  };

  const handleNextManual = () => {
    recordCurrentTime();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(50);
      questionStartTimeRef.current = Date.now();
    } else {
      finishDrill();
    }
  };

  // Selesaikan Speed Drill
  const finishDrill = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDrillState('result');

    // Tandai Misi Harian Speed Drill di localStorage
    try {
      const today = new Date().toISOString().split('T')[0];
      const questKey = `cpns_daily_quests_${today}`;
      const savedQuests = localStorage.getItem(questKey);
      if (savedQuests) {
        const parsed = JSON.parse(savedQuests);
        parsed.speedDrill = true;
        localStorage.setItem(questKey, JSON.stringify(parsed));
      } else {
        localStorage.setItem(questKey, JSON.stringify({ speedDrill: true }));
      }
    } catch {
      // ignore
    }
  };

  // Hitung Skor & Metrik Kecepatan
  const calculateResults = () => {
    let correctCount = 0;
    let wrongCount = 0;
    let totalScore = 0;
    let totalTime = 0;
    const wrongQuestions: any[] = [];

    questions.forEach((q, idx) => {
      const userAns = selectedAnswers[idx];
      const timeSpent = timeSpentPerQuestion[idx] || 50;
      totalTime += timeSpent;

      if (q.category === 'TKP') {
        let pts = 0;
        if (userAns === 'A') pts = q.points_a ?? 5;
        else if (userAns === 'B') pts = q.points_b ?? 4;
        else if (userAns === 'C') pts = q.points_c ?? 3;
        else if (userAns === 'D') pts = q.points_d ?? 2;
        else if (userAns === 'E') pts = q.points_e ?? 1;

        totalScore += pts;
        if (pts >= 4) correctCount++;
        else {
          wrongCount++;
          wrongQuestions.push({ ...q, userAns, timeSpent });
        }
      } else {
        if (userAns === q.correct_answer) {
          correctCount++;
          totalScore += 5;
        } else {
          wrongCount++;
          wrongQuestions.push({ ...q, userAns, timeSpent });
        }
      }
    });

    const avgTimePerQuestion = questions.length > 0 ? Math.round(totalTime / questions.length) : 50;
    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    return { correctCount, wrongCount, totalScore, totalTime, avgTimePerQuestion, accuracy, wrongQuestions };
  };

  const results = drillState === 'result' ? calculateResults() : null;

  // Simpan soal salah ke Buku Evaluasi
  const handleSaveWrongToMistakes = async () => {
    if (!results || results.wrongQuestions.length === 0) return;

    try {
      const existingLocal = localStorage.getItem('user_mistakes');
      let currentMistakes: any[] = existingLocal ? JSON.parse(existingLocal) : [];

      results.wrongQuestions.forEach(wq => {
        if (!currentMistakes.some(m => m.question_text?.trim() === wq.question_text?.trim())) {
          currentMistakes.push({
            id: `mistake-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            category: wq.category,
            question_text: wq.question_text,
            user_answer: wq.userAns || '-',
            correct_answer: wq.correct_answer,
            explanation: wq.explanation,
            options: {
              a: wq.option_a,
              b: wq.option_b,
              c: wq.option_c,
              d: wq.option_d,
              e: wq.option_e
            },
            is_mastered: false,
            created_at: new Date().toISOString()
          });
        }
      });

      localStorage.setItem('user_mistakes', JSON.stringify(currentMistakes));
      alert('✅ Soal salah berhasil disimpan ke Buku Evaluasi!');
    } catch {
      alert('Gagal menyimpan soal salah.');
    }
  };

  const currentQ: QuestionItem | undefined = questions[currentIndex];

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">

        {/* 1. STATE CONFIG (SEBELUM MULAI) */}
        {drillState === 'config' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-bold mb-2">
                  <Zap className="w-3.5 h-3.5" /> High-Intensity Speed Drill
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white">Mode Kecepatan CAT BKN</h1>
                <p className="text-orange-100 text-xs md:text-sm mt-1 leading-relaxed">
                  Latih kecepatan reflek menjawab dengan batas waktu ketat <strong>50 detik per soal</strong>. Tuntaskan sebelum waktu habis atau soal akan terlewati otomatis!
                </p>
              </div>
            </div>

            {/* PENGATURAN DRILL */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  1. Pilih Kategori Soal
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'ALL', label: 'Campuran SKD', icon: '🎯' },
                    { id: 'TWK', label: 'Khusus TWK', icon: '🏛️' },
                    { id: 'TIU', label: 'Khusus TIU', icon: '⚡' },
                    { id: 'TKP', label: 'Khusus TKP', icon: '🤝' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-xs">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  2. Jumlah Soal Latihan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setQuestionCount(10)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      questionCount === 10
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm">10 Soal (Sprint Kilat)</div>
                    <div className="text-xs text-slate-500 mt-0.5">Estimasi waktu: 8 menit</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionCount(20)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      questionCount === 20
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm">20 Soal (Simulasi Marathon)</div>
                    <div className="text-xs text-slate-500 mt-0.5">Estimasi waktu: 16 menit</div>
                  </button>
                </div>
              </div>

              {/* ATURAN PERMAINAN */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Aturan Speed Drill:
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Setiap soal memiliki timer mundur <strong>50 detik</strong>.</li>
                  <li>Jika waktu habis sebelum dijawab, soal otomatis di-skip dan tidak bisa diulang.</li>
                  <li>Jika Anda sudah yakin dengan jawaban, segera klik tombol <strong>"Lanjut"</strong> untuk menghemat waktu.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleStartDrill}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Mulai Speed Drill Sekarang!</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. STATE PLAYING (SEDANG MENGERJAKAN) */}
        {drillState === 'playing' && currentQ && (
          <div className="space-y-4">
            
            {/* TOP HEADER: TIMER & PROGRESS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-sm flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  SOAL {currentIndex + 1} DARI {questions.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200 mt-1 inline-block">
                  Subtes {currentQ.category}
                </span>
              </div>

              {/* COUNTDOWN TIMER 50 DETIK */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Sisa Waktu</div>
                  <div className={`text-2xl sm:text-3xl font-black font-mono leading-none ${
                    timeLeft <= 10 ? 'text-rose-600 animate-pulse' : timeLeft <= 20 ? 'text-amber-500' : 'text-blue-600'
                  }`}>
                    {timeLeft}s
                  </div>
                </div>

                {/* Animated Circular Ring or Bar */}
                <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#e2e8f0"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke={timeLeft <= 10 ? '#e11d48' : timeLeft <= 20 ? '#f59e0b' : '#2563eb'}
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray="125.6"
                      strokeDashoffset={125.6 - (125.6 * timeLeft) / 50}
                      className="transition-all duration-1000 linear"
                    />
                  </svg>
                  <Timer className={`w-5 h-5 absolute ${
                    timeLeft <= 10 ? 'text-rose-600' : timeLeft <= 20 ? 'text-amber-500' : 'text-blue-600'
                  }`} />
                </div>
              </div>
            </div>

            {/* PROGRESS BAR DI ATAS SOAL */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* QUESTION CARD */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="text-sm md:text-base font-semibold text-slate-900 leading-relaxed">
                <FormattedText text={currentQ.question_text} inline={false} />
              </div>

              {/* OPTIONS A, B, C, D, E */}
              <div className="space-y-2.5">
                {[
                  { key: 'A', text: currentQ.option_a },
                  { key: 'B', text: currentQ.option_b },
                  { key: 'C', text: currentQ.option_c },
                  { key: 'D', text: currentQ.option_d },
                  { key: 'E', text: currentQ.option_e },
                ].filter(opt => Boolean(opt.text)).map((opt) => {
                  const isSelected = selectedAnswers[currentIndex] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectAnswer(opt.key)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 text-blue-950 font-semibold shadow-xs ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {opt.key}
                      </span>
                      <span className="text-xs sm:text-sm pt-0.5 leading-relaxed">
                        <FormattedText text={opt.text} />
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* FOOTER ACTION */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  {selectedAnswers[currentIndex] ? '✓ Jawaban terpilih' : '⚠️ Belum dijawab'}
                </div>
                <button
                  type="button"
                  onClick={handleNextManual}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Selesai & Cek Skor'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. STATE RESULT (HASIL & DIAGNOSTIK KECEPATAN) */}
        {drillState === 'result' && results && (
          <div className="space-y-6">
            
            {/* SCORE & SPEED BANNER */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-2">
                    <Trophy className="w-3.5 h-3.5" /> Hasil Evaluasi Kecepatan
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">Speed Drill Tuntas!</h1>
                  <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-md">
                    Berikut adalah analisis ketepatan dan efisiensi waktu pengerjaan Anda di bawah standar waktu CAT BKN.
                  </p>
                </div>

                {/* Score Pill */}
                <div className="flex gap-3 bg-white/10 border border-white/20 rounded-2xl p-4 shrink-0 backdrop-blur-sm text-center">
                  <div>
                    <div className="text-2xl font-black text-amber-400 font-mono">{results.totalScore}</div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase">Skor Didapat</div>
                  </div>
                  <div className="border-x border-white/20 px-3">
                    <div className="text-2xl font-black text-emerald-400 font-mono">{results.accuracy}%</div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase">Akurasi</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-cyan-400 font-mono">{results.avgTimePerQuestion}s</div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase">Rata-rata/Soal</div>
                  </div>
                </div>
              </div>

              {/* SPEED RATING ALERT */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-300">Status Kecepatan CAT:</span>
                <span className={`font-bold px-3 py-1 rounded-full ${
                  results.avgTimePerQuestion <= 35 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : results.avgTimePerQuestion <= 45
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {results.avgTimePerQuestion <= 35 
                    ? '⚡ Kecepatan Dewa (Sangat Aman CAT BKN)' 
                    : results.avgTimePerQuestion <= 45
                    ? '🎯 Kecepatan Baik (Standar BKN)'
                    : '⚠️ Perlu Peningkatan Reflek Menjawab'}
                </span>
              </div>
            </div>

            {/* BUTTONS: ULANGI & SIMPAN KE BUKU DOSA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <button
                type="button"
                onClick={() => setDrillState('config')}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Latihan Speed Drill Lagi</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {results.wrongCount > 0 && (
                  <button
                    type="button"
                    onClick={handleSaveWrongToMistakes}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <BookOpen className="w-4 h-4 text-rose-600" />
                    <span>Simpan {results.wrongCount} Soal Salah ke Buku Evaluasi</span>
                  </button>
                )}
                <Link
                  href="/dashboard/evaluasi"
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition text-center shadow-xs"
                >
                  Buka Buku Evaluasi
                </Link>
              </div>
            </div>

            {/* DAFTAR REVIEW SOAL & PEMBAHASAN */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-800">Review Pembahasan Soal Speed Drill</h3>
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = q.category === 'TKP' 
                  ? true 
                  : userAns === q.correct_answer;
                const timeSpent = timeSpentPerQuestion[idx] || 50;

                return (
                  <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500">Soal #{idx + 1}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {q.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {timeSpent}s
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isCorrect ? '✓ Benar' : '✗ Salah'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 font-medium">
                      {q.question_text}
                    </p>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                      <div>
                        Jawaban Anda: <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{userAns || 'Tidak Dijawab'}</strong>
                        {q.category !== 'TKP' && (
                          <span> | Kunci Jawaban: <strong className="text-emerald-700">{q.correct_answer}</strong></span>
                        )}
                      </div>
                      <div className="text-slate-600 pt-1 border-t border-slate-200/60">
                        <strong>Pembahasan:</strong> {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
