import type { Metadata } from "next";
import Link from "next/link";
import type { VenuesData } from "@/lib/events-data";
import venuesData from "@/app/data/venues.json";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "DFW Music Venues — Dallas Fort Worth Bars, Clubs & Concert Halls With Live Music",
  description:
    "Browse every DFW music venue with live shows — Deep Ellum punk rooms, Lower Greenville clubs, Oak Cliff intimate stages, Fort Worth honky-tonks. Local bands, no arena fees.",
  alternates: {
    canonical: "https://dallas-music-scene.com/venues",
  },
  keywords: "DFW music venues, Dallas bars live music, Fort Worth honky tonk, Deep Ellum clubs, live music venues Dallas, Granada Theater, Longhorn Ballroom, House of Blues DFW",
};

const venuesListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "DFW Music Venues — Live Music Bars and Clubs in Dallas-Fort Worth",
  description:
    "A curated list of bars, clubs, and venues across the Dallas-Fort Worth metroplex that host regular live music — from Deep Ellum punk rooms to Fort Worth honky-tonks.",
  numberOfItems: venuesData.venues.length,
  itemListElement: venuesData.venues.map((venue, index) => {
    const neighborhood = venuesData.neighborhoods.find((n) => n.id === venue.neighborhood);
    return {
      "@type": "ListItem",
      position: index + 1,
      url: `https://dallas-music-scene.com/venues/${venue.slug}`,
      name: venue.name,
      description: venue.description || `${venue.type} in ${neighborhood?.name || venue.neighborhood} — live music in DFW.`,
    };
  }),
};

export default async function VenuesPage() {
  const data = venuesData;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(venuesListSchema) }}
      />
      <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Local Venues</h1>
        <p>The bars and spots in DFW where you can catch live music any night of the week.</p>
      </section>

      <div className={styles.venuesGrid}>
        {data.venues.map((venue) => (
          <Link key={venue.id} href={`/venues/${venue.slug}`} className={styles.venueCard}>
            <span className={styles.venueType}>{venue.type}</span>
            <div className={styles.venueNeighborhood}>
              {venue.neighborhood.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </div>
            <h3>{venue.name}</h3>
            <p className={styles.venueDescription}>{venue.description}</p>
            <div className={styles.venueMeta}>
              {venue.hours && <span>🕐 {venue.hours.split(",")[0]}</span>}
              {venue.cover && <span>Cover: {venue.cover}</span>}
            </div>
            {venue.musicTypes && venue.musicTypes.length > 0 && (
              <div className={styles.venueTags}>
                {venue.musicTypes.slice(0, 3).map((mt) => (
                  <span key={mt} className={styles.venueTag}>{mt}</span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
      </div>
    </>
  );
}