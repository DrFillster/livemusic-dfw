import type { Metadata } from "next";
import type { LocalEvent, VenuesData } from "@/lib/events-data";
import InYourBackyardClient from "@/components/InYourBackyardClient";
import localEventsData from "@/app/data/local-events.json";
import venuesData from "@/app/data/venues.json";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Dallas Fort Worth Live Music This Week — Free Shows in Deep Ellum, Lower Greenville, Oak Cliff | LiveMusic DFW",
    description:
      "Find live music this week at DFW bars and venues — Deep Ellum, Lower Greenville, Oak Cliff, Fort Worth, and more. Free shows, local bands, no arena fees.",
    openGraph: {
      title: "LiveMusic DFW — Dallas Fort Worth Live Music This Week",
      description:
        "The bands you haven't heard yet, playing at places you already love. No arena. No ticket fees. Live music in your DFW neighborhood.",
      type: "website",
      siteName: "LiveMusic DFW",
    },
    alternates: {
      canonical: "https://livemusic.dailydallasnews.com/in-your-backyard",
    },
    robots: {
      index: true,
      follow: true,
    },
    keywords: "Dallas live music, Fort Worth concerts, Deep Ellum bands, free live music DFW, local music scene",
  };
}

function buildEventSchemas(events: (LocalEvent | Record<string, unknown>)[]) {
  const now = new Date();
  const upcoming = events
    .filter((e) => new Date(String(e.published ?? "")) >= now)
    .slice(0, 20);

  return upcoming.map((event) => {
    const e = event as Record<string, unknown>;
    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: String(e.title ?? ""),
      startDate: String(e.published ?? ""),
      location: {
        "@type": "Place",
        name: String(e.venue ?? ""),
        url: e.venueSlug
          ? `https://livemusic.dailydallasnews.com/venues/${String(e.venueSlug)}`
          : undefined,
      },
      description: e.summary ? String(e.summary) : undefined,
      image: e.image ? String(e.image) : undefined,
      offers: e.ticketUrl
        ? {
            "@type": "Offer",
            url: String(e.ticketUrl),
            price: e.price ? String(e.price) : "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          }
        : undefined,
      organizer: {
        "@type": "Organization",
        name: "LiveMusic DFW",
        url: "https://livemusic.dailydallasnews.com",
      },
    };
  });
}

export default async function InYourBackyardPage() {
  const events = localEventsData.events || [];
  const neighborhoods: VenuesData["neighborhoods"] = venuesData.neighborhoods;
  const eventSchemas = buildEventSchemas(events);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchemas) }}
      />
      <div className={styles.page}>
        <InYourBackyardClient events={events} neighborhoods={neighborhoods} />
      </div>
    </>
  );
}