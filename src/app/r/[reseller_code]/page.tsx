import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import KlinikCPNSLandingPage from '@/app/LandingPageClient';

interface PageProps {
  params: Promise<{ reseller_code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { reseller_code } = await params;
  const supabase = createClient();
  const { data: reseller } = await supabase
    .from('resellers')
    .select('full_name')
    .eq('reseller_code', reseller_code.toUpperCase())
    .single();

  return {
    title: `${reseller?.full_name || 'Reseller'} - Try Out CPNS & P3K | Klinik CPNS`,
    description: 'Platform Try Out CPNS dan P3K online terbaik dengan sistem penilaian resmi BKN. Dapatkan potongan harga 10% khusus rekomendasi reseller!',
  };
}

export default async function ResellerHomePage({ params }: PageProps) {
  const { reseller_code } = await params;
  const supabase = createClient();
  const code = reseller_code.toUpperCase();

  const { data: reseller } = await supabase
    .from('resellers')
    .select('*')
    .eq('reseller_code', code)
    .eq('is_active', true)
    .single();

  if (!reseller) {
    notFound();
  }

  return (
    <KlinikCPNSLandingPage 
      resellerCode={code} 
      resellerName={reseller.full_name} 
      discountPercentage={10} 
    />
  );
}

