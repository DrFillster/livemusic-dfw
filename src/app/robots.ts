import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        crawlDelay: 1,
      },
    ],
    sitemap: "https://dallas-music-scene.com/sitemap.xml",
    host: "https://dallas-music-scene.com",
  };
}
