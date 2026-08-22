import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name, reseller_code, token_balance } = body;

    if (!email || !full_name) {
      return NextResponse.json(
        { message: 'Email dan nama wajib diisi' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Buat user di Supabase Auth (server-side via service role key)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || 'Reseller123!',
      email_confirm: true,
      user_metadata: {
        full_name,
        role: 'reseller'
      }
    });

    if (authError) {
      return NextResponse.json(
        { message: 'Gagal membuat user: ' + authError.message },
        { status: 400 }
      );
    }

    // 2. Insert record ke tabel resellers
    const { error: resellerError } = await supabaseAdmin
      .from('resellers')
      .insert([{
        user_id: authData.user.id,
        email,
        full_name,
        reseller_code,
        token_balance: token_balance || 0
      }]);

    if (resellerError) {
      return NextResponse.json(
        { message: 'Gagal membuat data reseller: ' + resellerError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      reseller_code
    });

  } catch (error: any) {
    console.error('Error creating reseller:', error);
    return NextResponse.json(
      { message: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
