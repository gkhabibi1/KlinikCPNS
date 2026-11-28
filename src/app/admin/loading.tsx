import PageLoadingSpinner from '@/components/PageLoadingSpinner';

export default function AdminLoading() {
  return (
    <PageLoadingSpinner
      fullScreen
      title="Memuat Admin Panel..."
      subtitle="Menyiapkan data member, transaksi, dan Bank Soal."
    />
  );
}
