'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ResultPage() {
  const router = useRouter();
  const [hasil, setHasil] = useState<any>(null);
  const [packageName, setPackageName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      try {
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

        // Cari key mana saja yang diawali 'exam_review_' jika belum ketemu
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
          console.log('✅ Data dari localStorage:', parsed);
          
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
          
          setPackageName(parsed.package_name || 'Try Out SKD');
          setIsLoading(false);
          return;
        }

        // 3. Jika tidak ada di localStorage, ambil dari database Supabase
        console.log('Mengambil dari database Supabase...');
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        if (!user) {
          console.warn('User tidak dalam keadaan login.');
          setIsLoading(false);
          return;
        }

        // Query database
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
          .eq('user_id', user.id);

        if (targetPackageId) {
          query = query.eq('package_id', targetPackageId);
        }

        const { data: examResults, error } = await query
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching from DB:', error);
        }

        if (examResults && examResults.length > 0) {
          const result = examResults[0];
          console.log('✅ Data dari database:', result);
          
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
        } else {
          console.warn('Tidak ada data hasil ujian ditemukan');
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
        <div className="text-slate-500 font-medium">Memuat hasil...</div>
      </div>
    );
  }

  if (!hasil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Hasil Tidak Ditemukan</h2>
          <p className="text-slate-600 mb-6">Maaf, hasil try out tidak dapat dimuat.</p>
          <Link 
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isLulus = hasil.lulus || 
    (hasil.twk >= 65 && hasil.tiu >= 80 && hasil.tkp >= 166);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
            <h1 className="text-3xl font-bold text-center">Hasil Try Out SKD CPNS</h1>
            <p className="text-center text-blue-100 mt-2">{packageName}</p>
          </div>

          <div className="p-8">
            {/* Status Lulus/Tidak */}
            <div className={`text-center py-4 rounded-xl mb-8 ${
              isLulus 
                ? 'bg-green-50 border-2 border-green-200' 
                : 'bg-red-50 border-2 border-red-200'
            }`}>
              <h2 className={`text-2xl font-bold ${
                isLulus ? 'text-green-700' : 'text-red-700'
              }`}>
                {isLulus ? '✅ MEMENUHI PASSING GRADE' : '❌ TIDAK MEMENUHI PASSING GRADE'}
              </h2>
            </div>

            {/* Skor Per Subtes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* TWK */}
              <div className={`p-6 rounded-xl border-2 text-center ${
                hasil.twk >= 65 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <h3 className="text-lg font-bold text-slate-700 mb-2">TWK</h3>
                <div className={`text-5xl font-bold mb-2 ${
                  hasil.twk >= 65 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {hasil.twk}
                </div>
                <div className="text-sm text-slate-600">
                  PG: 65 | Max: 150
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {Math.round((hasil.twk / 150) * 100)}% dari maksimal
                </div>
              </div>

              {/* TIU */}
              <div className={`p-6 rounded-xl border-2 text-center ${
                hasil.tiu >= 80 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <h3 className="text-lg font-bold text-slate-700 mb-2">TIU</h3>
                <div className={`text-5xl font-bold mb-2 ${
                  hasil.tiu >= 80 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {hasil.tiu}
                </div>
                <div className="text-sm text-slate-600">
                  PG: 80 | Max: 175
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {Math.round((hasil.tiu / 175) * 100)}% dari maksimal
                </div>
              </div>

              {/* TKP */}
              <div className={`p-6 rounded-xl border-2 text-center ${
                hasil.tkp >= 166 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <h3 className="text-lg font-bold text-slate-700 mb-2">TKP</h3>
                <div className={`text-5xl font-bold mb-2 ${
                  hasil.tkp >= 166 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {hasil.tkp}
                </div>
                <div className="text-sm text-slate-600">
                  PG: 166 | Max: 225
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {Math.round((hasil.tkp / 225) * 100)}% dari maksimal
                </div>
              </div>
            </div>

            {/* Total Skor */}
            <div className="border-t-2 border-slate-200 pt-6 mb-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-600 mb-2">TOTAL SKOR</h3>
                <div className={`text-6xl font-bold ${
                  isLulus ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {hasil.total}
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  (TWK + TIU + TKP)
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tryout-list"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-center transition-colors"
              >
                Coba Try Out Lain
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 text-center transition-colors"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
