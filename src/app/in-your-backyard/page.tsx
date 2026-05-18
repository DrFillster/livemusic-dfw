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
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "LiveMusic DFW — Dallas Fort Worth Live Music",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "LiveMusic DFW — Dallas Fort Worth Live Music This Week",
      description:
        "The bands you haven't heard yet, playing at places you already love. No arena. No ticket fees. Live music in your DFW neighborhood.",
      images: ["/og-image.png"],
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
    const venueSlug = String(e.venueSlug ?? "");
    const venue = venueSlug
      ? venuesData.venues.find((v) => v.slug === venueSlug)
      : undefined;
    const startDate = new Date(String(e.published ?? ""));
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
    const performerName = String(e.title ?? "");
    const isMultiArtist = performerName.toLowerCase().includes("guest") ||
      performerName.toLowerCase().includes("feat.") ||
      performerName.toLowerCase().includes(" ft. ") ||
      performerName.toLowerCase().includes(" and ");
    const performerNames = isMultiArtist
      ? performerName.split(/\s+(?:guest|feat\.?|ft\.?\s+|and)\s+/i).filter((p: string) => p.trim().length > 2)
      : [performerName];

    const location: Record<string, unknown> = {
      "@type": "Place",
      name: String(e.venue ?? ""),
    };
    if (venueSlug) {
      location.url = `https://livemusic.dailydallasnews.com/venues/${venueSlug}`;
    }
    if (venue?.address) {
      const addressParts = venue.address.split(", ");
      location.address = {
        "@type": "PostalAddress",
        streetAddress: addressParts[0] || "",
        addressLocality: addressParts[1] ? addressParts[1].split(" ")[0] : "Dallas",
        addressRegion: "TX",
        postalCode: addressParts[2] || "75206",
        addressCountry: "US",
      };
    }
    if (venue?.geo) {
      location.geo = {
        "@type": "GeoCoordinates",
        latitude: venue.geo.lat,
        longitude: venue.geo.lng,
      };
    }

    const schema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": ["MusicEvent", "Event"],
      name: String(e.title ?? ""),
      startDate: String(e.published ?? ""),
      endDate: endDate.toISOString(),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location,
      description: e.summary ? String(e.summary) : undefined,
      image: e.image ? String(e.image) : undefined,
      organizer: {
        "@type": "Organization",
        name: "LiveMusic DFW",
        url: "https://livemusic.dailydallasnews.com",
      },
    };

    if (performerNames.length === 1 && performerNames[0]) {
      schema.performer = {
        "@type": performerNames[0].length > 30 ? "MusicGroup" : "Person",
        name: performerNames[0].trim(),
      };
    } else if (performerNames.length > 1) {
      schema.performer = performerNames.map((p: string) => ({
        "@type": p.length > 30 ? "MusicGroup" : "Person",
        name: p.trim(),
      }));
    }

    if (e.free) {
      schema.isAccessibleForFree = true;
      schema.offers = {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      };
    } else if (e.ticketUrl) {
      schema.offers = {
        "@type": "Offer",
        url: String(e.ticketUrl),
        price: e.price ? String(e.price) : "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      };
    }

    return schema;
  });
}

function buildItemListSchema(events: (LocalEvent | Record<string, unknown>)[]) {
  const now = new Date();
  const upcoming = events
    .filter((e) => new Date(String(e.published ?? "")) >= now)
    .slice(0, 20);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Upcoming Live Music Events in Dallas-Fort Worth",
    description: "Free and low-cost live music shows at DFW neighborhood bars and venues this week.",
    numberOfItems: upcoming.length,
    itemListElement: upcoming.map((event, index) => {
      const e = event as Record<string, unknown>;
      return {
        "@type": "ListItem",
        position: index + 1,
        url: `https://livemusic.dailydallasnews.com/events/${encodeURIComponent(String(e.id ?? ""))}`,
        name: String(e.title ?? ""),
      };
    }),
  };
}

export default async function InYourBackyardPage() {
  const events = localEventsData.events || [];
  const neighborhoods: VenuesData["neighborhoods"] = venuesData.neighborhoods;
  const eventSchemas = buildEventSchemas(events);
  const itemListSchema = buildItemListSchema(events);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([itemListSchema, ...eventSchemas]) }}
      />
      <div className={styles.page}>
        <InYourBackyardClient events={events} neighborhoods={neighborhoods} />
      </div>
    </>
  );
}