import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog CPNS & P3K - Tips, Info, dan Panduan Terbaru | Klinik CPNS',
  description: 'Baca artikel terbaru tentang CPNS, P3K, tips belajar, dan informasi terkini seputar seleksi ASN.',
};

export default async function BlogPage() {
  const supabase = createClient();
  
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

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
            <Link href="/blog" className="text-sm font-semibold text-blue-600">Blog</Link>
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Masuk</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Blog & Artikel</h1>
          <p className="text-xl text-blue-100">
            Tips, panduan, dan informasi terbaru untuk persiapan CPNS & P3K Anda
          </p>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {!posts || posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Belum Ada Artikel</h2>
            <p className="text-slate-600">Artikel akan segera hadir. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group"
              >
                {post.featured_image && (
                  <div className="aspect-video bg-slate-100 overflow-hidden">
                    <img 
                      src={post.featured_image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      post.category === 'CPNS' ? 'bg-blue-100 text-blue-700' :
                      post.category === 'P3K' ? 'bg-green-100 text-green-700' :
                      post.category === 'Tips' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(post.published_at || post.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="text-sm text-blue-600 font-medium">
                    Baca Selengkapnya →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
