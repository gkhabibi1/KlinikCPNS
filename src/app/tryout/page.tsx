'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function TryOutEngine() {
    const [waktu, setWaktu] = useState(6000); // 100 menit
    const [nomorAktif, setNomorAktif] = useState(1);
    const totalSoal = 110;
    const router = useRouter();

    // 1. STATE MEMORI: Menyimpan jawaban dan status ragu-ragu
    const [jawaban, setJawaban] = useState<Record<number, string>>({});
    const [ragu, setRagu] = useState<Record<number, boolean>>({});

    const formatWaktu = (detik: number) => {
        const h = Math.floor(detik / 3600).toString().padStart(2, '0');
        const m = Math.floor((detik % 3600) / 60).toString().padStart(2, '0');
        const s = (detik % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    useEffect(() => {
        if (waktu > 0) {
            const timer = setInterval(() => setWaktu(waktu - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [waktu]);

    // 2. FUNGSI INTERAKSI
    const handlePilihJawaban = (opsi: string) => {
        setJawaban({ ...jawaban, [nomorAktif]: opsi });
    };

    const handleToggleRagu = () => {
        setRagu({ ...ragu, [nomorAktif]: !ragu[nomorAktif] });
    };

    // 3. LOGIKA WARNA NAVIGASI (Hijau = Dijawab, Kuning = Ragu, Biru = Aktif)
    const getWarnaTombol = (num: number) => {
        if (num === nomorAktif) return 'border-blue-600 border-4 font-bold bg-blue-50 text-blue-800';
        if (ragu[num]) return 'bg-yellow-400 text-white border-yellow-500';
        if (jawaban[num]) return 'bg-green-500 text-white border-green-600';
        return 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100';
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-gray-100 font-sans">

            {/* KIRI: Area Soal */}
            <div className="w-full lg:w-3/4 p-4 sm:p-6 flex flex-col">
                <div className="flex flex-wrap justify-between items-center gap-2 bg-white p-3.5 sm:p-4 rounded-lg shadow-sm border-t-4 border-blue-600 mb-4">
                    <div className="text-base sm:text-lg font-bold text-gray-700">Soal No. {nomorAktif}</div>
                    <div className="text-sm sm:text-xl font-mono font-bold text-red-600 bg-red-100 px-3 sm:px-4 py-1 rounded-full border border-red-300">
                        Sisa Waktu: {formatWaktu(waktu)}
                    </div>
                </div>

                <div className="flex-grow bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-sm text-gray-800 text-base sm:text-lg">
                    {/* Ini masih data dummy, besok kita ganti dengan data dari Supabase */}
                    <p className="mb-6 leading-relaxed">Berdasarkan UUD 1945, lembaga negara yang berwenang memberhentikan Presiden dan/atau Wakil Presiden dalam masa jabatannya menurut Undang-Undang Dasar adalah...</p>

                    <div className="space-y-3">
                        {['MPR', 'DPR', 'Mahkamah Konstitusi', 'Mahkamah Agung', 'Komisi Yudisial'].map((opsi, index) => {
                            const huruf = String.fromCharCode(65 + index);
                            const isSelected = jawaban[nomorAktif] === huruf;

                            return (
                                <label
                                    key={index}
                                    className={`flex items-start sm:items-center p-3 border rounded-lg cursor-pointer transition-colors text-sm sm:text-base ${isSelected ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-50'}`}
                                >
                                    <input
                                        type="radio"
                                        name={`soal-${nomorAktif}`}
                                        className="w-5 h-5 mr-3 sm:mr-4 mt-0.5 sm:mt-0 shrink-0"
                                        checked={isSelected}
                                        onChange={() => handlePilihJawaban(huruf)}
                                    />
                                    <span>{huruf}. {opsi}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Tombol Navigasi Bawah */}
                <div className="grid grid-cols-3 gap-2 sm:flex sm:justify-between mt-4">
                    <button
                        onClick={() => setNomorAktif(Math.max(1, nomorAktif - 1))}
                        className="px-2 sm:px-6 py-2.5 bg-gray-500 text-white rounded text-xs sm:text-sm font-semibold hover:bg-gray-600 cursor-pointer"
                    >
                        SEBELUMNYA
                    </button>

                    <button
                        onClick={handleToggleRagu}
                        className={`px-2 sm:px-6 py-2.5 text-white rounded text-xs sm:text-sm font-semibold flex items-center justify-center cursor-pointer ${ragu[nomorAktif] ? 'bg-yellow-600' : 'bg-yellow-400 hover:bg-yellow-500'}`}
                    >
                        <input type="checkbox" checked={ragu[nomorAktif] || false} readOnly className="mr-1.5 sm:mr-2" />
                        RAGU-RAGU
                    </button>

                    <button
                        onClick={() => setNomorAktif(Math.min(totalSoal, nomorAktif + 1))}
                        className="px-2 sm:px-6 py-2.5 bg-blue-600 text-white rounded text-xs sm:text-sm hover:bg-blue-700 font-semibold cursor-pointer"
                    >
                        SELANJUTNYA
                    </button>
                </div>
            </div>

            {/* KANAN: Grid Nomor Soal */}
            <div className="w-full lg:w-1/4 p-4 sm:p-6 lg:pl-0">
                <div className="bg-white p-4 rounded-lg shadow-sm h-full flex flex-col">
                    <div className="text-center font-bold text-gray-700 mb-4 pb-2 border-b">Navigasi Soal</div>

                    <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-2 overflow-y-auto pr-1 flex-grow content-start max-h-64 lg:max-h-none">
                        {Array.from({ length: totalSoal }, (_, i) => i + 1).map((num) => (
                            <button
                                key={num}
                                onClick={() => setNomorAktif(num)}
                                className={`w-full h-10 flex items-center justify-center rounded border transition-all ${getWarnaTombol(num)}`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={async () => {
                            if (confirm('Apakah Anda yakin ingin mengakhiri ujian? Jawaban tidak dapat diubah lagi.')) {
                                
                                // 1. SIMULASI KUNCI JAWABAN & PENILAIAN
                                let skorTWK = 0;
                                let skorTIU = 0;
                                let skorTKP = 0;

                                // Loop dari soal 1 sampai 110
                                for (let i = 1; i <= totalSoal; i++) {
                                    const jawabanUser = jawaban[i];

                                    if (i <= 30) {
                                        // Logika TWK (Misal kunci jawaban dummy-nya selalu 'A')
                                        if (jawabanUser === 'A') skorTWK += 5;
                                    } 
                                    else if (i > 30 && i <= 65) {
                                        // Logika TIU (Misal kunci jawaban dummy-nya selalu 'B')
                                        if (jawabanUser === 'B') skorTIU += 5;
                                    } 
                                    else {
                                        // Logika TKP (Bobot 1-5, misal A=5, B=4, C=3, D=2, E=1)
                                        if (jawabanUser === 'A') skorTKP += 5;
                                        else if (jawabanUser === 'B') skorTKP += 4;
                                        else if (jawabanUser === 'C') skorTKP += 3;
                                        else if (jawabanUser === 'D') skorTKP += 2;
                                        else if (jawabanUser === 'E') skorTKP += 1;
                                    }
                                }

                                // 2. SIMPAN SKOR KE MEMORI BROWSER SEMENTARA
                                const hasilAkhir = {
                                    twk: skorTWK,
                                    tiu: skorTIU,
                                    tkp: skorTKP,
                                    total: skorTWK + skorTIU + skorTKP,
                                    lulus: skorTWK >= 65 && skorTIU >= 80 && skorTKP >= 166
                                };
                                
                                localStorage.setItem('hasilTryOut', JSON.stringify(hasilAkhir));

                                // 3. SIMPAN KE DATABASE SUPABASE
                                try {
                                    const { data: { user } } = await supabase.auth.getUser();
                                    if (user) {
                                        const { data: pkgs } = await supabase.from('packages').select('id').limit(1);
                                        const defaultPkgId = pkgs && pkgs.length > 0 ? pkgs[0].id : null;

                                        await supabase.from('exam_results').insert({
                                            user_id: user.id,
                                            package_id: defaultPkgId,
                                            score_twk: skorTWK,
                                            score_tiu: skorTIU,
                                            score_tkp: skorTKP,
                                            total_score: skorTWK + skorTIU + skorTKP,
                                            is_passed: skorTWK >= 65 && skorTIU >= 80 && skorTKP >= 166
                                        });
                                    }
                                } catch (dbErr) {
                                    console.error("Gagal menyimpan hasil ke database:", dbErr);
                                }

                                // 4. PINDAH KE HALAMAN HASIL
                                router.push('/result');
                            }
                        }}
                        className="mt-4 w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
                    >
                        SELESAI UJIAN
                    </button>
                </div>
            </div>
        </div>
    );
}