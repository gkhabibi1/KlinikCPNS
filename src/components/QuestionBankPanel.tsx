'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import FormattedText from '@/components/FormattedText';
import {
  SKD_SUBCATEGORIES,
  MainSkdCategory,
  normalizeCategory,
  detectQuestionSubcategory,
  buildQuestionBankPayload,
} from '@/lib/questionSubcategory';
import {
  Database,
  Search,
  RefreshCw,
  Sparkles,
  CopyPlus,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Layers,
  Tag,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export interface QuestionBankItem {
  id: string;
  source_question_id?: string | null;
  source_package_id?: string | null;
  source_package_name?: string | null;
  category: MainSkdCategory;
  sub_category: string;
  question_text: string;
  question_image_url?: string | null;
  option_a: string;
  option_a_image_url?: string | null;
  option_b: string;
  option_b_image_url?: string | null;
  option_c: string;
  option_c_image_url?: string | null;
  option_d: string;
  option_d_image_url?: string | null;
  option_e: string;
  option_e_image_url?: string | null;
  correct_answer: string;
  explanation?: string | null;
  tkp_scores?: any;
  usage_count: number;
  created_at?: string;
  isVirtualFallback?: boolean;
}

interface PackageSummary {
  id: string;
  name: string;
  exam_type?: string;
  question_count?: number;
}

interface QuestionBankPanelProps {
  packages: PackageSummary[];
  onPackagesUpdated: () => void;
}

const ITEMS_PER_PAGE = 20;

export default function QuestionBankPanel({
  packages,
  onPackagesUpdated,
}: QuestionBankPanelProps) {
  const [bankItems, setBankItems] = useState<QuestionBankItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bankTableAvailable, setBankTableAvailable] = useState(true);
  const [unsyncedQuestions, setUnsyncedQuestions] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState<'ALL' | MainSkdCategory>('ALL');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('ALL');
  const [filterSourcePackage, setFilterSourcePackage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Selection & Reuse
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetPackageId, setTargetPackageId] = useState<string>('');
  const [isReusing, setIsReusing] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Quick Create Target Package
  const [showNewPkgForm, setShowNewPkgForm] = useState(false);
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgExamType, setNewPkgExamType] = useState<'CPNS' | 'P3K'>('CPNS');
  const [newPkgPremium, setNewPkgPremium] = useState(true);

  const fetchAllRowsPaginated = async (
    table: string,
    selectClause: string,
    orderCol = 'created_at'
  ) => {
    let allRows: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from(table)
        .select(selectClause)
        .order(orderCol, { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        return { data: allRows, error };
      }
      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        allRows = allRows.concat(data);
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    return { data: allRows, error: null };
  };

  const loadQuestionBank = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch tryout_packages & existing questions first (for sync check or fallback)
      const [{ data: pkgRows }, { data: rawQuestions }] = await Promise.all([
        supabase.from('tryout_packages').select('id, name'),
        fetchAllRowsPaginated('questions', '*'),
      ]);

      const pkgNameMap = new Map<string, string>();
      (pkgRows || []).forEach((p: any) => pkgNameMap.set(p.id, p.name));

      // 2. Try fetching question_bank table
      const { data: qbData, error: qbError } = await fetchAllRowsPaginated(
        'question_bank',
        '*'
      );

      if (qbError) {
        const msg = (qbError.message || '').toLowerCase();
        const tableMissing =
          qbError.code === '42P01' ||
          msg.includes('could not find') ||
          msg.includes('does not exist') ||
          msg.includes('question_bank');

        if (tableMissing) {
          setBankTableAvailable(false);
          const fallbackItems: QuestionBankItem[] = (rawQuestions || []).map((q: any) => {
            const pkgName = q.package_id ? pkgNameMap.get(q.package_id) || 'Paket Try Out' : 'Tanpa Paket';
            const mapped = buildQuestionBankPayload({
              ...q,
              source_question_id: q.id,
              source_package_id: q.package_id,
              source_package_name: pkgName,
            });
            return {
              id: q.id,
              ...mapped,
              usage_count: 1,
              created_at: q.created_at,
              isVirtualFallback: true,
            };
          });
          setBankItems(fallbackItems);
          setUnsyncedQuestions([]);
          return;
        }
      }

      setBankTableAvailable(true);
      const bankRows: QuestionBankItem[] = (qbData || []).map((row: any) => ({
        ...row,
        category: normalizeCategory(row.category),
        sub_category:
          row.sub_category ||
          detectQuestionSubcategory(row.category, row.question_text, row.explanation),
        usage_count: row.usage_count || 1,
      }));

      setBankItems(bankRows);

      // Hitung soal di tabel questions yang belum masuk ke question_bank
      const syncedSourceIds = new Set(
        bankRows.map((b) => b.source_question_id).filter(Boolean)
      );
      const missingFromBank = (rawQuestions || [])
        .filter((q: any) => !syncedSourceIds.has(q.id))
        .map((q: any) => ({
          ...q,
          __packageName: q.package_id ? pkgNameMap.get(q.package_id) || 'Paket Try Out' : null,
        }));

      setUnsyncedQuestions(missingFromBank);
    } catch (err) {
      console.error('Error loading question bank:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionBank();
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterSubCategory, filterSourcePackage, searchQuery]);

  // Reset sub_category filter when main category changes
  useEffect(() => {
    if (filterCategory !== 'ALL') {
      const validSubs = SKD_SUBCATEGORIES[filterCategory];
      if (filterSubCategory !== 'ALL' && !validSubs.includes(filterSubCategory)) {
        setFilterSubCategory('ALL');
      }
    }
  }, [filterCategory, filterSubCategory]);

  // Sinkronkan seluruh soal dari tabel questions ke question_bank
  const handleSyncFromTryouts = async () => {
    if (!bankTableAvailable) {
      alert('Tabel question_bank belum dibuat di Supabase. Jalankan file SQL migration_question_bank.sql terlebih dahulu.');
      return;
    }
    if (unsyncedQuestions.length === 0) {
      alert('Semua soal tryout sudah tersinkron di Bank Soal!');
      return;
    }

    setIsSyncing(true);
    try {
      const payloads = unsyncedQuestions.map((q) =>
        buildQuestionBankPayload({
          ...q,
          source_question_id: q.id,
          source_package_id: q.package_id,
          source_package_name: q.__packageName,
        })
      );

      const chunkSize = 100;
      for (let i = 0; i < payloads.length; i += chunkSize) {
        const chunk = payloads.slice(i, i + chunkSize);
        const { error } = await supabase.from('question_bank').insert(chunk);
        if (error) throw error;
      }

      alert(`✅ Berhasil menyinkronkan ${payloads.length} soal ke Bank Soal & mengategorikan sub-bidangnya!`);
      await loadQuestionBank();
    } catch (err: any) {
      console.error('Sync error:', err);
      alert('❌ Gagal menyinkronkan soal: ' + (err?.message || 'Terjadi kesalahan'));
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-kategorikan ulang soal yang masih berlabel Umum
  const handleAutoCategorizeGeneric = async () => {
    if (!bankTableAvailable) return;
    const genericItems = bankItems.filter((item) =>
      ['TWK Umum', 'TIU Umum', 'TKP Umum', 'Umum', ''].includes(item.sub_category || '')
    );

    if (genericItems.length === 0) {
      alert('Semua soal di Bank Soal sudah memiliki sub-bidang spesifik.');
      return;
    }

    setIsSyncing(true);
    let updatedCount = 0;
    try {
      for (const item of genericItems) {
        const detected = detectQuestionSubcategory(
          item.category,
          item.question_text,
          item.explanation
        );
        if (detected !== item.sub_category) {
          const { error } = await supabase
            .from('question_bank')
            .update({ sub_category: detected, updated_at: new Date().toISOString() })
            .eq('id', item.id);
          if (!error) updatedCount++;
        }
      }
      alert(`✅ Selesai! ${updatedCount} soal berhasil dikategorikan otomatis ke sub-bidang spesifik.`);
      await loadQuestionBank();
    } catch (err: any) {
      alert('Gagal auto-kategorisasi: ' + (err?.message || 'Error'));
    } finally {
      setIsSyncing(false);
    }
  };

  // Update sub-bidang satuan
  const handleUpdateSubCategory = async (itemId: string, newSubCat: string) => {
    setBankItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, sub_category: newSubCat } : it))
    );

    if (!bankTableAvailable) return;
    const { error } = await supabase
      .from('question_bank')
      .update({ sub_category: newSubCat, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) {
      alert('Gagal menyimpan perubahan sub-bidang: ' + error.message);
    }
  };

  // Hapus soal dari Bank Soal
  const handleDeleteFromBank = async (item: QuestionBankItem) => {
    if (item.isVirtualFallback) {
      alert('Mode baca langsung dari soal tryout aktif. Jalankan SQL migrasi Bank Soal jika ingin mengelola/menghapus entri Bank Soal secara terpisah.');
      return;
    }
    if (!confirm('Hapus soal ini dari Bank Soal? Soal yang sudah dipakai di paket tryout tidak ikut terhapus.')) {
      return;
    }

    const { error } = await supabase.from('question_bank').delete().eq('id', item.id);
    if (error) {
      alert('Gagal menghapus soal: ' + error.message);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
      setBankItems((prev) => prev.filter((it) => it.id !== item.id));
    }
  };

  // Stats & Sub-category breakdown
  const stats = useMemo(() => {
    const counts = { total: bankItems.length, TWK: 0, TIU: 0, TKP: 0 };
    const subCounts: Record<string, number> = {};
    const sourcePkgOptions = new Map<string, string>();

    bankItems.forEach((item) => {
      counts[item.category]++;
      if (filterCategory === 'ALL' || item.category === filterCategory) {
        subCounts[item.sub_category] = (subCounts[item.sub_category] || 0) + 1;
      }
      if (item.source_package_name) {
        sourcePkgOptions.set(item.source_package_name, item.source_package_name);
      }
    });

    return {
      counts,
      subEntries: Object.entries(subCounts).sort((a, b) => b[1] - a[1]),
      sourcePackages: Array.from(sourcePkgOptions.keys()).sort(),
    };
  }, [bankItems, filterCategory]);

  // Filtered list
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return bankItems.filter((item) => {
      if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
      if (filterSubCategory !== 'ALL' && item.sub_category !== filterSubCategory) return false;
      if (
        filterSourcePackage !== 'ALL' &&
        (item.source_package_name || 'Tanpa Paket') !== filterSourcePackage
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.question_text.toLowerCase().includes(q) ||
        (item.explanation || '').toLowerCase().includes(q) ||
        item.sub_category.toLowerCase().includes(q) ||
        (item.source_package_name || '').toLowerCase().includes(q)
      );
    });
  }, [bankItems, filterCategory, filterSubCategory, filterSourcePackage, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredItems.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const pageIds = paginatedItems.map((i) => i.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectPage = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Pakai ulang soal terpilih ke Paket Try Out
  const handleReuseToPackage = async (overrideItems?: QuestionBankItem[]) => {
    const itemsToCopy = overrideItems
      ? overrideItems
      : bankItems.filter((item) => selectedIds.includes(item.id));

    if (itemsToCopy.length === 0) {
      alert('Pilih minimal 1 soal dari Bank Soal terlebih dahulu.');
      return;
    }

    let destinationPkgId = targetPackageId;
    let destinationPkgName =
      packages.find((p) => p.id === targetPackageId)?.name || 'Paket Try Out';

    if (showNewPkgForm) {
      if (!newPkgName.trim()) {
        alert('Masukkan nama Paket Try Out baru terlebih dahulu.');
        return;
      }
      destinationPkgName = newPkgName.trim();
    } else if (!destinationPkgId) {
      alert('Pilih Paket Try Out tujuan (atau klik "+ Buat Paket Baru").');
      return;
    }

    if (
      !confirm(
        `Masukkan ${itemsToCopy.length} soal dari Bank Soal ke paket "${destinationPkgName}"?`
      )
    ) {
      return;
    }

    setIsReusing(true);
    try {
      // Buat paket baru jika memilih mode Buat Paket Baru
      if (showNewPkgForm) {
        const { data: createdPkg, error: pkgErr } = await supabase
          .from('tryout_packages')
          .insert([
            {
              name: newPkgName.trim(),
              description: `Disusun dari Bank Soal (${itemsToCopy.length} soal)`,
              is_premium: newPkgPremium,
              is_active: true,
              exam_type: newPkgExamType,
              show_explanation: true,
            },
          ])
          .select('id, name')
          .single();

        if (pkgErr || !createdPkg) {
          throw new Error(pkgErr?.message || 'Gagal membuat paket tujuan baru');
        }
        destinationPkgId = createdPkg.id;
        destinationPkgName = createdPkg.name;
      }

      // Cek nomor soal terakhir di paket tujuan agar berurutan
      const { data: existingNums } = await supabase
        .from('questions')
        .select('question_number')
        .eq('package_id', destinationPkgId)
        .order('question_number', { ascending: false })
        .limit(1);

      let nextNumber =
        existingNums && existingNums.length > 0
          ? (existingNums[0].question_number || 0) + 1
          : 1;

      const insertPayloads = itemsToCopy.map((item) => {
        const row = {
          package_id: destinationPkgId,
          question_number: nextNumber++,
          question_category: item.category,
          question_text: item.question_text,
          question_image_url: item.question_image_url || null,
          option_a: item.option_a || '',
          option_a_image_url: item.option_a_image_url || null,
          option_b: item.option_b || '',
          option_b_image_url: item.option_b_image_url || null,
          option_c: item.option_c || '',
          option_c_image_url: item.option_c_image_url || null,
          option_d: item.option_d || '',
          option_d_image_url: item.option_d_image_url || null,
          option_e: item.option_e || '',
          option_e_image_url: item.option_e_image_url || null,
          correct_answer: item.correct_answer || 'A',
          explanation: item.explanation || '',
        };
        return row;
      });

      const chunkSize = 50;
      for (let i = 0; i < insertPayloads.length; i += chunkSize) {
        const chunk = insertPayloads.slice(i, i + chunkSize);
        const { error: insErr } = await supabase.from('questions').insert(chunk);
        if (insErr) throw insErr;
      }

      // Tambah usage_count di question_bank jika tersedia
      if (bankTableAvailable) {
        for (const item of itemsToCopy) {
          if (!item.isVirtualFallback) {
            await supabase
              .from('question_bank')
              .update({
                usage_count: (item.usage_count || 1) + 1,
                updated_at: new Date().toISOString(),
              })
              .eq('id', item.id);
          }
        }
      }

      alert(
        `✅ Berhasil menambahkan ${itemsToCopy.length} soal ke paket "${destinationPkgName}"!`
      );

      if (!overrideItems) setSelectedIds([]);
      if (showNewPkgForm) {
        setShowNewPkgForm(false);
        setNewPkgName('');
      }
      onPackagesUpdated();
      await loadQuestionBank();
    } catch (err: any) {
      console.error('Error reusing questions:', err);
      alert('❌ Gagal memasukkan soal ke paket: ' + (err?.message || 'Terjadi kesalahan'));
    } finally {
      setIsReusing(false);
    }
  };

  // Format TKP preview helper
  const renderAnswerPreview = (item: QuestionBankItem) => {
    if (item.category === 'TKP' && item.explanation) {
      try {
        const parsed = JSON.parse(item.explanation);
        if (parsed && typeof parsed === 'object' && ('a' in parsed || 'A' in parsed)) {
          return (
            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
              {['a', 'b', 'c', 'd', 'e'].map((k) => (
                <span
                  key={k}
                  className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold"
                >
                  {k.toUpperCase()}: Skor {parsed[k] ?? parsed[k.toUpperCase()] ?? 0}
                </span>
              ))}
            </div>
          );
        }
      } catch {
        // Fallback jika bukan JSON skor TKP
      }
    }

    return (
      <div className="mt-2 space-y-1.5">
        <div className="text-xs font-bold text-emerald-700">
          Kunci Jawaban: {item.correct_answer}
        </div>
        {item.explanation && (
          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2.5 leading-relaxed">
            <strong className="text-slate-800 block mb-0.5">Pembahasan:</strong>
            <FormattedText text={item.explanation} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>Admin-Only Repository</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Bank Soal SKD Terpusat
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Seluruh soal dari paket try out terkumpul di sini dan dikelompokkan berdasarkan bidang serta sub-bidang resmi SKD agar mudah dicari dan digunakan ulang ke paket baru.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadQuestionBank}
            disabled={isLoading || isSyncing}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {bankTableAvailable && unsyncedQuestions.length > 0 && (
            <button
              type="button"
              onClick={handleSyncFromTryouts}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isSyncing
                  ? 'Menyinkronkan...'
                  : `Sinkronkan ${unsyncedQuestions.length} Soal Tryout`}
              </span>
            </button>
          )}

          {bankTableAvailable &&
            bankItems.some((i) =>
              ['TWK Umum', 'TIU Umum', 'TKP Umum', 'Umum', ''].includes(i.sub_category || '')
            ) && (
              <button
                type="button"
                onClick={handleAutoCategorizeGeneric}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Auto-Kategorikan Sub-Bidang</span>
              </button>
            )}
        </div>
      </div>

      {/* Warning Banner if SQL migration not run yet */}
      {!bankTableAvailable && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Mode Sinkron Langsung (Tabel question_bank belum dibuat):</strong>{' '}
              Soal tetap tampil &amp; bisa dipakai ulang dari seluruh paket aktif. Untuk menyimpan Bank Soal secara permanen (tetap aman walau paket try out dihapus) &amp; menyimpan edit sub-bidang, jalankan file SQL{' '}
              <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">
                supabase/migration_question_bank.sql
              </code>{' '}
              di Supabase SQL Editor.
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Bank Soal',
            value: stats.counts.total,
            key: 'ALL' as const,
            badge: 'Semua Bidang',
            activeClass: 'border-slate-800 bg-slate-900 text-white',
          },
          {
            label: 'Bidang TWK',
            value: stats.counts.TWK,
            key: 'TWK' as const,
            badge: 'Wawasan Kebangsaan',
            activeClass: 'border-blue-600 bg-blue-600 text-white',
          },
          {
            label: 'Bidang TIU',
            value: stats.counts.TIU,
            key: 'TIU' as const,
            badge: 'Intelegensia Umum',
            activeClass: 'border-indigo-600 bg-indigo-600 text-white',
          },
          {
            label: 'Bidang TKP',
            value: stats.counts.TKP,
            key: 'TKP' as const,
            badge: 'Karakteristik Pribadi',
            activeClass: 'border-emerald-600 bg-emerald-600 text-white',
          },
        ].map((card) => {
          const isActive = filterCategory === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => {
                setFilterCategory(card.key);
                setFilterSubCategory('ALL');
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? `${card.activeClass} shadow-sm`
                  : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800'
              }`}
            >
              <div
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isActive ? 'text-white/80' : 'text-slate-400'
                }`}
              >
                {card.badge}
              </div>
              <div className="text-2xl font-black mt-1">{card.value}</div>
              <div
                className={`text-xs font-semibold mt-0.5 ${
                  isActive ? 'text-white/90' : 'text-slate-600'
                }`}
              >
                {card.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sub-Bidang Breakdown Pills */}
      {stats.subEntries.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Distribusi Sub-Bidang {filterCategory === 'ALL' ? '(Semua Bidang)' : `(${filterCategory})`}
            </span>
            {filterSubCategory !== 'ALL' && (
              <button
                type="button"
                onClick={() => setFilterSubCategory('ALL')}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Reset Sub-Bidang
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterSubCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                filterSubCategory === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua ({filterCategory === 'ALL' ? stats.counts.total : stats.counts[filterCategory]})
            </button>
            {stats.subEntries.map(([subName, count]) => (
              <button
                key={subName}
                type="button"
                onClick={() =>
                  setFilterSubCategory(filterSubCategory === subName ? 'ALL' : subName)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  filterSubCategory === subName
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
                }`}
              >
                {subName} <span className="opacity-75 font-bold">({count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari isi soal, pembahasan, atau sub-bidang..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={filterSubCategory}
            onChange={(e) => setFilterSubCategory(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">Semua Sub-Bidang</option>
            {(filterCategory === 'ALL'
              ? [
                  ...SKD_SUBCATEGORIES.TWK,
                  ...SKD_SUBCATEGORIES.TIU,
                  ...SKD_SUBCATEGORIES.TKP,
                ]
              : SKD_SUBCATEGORIES[filterCategory]
            ).map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4">
          <select
            value={filterSourcePackage}
            onChange={(e) => setFilterSourcePackage(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">Semua Asal Paket Try Out</option>
            {stats.sourcePackages.map((name) => (
              <option key={name} value={name}>
                Asal: {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Reuse Action Toolbar */}
      <div
        className={`rounded-xl border p-4 transition-colors space-y-3 ${
          selectedIds.length > 0
            ? 'bg-blue-50/80 border-blue-300 shadow-xs'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allPageSelected}
                onChange={toggleSelectPage}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-700">
                Pilih Semua di Halaman ({paginatedItems.length})
              </span>
            </label>

            {filteredItems.length > paginatedItems.length && (
              <button
                type="button"
                onClick={() => {
                  const allFilteredIds = filteredItems.map((i) => i.id);
                  const isAll = allFilteredIds.every((id) => selectedIds.includes(id));
                  if (isAll) {
                    setSelectedIds((prev) =>
                      prev.filter((id) => !allFilteredIds.includes(id))
                    );
                  } else {
                    setSelectedIds((prev) =>
                      Array.from(new Set([...prev, ...allFilteredIds]))
                    );
                  }
                }}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                {filteredItems.every((i) => selectedIds.includes(i.id))
                  ? `Batal Pilih Semua Hasil Filter (${filteredItems.length})`
                  : `Pilih Semua ${filteredItems.length} Soal Hasil Filter`}
              </button>
            )}

            {selectedIds.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white">
                {selectedIds.length} soal dipilih
              </span>
            )}
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Reset Pilihan
            </button>
          )}
        </div>

        {/* Target Package Selector + Reuse Button */}
        <div className="pt-3 border-t border-slate-200/80 flex flex-col lg:flex-row lg:items-center gap-3">
          {!showNewPkgForm ? (
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <select
                value={targetPackageId}
                onChange={(e) => setTargetPackageId(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Pilih Paket Try Out Tujuan untuk Memakai Ulang Soal --</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.question_count || 0} soal)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewPkgForm(true)}
                className="px-3.5 py-2 rounded-lg border border-blue-300 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Buat Paket Baru</span>
              </button>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                value={newPkgName}
                onChange={(e) => setNewPkgName(e.target.value)}
                placeholder="Nama Paket Try Out Baru..."
                className="sm:col-span-6 border border-blue-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <select
                value={newPkgExamType}
                onChange={(e) => setNewPkgExamType(e.target.value as 'CPNS' | 'P3K')}
                className="sm:col-span-2 border border-slate-300 rounded-lg px-2 py-2 text-xs bg-white font-semibold"
              >
                <option value="CPNS">CPNS</option>
                <option value="P3K">P3K</option>
              </select>
              <select
                value={newPkgPremium ? 'premium' : 'free'}
                onChange={(e) => setNewPkgPremium(e.target.value === 'premium')}
                className="sm:col-span-2 border border-slate-300 rounded-lg px-2 py-2 text-xs bg-white font-semibold"
              >
                <option value="premium">Premium</option>
                <option value="free">Gratis</option>
              </select>
              <button
                type="button"
                onClick={() => setShowNewPkgForm(false)}
                className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleReuseToPackage()}
            disabled={isReusing || selectedIds.length === 0}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
          >
            <CopyPlus className="w-4 h-4" />
            <span>
              {isReusing
                ? 'Menyalin Soal...'
                : `Pakai Ulang ${selectedIds.length > 0 ? `(${selectedIds.length})` : ''} ke Paket`}
            </span>
          </button>
        </div>
      </div>

      {/* Question Cards List */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          Memuat seluruh soal dari Bank Soal...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <p className="font-bold text-slate-700 text-base">Belum ada soal yang cocok dengan filter</p>
          <p className="text-xs text-slate-400 mt-1">
            Coba ubah filter bidang/sub-bidang, reset pencarian, atau klik Sinkronkan Soal Tryout di bagian atas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedItems.map((item, idx) => {
            const isSelected = selectedIds.includes(item.id);
            const isExpanded = !!expandedIds[item.id];
            const subOptions = SKD_SUBCATEGORIES[item.category] || [];
            const globalIndex = (safePage - 1) * ITEMS_PER_PAGE + idx + 1;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2.5 flex-wrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer shrink-0"
                    />
                    <span className="text-xs font-mono font-bold text-slate-400 mt-0.5">
                      #{globalIndex}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-extrabold uppercase ${
                        item.category === 'TWK'
                          ? 'bg-blue-100 text-blue-700'
                          : item.category === 'TIU'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.category}
                    </span>

                    {/* Sub-Bidang Editable Selector */}
                    <select
                      value={subOptions.includes(item.sub_category) ? item.sub_category : `${item.category} Umum`}
                      onChange={(e) => handleUpdateSubCategory(item.id, e.target.value)}
                      title="Ubah kategori sub-bidang soal"
                      className="text-xs font-bold bg-slate-100 hover:bg-slate-200/70 text-slate-700 border border-slate-200 rounded-md px-2 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {subOptions.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>

                    {item.source_package_name && (
                      <span className="text-[11px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md font-medium">
                        Asal: {item.source_package_name}
                      </span>
                    )}

                    <span className="text-[11px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-md font-semibold">
                      Dipakai {item.usage_count || 1}x
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => handleReuseToPackage([item])}
                      disabled={isReusing}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                      title="Salin soal ini ke paket try out tujuan"
                    >
                      <CopyPlus className="w-3.5 h-3.5" />
                      <span>Pakai</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedIds((prev) => ({ ...prev, [item.id]: !isExpanded }))
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Tutup</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Opsi &amp; Kunci</span>
                        </>
                      )}
                    </button>
                    {!item.isVirtualFallback && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFromBank(item)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                        title="Hapus dari Bank Soal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-sm text-slate-800 leading-relaxed pl-6">
                  <FormattedText text={item.question_text} />
                  {item.question_image_url && (
                    <img
                      src={item.question_image_url}
                      alt="Gambar Soal"
                      className="mt-2 max-h-48 rounded-lg border border-slate-200"
                    />
                  )}

                  {/* Expanded Options & Answer */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      <div className="grid grid-cols-1 gap-1.5 text-xs">
                        {(['a', 'b', 'c', 'd', 'e'] as const).map((opt) => {
                          const letter = opt.toUpperCase();
                          const optText = item[`option_${opt}` as keyof QuestionBankItem] as string;
                          const isKey = item.correct_answer === letter && item.category !== 'TKP';
                          if (!optText) return null;
                          return (
                            <div
                              key={opt}
                              className={`p-2 rounded-lg border flex items-start gap-2 ${
                                isKey
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className="font-bold shrink-0">{letter}.</span>
                              <div className="flex-1">
                                <FormattedText text={optText} />
                              </div>
                              {isKey && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {renderAnswerPreview(item)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs">
          <div className="text-slate-500">
            Menampilkan {(safePage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(safePage * ITEMS_PER_PAGE, filteredItems.length)} dari{' '}
            <strong>{filteredItems.length}</strong> soal
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold cursor-pointer"
            >
              ← Sebelumnya
            </button>
            <span className="px-2 font-bold text-slate-700">
              Hal {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold cursor-pointer"
            >
              Berikutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
