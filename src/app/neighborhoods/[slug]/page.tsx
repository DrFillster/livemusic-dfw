import type { Metadata } from "next";
import Link from "next/link";
import type { Neighborhood } from "@/lib/events-data";
import venuesData from "@/app/data/venues.json";
import eventsData from "@/app/data/local-events.json";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const neighborhood = venuesData.neighborhoods.find((n) => n.id === slug);

  if (!neighborhood) {
    return { title: "Neighborhood Not Found" };
  }

  return {
    title: `Live Music in ${neighborhood.name} — DFW | LiveMusic DFW`,
    description: neighborhood.description
      ? `${neighborhood.description} Find live music events and shows in ${neighborhood.name} on LiveMusic DFW.`
      : `Browse live music events and venues in ${neighborhood.name}, Dallas-Fort Worth.`,
    alternates: {
      canonical: `https://livemusic.dailydallasnews.com/neighborhoods/${neighborhood.id}`,
    },
    openGraph: {
      title: `${neighborhood.name} Live Music | LiveMusic DFW`,
      description: neighborhood.description || `${neighborhood.name} — live music scene in DFW.`,
      type: "website",
      siteName: "LiveMusic DFW",
    },
  };
}

export default async function NeighborhoodPage({ params }: Props) {
  const { slug } = await params;

  const neighborhood = venuesData.neighborhoods.find((n) => n.id === slug) as Neighborhood | undefined;
  const neighborhoodEvents = (eventsData.events as Array<{
    id: string;
    title: string;
    url?: string;
    ticketUrl?: string;
    published: string;
    time: string;
    venue: string;
    venueSlug: string;
    neighborhood: string;
    free: boolean;
    price: string;
  }>).filter((e) => e.neighborhood === slug);

  const neighborhoodVenues = venuesData.venues.filter((v) => v.neighborhood === slug);

  if (!neighborhood) {
    return (
      <div className={styles.page}>
        <div style={{ padding: "4rem 0", textAlign: "center" }}>
          <h1>Neighborhood not found</h1>
          <p>This neighborhood doesn&apos;t exist in our directory yet.</p>
          <Link href="/neighborhoods" style={{ color: "#d97706" }}>← Back to Neighborhoods</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/neighborhoods">← All Neighborhoods</Link>
      </div>

      <section className={styles.hero}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ background: neighborhood.color, width: 16, height: 16, borderRadius: "50%" }} />
        </div>
        <h1>{neighborhood.name}</h1>
        <p>{neighborhood.description}</p>
      </section>

      {neighborhoodEvents.length > 0 && (
        <section className={styles.section}>
          <h2>Upcoming Shows in {neighborhood.name}</h2>
          <div className={styles.eventsGrid}>
            {neighborhoodEvents.slice(0, 12).map((event) => (
              <article key={event.id} className={styles.eventCard}>
                <div className={styles.eventDate}>
                  {new Date(event.published + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <h3>
                  <a href={event.url || event.ticketUrl || "#"} target="_blank" rel="noopener noreferrer">
                    {event.title}
                  </a>
                </h3>
                <div className={styles.eventMeta}>
                  <span>{event.time}</span>
                  <span>·</span>
                  <Link href={`/venues/${event.venueSlug}`}>{event.venue}</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {neighborhoodVenues.length > 0 && (
        <section className={styles.section}>
          <h2>Venues in {neighborhood.name}</h2>
          <div className={styles.venuesGrid}>
            {neighborhoodVenues.map((venue) => (
              <Link key={venue.slug} href={`/venues/${venue.slug}`} className={styles.venueCard}>
                <h3>{venue.name}</h3>
                <p>{venue.type}</p>
                {venue.musicTypes && venue.musicTypes.length > 0 && (
                  <div className={styles.venueTags}>
                    {venue.musicTypes.slice(0, 3).map((mt: string) => (
                      <span key={mt} className={styles.venueTag}>{mt}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {neighborhoodEvents.length === 0 && neighborhoodVenues.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <p>No events or venues found in {neighborhood.name} yet.</p>
          <Link href="/neighborhoods" style={{ color: "#d97706" }}>← Browse other neighborhoods</Link>
        </div>
      )}
    </div>
  );
}