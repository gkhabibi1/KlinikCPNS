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
  verified?: 'BENAR' | 'PERLU_CEK' | 'KELIRU' | 'BELUM';
  difficulty?: 1 | 2 | 3 | 4 | 5;
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

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Sangat Mudah',
  2: 'Mudah',
  3: 'Sedang',
  4: 'Sulit',
  5: 'HOTS (Sangat Sulit)',
};

const REVIEWS_SETTING_KEY = 'question_ai_reviews';

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
      await supabaseAdmin.from('system_settings').upsert(
        {
          key: REVIEWS_SETTING_KEY,
          value: JSON.stringify({}),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );
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

      const itemCalibrated =
        q.verified === 'BENAR' || q.verified === 'PERLU_CEK' || q.verified === 'KELIRU'
          ? true
          : markCalibrated;

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
        is_ai_calibrated: itemCalibrated,
        ai_calibrated_at: itemCalibrated ? nowIso : null,
        ai_calibration_notes: itemCalibrated
          ? `Terverifikasi (${q.verified || 'BENAR'}) · Level ${q.difficulty || 5}/5 dari file TXT`
          : null,
        created_at: nowIso,
        updated_at: nowIso,
      };
    });

    let insertedIds: string[] = [];
    const { data: insertedData, error: insertErr } = await supabaseAdmin
      .from('question_bank')
      .insert(rows)
      .select('id');

    if (insertErr) {
      // Fallback jika kolom migrasi is_ai_calibrated belum dijalankan
      const msg = String(insertErr.message || '').toLowerCase();
      if (msg.includes('is_ai_calibrated')) {
        const legacyRows = rows.map(
          ({ is_ai_calibrated, ai_calibrated_at, ai_calibration_notes, ...rest }) => rest
        );
        const { data: legacyData, error: legacyErr } = await supabaseAdmin
          .from('question_bank')
          .insert(legacyRows)
          .select('id');
        if (legacyErr) throw legacyErr;
        insertedIds = (legacyData || []).map((r: any) => r.id);
      } else {
        throw insertErr;
      }
    } else {
      insertedIds = (insertedData || []).map((r: any) => r.id);
    }

    // Simpan status verifikasi & tingkat kesulitan ke question_ai_reviews agar langsung terdeteksi di Bank Soal
    const hasReviewMetadata = items.some(
      (q) => (q.verified && q.verified !== 'BELUM') || q.difficulty
    );
    if (hasReviewMetadata && insertedIds.length > 0) {
      const { data: existingSetting } = await supabaseAdmin
        .from('system_settings')
        .select('value')
        .eq('key', REVIEWS_SETTING_KEY)
        .maybeSingle();

      let currentReviews: Record<string, any> = {};
      if (existingSetting?.value) {
        try {
          currentReviews = JSON.parse(existingSetting.value) || {};
        } catch {
          currentReviews = {};
        }
      }

      insertedIds.forEach((id, idx) => {
        const src = items[idx];
        if (!src) return;
        const status =
          src.verified && src.verified !== 'BELUM'
            ? src.verified
            : markCalibrated
            ? 'BENAR'
            : null;
        const diffNum = Number(src.difficulty);
        const validDiff = diffNum >= 1 && diffNum <= 5 ? diffNum : 5;
        if (status || src.difficulty) {
          currentReviews[id] = {
            id,
            is_valid: (status || 'BENAR') === 'BENAR',
            answer_status: status || 'BENAR',
            difficulty: validDiff,
            difficulty_label: DIFFICULTY_LABELS[validDiff] || 'HOTS (Sangat Sulit)',
            reason: 'Terverifikasi & terkalibrasi dari file TXT.',
            checked_at: nowIso,
          };
        }
      });

      await supabaseAdmin.from('system_settings').upsert(
        {
          key: REVIEWS_SETTING_KEY,
          value: JSON.stringify(currentReviews),
          updated_at: nowIso,
        },
        { onConflict: 'key' }
      );
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
