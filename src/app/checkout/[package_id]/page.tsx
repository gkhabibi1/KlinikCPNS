'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

const supabase = createClient();

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [packageData, setPackageData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    password: ''
  });
  const [authMode, setAuthMode] = useState<'email' | 'google'>('email');
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [benefits, setBenefits] = useState<any[]>([]);

  // State untuk Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState('');

  // Hitung Harga Final
  const originalPrice = packageData?.price || 0;
  const discountAmount = appliedVoucher 
    ? appliedVoucher.type === 'percent' 
      ? Math.floor(originalPrice * (appliedVoucher.value / 100))
      : appliedVoucher.type === 'fixed' 
      ? appliedVoucher.value 
      : originalPrice // Jika 'free', diskon 100%
    : 0;

  const finalPrice = Math.max(0, originalPrice - discountAmount);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Cek apakah user sudah login
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          // Jika belum login, redirect ke login dengan redirect ke halaman ini
          window.location.href = `/login?redirect=/checkout/${params.package_id}`;
          return;
        }

        setUser(currentUser);
        setIsGoogleLinked(currentUser.app_metadata?.provider === 'google');

        // Ambil data subscription package
        const { data: pkg } = await supabase
          .from('subscription_packages')
          .select('*')
          .eq('id', params.package_id)
          .eq('is_active', true)
          .single();
        
        if (pkg) {
          setPackageData(pkg);
          
          // Ambil benefit
          const { data: benefits } = await supabase
            .from('subscription_benefits')
            .select('*')
            .eq('package_id', pkg.id)
            .eq('is_active', true)
            .order('display_order');
          
          if (benefits) setBenefits(benefits);
        } else {
          alert('Paket tidak ditemukan atau tidak aktif');
          router.push('/');
        }

        // Ambil profil user
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        if (profile) {
          setFormData({
            full_name: profile.full_name || '',
            phone_number: profile.phone_number || '',
            email: currentUser.email || '',
            password: ''
          });
        }

      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.package_id, router]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/checkout/${params.package_id}`)}`
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google login error:', err);
      alert('Gagal login dengan Google');
    }
  };

  const handleEmailRegister = async () => {
    if (!formData.email || !formData.password) {
      alert('Email dan password wajib diisi');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.full_name } }
      });

      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        setIsGoogleLinked(false);
        alert('✅ Akun berhasil dibuat!');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleEmailLogin = async () => {
    if (!formData.email || !formData.password) {
      alert('Email dan password wajib diisi');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        alert('✅ Login berhasil!');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const totalPrice = packageData?.price || 0;

  const getDurationInMonths = () => {
    return packageData?.duration_months || 1;
  };

  const calculateExpiryDate = () => {
    if (packageData?.duration_months === 999) {
      return new Date('2099-12-31').toISOString();
    }
    const date = new Date();
    date.setMonth(date.getMonth() + (packageData?.duration_months || 1));
    return date.toISOString();
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    
    setIsCheckingVoucher(true);
    setVoucherError('');
    setAppliedVoucher(null);

    try {
      const { data: voucher, error } = await supabase
        .from('voucher_codes')
        .select('*')
        .eq('code', voucherCode.toUpperCase().trim())
        .single();

      if (error || !voucher) {
        setVoucherError('Kode voucher tidak ditemukan.');
        return;
      }

      if (!voucher.is_active) {
        setVoucherError('Voucher sudah tidak aktif.');
        return;
      }

      if (voucher.current_uses >= voucher.max_uses) {
        setVoucherError('Kuota voucher sudah habis.');
        return;
      }

      setAppliedVoucher(voucher);
    } catch (err) {
      setVoucherError('Terjadi kesalahan saat mengecek voucher.');
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Silakan login atau daftar terlebih dahulu');
      return;
    }

    if (!agreedToTerms) {
      alert('Anda harus menyetujui syarat & ketentuan');
      return;
    }

    if (!formData.full_name || !formData.phone_number) {
      alert('Nama dan nomor handphone wajib diisi');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. PASTIKAN PROFILE USER ADA
      console.log('Checking profile for user:', user.id);
      
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone_number')
        .eq('id', user.id)
        .single();

      if (profileError || !existingProfile) {
        console.log('Profile not found, creating new profile...');
        
        // Buat profile jika belum ada
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email || formData.email,
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            subscription_valid_until: new Date().toISOString(),
            created_at: new Date().toISOString()
          }]);

        if (createProfileError) {
          console.error('❌ Error creating profile:', createProfileError);
          alert('Gagal membuat profil: ' + createProfileError.message);
          setIsProcessing(false);
          return;
        }
        
        console.log('✅ Profile created successfully');
      } else {
        console.log('✅ Profile exists, updating...');
        
        // Update profile dengan data terbaru
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateProfileError) {
          console.error('⚠️ Warning: Could not update profile:', updateProfileError);
          // Jangan gagal jika update profile gagal, lanjutkan ke transaksi
        } else {
          console.log('✅ Profile updated successfully');
        }
      }

      // 2. VERIFIKASI PROFILE SUDAH ADA
      const { data: verifyProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!verifyProfile) {
        throw new Error('Profile masih belum ada di database. Silakan coba lagi.');
      }

      console.log('✅ Profile verified:', verifyProfile.id);

      // 3. BUAT TRANSAKSI
      const duration = getDurationInMonths();
      const orderId = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      console.log('Creating transaction:', {
        unique_id: orderId,
        user_id: user.id,
        package_id: params.package_id,
        duration: duration,
        amount: finalPrice,
        status: finalPrice === 0 ? 'paid' : 'pending',
        customer_name: formData.full_name,
        customer_email: formData.email || user.email,
        customer_phone: formData.phone_number,
        voucher_code_id: appliedVoucher?.id || null
      });

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert([{
          unique_id: orderId,
          user_id: user.id,
          package_id: params.package_id,
          duration: duration,
          amount: finalPrice,
          status: finalPrice === 0 ? 'paid' : 'pending',
          customer_name: formData.full_name,
          customer_email: formData.email || user.email,
          customer_phone: formData.phone_number,
          voucher_code_id: appliedVoucher?.id || null
        }])
        .select()
        .single();

      if (txError) {
        console.error('❌ Transaction error:', txError);
        console.error('Error details:', {
          code: txError.code,
          message: txError.message,
          details: txError.details,
          hint: txError.hint
        });
        throw txError;
      }

      console.log('✅ Transaction created:', txData);

      // 4. JIKA VOUCHER TERPAKAI, UPDATE QUOTA VOUCHER
      if (appliedVoucher) {
        await supabase
          .from('voucher_codes')
          .update({ current_uses: (appliedVoucher.current_uses || 0) + 1 })
          .eq('id', appliedVoucher.id);
      }

      // 5. PANGGIL API MIDTRANS (Jika finalPrice > 0)
      if (finalPrice > 0) {
        const response = await fetch('/api/midtrans/create-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderId,
            user_id: user.id,
            package_id: params.package_id,
            duration: duration,
            total_amount: finalPrice,
            customer_details: {
              first_name: formData.full_name,
              email: formData.email || user.email,
              phone: formData.phone_number
            }
          })
        });

        const data = await response.json();

        if (data.redirect_url) {
          if (txData?.id) {
            await supabase
              .from('transactions')
              .update({
                midtrans_response: data
              })
              .eq('id', txData.id);
          }
          
          console.log('✅ Redirecting to Midtrans...');
          window.location.href = data.redirect_url;
        } else {
          throw new Error(data.message || 'Gagal membuat transaksi Midtrans');
        }
      } else {
        // Jika GRATIS (Voucher 100% / Free), update subscription user dan langsung redirect ke dashboard
        let baseDate = new Date();
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_valid_until')
          .eq('id', user.id)
          .single();

        if (profile?.subscription_valid_until) {
          const currentValidUntil = new Date(profile.subscription_valid_until);
          if (currentValidUntil > new Date()) {
            baseDate = currentValidUntil;
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
            subscription_package_id: params.package_id
          })
          .eq('id', user.id);

        alert('🎉 Voucher berhasil ditukar! Akses Anda telah diaktifkan.');
        window.location.href = '/dashboard';
      }

    } catch (err: any) {
      console.error('❌ Checkout error:', err);
      alert('Error: ' + (err.message || 'Terjadi kesalahan saat memproses pembayaran'));
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Paket Tidak Ditemukan</h2>
          <Link href="/" className="text-blue-600 hover:underline">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  const isMemberArea = !!user;
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png"
              alt="Logo Klinik CPNS"
              className="h-8 md:h-9 w-auto object-contain"
            />
          </Link>
          {user && (
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-800">
              ← Kembali ke Dashboard
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kolom Kiri */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Pilih Durasi Langganan - HANYA SATU OPSI */}
            {packageData && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Detail Langganan</h2>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Durasi Langganan</div>
                      <div className="font-bold text-slate-800 text-lg">
                        {packageData.duration_months === 999 
                          ? 'Lifetime (Selamanya)' 
                          : `${packageData.duration_months} Bulan`}
                      </div>
                    </div>
                    {packageData.discount_label && (
                      <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded">
                        {packageData.discount_label}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-blue-200">
                    <div className="text-sm text-slate-600">Harga</div>
                    <div className="font-bold text-blue-600 text-2xl">
                      Rp {packageData.price?.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-500">
                  <p>Paket ini memberikan akses selama {packageData.duration_months === 999 ? 'seumur hidup' : `${packageData.duration_months} bulan`} dari tanggal pembayaran berhasil.</p>
                </div>
              </div>
            )}

            {/* Data Pembeli */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Data Pembeli</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-green-800">Anda sudah login</div>
                  <div className="text-xs text-green-700">{user?.email}</div>
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Handphone *</label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="08123456789"
                  />
                </div>
              </div>
            </div>

            {/* Manfaat yang Didapatkan - PER PAKET */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-2">Manfaat Paket {packageData.name}</h2>
              <p className="text-sm text-slate-500 mb-4">
                Yang akan Anda dapatkan dengan berlangganan paket ini:
              </p>
              
              {benefits.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Belum ada benefit yang diatur.</p>
              ) : (
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={benefit.id} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-slate-700">{benefit.benefit_text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Syarat & Ketentuan */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded mt-0.5"
                />
                <span className="text-sm text-slate-600">
                  Saya menyetujui <a href="#" className="text-blue-600 hover:underline">Syarat & Ketentuan</a> serta <a href="#" className="text-blue-600 hover:underline">Kebijakan Privasi</a> yang berlaku
                </span>
              </label>
            </div>
          </div>

          {/* Kolom Kanan: Summary & Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Ringkasan Pesanan</h2>
              
              <div className="space-y-3 mb-4 pb-4 border-b border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Paket</span>
                  <span className="font-medium text-slate-800 text-right max-w-[60%]">{packageData.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Durasi</span>
                  <span className="font-medium text-slate-800">
                    {packageData && (packageData.duration_months === 999 
                      ? 'Lifetime (Selamanya)' 
                      : `${packageData.duration_months} Bulan`)}
                  </span>
                </div>
              </div>

              {/* INPUT VOUCHER */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-700 mb-1">Punya Kode Voucher?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Masukkan kode..."
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
                    disabled={!!appliedVoucher}
                  />
                  <button
                    onClick={handleApplyVoucher}
                    disabled={isCheckingVoucher || !!appliedVoucher}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-50"
                  >
                    {isCheckingVoucher ? '...' : 'Pakai'}
                  </button>
                </div>
                
                {voucherError && <p className="text-xs text-red-500 mt-1">{voucherError}</p>}
                {appliedVoucher && (
                  <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded-lg border border-green-200">
                    <span className="text-xs text-green-700 font-medium flex items-center gap-1">
                      ✅ {appliedVoucher.code} ({appliedVoucher.type === 'percent' ? `${appliedVoucher.value}%` : appliedVoucher.type === 'fixed' ? `Rp${appliedVoucher.value}` : 'GRATIS'})
                    </span>
                    <button 
                      onClick={() => { setAppliedVoucher(null); setVoucherCode(''); }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>

              {/* KALKULASI HARGA */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Harga Normal</span>
                  <span className={`font-medium ${appliedVoucher ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    Rp {originalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                
                {appliedVoucher && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon Voucher</span>
                    <span className="font-medium">- Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-100">
                <span className="font-bold text-slate-800">Total Pembayaran</span>
                <span className="text-2xl font-bold text-blue-600">
                  {finalPrice === 0 ? 'GRATIS' : `Rp ${finalPrice.toLocaleString('id-ID')}`}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing || !agreedToTerms || !user}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
              >
                {isProcessing ? 'Memproses...' : finalPrice === 0 ? 'Klaim Sekarang' : 'Bayar Sekarang'}
              </button>

              {!user && (
                <p className="text-xs text-slate-500 text-center mt-3">
                  Silakan login atau daftar terlebih dahulu
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Pembayaran aman & terenkripsi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
