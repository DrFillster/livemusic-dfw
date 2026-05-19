import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const BASE_URL = "https://dallas-music-scene.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: "%s | LiveMusic DFW",
    default: "DFW Live Music Calendar — Dallas & Fort Worth Concerts | LiveMusic DFW",
  },
  description:
    "Discover live music at neighborhood bars and venues across Dallas-Fort Worth. No arena, no ticket fees — just local bands at your favorite spots.",
  openGraph: {
    title: "LiveMusic DFW — DFW Live Music Calendar",
    description:
      "Discover live music at neighborhood bars across Dallas-Fort Worth. No arena, no ticket fees — just local bands at your favorite spots.",
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
      "The bands you haven't heard yet, playing at places you already love. No arena. No ticket fees. Live music in your DFW neighborhood.",
    images: ["/og-image.png"],
    site: "@LiveMusicDFW",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  keywords:
    "Dallas live music, Fort Worth concerts, Deep Ellum live music, Lower Greenville bars, Oak Cliff live music, free music DFW, local bands Dallas, DFW music scene",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      </head>
      <body>
        <header className="masthead">
          <div className="masthead-inner">
            <Link href="/in-your-backyard" className="logo" aria-label="LiveMusic DFW Home">
              <img src="/livemusic-logo.svg" alt="LiveMusic DFW" height="42" />
            </Link>
            <nav>
              <Link href="/in-your-backyard" className="active">In Your Backyard</Link>
              <Link href="/neighborhoods">Neighborhoods</Link>
              <Link href="/venues">Venues</Link>
              <Link href="/about">About</Link>
              <Link href="https://dallas-music-scene.com" target="_blank" rel="noopener" className="sister-site">
                ← Daily Dallas News
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          <p>
            <strong>Part of the DFW News family</strong> —{" "}
            <a href="https://dallas-music-scene.com" target="_blank" rel="noopener">
              Daily Dallas News
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}