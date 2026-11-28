'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import FormattedText from '@/components/FormattedText';
import PageLoadingSpinner from '@/components/PageLoadingSpinner';

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

  // STATE: 30 Days Challenge & Anti-Cheat Proctoring
  const [challengeInfo, setChallengeInfo] = useState<{
    isChallenge: boolean;
    dayNumber: number | null;
    progressId: string | null;
    fallbackPackageId?: string | null;
  }>({
    isChallenge: false,
    dayNumber: null,
    progressId: null,
    fallbackPackageId: null,
  });
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [violationReason, setViolationReason] = useState('');
  const [isConfirmFinishOpen, setIsConfirmFinishOpen] = useState(false);

  const isSubmittingRef = useRef(false);
  const hasTriggeredViolationRef = useRef(false);
  const isProctorReadyRef = useRef(false);
  const challengeInfoRef = useRef(challengeInfo);

  useEffect(() => {
    challengeInfoRef.current = challengeInfo;
  }, [challengeInfo]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      const user = currentUser || session?.user || null;

      if (params.package_id === 'challenge-pool') {
        const search = new URLSearchParams(window.location.search);
        const dayParam = Math.max(1, Math.min(30, Number(search.get('day')) || 1));

        if (!user) {
          router.push('/login');
          return;
        }

        try {
          const res = await fetch(
            `/api/challenge/session?user_id=${encodeURIComponent(user.id)}&day_number=${dayParam}`
          );
          const data = await res.json();
          if (res.ok && data.questions) {
            setPackageData({
              id: 'challenge-pool',
              name: `30 Days Challenge · Hari ke-${dayParam}`,
              show_explanation: true,
            });
            setQuestions(data.questions);
            setChallengeInfo({
              isChallenge: true,
              dayNumber: dayParam,
              progressId: data.progressId || null,
              fallbackPackageId: data.fallbackPackageId || null,
            });
          } else {
            alert(data.error || 'Gagal memuat soal acak 30 Days Challenge.');
            router.push('/dashboard/challenge');
            return;
          }
        } catch (err) {
          console.error('Challenge pool load error:', err);
          router.push('/dashboard/challenge');
          return;
        }

        setIsLoading(false);
        return;
      }

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

      // Cek apakah paket ini adalah paket aktif 30 Days Challenge untuk user yang login
      if (user) {
        const { data: challengeDay } = await supabase
          .from('challenge_packages')
          .select('day_number')
          .eq('package_id', params.package_id)
          .single();

        if (challengeDay) {
          const { data: userProgress } = await supabase
            .from('challenge_progress')
            .select('id, current_day')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();

          if (userProgress && userProgress.current_day === challengeDay.day_number) {
            setChallengeInfo({
              isChallenge: true,
              dayNumber: challengeDay.day_number,
              progressId: userProgress.id,
            });
          }
        }
      }

      setIsLoading(false);
    };
    fetchData();
  }, [params.package_id, router]);

  // Handler Pelanggaran Anti-Curang
  const triggerViolation = async (reasonText: string) => {
    if (hasTriggeredViolationRef.current || isSubmittingRef.current || !isProctorReadyRef.current) return;
    hasTriggeredViolationRef.current = true;
    isSubmittingRef.current = true;

    const currentInfo = challengeInfoRef.current;
    const dayNum = currentInfo.dayNumber || 1;
    const fullReason = `Terdeteksi keluar dari halaman ujian (${reasonText}) pada Hari ke-${dayNum}`;

    if (currentInfo.progressId) {
      try {
        await supabase
          .from('challenge_progress')
          .update({
            status: 'failed',
            failed_reason: fullReason
          })
          .eq('id', currentInfo.progressId);

        await supabase
          .from('challenge_daily_scores')
          .insert([{
            progress_id: currentInfo.progressId,
            day_number: dayNum,
            skor_total: 0,
            skor_twk: 0,
            skor_tiu: 0,
            skor_tkp: 0,
            is_passed: false
          }]);
      } catch (err) {
        console.error('Error saat mencatat pelanggaran:', err);
      }
    }

    localStorage.removeItem(`exam_start_${params.package_id}`);
    setViolationReason(reasonText);
    setIsViolationModalOpen(true);
  };

  // Effect Pengawasan Anti-Curang (Tab switch, window blur / buka kalkulator / aplikasi lain)
  useEffect(() => {
    if (!challengeInfo.isChallenge) return;

    // Grace period 3 detik setelah halaman ujian termounting untuk mencegah false positive awal
    const graceTimer = setTimeout(() => {
      isProctorReadyRef.current = true;
    }, 3000);

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        triggerViolation('Berpindah tab atau me-minimize browser');
      }
    };

    const handleBlur = () => {
      triggerViolation('Membuka aplikasi lain (seperti kalkulator) atau berpindah jendela');
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmittingRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(graceTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [challengeInfo.isChallenge]);

  const handleFinish = async (isAutoSubmit = false) => {
    isSubmittingRef.current = true;

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
        const effectivePackageId =
          params.package_id === 'challenge-pool'
            ? challengeInfoRef.current.fallbackPackageId || null
            : params.package_id;

        const payload = {
          user_id: user.id,
          package_id: effectivePackageId,
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
        }

        // Update 30 Days Challenge Progress (berlaku untuk mode statis maupun pool acak)
        const currentChallenge = challengeInfoRef.current;
        if (currentChallenge.isChallenge && currentChallenge.dayNumber && currentChallenge.progressId) {
          const dayNum = currentChallenge.dayNumber;
          let isChallengePassed = false;
          let targetDesc = '';

          if (dayNum <= 10) {
            isChallengePassed = isLulus;
            targetDesc = 'Passing Grade (TWK≥65, TIU≥80, TKP≥166)';
          } else if (dayNum <= 20) {
            isChallengePassed = total >= 400;
            targetDesc = 'Total Skor ≥ 400';
          } else {
            isChallengePassed = total >= 500;
            targetDesc = 'Total Skor ≥ 500';
          }

          await supabase
            .from('challenge_daily_scores')
            .insert([{
              progress_id: currentChallenge.progressId,
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
              .eq('id', currentChallenge.progressId);

            if (dayNum === 30) {
              await supabase
                .from('challenge_progress')
                .update({ status: 'completed' })
                .eq('id', currentChallenge.progressId);
            }
          } else {
            await supabase
              .from('challenge_progress')
              .update({
                status: 'failed',
                failed_reason: `Nilai minimal Hari ke-${dayNum} tidak tercapai (Target: ${targetDesc}, Skor Anda: ${total})`
              })
              .eq('id', currentChallenge.progressId);
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
        if (hasTriggeredViolationRef.current) {
          clearInterval(timer);
          return 0;
        }
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
      <PageLoadingSpinner
        fullScreen
        title="Menyiapkan Soal Try Out CAT..."
        subtitle="Sedang memuat soal dan timer ujian Anda. Mohon tunggu sebentar, jangan refresh halaman."
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* BANNER PROCTORING 30 DAYS CHALLENGE */}
      {challengeInfo.isChallenge && (
        <div className="bg-gradient-to-r from-amber-600 to-red-600 text-white px-4 py-2.5 text-xs md:text-sm font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">🛡️</span>
            <span>
              <strong>30 Days Challenge (Hari ke-{challengeInfo.dayNumber}):</strong> Sistem Anti-Curang Aktif! 
              Dilarang berpindah tab browser atau membuka aplikasi lain (seperti kalkulator).
            </span>
          </div>
          <span className="hidden sm:inline bg-black/30 backdrop-blur-sm text-amber-200 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border border-amber-300/40">
            Terpantau Otomatis
          </span>
        </div>
      )}

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
              onClick={() => setIsConfirmFinishOpen(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold text-sm transition-colors cursor-pointer"
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
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
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
                  setIsConfirmFinishOpen(true);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold text-sm mt-4 cursor-pointer"
              >
                🏁 SELESAI UJIAN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI SELESAI UJIAN */}
      {isConfirmFinishOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
              🏁
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Akhiri Ujian Sekarang?
            </h3>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Pastikan seluruh jawaban Anda sudah terisi dengan baik. Setelah diakhiri, lembar jawaban akan langsung dievaluasi.
            </p>
            <div className="bg-slate-50 rounded-xl p-3 mb-6 text-xs text-slate-600 flex justify-around border border-slate-200">
              <div>Dijawab: <strong className="text-green-600 text-sm block">{Object.keys(answers).length}</strong></div>
              <div>Ragu-ragu: <strong className="text-yellow-600 text-sm block">{Object.values(markedQuestions).filter(Boolean).length}</strong></div>
              <div>Belum: <strong className="text-slate-500 text-sm block">{Math.max(0, questions.length - Object.keys(answers).length)}</strong></div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsConfirmFinishOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer text-sm"
              >
                Lanjut Mengerjakan
              </button>
              <button
                onClick={() => {
                  setIsConfirmFinishOpen(false);
                  handleFinish(true);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-md cursor-pointer text-sm"
              >
                Ya, Akhiri Ujian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PELANGGARAN ANTI-CURANG PROCTORING (DISKUALIFIKASI) */}
      {isViolationModalOpen && (
        <div className="fixed inset-0 bg-red-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 text-center shadow-2xl border-4 border-red-500 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-extrabold shadow-inner">
              🚨
            </div>
            <h3 className="text-2xl font-black text-red-600 mb-2">
              PELANGGARAN TERDETEKSI!
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-left">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">Penyebab Diskualifikasi:</p>
              <p className="text-sm font-bold text-red-900">{violationReason}</p>
            </div>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Sesuai aturan ketat <strong>30 Days CPNS Challenge</strong>, peserta <strong>dilarang berpindah tab browser, me-minimize jendela, atau membuka aplikasi lain (seperti kalkulator)</strong>.
              <br /><br />
              Ujian Anda hari ini dinyatakan <strong className="text-red-600">GAGAL</strong> dan seluruh progres tantangan otomatis harus diulang dari awal (Hari ke-1).
            </p>
            <button
              onClick={() => {
                router.replace('/dashboard/challenge');
              }}
              className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer text-sm"
            >
              Kembali ke Dashboard Challenge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
