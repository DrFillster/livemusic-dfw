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

  // Handle both LiveEvent (DDN pipeline) and LocalEvent (LMDW native) schemas
  const isLocalEvent = "venueSlug" in event;
  const venueSlug = isLocalEvent ? (event as unknown as LocalEvent).venueSlug : undefined;
  const neighborhoodId = isLocalEvent ? (event as unknown as LocalEvent).neighborhood : undefined;
  const venueSlug_2 = isLocalEvent ? (event as unknown as LocalEvent).venueSlug : undefined;
  const venue = venueSlug_2
    ? venuesData.venues.find((v) => v.slug === venueSlug_2)
    : undefined;

  return {
    title: `${event.title} — ${event.venue} | LiveMusic DFW`,
    description:
      event.summary ||
      `${event.title} at ${event.venue}${isLocalEvent && neighborhoodId ? " in " + neighborhoodId : ""}. ${isLocalEvent && (event as unknown as LocalEvent).free ? "Free admission." : event.price ? `Tickets from ${event.price}.` : ""}`,
    openGraph: {
      title: `${event.title} — ${event.venue}`,
      description:
        event.summary ||
        `${event.title} at ${event.venue}${isLocalEvent && neighborhoodId ? " in " + neighborhoodId : ""}.`,
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
    | (LocalEvent & Record<string, unknown>)
    | undefined;

  if (!event) {
    notFound();
  }

  // Safe property accessors that work with both LiveEvent and LocalEvent schemas
  const _event = event as Record<string, unknown>;
  const _venueSlug = String(_event.venueSlug ?? "");
  const _neighborhood = String(_event.neighborhood ?? "");
  const _time = String(_event.time ?? "");
  const _genres = Array.isArray(_event.genres) ? _event.genres : [];
  const _description = String(_event.description ?? "");
  const _free = Boolean(_event.free ?? false);
  const _address = String(_event.address ?? "");

  const venue = _venueSlug
    ? venuesData.venues.find((v) => v.slug === _venueSlug)
    : undefined;
  const neighborhood = _neighborhood
    ? venuesData.neighborhoods.find((n) => n.id === _neighborhood)
    : undefined;
  const eventSchema = buildEventSchema(event, _venueSlug || undefined);

  // Find related events at same venue (only for LocalEvents with venueSlug)
  const allEvents = localEventsData.events as Record<string, unknown>[];
  const relatedEvents = _venueSlug
    ? allEvents
        .filter(
          (e) =>
            String(e.venueSlug ?? "") === _venueSlug &&
            String(e.id ?? "") !== event.id &&
            new Date(String(e.published ?? "")) >= new Date()
        )
        .slice(0, 5) as typeof localEventsData.events
    : [];

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
              {_time && (
                <>
                  <span className={styles.metaDot}>·</span>
                  <span className={styles.eventTime}>{_time}</span>
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
            {_address && (
              <span className={styles.venueAddress}>{_address}</span>
            )}
          </div>

          {_genres.length > 0 && (
            <div className={styles.genres}>
              {_genres.map((g) => (
                <span key={String(g)} className={styles.genreTag}>
                  {String(g)}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Event body */}
        <div className={styles.eventBody}>
          {(_description || event.summary) && (
            <section className={styles.eventSection}>
              <h2>About</h2>
              <p>{_description || event.summary}</p>
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
                  {_time ? ` at ${_time}` : ""}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Where</span>
                <span className={styles.detailValue}>
                  {event.venue}
                  {_address ? ` — ${_address}` : ""}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Admission</span>
                <span className={styles.detailValue}>
                  {_free ? (
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
                {relatedEvents.map((e) => {
                  const eSlug = String((e as Record<string, unknown>).venueSlug ?? "");
                  const eTime = String((e as Record<string, unknown>).time ?? "");
                  return (
                    <Link
                      key={e.id}
                      href={`/events/${encodeURIComponent(e.id)}`}
                      className={styles.relatedItem}
                    >
                      <span className={styles.relatedDate}>
                        {formatDate(e.published)}
                      </span>
                      <span className={styles.relatedTitle}>{e.title}</span>
                      {eTime && (
                        <span className={styles.relatedTime}>{eTime}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
