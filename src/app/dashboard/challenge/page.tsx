'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import MemberLayout from '../../../components/MemberLayout';

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
          // Update status jadi failed
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
            // Ada hari yang terlewat
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

    // Hapus progress lama jika ada
    if (progress) {
      await supabase.from('challenge_daily_scores').delete().eq('progress_id', progress.id);
      await supabase.from('challenge_progress').delete().eq('id', progress.id);
    }

    // Buat progress baru
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

  // Cek apakah hari tertentu sudah selesai
  const isDayCompleted = (dayNumber: number) => {
    return dailyScores.some(score => score.day_number === dayNumber && score.is_passed);
  };

  // Cek apakah hari tertentu bisa dikerjakan
  const isDayAvailable = (dayNumber: number) => {
    if (!progress || progress.status !== 'active') return false;
    
    const today = new Date();
    const startDate = new Date(progress.start_date);
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Hari ke-1 selalu available di hari pertama
    if (dayNumber === 1 && daysSinceStart === 0) return true;
    
    // Hari berikutnya available di hari berikutnya
    if (dayNumber === daysSinceStart + 1) return true;
    
    return false;
  };

  // Cek apakah hari terlewat
  const isDayMissed = (dayNumber: number) => {
    if (!progress || progress.status !== 'active') return false;
    
    const today = new Date();
    const startDate = new Date(progress.start_date);
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Jika hari ini sudah lewat dari hari tersebut dan belum dikerjakan
    if (dayNumber <= daysSinceStart && !isDayCompleted(dayNumber)) {
      return true;
    }
    
    return false;
  };

  // Cek apakah challenge sudah selesai
  const isChallengeCompleted = () => {
    if (progress?.status === 'failed') return false;
    return progress?.status === 'completed' || (dailyScores.length === 30 && dailyScores.every(s => s.is_passed));
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Memuat Challenge...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  // Jika belum ada progress, tampilkan halaman start
  if (!progress) {
    return (
      <MemberLayout>
        <div className="p-6 md:p-8 min-h-[60vh] flex items-center justify-center max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-8 md:p-12 text-center max-w-2xl border-2 border-amber-300 shadow-xl">
            <div className="text-6xl mb-6">🏆</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-amber-900 mb-4">
              30 Day CPNS Challenge
            </h1>
            <p className="text-amber-800 mb-6 text-lg">
              Tantangan intensif 30 hari untuk mempersiapkan CPNS Anda. 
              Setiap hari ada 1 try out khusus yang harus dikerjakan tepat waktu!
            </p>
            
            <div className="bg-white/60 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-bold text-amber-900 mb-3">📋 Ketentuan:</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Challenge dimulai saat Anda mengerjakan hari ke-1</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Setiap hari ada 1 try out yang harus diselesaikan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Hari 1-10: Minimal Passing Grade (TWK≥65, TIU≥80, TKP≥166)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Hari 11-20: Minimal Total 400</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Hari 21-30: Minimal Total 460</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Jika nilai target pada hari tersebut tidak tercapai atau 1 hari terlewat, challenge GAGAL dan otomatis mengulang dari awal (Hari ke-1)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={startChallenge}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              🚀 Mulai Challenge Sekarang
            </button>
          </div>
        </div>
      </MemberLayout>
    );
  }

  // Jika challenge gagal, tampilkan halaman gagal
  if (progress.status === 'failed') {
    return (
      <MemberLayout>
        <div className="p-6 md:p-8 min-h-[60vh] flex items-center justify-center max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 md:p-12 text-center max-w-2xl border-2 border-red-300 shadow-xl">
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-red-900 mb-4">
              Challenge Gagal
            </h1>
            <p className="text-red-800 mb-6 text-lg">
              {failReason || progress.failed_reason || 'Hari terlewat tanpa penyelesaian'}
            </p>
            <p className="text-red-700 mb-8">
              Jangan menyerah! Anda bisa mencoba lagi dari awal.
            </p>
            <button
              onClick={restartChallenge}
              disabled={isRestarting}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isRestarting ? 'Memproses...' : '🔄 Mulai Ulang dari Awal'}
            </button>
          </div>
        </div>
      </MemberLayout>
    );
  }

  // Jika challenge selesai, tampilkan halaman sukses
  if (isChallengeCompleted()) {
    return (
      <MemberLayout>
        <div className="p-6 md:p-8 min-h-[60vh] flex items-center justify-center max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl p-8 md:p-12 text-center max-w-2xl border-4 border-yellow-400 shadow-2xl">
            <div className="text-6xl mb-6 animate-bounce">👑</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-900 mb-4">
              SELAMAT! CHALLENGE SELESAI!
            </h1>
            <p className="text-yellow-800 mb-8 text-lg">
              Anda berhasil menyelesaikan 30 hari challenge dengan sempurna!
            </p>
            <a
              href={guaranteeFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              🏆 Ajukan Klaim Garansi
            </a>
          </div>
        </div>
      </MemberLayout>
    );
  }

  // Tampilan utama challenge (sedang berlangsung)
  const today = new Date();
  const startDate = new Date(progress.start_date);
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = daysSinceStart + 1;

  return (
    <MemberLayout>
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">🏆 30 Day Challenge</h1>
              <p className="text-amber-100 text-sm md:text-base">
                Hari ke-<strong className="text-yellow-300 text-2xl">{currentDay}</strong> dari 30 hari
              </p>
              <p className="text-amber-200 text-xs mt-2">
                Dimulai: {new Date(progress.start_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{dailyScores.length}/30</div>
              <div className="text-xs text-amber-100">Hari Selesai</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-amber-100 mb-2">
              <span>Progress</span>
              <span>{Math.round((dailyScores.length / 30) * 100)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${(dailyScores.length / 30) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card Klaim Garansi */}
        <div className={`rounded-2xl p-6 md:p-8 border-2 transition-all ${
          isChallengeCompleted()
            ? 'bg-gradient-to-r from-yellow-50 to-amber-100 border-amber-400 shadow-xl'
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-2xl">🏆</span>
                <h3 className={`text-xl font-extrabold ${isChallengeCompleted() ? 'text-amber-900' : 'text-slate-800'}`}>
                  Klaim Garansi 30 Day Challenge
                </h3>
              </div>
              <p className={`text-sm max-w-xl ${isChallengeCompleted() ? 'text-amber-800 font-medium' : 'text-slate-500'}`}>
                {isChallengeCompleted()
                  ? 'Selamat! Anda telah menyelesaikan seluruh 30 hari tantangan dengan nilai target memenuhi kriteria. Silakan klaim garansi Anda.'
                  : 'Tombol ini hanya akan menyala (aktif) setelah Anda menyelesaikan seluruh 30 hari tantangan dengan nilai target yang memenuhi kriteria tanpa ada hari yang terlewat.'}
              </p>
            </div>

            <div>
              {isChallengeCompleted() ? (
                <a
                  href={guaranteeFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold py-3.5 px-7 rounded-xl text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
                >
                  🎉 Klaim Garansi Sekarang
                </a>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 bg-slate-200 text-slate-400 font-bold py-3.5 px-7 rounded-xl text-base cursor-not-allowed border border-slate-300 shadow-inner whitespace-nowrap"
                  title="Selesaikan 30 hari challenge untuk membuka klaim garansi"
                >
                  🔒 Klaim Garansi (Terkunci)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info Hari Ini */}
        {currentDay <= 30 && challengeDays[currentDay - 1] && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-2">
              📅 Tantangan Hari Ini: Hari ke-{currentDay}
            </h2>
            <p className="text-blue-800 mb-4">
              {challengeDays[currentDay - 1].tryout_packages?.name || 'Paket belum disetting'}
            </p>
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="text-sm text-slate-600 mb-2">Target Nilai:</div>
              <div className="font-bold text-blue-700">
                {currentDay <= 10 && 'Passing Grade (TWK≥65, TIU≥80, TKP≥166)'}
                {currentDay > 10 && currentDay <= 20 && 'Total Skor ≥ 400'}
                {currentDay > 20 && 'Total Skor ≥ 460'}
              </div>
            </div>
            {challengeDays[currentDay - 1].package_id ? (
              <Link
                href={`/tryout/${challengeDays[currentDay - 1].package_id}`}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🚀 Kerjakan Try Out Hari Ini
              </Link>
            ) : (
              <div className="text-sm font-semibold text-slate-500 italic">
                Paket untuk hari ini belum disetting oleh Admin.
              </div>
            )}
          </div>
        )}

        {/* Grid 30 Hari */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">📊 Progress 30 Hari</h2>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3">
            {challengeDays.map((day, index) => {
              const dayNumber = index + 1;
              const isCompleted = isDayCompleted(dayNumber);
              const isAvailable = isDayAvailable(dayNumber);
              const isMissed = isDayMissed(dayNumber);
              const isFuture = dayNumber > currentDay;
              const score = dailyScores.find(s => s.day_number === dayNumber);
              
              let bgColor = 'bg-slate-100 border-slate-200 text-slate-400';
              let icon = '🔒';
              
              if (isCompleted) {
                bgColor = 'bg-green-100 border-green-400 text-green-700';
                icon = '✅';
              } else if (isMissed) {
                bgColor = 'bg-red-100 border-red-400 text-red-700';
                icon = '❌';
              } else if (isAvailable) {
                bgColor = 'bg-blue-100 border-blue-400 text-blue-700 animate-pulse';
                icon = '▶️';
              } else if (isFuture) {
                bgColor = 'bg-slate-50 border-slate-200 border-dashed text-slate-300';
                icon = '🔒';
              }

              return (
                <div
                  key={day.id}
                  className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 text-center ${bgColor}`}
                >
                  <span className="text-2xl mb-1">{icon}</span>
                  <span className="font-bold text-xs">Hari {dayNumber}</span>
                  {score && (
                    <span className="text-[10px] mt-1 font-semibold bg-white/50 px-2 py-0.5 rounded">
                      {score.skor_total}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legenda */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-700 mb-3 text-sm">Keterangan:</h3>
          <div className="flex flex-wrap gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded animate-pulse"></div>
              <span>Hari Ini (Harus Dikerjakan)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
              <span>Selesai ✅</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded"></div>
              <span>Terlewat ❌</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-50 border-2 border-slate-200 rounded"></div>
              <span>Belum Waktunya 🔒</span>
            </div>
          </div>
        </div>

        {/* Peringatan */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm text-amber-800">
          <strong>⚠️ Penting:</strong> Anda harus mengerjakan try out hari ini tepat waktu. 
          Jika terlewat 1 hari saja, challenge akan gagal dan Anda harus mulai dari awal!
        </div>
      </div>
    </MemberLayout>
  );
}
