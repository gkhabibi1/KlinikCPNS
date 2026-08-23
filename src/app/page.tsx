import { Metadata } from 'next';
import KlinikCPNSLandingPage from './LandingPageClient';

export const metadata: Metadata = {
  title: 'KlinikCPNS | Try Out CPNS & P3K Gratis 2026 - Simulasi CAT BKN',
  description:
    'KlinikCPNS adalah platform Try Out CPNS dan P3K online terbaik 2026 dengan sistem penilaian resmi BKN, pembahasan lengkap, dan simulasi CAT persis seperti ujian asli. Mulai latihan di KlinikCPNS!',
  keywords: [
    'KlinikCPNS',
    'Klinik CPNS',
    'try out cpns KlinikCPNS',
    'bimbel cpns KlinikCPNS',
    'simulasi cat bkn KlinikCPNS',
    'try out cpns gratis',
    'simulasi cat bkn',
    'kisi-kisi cpns 2026',
    'latihan soal p3k',
    'soal twk tiu tkp',
    'bimbel cpns 2026'
  ],
  metadataBase: new URL('https://klinikcpns.com'),
  alternates: {
    canonical: 'https://klinikcpns.com',
  },
  openGraph: {
    title: 'KlinikCPNS | Try Out CPNS & P3K Gratis 2026',
    description:
      'Latihan soal CAT BKN di KlinikCPNS dengan pembahasan lengkap dan sistem scoring resmi.',
    url: 'https://klinikcpns.com',
    siteName: 'KlinikCPNS',
    images: [
      {
        url: 'https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png',
        width: 1200,
        height: 630,
        alt: 'KlinikCPNS - Platform Try Out CAT BKN',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Try Out CPNS & P3K Gratis 2026 | Klinik CPNS',
    description:
      'Latihan soal CAT BKN dengan pembahasan lengkap dan sistem scoring resmi.',
    images: ['https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function Page() {
  return <KlinikCPNSLandingPage />;
}
