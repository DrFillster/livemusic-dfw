import type { Metadata } from "next";
import Link from "next/link";
import type { Venue } from "@/lib/events-data";
import venuesData from "@/app/data/venues.json";
import localEventsData from "@/app/data/local-events.json";
import { formatDate } from "@/lib/events-data";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return venuesData.venues.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = venuesData;
  const venue = data.venues.find((v) => v.slug === slug);
  if (!venue) return { title: "Venue Not Found" };

  const neighborhood = data.neighborhoods.find((n) => n.id === venue.neighborhood);
  const neighborhoodName = neighborhood
    ? neighborhood.name
    : venue.neighborhood.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());

  return {
    title: `${venue.name} — Live Music Venue in ${neighborhoodName} | LiveMusic DFW`,
    description:
      venue.description ||
      `Live music at ${venue.name} in ${neighborhoodName}, Dallas-Fort Worth. ${venue.musicTypes?.join(", ") || "Find upcoming shows and events."}`,
    openGraph: {
      title: `${venue.name} — LiveMusic DFW`,
      description:
        venue.description ||
        `${venue.name} hosts live music in ${neighborhoodName}, DFW.`,
      type: "website",
      siteName: "LiveMusic DFW",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${venue.name} — Live music venue in ${neighborhoodName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${venue.name} — LiveMusic DFW`,
      description:
        venue.description ||
        `${venue.name} hosts live music in ${neighborhoodName}, DFW.`,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `https://livemusic.dailydallasnews.com/venues/${venue.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function buildVenueSchema(venue: Venue) {
  const addressParts = venue.address ? venue.address.split(", ") : [];
  const street = addressParts[0] || "";
  const city = addressParts[1] ? addressParts[1].split(" ")[0] : "Dallas";
  const stateZip = addressParts[1] ? addressParts[1].split(", ").slice(1).join(", ") : "TX 75206";
  const [state, zip] = stateZip.split(" ");
  const neighborhood = venuesData.neighborhoods.find((n) => n.id === venue.neighborhood);

  const location: Record<string, unknown> = {
    "@type": "BarOrPub",
    name: venue.name,
    url: `https://livemusic.dailydallasnews.com/venues/${venue.slug}`,
    description: venue.description,
  };

  const address: Record<string, string> = {
    "@type": "PostalAddress",
    streetAddress: street,
    addressLocality: city,
    addressRegion: "TX",
    postalCode: zip || "75206",
    addressCountry: "US",
  };
  location.address = address;

  if (venue.geo) {
    location.geo = {
      "@type": "GeoCoordinates",
      latitude: venue.geo.lat,
      longitude: venue.geo.lng,
    };
  }

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["BarOrPub", "MusicVenue"],
    name: venue.name,
    description: venue.description || `${venue.name} is a live music venue in ${neighborhood?.name || venue.neighborhood}, Dallas-Fort Worth.`,
    url: `https://livemusic.dailydallasnews.com/venues/${venue.slug}`,
    location,
    telephone: venue.phone || undefined,
    openingHours: venue.hours || undefined,
    ...(venue.website && { sameAs: [venue.website] }),
  };

  return schema;
}

export default async function VenuePage({ params }: Props) {
  const { slug } = await params;
  const data = venuesData;
  const venue = data.venues.find((v) => v.slug === slug) as Venue | undefined;

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

  const neighborhood = data.neighborhoods.find((n) => n.id === venue.neighborhood);
  const venueSchema = buildVenueSchema(venue);

  // Fetch upcoming events at this venue
  const now = new Date();
  const rawEvents = localEventsData.events as Record<string, unknown>[];
  const upcomingEvents = rawEvents
    .filter(
      (e) =>
        String(e.venueSlug ?? "") === venue.slug &&
        new Date(String(e.published ?? "")) >= now
    )
    .sort((a, b) => new Date(String(a.published ?? "")).getTime() - new Date(String(b.published ?? "")).getTime())
    .slice(0, 10);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(venueSchema) }}
      />
      <div className={styles.page}>
        <article className="venue-page">
          <nav className={styles.breadcrumb}>
            <Link href="/venues">← All Venues</Link>
            {" · "}
            {neighborhood && (
              <>
                <Link href={`/neighborhoods/${neighborhood.id}`}>{neighborhood.name}</Link>
                {" · "}
              </>
            )}
            <span>{venue.name}</span>
          </nav>

          <header className={styles.venueHeader}>
            <h1>{venue.name}</h1>
            <div className={styles.venueMeta}>
              <span
                className={styles.venueTypeBadge}
                style={{
                  borderColor: neighborhood?.color || "#888",
                  color: neighborhood?.color || "#888",
                }}
              >
                {venue.type}
              </span>
              {venue.address && <span className={styles.venueAddress}>{venue.address}</span>}
              {venue.phone && <span className={styles.venuePhone}>{venue.phone}</span>}
            </div>
            {neighborhood && (
              <Link
                href={`/neighborhoods/${neighborhood.id}`}
                style={{
                  color: neighborhood.color,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  display: "inline-block",
                  marginTop: "0.25rem",
                }}
              >
                📍 {neighborhood.name}
              </Link>
            )}
            <p className={styles.venueDescription}>{venue.description}</p>
            {venue.hours && <p className={styles.venueHours}>🕐 {venue.hours}</p>}
          </header>

          {/* Upcoming shows at this venue */}
          {upcomingEvents.length > 0 && (
            <section className={styles.venueSchedule}>
              <h3>Upcoming Shows</h3>
              <div className={styles.upcomingList}>
                {upcomingEvents.map((e) => {
                  const eId = String(e.id ?? "");
                  const eTitle = String(e.title ?? "");
                  const eTime = String(e.time ?? "");
                  const eFree = Boolean(e.free ?? false);
                  return (
                    <Link
                      key={eId}
                      href={`/events/${encodeURIComponent(eId)}`}
                      className={styles.upcomingItem}
                    >
                      <div className={styles.upcomingDate}>
                        {formatDate(String(e.published ?? ""))}
                        {eTime && <span className={styles.upcomingTime}> · {eTime}</span>}
                      </div>
                      <div className={styles.upcomingTitle}>{eTitle}</div>
                      {eFree && <span className={styles.upcomingFree}>Free</span>}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {venue.schedule && Object.keys(venue.schedule).length > 0 && (
            <div className={styles.venueSchedule}>
              <h3>Typical Weekly Schedule</h3>
              <div className={styles.scheduleGrid}>
                {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
                  <div key={day} className={styles.scheduleItem}>
                    <span className={styles.scheduleDay}>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
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
    </>
  );
}