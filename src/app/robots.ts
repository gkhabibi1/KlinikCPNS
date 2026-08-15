import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/tryout-list', '/login', '/register'],
        disallow: ['/admin/', '/dashboard/', '/tryout/', '/result/', '/api/'],
      },
    ],
    sitemap: 'https://klinikcpns.com/sitemap.xml',
  };
}
