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

function buildEventSchemas(events: LocalEvent[]) {
  const now = new Date();
  const upcoming = events
    .filter((e) => new Date(e.published) >= now)
    .slice(0, 20);

  return upcoming.map((event) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.published,
    location: {
      "@type": "Place",
      name: event.venue,
      url: event.venueSlug
        ? `https://livemusic.dailydallasnews.com/venues/${event.venueSlug}`
        : undefined,
    },
    description: event.summary || undefined,
    image: event.image || undefined,
    offers: event.ticketUrl
      ? {
          "@type": "Offer",
          url: event.ticketUrl,
          price: event.price || "0",
          priceCurrency: "USD",
          availability: event.free
            ? "https://schema.org/InStock"
            : "https://schema.org/InStock",
        }
      : undefined,
    organizer: {
      "@type": "Organization",
      name: "LiveMusic DFW",
      url: "https://livemusic.dailydallasnews.com",
    },
  }));
}

export default async function InYourBackyardPage() {
  const events: LocalEvent[] = localEventsData.events || [];
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