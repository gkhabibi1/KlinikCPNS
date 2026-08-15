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

  // Dynamic blog pages
  const blogPages: MetadataRoute.Sitemap = posts?.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  })) || [];

  return [...staticPages, ...blogPages];
}
