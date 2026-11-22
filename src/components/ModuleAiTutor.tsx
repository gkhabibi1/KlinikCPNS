'use client';

import React, { useState } from 'react';
import { Sparkles, Send, HelpCircle, MessageSquare, ChevronDown, ChevronUp, Bot, User } from 'lucide-react';
import ChatMessageContent from './ChatMessageContent';

interface ModuleAiTutorProps {
  moduleTitle: string;
  subject: string;
  className?: string;
}

interface QnAPair {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
}

export default function ModuleAiTutor({
  moduleTitle,
  subject,
  className = ''
}: ModuleAiTutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [qnaList, setQnaList] = useState<QnAPair[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const SUGGESTED_PROMPTS = [
    `Beri 1 contoh soal & trik cepat untuk materi ${moduleTitle}`,
    `Jelaskan konsep ${moduleTitle} dengan analogi sederhana sehari-hari`,
    `Apa jebakan yang paling sering membuat peserta terkecoh di materi ini?`
  ];

  const handleAsk = async (textToAsk?: string) => {
    const query = (textToAsk || question).trim();
    if (!query || isLoading) return;

    const tempId = `qna-${Date.now()}`;
    const userPrompt = query;
    setQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'member-tutor',
          userName: 'Pejuang CPNS',
          message: `[Konteks Modul: ${moduleTitle} (${subject.toUpperCase()})]\n${userPrompt}`
        })
      });

      let aiReply = '';
      if (res.ok) {
        const data = await res.json();
        aiReply = data.reply || '';
      }

      if (!aiReply) {
        // Fallback cerdas jika API tidak merespons
        aiReply = `💡 **Penjelasan AI Tutor untuk "${moduleTitle}":**\n\nUntuk memahami konsep **${moduleTitle}**, kuncinya adalah fokus pada indikator inti soal CAT BKN:\n\n• **Konsep Dasar:** Pastikan Anda memahami definisi dan aturan baku sebelum menghafal trik cepat.\n• **Trik Eliminasi Opsi:** Pada soal pilihan ganda CAT BKN, selalu eliminasi 2 opsi yang paling tidak masuk akal atau bertentangan dengan prinsip ASN.\n• **Tips Praktik:** Ujilah pemahaman Anda dengan mengerjakan kuis tahap di bawah ini atau latihan di menu *Speed Drill*.`;
      }

      setQnaList(prev => [
        ...prev,
        {
          id: tempId,
          question: userPrompt,
          answer: aiReply,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      setQnaList(prev => [
        ...prev,
        {
          id: tempId,
          question: userPrompt,
          answer: `💡 **Tips Tutor AI:** Untuk materi **${moduleTitle}**, perhatikan kata kunci utama dan jangan terburu-buru. Cobalah selesaikan soal latihan tahap ini untuk menguji pemahaman Anda!`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`mt-8 border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 via-blue-50/30 to-white rounded-3xl p-5 md:p-6 shadow-xs ${className}`}>
      {/* Header Widget */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
              <span>Asisten Belajar Virtual</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
              Tanya Konsep AI: {moduleTitle}
            </h4>
          </div>
        </div>

        <button 
          type="button" 
          className="p-2 rounded-xl hover:bg-white/80 text-slate-500 transition cursor-pointer"
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Konten Terbuka */}
      {isOpen && (
        <div className="mt-5 pt-5 border-t border-indigo-100 space-y-4 animate-fadeIn">
          
          {/* Quick Prompt Chips */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              Pertanyaan Cepat yang Sering Ditanyakan:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAsk(p)}
                  disabled={isLoading}
                  className="text-[11px] font-medium bg-white hover:bg-indigo-50 border border-indigo-200/80 text-indigo-900 px-3 py-1.5 rounded-xl transition shadow-xs hover:border-indigo-400 cursor-pointer disabled:opacity-50 text-left"
                >
                  ✨ {p}
                </button>
              ))}
            </div>
          </div>

          {/* List Percakapan / Tanya Jawab */}
          {qnaList.length > 0 && (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {qnaList.map((item) => (
                <div key={item.id} className="space-y-2 bg-white/90 border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
                  {/* User Question */}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Pertanyaan Anda ({item.timestamp}):</span>
                      <p className="text-xs font-semibold text-slate-800">{item.question}</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3">
                      <ChatMessageContent content={item.answer} variant="bot" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              <span className="font-semibold text-[11px]">AI Tutor sedang menyusun penjelasan untuk Anda...</span>
            </div>
          )}

          {/* Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleAsk(); }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={`Tanyakan konsep atau contoh kasus untuk "${moduleTitle}"...`}
              disabled={isLoading}
              className="flex-1 bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Tanyakan</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
