import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getKnowledgeAnswer, KLINIK_CPNS_KNOWLEDGE } from '@/lib/knowledgeBase';

export async function POST(req: Request) {
  try {
    const { userId, userEmail, userName, message } = await req.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId dan message diperlukan.' },
        { status: 400 }
      );
    }

    let botReply = '';
    let source = 'knowledge_base';

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // 1. Opsi A: Jika user telah memasang GEMINI_API_KEY (Google AI Studio Free Tier)
    if (geminiApiKey) {
      try {
        const knowledgePrompt = KLINIK_CPNS_KNOWLEDGE.map(k => `[Topik: ${k.topic}]\n${k.answer}`).join('\n\n');

        const systemPrompt = `Anda adalah Asisten Virtual AI resmi dari platform pembelajaran "Klinik CPNS" (klinikcpns.com).
Tugas Anda adalah menjawab pertanyaan calon peserta CPNS & P3K secara ramah, sopan, ringkas, jelas, dan akurat berdasarkan Knowledge Base berikut:

=== KNOWLEDGE BASE KLINIK CPNS ===
${knowledgePrompt}
==================================

Pedoman menjawab:
1. Jawab selalu dalam bahasa Indonesia yang ramah, santun, dan menyemangati ("Halo!", "Semangat berjuang!").
2. Gunakan informasi resmi dari Knowledge Base di atas (Passing Grade, 30 Days Challenge, aturan anti-curang, garansi uang kembali 100%, WhatsApp admin +62 851-9965-5534).
3. Buat jawaban padat dan to-the-point (maksimal 2-3 paragraf).
4. Jika pertanyaan di luar konteks Klinik CPNS dan materi SKD, jawab dengan sopan bahwa Anda adalah asisten khusus Klinik CPNS dan sarankan menghubungi admin WhatsApp jika butuh bantuan lebih lanjut.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: systemPrompt },
                    { text: `Pertanyaan dari user (${userName || 'Member'}): "${message}"` }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 600
              }
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const generatedText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            botReply = generatedText.trim();
            source = 'gemini_ai';
          }
        }
      } catch (geminiError) {
        console.warn('Panggilan ke Gemini API gagal, beralih ke Smart Knowledge Base fallback:', geminiError);
      }
    }

    // 2. Opsi B: Built-in Smart Knowledge Engine (100% Gratis & Mandiri tanpa API eksternal)
    if (!botReply) {
      const kbAnswer = getKnowledgeAnswer(message);
      if (kbAnswer) {
        botReply = kbAnswer;
        source = 'knowledge_base_match';
      } else {
        // Fallback default jika tidak ada kata kunci yang cocok
        botReply = `Halo ${userName || 'Kak'}! 👋 Terima kasih telah menghubungi Klinik CPNS.

Pesan Anda telah kami terima dan masuk ke sistem panel admin kami. Tim Admin kami akan segera memeriksa dan memberikan balasan lebih lanjut di ruang obrolan ini.

💡 *Tips Cepat:* Anda juga dapat melihat info panduan atau menghubungi WhatsApp Admin kami langsung di [+62 851-9965-5534](https://wa.me/6285199655534) untuk respon cepat.`;
        source = 'knowledge_base_default';
      }
    }

    // 3. Simpan balasan bot ke database Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from('support_messages').insert([{
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        sender_type: 'bot',
        sender_name: 'Asisten AI Virtual',
        message: botReply,
        is_read_by_admin: true,
        is_read_by_user: false
      }]);
    }

    return NextResponse.json({
      success: true,
      reply: botReply,
      source: source
    });

  } catch (error: any) {
    console.error('Error pada API Auto-Reply:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
