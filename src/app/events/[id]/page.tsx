import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LocalEvent } from "@/lib/events-data";
import { formatDate } from "@/lib/events-data";
import localEventsData from "@/app/data/local-events.json";
import venuesData from "@/app/data/venues.json";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return localEventsData.events.map((event) => ({
    id: encodeURIComponent(event.id),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const event = localEventsData.events.find((e) => e.id === decodedId);

  if (!event) return { title: "Event Not Found" };

  const venue = venuesData.venues.find((v) => v.slug === event.venueSlug);

  return {
    title: `${event.title} — ${event.venue} | LiveMusic DFW`,
    description:
      event.summary ||
      `${event.title} at ${event.venue} in ${event.neighborhoodName}. ${event.free ? "Free admission." : event.price ? `Tickets from ${event.price}.` : ""} ${event.genres?.join(", ") || ""}`,
    openGraph: {
      title: `${event.title} — ${event.venue}`,
      description:
        event.summary ||
        `${event.title} at ${event.venue} in ${event.neighborhoodName}.`,
      type: "website",
      siteName: "LiveMusic DFW",
      images: event.image ? [{ url: event.image }] : [],
    },
    alternates: {
      canonical: `https://livemusic.dailydallasnews.com/events/${encodeURIComponent(event.id)}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function buildEventSchema(event: LocalEvent, venueSlug?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.published,
    location: {
      "@type": "Place",
      name: event.venue,
      url: venueSlug
        ? `https://livemusic.dailydallasnews.com/venues/${venueSlug}`
        : undefined,
    },
    description: event.description || event.summary,
    image: event.image || undefined,
    offers: event.ticketUrl
      ? {
          "@type": "Offer",
          url: event.ticketUrl,
          price: event.price || "0",
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
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const event = localEventsData.events.find((e) => e.id === decodedId) as
    | LocalEvent
    | undefined;

  if (!event) {
    notFound();
  }

  const venue = venuesData.venues.find((v) => v.slug === event.venueSlug);
  const neighborhood = venuesData.neighborhoods.find(
    (n) => n.id === event.neighborhood
  );
  const eventSchema = buildEventSchema(event, event.venueSlug);

  // Find related events at same venue
  const relatedEvents = localEventsData.events
    .filter(
      (e) =>
        e.venueSlug === event.venueSlug &&
        e.id !== event.id &&
        new Date(e.published) >= new Date()
    )
    .slice(0, 5);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <div className={styles.page}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/in-your-backyard">← All Shows</Link>
          {neighborhood && (
            <>
              {" · "}
              <Link href={`/neighborhoods/${neighborhood.id}`}>
                {neighborhood.name}
              </Link>
            </>
          )}
          {venue && (
            <>
              {" · "}
              <Link href={`/venues/${venue.slug}`}>{venue.name}</Link>
            </>
          )}
        </nav>

        {/* Event header */}
        <header className={styles.eventHeader}>
          {event.image && (
            <div className={styles.eventImage}>
              <img src={event.image} alt={event.title} />
            </div>
          )}

          <div className={styles.eventMeta}>
            <div className={styles.eventDateTime}>
              <span className={styles.eventDate}>
                {formatDate(event.published)}
              </span>
              {event.time && (
                <>
                  <span className={styles.metaDot}>·</span>
                  <span className={styles.eventTime}>{event.time}</span>
                </>
              )}
            </div>

            {neighborhood && (
              <span
                className={styles.neighborhoodBadge}
                style={{ color: neighborhood.color, borderColor: neighborhood.color }}
              >
                {neighborhood.name}
              </span>
            )}
          </div>

          <h1 className={styles.eventTitle}>{event.title}</h1>

          <div className={styles.venueInfo}>
            {venue ? (
              <Link href={`/venues/${venue.slug}`} className={styles.venueName}>
                {event.venue}
              </Link>
            ) : (
              <span className={styles.venueName}>{event.venue}</span>
            )}
            {event.address && (
              <span className={styles.venueAddress}>{event.address}</span>
            )}
          </div>

          {event.genres && event.genres.length > 0 && (
            <div className={styles.genres}>
              {event.genres.map((g) => (
                <span key={g} className={styles.genreTag}>
                  {g}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Event body */}
        <div className={styles.eventBody}>
          {(event.description || event.summary) && (
            <section className={styles.eventSection}>
              <h2>About</h2>
              <p>{event.description || event.summary}</p>
            </section>
          )}

          {venue && (
            <section className={styles.eventSection}>
              <h2>The Venue</h2>
              <div className={styles.venueCard}>
                <div className={styles.venueCardHeader}>
                  <Link href={`/venues/${venue.slug}`} className={styles.venueCardName}>
                    {venue.name}
                  </Link>
                  <span className={styles.venueType}>{venue.type}</span>
                </div>
                {venue.description && <p>{venue.description}</p>}
                {venue.hours && (
                  <p className={styles.venueHours}>🕐 {venue.hours}</p>
                )}
                <div className={styles.venueActions}>
                  {venue.website && (
                    <a
                      href={venue.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.venueActionBtn}
                    >
                      🌐 Venue Website
                    </a>
                  )}
                  {venue.eventsUrl && (
                    <a
                      href={venue.eventsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.venueActionBtn}
                    >
                      📅 More Shows
                    </a>
                  )}
                  <Link
                    href={`/neighborhoods/${venue.neighborhood}`}
                    className={styles.venueActionBtn}
                  >
                    📍 {neighborhood?.name || venue.neighborhood}
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Price & tickets */}
          <section className={styles.eventSection}>
            <h2>Details</h2>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>When</span>
                <span className={styles.detailValue}>
                  {formatDate(event.published)}
                  {event.time ? ` at ${event.time}` : ""}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Where</span>
                <span className={styles.detailValue}>
                  {event.venue}
                  {event.address ? ` — ${event.address}` : ""}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Admission</span>
                <span className={styles.detailValue}>
                  {event.free ? (
                    <span className={styles.freeTag}>Free</span>
                  ) : event.price ? (
                    event.price
                  ) : (
                    "See venue"
                  )}
                </span>
              </div>
              {event.source && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Source</span>
                  <span className={styles.detailValue}>{event.source}</span>
                </div>
              )}
            </div>

            {event.ticketUrl && (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ticketBtn}
              >
                Get Tickets 🎟️
              </a>
            )}
          </section>

          {/* Related events */}
          {relatedEvents.length > 0 && (
            <section className={styles.eventSection}>
              <h2>More at {event.venue}</h2>
              <div className={styles.relatedList}>
                {relatedEvents.map((e) => (
                  <Link
                    key={e.id}
                    href={`/events/${encodeURIComponent(e.id)}`}
                    className={styles.relatedItem}
                  >
                    <span className={styles.relatedDate}>
                      {formatDate(e.published)}
                    </span>
                    <span className={styles.relatedTitle}>{e.title}</span>
                    {e.time && (
                      <span className={styles.relatedTime}>{e.time}</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
