import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PlatformHeader from '@/components/PlatformHeader';
import { ArrowLeft, Calendar, ChevronRight, User } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (!post) {
    return {
      title: 'Artikel Tidak Ditemukan - Klinik CPNS',
    };
  }

  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');

  return {
    title: `${post.title} - Klinik CPNS`,
    description: post.excerpt,
    alternates: {
      canonical: `https://klinikcpns.com/blog/${cleanSlug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (!post) {
    notFound();
  }

  // Update views count
  await supabase
    .from('blog_posts')
    .update({ views: (post.views || 0) + 1 })
    .eq('id', post.id);

  return (
    <div className="min-h-screen bg-white">
      <PlatformHeader activeTab="blog" />

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-7 sm:py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-slate-500 mb-5 overflow-x-auto no-scrollbar whitespace-nowrap"
        >
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link href="/blog" className="hover:text-blue-600 transition-colors">
            Blog
          </Link>
          {post.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className="text-slate-700 font-medium">{post.category}</span>
            </>
          )}
        </nav>

        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2.5 mb-3 sm:mb-4">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                post.category === 'CPNS'
                  ? 'bg-blue-100 text-blue-700'
                  : post.category === 'P3K'
                  ? 'bg-green-100 text-green-700'
                  : post.category === 'Tips'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.published_at || post.created_at).toLocaleDateString(
                'id-ID',
                {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }
              )}
            </span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-[1.2] tracking-tight mb-3 sm:mb-4">
            {post.title}
          </h1>

          {post.author_name && (
            <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Oleh: <span className="font-semibold text-slate-800">{post.author_name}</span>
            </p>
          )}
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="aspect-[16/9] bg-slate-100 rounded-2xl overflow-hidden mb-7 sm:mb-8 border border-slate-100">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content - Optimized for Smartphone Readability */}
        <div
          className="prose prose-sm sm:prose-base md:prose-lg max-w-none prose-blue prose-headings:font-heading prose-headings:tracking-tight prose-p:leading-[1.8] prose-p:text-slate-700 prose-img:rounded-2xl prose-a:break-words overflow-x-hidden break-words"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Back to Blog */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Artikel</span>
          </Link>
        </div>
      </article>
    </div>
  );
}
