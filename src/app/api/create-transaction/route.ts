import { NextRequest, NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

// Inisialisasi Snap Midtrans dengan Server Key dari .env.local
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, user_email, user_name, plan_id, amount, order_id } = body;

    // Parameter yang dikirim ke Midtrans
    const parameter = {
      transaction_details: {
        order_id: order_id, // Format: TRX-XXXX (kirim dari frontend)
        gross_amount: amount,
      },
      customer_details: {
        first_name: user_name || 'Peserta',
        email: user_email,
      },
      custom_field: {
        user_id: user_id,
        plan_id: plan_id,
      },
    };

    // Minta Snap Token ke Midtrans
    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Midtrans Error:', error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
