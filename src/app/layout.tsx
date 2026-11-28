import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LiveChatBubble from "@/components/LiveChatBubble";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://klinikcpns.com'),
  title: {
    default: "Try Out CPNS & P3K Gratis 2026 | Simulasi CAT BKN - Klinik CPNS",
    template: "%s | Klinik CPNS",
  },
  description:
    "Platform Try Out CPNS dan P3K online terbaik dengan sistem penilaian resmi BKN, pembahasan lengkap, dan simulasi CAT persis seperti ujian asli. Mulai latihan gratis sekarang!",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "KlinikCPNS",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full antialiased scroll-smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-slate-900 bg-white">
        {children}
        <LiveChatBubble />
        <SpeedInsights />
      </body>
    </html>
  );
}
