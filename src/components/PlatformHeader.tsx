"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { PlatformTab } from "@/components/LandingTabsContent";
import {
  Home,
  Sparkles,
  BookOpen,
  Scale,
  MessageSquareQuote,
  ArrowRight,
  Newspaper,
} from "lucide-react";

export type ActiveNavTab = PlatformTab | "blog";

interface PlatformHeaderProps {
  activeTab: ActiveNavTab;
  onSwitchTab?: (tab: PlatformTab) => void;
}

export default function PlatformHeader({
  activeTab,
  onSwitchTab,
}: PlatformHeaderProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => {
      setCurrentUser(data?.user || null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setCurrentUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      await supabase.auth.signOut();
      setCurrentUser(null);
      window.location.reload();
    }
  };

  const handleTabClick = (tabId: PlatformTab) => {
    if (onSwitchTab) {
      onSwitchTab(tabId);
    } else {
      router.push(tabId === "beranda" ? "/" : `/?tab=${tabId}`);
    }
  };

  const tabItems: Array<{
    id: PlatformTab;
    label: string;
    icon: React.ElementType;
    isGuide?: boolean;
  }> = [
    { id: "beranda", label: "Beranda", icon: Home },
    { id: "keunggulan", label: "Keunggulan & Fitur", icon: Sparkles },
    { id: "panduan", label: "Panduan 2026", icon: BookOpen, isGuide: true },
    { id: "harga", label: "Harga", icon: Scale },
    { id: "testimoni", label: "FAQ", icon: MessageSquareQuote },
  ];

  const isBlogActive = activeTab === "blog";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => handleTabClick("beranda")}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer"
        >
          <img
            src="https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png"
            alt="Klinik CPNS Logo"
            className="h-8 md:h-9 w-auto object-contain"
          />
        </button>

        {/* Desktop Platform Tabs */}
        <nav
          aria-label="Navigasi Platform"
          className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/70"
        >
          {tabItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`text-[13px] font-semibold px-3.5 py-1.5 rounded-full transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80"
                    : tab.isGuide
                    ? "text-blue-700 hover:bg-blue-50/70"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                {tab.isGuide && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}

          <Link
            href="/blog"
            className={`text-[13px] font-semibold px-3.5 py-1.5 rounded-full transition-all ${
              isBlogActive
                ? "bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            Blog
          </Link>
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4.5 py-2 rounded-full transition-colors shadow-sm shadow-blue-200"
              >
                Dashboard
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <a
                href="/login?mode=login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-full transition-colors"
              >
                Masuk
              </a>
              <a
                href="/login?mode=register"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition-colors shadow-sm shadow-blue-200"
              >
                Daftar
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* Mobile & Tablet Horizontal Tab Bar */}
      <div className="lg:hidden border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:border-blue-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
          <Link
            href="/blog"
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isBlogActive
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200/80 hover:border-blue-200"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Blog</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
