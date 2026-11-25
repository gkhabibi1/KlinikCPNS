'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import MemberLayout from '../../../components/MemberLayout';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Flame, 
  Target, 
  RotateCcw, 
  ArrowRight, 
  Filter, 
  Search,
  BookMarked,
  BrainCircuit,
  Award,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Printer,
  FileDown,
  X
} from 'lucide-react';

interface MistakeItem {
  id: string;
  question_id?: string;
  package_id?: string;
  package_name?: string;
  question_text: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  option_e?: string;
  options?: { [key: string]: string };
  correct_answer: string;
  user_answer?: string;
  explanation?: string;
  category: 'TWK' | 'TIU' | 'TKP';
  is_mastered: boolean;
  created_at: string;
}

export default function EvaluasiPage() {
  const router = useRouter();
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'TWK' | 'TIU' | 'TKP'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNMASTERED' | 'MASTERED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMode, setActiveMode] = useState<'review' | 'drill'>('review');

  // State untuk Drill Mode (Kuis Latihan Ulang)
  const [drillIndex, setDrillIndex] = useState(0);
  const [drillSelectedAnswer, setDrillSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isDrillSuccess, setIsDrillSuccess] = useState(false);

  // State untuk Cetak / Ekspor PDF
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [userName, setUserName] = useState('Member CPNS');

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    setIsLoading(true);
    let combinedMistakes: MistakeItem[] = [];

    // 1. Ambil dari localStorage (instant cache)
    try {
      const localData = localStorage.getItem('user_mistakes');
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed)) {
          combinedMistakes = [...parsed];
        }
      }
    } catch (e) {
      console.warn('Gagal membaca localStorage:', e);
    }

    // 2. Ambil dari database Supabase jika login
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
        if (prof?.full_name) setUserName(prof.full_name);

        const { data, error } = await supabase
          .from('user_mistakes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Gabungkan data dari DB dengan lokal, hindari duplikasi ID / text
          const dbMap = new Map<string, MistakeItem>();
          data.forEach((item: any) => dbMap.set(item.question_text.trim(), item));
          combinedMistakes.forEach((item: MistakeItem) => {
            if (!dbMap.has(item.question_text.trim())) {
              dbMap.set(item.question_text.trim(), item);
            }
          });
          combinedMistakes = Array.from(dbMap.values());
        }
      }
    } catch (err) {
      console.warn('Tabel user_mistakes mungkin belum dimigrasi di Supabase:', err);
    }

    setMistakes(combinedMistakes);
    setIsLoading(false);
  };

  // Toggle status sudah dikuasai / belum
  const toggleMastered = async (item: MistakeItem) => {
    const updatedStatus = !item.is_mastered;
    const newMistakes = mistakes.map(m => m.id === item.id ? { ...m, is_mastered: updatedStatus } : m);
    setMistakes(newMistakes);
    localStorage.setItem('user_mistakes', JSON.stringify(newMistakes));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && item.id && !item.id.startsWith('local-')) {
        await supabase
          .from('user_mistakes')
          .update({ is_mastered: updatedStatus })
          .eq('id', item.id);
      }
    } catch {
      // ignore
    }
  };

  // Filter daftar kesalahan
  const filteredMistakes = mistakes.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesStatus = 
      filterStatus === 'ALL' || 
      (filterStatus === 'MASTERED' && item.is_mastered) ||
      (filterStatus === 'UNMASTERED' && !item.is_mastered);
    const matchesSearch = 
      !searchQuery || 
      item.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.explanation && item.explanation.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const totalWrong = mistakes.length;
  const masteredCount = mistakes.filter(m => m.is_mastered).length;
  const unmasteredCount = totalWrong - masteredCount;
  const masteryPercentage = totalWrong > 0 ? Math.round((masteredCount / totalWrong) * 100) : 0;

  // Handler Drill Mode
  const currentDrillItem = filteredMistakes[drillIndex];

  const handleCheckDrill = () => {
    if (!drillSelectedAnswer || !currentDrillItem) return;
    setIsAnswerChecked(true);

    const isCorrect = drillSelectedAnswer.trim().toUpperCase() === currentDrillItem.correct_answer.trim().toUpperCase();
    setIsDrillSuccess(isCorrect);

    if (isCorrect && !currentDrillItem.is_mastered) {
      toggleMastered(currentDrillItem);
    }
  };

  const handleNextDrill = () => {
    setDrillSelectedAnswer(null);
    setIsAnswerChecked(false);
    setIsDrillSuccess(false);
    if (drillIndex < filteredMistakes.length - 1) {
      setDrillIndex(prev => prev + 1);
    } else {
      setDrillIndex(0);
    }
  };

  return (
    <MemberLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
        
        {/* HEADER HERO */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/30 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                <span>Smart Weakness Analyzer & Remedial Hub</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <BookOpen className="w-7 h-7 text-cyan-400 shrink-0" strokeWidth={1.8} />
                <span>Buku Evaluasi &amp; Bank Soal Salah</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                Kumpulan seluruh soal yang pernah Anda jawab salah saat try out. Latih dan kuasai kembali secara terarah agar kesalahan serupa tidak terulang di ujian CAT BKN sesungguhnya!
              </p>
            </div>

            {/* Metric Pills */}
            <div className="w-full md:w-auto grid grid-cols-3 gap-2 sm:gap-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 sm:p-4 shrink-0 backdrop-blur-md shadow-inner text-center">
              <div>
                <div className="text-lg sm:text-2xl font-black text-rose-400 font-mono">{totalWrong}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Soal Salah</div>
              </div>
              <div className="border-x border-slate-800 px-2 sm:px-3">
                <div className="text-lg sm:text-2xl font-black text-emerald-400 font-mono">{masteredCount}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dikuasai</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-cyan-400 font-mono">{masteryPercentage}%</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Akurasi</div>
              </div>
            </div>
          </div>

          {/* Progress Mastery Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                TARGET PENGUASAAN KELEMAHAN
              </span>
              <span className="text-cyan-300 font-bold">{masteredCount} DARI {totalWrong} SOAL TELAH DIKUASAI</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${masteryPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* CONTROLS & FILTER BAR */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setActiveMode('review')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'review'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Daftar Soal & Kunci</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode('drill');
                setDrillIndex(0);
                setDrillSelectedAnswer(null);
                setIsAnswerChecked(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'drill'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mode Kuis Latihan Ulang (Drill)</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['ALL', 'TWK', 'TIU', 'TKP'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setDrillIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat === 'ALL' ? 'Semua Subtes' : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-auto md:min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik atau kata kunci..."
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition"
            />
          </div>

          {/* Ekspor PDF / Cetak Rangkuman */}
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            disabled={filteredMistakes.length === 0}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-300 hover:border-blue-600 hover:text-blue-600 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-40 cursor-pointer shrink-0"
            title="Cetak atau Simpan sebagai PDF"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Ekspor PDF ({filteredMistakes.length})</span>
          </button>

        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500 font-medium">Memuat bank soal salah...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && filteredMistakes.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              🎉
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">
                {totalWrong === 0 ? 'Belum Ada Soal Salah Tercatat' : 'Semua Soal Telah Dikuasai!'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {totalWrong === 0 
                  ? 'Setiap kali Anda mengerjakan try out dan terdapat soal yang kurang tepat, sistem akan otomatis mencatatnya di sini sebagai bahan evaluasi.'
                  : 'Luar biasa! Tidak ada soal yang tersisa pada kriteria filter saat ini. Pertahankan konsistensi latihan Anda!'}
              </p>
            </div>
            <Link
              href="/tryout-list"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <span>Kerjakan Try Out Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* ================= TAMPILAN 1: MODE REVIEW DAFTAR SOAL ================= */}
        {!isLoading && activeMode === 'review' && filteredMistakes.length > 0 && (
          <div className="space-y-4">
            {filteredMistakes.map((item, index) => {
              const options = [
                { key: 'A', text: item.option_a },
                { key: 'B', text: item.option_b },
                { key: 'C', text: item.option_c },
                { key: 'D', text: item.option_d },
                { key: 'E', text: item.option_e }
              ].filter(opt => Boolean(opt.text));

              return (
                <div 
                  key={item.id || index}
                  className={`bg-white border rounded-2xl p-5 sm:p-6 transition-all shadow-sm ${
                    item.is_mastered ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                  }`}
                >
                  {/* Top Bar Card */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.category === 'TWK' ? 'bg-rose-100 text-rose-700' :
                        item.category === 'TIU' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Soal #{index + 1}
                      </span>
                      {item.package_name && (
                        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                          • {item.package_name}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleMastered(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        item.is_mastered
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {item.is_mastered ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Sudah Dikuasai</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>Tandai Dikuasai</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Pertanyaan */}
                  <div className="text-sm font-semibold text-slate-900 leading-relaxed mb-4">
                    {item.question_text}
                  </div>

                  {/* Pilihan Jawaban */}
                  <div className="space-y-1.5 mb-4">
                    {options.map((opt) => {
                      const isCorrect = opt.key.toUpperCase() === item.correct_answer.toUpperCase();
                      const isUserAnswer = item.user_answer && opt.key.toUpperCase() === item.user_answer.toUpperCase();

                      let optClass = 'bg-slate-50 border-slate-200 text-slate-700';

                      if (isCorrect) {
                        optClass = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold ring-1 ring-emerald-400';
                      } else if (isUserAnswer) {
                        optClass = 'bg-rose-50 border-rose-400 text-rose-900 font-semibold';
                      }

                      return (
                        <div 
                          key={opt.key}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs leading-normal ${optClass}`}
                        >
                          <span className="font-bold w-5 shrink-0 text-center">{opt.key}.</span>
                          <span className="flex-1">{opt.text}</span>
                          {isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                              Kunci Benar
                            </span>
                          )}
                          {!isCorrect && isUserAnswer && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">
                              Jawaban Anda
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Kotak Pembahasan */}
                  {item.explanation && (
                    <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl p-3.5 text-xs text-indigo-950 space-y-1">
                      <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Pembahasan & Rumus Cepat:</span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* ================= TAMPILAN 2: MODE KUIS DRILL INTERAKTIF ================= */}
        {!isLoading && activeMode === 'drill' && currentDrillItem && (
          <div className="bg-white border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Header Drill */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-600 text-white">
                  KUIS REMEDIAL
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Soal {drillIndex + 1} dari {filteredMistakes.length}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  currentDrillItem.category === 'TWK' ? 'bg-rose-100 text-rose-700' :
                  currentDrillItem.category === 'TIU' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {currentDrillItem.category}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {currentDrillItem.is_mastered ? 'Status: Dikuasai' : 'Status: Belum Dikuasai'}
              </div>
            </div>

            {/* Pertanyaan */}
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {currentDrillItem.question_text}
            </div>

            {/* Pilihan Interaktif */}
            <div className="space-y-2">
              {[
                { key: 'A', text: currentDrillItem.option_a },
                { key: 'B', text: currentDrillItem.option_b },
                { key: 'C', text: currentDrillItem.option_c },
                { key: 'D', text: currentDrillItem.option_d },
                { key: 'E', text: currentDrillItem.option_e }
              ].filter(opt => Boolean(opt.text)).map(opt => {
                const isSelected = drillSelectedAnswer === opt.key;
                const isCorrectKey = opt.key.toUpperCase() === currentDrillItem.correct_answer.toUpperCase();

                let cardStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';

                if (isAnswerChecked) {
                  if (isCorrectKey) {
                    cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400';
                  } else if (isSelected) {
                    cardStyle = 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-400';
                  }
                } else if (isSelected) {
                  cardStyle = 'bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500';
                }

                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => setDrillSelectedAnswer(opt.key)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${cardStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {opt.key}
                    </span>
                    <span className="text-sm leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Hasil Jawaban */}
            {isAnswerChecked && (
              <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                isDrillSuccess ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                <div className="font-bold flex items-center gap-2 text-sm">
                  {isDrillSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Luar Biasa! Jawaban Anda Benar! 🎉</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span>Jawaban Belum Tepat (Kunci: {currentDrillItem.correct_answer})</span>
                    </>
                  )}
                </div>
                {currentDrillItem.explanation && (
                  <p className="text-slate-700 leading-relaxed pt-1 border-t border-slate-200">
                    <strong>Pembahasan:</strong> {currentDrillItem.explanation}
                  </p>
                )}
              </div>
            )}

            {/* Tombol Aksi Drill */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  if (drillIndex > 0) {
                    setDrillIndex(prev => prev - 1);
                    setDrillSelectedAnswer(null);
                    setIsAnswerChecked(false);
                  }
                }}
                disabled={drillIndex === 0}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                ← Sebelumnya
              </button>

              {!isAnswerChecked ? (
                <button
                  type="button"
                  onClick={handleCheckDrill}
                  disabled={!drillSelectedAnswer}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Periksa Jawaban
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextDrill}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <span>{drillIndex < filteredMistakes.length - 1 ? 'Soal Berikutnya' : 'Ulangi dari Awal'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        )}

        {/* MODAL CETAK / EKSPOR PDF RANGKUMAN EVALUASI */}
        {showPrintModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              
              {/* Modal Top Header (No-print) */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Pratinjau Dokumen PDF / Cetak</h3>
                    <p className="text-[11px] text-slate-500">Siap dicetak atau disimpan sebagai PDF (Kertas A4)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Sekarang (PDF)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(false)}
                    className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Body Content */}
              <div className="p-4 sm:p-8 overflow-y-auto space-y-6 text-slate-900 printable-document">
                
                {/* Kop Surat Dokumen */}
                <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div>
                    <h1 className="text-lg sm:text-2xl font-black tracking-tight text-blue-900 uppercase">
                      KLINIK CPNS • BUKU EVALUASI SOAL SALAH
                    </h1>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Dokumen Rangkuman Mandiri &amp; Pembahasan Kunci Ujian Simulasi CAT BKN
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-[11px] text-slate-500 shrink-0">
                    <div>Nama: <strong>{userName}</strong></div>
                    <div>Tanggal: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
                    <div>Kategori: <strong>{selectedCategory === 'ALL' ? 'Semua Subtes' : selectedCategory}</strong></div>
                    <div>Total: <strong>{filteredMistakes.length} Soal</strong></div>
                  </div>
                </div>

                {/* List of Questions for Print */}
                <div className="space-y-6">
                  {filteredMistakes.map((item, idx) => (
                    <div key={item.id} className="border-b border-slate-200 pb-5 space-y-2.5 break-inside-avoid">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">
                          SOAL #{idx + 1} • <span className="text-blue-600 uppercase">{item.category}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.package_name || 'Simulasi CAT BKN'}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                        {item.question_text}
                      </p>

                      {/* Options */}
                      <div className="grid grid-cols-1 gap-1 text-xs pl-2">
                        {['a', 'b', 'c', 'd', 'e'].map((optKey) => {
                          const optText = item.options ? item.options[optKey] : ((item as any)['option_' + optKey] || '');
                          if (!optText) return null;
                            const isUserChoice = (item.user_answer || '').toUpperCase() === optKey.toUpperCase();
                            const isCorrectChoice = (item.correct_answer || '').toUpperCase() === optKey.toUpperCase();

                            return (
                              <div 
                                key={optKey} 
                                className={`py-1 px-2 rounded font-medium flex items-start gap-1.5 ${
                                  isCorrectChoice 
                                    ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300' 
                                    : isUserChoice 
                                    ? 'bg-rose-50 text-rose-900 border border-rose-200' 
                                    : 'text-slate-700'
                                }`}
                              >
                                <span className="font-bold uppercase w-4">{optKey}.</span>
                                <span>{optText}</span>
                                {isCorrectChoice && <span className="text-[10px] text-emerald-700 font-bold ml-auto">(Kunci Jawaban)</span>}
                                {isUserChoice && !isCorrectChoice && <span className="text-[10px] text-rose-700 font-bold ml-auto">(Pilihan Anda)</span>}
                              </div>
                            );
                          })}
                        </div>

                      {/* Explanation Box */}
                      {item.explanation && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed mt-2">
                          <strong className="text-blue-900">Pembahasan: </strong>
                          {item.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer Dokumen */}
                <div className="pt-6 border-t border-slate-300 text-center text-[10px] text-slate-400">
                  © {new Date().getFullYear()} Klinik CPNS • Hak Cipta Dilindungi. Dicetak otomatis dari dashboard member Klinik CPNS.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </MemberLayout>
  );
}
