import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // 1. Cek database transaksi lokal terlebih dahulu
    const { data: tx } = await supabase
      .from('transactions')
      .select('*')
      .or(`unique_id.eq.${orderId},order_id.eq.${orderId},midtrans_order_id.eq.${orderId}`)
      .single();

    if (tx) {
      const normalizedStatus = (tx.status || '').toLowerCase();
      if (['paid', 'success', 'settlement'].includes(normalizedStatus)) {
        return NextResponse.json({ status: 'paid', transaction: tx });
      }
    }

    // 2. Jika status di DB belum paid/success, cek langsung ke API Midtrans jika server key tersedia
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (serverKey) {
      try {
        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
        const baseUrl = isProduction 
          ? 'https://api.midtrans.com' 
          : 'https://api.sandbox.midtrans.com';

        const midtransRes = await fetch(`${baseUrl}/v2/${orderId}/status`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(serverKey + ':').toString('base64')
          }
        });

        if (midtransRes.ok) {
          const midtransData = await midtransRes.json();
          const { transaction_status, fraud_status } = midtransData;

          const isSuccess = 
            transaction_status === 'settlement' || 
            (transaction_status === 'capture' && fraud_status === 'accept');

          if (isSuccess) {
            return NextResponse.json({ status: 'paid', midtrans: midtransData });
          }
        }
      } catch (e) {
        console.error('Error fetching Midtrans status:', e);
      }
    }

    // 3. Jika DB bertuliskan pending atau status lainnya
    const status = tx?.status?.toLowerCase() || 'pending';
    return NextResponse.json({ status });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
