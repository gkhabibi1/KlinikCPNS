'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  ParsedQuestion,
  parseQuestionsFromText,
  downloadQuestionTemplate
} from '@/lib/questionParser';
import { buildQuestionBankPayload } from '@/lib/questionSubcategory';
import FormattedText from '@/components/FormattedText';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  Download,
  Power,
  ArrowUpDown,
  Wand2,
  X,
  AlertTriangle,
  Loader2,
  CheckSquare,
  Square,
  Trophy,
  Bot,
} from 'lucide-react';

interface BatchPackageItem {
  localId: string;
  fileName: string;
  name: string;
  description: string;
  is_active: boolean;
  is_premium: boolean;
  exam_type: 'CPNS' | 'P3K';
  show_explanation: boolean;
  challenge_day: number | null;
  questions: ParsedQuestion[];
  stats: {
    total: number;
    twk: number;
    tiu: number;
    tkp: number;
  };
  selected: boolean;
  status: 'ready' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

interface BatchPackageUploadProps {
  existingPackagesCount: number;
  onSuccess: () => void;
}

/**
 * Membersihkan nama file menjadi nama paket awal yang rapi
 */
function cleanFileNameToTitle(fileName: string): string {
  return fileName
    .replace(/\.txt$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Natural sort comparator agar "Soal 2" tampil sebelum "Soal 10"
 */
function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, 'id', { numeric: true, sensitivity: 'base' });
}

export default function BatchPackageUpload({
  existingPackagesCount,
  onSuccess
}: BatchPackageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<BatchPackageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // State Generator Nama Otomatis
  const [namePrefix, setNamePrefix] = useState('Try Out SKD CPNS');
  const [startNumber, setStartNumber] = useState<number>(1);
  const [padZero, setPadZero] = useState<boolean>(true);
  const [challengeStartDay, setChallengeStartDay] = useState<number>(1);

  // State Proses Upload
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    currentName: string;
  } | null>(null);
  const [batchResultSummary, setBatchResultSummary] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  // Modal Pratinjau Soal per item
  const [previewItem, setPreviewItem] = useState<BatchPackageItem | null>(null);
  const [previewAiReviews, setPreviewAiReviews] = useState<Record<string, any>>({});
  const [isCheckingPreviewAi, setIsCheckingPreviewAi] = useState(false);
  const [previewAiProgress, setPreviewAiProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [previewAiError, setPreviewAiError] = useState<string | null>(null);

  const handleCheckPreviewBatchWithAi = async (item: BatchPackageItem) => {
    if (isCheckingPreviewAi || item.questions.length === 0) return;
    setIsCheckingPreviewAi(true);
    setPreviewAiError(null);
    setPreviewAiProgress({ current: 0, total: item.questions.length });

    const chunkSize = 5;
    let done = 0;

    try {
      for (let i = 0; i < item.questions.length; i += chunkSize) {
        const chunk = item.questions.slice(i, i + chunkSize).map((q, idx) => ({
          id: `${item.localId}-${i + idx}`,
          category: q.type,
          question_text: q.question,
          option_a: q.options.a || '',
          option_b: q.options.b || '',
          option_c: q.options.c || '',
          option_d: q.options.d || '',
          option_e: q.options.e || '',
          correct_answer: q.correct,
          explanation: q.explanation || '',
          tkp_scores: q.type === 'TKP' ? q.scores : null,
        }));

        const res = await fetch('/api/admin/check-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions: chunk, persist: false }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Gagal mengecek soal dengan AI');
        }

        const nextMap: Record<string, any> = {};
        (data.reviews || []).forEach((rev: any) => {
          if (rev.id) nextMap[rev.id] = rev;
        });
        setPreviewAiReviews((prev) => ({ ...prev, ...nextMap }));

        done += chunk.length;
        setPreviewAiProgress({ current: done, total: item.questions.length });
      }
    } catch (err: any) {
      setPreviewAiError(err?.message || 'Gagal menjalankan cek AI batch');
    } finally {
      setIsCheckingPreviewAi(false);
      setPreviewAiProgress(null);
    }
  };

  // Proses file-file yang dipilih / di-drop
  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) =>
      f.name.toLowerCase().endsWith('.txt')
    );

    if (files.length === 0) {
      alert('Mohon pilih file berformat .txt sesuai template soal.');
      return;
    }

    // Urutkan file secara alami (1, 2, ..., 10) saat pertama kali masuk
    files.sort((a, b) => naturalCompare(a.name, b.name));

    const parsedItems: BatchPackageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await file.text();
      const parsedQuestions = parseQuestionsFromText(text);

      let twk = 0;
      let tiu = 0;
      let tkp = 0;
      parsedQuestions.forEach((q) => {
        const cat = (q.type || '').toUpperCase().trim();
        if (cat === 'TWK') twk++;
        else if (cat === 'TIU') tiu++;
        else if (cat === 'TKP') tkp++;
      });

      const isValid = parsedQuestions.length > 0;

      parsedItems.push({
        localId: `batch-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        fileName: file.name,
        name: cleanFileNameToTitle(file.name),
        description: isValid
          ? `Simulasi CAT ${parsedQuestions.length} Soal (TWK ${twk}, TIU ${tiu}, TKP ${tkp})`
          : '',
        is_active: true,
        is_premium: true,
        exam_type: 'CPNS',
        show_explanation: true,
        challenge_day: null,
        questions: parsedQuestions,
        stats: {
          total: parsedQuestions.length,
          twk,
          tiu,
          tkp
        },
        selected: isValid,
        status: isValid ? 'ready' : 'error',
        errorMessage: isValid
          ? undefined
          : 'Tidak ada soal valid ditemukan. Cek pemisah "---" dan tag TYPE/QUESTION/A-E.'
      });
    }

    setItems((prev) => [...prev, ...parsedItems]);
    setBatchResultSummary(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Update properti per baris
  const updateItem = (localId: string, patch: Partial<BatchPackageItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.localId === localId ? { ...item, ...patch } : item))
    );
  };

  const removeItem = (localId: string) => {
    setItems((prev) => prev.filter((item) => item.localId !== localId));
  };

  const allSelected =
    items.length > 0 && items.every((item) => item.selected);

  const toggleSelectAll = () => {
    const nextVal = !allSelected;
    setItems((prev) => prev.map((item) => ({ ...item, selected: nextVal })));
  };

  // Helper: apakah item terkena aksi bulk (jika ada yang dicentang, terapkan ke yang dicentang; jika tidak ada yang dicentang, terapkan ke semua)
  const getTargetChecker = (list: BatchPackageItem[]) => {
    const hasAnyChecked = list.some((i) => i.selected);
    return (item: BatchPackageItem) => (!hasAnyChecked || item.selected) && item.status !== 'success';
  };

  // --- SMART BULK ACTIONS ---

  const handleGenerateNames = () => {
    const prefix = namePrefix.trim() || 'Try Out SKD CPNS';
    let counter = isNaN(startNumber) ? 1 : startNumber;
    const shouldTarget = getTargetChecker(items);

    setItems((prev) =>
      prev.map((item) => {
        if (!shouldTarget(item)) return item;
        const numStr = padZero ? String(counter).padStart(2, '0') : String(counter);
        counter++;
        return {
          ...item,
          name: `${prefix} ${numStr}`
        };
      })
    );
  };

  const handleRestoreNamesFromFile = () => {
    const shouldTarget = getTargetChecker(items);
    setItems((prev) =>
      prev.map((item) =>
        shouldTarget(item)
          ? { ...item, name: cleanFileNameToTitle(item.fileName) }
          : item
      )
    );
  };

  const handleGenerateDescriptions = () => {
    const shouldTarget = getTargetChecker(items);
    setItems((prev) =>
      prev.map((item) => {
        if (!shouldTarget(item)) return item;
        return {
          ...item,
          description: `Simulasi CAT ${item.stats.total} Soal (TWK ${item.stats.twk}, TIU ${item.stats.tiu}, TKP ${item.stats.tkp})`
        };
      })
    );
  };

  const handleSetAllActive = (activeVal: boolean) => {
    const shouldTarget = getTargetChecker(items);
    setItems((prev) =>
      prev.map((item) =>
        shouldTarget(item) ? { ...item, is_active: activeVal } : item
      )
    );
  };

  const handleSetAllPremium = (premiumVal: boolean) => {
    const shouldTarget = getTargetChecker(items);
    setItems((prev) =>
      prev.map((item) =>
        shouldTarget(item) ? { ...item, is_premium: premiumVal } : item
      )
    );
  };

  const handleSetAllExplanation = (showVal: boolean) => {
    const shouldTarget = getTargetChecker(items);
    setItems((prev) =>
      prev.map((item) =>
        shouldTarget(item) ? { ...item, show_explanation: showVal } : item
      )
    );
  };

  const handleSetAllExamType = (examType: 'CPNS' | 'P3K') => {
    const shouldTarget = getTargetChecker(items);
    setItems((prev) =>
      prev.map((item) =>
        shouldTarget(item) ? { ...item, exam_type: examType } : item
      )
    );
  };

  const handleNaturalSort = () => {
    setItems((prev) =>
      [...prev].sort((a, b) => naturalCompare(a.fileName, b.fileName))
    );
  };

  const handleAutoAssignChallenge = () => {
    let dayCounter = Math.max(1, Math.min(30, isNaN(challengeStartDay) ? 1 : challengeStartDay));
    const shouldTarget = getTargetChecker(items);

    setItems((prev) =>
      prev.map((item) => {
        if (!shouldTarget(item)) return item;
        if (dayCounter > 30) return item;
        const assignedDay = dayCounter;
        dayCounter++;
        return {
          ...item,
          challenge_day: assignedDay,
          is_premium: true
        };
      })
    );
  };

  const handleClearChallengeDays = () => {
    const shouldTarget = getTargetChecker(items);
    setItems((prev) =>
      prev.map((item) =>
        shouldTarget(item) ? { ...item, challenge_day: null } : item
      )
    );
  };

  // --- PROSES UPLOAD BATCH KE SUPABASE ---

  const uploadableItems = items.filter(
    (item) =>
      item.selected &&
      item.status !== 'success' &&
      item.questions.length > 0 &&
      item.name.trim().length > 0
  );

  const handleStartBatchUpload = async () => {
    if (uploadableItems.length === 0) {
      alert('Tidak ada paket valid yang dicentang untuk diupload. Pastikan nama paket terisi dan minimal ada 1 soal.');
      return;
    }

    const hasChallengeAssignment = uploadableItems.some((i) => i.challenge_day !== null);
    if (hasChallengeAssignment) {
      const ok = confirm(
        `Anda akan mengupload ${uploadableItems.length} paket sekaligus dan menautkan sebagian/semua ke jadwal 30 Day Challenge. Jika hari challenge tersebut sudah terisi paket lain, paket challenge hari itu akan diganti. Lanjutkan?`
      );
      if (!ok) return;
    }

    setIsUploadingBatch(true);
    setBatchResultSummary(null);

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < uploadableItems.length; i++) {
      const item = uploadableItems[i];
      setUploadProgress({
        current: i + 1,
        total: uploadableItems.length,
        currentName: item.name
      });
      updateItem(item.localId, { status: 'uploading', errorMessage: undefined });

      try {
        // 1. Insert paket baru ke tryout_packages
        const { data: createdPkg, error: pkgError } = await supabase
          .from('tryout_packages')
          .insert([
            {
              name: item.name.trim(),
              description: item.description.trim() || null,
              is_premium: item.is_premium,
              is_active: item.is_active,
              exam_type: item.exam_type,
              show_explanation: item.show_explanation
            }
          ])
          .select('id')
          .single();

        if (pkgError || !createdPkg) {
          throw new Error(pkgError?.message || 'Gagal membuat baris paket di database');
        }

        // 2. Siapkan payload seluruh soal & upload bertahap per 50 soal
        const questionPayloads = item.questions.map((q) => ({
          package_id: createdPkg.id,
          question_number: q.number,
          question_text: q.question,
          question_category: q.type || 'TWK',
          option_a: q.options.a || '',
          option_b: q.options.b || '',
          option_c: q.options.c || '',
          option_d: q.options.d || '',
          option_e: q.options.e || '',
          correct_answer: q.correct || 'A',
          explanation:
            q.type === 'TKP'
              ? JSON.stringify({
                  a: q.scores?.a || 1,
                  b: q.scores?.b || 2,
                  c: q.scores?.c || 3,
                  d: q.scores?.d || 4,
                  e: q.scores?.e || 5
                })
              : q.explanation || ''
        }));

        const chunkSize = 50;
        for (let c = 0; c < questionPayloads.length; c += chunkSize) {
          const chunk = questionPayloads.slice(c, c + chunkSize);
          const { data: insertedQuestions, error: qError } = await supabase
            .from('questions')
            .insert(chunk)
            .select('*');
          if (qError) {
            throw new Error(`Gagal insert soal (${c + 1}-${c + chunk.length}): ${qError.message}`);
          }

          if (insertedQuestions && insertedQuestions.length > 0) {
            try {
              const bankPayloads = insertedQuestions.map((iq: any) =>
                buildQuestionBankPayload({
                  ...iq,
                  source_question_id: iq.id,
                  source_package_id: createdPkg.id,
                  source_package_name: item.name.trim(),
                })
              );
              await supabase.from('question_bank').insert(bankPayloads);
            } catch {
              // Abaikan jika tabel question_bank belum dibuat
            }
          }
        }

        // 3. Jika diset ke 30 Day Challenge, tautkan paket
        if (item.challenge_day !== null && item.challenge_day >= 1 && item.challenge_day <= 30) {
          await supabase
            .from('challenge_packages')
            .delete()
            .eq('day_number', item.challenge_day);

          const { error: chError } = await supabase
            .from('challenge_packages')
            .insert([
              {
                day_number: item.challenge_day,
                package_id: createdPkg.id,
                is_active: true
              }
            ]);

          if (chError) {
            console.warn('Gagal menautkan ke challenge_packages:', chError.message);
          }
        }

        updateItem(item.localId, { status: 'success', selected: false });
        successCount++;
      } catch (err: any) {
        updateItem(item.localId, {
          status: 'error',
          errorMessage: err?.message || 'Terjadi kesalahan saat mengupload'
        });
        failedCount++;
      }
    }

    setIsUploadingBatch(false);
    setUploadProgress(null);
    setBatchResultSummary({ success: successCount, failed: failedCount });
    onSuccess();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Smart Batch Uploader
          </div>
          <h3 className="text-xl font-bold leading-tight">
            Upload Paket &amp; Soal Secara Batch (Template TXT)
          </h3>
          <p className="text-xs text-blue-100 mt-1 max-w-2xl">
            Pilih banyak file template sekaligus, atur nama paket otomatis, tentukan status aktif/nonaktif &amp; akses, lalu upload seluruhnya dalam sekali klik.
          </p>
        </div>

        <button
          type="button"
          onClick={() => downloadQuestionTemplate('template-soal-cpns.txt')}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Template Soal (.txt)</span>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* DROPZONE AREA */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-blue-600 bg-blue-50/70 scale-[1.01]'
              : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm md:text-base">
            Klik untuk pilih banyak file (.txt) atau tarik &amp; lepas file ke sini
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Setiap 1 file template .txt akan otomatis dibaca sebagai 1 Paket Soal (mendukung multi-select hingga puluhan file sekaligus).
          </p>
        </div>

        {/* HASIL RINGKASAN SETELAH UPLOAD */}
        {batchResultSummary && (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              batchResultSummary.failed === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="text-sm font-semibold flex items-center gap-2">
              {batchResultSummary.failed === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <span>
                Batch selesai: <strong>{batchResultSummary.success}</strong> paket berhasil diupload
                {batchResultSummary.failed > 0 && (
                  <>
                    , <strong>{batchResultSummary.failed}</strong> paket gagal
                  </>
                )}
                .
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setItems((prev) => prev.filter((item) => item.status !== 'success'))
              }
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold cursor-pointer self-start sm:self-auto"
            >
              Bersihkan Baris Sukses
            </button>
          </div>
        )}

        {/* SMART BULK TOOLBAR & STAGING TABLE */}
        {items.length > 0 && (
          <div className="space-y-5">
            {/* SMART BULK TOOLS PANEL */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-indigo-600" />
                    Alat Otomatis &amp; Pengaturan Massal (Sebelum Upload)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mengubah semua baris yang dicentang (atau semua baris jika tidak ada yang dicentang).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleNaturalSort}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition"
                    title="Urutkan nama file sesuai angka alami (1, 2, ... 10)"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                    <span>Urutkan Alami (1..10)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Kosongkan seluruh daftar antrean upload?')) {
                        setItems([]);
                        setBatchResultSummary(null);
                      }
                    }}
                    className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kosongkan</span>
                  </button>
                </div>
              </div>

              {/* BARIS 1: GENERATOR NAMA OTOMATIS */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    ✨ Generator Nama Soal Otomatis
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Preset cepat:</span>
                    {[
                      'Try Out SKD CPNS',
                      'SKD Platinum',
                      '30 Day Challenge Hari',
                      'Try Out P3K'
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setNamePrefix(preset)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition cursor-pointer ${
                          namePrefix === preset
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Awalan Nama Paket
                    </label>
                    <input
                      type="text"
                      value={namePrefix}
                      onChange={(e) => setNamePrefix(e.target.value)}
                      placeholder="Contoh: Try Out SKD CPNS"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Mulai Nomor ({existingPackagesCount} paket ada)
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min={1}
                        value={startNumber}
                        onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setStartNumber(existingPackagesCount + 1)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold whitespace-nowrap border border-slate-200 cursor-pointer"
                        title={`Set nomor awal ke ${existingPackagesCount + 1}`}
                      >
                        #{existingPackagesCount + 1}
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer mr-1">
                      <input
                        type="checkbox"
                        checked={padZero}
                        onChange={(e) => setPadZero(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>2 Digit (01)</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleGenerateNames}
                      className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Nama Otomatis</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* BARIS 2: TOMBOL AKSI MASSAL LAINNYA */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSetAllActive(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Aktifkan Semua Otomatis</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAllActive(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>🔴 Nonaktifkan Semua</span>
                </button>

                <span className="h-5 w-px bg-slate-300 mx-0.5 hidden sm:inline-block" />

                <button
                  type="button"
                  onClick={() => handleSetAllPremium(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  💎 Semua Premium
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAllPremium(false)}
                  className="px-3 py-1.5 bg-white border border-green-300 hover:bg-green-50 text-green-700 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  🆓 Semua Gratis
                </button>

                <span className="h-5 w-px bg-slate-300 mx-0.5 hidden sm:inline-block" />

                <button
                  type="button"
                  onClick={() => handleSetAllExamType('CPNS')}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Set CPNS
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAllExamType('P3K')}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Set P3K
                </button>

                <button
                  type="button"
                  onClick={() => handleSetAllExplanation(true)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  📝 Semua Pembahasan
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAllExplanation(false)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-600 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  🔒 Tanpa Pembahasan
                </button>

                <button
                  type="button"
                  onClick={handleGenerateDescriptions}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  ✏️ Isi Deskripsi Otomatis
                </button>
                <button
                  type="button"
                  onClick={handleRestoreNamesFromFile}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-600 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  🧹 Nama dari File
                </button>
              </div>

              {/* BARIS 3: OPSIONAL AUTO-ASSIGN CHALLENGE */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  Opsional 30 Day Challenge:
                </span>
                <span className="text-slate-500">Mulai Hari ke-</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={challengeStartDay}
                  onChange={(e) => setChallengeStartDay(parseInt(e.target.value) || 1)}
                  className="w-16 border border-slate-300 rounded-lg px-2 py-1 text-xs bg-white"
                />
                <button
                  type="button"
                  onClick={handleAutoAssignChallenge}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition cursor-pointer"
                >
                  Set Challenge Berurutan
                </button>
                <button
                  type="button"
                  onClick={handleClearChallengeDays}
                  className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 font-semibold rounded-lg transition cursor-pointer"
                >
                  Batal Set Challenge
                </button>
              </div>
            </div>

            {/* TABEL EDIT PREVIEW SEBELUM UPLOAD */}
            <div className="border border-slate-200 rounded-2xl overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[820px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="p-3 w-10 text-center">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-slate-600 hover:text-blue-600 cursor-pointer"
                        title="Pilih / Batal Pilih Semua"
                      >
                        {allSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 mx-auto" />
                        ) : (
                          <Square className="w-4 h-4 mx-auto" />
                        )}
                      </button>
                    </th>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Nama Paket / Nama Soal (Dapat Diedit)</th>
                    <th className="p-3 w-44">File &amp; Statistik Soal</th>
                    <th className="p-3 w-28 text-center">Status Aktif</th>
                    <th className="p-3 w-36">Tipe &amp; Akses</th>
                    <th className="p-3 w-28 text-center">Pembahasan</th>
                    <th className="p-3 w-24 text-center">Challenge</th>
                    <th className="p-3 w-28 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {items.map((item, idx) => (
                    <tr
                      key={item.localId}
                      className={`transition-colors ${
                        item.status === 'success'
                          ? 'bg-emerald-50/40'
                          : item.status === 'error'
                          ? 'bg-red-50/50'
                          : item.selected
                          ? 'bg-white hover:bg-slate-50/70'
                          : 'bg-slate-50/60 opacity-70'
                      }`}
                    >
                      {/* CHECKBOX */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          disabled={item.status === 'success' || item.questions.length === 0}
                          onChange={(e) =>
                            updateItem(item.localId, { selected: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                        />
                      </td>

                      {/* NO */}
                      <td className="p-3 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      {/* EDITABLE NAMA & DESKRIPSI */}
                      <td className="p-3 space-y-1.5">
                        <input
                          type="text"
                          value={item.name}
                          disabled={item.status === 'success' || isUploadingBatch}
                          onChange={(e) => updateItem(item.localId, { name: e.target.value })}
                          placeholder="Masukkan nama paket soal..."
                          className="w-full border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 outline-none disabled:bg-slate-100"
                        />
                        <input
                          type="text"
                          value={item.description}
                          disabled={item.status === 'success' || isUploadingBatch}
                          onChange={(e) =>
                            updateItem(item.localId, { description: e.target.value })
                          }
                          placeholder="Deskripsi singkat (opsional)..."
                          className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-2.5 py-1 text-[11px] text-slate-600 outline-none disabled:bg-slate-100"
                        />
                        {item.errorMessage && (
                          <div className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{item.errorMessage}</span>
                          </div>
                        )}
                      </td>

                      {/* FILE & STATISTIK */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 font-medium text-slate-700 truncate max-w-[165px]" title={item.fileName}>
                          <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">{item.fileName}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.stats.total >= 110
                                ? 'bg-emerald-100 text-emerald-700'
                                : item.stats.total > 0
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {item.stats.total} Soal
                          </span>
                          {item.stats.total > 0 && (
                            <span className="text-[10px] text-slate-500 self-center">
                              TWK:{item.stats.twk} TIU:{item.stats.tiu} TKP:{item.stats.tkp}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* TOGGLE AKTIF / NONAKTIF */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          disabled={item.status === 'success' || isUploadingBatch}
                          onClick={() =>
                            updateItem(item.localId, { is_active: !item.is_active })
                          }
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer disabled:opacity-60 ${
                            item.is_active
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {item.is_active ? '🟢 AKTIF' : '🔴 NONAKTIF'}
                        </button>
                      </td>

                      {/* TIPE & AKSES */}
                      <td className="p-3 space-y-1">
                        <select
                          value={item.exam_type}
                          disabled={item.status === 'success' || isUploadingBatch}
                          onChange={(e) =>
                            updateItem(item.localId, {
                              exam_type: e.target.value as 'CPNS' | 'P3K'
                            })
                          }
                          className="w-full border border-slate-200 rounded-md px-2 py-1 text-[11px] font-semibold bg-white"
                        >
                          <option value="CPNS">CPNS</option>
                          <option value="P3K">P3K</option>
                        </select>
                        <select
                          value={item.is_premium ? 'premium' : 'gratis'}
                          disabled={item.status === 'success' || isUploadingBatch}
                          onChange={(e) =>
                            updateItem(item.localId, {
                              is_premium: e.target.value === 'premium'
                            })
                          }
                          className={`w-full border rounded-md px-2 py-1 text-[11px] font-bold ${
                            item.is_premium
                              ? 'bg-purple-50 border-purple-200 text-purple-700'
                              : 'bg-green-50 border-green-200 text-green-700'
                          }`}
                        >
                          <option value="premium">💎 Premium</option>
                          <option value="gratis">🆓 Gratis</option>
                        </select>
                      </td>

                      {/* PEMBAHASAN */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          disabled={item.status === 'success' || isUploadingBatch}
                          onClick={() =>
                            updateItem(item.localId, {
                              show_explanation: !item.show_explanation
                            })
                          }
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition ${
                            item.show_explanation
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}
                        >
                          {item.show_explanation ? '📝 Ya' : '🔒 Tidak'}
                        </button>
                      </td>

                      {/* CHALLENGE DAY */}
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min={1}
                          max={30}
                          placeholder="-"
                          disabled={item.status === 'success' || isUploadingBatch}
                          value={item.challenge_day ?? ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateItem(item.localId, {
                              challenge_day:
                                !isNaN(val) && val >= 1 && val <= 30 ? val : null
                            });
                          }}
                          className="w-14 border border-slate-200 rounded-lg px-2 py-1 text-center text-xs font-bold text-amber-700 bg-white"
                          title="Kosongkan jika bukan paket 30 Day Challenge (1-30)"
                        />
                      </td>

                      {/* AKSI */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.status === 'uploading' && (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          )}
                          {item.status === 'success' && (
                            <span
                              className="text-emerald-600 font-bold flex items-center gap-0.5 text-[11px]"
                              title="Berhasil diupload"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          )}
                          {item.questions.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg cursor-pointer transition"
                              title="Pratinjau isi soal sebelum upload"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isUploadingBatch}
                            onClick={() => removeItem(item.localId)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer transition disabled:opacity-40"
                            title="Hapus dari antrean"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FOOTER UPLOAD PROGRESS & BUTTON */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                {uploadProgress ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-blue-700">
                      <span>
                        Mengupload Paket {uploadProgress.current} dari {uploadProgress.total}:{' '}
                        {uploadProgress.currentName}
                      </span>
                      <span>
                        {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{
                          width: `${(uploadProgress.current / uploadProgress.total) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600">
                    Siap mengupload{' '}
                    <strong className="text-slate-900">{uploadableItems.length} paket</strong>{' '}
                    (Total{' '}
                    <strong className="text-blue-600">
                      {uploadableItems.reduce((acc, i) => acc + i.questions.length, 0)} soal
                    </strong>
                    ).
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={isUploadingBatch || uploadableItems.length === 0}
                onClick={handleStartBatchUpload}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                {isUploadingBatch ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengupload Batch...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload {uploadableItems.length} Paket &amp; Soal Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PRATINJAU ISI SOAL */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-bold text-slate-800 text-base">
                  Pratinjau Soal: {previewItem.name}
                </h4>
                <p className="text-xs text-slate-500">
                  File: {previewItem.fileName} • {previewItem.stats.total} Soal (TWK:{' '}
                  {previewItem.stats.twk}, TIU: {previewItem.stats.tiu}, TKP:{' '}
                  {previewItem.stats.tkp})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isCheckingPreviewAi}
                  onClick={() => handleCheckPreviewBatchWithAi(previewItem)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white text-xs font-bold cursor-pointer transition"
                >
                  {isCheckingPreviewAi ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isCheckingPreviewAi && previewAiProgress
                      ? `Cek AI (${previewAiProgress.current}/${previewAiProgress.total})...`
                      : `Cek AI Batch (${previewItem.questions.length})`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewItem(null);
                    setPreviewAiError(null);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {previewAiError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {previewAiError}
                </div>
              )}
              {previewItem.questions.map((q, qIdx) => {
                const rev = previewAiReviews[`${previewItem.localId}-${qIdx}`];
                return (
                <div
                  key={qIdx}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-slate-700">
                        Nomor {q.number} •{' '}
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          {q.type}
                        </span>
                      </span>
                      {rev && (
                        <>
                          <span
                            className={`px-2 py-0.5 rounded font-bold border ${
                              rev.answer_status === 'BENAR'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : rev.answer_status === 'KELIRU'
                                ? 'bg-red-50 border-red-200 text-red-700'
                                : 'bg-amber-50 border-amber-200 text-amber-700'
                            }`}
                          >
                            {rev.answer_status === 'BENAR'
                              ? '✓ AI Valid'
                              : rev.answer_status === 'KELIRU'
                              ? '✕ Kunci Keliru'
                              : '⚠ Perlu Cek'}
                          </span>
                          <span className="px-2 py-0.5 rounded font-bold bg-purple-50 border border-purple-200 text-purple-700">
                            Kesulitan {rev.difficulty}/5
                          </span>
                        </>
                      )}
                    </div>
                    <span className="font-bold text-emerald-700">
                      Kunci: {q.correct}
                    </span>
                  </div>
                  <div className="text-slate-800 font-medium text-sm">
                    <FormattedText text={q.question} inline={false} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1">
                    {(['a', 'b', 'c', 'd', 'e'] as const).map((opt) => {
                      const optVal = q.options[opt];
                      if (!optVal) return null;
                      const isKey = q.correct.toUpperCase() === opt.toUpperCase();
                      return (
                        <div
                          key={opt}
                          className={`p-1.5 rounded border ${
                            isKey
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="uppercase font-bold mr-1">{opt}.</span>
                          <FormattedText text={optVal} />
                          {q.type === 'TKP' && (
                            <span className="ml-1 text-[10px] text-amber-700 font-bold">
                              (Skor {q.scores[opt]})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-slate-700">
                      <strong className="text-blue-900">Pembahasan: </strong>
                      <FormattedText text={q.explanation} />
                    </div>
                  )}
                  {rev && (
                    <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-lg text-purple-950 space-y-0.5">
                      <p className="font-bold">
                        AI Review (Kesulitan {rev.difficulty}/5 · {rev.difficulty_label})
                        {rev.suggested_answer ? ` · Saran Kunci: ${rev.suggested_answer}` : ''}
                      </p>
                      <p>{rev.reason}</p>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
