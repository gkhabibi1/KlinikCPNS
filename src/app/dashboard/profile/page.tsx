'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import MemberLayout from '../../../components/MemberLayout';

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // State untuk semua field profil
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [occupation, setOccupation] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // State untuk ubah password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // 1. Ambil data user & profil saat komponen dimuat
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/');
        return;
      }

      setUserId(user.id);
      setEmail(user.email || '');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
        setFullName(profile.full_name || '');
        setPhoneNumber(profile.phone_number || '');
        setPlaceOfBirth(profile.place_of_birth || '');
        setDateOfBirth(profile.date_of_birth || '');
        setGender(profile.gender || '');
        setAddress(profile.address || '');
        setCity(profile.city || '');
        setPostalCode(profile.postal_code || '');
        setEducationLevel(profile.education_level || '');
        setOccupation(profile.occupation || '');
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [router]);

  // Tambahkan fungsi verifikasi dan ubah password
  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsChangingPassword(true);
      setPasswordMessage(null);

      // Validasi input
      if (passwordData.newPassword !== passwordData.confirmPassword) {
          setPasswordMessage({ type: 'error', text: 'Password baru dan konfirmasi tidak cocok!' });
          setIsChangingPassword(false);
          return;
      }

      if (passwordData.newPassword.length < 6) {
          setPasswordMessage({ type: 'error', text: 'Password minimal 6 karakter!' });
          setIsChangingPassword(false);
          return;
      }

      try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user || !user.email) {
              setPasswordMessage({ type: 'error', text: 'User tidak ditemukan!' });
              setIsChangingPassword(false);
              return;
          }

          // STEP 1: Verifikasi password lama dengan mencoba login ulang
          const { error: signInError } = await supabase.auth.signInWithPassword({
              email: user.email,
              password: passwordData.currentPassword
          });

          if (signInError) {
              setPasswordMessage({ type: 'error', text: 'Password lama salah!' });
              setIsChangingPassword(false);
              return;
          }

          // STEP 2: Update password baru
          const { error: updateError } = await supabase.auth.updateUser({
              password: passwordData.newPassword
          });

          if (updateError) {
              setPasswordMessage({ type: 'error', text: 'Gagal mengubah password: ' + updateError.message });
          } else {
              setPasswordMessage({ type: 'success', text: '✅ Password berhasil diubah! Silakan login ulang.' });
              // Reset form
              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              
              // Logout otomatis setelah 3 detik
              setTimeout(async () => {
                  await supabase.auth.signOut();
                  router.push('/');
              }, 3000);
          }
      } catch (error) {
          setPasswordMessage({ type: 'error', text: 'Terjadi kesalahan sistem!' });
      }
      setIsChangingPassword(false);
  };

  // 2. Handle simpan perubahan ke database
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        phone_number: phoneNumber,
        place_of_birth: placeOfBirth,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        address: address,
        city: city,
        postal_code: postalCode,
        education_level: educationLevel,
        occupation: occupation,
        email: email,
      }, { onConflict: 'id' });

    if (error) {
      setMessage({ type: 'error', text: 'Gagal menyimpan profil: ' + error.message });
    } else {
      setMessage({ type: 'success', text: '✅ Profil berhasil diperbarui!' });
    }
    
    setIsSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 font-medium">Memuat data profil...</div>
      </div>
    );
  }

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Profil Saya</h2>
          <p className="text-slate-500 text-sm mt-1">Lengkapi data diri Anda untuk informasi yang lebih baik.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Informasi Pribadi */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
              Informasi Pribadi
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email (Read-only) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email (Tidak dapat diubah)
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Nama Lengkap */}
              <div className="md:col-span-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap sesuai KTP"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              {/* Nomor Handphone */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nomor Handphone (WhatsApp)
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="081234567890"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Tempat Lahir */}
              <div>
                <label htmlFor="placeOfBirth" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tempat Lahir
                </label>
                <input
                  id="placeOfBirth"
                  type="text"
                  value={placeOfBirth}
                  onChange={(e) => setPlaceOfBirth(e.target.value)}
                  placeholder="Kota/Kabupaten"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tanggal Lahir
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Jenis Kelamin
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Alamat */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
              Alamat
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alamat Lengkap */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Alamat Lengkap
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jalan, RT/RW, Kelurahan/Kecamatan"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              {/* Kota/Kabupaten */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Kota/Kabupaten
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Kota/Kabupaten"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Kode Pos */}
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Kode Pos
                </label>
                <input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Kode Pos"
                  maxLength={5}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Akademik & Pekerjaan */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
              Pendidikan & Pekerjaan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pendidikan Terakhir */}
              <div>
                <label htmlFor="educationLevel" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Pendidikan Terakhir
                </label>
                <select
                  id="educationLevel"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Pilih Pendidikan</option>
                  <option value="SMA">SMA/Sederajat</option>
                  <option value="D1">D1</option>
                  <option value="D2">D2</option>
                  <option value="D3">D3</option>
                  <option value="D4">D4</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </select>
              </div>

              {/* Pekerjaan */}
              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Pekerjaan
                </label>
                <input
                  id="occupation"
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Pekerjaan saat ini"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Container Ubah Password */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
              <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100">
                  <div>
                      <h3 className="text-lg font-bold text-slate-800">Keamanan Akun</h3>
                      <p className="text-sm text-slate-500 mt-1">Ubah password untuk menjaga keamanan akun Anda</p>
                  </div>
                  {!showPasswordForm && (
                      <button
                          type="button"
                          onClick={() => setShowPasswordForm(true)}
                          className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1"
                      >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                          </svg>
                          Ubah Password
                      </button>
                  )}
              </div>

              {showPasswordForm ? (
                  <div className="space-y-4 max-w-2xl">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                          <strong>Perhatian:</strong> Setelah password berhasil diubah, Anda akan otomatis logout dan harus login ulang dengan password baru.
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Lama</label>
                          <input
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              required
                              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              placeholder="Masukkan password lama Anda"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Baru</label>
                          <input
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              required
                              minLength={6}
                              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              placeholder="Minimal 6 karakter"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
                          <input
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              required
                              minLength={6}
                              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              placeholder="Ulangi password baru"
                          />
                      </div>

                      {passwordMessage && (
                          <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
                              passwordMessage.type === 'success'
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                              {passwordMessage.text}
                          </div>
                      )}

                      <div className="flex gap-3 pt-2">
                          <button
                              type="button"
                              onClick={() => {
                                  setShowPasswordForm(false);
                                  setPasswordMessage(null);
                                  setPasswordData({currentPassword: '', newPassword: '', confirmPassword: ''});
                              }}
                              className="px-6 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                          >
                              Batal
                          </button>
                          <button
                              type="button"
                              onClick={handleChangePassword}
                              disabled={isChangingPassword}
                              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                          >
                              {isChangingPassword ? 'Memproses...' : '🔐 Ubah Password'}
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="text-sm text-slate-600">
                      <p>Password Anda terenkripsi dengan aman. Kami merekomendasikan untuk mengubah password secara berkala.</p>
                      <p className="text-xs text-slate-400 mt-2">Terakhir diubah: {userProfile?.password_changed_at ? new Date(userProfile.password_changed_at).toLocaleDateString('id-ID') : 'Belum pernah diubah'}</p>
                  </div>
              )}
          </div>

          {/* Pesan Sukses / Error */}
          {message && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Tombol Simpan */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </MemberLayout>
  );
}
