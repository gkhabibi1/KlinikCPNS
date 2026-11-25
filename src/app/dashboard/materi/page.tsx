'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MemberLayout from '../../../components/MemberLayout';
import { TWK_MODULES } from '@/data/twkModules';
import { TIU_MODULES } from '@/data/tiuModules';
import { TKP_MODULES } from '@/data/tkpModules';
import { CHEATSHEET_DATA, CheatSheetItem } from '@/data/cheatsheetData';
import ModuleAiTutor from '@/components/ModuleAiTutor';
import {
  Printer,
  Zap,
  Sparkles,
  BookOpen,
  Search,
  HelpCircle,
  Landmark,
  Calculator,
  Users,
  Maximize2,
  Minimize2,
  RotateCcw,
  Lock,
  Check,
  CheckCircle2,
  Lightbulb,
  KeyRound,
  ClipboardCheck,
  X,
  MessageSquare,
  Image as ImageIcon,
  Briefcase,
  Globe,
  Laptop,
  ShieldCheck,
  ArrowLeft,
  CircleDot
} from 'lucide-react';

function TkpIllustration({ type }: { type: string }) {
  const common = {
    stroke: "#1769e0",
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === "professional") {
    return (
      <svg viewBox="0 0 800 250" className="w-full h-auto max-h-[160px] md:max-h-[190px] mx-auto" role="img">
        <rect x="60" y="45" width="300" height="160" rx="18" fill="#eef5ff" {...common} />
        <path d="M110 105h180M110 140h120M110 175h150" {...common} />
        <circle cx="570" cy="105" r="55" fill="#fff" {...common} />
        <path d="M545 105l18 18 34-40" {...common} />
        <path d="M480 190h180" {...common} />
        <text x="410" y="55" fontSize="22" fontWeight="bold" fill="#172033">Tugas</text>
        <text x="535" y="220" fontSize="22" fontWeight="bold" fill="#172033">Tuntas ✓</text>
      </svg>
    );
  }
  if (type === "public") {
    return (
      <svg viewBox="0 0 800 250" className="w-full h-auto max-h-[160px] md:max-h-[190px] mx-auto">
        <circle cx="120" cy="120" r="50" fill="#eef5ff" {...common} />
        <path d="M90 120h60M120 90v60" {...common} />
        <path d="M250 75h420v110H250z" fill="#fff" {...common} />
        <path d="M280 105h180M280 140h240" {...common} />
        <circle cx="600" cy="120" r="25" fill="#dcfce7" stroke="#16a34a" strokeWidth={3} />
        <path d="M587 120l9 9 18-21" stroke="#16a34a" strokeWidth={3} fill="none" />
        <text x="75" y="215" fontSize="20" fontWeight="bold" fill="#475569">Masyarakat</text>
        <text x="400" y="220" fontSize="20" fontWeight="bold" fill="#475569">Prosedur → Adil</text>
      </svg>
    );
  }
  if (type === "network") {
    return (
      <svg viewBox="0 0 800 250" className="w-full h-auto max-h-[160px] md:max-h-[190px] mx-auto">
        <circle cx="400" cy="125" r="42" fill="#eef5ff" {...common} />
        <circle cx="180" cy="65" r="30" fill="#fff" {...common} />
        <circle cx="180" cy="185" r="30" fill="#fff" {...common} />
        <circle cx="620" cy="65" r="30" fill="#fff" {...common} />
        <circle cx="620" cy="185" r="30" fill="#fff" {...common} />
        <path d="M210 70L360 110M210 180L360 140M440 110L590 70M440 140L590 180" {...common} />
        <text x="375" y="132" fontSize="20" fontWeight="bold" fill="#1769e0">TIM</text>
      </svg>
    );
  }
  if (type === "culture") {
    return (
      <svg viewBox="0 0 800 250" className="w-full h-auto max-h-[160px] md:max-h-[190px] mx-auto">
        <circle cx="400" cy="125" r="65" fill="#eef5ff" {...common} />
        <path d="M400 70v110M345 125h110" {...common} />
        <circle cx="180" cy="80" r="38" fill="#fff" {...common} />
        <circle cx="620" cy="80" r="38" fill="#fff" {...common} />
        <circle cx="180" cy="170" r="38" fill="#fff" {...common} />
        <circle cx="620" cy="170" r="38" fill="#fff" {...common} />
        <path d="M215 95l135 25M585 95l-135 25M215 155l135-25M585 155L450 130" {...common} />
        <text x="270" y="225" fontSize="20" fontWeight="bold" fill="#475569">Berbeda, tetap saling menghargai</text>
      </svg>
    );
  }
  if (type === "tik") {
    return (
      <svg viewBox="0 0 800 250" className="w-full h-auto max-h-[160px] md:max-h-[190px] mx-auto">
        <rect x="270" y="35" width="260" height="150" rx="16" fill="#eef5ff" {...common} />
        <rect x="310" y="70" width="180" height="75" rx="8" fill="#fff" stroke="#8bb2eb" strokeWidth={3} />
        <path d="M340 110h120M340 125h85" {...common} />
        <path d="M220 205h360" {...common} />
        <path d="M400 185v20" {...common} />
        <circle cx="150" cy="125" r="34" fill="#dcfce7" stroke="#16a34a" strokeWidth={3} />
        <path d="M132 125l12 12 25-29" stroke="#16a34a" strokeWidth={3} fill="none" />
        <path d="M540 125h90" {...common} />
        <text x="115" y="185" fontSize="19" fontWeight="bold" fill="#475569">Manfaat</text>
        <text x="605" y="160" fontSize="19" fontWeight="bold" fill="#475569">Dampak</text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 800 250" className="w-full h-auto max-h-[160px] md:max-h-[190px] mx-auto">
      <circle cx="400" cy="125" r="65" fill="#eef5ff" {...common} />
      <path d="M400 82v86M357 125h86" {...common} />
      <path d="M165 70c35 0 60 25 60 55s-25 55-60 55M635 70c-35 0-60 25-60 55s25 55 60 55" {...common} />
      <path d="M225 125h110M465 125h110" {...common} />
      <path d="M330 80l-35 45 35 45M470 80l35 45-35 45" {...common} />
      <text x="255" y="225" fontSize="20" fontWeight="bold" fill="#475569">Damai • Bersatu • Berdampingan</text>
    </svg>
  );
}

export default function MateriPage() {
  const [activeSubject, setActiveSubject] = useState<'twk' | 'tiu' | 'tkp' | 'cheatsheet'>('twk');
  const [cheatSheetCategory, setCheatSheetCategory] = useState<'all' | 'tiu' | 'tkp' | 'twk'>('all');
  
  // TWK State
  const [twkUnlockedStage, setTwkUnlockedStage] = useState<number>(0);
  const [twkCompletedStages, setTwkCompletedStages] = useState<Record<number, boolean>>({});
  const [twkUserAnswers, setTwkUserAnswers] = useState<Record<string, string>>({});
  const [twkStageResults, setTwkStageResults] = useState<Record<number, { isSubmitted: boolean; isAllCorrect: boolean; message: string }>>({});

  // TIU State
  const [tiuUnlockedStage, setTiuUnlockedStage] = useState<number>(0);
  const [tiuCompletedStages, setTiuCompletedStages] = useState<Record<number, boolean>>({});
  const [tiuUserAnswers, setTiuUserAnswers] = useState<Record<string, string>>({});
  const [tiuStageResults, setTiuStageResults] = useState<Record<number, { isSubmitted: boolean; isAllCorrect: boolean; message: string }>>({});

  // TKP State
  const [tkpUnlockedStage, setTkpUnlockedStage] = useState<number>(0);
  const [tkpCompletedStages, setTkpCompletedStages] = useState<Record<number, boolean>>({});
  const [tkpUserAnswers, setTkpUserAnswers] = useState<Record<string, string>>({});
  const [tkpStageResults, setTkpStageResults] = useState<Record<number, { isSubmitted: boolean; isAllCorrect: boolean; message: string }>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState<{ isOpen: boolean; subject: 'twk' | 'tiu' | 'tkp' }>({
    isOpen: false,
    subject: 'twk'
  });

  // Load progress from localStorage
  useEffect(() => {
    try {
      // TWK
      const savedTwk = localStorage.getItem('klinikcpns_twk_learning_progress');
      if (savedTwk) {
        const parsed = JSON.parse(savedTwk);
        if (typeof parsed.unlockedStage === 'number') setTwkUnlockedStage(parsed.unlockedStage);
        if (parsed.completedStages) setTwkCompletedStages(parsed.completedStages);
        if (parsed.userAnswers) setTwkUserAnswers(parsed.userAnswers);
      }

      // TIU
      const savedTiu = localStorage.getItem('klinikcpns_tiu_learning_progress');
      if (savedTiu) {
        const parsed = JSON.parse(savedTiu);
        if (typeof parsed.unlockedStage === 'number') setTiuUnlockedStage(parsed.unlockedStage);
        if (parsed.completedStages) setTiuCompletedStages(parsed.completedStages);
        if (parsed.userAnswers) setTiuUserAnswers(parsed.userAnswers);
      }

      // TKP
      const savedTkp = localStorage.getItem('klinikcpns_tkp_learning_progress');
      if (savedTkp) {
        const parsed = JSON.parse(savedTkp);
        if (typeof parsed.unlockedStage === 'number') setTkpUnlockedStage(parsed.unlockedStage);
        if (parsed.completedStages) setTkpCompletedStages(parsed.completedStages);
        if (parsed.userAnswers) setTkpUserAnswers(parsed.userAnswers);
      }
    } catch (e) {
      console.error('Error loading saved progress:', e);
    }
  }, []);

  // Save TWK progress
  const saveTwkProgress = (newUnlocked: number, newCompleted: Record<number, boolean>, newAnswers: Record<string, string>) => {
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

  // Save TIU progress
  const saveTiuProgress = (newUnlocked: number, newCompleted: Record<number, boolean>, newAnswers: Record<string, string>) => {
    try {
      localStorage.setItem('klinikcpns_tiu_learning_progress', JSON.stringify({
        unlockedStage: newUnlocked,
        completedStages: newCompleted,
        userAnswers: newAnswers,
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Error saving TIU progress:', e);
    }
  };

  // Save TKP progress
  const saveTkpProgress = (newUnlocked: number, newCompleted: Record<number, boolean>, newAnswers: Record<string, string>) => {
    try {
      localStorage.setItem('klinikcpns_tkp_learning_progress', JSON.stringify({
        unlockedStage: newUnlocked,
        completedStages: newCompleted,
        userAnswers: newAnswers,
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Error saving TKP progress:', e);
    }
  };

  // Handle option select
  const handleSelectOption = (subject: 'twk' | 'tiu' | 'tkp', stageIndex: number, questionIndex: number, value: string) => {
    const key = `m${stageIndex}q${questionIndex}`;
    if (subject === 'twk') {
      setTwkUserAnswers(prev => ({ ...prev, [key]: value }));
    } else if (subject === 'tiu') {
      setTiuUserAnswers(prev => ({ ...prev, [key]: value }));
    } else {
      setTkpUserAnswers(prev => ({ ...prev, [key]: value }));
    }
  };

  // Check answers for TWK
  const checkTwkAnswers = (stageIndex: number) => {
    const currentModule = TWK_MODULES[stageIndex];
    if (!currentModule) return;

    let allAnswered = true;
    let allCorrect = true;

    currentModule.questions.forEach((q, qIdx) => {
      const key = `m${stageIndex}q${qIdx}`;
      const chosen = twkUserAnswers[key];
      if (!chosen) {
        allAnswered = false;
      } else if (chosen !== q.answer) {
        allCorrect = false;
      }
    });

    if (!allAnswered) {
      setTwkStageResults(prev => ({
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
      const nextUnlocked = Math.max(twkUnlockedStage, stageIndex + 1);
      const newCompleted = { ...twkCompletedStages, [stageIndex]: true };
      setTwkUnlockedStage(nextUnlocked);
      setTwkCompletedStages(newCompleted);

      setTwkStageResults(prev => ({
        ...prev,
        [stageIndex]: {
          isSubmitted: true,
          isAllCorrect: true,
          message: stageIndex === TWK_MODULES.length - 1 
            ? '🎉 Luar biasa! Anda telah menyelesaikan seluruh 14 Tahap Materi TWK CPNS!'
            : '🎉 Sempurna! Semua jawaban benar. Tahap berikutnya telah terbuka!'
        }
      }));

      saveTwkProgress(nextUnlocked, newCompleted, twkUserAnswers);

      if (stageIndex === TWK_MODULES.length - 1) {
        setShowCompletionModal({ isOpen: true, subject: 'twk' });
      } else {
        setTimeout(() => {
          const nextEl = document.getElementById(`twk-module-${stageIndex + 1}`);
          if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
      }
    } else {
      setTwkStageResults(prev => ({
        ...prev,
        [stageIndex]: {
          isSubmitted: true,
          isAllCorrect: false,
          message: '❌ Beberapa jawaban masih belum tepat. Silakan pelajari pembahasan di bawah dan coba lagi.'
        }
      }));
    }
  };

  // Check answers for TIU
  const checkTiuAnswers = (stageIndex: number) => {
    const currentModule = TIU_MODULES[stageIndex];
    if (!currentModule) return;

    let allAnswered = true;
    let allCorrect = true;

    currentModule.questions.forEach((q, qIdx) => {
      const key = `m${stageIndex}q${qIdx}`;
      const chosen = tiuUserAnswers[key];
      if (!chosen) {
        allAnswered = false;
      } else if (chosen !== q.answer) {
        allCorrect = false;
      }
    });

    if (!allAnswered) {
      setTiuStageResults(prev => ({
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
      const nextUnlocked = Math.max(tiuUnlockedStage, stageIndex + 1);
      const newCompleted = { ...tiuCompletedStages, [stageIndex]: true };
      setTiuUnlockedStage(nextUnlocked);
      setTiuCompletedStages(newCompleted);

      setTiuStageResults(prev => ({
        ...prev,
        [stageIndex]: {
          isSubmitted: true,
          isAllCorrect: true,
          message: stageIndex === TIU_MODULES.length - 1 
            ? '🎉 Luar biasa! Anda telah menyelesaikan seluruh 12 Tahap Materi TIU CPNS!'
            : '🎉 Sempurna! Semua jawaban benar. Tahap berikutnya telah terbuka!'
        }
      }));

      saveTiuProgress(nextUnlocked, newCompleted, tiuUserAnswers);

      if (stageIndex === TIU_MODULES.length - 1) {
        setShowCompletionModal({ isOpen: true, subject: 'tiu' });
      } else {
        setTimeout(() => {
          const nextEl = document.getElementById(`tiu-module-${stageIndex + 1}`);
          if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
      }
    } else {
      setTiuStageResults(prev => ({
        ...prev,
        [stageIndex]: {
          isSubmitted: true,
          isAllCorrect: false,
          message: '❌ Beberapa jawaban masih belum tepat. Silakan pelajari pembahasan di bawah dan coba lagi.'
        }
      }));
    }
  };

  // Check answers for TKP
  const checkTkpAnswers = (stageIndex: number) => {
    const currentModule = TKP_MODULES[stageIndex];
    if (!currentModule) return;

    let allAnswered = true;
    let allCorrect = true;

    currentModule.questions.forEach((q, qIdx) => {
      const key = `m${stageIndex}q${qIdx}`;
      const chosen = tkpUserAnswers[key];
      if (!chosen) {
        allAnswered = false;
      } else if (chosen !== q.answer) {
        allCorrect = false;
      }
    });

    if (!allAnswered) {
      setTkpStageResults(prev => ({
        ...prev,
        [stageIndex]: {
          isSubmitted: true,
          isAllCorrect: false,
          message: '⚠️ Mohon jawab semua 3 soal checkpoint terlebih dahulu sebelum memeriksa jawaban.'
        }
      }));
      return;
    }

    if (allCorrect) {
      const nextUnlocked = Math.max(tkpUnlockedStage, stageIndex + 1);
      const newCompleted = { ...tkpCompletedStages, [stageIndex]: true };
      setTkpUnlockedStage(nextUnlocked);
      setTkpCompletedStages(newCompleted);

      setTkpStageResults(prev => ({
        ...prev,
        [stageIndex]: {
          isSubmitted: true,
          isAllCorrect: true,
          message: stageIndex === TKP_MODULES.length - 1 
            ? '🎉 Luar biasa! Anda telah menyelesaikan seluruh 6 Subbab Materi TKP CPNS!'
            : '🎉 Sempurna! Semua jawaban benar (3/3). Subbab berikutnya telah terbuka!'
        }
      }));

      saveTkpProgress(nextUnlocked, newCompleted, tkpUserAnswers);

      if (stageIndex === TKP_MODULES.length - 1) {
        setShowCompletionModal({ isOpen: true, subject: 'tkp' });
      } else {
        setTimeout(() => {
          const nextEl = document.getElementById(`tkp-module-${stageIndex + 1}`);
          if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
      }
    } else {
      setTkpStageResults(prev => ({
        ...prev,
        [stageIndex]: {
          isSubmitted: true,
          isAllCorrect: false,
          message: '❌ Beberapa jawaban masih belum tepat. Anda perlu mendapatkan 3/3 untuk membuka subbab berikutnya. Pelajari pembahasan lalu coba lagi.'
        }
      }));
    }
  };

  // Reset Progress
  const handleResetProgress = () => {
    const subjectName = activeSubject.toUpperCase();
    if (confirm(`Apakah Anda yakin ingin mengulang materi ${subjectName} dari awal? Progres tahapan akan direset.`)) {
      if (activeSubject === 'twk') {
        setTwkUnlockedStage(0);
        setTwkCompletedStages({});
        setTwkUserAnswers({});
        setTwkStageResults({});
        localStorage.removeItem('klinikcpns_twk_learning_progress');
        const firstEl = document.getElementById('twk-module-0');
        if (firstEl) firstEl.scrollIntoView({ behavior: 'smooth' });
      } else if (activeSubject === 'tiu') {
        setTiuUnlockedStage(0);
        setTiuCompletedStages({});
        setTiuUserAnswers({});
        setTiuStageResults({});
        localStorage.removeItem('klinikcpns_tiu_learning_progress');
        const firstEl = document.getElementById('tiu-module-0');
        if (firstEl) firstEl.scrollIntoView({ behavior: 'smooth' });
      } else if (activeSubject === 'tkp') {
        setTkpUnlockedStage(0);
        setTkpCompletedStages({});
        setTkpUserAnswers({});
        setTkpStageResults({});
        localStorage.removeItem('klinikcpns_tkp_learning_progress');
        const firstEl = document.getElementById('tkp-module-0');
        if (firstEl) firstEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Scroll to stage
  const scrollToStage = (prefix: 'twk' | 'tiu' | 'tkp', stageIdx: number) => {
    const el = document.getElementById(`${prefix}-module-${stageIdx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Calculations
  const twkCompletedCount = Object.keys(twkCompletedStages).filter(k => twkCompletedStages[Number(k)]).length;
  const twkProgressPercent = Math.min(100, Math.round(6 + (twkCompletedCount / TWK_MODULES.length) * 94));

  const tiuCompletedCount = Object.keys(tiuCompletedStages).filter(k => tiuCompletedStages[Number(k)]).length;
  const tiuProgressPercent = Math.min(100, Math.round(8 + (tiuCompletedCount / TIU_MODULES.length) * 92));

  const tkpCompletedCount = Object.keys(tkpCompletedStages).filter(k => tkpCompletedStages[Number(k)]).length;
  const tkpProgressPercent = Math.min(100, Math.round(10 + (tkpCompletedCount / TKP_MODULES.length) * 90));

  // Filtered modules
  const filteredTwkModules = TWK_MODULES.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.stageNumber.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q)
    );
  });

  const filteredTiuModules = TIU_MODULES.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.stageNumber.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q) ||
      m.categoryTag.toLowerCase().includes(q)
    );
  });

  const filteredTkpModules = TKP_MODULES.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.stageNumber.toLowerCase().includes(q) ||
      m.subtitle.toLowerCase().includes(q) ||
      m.intro.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q) ||
      m.categoryTag.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  const filteredCheatSheets = CHEATSHEET_DATA.filter(item => {
    const matchesCategory = cheatSheetCategory === 'all' || item.category === cheatSheetCategory;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.keyFormula.toLowerCase().includes(q) ||
      (item.exampleOrTrick && item.exampleOrTrick.toLowerCase().includes(q))
    );
  });

  const content = (
    <div className="min-h-screen overflow-x-hidden text-[#172033] bg-[#f8fafc] pb-20 font-sans antialiased">
      {/* GLOBAL STYLES FOR MODULE CONTENT */}
      <style jsx global>{`
        .materi-content {
          color: #334155;
          font-size: 15.5px;
          line-height: 1.82;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
        @media (min-width: 640px) {
          .materi-content {
            font-size: 16px;
            line-height: 1.85;
          }
        }
        .materi-content p,
        .materi-content li {
          text-align: left;
          line-height: 1.82;
          margin: 12px 0;
          color: #334155;
          font-size: inherit;
        }
        .materi-content h2 {
          font-family: var(--font-heading), sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #0f2d6b;
          margin: 26px 0 12px;
          border-left: 4px solid #2563eb;
          padding-left: 12px;
          line-height: 1.35;
        }
        @media (min-width: 640px) {
          .materi-content h2 {
            font-size: 20px;
          }
        }
        .materi-content h3 {
          font-family: var(--font-heading), sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin: 20px 0 8px;
          line-height: 1.4;
        }
        .materi-content ul {
          padding-left: 20px;
          list-style-type: disc;
          margin: 12px 0;
        }
        .materi-content ol {
          padding-left: 20px;
          list-style-type: decimal;
          margin: 12px 0;
        }
        .materi-content strong {
          color: #0f172a;
          font-weight: 700;
        }
        .materi-content em {
          font-style: italic;
          color: #1e3a8a;
        }
        .materi-content blockquote {
          border-left: 3px solid #93c5fd;
          background: #f8fbff;
          padding: 12px 16px;
          border-radius: 0 12px 12px 0;
          margin: 16px 0;
          color: #1e3a8a;
        }
        .materi-content table {
          display: block;
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 14px;
        }
        .materi-content pre,
        .materi-content code {
          overflow-x: auto;
          max-width: 100%;
          word-break: break-word;
        }
      `}</style>

      {/* TOP NAVIGATION / SUBJECT TABS */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-[1120px] mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar w-full sm:w-auto">
            <button
              onClick={() => { setActiveSubject('twk'); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                activeSubject === 'twk'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Landmark className="w-4 h-4" strokeWidth={1.8} />
              <span>TWK (14 Tahap)</span>
            </button>

            <button
              onClick={() => { setActiveSubject('tiu'); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                activeSubject === 'tiu'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Calculator className="w-4 h-4" strokeWidth={1.8} />
              <span>TIU (12 Tahap)</span>
            </button>

            <button
              onClick={() => { setActiveSubject('tkp'); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                activeSubject === 'tkp'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Users className="w-4 h-4" strokeWidth={1.8} />
              <span>TKP (6 Tahap)</span>
            </button>

            <button
              onClick={() => { setActiveSubject('cheatsheet'); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                activeSubject === 'cheatsheet'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Zap className="w-4 h-4" strokeWidth={1.8} />
              <span>Rumus Sakti &amp; Cheat Sheet</span>
            </button>
          </div>

          {(activeSubject === 'twk' || activeSubject === 'tiu' || activeSubject === 'tkp') && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  focusMode
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Beralih ke mode belajar fokus"
              >
                {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{focusMode ? 'Keluar Fokus' : 'Mode Fokus'}</span>
              </button>

              <button
                onClick={handleResetProgress}
                className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                title={`Reset progres materi ${activeSubject.toUpperCase()}`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          )}
        </div>
      </div>


      {/* CONTENT: TWK INTERACTIVE COURSE */}
      {activeSubject === 'twk' && (
        <>
          {/* HERO BANNER */}
          <header className="bg-gradient-to-br from-[#082f86] via-[#155eef] to-[#6b9cff] text-white pt-8 pb-14 sm:pt-12 sm:pb-20 px-4 sm:px-5">
            <div className="max-w-[1120px] mx-auto">
              <div className="text-[11px] font-extrabold tracking-[0.16em] uppercase opacity-85 mb-2">
                TWK CPNS • INTERACTIVE LEARNING
              </div>
              <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.18] tracking-tight mb-3">
                Materi TWK, selangkah demi selangkah.
              </h1>
              <p className="max-w-[700px] text-sm sm:text-base md:text-[17px] opacity-90 leading-relaxed">
                Struktur belajar dibuat berjenjang: pahami konsep secara ringkas, tinjau poin inti, cek pemahaman di checkpoint, lalu buka tahap berikutnya secara berurutan.
              </p>

              {/* SEARCH BAR */}
              <div className="mt-5 sm:mt-6 max-w-md">
                <div className="relative">
                  <Search className="w-4 h-4 text-white/75 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari topik TWK (contoh: Pancasila, Bela Negara, EYD)..."
                    className="w-full bg-white/15 backdrop-blur-md text-white placeholder-white/75 border border-white/30 rounded-xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/20 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      aria-label="Hapus pencarian"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* STICKY / FLOATING PROGRESS DASHBOARD */}
          <div className="max-w-[1120px] mx-auto -mt-7 sm:-mt-8 mb-6 sm:mb-8 px-3 sm:px-4">
            <div className="bg-white border border-[#e4e7ec] rounded-2xl shadow-[0_12px_35px_rgba(16,24,40,0.07)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Progress Belajar TWK</div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {twkCompletedCount} dari {TWK_MODULES.length} Tahap Selesai
                  </div>
                </div>
              </div>

              <div className="w-full sm:flex-1 sm:min-w-[200px] flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-[#e9eef7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#155eef] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${twkProgressPercent}%` }}
                  />
                </div>
                <span className="text-sm font-black text-[#155eef] min-w-[42px] text-right">
                  {twkProgressPercent}%
                </span>
              </div>
            </div>

            {/* QUICK TAHAP NAVIGATOR CHIPS */}
            <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
              {TWK_MODULES.map((m, idx) => {
                const isLocked = idx > twkUnlockedStage;
                const isCompleted = !!twkCompletedStages[idx];
                const isActive = idx === twkUnlockedStage;

                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (!isLocked) scrollToStage('twk', idx);
                    }}
                    disabled={isLocked}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                        : isActive
                        ? 'bg-blue-600 text-white shadow-xs cursor-pointer'
                        : isLocked
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-65'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    ) : isLocked ? (
                      <Lock className="w-3 h-3" strokeWidth={2.2} />
                    ) : (
                      <CircleDot className="w-3 h-3" strokeWidth={2.2} />
                    )}
                    <span>T{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN TWK MODULES LIST */}
          <main className="max-w-[1120px] mx-auto px-3 sm:px-4 space-y-6 sm:space-y-8">
            {filteredTwkModules.length === 0 ? (
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
              filteredTwkModules.map((module) => {
                const stageIndex = parseInt(module.id.replace('m', ''), 10);
                const isLocked = stageIndex > twkUnlockedStage;
                const isCompleted = !!twkCompletedStages[stageIndex];
                const result = twkStageResults[stageIndex];

                return (
                  <section
                    key={module.id}
                    id={`twk-module-${stageIndex}`}
                    className={`bg-white border border-[#e4e7ec] rounded-2xl sm:rounded-3xl shadow-[0_8px_28px_rgba(16,24,40,0.05)] p-4 sm:p-7 md:p-9 relative transition-all duration-300 ${
                      isLocked ? 'min-h-[260px] opacity-75 overflow-hidden' : ''
                    }`}
                  >
                    {/* LOCKED OVERLAY */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-[#f8fafce6] backdrop-blur-xs z-20 flex flex-col items-center justify-center p-5 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 mb-3">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h3 className="font-heading text-base sm:text-lg font-bold text-slate-800 mb-1">
                          {module.stageNumber} Terkunci
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-4 leading-relaxed">
                          Selesaikan dan jawab semua soal Checkpoint pada <strong>Tahap {stageIndex}</strong> dengan benar untuk membuka materi ini.
                        </p>
                        <button
                          onClick={() => scrollToStage('twk', stageIndex - 1)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Buka Tahap Sebelumnya</span>
                        </button>
                      </div>
                    )}

                    {/* MODULE HEADER */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[#155eef] font-extrabold text-xs tracking-[0.12em] mb-2">
                      <span className="uppercase">{module.stageNumber}</span>
                      {isCompleted ? (
                        <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 font-bold inline-flex items-center gap-1">
                          <Check className="w-3 h-3" strokeWidth={2.5} /> SELESAI
                        </span>
                      ) : isLocked ? (
                        <span className="text-[11px] bg-slate-100 text-slate-500 rounded-full px-2.5 py-0.5 font-bold inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" /> TERKUNCI
                        </span>
                      ) : (
                        <span className="text-[11px] bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 font-bold inline-flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> AKTIF
                        </span>
                      )}
                    </div>

                    <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0b3aa4] leading-snug mb-5 sm:mb-6">
                      {module.title}
                    </h2>

                    {/* LEARNING GRID: CONTENT & STICKY ASIDE */}
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,0.75fr)] gap-6 lg:gap-8">
                      {/* LEFT: READING CONTENT */}
                      <div className="min-w-0 max-w-[70ch]">
                        <div className="text-[11px] font-extrabold tracking-[0.13em] text-[#155eef] uppercase mb-2">
                          PELAJARI KONSEP
                        </div>
                        <div
                          className="materi-content"
                          dangerouslySetInnerHTML={{ __html: module.content }}
                        />
                      </div>

                      {/* RIGHT: ASIDE SUMMARY */}
                      <div className="min-w-0">
                        <aside className="bg-[#f8fbff] border border-[#dbe5f5] rounded-2xl p-4 sm:p-5 lg:sticky lg:top-20">
                          <div className="text-[11px] font-extrabold tracking-[0.12em] text-[#155eef] uppercase mb-3 flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 shrink-0" />
                            <span>INTI YANG PERLU DIINGAT</span>
                          </div>
                          <ul className="space-y-2.5 pl-4 text-xs sm:text-sm text-[#344054] leading-relaxed list-disc">
                            {module.keys.map((keyPoint, kIdx) => (
                              <li key={kIdx} className="text-left">
                                {keyPoint}
                              </li>
                            ))}
                          </ul>
                        </aside>
                      </div>
                    </div>

                    {/* TUTOR AI INTERAKTIF */}
                    {!isLocked && (
                      <ModuleAiTutor moduleTitle={module.title} subject="twk" />
                    )}

                    {/* CHECKPOINT SECTION */}
                    <div className="mt-8 sm:mt-10 bg-[#eef5ff] border border-[#dbe5f5] rounded-2xl p-4 sm:p-6 md:p-8 relative z-10">
                      <div className="text-[11px] font-extrabold tracking-[0.13em] text-[#155eef] uppercase mb-1">
                        CHECKPOINT
                      </div>
                      <h3 className="font-heading text-lg sm:text-xl font-bold text-[#0b3aa4] mb-1">
                        Uji pemahaman sebelum lanjut
                      </h3>
                      <p className="text-xs sm:text-sm text-[#475467] mb-5 sm:mb-6 leading-relaxed">
                        Jawab ketiga soal berikut. Materi tahap berikutnya baru terbuka setelah seluruh soal dijawab dengan benar.
                      </p>

                      {/* QUESTIONS */}
                      <div className="space-y-4">
                        {module.questions.map((q, qIdx) => {
                          const qKey = `m${stageIndex}q${qIdx}`;
                          const selectedVal = twkUserAnswers[qKey];
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
                                      onClick={() => handleSelectOption('twk', stageIndex, qIdx, opt.value)}
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
                      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4">
                        <button
                          type="button"
                          onClick={() => checkTwkAnswers(stageIndex)}
                          className="w-full sm:w-auto bg-[#155eef] hover:bg-[#0b3aa4] text-white font-extrabold px-6 py-3 rounded-xl text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Periksa Jawaban</span>
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

      {/* CONTENT: TIU INTERACTIVE COURSE */}
      {activeSubject === 'tiu' && (
        <>
          {/* HERO BANNER */}
          <header className="bg-gradient-to-br from-[#0c2340] via-[#1769ff] to-[#60a5fa] text-white pt-8 pb-14 sm:pt-12 sm:pb-20 px-4 sm:px-5">
            <div className="max-w-[1120px] mx-auto">
              <div className="text-[11px] font-extrabold tracking-[0.16em] uppercase opacity-85 mb-2">
                TIU CPNS • INTERACTIVE LEARNING
              </div>
              <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.18] tracking-tight mb-3">
                Belajar TIU dengan Sistem Unlock.
              </h1>
              <p className="max-w-[700px] text-sm sm:text-base md:text-[17px] opacity-90 leading-relaxed">
                Kuasai 3 pilar utama: Verbal, Numerik, dan Figural. Setiap tahap dilengkapi konsep terarah, rumus &amp; pola kunci, ilustrasi visual, serta uji checkpoint untuk membuka tahap berikutnya.
              </p>

              {/* THREE PILLAR MAP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-5 sm:mt-6 max-w-2xl">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-left">
                  <div className="text-xs font-extrabold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Verbal (3 Tahap)</span>
                  </div>
                  <div className="text-xs text-white/90 mt-1 font-medium">Analogi • Silogisme • Analitis</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-left">
                  <div className="text-xs font-extrabold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Numerik (6 Tahap)</span>
                  </div>
                  <div className="text-xs text-white/90 mt-1 font-medium">Pecahan • Deret • Perbandingan • Tabel</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-left">
                  <div className="text-xs font-extrabold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Figural (3 Tahap)</span>
                  </div>
                  <div className="text-xs text-white/90 mt-1 font-medium">Analogi Gambar • Seri • Ketaksamaan</div>
                </div>
              </div>

              {/* SEARCH BAR */}
              <div className="mt-5 sm:mt-6 max-w-md">
                <div className="relative">
                  <Search className="w-4 h-4 text-white/75 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari materi TIU (contoh: Silogisme, Pecahan, Deret, Figural)..."
                    className="w-full bg-white/15 backdrop-blur-md text-white placeholder-white/75 border border-white/30 rounded-xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/20 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      aria-label="Hapus pencarian"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* STICKY / FLOATING PROGRESS DASHBOARD */}
          <div className="max-w-[1120px] mx-auto -mt-7 sm:-mt-8 mb-6 sm:mb-8 px-3 sm:px-4">
            <div className="bg-white border border-[#e4e7ec] rounded-2xl shadow-[0_12px_35px_rgba(16,24,40,0.07)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calculator className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Progress Belajar TIU</div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {tiuCompletedCount} dari {TIU_MODULES.length} Subbab Selesai
                  </div>
                </div>
              </div>

              <div className="w-full sm:flex-1 sm:min-w-[200px] flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-[#e9eef7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1769ff] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${tiuProgressPercent}%` }}
                  />
                </div>
                <span className="text-sm font-black text-[#1769ff] min-w-[42px] text-right">
                  {tiuProgressPercent}%
                </span>
              </div>
            </div>

            {/* QUICK TAHAP NAVIGATOR CHIPS */}
            <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
              {TIU_MODULES.map((m, idx) => {
                const isLocked = idx > tiuUnlockedStage;
                const isCompleted = !!tiuCompletedStages[idx];
                const isActive = idx === tiuUnlockedStage;

                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (!isLocked) scrollToStage('tiu', idx);
                    }}
                    disabled={isLocked}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                        : isActive
                        ? 'bg-blue-600 text-white shadow-xs cursor-pointer'
                        : isLocked
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-65'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    ) : isLocked ? (
                      <Lock className="w-3 h-3" strokeWidth={2.2} />
                    ) : (
                      <CircleDot className="w-3 h-3" strokeWidth={2.2} />
                    )}
                    <span>T{idx + 1 < 10 ? `0${idx + 1}` : idx + 1} ({m.categoryTag.substring(0, 3)})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN TIU MODULES LIST */}
          <main className="max-w-[1120px] mx-auto px-3 sm:px-4 space-y-6 sm:space-y-8">
            {filteredTiuModules.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                <p className="text-base font-semibold">Tidak ada materi TIU yang cocok dengan pencarian "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-sm text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : (
              filteredTiuModules.map((module, stageIndex) => {
                const isLocked = stageIndex > tiuUnlockedStage;
                const isCompleted = !!tiuCompletedStages[stageIndex];
                const result = tiuStageResults[stageIndex];

                return (
                  <section
                    key={module.id}
                    id={`tiu-module-${stageIndex}`}
                    className={`bg-white border border-[#e4e7ec] rounded-2xl sm:rounded-3xl shadow-[0_8px_28px_rgba(16,24,40,0.05)] p-4 sm:p-7 md:p-9 relative transition-all duration-300 ${
                      isLocked ? 'min-h-[260px] opacity-75 overflow-hidden' : ''
                    }`}
                  >
                    {/* LOCKED OVERLAY */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-[#f8fafce6] backdrop-blur-xs z-20 flex flex-col items-center justify-center p-5 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 mb-3">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h3 className="font-heading text-base sm:text-lg font-bold text-slate-800 mb-1">
                          {module.stageNumber} ({module.title}) Terkunci
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-4 leading-relaxed">
                          Selesaikan dan jawab semua soal Checkpoint pada <strong>Tahap {stageIndex}</strong> dengan benar untuk membuka materi ini.
                        </p>
                        <button
                          onClick={() => scrollToStage('tiu', stageIndex - 1)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Buka Tahap Sebelumnya</span>
                        </button>
                      </div>
                    )}

                    {/* MODULE HEADER */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[#1769ff] font-extrabold text-xs tracking-[0.12em] mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="uppercase">{module.stageNumber}</span>
                        <span className="text-[10px] bg-blue-100/80 text-blue-800 px-2 py-0.5 rounded-md font-extrabold tracking-wider">
                          {module.categoryTag}
                        </span>
                      </div>
                      {isCompleted ? (
                        <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 font-bold inline-flex items-center gap-1">
                          <Check className="w-3 h-3" strokeWidth={2.5} /> SELESAI
                        </span>
                      ) : isLocked ? (
                        <span className="text-[11px] bg-slate-100 text-slate-500 rounded-full px-2.5 py-0.5 font-bold inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" /> TERKUNCI
                        </span>
                      ) : (
                        <span className="text-[11px] bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 font-bold inline-flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> AKTIF
                        </span>
                      )}
                    </div>

                    <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-[#102542] leading-snug mb-1.5">
                      {module.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6 font-medium leading-relaxed">
                      {module.description}
                    </p>

                    {/* VISUAL DIAGRAM BOX */}
                    {module.visual && (
                      <div className="mb-6 sm:mb-8 p-3.5 sm:p-4 rounded-2xl bg-[#f0f6ff] border border-[#d0e2ff] text-[#1769ff] font-bold text-center text-sm sm:text-lg md:text-xl tracking-wide shadow-xs overflow-x-auto break-words">
                        {module.visual}
                      </div>
                    )}

                    {/* LEARNING GRID: CONTENT & FORMULA/ASIDE */}
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)] gap-6 lg:gap-8">
                      {/* LEFT: READING CONTENT */}
                      <div className="min-w-0 max-w-[70ch]">
                        <div className="text-[11px] font-extrabold tracking-[0.13em] text-[#1769ff] uppercase mb-2">
                          PELAJARI KONSEP &amp; METODE
                        </div>
                        <div
                          className="materi-content"
                          dangerouslySetInnerHTML={{ __html: module.content }}
                        />
                      </div>

                      {/* RIGHT: FORMULA & ASIDE TAKEAWAYS */}
                      <div className="space-y-4 min-w-0">
                        {/* FORMULA BOX */}
                        {module.formula && (
                          <div className="bg-[#102542] text-white rounded-2xl p-4 sm:p-5 shadow-sm text-center overflow-x-auto">
                            <div className="text-[10px] font-black tracking-[0.15em] text-[#93c5fd] uppercase mb-2">
                              {module.formulaTitle || 'RUMUS / POLA KUNCI'}
                            </div>
                            <div
                              className="font-mono text-xs sm:text-sm md:text-base font-bold text-white leading-relaxed break-words"
                              dangerouslySetInnerHTML={{ __html: module.formula }}
                            />
                          </div>
                        )}

                        {/* KEY TAKEAWAYS */}
                        <aside className="bg-[#f8fbff] border border-[#dbe5f5] rounded-2xl p-4 sm:p-5 lg:sticky lg:top-20">
                          <div className="text-[11px] font-extrabold tracking-[0.12em] text-[#1769ff] uppercase mb-3 flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 shrink-0" />
                            <span>TRIK CEPAT &amp; INTI PENTING</span>
                          </div>
                          <ul className="space-y-2.5 pl-4 text-xs sm:text-sm text-[#344054] leading-relaxed list-disc">
                            {module.keys.map((keyPoint, kIdx) => (
                              <li key={kIdx} className="text-left">
                                {keyPoint}
                              </li>
                            ))}
                          </ul>
                        </aside>
                      </div>
                    </div>

                    {/* TUTOR AI INTERAKTIF */}
                    {!isLocked && (
                      <ModuleAiTutor moduleTitle={module.title} subject="tiu" />
                    )}

                    {/* CHECKPOINT SECTION */}
                    <div className="mt-8 sm:mt-10 bg-[#f0f6ff] border border-[#cfe2fe] rounded-2xl p-4 sm:p-6 md:p-8 relative z-10">
                      <div className="text-[11px] font-extrabold tracking-[0.13em] text-[#1769ff] uppercase mb-1">
                        CHECKPOINT
                      </div>
                      <h3 className="font-heading text-lg sm:text-xl font-bold text-[#102542] mb-1">
                        Uji pemahaman sebelum lanjut
                      </h3>
                      <p className="text-xs sm:text-sm text-[#64748b] mb-5 sm:mb-6 leading-relaxed">
                        Jawab ketiga soal berikut dengan benar untuk membuka subbab materi selanjutnya.
                      </p>

                      {/* QUESTIONS */}
                      <div className="space-y-4">
                        {module.questions.map((q, qIdx) => {
                          const qKey = `m${stageIndex}q${qIdx}`;
                          const selectedVal = tiuUserAnswers[qKey];
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
                              <div className="text-[10px] font-black text-[#1769ff] tracking-[0.12em] mb-1">
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
                                      onClick={() => handleSelectOption('tiu', stageIndex, qIdx, opt.value)}
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
                                      <span className="font-black text-[#1769ff] min-w-[14px]">
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
                      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4">
                        <button
                          type="button"
                          onClick={() => checkTiuAnswers(stageIndex)}
                          className="w-full sm:w-auto bg-[#1769ff] hover:bg-[#0f4ebd] text-white font-extrabold px-6 py-3 rounded-xl text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Periksa Jawaban</span>
                        </button>

                        {result && (
                          <div
                            className={`text-xs md:text-sm font-bold ${
                              result.isAllCorrect ? 'text-[#087f4e]' : 'text-[#c92a2a]'
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

      {/* CONTENT: TKP INTERACTIVE COURSE */}
      {activeSubject === 'tkp' && (
        <>
          {/* HERO BANNER */}
          <header className="bg-gradient-to-br from-[#0f172a] via-[#1769e0] to-[#60a5fa] text-white pt-8 pb-14 sm:pt-12 sm:pb-20 px-4 sm:px-5">
            <div className="max-w-[1120px] mx-auto">
              <div className="text-[11px] font-extrabold tracking-[0.16em] uppercase opacity-85 mb-2">
                TKP CPNS • INTERACTIVE LEARNING
              </div>
              <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.18] tracking-tight mb-3">
                Belajar TKP dengan Sistem Unlock.
              </h1>
              <p className="max-w-[700px] text-sm sm:text-base md:text-[17px] opacity-90 leading-relaxed">
                Kuasai 6 pilar karakteristik kepribadian: Profesionalisme, Pelayanan Publik, Jejaring Kerja, Sosiokultural, TIK, dan Anti Radikalisme. Pahami esensi dilema moral/dinas, pola kunci skenario, dan tuntaskan checkpoint untuk membuka tahap berikutnya.
              </p>

              {/* 6 PILLAR MAP */}
              <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-left">
                  <div className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Tahap 1</span>
                  </div>
                  <div className="text-xs text-white font-bold mt-1">Profesionalisme</div>
                  <div className="text-[11px] text-white/80 mt-0.5">Prioritas &amp; Tugas</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-left">
                  <div className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5" />
                    <span>Tahap 2</span>
                  </div>
                  <div className="text-xs text-white font-bold mt-1">Pelayanan Publik</div>
                  <div className="text-[11px] text-white/80 mt-0.5">Adil &amp; SOP</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-left">
                  <div className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Tahap 3</span>
                  </div>
                  <div className="text-xs text-white font-bold mt-1">Jejaring Kerja</div>
                  <div className="text-[11px] text-white/80 mt-0.5">Kolaborasi Tim</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-left">
                  <div className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Tahap 4</span>
                  </div>
                  <div className="text-xs text-white font-bold mt-1">Sosiokultural</div>
                  <div className="text-[11px] text-white/80 mt-0.5">Empati &amp; Ragam</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-left">
                  <div className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Tahap 5</span>
                  </div>
                  <div className="text-xs text-white font-bold mt-1">TIK Digital</div>
                  <div className="text-[11px] text-white/80 mt-0.5">Manfaat &amp; Risiko</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-left">
                  <div className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Tahap 6</span>
                  </div>
                  <div className="text-xs text-white font-bold mt-1">Anti Radikalisme</div>
                  <div className="text-[11px] text-white/80 mt-0.5">Persatuan &amp; Damai</div>
                </div>
              </div>

              {/* SEARCH BAR */}
              <div className="mt-5 sm:mt-6 max-w-md">
                <div className="relative">
                  <Search className="w-4 h-4 text-white/75 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari materi TKP (contoh: Profesionalisme, Pelayanan, SARA, TIK)..."
                    className="w-full bg-white/15 backdrop-blur-md text-white placeholder-white/75 border border-white/30 rounded-xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/20 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      aria-label="Hapus pencarian"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* STICKY / FLOATING PROGRESS DASHBOARD */}
          <div className="max-w-[1120px] mx-auto -mt-7 sm:-mt-8 mb-6 sm:mb-8 px-3 sm:px-4">
            <div className="bg-white border border-[#e4e7ec] rounded-2xl shadow-[0_12px_35px_rgba(16,24,40,0.07)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Progress Belajar TKP</div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {tkpCompletedCount} dari {TKP_MODULES.length} Subbab Selesai
                  </div>
                </div>
              </div>

              <div className="w-full sm:flex-1 sm:min-w-[200px] flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-[#e9eef7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1769e0] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${tkpProgressPercent}%` }}
                  />
                </div>
                <span className="text-sm font-black text-[#1769e0] min-w-[42px] text-right">
                  {tkpProgressPercent}%
                </span>
              </div>
            </div>

            {/* QUICK TAHAP NAVIGATOR CHIPS */}
            <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
              {TKP_MODULES.map((m, idx) => {
                const isLocked = idx > tkpUnlockedStage;
                const isCompleted = !!tkpCompletedStages[idx];
                const isCurrent = idx === tkpUnlockedStage;

                return (
                  <button
                    key={m.id}
                    onClick={() => !isLocked && scrollToStage('tkp', idx)}
                    disabled={isLocked}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                        : isCurrent
                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                        : isLocked
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    ) : isLocked ? (
                      <Lock className="w-3 h-3" strokeWidth={2.2} />
                    ) : (
                      <span>T0{idx + 1}</span>
                    )}
                    <span>{m.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN TKP MODULES LIST */}
          <main className="max-w-[1120px] mx-auto px-3 sm:px-4 space-y-8 sm:space-y-10">
            {filteredTkpModules.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                <p className="text-slate-500 text-sm">Tidak ada materi TKP yang cocok dengan kata kunci &quot;{searchQuery}&quot;.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-blue-600 text-xs font-bold hover:underline cursor-pointer"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : (
              filteredTkpModules.map((m) => {
                const stageIndex = TKP_MODULES.findIndex(item => item.id === m.id);
                const isLocked = stageIndex > tkpUnlockedStage;
                const isCompleted = !!tkpCompletedStages[stageIndex];
                const result = tkpStageResults[stageIndex];

                if (isLocked) {
                  return (
                    <section
                      key={m.id}
                      id={`tkp-module-${stageIndex}`}
                      className="bg-white/75 border border-dashed border-slate-300 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {m.stageNumber} • {m.categoryTag}
                      </div>
                      <h2 className="font-heading text-lg sm:text-2xl font-extrabold text-slate-500 mt-1 mb-2">
                        {m.title}
                      </h2>
                      <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                        Selesaikan checkpoint dan ujian pemahaman di tahap sebelumnya untuk membuka materi ini.
                      </p>
                    </section>
                  );
                }

                return (
                  <section
                    key={m.id}
                    id={`tkp-module-${stageIndex}`}
                    className="bg-white border border-[#dbe5f2] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_28px_rgba(20,55,100,0.05)] transition-all"
                  >
                    {/* STAGE HEADER */}
                    <div className="p-4 sm:p-6 md:p-8 border-b border-[#eef3fb] bg-gradient-to-r from-blue-50/40 via-transparent to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#1769e0] bg-[#eef5ff] px-2.5 py-1 rounded-lg">
                            {m.stageNumber}
                          </span>
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {m.categoryTag}
                          </span>
                          {isCompleted ? (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                              <Check className="w-3 h-3" strokeWidth={2.5} /> Lulus Checkpoint
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                              Sedang Dipelajari
                            </span>
                          )}
                        </div>
                        <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                          {m.title}
                        </h2>
                        <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
                          {m.subtitle}
                        </p>
                        <p className="text-slate-600 text-sm sm:text-base mt-2.5 max-w-2xl leading-relaxed text-left">
                          {m.intro}
                        </p>
                        
                        {/* KEYWORDS TAGS */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {m.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] font-bold bg-[#f1f5f9] text-[#475569] px-2.5 py-0.5 rounded-full border border-[#e2e8f0]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* QUICK JUMP TO CHECKPOINT BUTTON */}
                      <button
                        onClick={() => {
                          const cp = document.getElementById(`tkp-cp-${stageIndex}`);
                          if (cp) cp.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="self-start md:self-center shrink-0 px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold rounded-xl transition-all border border-slate-200 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Langsung ke Checkpoint</span>
                      </button>
                    </div>

                    {/* INTERACTIVE VISUAL / ILLUSTRATION */}
                    <div className="p-4 sm:p-6 bg-[#f8fbff] border-b border-[#eef3fb]">
                      <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 text-center">
                        ILUSTRASI &amp; POLA SIKAP TKP
                      </div>
                      <div className="bg-white rounded-2xl p-3 sm:p-5 border border-[#dbe5f2] shadow-xs max-w-2xl mx-auto flex items-center justify-center">
                        <TkpIllustration type={m.illustrationType} />
                      </div>
                    </div>

                    {/* TWO-COLUMN LAYOUT: CONTENT + KEY TAKEAWAY */}
                    <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                      {/* COLUMN 1: MATERIAL CONTENT */}
                      <div className="lg:col-span-2 min-w-0 max-w-[70ch]">
                        <div
                          className="materi-content"
                          dangerouslySetInnerHTML={{ __html: m.content }}
                        />
                      </div>

                      {/* COLUMN 2: KEY TAKEAWAYS ASIDE */}
                      <div className="space-y-4 min-w-0">
                        <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
                          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1769e0] mb-3">
                            <KeyRound className="w-4 h-4 shrink-0" />
                            <span>Poin Kunci &amp; Pola Sikap</span>
                          </div>
                          <ul className="space-y-2.5">
                            {m.keys.map((k, kIdx) => (
                              <li key={kIdx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2 leading-relaxed text-left">
                                <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
                                <span>{k}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed text-left">
                          <div className="flex items-center gap-1.5 font-bold text-amber-950 mb-1">
                            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Tips Penilaian TKP CPNS</span>
                          </div>
                          Soal TKP memiliki skala skor 1 sampai 5. Sikap yang mengedepankan integritas dinas, kepatuhan prosedur, empati proporsional, dan resolusi damai konsisten meraih poin 5 (skor tertinggi).
                        </div>
                      </div>
                    </div>

                    {/* TUTOR AI INTERAKTIF */}
                    {!isLocked && (
                      <div className="px-4 sm:px-6 md:px-8">
                        <ModuleAiTutor moduleTitle={m.title} subject="tkp" />
                      </div>
                    )}

                    {/* CHECKPOINT QUIZ CARD */}
                    <div
                      id={`tkp-cp-${stageIndex}`}
                      className="mx-3 my-4 sm:m-6 md:m-8 p-4 sm:p-6 md:p-8 bg-[#f8fbff] border-2 border-[#e5edf8] rounded-2xl"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 mb-5 sm:mb-6">
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-wider text-[#1769e0]">
                            CHECKPOINT EVALUASI
                          </div>
                          <h3 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                            Uji Pemahaman: {m.title}
                          </h3>
                        </div>
                        <div className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
                          {m.questions.length} Soal • Wajib Lulus 3/3
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 mb-5 sm:mb-6 text-left leading-relaxed">
                        Jawab semua soal di bawah ini. Untuk membuka subbab berikutnya secara otomatis, Anda harus meraih <strong>skor sempurna ({m.questions.length}/{m.questions.length})</strong>.
                      </p>

                      <div className="space-y-5 sm:space-y-6">
                        {m.questions.map((q, qIdx) => {
                          const qKey = `m${stageIndex}q${qIdx}`;
                          const selectedVal = tkpUserAnswers[qKey];
                          const isSubmitted = !!result?.isSubmitted;

                          return (
                            <div
                              key={qIdx}
                              className="p-4 sm:p-5 bg-white border border-[#e4e7ec] rounded-2xl shadow-xs"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-black tracking-wider text-[#1769e0] bg-[#eef5ff] px-2 py-0.5 rounded-md">
                                  {q.tag}
                                </span>
                              </div>
                              <div className="font-bold text-slate-800 text-sm sm:text-base mb-4 leading-relaxed text-left">
                                {q.text}
                              </div>

                              {/* OPTIONS */}
                              <div className="space-y-2">
                                {q.options.map((opt) => {
                                  const isSelected = selectedVal === opt.value;
                                  return (
                                    <label
                                      key={opt.value}
                                      onClick={() => handleSelectOption('tkp', stageIndex, qIdx, opt.value)}
                                      className={`flex items-start gap-2.5 sm:gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
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
                                        className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                                      />
                                      <span className="font-black text-[#1769e0] min-w-[14px]">
                                        {opt.value}
                                      </span>
                                      <span className="leading-relaxed text-left">{opt.text}</span>
                                    </label>
                                  );
                                })}
                              </div>

                              {/* EXPLANATION */}
                              {isSubmitted && selectedVal && (
                                <div className="mt-4 p-3.5 bg-[#f8fafc] border border-slate-200/70 text-[#475467] rounded-xl text-xs sm:text-sm leading-relaxed text-left">
                                  <strong className="text-slate-800">Pembahasan: </strong>
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* ACTION BUTTON & RESULT FEEDBACK */}
                      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4">
                        <button
                          type="button"
                          onClick={() => checkTkpAnswers(stageIndex)}
                          className="w-full sm:w-auto bg-[#1769e0] hover:bg-[#0f4fb8] text-white font-extrabold px-6 py-3 rounded-xl text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Periksa Jawaban</span>
                        </button>

                        {result && (
                          <div
                            className={`text-xs md:text-sm font-bold ${
                              result.isAllCorrect ? 'text-[#16a34a]' : 'text-[#dc2626]'
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

      {/* CONTENT: RUMUS SAKTI & CHEAT SHEET */}
      {activeSubject === 'cheatsheet' && (
        <>
          {/* HERO BANNER */}
          <header className="bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] text-white pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-[1120px] mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-3">
                  <Zap className="w-3.5 h-3.5 fill-amber-300" /> Kompilasi Rumus Cepat &amp; Kata Kunci SKD
                </div>
                <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-2">
                  Rumus Sakti &amp; Cheat Sheet
                </h1>
                <p className="text-sm sm:text-base text-indigo-100 max-w-2xl leading-relaxed">
                  Kumpulan rumus jalan pintas TIU, peta pasal krusial TWK, dan formula kata kunci jawaban skor 5 TKP yang wajib dikuasai sebelum masuk ruang ujian CAT BKN.
                </p>
              </div>

              {/* Action: Cetak / Simpan PDF */}
              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF Cheat Sheet</span>
                </button>
              </div>
            </div>
          </header>

          {/* MAIN CHEAT SHEET CONTAINER */}
          <main className="max-w-[1120px] mx-auto px-3 sm:px-4 -mt-7 sm:-mt-8 relative z-20 space-y-5 sm:space-y-6">
            
            {/* FILTER BAR & SEARCH */}
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3 md:p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'Semua Rumus & Kunci' },
                  { id: 'tiu', label: 'TIU (Hitung & Logika)' },
                  { id: 'tkp', label: 'TKP (Kata Kunci Skor 5)' },
                  { id: 'twk', label: 'TWK (Pasal & Sejarah)' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCheatSheetCategory(c.id as any)}
                    className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      cheatSheetCategory === c.id
                        ? 'bg-indigo-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.id === 'all' && <Zap className="w-3.5 h-3.5" />}
                    {c.id === 'tiu' && <Calculator className="w-3.5 h-3.5" />}
                    {c.id === 'tkp' && <Users className="w-3.5 h-3.5" />}
                    {c.id === 'twk' && <Landmark className="w-3.5 h-3.5" />}
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari rumus atau kata kunci..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                />
              </div>
            </div>

            {/* LIST OF CHEAT SHEET CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 printable-document">
              {filteredCheatSheets.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between break-inside-avoid"
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        item.category === 'tiu'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : item.category === 'tkp'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {item.badge}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                        SUBTES {item.category.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="font-heading text-base sm:text-lg font-extrabold text-slate-900 leading-snug mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {item.summary}
                    </p>

                    {/* Formula / Key Box */}
                    <div className="bg-slate-950 text-emerald-300 font-mono text-xs rounded-2xl p-3.5 sm:p-4 leading-relaxed whitespace-pre-wrap shadow-inner border border-slate-800 overflow-x-auto">
                      {item.keyFormula}
                    </div>
                  </div>

                  {/* Example / Trick */}
                  {item.exampleOrTrick && (
                    <div className="mt-4 pt-3 bg-amber-50/60 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 rounded-b-2xl sm:rounded-b-3xl border-t border-amber-100/70 text-xs text-amber-950 font-medium leading-relaxed">
                      <strong className="text-amber-900 flex items-center gap-1.5 font-bold mb-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Trik &amp; Contoh CAT:</span>
                      </strong>
                      <span className="whitespace-pre-wrap">{item.exampleOrTrick}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredCheatSheets.length === 0 && (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">Rumus atau kata kunci tidak ditemukan</h3>
                <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
              </div>
            )}

          </main>
        </>
      )}

      {/* COMPLETION MODAL */}
      {showCompletionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" strokeWidth={1.8} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              Selamat! Anda Lulus Modul {showCompletionModal.subject.toUpperCase()}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Anda telah menyelesaikan seluruh materi interaktif <strong>{showCompletionModal.subject.toUpperCase()} CPNS</strong> beserta semua soal uji pemahaman. Sekarang Anda siap menguji kemampuan di Try Out CPNS!
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/tryout-list"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow cursor-pointer"
              >
                Mulai Uji Try Out CPNS
              </Link>
              <button
                onClick={() => setShowCompletionModal({ isOpen: false, subject: 'twk' })}
                className="w-full py-2.5 text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
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
