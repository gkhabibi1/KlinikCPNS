import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KlinikCPNS — Simulasi CAT BKN 2026',
    short_name: 'KlinikCPNS',
    description:
      'Platform Try Out CPNS dan P3K dengan simulasi CAT BKN 2026, materi berjenjang, dan 30 Days Challenge.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
