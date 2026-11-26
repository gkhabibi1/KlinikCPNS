import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { generateDynamicQRIS } from '@/lib/qrisHelper';

export interface ResellerPackage {
  id: string;
  name: string;
  price: number;
  token_amount: number;
  description: string;
  badge?: string;
  is_active: boolean;
}

export interface ResellerOrder {
  order_id: string;
  package_id: string;
  package_name: string;
  token_amount: number;
  base_amount: number;
  unique_code: number;
  total_amount: number;
  qris_payload: string;
  full_name: string;
  email: string;
  phone_number: string;
  notes?: string;
  status: 'pending' | 'waiting_verification' | 'paid' | 'cancelled';
  payment_proof_url?: string;
  approved_reseller_code?: string;
  created_at: string;
  expired_at: string;
  paid_at?: string;
}

const DEFAULT_RESELLER_PACKAGES: ResellerPackage[] = [
  {
    id: 'rsl-starter',
    name: 'Paket Reseller Starter',
    price: 350000,
    token_amount: 10,
    description: 'Cocok untuk mulai berjualan ke teman, komunitas, atau grup belajar.',
    badge: 'Mulai Cepat',
    is_active: true,
  },
  {
    id: 'rsl-pro',
    name: 'Paket Reseller Pro',
    price: 750000,
    token_amount: 25,
    description: 'Pilihan paling populer dengan harga per voucher jauh lebih hemat.',
    badge: 'Paling Laris',
    is_active: true,
  },
  {
    id: 'rsl-agen',
    name: 'Paket Reseller Agen',
    price: 1350000,
    token_amount: 50,
    description: 'Stok besar untuk mentor bimbel, kreator edukasi, atau agen daerah.',
    badge: 'Margin Maksimal',
    is_active: true,
  },
];

async function readSettingJson<T>(key: string, fallback: T): Promise<T> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from('system_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (!data?.value) return fallback;
  try {
    return JSON.parse(data.value) as T;
  } catch {
    return fallback;
  }
}

async function writeSettingJson(key: string, value: unknown) {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.from('system_settings').upsert({
    key,
    value: JSON.stringify(value),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const includeInactive = searchParams.get('include_inactive') === 'true';

    const packages = await readSettingJson<ResellerPackage[]>(
      'reseller_packages',
      DEFAULT_RESELLER_PACKAGES
    );

    if (orderId) {
      const orders = await readSettingJson<ResellerOrder[]>('reseller_orders', []);
      const found = orders.find((o) => o.order_id === orderId) || null;
      if (!found) {
        return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ order: found });
    }

    const orders = await readSettingJson<ResellerOrder[]>('reseller_orders', []);

    return NextResponse.json({
      packages: includeInactive ? packages : packages.filter((p) => p.is_active),
      orders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal memuat data reseller' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Admin menyimpan pengaturan paket reseller
    if (body.action === 'save_packages') {
      const incoming = Array.isArray(body.packages) ? body.packages : [];
      await writeSettingJson('reseller_packages', incoming);
      return NextResponse.json({ success: true, packages: incoming });
    }

    // Guest calon reseller membuat order tanpa login
    const { package_id, full_name, email, phone_number, notes } = body;

    if (!package_id || !full_name?.trim() || !email?.trim() || !phone_number?.trim()) {
      return NextResponse.json(
        { error: 'Paket, nama lengkap, email, dan nomor WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    const packages = await readSettingJson<ResellerPackage[]>(
      'reseller_packages',
      DEFAULT_RESELLER_PACKAGES
    );
    const selectedPkg = packages.find((p) => p.id === package_id && p.is_active);

    if (!selectedPkg) {
      return NextResponse.json(
        { error: 'Paket reseller tidak ditemukan atau tidak aktif.' },
        { status: 404 }
      );
    }

    const orders = await readSettingJson<ResellerOrder[]>('reseller_orders', []);
    const nowMs = Date.now();
    const activeCodes = new Set(
      orders
        .filter(
          (o) =>
            (o.status === 'pending' || o.status === 'waiting_verification') &&
            new Date(o.expired_at).getTime() > nowMs
        )
        .map((o) => o.unique_code)
    );

    let uniqueCode = 101 + Math.floor(Math.random() * 890);
    for (let i = 0; i < 50 && activeCodes.has(uniqueCode); i++) {
      uniqueCode = 101 + Math.floor(Math.random() * 890);
    }

    const baseAmount = Math.max(0, Math.round(Number(selectedPkg.price) || 0));
    const totalAmount = baseAmount + uniqueCode;
    const qrisPayload = generateDynamicQRIS(totalAmount);
    const orderId = `RSL-${nowMs}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newOrder: ResellerOrder = {
      order_id: orderId,
      package_id: selectedPkg.id,
      package_name: selectedPkg.name,
      token_amount: selectedPkg.token_amount,
      base_amount: baseAmount,
      unique_code: uniqueCode,
      total_amount: totalAmount,
      qris_payload: qrisPayload,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone_number: phone_number.trim(),
      notes: notes?.trim() || '',
      status: 'pending',
      created_at: new Date(nowMs).toISOString(),
      expired_at: new Date(nowMs + 30 * 60 * 1000).toISOString(),
    };

    const updatedOrders = [newOrder, ...orders].slice(0, 200);
    await writeSettingJson('reseller_orders', updatedOrders);

    return NextResponse.json({
      success: true,
      order_id: orderId,
      order: newOrder,
      redirect_url: `/reseller/checkout/payment/${orderId}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal membuat order reseller' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Handle upload bukti bayar (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const orderId = formData.get('order_id') as string;
      const file = formData.get('file') as File | null;

      if (!orderId || !file) {
        return NextResponse.json(
          { error: 'Order ID dan file bukti bayar wajib ada.' },
          { status: 400 }
        );
      }

      if (file.size > 500 * 1024) {
        return NextResponse.json(
          { error: 'Ukuran file melebihi batas maksimal 500 KB.' },
          { status: 400 }
        );
      }

      const supabaseAdmin = getSupabaseAdmin();
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `reseller-proofs/${orderId}-${Date.now()}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();

      const { error: uploadErr } = await supabaseAdmin.storage
        .from('payment-proofs')
        .upload(filePath, Buffer.from(arrayBuffer), {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (uploadErr) {
        return NextResponse.json(
          { error: 'Gagal upload bukti bayar: ' + uploadErr.message },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      const orders = await readSettingJson<ResellerOrder[]>('reseller_orders', []);
      const updated = orders.map((o) =>
        o.order_id === orderId
          ? {
              ...o,
              status: 'waiting_verification' as const,
              payment_proof_url: publicUrlData.publicUrl,
            }
          : o
      );
      await writeSettingJson('reseller_orders', updated);

      return NextResponse.json({
        success: true,
        status: 'waiting_verification',
        proof_url: publicUrlData.publicUrl,
      });
    }

    // Handle JSON status update dari Admin
    const body = await request.json();
    const { order_id, status, approved_reseller_code } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'order_id wajib diisi' }, { status: 400 });
    }

    const orders = await readSettingJson<ResellerOrder[]>('reseller_orders', []);
    const updated = orders.map((o) => {
      if (o.order_id !== order_id) return o;
      return {
        ...o,
        ...(status ? { status } : {}),
        ...(status === 'paid' && !o.paid_at ? { paid_at: new Date().toISOString() } : {}),
        ...(approved_reseller_code ? { approved_reseller_code } : {}),
      };
    });

    await writeSettingJson('reseller_orders', updated);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal memperbarui order reseller' },
      { status: 500 }
    );
  }
}
