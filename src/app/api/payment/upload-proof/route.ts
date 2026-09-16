import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const orderId = formData.get('order_id') as string;
    const file = formData.get('file') as File | null;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID wajib disertakan.' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'File bukti pembayaran wajib diunggah.' }, { status: 400 });
    }

    // Validasi ukuran file maksimal 500 KB
    const MAX_FILE_SIZE = 500 * 1024; // 500 KB
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeKb = (file.size / 1024).toFixed(0);
      return NextResponse.json({
        error: `Ukuran file bukti transfer terlalu besar (${fileSizeKb} KB). Batas maksimal adalah 500 KB. Anda dapat mengompres gambar atau langsung mengirimkan bukti bayar ke WhatsApp Admin di +62 851-9965-5534.`
      }, { status: 400 });
    }

    // 1. Verifikasi transaksi ada
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    let query = supabase.from('transactions').select('id, user_id, status');
    if (isUuid) {
      query = query.or(`unique_id.eq.${orderId},id.eq.${orderId}`);
    } else {
      query = query.eq('unique_id', orderId);
    }

    const { data: tx, error: txError } = await query.maybeSingle();

    if (txError || !tx) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan.' }, { status: 404 });
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `proof_${orderId}_${Date.now()}.${fileExt}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    let finalProofUrl = '';

    // 2. Coba upload ke Supabase Storage bucket 'payment-proofs'
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, fileBuffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true
      });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);
      finalProofUrl = publicUrl;
    } else {
      console.warn('Upload to payment-proofs failed, trying fallback to question-images bucket:', uploadError);
      const { error: fallbackError } = await supabase.storage
        .from('question-images')
        .upload(`proofs/${fileName}`, fileBuffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true
        });

      if (!fallbackError) {
        const { data: { publicUrl } } = supabase.storage
          .from('question-images')
          .getPublicUrl(`proofs/${fileName}`);
        finalProofUrl = publicUrl;
      } else {
        // Fallback terakhir: simpan Base64 Data URL agar user tetap bisa upload tanpa gagal
        console.warn('Storage bucket not accessible. Fallback to base64 encoding.');
        const base64String = `data:${file.type || 'image/jpeg'};base64,${fileBuffer.toString('base64')}`;
        finalProofUrl = base64String;
      }
    }

    // 3. Update status transaksi menjadi waiting_verification (atau fallback tetap status lama jika check constraint DB belum diupdate)
    const nowIso = new Date().toISOString();
    let updatedStatus = 'waiting_verification';
    let { error: updateErr } = await supabase
      .from('transactions')
      .update({
        payment_proof_url: finalProofUrl,
        payment_proof_uploaded_at: nowIso,
        status: 'waiting_verification'
      })
      .eq('id', tx.id);

    // Fallback jika database memiliki check constraint lama (transactions_status_check) yang belum mengizinkan 'waiting_verification'
    if (updateErr && (updateErr.message?.includes('transactions_status_check') || updateErr.message?.includes('check constraint'))) {
      console.warn('transactions_status_check constraint encountered, saving proof with current status fallback...');
      updatedStatus = tx.status || 'pending';
      const fallbackResult = await supabase
        .from('transactions')
        .update({
          payment_proof_url: finalProofUrl,
          payment_proof_uploaded_at: nowIso
        })
        .eq('id', tx.id);
      updateErr = fallbackResult.error;
    }

    if (updateErr) {
      return NextResponse.json({ error: 'Gagal memperbarui status transaksi: ' + updateErr.message }, { status: 500 });
    }

    // 4. Kirim notifikasi konfirmasi ke user
    if (tx.user_id) {
      try {
        await supabase.from('notifications').insert([{
          user_id: tx.user_id,
          title: 'Bukti Pembayaran Diterima',
          message: `Bukti pembayaran untuk pesanan ${orderId} telah kami terima dan sedang diverifikasi oleh admin maksimal 1x24 jam.`,
          type: 'info',
          link: '/dashboard/orders'
        }]);
      } catch (notifErr) {
        console.warn('Notif error (ignored):', notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bukti pembayaran berhasil diunggah! Admin akan memverifikasi dalam 1x24 jam.',
      proof_url: finalProofUrl,
      status: updatedStatus
    });

  } catch (error: any) {
    console.error('Upload proof error:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan sistem saat mengunggah bukti pembayaran' },
      { status: 500 }
    );
  }
}
