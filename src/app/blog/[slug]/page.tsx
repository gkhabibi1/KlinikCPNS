import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

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

  return {
    title: `${post.title} - Klinik CPNS`,
    description: post.excerpt,
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
      {/* Navbar */}
      <nav className="border-b border-slate-100 bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="https://ik.imagekit.io/e2yna5qg8/Logo%20Klinik%20CPNS.png"
              alt="Logo Klinik CPNS"
              className="h-9 md:h-10 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-sm font-medium text-slate-600 hover:text-slate-900">Blog</Link>
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Masuk</Link>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              post.category === 'CPNS' ? 'bg-blue-100 text-blue-700' :
              post.category === 'P3K' ? 'bg-green-100 text-green-700' :
              post.category === 'Tips' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {post.category}
            </span>
            <span className="text-sm text-slate-500">
              {new Date(post.published_at || post.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            {post.title}
          </h1>
          
          {post.author_name && (
            <p className="text-slate-600">
              Oleh: <span className="font-medium">{post.author_name}</span>
            </p>
          )}
        </div>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden mb-8">
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none prose-blue"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Back to Blog */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <Link 
            href="/blog" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Kembali ke Daftar Artikel
          </Link>
        </div>
      </article>
    </div>
  );
}
