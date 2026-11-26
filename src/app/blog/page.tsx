import { createClient } from '@/lib/supabase-server';
import { Metadata } from 'next';
import PlatformHeader from '@/components/PlatformHeader';
import BlogListClient from '@/components/BlogListClient';

export const metadata: Metadata = {
  title: 'Blog CPNS & P3K - Tips, Info, dan Panduan Terbaru | Klinik CPNS',
  description: 'Baca artikel terbaru tentang CPNS, P3K, tips belajar, dan informasi terkini seputar seleksi ASN.',
  alternates: {
    canonical: 'https://klinikcpns.com/blog',
  },
};

export default async function BlogPage() {
  const supabase = createClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PlatformHeader activeTab="blog" />

      {/* Compact Mobile-Friendly Hero Header */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full mb-3">
            Pusat Artikel &amp; Edukasi CASN
          </span>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2.5 sm:mb-3">
            Blog &amp; Artikel CPNS
          </h1>
          <p className="text-sm sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Tips belajar, panduan resmi, dan informasi terbaru untuk persiapan seleksi CPNS &amp; P3K Anda.
          </p>
        </div>
      </section>

      {/* Blog Content */}
      <main className="flex-1">
        {!posts || posts.length === 0 ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
              Belum Ada Artikel
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Artikel akan segera hadir. Stay tuned!
            </p>
          </div>
        ) : (
          <BlogListClient posts={posts} />
        )}
      </main>
    </div>
  );
}
