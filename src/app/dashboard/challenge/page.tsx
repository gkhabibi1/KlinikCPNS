'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import MemberLayout from '../../../components/MemberLayout';
import { 
  Trophy, 
  Target, 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  Play, 
  Flame, 
  Clock, 
  RotateCcw, 
  Sparkles, 
  Activity, 
  ChevronRight,
  ExternalLink,
  Award,
  AlertTriangle,
  AlertCircle,
  Radio,
  Cpu
} from 'lucide-react';

const GUARANTEE_FORM_URL = 'https://forms.google.com/your-guarantee-form-link';

export default function ChallengePage() {
  const router = useRouter();
  const [challengeDays, setChallengeDays] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [dailyScores, setDailyScores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFailModal, setShowFailModal] = useState(false);
  const [failReason, setFailReason] = useState('');
  const [isRestarting, setIsRestarting] = useState(false);
  const [guaranteeFormUrl, setGuaranteeFormUrl] = useState<string>(GUARANTEE_FORM_URL);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      // 0. Ambil URL klaim garansi dari system_settings / localStorage
      try {
        const { data: settingData } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'guarantee_form_url')
          .single();
        if (settingData?.value) {
          setGuaranteeFormUrl(settingData.value);
        } else {
          const localUrl = localStorage.getItem('guarantee_form_url');
          if (localUrl) setGuaranteeFormUrl(localUrl);
        }
      } catch {
        const localUrl = localStorage.getItem('guarantee_form_url');
        if (localUrl) setGuaranteeFormUrl(localUrl);
      }

      // 1. Ambil konfigurasi challenge dari admin
      const { data: days } = await supabase
        .from('challenge_packages')
        .select('*, tryout_packages(id, name, description)')
        .eq('is_active', true)
        .order('day_number', { ascending: true });

      if (!days) {
        setIsLoading(false);
        return;
      }
      setChallengeDays(days);

      // 2. Ambil progress user saat ini
      const { data: userProgress } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userProgress) {
        setProgress(userProgress);
        if (userProgress.status === 'failed') {
          setFailReason(userProgress.failed_reason || 'Challenge Gagal');
        }

        // Cek apakah ada hari yang terlewat
        const today = new Date();
        const startDate = new Date(userProgress.start_date);
        const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Jika sudah lebih dari 30 hari dan belum completed
        if (daysSinceStart >= 30 && userProgress.status === 'active') {
          await supabase
            .from('challenge_progress')
            .update({ status: 'failed', failed_reason: 'Waktu 30 hari habis' })
            .eq('id', userProgress.id);
          
          setFailReason('Waktu 30 hari telah habis tanpa menyelesaikan semua tantangan');
          setShowFailModal(true);
        }

        // Ambil daily scores
        const { data: scores } = await supabase
          .from('challenge_daily_scores')
          .select('*')
          .eq('progress_id', userProgress.id)
          .order('day_number', { ascending: true });
        
        if (scores) setDailyScores(scores);

        // Cek apakah ada hari yang terlewat
        if (userProgress.status === 'active') {
          const expectedDay = daysSinceStart + 1;
          const lastCompletedDay = scores?.length || 0;
          
          if (expectedDay > lastCompletedDay + 1 && lastCompletedDay > 0) {
            const missedDay = lastCompletedDay + 1;
            await supabase
              .from('challenge_progress')
              .update({ 
                status: 'failed', 
                failed_reason: `Hari ke-${missedDay} tidak dikerjakan tepat waktu`
              })
              .eq('id', userProgress.id);
            
            setFailReason(`Anda tidak mengerjakan challenge hari ke-${missedDay} tepat waktu`);
            setShowFailModal(true);
          }
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [router]);

  // Fungsi untuk memulai challenge baru
  const startChallenge = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (progress) {
      await supabase.from('challenge_daily_scores').delete().eq('progress_id', progress.id);
      await supabase.from('challenge_progress').delete().eq('id', progress.id);
    }

    const today = new Date().toISOString().split('T')[0];
    const { data: newProgress, error } = await supabase
      .from('challenge_progress')
      .insert([{
        user_id: user.id,
        start_date: today,
        current_day: 1,
        status: 'active'
      }])
      .select()
      .single();

    if (error) {
      alert('Gagal memulai challenge: ' + error.message);
      return;
    }

    setProgress(newProgress);
    setDailyScores([]);
    setShowFailModal(false);
  };

  // Fungsi untuk restart challenge
  const restartChallenge = async () => {
    setIsRestarting(true);
    await startChallenge();
    setIsRestarting(false);
  };

  // Cek status hari
  const isDayCompleted = (dayNumber: number) => {
    return dailyScores.some(score => score.day_number === dayNumber && score.is_passed);
  };

  const isDayAvailable = (dayNumber: number) => {
    if (!progress || progress.status !== 'active') return false;
    
    const today = new Date();
    const startDate = new Date(progress.start_date);
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayNumber === 1 && daysSinceStart === 0) return true;
    if (dayNumber === daysSinceStart + 1) return true;
    
    return false;
  };

  const isDayMissed = (dayNumber: number) => {
    if (!progress || progress.status !== 'active') return false;
    
    const today = new Date();
    const startDate = new Date(progress.start_date);
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayNumber <= daysSinceStart && !isDayCompleted(dayNumber)) {
      return true;
    }
    
    return false;
  };

  const isChallengeCompleted = () => {
    if (progress?.status === 'failed') return false;
    return progress?.status === 'completed' || (dailyScores.length === 30 && dailyScores.every(s => s.is_passed));
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-[450px]">
          <div className="text-center space-y-3">
            <div className="relative w-14 h-14 mx-auto">
              <div className="w-14 h-14 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin"></div>
              <Cpu className="w-6 h-6 text-blue-600 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-slate-600 tracking-wider">MEMUAT PROTOKOL CHALLENGE...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  // ================= KONDISI 1: BELUM MEMULAI CHALLENGE =================
  if (!progress) {
    return (
      <MemberLayout>
        <div className="p-4 sm:p-6 md:p-8 min-h-[80vh] flex items-center justify-center max-w-5xl mx-auto">
          <div className="relative w-full bg-slate-950 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-2xl overflow-hidden">
            {/* Ambient Cyber Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest">
                <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                <span>Simulasi CAT BKN • Elite Protocol</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                30 DAYS <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">CPNS CHALLENGE</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                Program akselerasi disiplin dan ketahanan mental ujian CAT BKN selama 30 hari berturut-turut. Dilengkapi sensor anti-curang ketat dan <strong>Garansi Uang Kembali 100%</strong> jika Anda lulus tantangan namun tidak lolos tes CPNS resmi!
              </p>

              {/* 3 Telemetry Sectors Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-2">
                <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-4.5 backdrop-blur-sm">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    Sektor 01 • Hari 1-10
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">Ambang Batas SKD</h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    Target minimal Passing Grade BKN (TWK ≥ 65, TIU ≥ 80, TKP ≥ 166).
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-4.5 backdrop-blur-sm">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    Sektor 02 • Hari 11-20
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">Penguasaan Tinggi</h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    Meningkatkan akurasi dan kecepatan dengan target <strong>Total Skor ≥ 400</strong>.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4.5 backdrop-blur-sm">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Sektor 03 • Hari 21-30
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">Puncak Peringkat Elite</h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    Mengamankan posisi ranking nasional dengan target <strong>Total Skor ≥ 500</strong>.
                  </p>
                </div>
              </div>

              {/* Proctoring Warning Callout */}
              <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-4 text-xs text-left flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="text-slate-300 space-y-1">
                  <p className="font-bold text-red-300">
                    Sistem Pengawasan Anti-Curang (Proctoring Engine) Aktif:
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    Setiap pengerjaan try out challenge dipantau secara otomatis. Peserta dilarang berpindah tab browser atau membuka aplikasi lain (seperti kalkulator). Jika terdeteksi keluar dari halaman ujian atau terlewat 1 hari, tantangan <strong>otomatis GAGAL</strong> dan wajib mengulang dari Hari ke-1.
                  </p>
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-2">
                <button
                  onClick={startChallenge}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold py-4 px-10 rounded-2xl text-base shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>AKTIFKAN PROTOKOL 30 DAYS CHALLENGE</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </MemberLayout>
    );
  }

  // ================= KONDISI 2: CHALLENGE GAGAL =================
  if (progress.status === 'failed') {
    return (
      <MemberLayout>
        <div className="p-4 sm:p-6 md:p-8 min-h-[80vh] flex items-center justify-center max-w-4xl mx-auto">
          <div className="relative w-full bg-slate-950 rounded-3xl p-6 sm:p-10 text-white border-2 border-rose-600/70 shadow-[0_0_50px_rgba(225,29,72,0.25)] overflow-hidden text-center">
            {/* Crimson Cyber Aura */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-xl mx-auto space-y-6">
              <div className="w-20 h-20 bg-rose-950/60 border-2 border-rose-500 text-rose-400 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(244,63,94,0.4)]">
                <ShieldAlert className="w-10 h-10 animate-pulse" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full">
                  STATUS: PROTOCOL INTERRUPTED
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-white mt-3">
                  TANTANGAN DINYATAKAN GAGAL
                </h1>
              </div>

              {/* Telemetry Log Box */}
              <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-4.5 text-left text-xs space-y-1.5 font-mono">
                <div className="text-rose-400 font-bold uppercase flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Penyebab Diskualifikasi:
                </div>
                <div className="text-slate-200 text-sm font-sans font-semibold">
                  {failReason || progress.failed_reason || 'Hari terlewat tanpa penyelesaian try out harian.'}
                </div>
              </div>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Integritas latihan adalah kunci kelulusan murni di CAT BKN. Anda dapat menginisialisasi ulang sistem dan mencoba kembali tantangan dari <strong>Hari ke-1</strong>.
              </p>

              <div>
                <button
                  onClick={restartChallenge}
                  disabled={isRestarting}
                  className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold py-3.5 px-8 rounded-xl text-sm shadow-[0_0_25px_rgba(225,29,72,0.4)] hover:shadow-[0_0_35px_rgba(225,29,72,0.6)] transition-all cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-4 h-4 ${isRestarting ? 'animate-spin' : ''}`} />
                  <span>{isRestarting ? 'Menginisialisasi Ulang...' : 'REBOOT TANTANGAN (MULAI HARI 01)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </MemberLayout>
    );
  }

  // ================= KONDISI 3: CHALLENGE SELESAI SUKSES =================
  if (isChallengeCompleted()) {
    return (
      <MemberLayout>
        <div className="p-4 sm:p-6 md:p-8 min-h-[80vh] flex items-center justify-center max-w-4xl mx-auto">
          <div className="relative w-full bg-slate-950 rounded-3xl p-6 sm:p-12 text-white border-2 border-amber-500/70 shadow-[0_0_60px_rgba(245,158,11,0.25)] text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-xl mx-auto space-y-6">
              <div className="w-20 h-20 bg-amber-950/60 border-2 border-amber-400 text-amber-400 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full">
                  STATUS: 30/30 MISSION ACCOMPLISHED
                </span>
                <h1 className="text-3xl sm:text-5xl font-black text-white mt-3">
                  SELAMAT! ANDA LOLOS 30 HARI!
                </h1>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                Konsistensi dan ketangguhan Anda selama 30 hari telah terbukti. Anda berhak mendapatkan fasilitas <strong>Garansi Uang Kembali 100%</strong> jika Anda tidak lolos ujian SKD resmi BKN.
              </p>

              <div>
                <a
                  href={guaranteeFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-4 px-9 rounded-2xl text-base shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:shadow-[0_0_45px_rgba(245,158,11,0.8)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Award className="w-5 h-5 text-slate-950" />
                  <span>KLAIM GARANSI UANG KEMBALI 100%</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </MemberLayout>
    );
  }

  // ================= TAMPILAN UTAMA (SEDANG BERJALAN) =================
  const today = new Date();
  const startDate = new Date(progress.start_date);
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = daysSinceStart + 1;
  const progressPercent = Math.min(100, Math.round((dailyScores.length / 30) * 100));

  // 3 Sektor Pembagian Fase Challenge
  const sectors = [
    {
      sectorId: '01',
      title: 'SEKTOR 01 • FASE PONDASI SKD',
      subtitle: 'Standar Passing Grade BKN (TWK ≥ 65, TIU ≥ 80, TKP ≥ 166)',
      startDay: 1,
      endDay: 10,
      themeColor: 'cyan',
      borderGlow: 'border-cyan-500/30 bg-cyan-950/10'
    },
    {
      sectorId: '02',
      title: 'SEKTOR 02 • FASE AKURASI TINGGI',
      subtitle: 'Peningkatan Akurasi Kecepatan (Target Total Skor ≥ 400)',
      startDay: 11,
      endDay: 20,
      themeColor: 'indigo',
      borderGlow: 'border-indigo-500/30 bg-indigo-950/10'
    },
    {
      sectorId: '03',
      title: 'SEKTOR 03 • FASE ELITE PEAK',
      subtitle: 'Puncak Peringkat Teratas & Garansi 100% (Target Total Skor ≥ 500)',
      startDay: 21,
      endDay: 30,
      themeColor: 'amber',
      borderGlow: 'border-amber-500/30 bg-amber-950/10'
    }
  ];

  return (
    <MemberLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* ================= 1. FUTURISTIC MISSION CONTROL HUD (HEADER) ================= */}
        <div className="relative bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-8 text-white shadow-2xl overflow-hidden">
          {/* Cyber ambient lights */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Title & Telemetry */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/15 border border-cyan-400/40 text-cyan-300">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                  MISSION PROTOCOL ACTIVE
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-400/40 text-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  ANTI-CHEAT: ONLINE
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
                <span>30 DAYS CPNS CHALLENGE</span>
                <Sparkles className="w-6 h-6 text-amber-400 inline" />
              </h1>

              <p className="text-slate-400 text-xs sm:text-sm">
                Target Saat Ini: <strong className="text-cyan-300">
                  {currentDay <= 10 && 'Passing Grade BKN (TWK≥65, TIU≥80, TKP≥166)'}
                  {currentDay > 10 && currentDay <= 20 && 'Total Skor ≥ 400'}
                  {currentDay > 20 && 'Total Skor ≥ 500 (Peringkat Teratas)'}
                </strong>
              </p>
            </div>

            {/* Circular Telemetry Card */}
            <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md shrink-0 shadow-inner">
              <div className="text-center pr-3 border-r border-slate-800">
                <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                  {String(currentDay).padStart(2, '0')}
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hari Ini</div>
              </div>

              <div className="text-center px-2">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {dailyScores.length}<span className="text-slate-500 text-sm font-normal">/30</span>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tuntas</div>
              </div>

              <div className="text-center pl-3 border-l border-slate-800">
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {progressPercent}%
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Progress</div>
              </div>
            </div>

          </div>

          {/* Segmented Neon Progress Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                TRACKING PROGRESS KONSISTENSI
              </span>
              <span className="text-cyan-300 font-bold">{dailyScores.length} DARI 30 MISI TUNTAS</span>
            </div>

            <div className="w-full h-3 bg-slate-900 rounded-full border border-slate-800 overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* ================= 2. ACTIVE TODAY'S MISSION TERMINAL ================= */}
        {currentDay <= 30 && challengeDays[currentDay - 1] && (
          <div className="relative bg-gradient-to-r from-blue-950/80 via-slate-950 to-indigo-950/80 border-2 border-cyan-500/50 rounded-3xl p-5 sm:p-7 text-white shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>MISI HARI INI • HARI KE-{currentDay}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {challengeDays[currentDay - 1].tryout_packages?.name || 'Paket Ujian Harian'}
                </h3>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Waktu: 100 Menit
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 flex items-center gap-1.5 font-mono">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    Jumlah: 110 Soal CAT
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5 font-mono font-bold">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    {currentDay <= 10 && 'Target: PG BKN'}
                    {currentDay > 10 && currentDay <= 20 && 'Target: Skor ≥ 400'}
                    {currentDay > 20 && 'Target: Skor ≥ 500'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="w-full md:w-auto shrink-0">
                {challengeDays[currentDay - 1].package_id ? (
                  <Link
                    href={`/tryout/${challengeDays[currentDay - 1].package_id}`}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black py-4 px-8 rounded-2xl text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.6)] transition-all transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>LUNCURKAN TRY OUT HARI INI</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="text-xs font-semibold text-slate-500 bg-slate-900/80 border border-slate-800 p-3 rounded-xl italic">
                    Paket try out hari ini sedang disiapkan oleh Admin.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ================= 3. SECTOR GRID TRACKER (HARI 1 - 30) ================= */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>MATRIKS PROGRESS 30 HARI</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  3 SEKTOR
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemantauan real-time status kelulusan tiap try out CAT harian.
              </p>
            </div>
          </div>

          {/* Render 3 Sectors */}
          {sectors.map((sec) => {
            const sectorDays = challengeDays.slice(sec.startDay - 1, sec.endDay);

            return (
              <div 
                key={sec.sectorId}
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
              >
                {/* Sector Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold">
                      {sec.sectorId}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{sec.title}</h4>
                      <p className="text-[11px] text-slate-500">{sec.subtitle}</p>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                    <span>Target: Hari {sec.startDay} - {sec.endDay}</span>
                  </div>
                </div>

                {/* 10 Days Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-10 gap-2.5">
                  {sectorDays.map((day, idx) => {
                    const dayNumber = sec.startDay + idx;
                    const isCompleted = isDayCompleted(dayNumber);
                    const isAvailable = isDayAvailable(dayNumber);
                    const isMissed = isDayMissed(dayNumber);
                    const isFuture = dayNumber > currentDay;
                    const score = dailyScores.find(s => s.day_number === dayNumber);

                    // ================= TAMPILAN FUTURISTIK PER KARTU =================
                    if (isCompleted) {
                      return (
                        <div
                          key={day.id || dayNumber}
                          className="relative aspect-square rounded-2xl bg-gradient-to-b from-emerald-950/20 to-slate-900 border-2 border-emerald-500/60 p-2.5 flex flex-col items-center justify-between text-center shadow-[0_0_15px_rgba(16,185,129,0.15)] group transition-all"
                        >
                          <div className="w-full flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold text-emerald-400">PASSED</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          </div>

                          <div className="my-auto">
                            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">HARI</div>
                            <div className="text-lg font-black text-white font-mono">{String(dayNumber).padStart(2, '0')}</div>
                          </div>

                          <div className="w-full bg-emerald-500/20 border border-emerald-500/40 rounded-lg py-0.5 px-1.5 text-[10px] font-mono font-bold text-emerald-300">
                            {score ? `SKOR ${score.skor_total}` : 'LULUS'}
                          </div>
                        </div>
                      );
                    }

                    if (isAvailable) {
                      return (
                        <Link
                          key={day.id || dayNumber}
                          href={day.package_id ? `/tryout/${day.package_id}` : '#'}
                          className="relative aspect-square rounded-2xl bg-gradient-to-b from-cyan-950/50 to-blue-950/40 border-2 border-cyan-400 p-2.5 flex flex-col items-center justify-between text-center shadow-[0_0_20px_rgba(6,182,212,0.35)] ring-2 ring-cyan-400/40 animate-pulse hover:scale-105 transition-all cursor-pointer"
                        >
                          <div className="w-full flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold text-cyan-300">LIVE NOW</span>
                            <Target className="w-3.5 h-3.5 text-cyan-300" />
                          </div>

                          <div className="my-auto">
                            <div className="text-[10px] font-mono uppercase text-cyan-200 tracking-wider">HARI</div>
                            <div className="text-xl font-black text-white font-mono">{String(dayNumber).padStart(2, '0')}</div>
                          </div>

                          <div className="w-full bg-cyan-400 text-slate-950 rounded-lg py-0.5 px-1 text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm">
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>MULAI</span>
                          </div>
                        </Link>
                      );
                    }

                    if (isMissed) {
                      return (
                        <div
                          key={day.id || dayNumber}
                          className="relative aspect-square rounded-2xl bg-rose-950/20 border border-rose-500/40 p-2.5 flex flex-col items-center justify-between text-center shadow-xs"
                        >
                          <div className="w-full flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold text-rose-400">MISSED</span>
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                          </div>

                          <div className="my-auto">
                            <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">HARI</div>
                            <div className="text-lg font-black text-rose-300 font-mono">{String(dayNumber).padStart(2, '0')}</div>
                          </div>

                          <div className="w-full bg-rose-500/10 border border-rose-500/30 rounded-lg py-0.5 px-1 text-[9px] font-mono text-rose-400">
                            TERLEWAT
                          </div>
                        </div>
                      );
                    }

                    // Locked Future Day
                    return (
                      <div
                        key={day.id || dayNumber}
                        className="relative aspect-square rounded-2xl bg-slate-50 border border-slate-200 p-2.5 flex flex-col items-center justify-between text-center text-slate-400"
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className="text-[9px] font-mono text-slate-400">LOCKED</span>
                          <Lock className="w-3 h-3 text-slate-400" />
                        </div>

                        <div className="my-auto">
                          <div className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">HARI</div>
                          <div className="text-base font-bold text-slate-400 font-mono">{String(dayNumber).padStart(2, '0')}</div>
                        </div>

                        <div className="w-full text-[9px] font-mono text-slate-400">
                          SELANJUTNYA
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= 4. STATUS TELEMETRY LEGEND ================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Keterangan Status Telemetri:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
              <div>
                <div className="font-bold text-cyan-300">Misi Aktif Hari Ini</div>
                <div className="text-[10px] text-slate-400">Harus dikerjakan tepat waktu</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
              <div>
                <div className="font-bold text-emerald-300">Lulus / Selesai</div>
                <div className="text-[10px] text-slate-400">Target skor tercapai</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
              <div>
                <div className="font-bold text-rose-300">Terlewat / Reset</div>
                <div className="text-[10px] text-slate-400">Target gagal / waktu lewat</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-slate-600"></div>
              <div>
                <div className="font-bold text-slate-400">Misi Terkunci</div>
                <div className="text-[10px] text-slate-500">Membuka di hari esok</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 5. CARD KLAIM GARANSI UANG KEMBALI 100% ================= */}
        <div className={`rounded-3xl p-6 sm:p-8 border-2 transition-all ${
          isChallengeCompleted()
            ? 'bg-gradient-to-r from-amber-950/90 via-slate-950 to-orange-950/90 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.25)] text-white'
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isChallengeCompleted() ? 'bg-amber-400/20 text-amber-300' : 'bg-blue-50 text-blue-600'}`}>
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className={`text-xl font-black ${isChallengeCompleted() ? 'text-white' : 'text-slate-900'}`}>
                  Klaim Garansi 100% 30 Days Challenge
                </h3>
              </div>
              <p className={`text-xs sm:text-sm max-w-xl ${isChallengeCompleted() ? 'text-slate-300' : 'text-slate-500'} leading-relaxed`}>
                {isChallengeCompleted()
                  ? 'Selamat! Anda telah menuntaskan seluruh 30 hari tantangan dengan nilai target memenuhi kriteria. Tombol klaim garansi Anda sekarang aktif.'
                  : 'Protokol Garansi Uang Kembali 100% akan aktif otomatis jika seluruh 30 hari tantangan berhasil diselesaikan dengan nilai target tercapai tanpa ada hari yang terlewat.'}
              </p>
            </div>

            <div className="shrink-0">
              {isChallengeCompleted() ? (
                <a
                  href={guaranteeFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 px-8 rounded-2xl text-sm shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
                >
                  <Award className="w-4 h-4 text-slate-950" />
                  <span>KLAIM GARANSI SEKARANG</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 bg-slate-100 text-slate-400 font-bold py-3.5 px-8 rounded-2xl text-xs sm:text-sm cursor-not-allowed border border-slate-200 whitespace-nowrap"
                  title="Selesaikan seluruh 30 hari challenge untuk membuka klaim garansi"
                >
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>KLAIM GARANSI (TERKUNCI)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= 6. PERINGATAN ANTI-CURANG PROCTORING ================= */}
        <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-5 text-xs text-amber-950 space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Protokol Keamanan & Anti-Curang (Proctoring Sesi Aktif)</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            Tiap sesi try out harian dilengkapi sensor pelacak jendela browser. Anda <strong>dilarang berpindah tab browser, me-minimize layar, atau membuka aplikasi eksternal (seperti kalkulator)</strong>. Jika terdeteksi meninggalkan lembar ujian, status tantangan hari itu langsung dinyatakan <strong>GAGAL</strong>.
          </p>
        </div>

      </div>
    </MemberLayout>
  );
}
