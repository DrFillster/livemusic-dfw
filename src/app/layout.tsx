import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | LiveMusic DFW",
    default: "DFW Live Music Calendar — Dallas & Fort Worth Concerts | livemusic.dailydallasnews.com",
  },
  description:
    "Discover live music at neighborhood bars and venues across Dallas-Fort Worth. No arena, no ticket fees — just local bands at your favorite spots.",
  openGraph: {
    title: "LiveMusic DFW — DFW Live Music Calendar",
    description:
      "Discover live music at neighborhood bars across Dallas-Fort Worth. No arena, no ticket fees — just local bands at your favorite spots.",
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
              <Link href="https://dailydallasnews.com" target="_blank" rel="noopener" className="sister-site">
                ← Daily Dallas News
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          <p>
            <strong>Part of the DFW News family</strong> —{" "}
            <a href="https://dailydallasnews.com" target="_blank" rel="noopener">
              Daily Dallas News
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}