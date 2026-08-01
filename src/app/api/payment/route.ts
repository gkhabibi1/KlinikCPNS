import { NextResponse } from 'next/server';
import Midtrans from 'midtrans-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, packageName } = body;

    // Inisialisasi Midtrans Snap
    const snap = new Midtrans.Snap({
      isProduction: false, // Wajib false karena kita masih pakai Sandbox
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
    });

    // Parameter transaksi
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      item_details: [{
        id: "paket-tryout",
        price: amount,
        quantity: 1,
        name: packageName
      }]
    };

    // Minta token ke Midtrans
    const transaction = await snap.createTransaction(parameter);
    
    return NextResponse.json({ token: transaction.token });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
