import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LiveMusic DFW — Dallas-Fort Worth Live Music Events",
  description:
    "Discover live music events across Dallas-Fort Worth. Concerts, festivals, and live performances at the best venues in DFW.",
  openGraph: {
    title: "LiveMusic DFW — Dallas-Fort Worth Live Music Events",
    description:
      "Discover live music events across Dallas-Fort Worth. Concerts, festivals, and live performances at the best venues in DFW.",
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
      </head>
      <body>
        <header className="masthead">
          <div className="masthead-inner">
            <a href="/" className="logo">
              🎵 LiveMusic<span className="logo-dfw">DFW</span>
            </a>
            <nav>
              <a href="/">Events</a>
              <a href="/about">About</a>
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