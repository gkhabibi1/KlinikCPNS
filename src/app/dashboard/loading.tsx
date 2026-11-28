import PageLoadingSpinner from '@/components/PageLoadingSpinner';

export default function DashboardLoading() {
  return (
    <PageLoadingSpinner
      fullScreen
      title="Memuat Dashboard Member..."
      subtitle="Menyiapkan progres belajar, paket try out, dan statistik Anda."
    />
  );
}
