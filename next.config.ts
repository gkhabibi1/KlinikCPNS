import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' " +
              "https://snap.midtrans.com " +
              "https://app.sandbox.midtrans.com " +
              "https://api.sandbox.midtrans.com " +
              "https://maps.googleapis.com; " +
              "style-src 'self' 'unsafe-inline' " +
              "https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "img-src 'self' data: https: blob:; " +
              // ✅ TAMBAHKAN Supabase URLs
              "connect-src 'self' " +
              "https://bazoisdolttbohvqlprv.supabase.co " +
              "wss://bazoisdolttbohvqlprv.supabase.co " +
              "https://wqkohnufwjitvldicypi.supabase.co " +
              "wss://wqkohnufwjitvldicypi.supabase.co " +
              "https://snap.midtrans.com " +
              "https://app.sandbox.midtrans.com " +
              "https://api.sandbox.midtrans.com; " +
              "frame-src 'self' " +
              "https://snap.midtrans.com " +
              "https://app.sandbox.midtrans.com " +
              "https://www.youtube.com; " +
              "media-src 'self' https:; " +
              "worker-src 'self' blob:;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
