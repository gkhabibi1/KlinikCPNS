import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar Paket Try Out CPNS & P3K 2026',
  description: 'Pilih paket latihan soal dan simulasi ujian CAT CPNS & P3K dengan sistem penilaian resmi BKN.',
  alternates: {
    canonical: 'https://klinikcpns.com/tryout-list',
  },
};

export default function TryoutListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
