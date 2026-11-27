import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export interface QuestionCheckInput {
  id: string;
  category: string;
  sub_category?: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  explanation?: string | null;
  tkp_scores?: any;
}

export interface QuestionAiReview {
  id: string;
  is_valid: boolean;
  answer_status: 'BENAR' | 'PERLU_CEK' | 'KELIRU';
  suggested_answer?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  difficulty_label: string;
  reason: string;
  improvement_tip?: string;
  checked_at: string;
}

const REVIEWS_SETTING_KEY = 'question_ai_reviews';

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Sangat Mudah',
  2: 'Mudah',
  3: 'Sedang',
  4: 'Sulit',
  5: 'HOTS (Sangat Sulit)',
};

async function readStoredReviews(): Promise<Record<string, QuestionAiReview>> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', REVIEWS_SETTING_KEY)
      .maybeSingle();

    if (!data?.value) return {};
    return JSON.parse(data.value) as Record<string, QuestionAiReview>;
  } catch {
    return {};
  }
}

async function saveStoredReviews(reviews: Record<string, QuestionAiReview>) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.from('system_settings').upsert({
      key: REVIEWS_SETTING_KEY,
      value: JSON.stringify(reviews),
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not persist AI reviews to system_settings:', err);
  }
}

export async function GET() {
  const reviews = await readStoredReviews();
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY belum diatur di .env.local. Buat API key gratis di Google AI Studio (aistudio.google.com) lalu tambahkan GEMINI_API_KEY=... ke .env.local dan restart server.',
          code: 'MISSING_API_KEY',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const questions: QuestionCheckInput[] = Array.isArray(body.questions)
      ? body.questions
      : body.question
      ? [body.question]
      : [];
    const persist = body.persist !== false;

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Minimal 1 soal wajib dikirim untuk dicek.' },
        { status: 400 }
      );
    }

    if (questions.length > 10) {
      return NextResponse.json(
        { error: 'Maksimal 10 soal per sekali request batch agar akurat.' },
        { status: 400 }
      );
    }

    const promptPayload = questions.map((q) => ({
      id: q.id,
      category: q.category,
      sub_category: q.sub_category || '',
      question_text: q.question_text,
      options: {
        A: q.option_a,
        B: q.option_b,
        C: q.option_c,
        D: q.option_d,
        E: q.option_e,
      },
      correct_answer: q.correct_answer,
      tkp_scores: q.category === 'TKP' ? q.tkp_scores || null : null,
      explanation: q.explanation || '',
    }));

    const systemInstruction = `Anda adalah validator soal resmi seleksi CPNS SKD (TWK, TIU, TKP) standar CAT BKN Indonesia.
Tugas Anda untuk SETIAP soal yang diberikan:
1. Periksa kebenaran materi, kejelasan kalimat, kelayakan opsi A-E, dan KESESUAIAN kunci jawaban (untuk TIU hitung ulang secara matematis/logika; untuk TWK cek fakta UUD 1945/Pancasila/sejarah/tata negara; untuk TKP cek kesesuaian opsi nilai 5 dengan nilai dasar ASN BerAKHLAK).
2. Tentukan answer_status:
   - "BENAR" jika soal jelas & kunci jawaban sudah tepat.
   - "PERLU_CEK" jika soal agak ambigu, ada typo mengganggu, atau pembahasan kurang sinkron.
   - "KELIRU" jika kunci jawaban yang tertulis jelas salah atau tidak sesuai konsep.
3. Nilai tingkat kesulitan dengan skala integer 1 sampai 5:
   - 1: Sangat Mudah (hafalan langsung / 1 langkah dasar)
   - 2: Mudah (pemahaman konsep standar)
   - 3: Sedang (setara rata-rata soal CAT BKN)
   - 4: Sulit (penalaran bertingkat / opsi pengecoh sangat mirip)
   - 5: HOTS / Sangat Sulit (analisis kompleks multi-konsep)
4. Berikan alasan ringkas (maks 2 kalimat) dan saran perbaikan jika ada.

Kembalikan HANYA JSON valid berbentuk array of objects dengan schema persis:
[
  {
    "id": "string (sama persis dengan id input)",
    "is_valid": boolean,
    "answer_status": "BENAR" | "PERLU_CEK" | "KELIRU",
    "suggested_answer": "string (misal 'B' atau kosong jika sudah benar)",
    "difficulty": 1 | 2 | 3 | 4 | 5,
    "reason": "string",
    "improvement_tip": "string (opsional, boleh string kosong)"
  }
]`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\nData soal untuk dicek:\n${JSON.stringify(
                  promptPayload,
                  null,
                  2
                )}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    const geminiJson = await geminiRes.json();

    if (!geminiRes.ok) {
      const apiErrMsg =
        geminiJson?.error?.message || 'Gagal menghubungi Gemini API';
      return NextResponse.json(
        { error: `Gemini API Error: ${apiErrMsg}` },
        { status: geminiRes.status || 500 }
      );
    }

    const rawText =
      geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

    let parsedResults: any[];
    try {
      const parsed = JSON.parse(rawText);
      parsedResults = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return NextResponse.json(
        { error: 'Respons AI tidak berbentuk JSON valid. Coba ulangi.' },
        { status: 500 }
      );
    }

    const nowIso = new Date().toISOString();
    const normalized: QuestionAiReview[] = parsedResults.map((item, idx) => {
      const diffNum = Math.min(5, Math.max(1, Math.round(Number(item.difficulty) || 3))) as
        | 1
        | 2
        | 3
        | 4
        | 5;
      const status =
        item.answer_status === 'KELIRU' || item.answer_status === 'PERLU_CEK'
          ? item.answer_status
          : 'BENAR';

      return {
        id: String(item.id || questions[idx]?.id || ''),
        is_valid: typeof item.is_valid === 'boolean' ? item.is_valid : status === 'BENAR',
        answer_status: status,
        suggested_answer: item.suggested_answer ? String(item.suggested_answer) : '',
        difficulty: diffNum,
        difficulty_label: DIFFICULTY_LABELS[diffNum] || 'Sedang',
        reason: String(item.reason || 'Sudah diperiksa oleh AI.'),
        improvement_tip: item.improvement_tip ? String(item.improvement_tip) : '',
        checked_at: nowIso,
      };
    });

    if (persist) {
      const existing = await readStoredReviews();
      const merged = { ...existing };
      normalized.forEach((rev) => {
        if (rev.id) merged[rev.id] = rev;
      });
      await saveStoredReviews(merged);
    }

    return NextResponse.json({
      success: true,
      reviews: normalized,
    });
  } catch (err: any) {
    console.error('Check question AI error:', err);
    return NextResponse.json(
      { error: err?.message || 'Terjadi kesalahan saat mengecek soal dengan AI' },
      { status: 500 }
    );
  }
}
