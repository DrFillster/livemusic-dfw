import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "In Your Backyard — DFW Local Live Music",
  description:
    "Discover live music playing at neighborhood bars and venues near you in Dallas-Fort Worth. No arena, no ticket fees — just local bands at your favorite spots.",
  openGraph: {
    title: "In Your Backyard — DFW Local Live Music",
    description:
      "Discover live music at neighborhood bars near you. The bands you haven't heard yet, playing at places you already love.",
    type: "website",
    siteName: "LiveMusic DFW",
  },
  robots: {
    index: true,
    follow: true,
  },
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
            <Link href="/in-your-backyard" className="logo">
              🎵 LiveMusic<span className="logo-dfw">DFW</span>
            </Link>
            <nav>
              <Link href="/in-your-backyard" className="active">In Your Backyard</Link>
              <Link href="/neighborhoods">Neighborhoods</Link>
              <Link href="/venues">Venues</Link>
              <Link href="/about">About</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          <p>
            LiveMusic DFW — Part of the{" "}
            <a href="https://dailydallasnews.com" target="_blank" rel="noopener">
              Daily Dallas News
            </a>{" "}
            network
          </p>
        </footer>
      </body>
    </html>
  );
}