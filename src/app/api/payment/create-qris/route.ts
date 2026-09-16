import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { generateDynamicQRIS, getAvailableUniqueCode } from '@/lib/qrisHelper';

const supabase = createClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      package_id,
      duration = 1,
      base_amount,
      customer_name,
      customer_email,
      customer_phone,
      voucher_code_id,
      user_id
    } = body;

    if (!user_id || !package_id) {
      return NextResponse.json(
        { error: 'User ID dan Package ID wajib diisi.' },
        { status: 400 }
      );
    }

    const price = Math.max(0, Math.round(Number(base_amount) || 0));

    // 1. Jika transaksi bernilai 0 (gratis dari voucher 100%)
    if (price === 0) {
      const orderId = `FREE-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const { data: freeTx, error: freeTxErr } = await supabase
        .from('transactions')
        .insert([{
          unique_id: orderId,
          user_id,
          package_id,
          duration,
          amount: 0,
          base_amount: 0,
          unique_code: 0,
          total_amount: 0,
          status: 'paid',
          paid_at: new Date().toISOString(),
          customer_name,
          customer_email,
          customer_phone,
          voucher_code_id: voucher_code_id || null
        }])
        .select()
        .single();

      if (freeTxErr) {
        return NextResponse.json({ error: freeTxErr.message }, { status: 500 });
      }

      // Update subscription valid_until langsung
      let baseDate = new Date();
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_valid_until')
        .eq('id', user_id)
        .single();

      if (profile?.subscription_valid_until) {
        const currentValid = new Date(profile.subscription_valid_until);
        if (currentValid > new Date()) {
          baseDate = currentValid;
        }
      }

      if (duration === 999) {
        baseDate.setFullYear(2099);
      } else {
        baseDate.setMonth(baseDate.getMonth() + (duration || 1));
      }

      await supabase
        .from('profiles')
        .update({
          subscription_valid_until: baseDate.toISOString(),
          subscription_package_id: package_id
        })
        .eq('id', user_id);

      return NextResponse.json({
        success: true,
        isFree: true,
        order_id: orderId,
        redirect_url: '/dashboard'
      });
    }

    // 2. Generate kode unik anti-bentrok
    const uniqueCode = await getAvailableUniqueCode(async (code: number) => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('transactions')
        .select('id')
        .eq('unique_code', code)
        .in('status', ['pending', 'waiting_verification'])
        .gt('expired_at', now)
        .limit(1);

      return Boolean(data && data.length > 0);
    });

    // 3. Hitung total amount dan generate QRIS dinamis
    const totalAmount = price + uniqueCode;
    const qrisPayload = generateDynamicQRIS(totalAmount);

    // Batas waktu pembayaran 24 jam
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const orderId = `QRIS-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 4. Simpan transaksi ke database
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .insert([{
        unique_id: orderId,
        user_id,
        package_id,
        duration,
        amount: totalAmount,
        base_amount: price,
        unique_code: uniqueCode,
        total_amount: totalAmount,
        qris_payload: qrisPayload,
        status: 'pending',
        customer_name,
        customer_email,
        customer_phone,
        voucher_code_id: voucher_code_id || null,
        expired_at: expiredAt
      }])
      .select()
      .single();

    if (txError) {
      console.error('Error inserting QRIS transaction:', txError);
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    // 5. Update kuota voucher jika ada
    if (voucher_code_id) {
      const { data: vData } = await supabase
        .from('voucher_codes')
        .select('current_uses')
        .eq('id', voucher_code_id)
        .single();

      if (vData) {
        await supabase
          .from('voucher_codes')
          .update({ current_uses: (vData.current_uses || 0) + 1 })
          .eq('id', voucher_code_id);
      }
    }

    return NextResponse.json({
      success: true,
      order_id: orderId,
      order: txData,
      redirect_url: `/checkout/payment/${orderId}`
    });

  } catch (error: any) {
    console.error('Create QRIS Order error:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan sistem saat membuat transaksi QRIS' },
      { status: 500 }
    );
  }
}
