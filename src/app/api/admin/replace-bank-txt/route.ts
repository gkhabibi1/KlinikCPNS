import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  normalizeCategory,
  detectQuestionSubcategory,
} from '@/lib/questionSubcategory';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface IncomingQuestion {
  type: string;
  number?: number;
  question: string;
  correct: string;
  explanation?: string;
  options: {
    a?: string;
    b?: string;
    c?: string;
    d?: string;
    e?: string;
  };
  scores?: {
    a?: number;
    b?: number;
    c?: number;
    d?: number;
    e?: number;
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items: IncomingQuestion[] = Array.isArray(body.questions) ? body.questions : [];
    const clearExisting = Boolean(body.clearExisting);
    const markCalibrated = body.markCalibrated !== false;

    const supabaseAdmin = getSupabaseAdmin();

    if (clearExisting) {
      const { error: delErr } = await supabaseAdmin
        .from('question_bank')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (delErr) {
        throw delErr;
      }
    }

    if (items.length === 0) {
      return NextResponse.json({ success: true, insertedCount: 0 });
    }

    const nowIso = new Date().toISOString();

    const rows = items.map((q) => {
      const category = normalizeCategory(q.type);
      const subCategory = detectQuestionSubcategory(
        category,
        q.question || '',
        q.explanation || ''
      );
      const correctLetter = String(q.correct || 'A').trim().toUpperCase().slice(0, 1);
      const safeCorrect = ['A', 'B', 'C', 'D', 'E'].includes(correctLetter)
        ? correctLetter
        : 'A';

      const tkpScores =
        category === 'TKP'
          ? {
              a: Number(q.scores?.a) || 1,
              b: Number(q.scores?.b) || 2,
              c: Number(q.scores?.c) || 3,
              d: Number(q.scores?.d) || 4,
              e: Number(q.scores?.e) || 5,
            }
          : null;

      return {
        category,
        sub_category: subCategory,
        question_text: String(q.question || '').trim(),
        option_a: String(q.options?.a || '').trim(),
        option_b: String(q.options?.b || '').trim(),
        option_c: String(q.options?.c || '').trim(),
        option_d: String(q.options?.d || '').trim(),
        option_e: String(q.options?.e || '').trim(),
        correct_answer: safeCorrect,
        explanation: String(q.explanation || '').trim(),
        tkp_scores: tkpScores,
        usage_count: 1,
        is_ai_calibrated: markCalibrated,
        ai_calibrated_at: markCalibrated ? nowIso : null,
        ai_calibration_notes: markCalibrated
          ? 'Diimpor dari file TXT HOTS terkalibrasi'
          : null,
        created_at: nowIso,
        updated_at: nowIso,
      };
    });

    const { error: insertErr } = await supabaseAdmin
      .from('question_bank')
      .insert(rows);

    if (insertErr) {
      // Fallback jika kolom migrasi is_ai_calibrated belum dijalankan
      const msg = String(insertErr.message || '').toLowerCase();
      if (msg.includes('is_ai_calibrated')) {
        const legacyRows = rows.map(
          ({ is_ai_calibrated, ai_calibrated_at, ai_calibration_notes, ...rest }) => rest
        );
        const { error: legacyErr } = await supabaseAdmin
          .from('question_bank')
          .insert(legacyRows);
        if (legacyErr) throw legacyErr;
      } else {
        throw insertErr;
      }
    }

    return NextResponse.json({
      success: true,
      insertedCount: rows.length,
    });
  } catch (err: any) {
    console.error('Error in /api/admin/replace-bank-txt:', err);
    return NextResponse.json(
      { error: err?.message || 'Gagal mengimpor soal ke Bank Soal.' },
      { status: 500 }
    );
  }
}
