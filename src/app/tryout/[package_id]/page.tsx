'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import FormattedText from '@/components/FormattedText';

const Latex = ({ children }: { children: string }) => {
  return <FormattedText text={children} inline={true} />;
};

export default function TryoutPage() {
  const params = useParams();
  const router = useRouter();
  
  const [packageData, setPackageData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(6000);
  const [isLoading, setIsLoading] = useState(true);

  // STEP 1: State untuk Toggle Panel Mobile
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);

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
    if (!isAutoSubmit && !confirm('Apakah Anda yakin ingin mengakhiri ujian?')) {
      return;
    }

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      let user = currentUser || session?.user || null;
      let dbSaveSuccess = false;

      let skorTWK = 0;
      let skorTIU = 0;
      let skorTKP = 0;

      questions.forEach((q, idx) => {
        const qNum = typeof q.question_number === 'number' ? q.question_number : Number(q.question_number);
        const userAnswer = (answers[idx] ?? answers[qNum])?.toUpperCase();
        if (!userAnswer) return;

        if (q.question_category === 'TWK' && userAnswer === q.correct_answer?.toUpperCase()) {
          skorTWK += 5;
        } else if (q.question_category === 'TIU' && userAnswer === q.correct_answer?.toUpperCase()) {
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

      if (user) {
        const payload = {
          user_id: user.id,
          package_id: params.package_id,
          skor_twk: skorTWK,
          skor_tiu: skorTIU,
          skor_tkp: skorTKP,
          skor_total: total,
          is_passed: isLulus
        };

        const { data: insertData, error: insertError } = await supabase
          .from('exam_results')
          .insert([payload])
          .select();

        if (insertError) {
          console.error('❌ Error insert ke DB:', insertError.message);
        } else {
          dbSaveSuccess = true;

          const { data: challengeDay } = await supabase
            .from('challenge_packages')
            .select('day_number')
            .eq('package_id', params.package_id)
            .single();

          if (challengeDay && user) {
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
                await supabase
                  .from('challenge_progress')
                  .update({ current_day: dayNum + 1 })
                  .eq('id', userProgress.id);

                if (dayNum === 30) {
                  await supabase
                    .from('challenge_progress')
                    .update({ status: 'completed' })
                    .eq('id', userProgress.id);
                }
              } else {
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
      
      router.replace(`/result?package_id=${params.package_id}`);

    } catch (error: any) {
      console.error('❌ CRITICAL ERROR:', error);
      alert('Terjadi kesalahan sistem: ' + error.message);
    }
  };

  const handleFinishRef = useRef(handleFinish);
  useEffect(() => {
    handleFinishRef.current = handleFinish;
  }, [answers, markedQuestions, questions, packageData]);

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
          handleFinishRef.current(true);
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

  const handleAnswer = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: option }));
  };

  const toggleMark = (qIndex: number) => {
    setMarkedQuestions(prev => ({ ...prev, [qIndex]: !prev[qIndex] }));
  };

  const goToQuestion = (idx: number) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentQuestion(idx);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium">Memuat soal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER - Sticky */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-4 py-3 flex justify-between items-center">
        <h2 className="font-bold text-base md:text-lg text-slate-800 truncate max-w-[60%]">
          {packageData?.name}
        </h2>
        <div className={`text-base md:text-xl font-mono font-bold px-3 py-1.5 rounded-lg ${
          timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-800'
        }`}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        
        {/* KOLOM KIRI - Soal & Pilihan */}
        <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm">
            {/* Nomor Soal & Kategori */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Soal {currentQuestion + 1} dari {questions.length}
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                questions[currentQuestion]?.question_category === 'TWK' ? 'bg-purple-100 text-purple-700' :
                questions[currentQuestion]?.question_category === 'TIU' ? 'bg-green-100 text-green-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {questions[currentQuestion]?.question_category || 'Umum'}
              </span>
            </div>

            {/* Teks Soal */}
            <div className="mb-6">
              <Latex>{questions[currentQuestion]?.question_text || ''}</Latex>
              {questions[currentQuestion]?.question_image_url && (
                <img 
                  src={questions[currentQuestion]?.question_image_url} 
                  alt="Gambar Soal" 
                  className="mt-4 max-w-full max-h-80 rounded-lg border border-slate-200"
                />
              )}
            </div>

            {/* Pilihan Jawaban */}
            <div className="space-y-3">
              {['A', 'B', 'C', 'D', 'E'].map((option) => {
                const optionKey = `option_${option.toLowerCase()}`;
                const optionText = questions[currentQuestion]?.[optionKey];
                if (!optionText) return null;
                
                const isSelected = answers[currentQuestion] === option;
                
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-start gap-3 ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {option}
                    </span>
                    <span className="text-sm md:text-base text-slate-700 pt-1">
                      <Latex>{optionText}</Latex>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TOMBOL NAVIGASI - Mobile Friendly */}
          <div className="fixed bottom-0 left-0 right-0 md:static bg-white border-t border-slate-200 p-3 md:p-4 md:mt-4 md:border-0 md:rounded-xl md:shadow-sm z-30">
            <div className="flex gap-2 max-w-7xl mx-auto">
              {/* Tombol Ragu-ragu */}
              <button
                onClick={() => toggleMark(currentQuestion)}
                className={`flex-1 md:flex-none md:w-32 py-3 rounded-lg font-semibold text-xs md:text-sm transition-all flex items-center justify-center gap-1 ${
                  markedQuestions[currentQuestion]
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                <span className="hidden md:inline">Ragu-ragu</span>
                <span className="md:hidden">Tandai</span>
              </button>

              {/* Tombol Sebelumnya */}
              <button
                onClick={() => goToQuestion(currentQuestion - 1)}
                disabled={currentQuestion === 0}
                className="flex-1 py-3 rounded-lg font-semibold text-xs md:text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>

              {/* Tombol Nomor Soal (Mobile Only) */}
              <button
                onClick={() => setShowQuestionPanel(!showQuestionPanel)}
                className="md:hidden flex-1 py-3 rounded-lg font-semibold text-xs bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                No. Soal
              </button>

              {/* Tombol Selanjutnya */}
              <button
                onClick={() => goToQuestion(currentQuestion + 1)}
                disabled={currentQuestion === questions.length - 1}
                className="flex-1 md:flex-[2] py-3 rounded-lg font-semibold text-xs md:text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN - Panel Nomor Soal (Desktop) */}
        <div className="hidden md:block w-80 p-4 md:p-6 md:sticky md:top-20 md:h-fit">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-3">Navigasi Soal</h3>
            
            {/* Status */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-slate-600">Dijawab ({Object.keys(answers).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span className="text-slate-600">Ragu ({Object.values(markedQuestions).filter(Boolean).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span className="text-slate-600">Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-200 rounded"></div>
                <span className="text-slate-600">Belum</span>
              </div>
            </div>

            {/* Grid Nomor */}
            <div className="grid grid-cols-7 gap-1.5 mb-4">
              {questions.map((_, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isMarked = markedQuestions[idx];
                const isCurrent = idx === currentQuestion;
                
                return (
                  <button
                    key={idx}
                    onClick={() => goToQuestion(idx)}
                    className={`w-full aspect-square rounded text-xs font-bold transition-all ${
                      isCurrent 
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300' 
                        : isMarked
                        ? 'bg-yellow-400 text-yellow-900'
                        : isAnswered
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Tombol Selesai */}
            <button
              onClick={() => handleFinish(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold text-sm transition-colors"
            >
              🏁 SELESAI UJIAN
            </button>
          </div>
        </div>
      </div>

      {/* PANEL NOMOR SOAL MOBILE - Bottom Sheet */}
      {showQuestionPanel && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setShowQuestionPanel(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 rounded-t-2xl">
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-3"></div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Navigasi Soal</h3>
                <button
                  onClick={() => setShowQuestionPanel(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Status */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-slate-600">Dijawab ({Object.keys(answers).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span className="text-slate-600">Ragu ({Object.values(markedQuestions).filter(Boolean).length})</span>
                </div>
              </div>
            </div>

            {/* Grid Nomor */}
            <div className="p-4">
              <div className="grid grid-cols-8 gap-2">
                {questions.map((_, idx) => {
                  const isAnswered = answers[idx] !== undefined;
                  const isMarked = markedQuestions[idx];
                  const isCurrent = idx === currentQuestion;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        goToQuestion(idx);
                        setShowQuestionPanel(false);
                      }}
                      className={`aspect-square rounded-lg text-sm font-bold transition-all ${
                        isCurrent 
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300' 
                          : isMarked
                          ? 'bg-yellow-400 text-yellow-900'
                          : isAnswered
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Tombol Selesai */}
              <button
                onClick={() => {
                  setShowQuestionPanel(false);
                  handleFinish(false);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold text-sm mt-4"
              >
                🏁 SELESAI UJIAN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
