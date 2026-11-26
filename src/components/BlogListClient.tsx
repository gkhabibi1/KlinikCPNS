"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Search, Sparkles, X } from "lucide-react";

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  category?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
  created_at: string;
}

function getCategoryStyle(category?: string | null) {
  switch (category) {
    case "CPNS":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "P3K":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "Tips":
      return "bg-amber-50 text-amber-700 border-amber-100";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function formatBlogDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BlogListClient({ posts }: { posts: BlogPostItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(posts.map((p) => p.category).filter((c): c is string => Boolean(c)))
    );
    return ["Semua", ...unique];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const matchCategory =
        selectedCategory === "Semua" || post.category === selectedCategory;
      const matchQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(q));
      return matchCategory && matchQuery;
    });
  }, [posts, selectedCategory, searchQuery]);

  const showFeatured =
    selectedCategory === "Semua" && !searchQuery.trim() && filteredPosts.length > 1;
  const featuredPost = showFeatured ? filteredPosts[0] : null;
  const gridPosts = showFeatured ? filteredPosts.slice(1) : filteredPosts;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Filter & Search Bar - Mobile Friendly */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari artikel..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-14 px-4 bg-slate-50/70 rounded-2xl border border-slate-200/70">
          <p className="text-base font-bold text-slate-800 mb-1">
            Artikel tidak ditemukan
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Coba kata kunci lain atau pilih kategori &ldquo;Semua&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("Semua");
              setSearchQuery("");
            }}
            className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Featured Latest Post */}
          {featuredPost && (
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group block bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg hover:border-blue-200 transition-all"
            >
              <div className="grid md:grid-cols-12 items-stretch">
                {featuredPost.featured_image && (
                  <div className="md:col-span-6 aspect-[16/10] md:aspect-auto md:min-h-[260px] bg-slate-100 overflow-hidden">
                    <img
                      src={featuredPost.featured_image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div
                  className={`${
                    featuredPost.featured_image ? "md:col-span-6" : "md:col-span-12"
                  } p-5 sm:p-7 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        Terbaru
                      </span>
                      {featuredPost.category && (
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryStyle(
                            featuredPost.category
                          )}`}
                        >
                          {featuredPost.category}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {formatBlogDate(
                          featuredPost.published_at || featuredPost.created_at
                        )}
                      </span>
                    </div>
                    <h2 className="font-heading text-lg sm:text-2xl font-extrabold text-slate-900 leading-snug mb-2.5 group-hover:text-blue-600 transition-colors">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.excerpt && (
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                        {featuredPost.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 group-hover:gap-2.5 transition-all">
                    <span>Baca Artikel</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Grid Articles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {gridPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group flex flex-col justify-between"
              >
                <div>
                  {post.featured_image && (
                    <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      {post.category ? (
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryStyle(
                            post.category
                          )}`}
                        >
                          {post.category}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="text-[11px] sm:text-xs text-slate-500">
                        {formatBlogDate(post.published_at || post.created_at)}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 flex items-center gap-1.5 text-xs sm:text-sm text-blue-600 font-semibold">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
