import PageLoadingSpinner from '@/components/PageLoadingSpinner';

export default function RootLoading() {
  return (
    <PageLoadingSpinner
      fullScreen
      title="Menyiapkan Halaman KlinikCPNS..."
      subtitle="Mohon tunggu sebentar, jangan refresh halaman ya."
    />
  );
}
