import type { MetadataRoute } from "next";
import localEventsData from "@/app/data/local-events.json";
import venuesData from "@/app/data/venues.json";

const BASE_URL = "https://livemusic.dailydallasnews.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/in-your-backyard`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/neighborhoods`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/venues`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const venuePages: MetadataRoute.Sitemap = venuesData.venues.map((venue) => ({
    url: `${BASE_URL}/venues/${venue.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const neighborhoodPages: MetadataRoute.Sitemap = venuesData.neighborhoods.map((n) => ({
    url: `${BASE_URL}/neighborhoods/${n.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const eventPages: MetadataRoute.Sitemap = localEventsData.events
    .filter((e) => new Date(e.published) >= now)
    .map((event) => ({
      url: `${BASE_URL}/events/${encodeURIComponent(event.id)}`,
      lastModified: new Date(event.published),
      changeFrequency: "daily",
      priority: 0.7,
    }));

  return [...staticPages, ...venuePages, ...neighborhoodPages, ...eventPages];
}