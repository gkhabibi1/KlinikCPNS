'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import MemberLayout from '@/components/MemberLayout';

const supabase = createClient();

export default function SubscriptionPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<{[key: string]: any[]}>({});
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [showAllBenefitsModal, setShowAllBenefitsModal] = useState(false);
  const [selectedPackageForBenefits, setSelectedPackageForBenefits] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // 1. Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      // 2. Get all active subscription packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('subscription_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (packagesError) throw packagesError;
      if (packagesData) setPackages(packagesData);

      // 3. Get benefits for each package
      const benefitsMap: {[key: string]: any[]} = {};
      for (const pkg of packagesData || []) {
        const { data: pkgBenefits } = await supabase
          .from('subscription_benefits')
          .select('*')
          .eq('package_id', pkg.id)
          .eq('is_active', true)
          .order('display_order');
        
        if (pkgBenefits) {
          benefitsMap[pkg.id] = pkgBenefits;
        }
      }
      setBenefits(benefitsMap);

      // 4. Check current subscription status
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_valid_until, subscription_package_id')
        .eq('id', currentUser.id)
        .single();

      if (profile?.subscription_valid_until) {
        const expiryDate = new Date(profile.subscription_valid_until);
        const now = new Date();
        
        if (expiryDate > now) {
          // Subscription masih aktif
          const { data: activePackage } = await supabase
            .from('subscription_packages')
            .select('name')
            .eq('id', profile.subscription_package_id)
            .single();

          setCurrentSubscription({
            package_name: activePackage?.name || 'Unknown',
            valid_until: profile.subscription_valid_until,
            is_lifetime: profile.subscription_valid_until === '2099-12-31T00:00:00Z' || 
                        profile.subscription_valid_until === '2099-12-31'
          });
        }
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (months: number) => {
    if (months === 999) return 'Lifetime (Selamanya)';
    if (months === 1) return '1 Bulan';
    return `${months} Bulan`;
  };

  const getDaysRemaining = () => {
    if (!currentSubscription?.valid_until) return 0;
    const expiry = new Date(currentSubscription.valid_until);
    const now = new Date();
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Beli Langganan</h1>
        <p className="text-slate-600 text-sm">
          Pilih paket yang sesuai dengan kebutuhan Anda dan dapatkan akses ke semua fitur premium
        </p>
      </div>

      {/* Status Langganan Saat Ini */}
      {currentSubscription && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h2 className="text-xl font-bold">Langganan Aktif</h2>
              </div>
              <p className="text-green-50 text-lg font-semibold mb-1">
                {currentSubscription.package_name}
              </p>
              <p className="text-green-100 text-sm">
                {currentSubscription.is_lifetime 
                  ? 'Akses seumur hidup' 
                  : `Berlaku hingga ${new Date(currentSubscription.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} (${getDaysRemaining()} hari lagi)`}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
              <div className="text-xs text-green-100">Status</div>
              <div className="font-bold text-lg">✓ Aktif</div>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      {!currentSubscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Anda belum memiliki langganan aktif</p>
            <p className="text-blue-700">Pilih salah satu paket di bawah ini untuk mulai mengakses semua fitur premium.</p>
          </div>
        </div>
      )}

      {/* List Paket Subscribe */}
      {packages.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <div className="text-6xl mb-4"></div>
          <p className="text-lg font-medium">Belum ada paket yang tersedia</p>
          <p className="text-sm mt-2">Silakan hubungi admin untuk informasi lebih lanjut</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const packageBenefits = benefits[pkg.id] || [];
            const isLifetime = pkg.duration_months === 999;
            const isPopular = pkg.discount_label && !isLifetime;
            
            return (
              <div 
                key={pkg.id} 
                className={`relative bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                  isPopular ? 'border-blue-500' : 'border-slate-200'
                }`}
              >
                {/* Badge Popular */}
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                     POPULAR
                  </div>
                )}

                {/* Header Card */}
                <div className={`px-6 py-5 text-white ${
                  isLifetime 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600' 
                    : isPopular
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700'
                    : 'bg-gradient-to-r from-slate-600 to-slate-700'
                }`}>
                  <h3 className="font-bold text-xl mb-1">{pkg.name}</h3>
                  <p className="text-white/80 text-sm">{pkg.description}</p>
                </div>

                {/* Body Card */}
                <div className="p-6 space-y-4">
                  {/* Durasi & Harga */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Durasi:</span>
                      <span className="font-bold text-slate-800">
                        {formatDuration(pkg.duration_months)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Harga:</span>
                      <div className="text-right">
                        <div className="font-bold text-blue-600 text-xl">
                          Rp {(pkg.price || 0).toLocaleString('id-ID')}
                        </div>
                        {!isLifetime && pkg.duration_months > 1 && (
                          <div className="text-xs text-slate-500">
                            Rp {Math.round((pkg.price || 0) / pkg.duration_months).toLocaleString('id-ID')}/bulan
                          </div>
                        )}
                      </div>
                    </div>
                    {pkg.discount_label && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <span className="text-sm text-slate-600">Spesial:</span>
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          isLifetime 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {pkg.discount_label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* List Benefit */}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Manfaat yang Didapatkan:
                    </h4>
                    <ul className="space-y-2">
                      {packageBenefits.slice(0, 4).map((benefit) => (
                        <li key={benefit.id} className="flex items-start gap-2 text-sm text-slate-700">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{benefit.benefit_text}</span>
                        </li>
                      ))}
                      {packageBenefits.length > 4 && (
                        <li className="pt-1">
                          <button
                            onClick={() => {
                              setSelectedPackageForBenefits(pkg);
                              setShowAllBenefitsModal(true);
                            }}
                            className="text-xs text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                          >
                            +{packageBenefits.length - 4} manfaat lainnya →
                          </button>
                        </li>
                      )}
                      {packageBenefits.length === 0 && (
                        <li className="text-slate-400 italic text-xs">Belum ada benefit</li>
                      )}
                    </ul>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="space-y-2 pt-2">
                    <Link
                      href={`/checkout/${pkg.id}`}
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      Pilih Paket Ini
                    </Link>
                    
                    {packageBenefits.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setShowBenefitModal(true);
                        }}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2"
                      >
                        Lihat Semua Manfaat →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Benefit */}
      {showBenefitModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className={`px-6 py-4 text-white ${
              selectedPackage.duration_months === 999 
                ? 'bg-gradient-to-r from-amber-500 to-orange-600' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-700'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{selectedPackage.name}</h3>
                  <p className="text-white/80 text-sm mt-1">
                    {formatDuration(selectedPackage.duration_months)} • Rp {(selectedPackage.price || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <button
                  onClick={() => setShowBenefitModal(false)}
                  className="text-white/80 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <h4 className="font-semibold text-slate-800 mb-3">Daftar Lengkap Manfaat:</h4>
              <ul className="space-y-3">
                {(benefits[selectedPackage.id] || []).map((benefit, index) => (
                  <li key={benefit.id} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-sm text-slate-700 pt-0.5">{benefit.benefit_text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex gap-2">
              <button
                onClick={() => setShowBenefitModal(false)}
                className="flex-1 py-2.5 border border-slate-300 rounded-lg font-medium hover:bg-slate-100"
              >
                Tutup
              </button>
              <Link
                href={`/checkout/${selectedPackage.id}`}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-center"
              >
                Pilih Paket
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* Modal Semua Manfaat */}
      {showAllBenefitsModal && selectedPackageForBenefits && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{selectedPackageForBenefits.name}</h3>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedPackageForBenefits.description}
                  </p>
                </div>
                <button
                  onClick={() => setShowAllBenefitsModal(false)}
                  className="text-white/80 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <h4 className="font-semibold text-slate-800 mb-4">Semua Manfaat yang Didapatkan:</h4>
              <ul className="space-y-3">
                {(benefits[selectedPackageForBenefits.id] || []).map((benefit, index) => (
                  <li key={benefit.id} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-700 pt-0.5">
                      {index + 1}. {benefit.benefit_text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex gap-2">
              <button
                onClick={() => setShowAllBenefitsModal(false)}
                className="flex-1 py-2.5 border border-slate-300 rounded-lg font-medium hover:bg-slate-100"
              >
                Tutup
              </button>
              <Link
                href={`/checkout/${selectedPackageForBenefits.id}`}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-center"
              >
                Pilih Paket
              </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </MemberLayout>
  );
}
