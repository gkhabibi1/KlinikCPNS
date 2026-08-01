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
        <div className="flex h-screen bg-gray-100 font-sans">

            {/* KIRI: Area Soal */}
            <div className="w-3/4 p-6 flex flex-col">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-t-4 border-blue-600 mb-4">
                    <div className="text-lg font-bold text-gray-700">Soal No. {nomorAktif}</div>
                    <div className="text-xl font-mono font-bold text-red-600 bg-red-100 px-4 py-1 rounded-full border border-red-300">
                        Sisa Waktu: {formatWaktu(waktu)}
                    </div>
                </div>

                <div className="flex-grow bg-white p-8 rounded-lg shadow-sm text-gray-800 text-lg">
                    {/* Ini masih data dummy, besok kita ganti dengan data dari Supabase */}
                    <p className="mb-6">Berdasarkan UUD 1945, lembaga negara yang berwenang memberhentikan Presiden dan/atau Wakil Presiden dalam masa jabatannya menurut Undang-Undang Dasar adalah...</p>

                    <div className="space-y-3">
                        {['MPR', 'DPR', 'Mahkamah Konstitusi', 'Mahkamah Agung', 'Komisi Yudisial'].map((opsi, index) => {
                            const huruf = String.fromCharCode(65 + index);
                            const isSelected = jawaban[nomorAktif] === huruf;

                            return (
                                <label
                                    key={index}
                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-50'}`}
                                >
                                    <input
                                        type="radio"
                                        name={`soal-${nomorAktif}`}
                                        className="w-5 h-5 mr-4"
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
                <div className="flex justify-between mt-4">
                    <button
                        onClick={() => setNomorAktif(Math.max(1, nomorAktif - 1))}
                        className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        SEBELUMNYA
                    </button>

                    <button
                        onClick={handleToggleRagu}
                        className={`px-6 py-2 text-white rounded font-semibold ${ragu[nomorAktif] ? 'bg-yellow-600' : 'bg-yellow-400 hover:bg-yellow-500'}`}
                    >
                        <input type="checkbox" checked={ragu[nomorAktif] || false} readOnly className="mr-2" />
                        RAGU-RAGU
                    </button>

                    <button
                        onClick={() => setNomorAktif(Math.min(totalSoal, nomorAktif + 1))}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                    >
                        SELANJUTNYA
                    </button>
                </div>
            </div>

            {/* KANAN: Grid Nomor Soal */}
            <div className="w-1/4 p-6 pl-0">
                <div className="bg-white p-4 rounded-lg shadow-sm h-full flex flex-col">
                    <div className="text-center font-bold text-gray-700 mb-4 pb-2 border-b">Navigasi Soal</div>

                    <div className="grid grid-cols-5 gap-2 overflow-y-auto pr-2 flex-grow content-start">
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