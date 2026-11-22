'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MemberLayout from '@/components/MemberLayout';
import { 
  FLASHCARD_DECKS, 
  FLASHCARD_ITEMS, 
  Flashcard 
} from '@/data/flashcardsData';
import { 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  Bookmark, 
  Sparkles, 
  HelpCircle, 
  Trophy,
  Shuffle
} from 'lucide-react';

export default function FlashcardsPage() {
  const [selectedDeck, setSelectedDeck] = useState<string>('all');
  const [cards, setCards] = useState<Flashcard[]>(FLASHCARD_ITEMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [unmasteredIds, setUnmasteredIds] = useState<string[]>([]);

  // 1. Muat status hafalan dari localStorage
  useEffect(() => {
    try {
      const savedMastered = localStorage.getItem('cpns_flashcards_mastered');
      if (savedMastered) setMasteredIds(JSON.parse(savedMastered));

      const savedUnmastered = localStorage.getItem('cpns_flashcards_unmastered');
      if (savedUnmastered) setUnmasteredIds(JSON.parse(savedUnmastered));
    } catch {
      // ignore
    }
  }, []);

  // 2. Filter kartu berdasarkan deck yang dipilih
  useEffect(() => {
    let filtered = FLASHCARD_ITEMS;
    if (selectedDeck !== 'all') {
      filtered = FLASHCARD_ITEMS.filter(c => c.deck === selectedDeck);
    }
    setCards(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedDeck]);

  // Simpan progres ke localStorage
  const saveProgress = (newMastered: string[], newUnmastered: string[]) => {
    setMasteredIds(newMastered);
    setUnmasteredIds(newUnmastered);
    try {
      localStorage.setItem('cpns_flashcards_mastered', JSON.stringify(newMastered));
      localStorage.setItem('cpns_flashcards_unmastered', JSON.stringify(newUnmastered));
      
      // Update Daily Quest "Hafalan Flashcard" jika ada
      const today = new Date().toISOString().split('T')[0];
      const questKey = `cpns_daily_quests_${today}`;
      const savedQuests = localStorage.getItem(questKey);
      if (savedQuests) {
        const parsed = JSON.parse(savedQuests);
        if (!parsed.flashcards) {
          parsed.flashcards = true;
          localStorage.setItem(questKey, JSON.stringify(parsed));
        }
      }
    } catch {
      // ignore
    }
  };

  const currentCard: Flashcard | undefined = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  // Tandai: Masih Lupa (Spaced Repetition)
  const handleMarkUnmastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;

    const newUnmastered = Array.from(new Set([...unmasteredIds, currentCard.id]));
    const newMastered = masteredIds.filter(id => id !== currentCard.id);
    saveProgress(newMastered, newUnmastered);

    // Lanjut ke kartu berikutnya
    handleNext();
  };

  // Tandai: Sudah Hafal / Paham
  const handleMarkMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;

    const newMastered = Array.from(new Set([...masteredIds, currentCard.id]));
    const newUnmastered = unmasteredIds.filter(id => id !== currentCard.id);
    saveProgress(newMastered, newUnmastered);

    // Lanjut ke kartu berikutnya
    handleNext();
  };

  const isCurrentMastered = currentCard ? masteredIds.includes(currentCard.id) : false;
  const isCurrentUnmastered = currentCard ? unmasteredIds.includes(currentCard.id) : false;

  const totalDeckMastered = cards.filter(c => masteredIds.includes(c.id)).length;
  const deckProgressPercent = cards.length > 0 ? Math.round((totalDeckMastered / cards.length) * 100) : 0;

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Flashcard Spaced Repetition
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white">Kartu Hafalan Cepat TWK</h1>
              <p className="text-blue-100 text-xs md:text-sm mt-1 max-w-lg">
                Hafal pasal-pasal UUD 1945, tokoh bangsa, dan nilai integritas tanpa bosan dengan metode bolak-balik kartu pintar.
              </p>
            </div>
            
            {/* Progress Badge */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center shrink-0 backdrop-blur-sm">
              <div className="text-2xl font-black text-amber-300 font-mono">{totalDeckMastered} / {cards.length}</div>
              <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">Hafal ({deckProgressPercent}%)</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 h-2 rounded-full mt-5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${deckProgressPercent}%` }}
            />
          </div>
        </div>

        {/* DECK SELECTOR (Tabs) */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FLASHCARD_DECKS.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDeck(d.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedDeck === d.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.02]'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{d.icon}</span>
              <span>{d.name}</span>
            </button>
          ))}
        </div>

        {/* FLASHCARD INTERACTIVE VIEWER */}
        {cards.length > 0 && currentCard ? (
          <div className="space-y-4">
            
            {/* CARD CONTAINER (CLICK TO FLIP) */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative w-full min-h-[340px] md:min-h-[380px] bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-lg cursor-pointer hover:shadow-xl transition-all group flex flex-col justify-between select-none"
            >
              {/* TOP BAR OF CARD */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
                <span className="font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4" />
                  {currentCard.deckName}
                </span>

                <div className="flex items-center gap-2">
                  {isCurrentMastered && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sudah Hafal
                    </span>
                  )}
                  {isCurrentUnmastered && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-600" /> Perlu Diulang
                    </span>
                  )}
                  <span className="text-slate-400 font-mono font-semibold">
                    {currentIndex + 1} / {cards.length}
                  </span>
                </div>
              </div>

              {/* CARD BODY: FRONT (QUESTION) OR BACK (ANSWER) */}
              <div className="my-auto py-6 text-center">
                {!isFlipped ? (
                  <div className="space-y-3 animate-fadeIn">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                      🤔 PERTANYAAN
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-snug max-w-xl mx-auto">
                      {currentCard.question}
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1 pt-2">
                      <RotateCw className="w-3.5 h-3.5" /> Klik kartu untuk melihat jawaban & trik hafalan
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fadeIn text-left max-w-xl mx-auto">
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                        💡 JAWABAN & PEMBAHASAN
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5 text-sm text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                      {currentCard.answer}
                    </div>

                    {currentCard.keyNote && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">Tips Kunci CAT:</strong> {currentCard.keyNote}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* BOTTOM FLIP HELPER */}
              <div className="text-center pt-3 border-t border-slate-100 text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                {isFlipped ? '🔄 Klik untuk kembali ke pertanyaan' : '👆 Ketuk di mana saja untuk membalik kartu'}
              </div>
            </div>

            {/* ACTION BUTTONS (SPACED REPETITION CONTROLS) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3 shadow-xs">
              
              {/* Prev / Next Nav */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={handleShuffle}
                  title="Acak Urutan Kartu"
                  className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer flex items-center gap-1"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  Berikutnya <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Repetition Buttons: Masih Lupa vs Sudah Hafal */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleMarkUnmastered}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Masih Lupa</span>
                </button>
                <button
                  type="button"
                  onClick={handleMarkMastered}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm shadow-emerald-600/20 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sudah Hafal!</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl p-6">
            <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Tidak ada kartu pada kategori ini</h3>
            <p className="text-xs text-slate-500 mt-1">Pilih kategori lainnya pada tab di atas.</p>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
