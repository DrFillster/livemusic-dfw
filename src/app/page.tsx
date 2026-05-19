import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const BASE_URL = "https://livemusic.dailydallasnews.com";

const homePageSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LiveMusic DFW",
  url: BASE_URL,
  description: "Discover live music at neighborhood bars and venues across Dallas-Fort Worth. Free shows, local bands, no arena fees.",
  inLanguage: "en-US",
  publisher: {
    "@type": "Organization",
    name: "Daily Dallas News",
    url: "https://dailydallasnews.com",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/in-your-backyard?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const homeItemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free Live Music in Dallas-Fort Worth This Week",
  description: "Free and low-cost live music shows at neighborhood bars and venues across DFW.",
  numberOfItems: 10,
  itemListElement: [
    { "@type": "ListItem", position: 1, url: `${BASE_URL}/in-your-backyard`, name: "Browse All Shows" },
    { "@type": "ListItem", position: 2, url: `${BASE_URL}/neighborhoods/deep-ellum`, name: "Deep Ellum Live Music" },
    { "@type": "ListItem", position: 3, url: `${BASE_URL}/neighborhoods/lower-greenville`, name: "Lower Greenville Live Music" },
    { "@type": "ListItem", position: 4, url: `${BASE_URL}/neighborhoods/oak-cliff`, name: "Oak Cliff Live Music" },
    { "@type": "ListItem", position: 5, url: `${BASE_URL}/neighborhoods/bishop-arts`, name: "Bishop Arts Live Music" },
    { "@type": "ListItem", position: 6, url: `${BASE_URL}/neighborhoods/lakewood`, name: "Lakewood Live Music" },
    { "@type": "ListItem", position: 7, url: `${BASE_URL}/neighborhoods/fort-worth`, name: "Fort Worth Live Music" },
    { "@type": "ListItem", position: 8, url: `${BASE_URL}/venues`, name: "All DFW Music Venues" },
    { "@type": "ListItem", position: 9, url: `${BASE_URL}/about`, name: "About LiveMusic DFW" },
    { "@type": "ListItem", position: 10, url: `${BASE_URL}/about`, name: "FAQ — Finding Live Music in DFW" },
  ],
};

export const metadata: Metadata = {
  title: "DFW Live Music Calendar — Dallas & Fort Worth Concerts | LiveMusic DFW",
  description:
    "Discover live music at neighborhood bars and venues across Dallas-Fort Worth. Free shows, local bands, no arena fees. Find live music in Deep Ellum, Lower Greenville, Oak Cliff, Fort Worth, and more.",
  alternates: { canonical: "https://livemusic.dailydallasnews.com" },
  openGraph: {
    title: "LiveMusic DFW — DFW Live Music Calendar",
    description:
      "Discover live music at neighborhood bars across Dallas-Fort Worth. Free shows, local bands, no arena fees.",
    type: "website",
    siteName: "LiveMusic DFW",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LiveMusic DFW — Dallas Fort Worth Live Music Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LiveMusic DFW — Dallas Fort Worth Live Music",
    description:
      "The bands you haven't heard yet, playing at places you already love. No arena. No ticket fees.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([homePageSchema, homeItemListSchema]) }}
      />
      <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        gap: "1.5rem",
      }}
    >
      {/* Music note */}
      <div style={{ fontSize: "4rem" }}>🎵</div>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <img src="/livemusic-logo.svg" alt="LiveMusic DFW" height="56" />
      </div>

      {/* Headline */}
      <div>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.1,
            color: "#fff",
          }}
        >
          LiveMusic DFW
        </h1>
        <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            color: "#b4b4be",
            margin: "0.75rem 0 0",
            maxWidth: "480px",
          }}
        >
          Dallas · Fort Worth — Free local music, every week.
        </p>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: "1.1rem",
          color: "#888",
          maxWidth: "520px",
          lineHeight: 1.6,
        }}
      >
        The bands you haven&apos;t heard yet, playing at bars you already love.
        No arena. No ticket fees. Just live music, steps from your door.
      </p>

      {/* CTA */}
      <Link
        href="/in-your-backyard"
        style={{
          display: "inline-block",
          background: "#d97706",
          color: "#fff",
          fontWeight: 700,
          fontSize: "1.1rem",
          padding: "0.875rem 2rem",
          borderRadius: "8px",
          textDecoration: "none",
          marginTop: "0.5rem",
        }}
      >
        🎸 Browse This Week&apos;s Shows →
      </Link>

      {/* Neighborhood quick links */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          justifyContent: "center",
          marginTop: "0.5rem",
        }}
      >
        {[
          { label: "Deep Ellum", color: "#7c3aed" },
          { label: "Lower Greenville", color: "#059669" },
          { label: "Oak Cliff", color: "#dc2626" },
          { label: "Bishop Arts", color: "#ea580c" },
          { label: "Lakewood", color: "#2563eb" },
          { label: "Fort Worth", color: "#92400e" },
        ].map((n) => (
          <Link
            key={n.label}
            href={`/neighborhoods/${n.label.toLowerCase().replace(" ", "-")}`}
            style={{
              color: n.color,
              border: `1px solid ${n.color}`,
              borderRadius: "20px",
              padding: "0.25rem 0.875rem",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            {n.label}
          </Link>
        ))}
      </div>
    </div>
    </>
  );
}