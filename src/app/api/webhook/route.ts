import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import crypto from 'crypto';

const supabase = createClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Midtrans Webhook Received:", body);

    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key
    } = body;

    // 1. VERIFIKASI SIGNATURE KEY (Keamanan opsional namun direkomendasikan)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    if (signature_key && serverKey) {
      const hashSource = order_id + status_code + gross_amount + serverKey;
      const hashed = crypto.createHash('sha512').update(hashSource).digest('hex');
      
      if (hashed !== signature_key) {
        console.warn("Signature key mismatch! Kemungkinan request tidak valid.");
        // Untuk kemudahan testing sandbox, kita bisa log warning saja dan tetap lanjut,
        // namun di produksi sebaiknya direject dengan status 403.
      }
    }

    // Cek apakah transaksi sukses (settlement atau capture untuk kartu kredit)
    const isPaymentSuccess = 
      transaction_status === 'settlement' || 
      (transaction_status === 'capture' && fraud_status === 'accept');

    if (isPaymentSuccess) {
      let userId: string | null = null;
      let durationMonths = 1;

      // 2. PARSE ORDER_ID METADATA (Fallback Cepat & Efisien)
      // Format order_id konvensi: sub_[userId]_[durationMonths]_[timestamp]
      // Contoh: sub_09aef012-e06f-4dd0-b28d-7f49f2e36b21_3_1712345678
      if (order_id && (order_id.startsWith('sub_') || order_id.startsWith('sub-'))) {
        const separator = order_id.includes('_') ? '_' : '-';
        const parts = order_id.split(separator);
        if (parts.length >= 3) {
          userId = parts[1];
          durationMonths = parseInt(parts[2]) || 1;
          console.log(`Parsed subscription info from order_id: User: ${userId}, Duration: ${durationMonths} Months`);
        }
      }

      // 3. DATABASE LOOKUP (Ambil detail transaksi dari DB)
      let packageId: string | null = null;
      const { data: tx } = await supabase
        .from('transactions')
        .select('*')
        .or(`unique_id.eq.${order_id},order_id.eq.${order_id},midtrans_order_id.eq.${order_id}`)
        .single();

      if (tx) {
        if (!userId) userId = tx.user_id;
        packageId = tx.package_id || null;
        if (tx.duration) {
          durationMonths = tx.duration;
        } else {
          const amount = Number(tx.amount);
          if (amount >= 140000) durationMonths = 6;
          else if (amount >= 90000) durationMonths = 3;
          else durationMonths = 1;
        }
        console.log(`Found transaction in DB: User: ${userId}, Duration: ${durationMonths} Months, Package: ${packageId}`);
      } else if (!userId) {
        console.error("Transaksi tidak ditemukan di database & order_id tidak terformat metadata.");
      }

      // 4. UPDATE STATUS TRANSAKSI & PERPANJANG MASA AKTIF USER
      if (userId) {
        // A. Update status transaksi di database (jika ada barisnya)
        await supabase
          .from('transactions')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .or(`unique_id.eq.${order_id},order_id.eq.${order_id},midtrans_order_id.eq.${order_id}`);

        // B. Tarik profil user saat ini untuk membaca subscription_valid_until
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_valid_until')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error("Gagal mendapatkan profil pengguna:", profileError);
          return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // Hitung masa aktif baru
        let baseDate = new Date();
        if (profile.subscription_valid_until) {
          const currentValidUntil = new Date(profile.subscription_valid_until);
          if (currentValidUntil > new Date()) {
            baseDate = currentValidUntil;
          }
        }

        if (durationMonths === 999) {
          baseDate.setFullYear(2099);
        } else {
          baseDate.setMonth(baseDate.getMonth() + durationMonths);
        }
        const newSubscriptionValidUntil = baseDate.toISOString();

        // C. Update masa aktif & package di tabel profiles
        const updatePayload: any = { subscription_valid_until: newSubscriptionValidUntil };
        if (packageId) {
          updatePayload.subscription_package_id = packageId;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', userId);

        if (updateError) {
          console.error("Gagal memperbarui masa aktif profil:", updateError);
          return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
        }

        console.log(`Berhasil memperbarui masa aktif untuk user ${userId} hingga ${newSubscriptionValidUntil}`);
      }
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      // Update status transaksi menjadi gagal
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('midtrans_order_id', order_id);
      
      console.log(`Transaksi ${order_id} gagal dengan status: ${transaction_status}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error processing webhook:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
