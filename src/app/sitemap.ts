import type { MetadataRoute } from "next";
import { readFile } from "fs/promises";
import { join } from "path";

const BASE_URL = "https://livemusic.dailydallasnews.com";

interface Venue {
  slug: string;
}

interface Neighborhood {
  id: string;
}

interface VenuesData {
  neighborhoods: Neighborhood[];
  venues: Venue[];
}

async function getVenuesData(): Promise<VenuesData> {
  try {
    const filePath = join(process.cwd(), "public", "venues.json");
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return { neighborhoods: [], venues: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getVenuesData();
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

  const venuePages: MetadataRoute.Sitemap = data.venues.map((venue) => ({
    url: `${BASE_URL}/venues/${venue.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const neighborhoodPages: MetadataRoute.Sitemap = data.neighborhoods.map((n) => ({
    url: `${BASE_URL}/neighborhoods/${n.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...venuePages, ...neighborhoodPages];
}