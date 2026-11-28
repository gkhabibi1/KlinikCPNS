import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

export type CalibratorProvider = 'gemini' | 'groq' | 'mistral';
export type TargetDifficulty = 'sulit' | 'sangat_sulit';

interface CalibrateRequestBody {
  batchSize?: number;
  provider?: CalibratorProvider;
  apiKeys?: string[];
  targetDifficulty?: TargetDifficulty;
}

interface CalibratedQuestionItem {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  explanation: string;
  answer_corrected?: boolean;
  calibration_notes?: string;
}

function isMissingColumnError(err: any): boolean {
  const msg = String(err?.message || err?.details || '').toLowerCase();
  return msg.includes('is_ai_calibrated') && (msg.includes('does not exist') || msg.includes('schema cache'));
}

function stripJsonFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    return trimmed.slice(firstBracket, lastBracket + 1);
  }
  return trimmed;
}

function normalizeAnswerLetter(ans: string, fallback: string): string {
  const letter = String(ans || '').trim().toUpperCase().slice(0, 1);
  return ['A', 'B', 'C', 'D', 'E'].includes(letter) ? letter : fallback;
}

async function callProviderWithKey(
  provider: CalibratorProvider,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ ok: true; rawText: string } | { ok: false; rateLimited: boolean; status: number; error: string }> {
  try {
    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.35,
            responseMimeType: 'application/json',
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 429) {
        return { ok: false, rateLimited: true, status: 429, error: json?.error?.message || 'Gemini rate limit (429)' };
      }
      if (!res.ok) {
        return { ok: false, rateLimited: false, status: res.status, error: json?.error?.message || `Gemini HTTP ${res.status}` };
      }
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      return { ok: true, rawText: text };
    }

    const endpoint =
      provider === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.mistral.ai/v1/chat/completions';
    const model = provider === 'groq' ? 'llama-3.3-70b-versatile' : 'mistral-small-latest';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 429) {
      return { ok: false, rateLimited: true, status: 429, error: json?.error?.message || `${provider.toUpperCase()} rate limit (429)` };
    }
    if (!res.ok) {
      return { ok: false, rateLimited: false, status: res.status, error: json?.error?.message || json?.message || `${provider.toUpperCase()} HTTP ${res.status}` };
    }
    const text = json?.choices?.[0]?.message?.content || '[]';
    return { ok: true, rawText: text };
  } catch (err: any) {
    return { ok: false, rateLimited: false, status: 500, error: err?.message || 'Network error calling AI provider' };
  }
}

async function getCalibrationStats(supabaseAdmin: ReturnType<typeof getSupabaseAdmin>) {
  const [totalRes, calibratedRes, remainingRes] = await Promise.all([
    supabaseAdmin.from('question_bank').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('question_bank').select('id', { count: 'exact', head: true }).eq('is_ai_calibrated', true),
    supabaseAdmin.from('question_bank').select('id', { count: 'exact', head: true }).eq('is_ai_calibrated', false),
  ]);

  if (calibratedRes.error && isMissingColumnError(calibratedRes.error)) {
    return {
      migrationReady: false,
      total: totalRes.count || 0,
      calibratedCount: 0,
      remaining: totalRes.count || 0,
    };
  }

  return {
    migrationReady: true,
    total: totalRes.count || 0,
    calibratedCount: calibratedRes.count || 0,
    remaining: remainingRes.count || 0,
  };
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const stats = await getCalibrationStats(supabaseAdmin);
    return NextResponse.json(stats, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Gagal membaca statistik kalibrasi' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CalibrateRequestBody;
    const batchSize = Math.min(10, Math.max(1, Number(body.batchSize) || 5));
    const provider: CalibratorProvider = body.provider || 'gemini';
    const targetDifficulty: TargetDifficulty = body.targetDifficulty === 'sangat_sulit' ? 'sangat_sulit' : 'sulit';
    const apiKeys = (Array.isArray(body.apiKeys) ? body.apiKeys : [])
      .map((k) => String(k || '').trim())
      .filter(Boolean);

    if (apiKeys.length === 0) {
      return NextResponse.json(
        { error: 'Minimal 1 API Key harus diisi sebelum memulai kalibrasi.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Cek apakah kolom migrasi sudah tersedia & ambil batch soal yang belum dikalibrasi
    const { data: batchRows, error: fetchError } = await supabaseAdmin
      .from('question_bank')
      .select(
        'id, source_question_id, category, sub_category, question_text, option_a, option_b, option_c, option_d, option_e, correct_answer, explanation, tkp_scores'
      )
      .eq('is_ai_calibrated', false)
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (fetchError) {
      if (isMissingColumnError(fetchError)) {
        return NextResponse.json(
          {
            error:
              'Kolom kalibrasi belum ada di tabel question_bank. Jalankan file SQL supabase/migration_ai_calibrator.sql di Supabase SQL Editor terlebih dahulu.',
            migrationRequired: true,
          },
          { status: 400 }
        );
      }
      throw fetchError;
    }

    if (!batchRows || batchRows.length === 0) {
      const stats = await getCalibrationStats(supabaseAdmin);
      return NextResponse.json({
        completed: true,
        remaining: 0,
        total: stats.total,
        calibratedCount: stats.calibratedCount,
        processedCount: 0,
        results: [],
      });
    }

    const difficultyDesc =
      targetDifficulty === 'sangat_sulit'
        ? 'SANGAT SULIT / HOTS TINGKAT TINGGI (Level 5/5: studi kasus kompleks, multi-variabel, penalaran bertingkat, jebakan konseptual tingkat lanjut)'
        : 'SULIT / HOTS ANALITIS (Level 4/5: penalaran analitis, penerapan konsep, studi kasus kontekstual, hindari soal hafalan dangkal)';

    const systemPrompt = `Anda adalah Ahli Pembuat Soal & Validator Seleksi ASN CPNS (TWK, TIU, TKP) berstandar BKN.
Tugas Anda pada setiap soal dalam array JSON input:
1. VERIFIKASI KUNCI JAWABAN: Periksa secara ketat apakah "correct_answer" awal sudah benar secara logika, hitungan matematis, kaidah PUEBI/KBBI, regulasi UUD/Pancasila/NKRI, atau prinsip pelayanan publik TKP. Jika salah atau ambigu, PERBAIKI "correct_answer" ke huruf yang benar (A/B/C/D/E).
2. UPGRADE KUALITAS & KESULITAN KE ${difficultyDesc}:
   - Pertahankan topik/sub_category inti soal.
   - Tingkatkan bobot soal menjadi HOTS (analisis, sintesis, studi kasus, penalaran bertingkat).
   - Buat 5 opsi (option_a s.d. option_e) dengan pengecoh (distractor) yang jauh lebih menjebak dan realistis, namun pastikan tetap hanya ada SATU jawaban mutlak yang paling valid.
   - Jika kategori adalah TKP, pastikan narasi studi kasus dilematis dan opsi paling ideal berada di "correct_answer".
3. PERBARUI PEMBAHASAN: Tulis "explanation" yang runtut, tegas, dan jelas (mengapa jawaban benar tepat dan mengapa pengecoh utama kurang tepat).
4. FORMAT OUTPUT WAJIB: Kembalikan HANYA JSON array murni tanpa markdown, tanpa \`\`\`json, tanpa teks pembuka/penutup. Setiap elemen wajib memiliki field persis:
   - "id" (sama persis dengan input)
   - "question_text"
   - "option_a", "option_b", "option_c", "option_d", "option_e"
   - "correct_answer" ("A"|"B"|"C"|"D"|"E")
   - "explanation"
   - "answer_corrected" (boolean: true jika kunci jawaban berubah atau diperbaiki, false jika tetap)
   - "calibration_notes" (ringkasan singkat 1 kalimat dalam Bahasa Indonesia tentang perbaikan kualitas/kunci jawaban)`;

    const inputPayload = batchRows.map((row) => ({
      id: row.id,
      category: row.category,
      sub_category: row.sub_category,
      question_text: row.question_text,
      option_a: row.option_a,
      option_b: row.option_b,
      option_c: row.option_c,
      option_d: row.option_d,
      option_e: row.option_e,
      correct_answer: row.correct_answer,
      explanation: row.explanation || '',
    }));

    const userPrompt = `Kalibrasi dan tingkatkan seluruh ${inputPayload.length} soal berikut menjadi JSON array murni:\n${JSON.stringify(inputPayload)}`;

    let aiRawText: string | null = null;
    let usedKeyIndex = -1;
    let allRateLimited = true;
    let lastError = '';

    for (let i = 0; i < apiKeys.length; i++) {
      const result = await callProviderWithKey(provider, apiKeys[i], systemPrompt, userPrompt);
      if (result.ok) {
        aiRawText = result.rawText;
        usedKeyIndex = i;
        allRateLimited = false;
        break;
      }
      lastError = result.error;
      if (!result.rateLimited) {
        allRateLimited = false;
      }
    }

    if (aiRawText === null) {
      const stats = await getCalibrationStats(supabaseAdmin);
      if (allRateLimited) {
        return NextResponse.json({
          rateLimited: true,
          remaining: stats.remaining,
          total: stats.total,
          calibratedCount: stats.calibratedCount,
          error: `Semua ${apiKeys.length} API Key ${provider.toUpperCase()} terkena batas limit (HTTP 429).`,
        });
      }
      return NextResponse.json(
        {
          error: lastError || `Gagal memanggil ${provider.toUpperCase()} API.`,
          remaining: stats.remaining,
        },
        { status: 502 }
      );
    }

    let parsedItems: CalibratedQuestionItem[] = [];
    try {
      const cleaned = stripJsonFences(aiRawText);
      const parsed = JSON.parse(cleaned);
      parsedItems = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.questions) ? parsed.questions : [];
    } catch {
      return NextResponse.json(
        { error: 'Respons AI tidak berupa JSON array yang valid. Silakan ulangi batch ini.' },
        { status: 502 }
      );
    }

    if (parsedItems.length === 0) {
      return NextResponse.json(
        { error: 'AI mengembalikan array kosong. Silakan ulangi batch ini.' },
        { status: 502 }
      );
    }

    const rowMap = new Map(batchRows.map((r) => [r.id, r]));
    const nowIso = new Date().toISOString();
    const activityResults: Array<{
      id: string;
      category: string;
      sub_category: string;
      answerCorrected: boolean;
      oldAnswer: string;
      newAnswer: string;
      notes: string;
    }> = [];

    for (const item of parsedItems) {
      const original = rowMap.get(item.id);
      if (!original) continue;

      const newAnswer = normalizeAnswerLetter(item.correct_answer, original.correct_answer || 'A');
      const answerCorrected =
        Boolean(item.answer_corrected) ||
        newAnswer !== normalizeAnswerLetter(original.correct_answer, 'A');

      const notes =
        String(item.calibration_notes || '').trim() ||
        (answerCorrected
          ? `Kunci dikoreksi dari ${original.correct_answer} ke ${newAnswer} & soal ditingkatkan ke ${targetDifficulty === 'sangat_sulit' ? 'HOTS Level 5' : 'Sulit Level 4'}.`
          : `Soal dan pengecoh ditingkatkan ke level ${targetDifficulty === 'sangat_sulit' ? 'HOTS Level 5' : 'Sulit Level 4'}.`);

      const backupPayload = {
        question_text: original.question_text,
        option_a: original.option_a,
        option_b: original.option_b,
        option_c: original.option_c,
        option_d: original.option_d,
        option_e: original.option_e,
        correct_answer: original.correct_answer,
        explanation: original.explanation,
        tkp_scores: original.tkp_scores,
        backed_up_at: nowIso,
      };

      const updatedFields = {
        question_text: String(item.question_text || original.question_text).trim(),
        option_a: String(item.option_a || original.option_a).trim(),
        option_b: String(item.option_b || original.option_b).trim(),
        option_c: String(item.option_c || original.option_c).trim(),
        option_d: String(item.option_d || original.option_d).trim(),
        option_e: String(item.option_e || original.option_e).trim(),
        correct_answer: newAnswer,
        explanation: String(item.explanation || original.explanation || '').trim(),
      };

      const { error: updateErr } = await supabaseAdmin
        .from('question_bank')
        .update({
          ...updatedFields,
          is_ai_calibrated: true,
          ai_calibrated_at: nowIso,
          ai_calibration_notes: notes,
          original_question_backup: backupPayload,
          updated_at: nowIso,
        })
        .eq('id', original.id);

      if (updateErr) {
        throw updateErr;
      }

      if (original.source_question_id) {
        await supabaseAdmin
          .from('questions')
          .update(updatedFields)
          .eq('id', original.source_question_id);
      }

      activityResults.push({
        id: original.id,
        category: original.category,
        sub_category: original.sub_category,
        answerCorrected,
        oldAnswer: original.correct_answer,
        newAnswer,
        notes,
      });
    }

    const statsAfter = await getCalibrationStats(supabaseAdmin);

    return NextResponse.json({
      completed: statsAfter.remaining === 0,
      remaining: statsAfter.remaining,
      total: statsAfter.total,
      calibratedCount: statsAfter.calibratedCount,
      processedCount: activityResults.length,
      usedKeyIndex,
      results: activityResults,
    });
  } catch (err: any) {
    console.error('Error in /api/calibrate-questions:', err);
    return NextResponse.json(
      { error: err?.message || 'Terjadi kesalahan saat mengkalibrasi soal.' },
      { status: 500 }
    );
  }
}
