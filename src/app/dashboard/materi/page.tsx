'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import MemberLayout from '../../../components/MemberLayout';
import { TWK_MODULES, TWKModule } from '@/data/twkModules';

export default function MateriPage() {
  const [activeSubject, setActiveSubject] = useState<'twk' | 'tiu' | 'tkp'>('twk');
  const [unlockedStage, setUnlockedStage] = useState<number>(0);
  const [completedStages, setCompletedStages] = useState<Record<number, boolean>>({});
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [stageResults, setStageResults] = useState<Record<number, { isSubmitted: boolean; isAllCorrect: boolean; message: string }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('klinikcpns_twk_learning_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.unlockedStage === 'number') {
          setUnlockedStage(parsed.unlockedStage);
        }
        if (parsed.completedStages) {
          setCompletedStages(parsed.completedStages);
        }
        if (parsed.userAnswers) {
          setUserAnswers(parsed.userAnswers);
        }
      }
    } catch (e) {
      console.error('Error loading saved TWK progress:', e);
    }
  }, []);

  // Save progress helper
  const saveProgress = (newUnlocked: number, newCompleted: Record<number, boolean>, newAnswers: Record<string, string>) => {
    try {
      localStorage.setItem('klinikcpns_twk_learning_progress', JSON.stringify({
        unlockedStage: newUnlocked,
        completedStages: newCompleted,
        userAnswers: newAnswers,
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Error saving TWK progress:', e);
    }
  };

  // Handle option select
  const handleSelectOption = (stageIndex: number, questionIndex: number, value: string) => {
    const key = `m${stageIndex}q${questionIndex}`;
    setUserAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Check answers for a stage
  const checkAnswers = (stageIndex: number) => {
    const currentModule = TWK_MODULES[stageIndex];
    if (!currentModule) return;

    let allAnswered = true;
    let allCorrect = true;

    currentModule.questions.forEach((q, qIdx) => {
      const key = `m${stageIndex}q${qIdx}`;
      const chosen = userAnswers[key];
      if (!chosen) {
        allAnswered = false;
      } else if (chosen !== q.answer) {
        allCorrect = false;
      }
    });

    if (!allAnswered) {
      setStageResults(prev => ({
        ...prev,
        [stageIndex]: {
          isSubmitted: true,
          isAllCorrect: false,
          message: '⚠️ Mohon jawab semua soal terlebih dahulu sebelum memeriksa jawaban.'
        }
      }));
      return;
    }

    if (allCorrect) {
      const nextUnlocked = Math.max(unlockedStage, stageIndex + 1);
      const newCompleted = { ...completedStages, [stageIndex]: true };
      setUnlockedStage(nextUnlocked);
      setCompletedStages(newCompleted);

      setStageResults(prev => ({
        ...prev,
        [stageIndex]: {
          isSubmitted: true,
          isAllCorrect: true,
          message: stageIndex === TWK_MODULES.length - 1 
            ? '🎉 Luar biasa! Anda telah menyelesaikan seluruh 14 Tahap Materi TWK CPNS!'
            : '🎉 Sempurna! Semua jawaban benar. Tahap berikutnya telah terbuka!'
        }
      }));

      saveProgress(nextUnlocked, newCompleted, userAnswers);

      if (stageIndex === TWK_MODULES.length - 1) {
        setShowCompletionModal(true);
      } else {
        // Smooth scroll to next module
        setTimeout(() => {
          const nextEl = document.getElementById(`module-${stageIndex + 1}`);
          if (nextEl) {
            nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      }
    } else {
      setStageResults(prev => ({
        ...prev,
        [stageIndex]: {
          isSubmitted: true,
          isAllCorrect: false,
          message: '❌ Beberapa jawaban masih belum tepat. Silakan pelajari pembahasan di bawah dan coba lagi.'
        }
      }));
    }
  };

  // Reset Progress
  const handleResetProgress = () => {
    if (confirm('Apakah Anda yakin ingin mengulang materi TWK dari awal? Progres tahapan akan direset.')) {
      setUnlockedStage(0);
      setCompletedStages({});
      setUserAnswers({});
      setStageResults({});
      localStorage.removeItem('klinikcpns_twk_learning_progress');
      const firstEl = document.getElementById('module-0');
      if (firstEl) firstEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to stage
  const scrollToStage = (stageIdx: number) => {
    const el = document.getElementById(`module-${stageIdx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Total completed count
  const completedCount = Object.keys(completedStages).filter(k => completedStages[Number(k)]).length;
  // Dynamic progress percentage: start at 6% or 7% for Tahap 1, up to 100%
  const progressPercent = Math.min(100, Math.round(6 + (completedCount / TWK_MODULES.length) * 94));

  // Filter modules based on search
  const filteredModules = TWK_MODULES.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.stageNumber.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q)
    );
  });

  const content = (
    <div className={`min-h-screen text-[#172033] bg-[#f6f8fc] pb-16 font-sans antialiased`}>
      {/* GLOBAL STYLES FOR MODULE CONTENT */}
      <style jsx global>{`
        .twk-content p,
        .twk-content li {
          text-align: justify;
          text-justify: inter-word;
          line-height: 1.75;
          margin: 9px 0;
          color: #334155;
          font-size: 15px;
        }
        .twk-content h2 {
          font-size: 19px;
          font-weight: 700;
          color: #163b7a;
          margin: 24px 0 10px;
          border-left: 4px solid #155eef;
          padding-left: 10px;
        }
        .twk-content ul {
          padding-left: 22px;
          list-style-type: disc;
          margin: 10px 0;
        }
        .twk-content ol {
          padding-left: 22px;
          list-style-type: decimal;
          margin: 10px 0;
        }
        .twk-content strong {
          color: #0f172a;
          font-weight: 700;
        }
        .twk-content em {
          font-style: italic;
          color: #1e3a8a;
        }
      `}</style>

      {/* TOP NAVIGATION / SUBJECT TABS */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1120px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <button
              onClick={() => setActiveSubject('twk')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeSubject === 'twk'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🇮🇩</span>
              <span>TWK (14 Tahap Interaktif)</span>
              <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold ml-1">
                Lengkap
              </span>
            </button>

            <button
              onClick={() => setActiveSubject('tiu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeSubject === 'tiu'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🧮</span>
              <span>TIU (Tes Inteligensi)</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium ml-1">
                Segera Hadir
              </span>
            </button>

            <button
              onClick={() => setActiveSubject('tkp')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeSubject === 'tkp'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>👥</span>
              <span>TKP (Karakteristik Pribadi)</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium ml-1">
                Segera Hadir
              </span>
            </button>
          </div>

          {activeSubject === 'twk' && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                  focusMode
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Beralih ke mode belajar fokus"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>{focusMode ? 'Keluar Mode Fokus' : 'Mode Fokus'}</span>
              </button>

              <button
                onClick={handleResetProgress}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors"
                title="Reset progres materi TWK"
              >
                🔄 Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT: TIU / TKP PLACEHOLDERS */}
      {activeSubject !== 'twk' && (
        <div className="max-w-[900px] mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 flex items-center justify-center text-4xl mb-6">
              {activeSubject === 'tiu' ? '🧮' : '👥'}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              Materi {activeSubject.toUpperCase()} Sedang Disiapkan
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
              Tim pengajar dan spesialis SKD Klinik CPNS sedang menyusun rangkuman materi interaktif berjenjang untuk modul{' '}
              <strong>{activeSubject.toUpperCase()}</strong> agar Anda dapat belajar konsep dasar hingga trik cepat menyelesaikan soal.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto mb-8">
              {activeSubject === 'tiu' ? (
                <>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-xs font-bold text-blue-600">SUBMATERI 1</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-1">Kemampuan Verbal</h4>
                    <p className="text-xs text-slate-500 mt-1">Analogi, Silogisme, dan Analitis logis.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-xs font-bold text-blue-600">SUBMATERI 2</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-1">Kemampuan Numerik</h4>
                    <p className="text-xs text-slate-500 mt-1">Berhitung cepat, Deret angka, dan Soal cerita.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-xs font-bold text-blue-600">SUBMATERI 3</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-1">Kemampuan Figural</h4>
                    <p className="text-xs text-slate-500 mt-1">Serial gambar, Ketidaksamaan, dan Matriks pola.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-xs font-bold text-blue-600">SUBMATERI 1</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-1">Pelayanan Publik</h4>
                    <p className="text-xs text-slate-500 mt-1">Prinsip kepuasan masyarakat dan empati ASN.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-xs font-bold text-blue-600">SUBMATERI 2</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-1">Jejaring Kerja</h4>
                    <p className="text-xs text-slate-500 mt-1">Kolaborasi, komunikasi, dan koordinasi tim.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-xs font-bold text-blue-600">SUBMATERI 3</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-1">Anti Radikalisme</h4>
                    <p className="text-xs text-slate-500 mt-1">Integritas kebangsaan dan ketahanan ideologi.</p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setActiveSubject('twk')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow"
            >
              ← Buka Materi TWK (Tersedia)
            </button>
          </div>
        </div>
      )}

      {/* CONTENT: TWK INTERACTIVE COURSE */}
      {activeSubject === 'twk' && (
        <>
          {/* HERO BANNER */}
          <header className="bg-gradient-to-br from-[#082f86] via-[#155eef] to-[#6b9cff] text-white pt-12 pb-20 px-5">
            <div className="max-w-[1120px] mx-auto">
              <div className="text-[11px] font-black tracking-[0.16em] uppercase opacity-85 mb-2">
                TWK CPNS • INTERACTIVE LEARNING
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-[54px] font-black leading-tight mb-3">
                Materi TWK, selangkah demi selangkah.
              </h1>
              <p className="max-w-[760px] text-base md:text-[17px] opacity-90 leading-relaxed">
                Struktur belajar dibuat berjenjang: pahami konsep → lihat detail → cek pemahaman di checkpoint → buka tahap berikutnya secara berurutan.
              </p>

              {/* SEARCH BAR */}
              <div className="mt-6 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari topik TWK (contoh: Pancasila, Bela Negara, EYD)..."
                    className="w-full bg-white/15 backdrop-blur-md text-white placeholder-white/70 border border-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/20 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* STICKY / FLOATING PROGRESS DASHBOARD */}
          <div className="max-w-[1120px] mx-auto -mt-8 mb-8 px-4">
            <div className="bg-white border border-[#e4e7ec] rounded-2xl shadow-[0_12px_35px_rgba(16,24,40,0.07)] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">
                  📚
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress Belajar</div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {completedCount} dari {TWK_MODULES.length} Tahap Selesai
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-[200px] flex items-center gap-4">
                <div className="flex-1 h-2.5 bg-[#e9eef7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#155eef] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-sm font-black text-[#155eef] min-w-[45px] text-right">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* QUICK TAHAP NAVIGATOR CHIPS */}
            <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
              {TWK_MODULES.map((m, idx) => {
                const isLocked = idx > unlockedStage;
                const isCompleted = !!completedStages[idx];
                const isActive = idx === unlockedStage;

                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (!isLocked) scrollToStage(idx);
                    }}
                    disabled={isLocked}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                        : isActive
                        ? 'bg-blue-600 text-white shadow-xs cursor-pointer'
                        : isLocked
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <span>{isCompleted ? '✓' : isLocked ? '🔒' : '•'}</span>
                    <span>T{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN MODULES LIST */}
          <main className="max-w-[1120px] mx-auto px-4 space-y-8">
            {filteredModules.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                <p className="text-base font-semibold">Tidak ada tahap materi yang cocok dengan pencarian "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-sm text-blue-600 font-bold hover:underline"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : (
              filteredModules.map((module) => {
                const stageIndex = parseInt(module.id.replace('m', ''), 10);
                const isLocked = stageIndex > unlockedStage;
                const isCompleted = !!completedStages[stageIndex];
                const result = stageResults[stageIndex];

                return (
                  <section
                    key={module.id}
                    id={`module-${stageIndex}`}
                    className={`bg-white border border-[#e4e7ec] rounded-3xl shadow-[0_12px_35px_rgba(16,24,40,0.07)] p-6 sm:p-8 md:p-10 relative transition-all duration-300 ${
                      isLocked ? 'opacity-70 overflow-hidden' : ''
                    }`}
                  >
                    {/* LOCKED OVERLAY */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-[#f6f8fcdc] backdrop-blur-xs z-20 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-2xl mb-3">
                          🔒
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                          {module.stageNumber} Terkunci
                        </h3>
                        <p className="text-sm text-slate-500 max-w-md mb-4">
                          Selesaikan dan jawab semua soal Checkpoint pada <strong>Tahap {stageIndex}</strong> dengan benar untuk membuka materi ini.
                        </p>
                        <button
                          onClick={() => scrollToStage(stageIndex - 1)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          ← Buka Tahap Sebelumnya
                        </button>
                      </div>
                    )}

                    {/* MODULE HEADER */}
                    <div className="flex items-center justify-between text-[#155eef] font-black text-xs tracking-[0.12em] mb-2">
                      <span className="uppercase">{module.stageNumber}</span>
                      {isCompleted ? (
                        <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 font-bold flex items-center gap-1">
                          <span>✓</span> SELESAI
                        </span>
                      ) : isLocked ? (
                        <span className="text-[11px] bg-slate-100 text-slate-500 rounded-full px-2.5 py-0.5 font-bold">
                          🔒 TERKUNCI
                        </span>
                      ) : (
                        <span className="text-[11px] bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 font-bold">
                          📖 AKTIF
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-[#0b3aa4] leading-snug mb-6">
                      {module.title}
                    </h2>

                    {/* LEARNING GRID: CONTENT & STICKY ASIDE */}
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,0.7fr)] gap-8">
                      {/* LEFT: READING CONTENT */}
                      <div>
                        <div className="text-[10px] font-black tracking-[0.13em] text-[#155eef] uppercase mb-2">
                          PELAJARI
                        </div>
                        <div
                          className="twk-content"
                          dangerouslySetInnerHTML={{ __html: module.content }}
                        />
                      </div>

                      {/* RIGHT: ASIDE SUMMARY */}
                      <div>
                        <aside className="bg-[#f8fbff] border border-[#dbe5f5] rounded-2xl p-5 lg:sticky lg:top-20">
                          <div className="text-[10px] font-black tracking-[0.13em] text-[#155eef] uppercase mb-3 flex items-center gap-1.5">
                            <span>💡</span>
                            <span>INTI YANG PERLU DIINGAT</span>
                          </div>
                          <ul className="space-y-3 pl-4 text-xs md:text-sm text-[#344054] leading-relaxed list-disc">
                            {module.keys.map((keyPoint, kIdx) => (
                              <li key={kIdx} className="text-justify">
                                {keyPoint}
                              </li>
                            ))}
                          </ul>
                        </aside>
                      </div>
                    </div>

                    {/* CHECKPOINT SECTION */}
                    <div className="mt-10 bg-[#eef5ff] border border-[#dbe5f5] rounded-2xl p-6 md:p-8 relative z-10">
                      <div className="text-[10px] font-black tracking-[0.13em] text-[#155eef] uppercase mb-1">
                        CHECKPOINT
                      </div>
                      <h3 className="text-xl font-bold text-[#0b3aa4] mb-1">
                        Uji pemahaman sebelum lanjut
                      </h3>
                      <p className="text-xs md:text-sm text-[#667085] mb-6">
                        Jawab ketiga soal berikut. Materi tahap berikutnya baru terbuka setelah seluruh soal dijawab dengan benar.
                      </p>

                      {/* QUESTIONS */}
                      <div className="space-y-4">
                        {module.questions.map((q, qIdx) => {
                          const qKey = `m${stageIndex}q${qIdx}`;
                          const selectedVal = userAnswers[qKey];
                          const isSubmitted = result?.isSubmitted;
                          const isCorrect = selectedVal === q.answer;

                          let cardBorder = 'border-[#dbe3f0]';
                          if (isSubmitted && selectedVal) {
                            cardBorder = isCorrect ? 'border-[#6ed6a5] bg-emerald-50/20' : 'border-[#f5a5a0] bg-rose-50/20';
                          }

                          return (
                            <div
                              key={qIdx}
                              className={`bg-white border ${cardBorder} rounded-2xl p-5 md:p-6 transition-colors shadow-xs`}
                            >
                              <div className="text-[10px] font-black text-[#155eef] tracking-[0.12em] mb-1">
                                {q.tag || `SOAL ${qIdx + 1}`}
                              </div>
                              <div className="font-bold text-slate-800 text-sm md:text-base mb-4 leading-relaxed">
                                {q.text}
                              </div>

                              {/* OPTIONS */}
                              <div className="space-y-2">
                                {q.options.map((opt) => {
                                  const isSelected = selectedVal === opt.value;
                                  return (
                                    <label
                                      key={opt.value}
                                      onClick={() => handleSelectOption(stageIndex, qIdx, opt.value)}
                                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs md:text-sm cursor-pointer transition-all ${
                                        isSelected
                                          ? 'border-blue-500 bg-blue-50/80 font-semibold text-blue-900 shadow-xs'
                                          : 'border-[#e4e7ec] hover:border-[#9dbcfb] hover:bg-[#f8fbff] text-slate-700'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={qKey}
                                        value={opt.value}
                                        checked={isSelected}
                                        onChange={() => {}}
                                        className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      />
                                      <span className="font-black text-[#155eef] min-w-[14px]">
                                        {opt.value}
                                      </span>
                                      <span className="leading-relaxed">{opt.text}</span>
                                    </label>
                                  );
                                })}
                              </div>

                              {/* EXPLANATION */}
                              {isSubmitted && selectedVal && (
                                <div className="mt-4 p-3.5 bg-[#f8fafc] border border-slate-200/70 text-[#475467] rounded-xl text-xs md:text-sm leading-relaxed">
                                  <strong className="text-slate-800">Pembahasan: </strong>
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* ACTION BUTTON & RESULT FEEDBACK */}
                      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
                        <button
                          type="button"
                          onClick={() => checkAnswers(stageIndex)}
                          className="bg-[#155eef] hover:bg-[#0b3aa4] text-white font-extrabold px-6 py-3 rounded-xl text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>🔍 Periksa Jawaban</span>
                        </button>

                        {result && (
                          <div
                            className={`text-xs md:text-sm font-bold ${
                              result.isAllCorrect ? 'text-[#12b76a]' : 'text-[#b54708]'
                            }`}
                          >
                            {result.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                );
              })
            )}
          </main>
        </>
      )}

      {/* COMPLETION MODAL */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mx-auto mb-4">
              🏆
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              Selamat! Anda Lulus TWK
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Anda telah menyelesaikan seluruh <strong>14 Tahap Materi Interaktif TWK</strong> beserta semua soal uji pemahaman. Sekarang Anda siap menguji kemampuan di Try Out CPNS!
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/tryout-list"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow"
              >
                Mulai Uji Try Out CPNS
              </Link>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-full py-2.5 text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                Tutup dan Tinjau Materi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="text-center text-[#98a2b3] text-xs pt-16 pb-8">
        Klinik CPNS • Interactive Learning System
      </footer>
    </div>
  );

  if (focusMode) {
    return content;
  }

  return <MemberLayout>{content}</MemberLayout>;
}
