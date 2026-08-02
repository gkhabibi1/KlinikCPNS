import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, user_id, package_id, duration, total_amount, customer_details } = body;

    // Validasi input
    if (!order_id || !user_id || !total_amount) {
      return NextResponse.json(
        { message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // 1. Cek apakah transaksi sudah ada di database
    const { data: existingTransaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('unique_id', order_id)  // ✅ GUNAKAN unique_id
      .single();

    if (!existingTransaction) {
      return NextResponse.json(
        { message: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    // 2. Buat payload untuk Midtrans Snap API
    const midtransPayload = {
      transaction_details: {
        order_id: order_id,  // Ini untuk Midtrans, bukan database
        gross_amount: Math.round(total_amount)
      },
      customer_details: {
        first_name: customer_details.first_name,
        email: customer_details.email,
        phone: customer_details.phone
      },
      item_details: [{
        id: package_id,
        price: Math.round(total_amount),
        quantity: 1,
        name: `Paket Langganan ${duration} Bulan`
      }],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || 'https://klinikcpns.com'}/payment/success?order_id=${order_id}`,
        error: `${process.env.NEXT_PUBLIC_APP_URL || 'https://klinikcpns.com'}/payment/failed`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'https://klinikcpns.com'}/payment/pending`
      }
    };

    // 3. Panggil Midtrans API
    const midtransResponse = await fetch(
      'https://app.sandbox.midtrans.com/snap/v1/transactions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(process.env.MIDTRANS_SERVER_KEY + ':')
        },
        body: JSON.stringify(midtransPayload)
      }
    );

    const midtransData = await midtransResponse.json();

    if (midtransResponse.status !== 201) {
      console.error('Midtrans error:', midtransData);
      throw new Error(midtransData.status_message || 'Gagal membuat transaksi Midtrans');
    }

    // 4. Update transaksi dengan response Midtrans
    if (existingTransaction.id) {
      await supabase
        .from('transactions')
        .update({
          midtrans_response: midtransData,
          updated_at: new Date().toISOString()
        })
        .eq('unique_id', order_id);  // ✅ GUNAKAN unique_id
    }

    return NextResponse.json({
      redirect_url: midtransData.redirect_url,
      token: midtransData.token,
      order_id: order_id
    });

  } catch (error: any) {
    console.error('Midtrans API error:', error);
    return NextResponse.json(
      { message: error.message || 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
