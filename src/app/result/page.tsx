'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Share2, 
  Download, 
  BookOpen, 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Flame,
  Printer
} from 'lucide-react';

export default function ResultPage() {
  const router = useRouter();
  const [hasil, setHasil] = useState<any>(null);
  const [packageName, setPackageName] = useState('');
  const [studentName, setStudentName] = useState('Calon ASN');
  const [isLoading, setIsLoading] = useState(true);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  useEffect(() => {
    const loadResult = async () => {
      try {
        // Ambil nama user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .maybeSingle();
          if (profile?.full_name) {
            setStudentName(profile.full_name);
          } else if (user.email) {
            setStudentName(user.email.split('@')[0]);
          }
        }

        // 1. Dapatkan package_id dari query params atau path URL
        const searchParams = new URLSearchParams(window.location.search);
        const queryPackageId = searchParams.get('package_id');
        
        const urlParts = window.location.pathname.split('/');
        const pathLastPart = urlParts[urlParts.length - 1];
        const targetPackageId = queryPackageId || (pathLastPart !== 'result' ? pathLastPart : null);

        // 2. Cek berbagai kemungkinan key localStorage
        let reviewRaw: string | null = null;

        if (targetPackageId) {
          reviewRaw = localStorage.getItem(`exam_review_${targetPackageId}`);
        }

        if (!reviewRaw) {
          reviewRaw = localStorage.getItem('latest_exam_review') || localStorage.getItem('hasilTryOut');
        }

        if (!reviewRaw) {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('exam_review_')) {
              reviewRaw = localStorage.getItem(key);
              if (reviewRaw) break;
            }
          }
        }

        if (reviewRaw) {
          const parsed = JSON.parse(reviewRaw);
          
          const skorData = parsed.skor || parsed;
          const twkVal = skorData.twk ?? skorData.TWK ?? 0;
          const tiuVal = skorData.tiu ?? skorData.TIU ?? 0;
          const tkpVal = skorData.tkp ?? skorData.TKP ?? 0;
          const totalVal = skorData.total ?? (twkVal + tiuVal + tkpVal);
          const isPassedVal = skorData.lulus ?? (twkVal >= 65 && tiuVal >= 80 && tkpVal >= 166);

          setHasil({
            twk: twkVal,
            tiu: tiuVal,
            tkp: tkpVal,
            total: totalVal,
            lulus: isPassedVal,
            passingGrade: skorData.passingGrade || { twk: 65, tiu: 80, tkp: 166 }
          });
          
          setPackageName(parsed.package_name || 'Try Out SKD CPNS');

          // 3. Ekstrak Soal Salah untuk dimasukkan ke "Buku Evaluasi / Buku Dosa"
          if (parsed.questions && Array.isArray(parsed.questions) && parsed.answers) {
            const mistakesToAdd: any[] = [];
            
            parsed.questions.forEach((q: any) => {
              const userAns = parsed.answers[q.question_number];
              const isCorrect = q.category === 'TKP'
                ? Boolean(userAns)
                : (userAns && userAns.trim().toUpperCase() === q.correct_answer.trim().toUpperCase());

              if (!isCorrect) {
                mistakesToAdd.push({
                  id: `mistake-${q.id || q.question_number}-${Date.now()}`,
                  question_id: q.id,
                  package_id: targetPackageId || null,
                  package_name: parsed.package_name || 'Try Out SKD',
                  question_text: q.question_text,
                  option_a: q.option_a,
                  option_b: q.option_b,
                  option_c: q.option_c,
                  option_d: q.option_d,
                  option_e: q.option_e,
                  correct_answer: q.correct_answer,
                  user_answer: userAns || 'Tidak Dijawab',
                  explanation: q.explanation || 'Pembahasan materi belum tersedia.',
                  category: (q.category as 'TWK' | 'TIU' | 'TKP') || 'TIU',
                  is_mastered: false,
                  created_at: new Date().toISOString()
                });
              }
            });

            setWrongCount(mistakesToAdd.length);

            // Simpan ke localStorage agar langsung muncul di Buku Evaluasi
            if (mistakesToAdd.length > 0) {
              try {
                const existingMistakesRaw = localStorage.getItem('user_mistakes');
                let existingList = existingMistakesRaw ? JSON.parse(existingMistakesRaw) : [];
                if (!Array.isArray(existingList)) existingList = [];

                // Filter duplikasi teks soal
                const textSet = new Set(existingList.map((m: any) => m.question_text.trim()));
                const newOnly = mistakesToAdd.filter(m => !textSet.has(m.question_text.trim()));
                const merged = [...newOnly, ...existingList];
                localStorage.setItem('user_mistakes', JSON.stringify(merged));

                // Jika user login, simpan juga ke Supabase table user_mistakes
                if (user && newOnly.length > 0) {
                  const dbPayload = newOnly.map(m => ({
                    user_id: user.id,
                    question_id: m.question_id || null,
                    package_id: m.package_id || null,
                    package_name: m.package_name,
                    question_text: m.question_text,
                    option_a: m.option_a,
                    option_b: m.option_b,
                    option_c: m.option_c,
                    option_d: m.option_d,
                    option_e: m.option_e,
                    correct_answer: m.correct_answer,
                    user_answer: m.user_answer,
                    explanation: m.explanation,
                    category: m.category,
                    is_mastered: false
                  }));
                  supabase.from('user_mistakes').insert(dbPayload).then(() => {});
                }
              } catch (storageErr) {
                console.warn('Gagal menyimpan soal salah:', storageErr);
              }
            }
          }

          setIsLoading(false);
          return;
        }

        // 4. Jika tidak ada di localStorage, ambil dari database Supabase
        const { data: { session } } = await supabase.auth.getSession();
        const loggedUser = session?.user;
        
        if (!loggedUser) {
          setIsLoading(false);
          return;
        }

        let query = supabase
          .from('exam_results')
          .select(`
            skor_twk,
            skor_tiu,
            skor_tkp,
            skor_total,
            is_passed,
            tryout_packages(name)
          `)
          .eq('user_id', loggedUser.id);

        if (targetPackageId) {
          query = query.eq('package_id', targetPackageId);
        }

        const { data: examResults, error } = await query
          .order('created_at', { ascending: false })
          .limit(1);

        if (examResults && examResults.length > 0) {
          const result = examResults[0];
          const twkVal = result.skor_twk || 0;
          const tiuVal = result.skor_tiu || 0;
          const tkpVal = result.skor_tkp || 0;
          const totalVal = result.skor_total || (twkVal + tiuVal + tkpVal);
          const isPassedVal = result.is_passed !== undefined ? result.is_passed : (twkVal >= 65 && tiuVal >= 80 && tkpVal >= 166);
          
          setHasil({
            twk: twkVal,
            tiu: tiuVal,
            tkp: tkpVal,
            total: totalVal,
            lulus: isPassedVal,
            passingGrade: { twk: 65, tiu: 80, tkp: 166 }
          });
          
          // @ts-ignore
          setPackageName(result.tryout_packages?.name || 'Try Out SKD');
        }
        
      } catch (error) {
        console.error('Error loading result:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="text-slate-500 font-medium text-xs">Memuat evaluasi hasil ujian...</div>
        </div>
      </div>
    );
  }

  if (!hasil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-2xl">
            📋
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Hasil Tidak Ditemukan</h2>
          <p className="text-slate-600 text-xs leading-relaxed">
            Data hasil pengerjaan try out tidak dapat dimuat. Pastikan Anda telah menyelesaikan ujian.
          </p>
          <Link 
            href="/dashboard"
            className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isLulus = hasil.lulus || (hasil.twk >= 65 && hasil.tiu >= 80 && hasil.tkp >= 166);

  // Menentukan subtes yang paling lemah
  const twkPercent = (hasil.twk / 150) * 100;
  const tiuPercent = (hasil.tiu / 175) * 100;
  const tkpPercent = (hasil.tkp / 225) * 100;

  let weakestSubtest = 'TIU';
  let weakestAdvice = 'Tingkatkan trik rumus cepat pada Silogisme, Analogi, dan Berhitung Cepat.';
  let weakestLink = '/dashboard/materi?tab=tiu';

  if (twkPercent <= tiuPercent && twkPercent <= tkpPercent) {
    weakestSubtest = 'TWK';
    weakestAdvice = 'Perdalam materi Wawasan Kebangsaan, terutama Nasionalisme, Bela Negara, dan Pilar Negara.';
    weakestLink = '/dashboard/materi?tab=twk';
  } else if (tkpPercent <= twkPercent && tkpPercent <= tiuPercent) {
    weakestSubtest = 'TKP';
    weakestAdvice = 'Pahami pola pembobotan nilai 5 pada aspek Pelayanan Publik, Jejaring Kerja, dan Profesionalisme.';
    weakestLink = '/dashboard/materi?tab=tkp';
  }

  const shareText = `Halo! Saya baru saja menyelesaikan ${packageName} di Klinik CPNS dengan skor Total: ${hasil.total} (TWK: ${hasil.twk}, TIU: ${hasil.tiu}, TKP: ${hasil.tkp}) - Status: ${isLulus ? 'MEMENUHI PASSING GRADE' : 'BELUM MEMENUHI PASSING GRADE'}. Ayo latihan bareng di klinikcpns.com!`;
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen bg-slate-100/60 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* MAIN RESULT CARD */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 px-6 sm:px-8 py-7 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                Official CAT BKN Simulation Result
              </span>
              <h1 className="text-2xl sm:text-3xl font-black pt-1">Hasil Try Out SKD CPNS</h1>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">{packageName}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Status Kelulusan Passing Grade */}
            <div className={`p-5 rounded-2xl border-2 text-center transition-all ${
              isLulus 
                ? 'bg-emerald-50/90 border-emerald-400 text-emerald-900 shadow-sm' 
                : 'bg-rose-50/90 border-rose-400 text-rose-900 shadow-sm'
            }`}>
              <div className="text-3xl mb-1">{isLulus ? '🎉' : '⚠️'}</div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {isLulus ? 'MEMENUHI PASSING GRADE BKN' : 'BELUM MEMENUHI PASSING GRADE BKN'}
              </h2>
              <p className="text-xs sm:text-sm mt-1 max-w-xl mx-auto leading-relaxed">
                {isLulus 
                  ? 'Selamat! Seluruh subtes (TWK, TIU, TKP) Anda telah berhasil melampaui standar nilai ambang batas resmi BKN.' 
                  : 'Jangan patah semangat! Masih ada subtes yang berada di bawah ambang batas minimal. Evaluasi kelemahan Anda dan latih kembali sekarang.'}
              </p>
            </div>

            {/* 3 Subtest Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* TWK */}
              <div className={`p-5 rounded-2xl border-2 text-center space-y-2 transition-all ${
                hasil.twk >= 65 ? 'bg-emerald-50/50 border-emerald-300' : 'bg-rose-50/50 border-rose-300'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">TWK</span>
                  <span className={hasil.twk >= 65 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                    {hasil.twk >= 65 ? '✓ PG Lolos' : '✗ Belum Lolos'}
                  </span>
                </div>
                <div className={`text-4xl sm:text-5xl font-black font-mono ${
                  hasil.twk >= 65 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {hasil.twk}
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  Passing Grade: <strong>65</strong> / Max: 150
                </div>
              </div>

              {/* TIU */}
              <div className={`p-5 rounded-2xl border-2 text-center space-y-2 transition-all ${
                hasil.tiu >= 80 ? 'bg-emerald-50/50 border-emerald-300' : 'bg-rose-50/50 border-rose-300'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">TIU</span>
                  <span className={hasil.tiu >= 80 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                    {hasil.tiu >= 80 ? '✓ PG Lolos' : '✗ Belum Lolos'}
                  </span>
                </div>
                <div className={`text-4xl sm:text-5xl font-black font-mono ${
                  hasil.tiu >= 80 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {hasil.tiu}
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  Passing Grade: <strong>80</strong> / Max: 175
                </div>
              </div>

              {/* TKP */}
              <div className={`p-5 rounded-2xl border-2 text-center space-y-2 transition-all ${
                hasil.tkp >= 166 ? 'bg-emerald-50/50 border-emerald-300' : 'bg-rose-50/50 border-rose-300'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">TKP</span>
                  <span className={hasil.tkp >= 166 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                    {hasil.tkp >= 166 ? '✓ PG Lolos' : '✗ Belum Lolos'}
                  </span>
                </div>
                <div className={`text-4xl sm:text-5xl font-black font-mono ${
                  hasil.tkp >= 166 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {hasil.tkp}
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  Passing Grade: <strong>166</strong> / Max: 225
                </div>
              </div>

            </div>

            {/* Total Skor Big Readout */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                  AKUMULASI SKOR SKD
                </span>
                <div className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                  {hasil.total} <span className="text-slate-500 text-xl font-normal">/ 550</span>
                </div>
                <p className="text-xs text-slate-400 pt-1">
                  (TWK: {hasil.twk} + TIU: {hasil.tiu} + TKP: {hasil.tkp})
                </p>
              </div>
            </div>

            {/* ACTION BUTTON: SERTIFIKAT KELULUSAN CAT */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCertificateModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Lihat & Unduh Sertifikat Hasil Ujian</span>
              </button>

              <a
                href={waShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan ke WhatsApp</span>
              </a>
            </div>

          </div>
        </div>

        {/* ================= DIAGNOSTIC RADAR & MATERI RECOMMENDATION ================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Analisis Diagnostik & Rekomendasi Belajar
              </h3>
              <p className="text-xs text-slate-500">
                Peta kelemahan skor Anda untuk memaksimalkan peluang lolos perangkingan SKD.
              </p>
            </div>
          </div>

          {/* Subtest Strength Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Penguasaan TWK</span>
                <span>{Math.round(twkPercent)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${twkPercent}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Penguasaan TIU</span>
                <span>{Math.round(tiuPercent)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${tiuPercent}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Penguasaan TKP</span>
                <span>{Math.round(tkpPercent)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${tkpPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* Rekomendasi Modul Card */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                Saran Peningkatan Skor: Subtes {weakestSubtest}
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {weakestAdvice}
              </p>
            </div>

            <Link
              href={weakestLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap shrink-0"
            >
              <span>Pelajari Modul {weakestSubtest}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ================= BUKU EVALUASI / BANK SOAL SALAH BANNER ================= */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <h4 className="text-base font-bold text-white">
                Buku Evaluasi & Latihan Ulang Soal Salah
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {wrongCount > 0 
                ? `Terdapat ${wrongCount} soal yang dijawab kurang tepat pada sesi try out ini. Semua soal telah otomatis dicatat ke Buku Evaluasi Anda agar bisa dilatih kembali.`
                : 'Kunjungi Buku Evaluasi Anda untuk menguji kembali soal-soal try out yang pernah salah hingga Anda menguasainya 100%!'}
            </p>
          </div>

          <Link
            href="/dashboard/evaluasi"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-black transition shadow-md whitespace-nowrap shrink-0"
          >
            <span>Buka Buku Evaluasi</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ================= TOMBOL NAVIGASI BAWAH ================= */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/tryout-list"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold text-center transition shadow-sm"
          >
            🚀 Coba Try Out Lain
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-center transition shadow-xs"
          >
            Kembali ke Dashboard
          </Link>
        </div>

      </div>

      {/* ================= MODAL SERTIFIKAT RESMI CAT BKN ================= */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-300 animate-in fade-in zoom-in duration-200">
            
            {/* Top Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Sertifikat Resmi Simulasi CAT BKN • Klinik CPNS
              </span>
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* CERTIFICATE CANVAS VIEW */}
            <div id="printable-certificate" className="p-6 sm:p-10 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/40 border-8 border-double border-amber-600/30 text-center space-y-6 relative m-4 rounded-2xl">
              
              {/* Certificate Header */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                  KLINIK CPNS • PUSAT SIMULASI CAT INDONESIA
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif uppercase">
                  SERTIFIKAT KELULUSAN SIMULASI
                </h2>
                <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full"></div>
              </div>

              {/* Diberikan Kepada */}
              <div className="space-y-1 pt-2">
                <div className="text-xs text-slate-500 italic">Diberikan secara resmi kepada:</div>
                <div className="text-xl sm:text-2xl font-black text-blue-900 tracking-wide underline decoration-amber-500 decoration-2 underline-offset-4">
                  {studentName}
                </div>
                <div className="text-xs text-slate-600 pt-1">
                  Atas partisipasi dan hasil uji kompetensi pada: <strong>{packageName}</strong>
                </div>
              </div>

              {/* Rincian Skor */}
              <div className="bg-white border border-amber-300 rounded-2xl p-4 shadow-sm max-w-md mx-auto grid grid-cols-4 gap-2 text-center text-xs">
                <div className="border-r border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500">TWK</div>
                  <div className="text-base font-black text-slate-900">{hasil.twk}</div>
                  <div className="text-[9px] text-slate-400">Min 65</div>
                </div>
                <div className="border-r border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500">TIU</div>
                  <div className="text-base font-black text-slate-900">{hasil.tiu}</div>
                  <div className="text-[9px] text-slate-400">Min 80</div>
                </div>
                <div className="border-r border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500">TKP</div>
                  <div className="text-base font-black text-slate-900">{hasil.tkp}</div>
                  <div className="text-[9px] text-slate-400">Min 166</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-blue-600">TOTAL</div>
                  <div className="text-base font-black text-blue-700">{hasil.total}</div>
                  <div className="text-[9px] text-slate-400">Max 550</div>
                </div>
              </div>

              {/* Status Stamp */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border-2 ${
                  isLulus 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500' 
                    : 'bg-rose-50 text-rose-800 border-rose-500'
                }`}>
                  {isLulus ? '✓ MEMENUHI PASSING GRADE BKN' : '✗ BELUM MEMENUHI PASSING GRADE'}
                </span>
              </div>

              {/* Barcode & Verification Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                <div className="text-left font-mono">
                  ID: KCPNS-{Date.now().toString().slice(-8)}<br />
                  Tanggal: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-700">Verifikasi Resmi</div>
                  <div>klinikcpns.com/verify</div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Simpan PDF</span>
              </button>

              <a
                href={waShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
