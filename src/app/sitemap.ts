import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const baseUrl = 'https://klinikcpns.com';

  // Ambil semua artikel blog yang published
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('is_published', true);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/tryout-list`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  // Dynamic blog pages (Pastikan slug bersih tanpa slash di awal/akhir)
  const blogPages: MetadataRoute.Sitemap = posts
    ?.filter(post => Boolean(post.slug))
    .map(post => {
      const cleanSlug = post.slug.trim().replace(/^\/+|\/+$/g, '');
      return {
        url: `${baseUrl}/blog/${cleanSlug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      };
    }) || [];

  return [...staticPages, ...blogPages];
}
