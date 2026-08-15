import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
