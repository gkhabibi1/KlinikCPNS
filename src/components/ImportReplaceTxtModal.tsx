'use client';

import { useState } from 'react';
import { Upload, X, AlertTriangle, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { parseQuestionsFromText, ParsedQuestion } from '@/lib/questionParser';

interface ImportReplaceTxtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function ImportReplaceTxtModal({
  isOpen,
  onClose,
  onImported,
}: ImportReplaceTxtModalProps) {
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [mode, setMode] = useState<'replace' | 'append'>('replace');
  const [markCalibrated, setMarkCalibrated] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const texts = await Promise.all(files.map((f) => f.text()));
      const combined = texts.flatMap((t) => parseQuestionsFromText(t));
      setFileNames(files.map((f) => f.name));
      setParsedQuestions(combined);
      if (combined.length === 0) {
        setErrorMsg('Tidak ada soal valid yang terbaca dari file TXT tersebut.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal membaca file TXT.');
    }
  };

  const handleUpload = async () => {
    if (parsedQuestions.length === 0) return;
    if (
      mode === 'replace' &&
      !confirm(
        `PERHATIAN: Mode "Ganti Seluruh Bank Soal" akan menghapus seluruh soal lama di Bank Soal dan menggantinya dengan ${parsedQuestions.length} soal dari file TXT ini. Lanjutkan?`
      )
    ) {
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const chunkSize = 200;
    const total = parsedQuestions.length;
    let uploaded = 0;

    try {
      for (let i = 0; i < total; i += chunkSize) {
        const chunk = parsedQuestions.slice(i, i + chunkSize);
        const res = await fetch('/api/admin/replace-bank-txt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questions: chunk,
            clearExisting: mode === 'replace' && i === 0,
            markCalibrated,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data?.error || `Gagal upload chunk ke-${Math.floor(i / chunkSize) + 1}`);
        }
        uploaded += chunk.length;
        setProgress({ current: uploaded, total });
      }

      setSuccessMsg(`Berhasil mengimpor ${uploaded} soal ke Bank Soal!`);
      onImported();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat mengupload soal.');
    } finally {
      setIsUploading(false);
    }
  };

  const counts = parsedQuestions.reduce(
    (acc, q) => {
      const t = String(q.type || 'TWK').toUpperCase();
      if (t.includes('TIU')) acc.TIU++;
      else if (t.includes('TKP')) acc.TKP++;
      else acc.TWK++;
      return acc;
    },
    { TWK: 0, TIU: 0, TKP: 0 }
  );

  const pct = progress ? Math.round((progress.current / Math.max(1, progress.total)) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white text-black w-full max-w-xl rounded-2xl border-2 border-black shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-black">
                Submit / Replace Bank Soal dari TXT
              </h3>
              <p className="text-xs text-slate-600">
                Upload 1 file gabungan atau beberapa file batch .txt sekaligus (chunk otomatis 200 soal).
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isUploading}
            onClick={onClose}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <label className="block border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer transition bg-slate-50/70">
            <input
              type="file"
              accept=".txt,text/plain"
              multiple
              disabled={isUploading}
              onChange={handleFilesSelected}
              className="hidden"
            />
            <FileText className="w-7 h-7 text-blue-600 mx-auto mb-2" />
            <div className="text-xs sm:text-sm font-bold text-slate-800">
              {fileNames.length > 0
                ? `${fileNames.length} file dipilih (${fileNames.slice(0, 3).join(', ')}${fileNames.length > 3 ? ', ...' : ''})`
                : 'Klik untuk memilih file .txt (bisa pilih banyak batch sekaligus)'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Format standar: TYPE / NUMBER / QUESTION / A–E / CORRECT / EXPLANATION
            </div>
          </label>

          {parsedQuestions.length > 0 && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-blue-950">
                Terbaca {parsedQuestions.length} soal siap submit
              </span>
              <div className="flex items-center gap-2 font-semibold text-blue-800">
                <span>TWK: {counts.TWK}</span>
                <span>·</span>
                <span>TIU: {counts.TIU}</span>
                <span>·</span>
                <span>TKP: {counts.TKP}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Mode Submit
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => setMode('replace')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  mode === 'replace'
                    ? 'border-rose-600 bg-rose-50 text-rose-950 ring-1 ring-rose-600'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div className="text-xs font-extrabold">Ganti Seluruh Bank Soal</div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Hapus soal lama di Bank Soal &amp; ganti dengan isi file TXT ini.
                </div>
              </button>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => setMode('append')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  mode === 'append'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div className="text-xs font-extrabold">Tambahkan ke Bank Soal</div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Soal lama tetap ada, soal baru ditambahkan di bawahnya.
                </div>
              </button>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              disabled={isUploading}
              checked={markCalibrated}
              onChange={(e) => setMarkCalibrated(e.target.checked)}
              className="w-4 h-4 rounded accent-black"
            />
            <span>Tandai soal hasil import sebagai &quot;Sudah Dikalibrasi AI (HOTS)&quot;</span>
          </label>

          {progress && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Mengunggah batch soal...
                </span>
                <span>
                  {progress.current} / {progress.total} ({pct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-300">
                <div
                  className="h-full bg-[#ddff00] transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              disabled={isUploading}
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              disabled={isUploading || parsedQuestions.length === 0}
              onClick={handleUpload}
              className="px-5 py-2 rounded-xl bg-[#ddff00] hover:brightness-95 border-2 border-black text-black text-xs font-black disabled:opacity-40 cursor-pointer"
            >
              {isUploading ? 'Mengunggah...' : `Submit ${parsedQuestions.length} Soal`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
