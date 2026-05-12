import type { Metadata } from "next";
import Link from "next/link";
import type { VenuesData } from "@/lib/events-data";
import venuesData from "@/app/data/venues.json";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "DFW Music Venues — Dallas Fort Worth Concert Halls & Clubs",
  description:
    "Browse all DFW music venues hosting live performances — from intimate bars to concert halls. Find where your favorite local bands play in Dallas-Fort Worth.",
  alternates: {
    canonical: "https://livemusic.dailydallasnews.com/venues",
  },
};

export default async function VenuesPage() {
  const data = venuesData;

  return (
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
  );
}