import type { Metadata } from "next";
import Link from "next/link";
import { readFile } from "fs/promises";
import { join } from "path";
import type { Venue } from "@/lib/events-data";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getVenue(slug: string): Promise<Venue | null> {
  try {
    const filePath = join(process.cwd(), "public", "venues.json");
    const content = await readFile(filePath, "utf8");
    const data = JSON.parse(content);
    return data.venues.find((v: Venue) => v.slug === slug) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) return { title: "Venue Not Found" };

  return {
    title: `${venue.name} — LiveMusic DFW`,
    description: venue.description,
    alternates: {
      canonical: `https://livemusic.dailydallasnews.com/venues/${venue.slug}`,
    },
  };
}

export default async function VenuePage({ params }: Props) {
  const { slug } = await params;
  const venue = await getVenue(slug);

  if (!venue) {
    return (
      <div className={styles.page}>
        <div style={{ padding: "4rem 0", textAlign: "center" }}>
          <h1>Venue not found</h1>
          <p>This venue doesn&apos;t exist in our directory yet.</p>
          <Link href="/venues" style={{ color: "#d97706" }}>← Back to Venues</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <article className="venue-page">
        <div className={styles.breadcrumb}>
          <Link href="/venues">← All Venues</Link>
          {" · "}
          <Link href={`/neighborhoods/${venue.neighborhood}`}>{venue.neighborhood.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}</Link>
        </div>

        <header className={styles.venueHeader}>
          <h1>{venue.name}</h1>
          <div className={styles.venueMeta}>
            <span className={styles.venueTypeBadge}>{venue.type}</span>
            {venue.address && <span className={styles.venueAddress}>{venue.address}</span>}
            {venue.phone && <span className={styles.venuePhone}>{venue.phone}</span>}
          </div>
          <p className={styles.venueDescription}>{venue.description}</p>
          {venue.hours && <p className={styles.venueHours}>🕐 {venue.hours}</p>}
        </header>

        {venue.schedule && Object.keys(venue.schedule).length > 0 && (
          <div className={styles.venueSchedule}>
            <h3>Typical Weekly Schedule</h3>
            <div className={styles.scheduleGrid}>
              {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
                <div key={day} className={styles.scheduleItem}>
                  <span className={styles.scheduleDay}>{day}</span>
                  <span className={styles.scheduleMusic}>
                    {venue.schedule?.[day as keyof typeof venue.schedule] || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {venue.musicTypes && venue.musicTypes.length > 0 && (
          <div className={styles.venueTags}>
            <span style={{ fontSize: "0.8rem", color: "#666", marginRight: "0.5rem" }}>Music:</span>
            {venue.musicTypes.map((mt) => (
              <span key={mt} className={styles.venueTag}>{mt}</span>
            ))}
          </div>
        )}

        <div className={styles.venueLinks}>
          {venue.website && (
            <a href={venue.website} className={styles.venueLinkBtn} target="_blank" rel="noopener noreferrer">
              🌐 Website
            </a>
          )}
          {venue.eventsUrl && (
            <a href={venue.eventsUrl} className={styles.venueLinkBtn} target="_blank" rel="noopener noreferrer">
              📅 Events
            </a>
          )}
          {venue.facebook && (
            <a href={venue.facebook} className={styles.venueLinkBtn} target="_blank" rel="noopener noreferrer">
              📘 Facebook
            </a>
          )}
          {venue.instagram && (
            <a href={venue.instagram} className={styles.venueLinkBtn} target="_blank" rel="noopener noreferrer">
              📷 Instagram
            </a>
          )}
        </div>
      </article>
    </div>
  );
}