'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import FormattedText from '@/components/FormattedText';

export default function TryoutPage() {
  const params = useParams();
  const router = useRouter();
  
  const [packageData, setPackageData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [markedQuestions, setMarkedQuestions] = useState<{ [key: number]: boolean }>({});
  const [timeLeft, setTimeLeft] = useState(6000); // 100 menit = 6000 detik
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: pkgData } = await supabase
        .from('tryout_packages')
        .select('*')
        .eq('id', params.package_id)
        .single();
      if (pkgData) setPackageData(pkgData);

      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('package_id', params.package_id)
        .order('question_number', { ascending: true });
      if (questionsData) setQuestions(questionsData);

      setIsLoading(false);
    };
    fetchData();
  }, [params.package_id]);

  const handleFinish = async (isAutoSubmit = false) => {
    console.log('=== HANDLE FINISH DIMULAI ===');
    
    if (!isAutoSubmit && !confirm('Apakah Anda yakin ingin mengakhiri ujian?')) {
      return;
    }

    try {
      console.log('1. Mendapatkan user...');
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      let user = currentUser || session?.user || null;
      let dbSaveSuccess = false;

      if (user) {
        console.log('✅ User ditemukan:', user.id);
      } else {
        console.warn('⚠️ Session tidak ditemukan (Auth glitch). Hasil akan disimpan di perangkat ini sebagai backup.');
      }

      console.log('2. Menghitung skor...');
      let skorTWK = 0;
      let skorTIU = 0;
      let skorTKP = 0;

      questions.forEach((q) => {
        const userAnswer = answers[q.question_number]?.toUpperCase();
        if (!userAnswer) return;

        if (q.question_category === 'TWK' && userAnswer === q.correct_answer) {
          skorTWK += 5;
        } else if (q.question_category === 'TIU' && userAnswer === q.correct_answer) {
          skorTIU += 5;
        } else if (q.question_category === 'TKP') {
          try {
            const tkpScores = JSON.parse(q.explanation || '{}');
            skorTKP += tkpScores[userAnswer.toLowerCase()] || 0;
          } catch {
            const scoreMap: { [key: string]: number } = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
            skorTKP += scoreMap[userAnswer] || 0;
          }
        }
      });

      const total = skorTWK + skorTIU + skorTKP;
      const isLulus = skorTWK >= 65 && skorTIU >= 80 && skorTKP >= 166;

      console.log('✅ Skor:', { TWK: skorTWK, TIU: skorTIU, TKP: skorTKP, Total: total, Lulus: isLulus });

      // 3. Simpan ke Database
      if (user) {
        console.log('3. Menyimpan ke database...');
        
        // PERHATIAN: Pastikan nama-nama key ini SAMA PERSIS dengan kolom di tabel exam_results Anda.
        // Hapus `skor_total` atau `total_score` sesuai dengan mana yang sebenarnya Anda gunakan di Supabase.
        const payload = {
          user_id: user.id,
          package_id: params.package_id,
          skor_twk: skorTWK,
          skor_tiu: skorTIU,
          skor_tkp: skorTKP,
          skor_total: total,
          is_passed: isLulus
        };

        // PERUBAHAN: Payload dibungkus dengan array [...] dan ditambahkan .select()
        const { data: insertData, error: insertError } = await supabase
          .from('exam_results')
          .insert([payload])
          .select();

        if (insertError) {
          // PERUBAHAN: Pesan error lebih detail agar kita tahu penyebab pastinya (misal: RLS policy atau nama kolom salah)
          console.error('❌ Error insert ke DB:', insertError.message, insertError.details);
          alert('Perhatian: Gagal menyimpan data ke database server. Pesan error: ' + insertError.message);
        } else {
          console.log('✅ Berhasil disimpan ke database:', insertData);
          dbSaveSuccess = true;

          // Cek apakah paket ini adalah bagian dari challenge
          const { data: challengeDay } = await supabase
            .from('challenge_packages')
            .select('day_number')
            .eq('package_id', params.package_id)
            .single();

          if (challengeDay && user) {
            // Cek apakah user punya progress challenge aktif
            const { data: userProgress } = await supabase
              .from('challenge_progress')
              .select('id, current_day')
              .eq('user_id', user.id)
              .eq('status', 'active')
              .single();

            if (userProgress && userProgress.current_day === challengeDay.day_number) {
              const dayNum = challengeDay.day_number;
              let isChallengePassed = false;
              let targetDesc = '';

              if (dayNum <= 10) {
                isChallengePassed = isLulus;
                targetDesc = 'Passing Grade (TWK≥65, TIU≥80, TKP≥166)';
              } else if (dayNum <= 20) {
                isChallengePassed = total >= 400;
                targetDesc = 'Total Skor ≥ 400';
              } else {
                isChallengePassed = total >= 460;
                targetDesc = 'Total Skor ≥ 460';
              }

              // Simpan ke challenge_daily_scores
              await supabase
                .from('challenge_daily_scores')
                .insert([{
                  progress_id: userProgress.id,
                  day_number: dayNum,
                  exam_result_id: insertData && insertData.length > 0 ? insertData[0].id : null,
                  skor_total: total,
                  skor_twk: skorTWK,
                  skor_tiu: skorTIU,
                  skor_tkp: skorTKP,
                  is_passed: isChallengePassed
                }]);

              if (isChallengePassed) {
                // Update current_day
                await supabase
                  .from('challenge_progress')
                  .update({ current_day: dayNum + 1 })
                  .eq('id', userProgress.id);

                // Cek apakah sudah selesai 30 hari
                if (dayNum === 30) {
                  await supabase
                    .from('challenge_progress')
                    .update({ status: 'completed' })
                    .eq('id', userProgress.id);
                }
              } else {
                // Jika nilai target tidak tercapai, challenge gagal dan harus ulang dari awal
                await supabase
                  .from('challenge_progress')
                  .update({
                    status: 'failed',
                    failed_reason: `Nilai minimal Hari ke-${dayNum} tidak tercapai (Target: ${targetDesc}, Skor Anda: ${total})`
                  })
                  .eq('id', userProgress.id);
              }
            }
          }
        }
      }

      // 4. Simpan ke localStorage
      console.log('4. Menyimpan ke localStorage...');
      const reviewData = {
        package_name: packageData?.name || 'Try Out',
        answers: answers,
        marked: markedQuestions,
        questions: questions,
        skor: {
          twk: skorTWK,
          tiu: skorTIU,
          tkp: skorTKP,
          total: total,
          lulus: isLulus,
          passingGrade: { twk: 65, tiu: 80, tkp: 166 }
        },
        dbSaved: dbSaveSuccess
      };

      localStorage.setItem(`exam_review_${params.package_id}`, JSON.stringify(reviewData));
      localStorage.setItem('latest_exam_review', JSON.stringify(reviewData));
      localStorage.removeItem(`exam_start_${params.package_id}`);
      
      console.log('✅ localStorage saved');

      // 5. PERUBAHAN: Gunakan router.replace dari Next.js agar tidak memutus eksekusi jaringan secara paksa
      console.log('5. Redirecting ke /result...');
      router.replace(`/result?package_id=${params.package_id}`);

    } catch (error: any) {
      console.error('❌ CRITICAL ERROR:', error);
      alert('Terjadi kesalahan sistem: ' + error.message);
    }
  };

  // Gunakan ref untuk handleFinish agar callback di setInterval selalu mendapat scope state terbaru
  const handleFinishRef = useRef(handleFinish);
  useEffect(() => {
    handleFinishRef.current = handleFinish;
  }, [answers, markedQuestions, questions, packageData]);

  // Timer countdown
  useEffect(() => {
    const savedStartTime = localStorage.getItem(`exam_start_${params.package_id}`);
    if (!savedStartTime) {
      localStorage.setItem(`exam_start_${params.package_id}`, Date.now().toString());
    } else {
      const elapsed = Math.floor((Date.now() - parseInt(savedStartTime)) / 1000);
      const remaining = 6000 - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishRef.current(true); // Memanggil submit via ref terbaru
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [params.package_id]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const toggleMark = (qNumber: number) => {
    setMarkedQuestions(prev => ({ ...prev, [qNumber]: !prev[qNumber] }));
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-slate-500 font-medium">Memuat soal...</div>
    </div>;
  }

  const currentQ = questions.find(q => q.question_number === currentQuestion);
  const answeredCount = Object.keys(answers).length;
  const totalSoal = questions.length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/tryout-list')}
            className="text-slate-500 hover:text-slate-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <div>
            <div className="text-xs text-slate-500">Kerjakan Latihan</div>
            <h1 className="font-bold text-slate-800">{packageData?.name || 'Try Out'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-500">Waktu Tersisa</div>
            <div className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT: 2 KOLOM */}
      <div className="flex gap-4 p-4 max-w-[1600px] mx-auto">
        
        {/* KOLOM KIRI: SOAL & JAWABAN */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 p-6 min-h-[calc(100vh-120px)]">
          {currentQ ? (
            <>
              {/* Header Soal */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">
                  Soal No. {currentQ.question_number}
                </h2>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  {currentQ.question_category}
                </span>
              </div>

              {/* Teks Soal */}
              <div className="mb-6">
                <div className="text-slate-800 leading-relaxed text-[15px]">
                  <FormattedText text={currentQ.question_text} inline={false} />
                </div>
                {currentQ.question_image_url && (
                  <img 
                    src={currentQ.question_image_url} 
                    alt="Gambar Soal" 
                    className="mt-4 max-w-full max-h-80 rounded-lg border border-slate-200"
                  />
                )}
              </div>

              {/* Pilihan Jawaban */}
              <div className="space-y-3">
                {['a', 'b', 'c', 'd', 'e'].map((opt) => {
                  const optionKey = `option_${opt}` as keyof typeof currentQ;
                  const imageKey = `option_${opt}_image_url` as keyof typeof currentQ;
                  const isSelected = answers[currentQuestion] === opt.toUpperCase();
                  
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt.toUpperCase())}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`font-bold text-sm flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {opt.toUpperCase()}
                      </span>
                      <div className="flex-1 text-slate-800 text-[15px]">
                        <FormattedText text={currentQ[optionKey]} inline={false} />
                        {currentQ[imageKey] && (
                          <img 
                            src={currentQ[imageKey]} 
                            alt={`Pilihan ${opt.toUpperCase()}`}
                            className="mt-2 max-h-32 rounded border border-slate-200"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Tombol Navigasi Bawah */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={() => toggleMark(currentQuestion)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    markedQuestions[currentQuestion]
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {markedQuestions[currentQuestion] ? '🚩 Ragu-ragu' : '🏳️ Tandai Ragu-ragu'}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(1, currentQuestion - 1))}
                    disabled={currentQuestion === 1}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50"
                  >
                    ← Sebelumnya
                  </button>
                  <button
                    onClick={() => setCurrentQuestion(Math.min(questions.length, currentQuestion + 1))}
                    disabled={currentQuestion === questions.length}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-700"
                  >
                    Selanjutnya →
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500">
              Belum ada soal dalam paket ini
            </div>
          )}
        </div>

        {/* KOLOM KANAN: NAVIGASI SOAL (STICKY) */}
        <div className="w-72 flex-shrink-0">
          <div className="sticky top-20 space-y-4">
            
            {/* Status Pengerjaan */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="text-center mb-3">
                <div className="text-xs text-slate-500 mb-1">Sudah selesai ?</div>
                <div className="text-lg font-bold text-slate-800">
                  {answeredCount} <span className="text-sm font-normal text-slate-500">dari {totalSoal}</span>
                </div>
              </div>
              
              <button
                onClick={() => handleFinish(false)}
                className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm"
              >
                SELESAI
              </button>
            </div>

            {/* Grid Nomor Soal */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-700 mb-3 text-center">Nomor Soal</h3>
              <div className="grid grid-cols-7 gap-1.5">
                {questions.map((q) => {
                  const isAnswered = !!answers[q.question_number];
                  const isMarked = markedQuestions[q.question_number];
                  const isCurrent = currentQuestion === q.question_number;
                  
                  let bgColor = 'bg-slate-100 text-slate-600 border-slate-200';
                  if (isAnswered && isMarked) bgColor = 'bg-yellow-400 text-white border-yellow-500';
                  else if (isAnswered) bgColor = 'bg-green-500 text-white border-green-600';
                  else if (isMarked) bgColor = 'bg-yellow-400 text-white border-yellow-500';
                  if (isCurrent) bgColor = 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(q.question_number)}
                      className={`aspect-square rounded text-xs font-bold border transition-all hover:scale-105 ${bgColor}`}
                    >
                      {q.question_number}
                    </button>
                  );
                })}
              </div>

              {/* Legenda Warna */}
              <div className="mt-4 space-y-1.5 text-[10px] text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded"></div>
                  <span>Belum Dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Sudah Dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span>Ragu-ragu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>Soal Aktif</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
