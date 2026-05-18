import { NextResponse } from 'next/server';
import localEventsData from '@/app/data/local-events.json';
import venuesData from '@/app/data/venues.json';

export const dynamic = 'force-dynamic';

export default async function GET() {
  const events = (localEventsData.events || []).map((e: { id: string; published: string }) => ({
    id: e.id,
    lastmod: (e.published || '2026-05-17').split('T')[0],
  }));
  const venues = (venuesData.venues || []).map((v: { slug: string }) => v.slug);
  const neighborhoods = (venuesData.neighborhoods || []).map((n: { id: string }) => n.id);

  const baseUrl = 'https://livemusic.dailydallasnews.com';
  const today = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: baseUrl, changefreq: 'daily', priority: '1.0' },
    { loc: `${baseUrl}/in-your-backyard`, changefreq: 'daily', priority: '0.9' },
    { loc: `${baseUrl}/neighborhoods`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/venues`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.5' },
    ...neighborhoods.map((id: string) => ({ loc: `${baseUrl}/neighborhoods/${id}`, changefreq: 'weekly', priority: '0.7' })),
    ...venues.map((slug: string) => ({ loc: `${baseUrl}/venues/${slug}`, changefreq: 'weekly', priority: '0.7' })),
  ];

  const eventUrls = events.map((e: { id: string; lastmod: string }) => ({
    loc: `${baseUrl}/events/${encodeURIComponent(e.id)}`,
    changefreq: 'monthly',
    priority: '0.6',
    lastmod: e.lastmod,
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
${eventUrls.map((e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}