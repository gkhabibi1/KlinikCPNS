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

export type AiProviderId =
  | 'gemini'
  | 'openai'
  | 'deepseek'
  | 'openrouter'
  | 'groq'
  | 'custom';

export interface AiCheckerConfig {
  provider: AiProviderId;
  model: string;
  api_key?: string;
  custom_base_url?: string;
}

const REVIEWS_SETTING_KEY = 'question_ai_reviews';
const CONFIG_SETTING_KEY = 'ai_question_checker_config';

const DEFAULT_AI_CONFIG: AiCheckerConfig = {
  provider: 'gemini',
  model: 'gemini-3.8-flash',
  api_key: '',
  custom_base_url: '',
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Sangat Mudah',
  2: 'Mudah',
  3: 'Sedang',
  4: 'Sulit',
  5: 'HOTS (Sangat Sulit)',
};

async function readSettingJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (!data?.value) return fallback;
    return JSON.parse(data.value) as T;
  } catch {
    return fallback;
  }
}

async function writeSettingJson(key: string, value: unknown) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.from('system_settings').upsert({
      key,
      value: JSON.stringify(value),
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn(`Could not persist ${key} to system_settings:`, err);
  }
}

function getEnvApiKey(provider: AiProviderId): string {
  switch (provider) {
    case 'gemini':
      return process.env.GEMINI_API_KEY || '';
    case 'openai':
      return process.env.OPENAI_API_KEY || '';
    case 'deepseek':
      return process.env.DEEPSEEK_API_KEY || '';
    case 'openrouter':
      return process.env.OPENROUTER_API_KEY || '';
    case 'groq':
      return process.env.GROQ_API_KEY || '';
    default:
      return process.env.CUSTOM_AI_API_KEY || '';
  }
}

function getOpenAiCompatibleEndpoint(
  provider: AiProviderId,
  customBaseUrl?: string
): string {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions';
    case 'deepseek':
      return 'https://api.deepseek.com/chat/completions';
    case 'openrouter':
      return 'https://openrouter.ai/api/v1/chat/completions';
    case 'groq':
      return 'https://api.groq.com/openai/v1/chat/completions';
    case 'custom':
      return (customBaseUrl || '').trim();
    default:
      return '';
  }
}

function maskKey(key?: string): string {
  if (!key || key.length < 8) return key ? '••••••••' : '';
  return `${key.slice(0, 6)}••••••${key.slice(-4)}`;
}

export async function GET() {
  const [reviews, config] = await Promise.all([
    readSettingJson<Record<string, QuestionAiReview>>(REVIEWS_SETTING_KEY, {}),
    readSettingJson<AiCheckerConfig>(CONFIG_SETTING_KEY, DEFAULT_AI_CONFIG),
  ]);

  return NextResponse.json({
    reviews,
    config: {
      provider: config.provider || 'gemini',
      model: config.model || 'gemini-3.8-flash',
      custom_base_url: config.custom_base_url || '',
      has_saved_key: Boolean(config.api_key),
      masked_key: maskKey(config.api_key),
    },
    env_keys: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
      openrouter: Boolean(process.env.OPENROUTER_API_KEY),
      groq: Boolean(process.env.GROQ_API_KEY),
      custom: Boolean(process.env.CUSTOM_AI_API_KEY),
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Simpan konfigurasi provider, model, & API key dari Admin Panel
    if (body.action === 'save_config') {
      const existing = await readSettingJson<AiCheckerConfig>(
        CONFIG_SETTING_KEY,
        DEFAULT_AI_CONFIG
      );
      const nextConfig: AiCheckerConfig = {
        provider: (body.config?.provider || existing.provider || 'gemini') as AiProviderId,
        model: String(body.config?.model || existing.model || 'gemini-3.8-flash').trim(),
        custom_base_url: String(body.config?.custom_base_url || '').trim(),
        api_key: body.clear_api_key
          ? ''
          : body.config?.api_key?.trim()
          ? String(body.config.api_key).trim()
          : existing.api_key || '',
      };

      await writeSettingJson(CONFIG_SETTING_KEY, nextConfig);

      return NextResponse.json({
        success: true,
        config: {
          provider: nextConfig.provider,
          model: nextConfig.model,
          custom_base_url: nextConfig.custom_base_url || '',
          has_saved_key: Boolean(nextConfig.api_key),
          masked_key: maskKey(nextConfig.api_key),
        },
      });
    }

    const config = await readSettingJson<AiCheckerConfig>(
      CONFIG_SETTING_KEY,
      DEFAULT_AI_CONFIG
    );
    const provider: AiProviderId = config.provider || 'gemini';
    const model = config.model || 'gemini-3.8-flash';
    const apiKey = (config.api_key || '').trim() || getEnvApiKey(provider);

    if (!apiKey) {
      return NextResponse.json(
        {
          error: `API Key untuk provider "${provider.toUpperCase()}" belum diisi. Masukkan API Key di Pengaturan AI di atas (atau di Environment Variables Vercel).`,
          code: 'MISSING_API_KEY',
        },
        { status: 400 }
      );
    }

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

Kembalikan HANYA JSON valid berbentuk array of objects (atau object {"results": [...]}) dengan schema persis:
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

    let rawText = '[]';

    if (provider === 'gemini') {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey)}`;

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

      rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    } else {
      const endpoint = getOpenAiCompatibleEndpoint(
        provider,
        config.custom_base_url
      );
      if (!endpoint) {
        return NextResponse.json(
          { error: 'Endpoint Custom Base URL wajib diisi untuk provider Custom.' },
          { status: 400 }
        );
      }

      const aiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            { role: 'system', content: systemInstruction },
            {
              role: 'user',
              content: `Data soal untuk dicek:\n${JSON.stringify(
                promptPayload,
                null,
                2
              )}`,
            },
          ],
        }),
      });

      const aiJson = await aiRes.json();
      if (!aiRes.ok) {
        const errMsg =
          aiJson?.error?.message || aiJson?.message || `Gagal menghubungi ${provider}`;
        return NextResponse.json(
          { error: `${provider.toUpperCase()} API Error: ${errMsg}` },
          { status: aiRes.status || 500 }
        );
      }

      rawText = aiJson?.choices?.[0]?.message?.content || '[]';
    }

    // Bersihkan markdown code fence jika model membungkus JSON dengan ```json ... ```
    const cleanedJsonText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    let parsedResults: any[];
    try {
      const parsed = JSON.parse(cleanedJsonText);
      if (Array.isArray(parsed)) {
        parsedResults = parsed;
      } else if (parsed && Array.isArray(parsed.results)) {
        parsedResults = parsed.results;
      } else {
        parsedResults = [parsed];
      }
    } catch {
      return NextResponse.json(
        { error: 'Respons AI tidak berbentuk JSON valid. Coba ulangi atau ganti model.' },
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
      const existing = await readSettingJson<Record<string, QuestionAiReview>>(
        REVIEWS_SETTING_KEY,
        {}
      );
      const merged = { ...existing };
      normalized.forEach((rev) => {
        if (rev.id) merged[rev.id] = rev;
      });
      await writeSettingJson(REVIEWS_SETTING_KEY, merged);
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
