import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getKnowledgeAnswer, KLINIK_CPNS_KNOWLEDGE } from '@/lib/knowledgeBase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userEmail, userName, message } = body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Pesan pertanyaan wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanMessage = message.trim();
    const isGuest = !userId || userId === 'guest' || userId === 'anonymous';

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
2. Gunakan informasi resmi dari Knowledge Base di atas (Passing Grade SKD, 30 Days Challenge, aturan anti-curang, garansi uang kembali 100%, WhatsApp admin +62 851-9965-5534).
3. Buat jawaban padat, informatif, dan to-the-point (maksimal 2-3 paragraf).
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
                    { text: `Pertanyaan dari user (${userName || (isGuest ? 'Calon Peserta' : 'Member')}): "${cleanMessage}"` }
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
      const kbAnswer = getKnowledgeAnswer(cleanMessage);
      if (kbAnswer) {
        botReply = kbAnswer;
        source = 'knowledge_base_match';
      } else {
        // Fallback ramah jika pertanyaan umum belum ada di knowledge base
        botReply = `Halo ${userName || 'Kak'}! 👋 Terima kasih telah menghubungi Klinik CPNS.

Pertanyaan Anda: *"${cleanMessage}"* telah kami catat.

💡 **Informasi Cepat:**
• Program unggulan kami: **30 Days CPNS Challenge** dengan Garansi Uang Kembali 100% jika tidak lolos SKD resmi.
• Standar Passing Grade SKD: **TWK ≥ 65, TIU ≥ 80, TKP ≥ 166**.
• Latihan try out CAT BKN & materi lengkap dapat diakses setelah login.

Untuk bantuan langsung dari tim Admin kami, Anda dapat menghubungi WhatsApp kami di [+62 851-9965-5534](https://wa.me/6285199655534).`;
        source = 'knowledge_base_default';
      }
    }

    // Jika pengguna adalah Guest, tambahkan panduan pendaftaran di akhir jawaban
    if (isGuest) {
      botReply += `\n\n💬 *Ingin konsultasi langsung dengan Admin atau mulai latihan soal? Silakan buat akun gratis atau masuk ke akun Anda.*`;
    }

    // 3. Simpan balasan bot ke database Supabase (hanya jika member terdaftar & UUID valid)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidUuid = userId && uuidRegex.test(userId);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!isGuest && isValidUuid && supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('support_messages').insert([{
          user_id: userId,
          user_email: userEmail || null,
          user_name: userName || null,
          sender_type: 'bot',
          sender_name: 'Asisten AI Virtual',
          message: botReply,
          is_read_by_admin: true,
          is_read_by_user: false
        }]);
      } catch (dbError) {
        console.warn('Gagal menyimpan chat bot ke database Supabase (non-fatal):', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      reply: botReply,
      source: source
    });

  } catch (error: any) {
    console.error('Error pada API Auto-Reply:', error);
    // Tetap kembalikan fallback jawaban agar user tidak melihat chat macet
    return NextResponse.json({
      success: true,
      reply: `Halo! 👋 Terima kasih telah menghubungi Klinik CPNS. Sistem kami siap membantu menjawab seputar try out SKD, aturan 30 Days Challenge, dan panduan materi CPNS. Silakan tanyakan hal yang ingin Anda ketahui, atau hubungi WhatsApp Admin di [+62 851-9965-5534](https://wa.me/6285199655534).`,
      source: 'safe_fallback'
    });
  }
}
