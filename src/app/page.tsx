import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const BASE_URL = "https://livemusic.dailydallasnews.com";

export const metadata: Metadata = {
  title: "DFW Live Music Calendar — Dallas & Fort Worth Concerts | LiveMusic DFW",
  description:
    "Discover live music at neighborhood bars and venues across Dallas-Fort Worth. Free shows, local bands, no arena fees. Find live music in Deep Ellum, Lower Greenville, Oak Cliff, Fort Worth, and more.",
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
  );
}