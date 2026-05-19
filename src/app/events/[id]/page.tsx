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

  const isLocalEvent = "venueSlug" in event;
  const venueSlug = isLocalEvent ? (event as unknown as LocalEvent).venueSlug : undefined;
  const neighborhoodId = isLocalEvent ? (event as unknown as LocalEvent).neighborhood : undefined;

  const venue = venueSlug
    ? venuesData.venues.find((v) => v.slug === venueSlug)
    : undefined;

  const ogImageUrl = event.image || "/og-image.png";
  const description =
    event.summary ||
    `${event.title} at ${event.venue}${neighborhoodId ? " in " + (neighborhoodId.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())) : ""}. Free admission.`;

  return {
    title: `${event.title} — ${event.venue} | LiveMusic DFW`,
    description,
    openGraph: {
      title: `${event.title} — ${event.venue} | LiveMusic DFW`,
      description,
      type: "website",
      siteName: "LiveMusic DFW",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${event.title} at ${event.venue}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.title} at ${event.venue}`,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `https://dallas-music-scene.com/events/${encodeURIComponent(event.id)}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function buildEventSchema(event: LocalEvent, venueSlug?: string, venueAddress?: string) {
  const venue = venueSlug
    ? venuesData.venues.find((v) => v.slug === venueSlug)
    : undefined;

  // Build location with geo if available
  const location: Record<string, unknown> = {
    "@type": "Place",
    name: event.venue,
  };
  if (venueSlug) {
    location.url = `https://dallas-music-scene.com/venues/${venueSlug}`;
  }
  if (venue?.address || venueAddress) {
    location.address = {
      "@type": "PostalAddress",
      streetAddress: (venue?.address || venueAddress)?.replace(/,.*$/, ""),
      addressLocality: "Dallas",
      addressRegion: "TX",
      postalCode: "75206",
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

  // Duration: default to 3 hours for local bar shows
  const startDate = new Date(event.published);
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);

  // Determine performer — handle multi-artist titles like "Delta Blues Guest Edward Desabelle"
  const performerName = event.title || "";
  const isMultiArtist = performerName.toLowerCase().includes("guest") ||
    performerName.toLowerCase().includes("feat.") ||
    performerName.toLowerCase().includes(" ft. ") ||
    performerName.toLowerCase().includes(" and ");
  const performerNames = isMultiArtist
    ? performerName.split(/\s+(?:guest|feat\.?|ft\.?\s+|and)\s+/i).filter((p: string) => p.trim().length > 2)
    : [performerName];

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["MusicEvent", "Event"],
    name: event.title,
    startDate: event.published,
    endDate: endDate.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location,
    description: event.description || event.summary || `${event.title} at ${event.venue}. A live music event in Dallas-Fort Worth.`,
    image: event.image || "/og-image.png",
    organizer: {
      "@type": "Organization",
      name: "LiveMusic DFW",
      url: "https://dallas-music-scene.com",
    },
  };

  // Add performer(s) — Person for single, MusicGroup for bands
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

  // Add isAccessibleForFree
  if (event.free) {
    schema.isAccessibleForFree = true;
  }

  // Add offers
  if (event.ticketUrl) {
    schema.offers = {
      "@type": "Offer",
      url: event.ticketUrl,
      price: event.price || "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    };
  } else if (event.free || event.price === "") {
    schema.offers = {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    };
  }

  return schema;
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
  const eventSchema = buildEventSchema(event, _venueSlug || undefined, _address);

  // Find related events at same venue
  const allEvents = localEventsData.events as Record<string, unknown>[];
  const now = new Date();
  const relatedEvents = _venueSlug
    ? allEvents
        .filter(
          (e) =>
            String(e.venueSlug ?? "") === _venueSlug &&
            String(e.id ?? "") !== event.id &&
            new Date(String(e.published ?? "")) >= now
        )
        .slice(0, 5) as typeof localEventsData.events
    : [];

  // Get upcoming events at nearby venues in same neighborhood
  const nearbyEvents = _neighborhood && !_venueSlug
    ? allEvents
        .filter(
          (e) =>
            String(e.neighborhood ?? "") === _neighborhood &&
            String(e.id ?? "") !== event.id &&
            new Date(String(e.published ?? "")) >= now
        )
        .slice(0, 3) as typeof localEventsData.events
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
            {(venue?.address || _address) && (
              <span className={styles.venueAddress}>
                {venue?.address || _address}
              </span>
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
              <h2>About This Show</h2>
              <p>{_description || event.summary}</p>
            </section>
          )}

          {/* If no description, show auto-generated content */}
          {!_description && !event.summary && (
            <section className={styles.eventSection}>
              <h2>About This Show</h2>
              <p>
                {event.title} is performing at{" "}
                <strong>{event.venue}</strong> in{" "}
                <strong>
                  {neighborhood?.name || venue?.neighborhood?.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </strong>
                . This is a free, no-cover live music event in the Dallas-Fort Worth local music scene.
                {venue?.musicTypes && venue.musicTypes.length > 0 && (
                  <> Expect {venue.musicTypes.slice(0, 3).join(", ")} vibes.</>
                )}
                {" "}Doors open before showtime — arrive early to grab a good spot.
              </p>
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
                    📍 {neighborhood?.name || venue.neighborhood.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
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
                  {_time ? ` at ${_time}` : " (check venue for time)"}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Where</span>
                <span className={styles.detailValue}>
                  {event.venue}
                  {venue?.address || _address ? ` — ${venue?.address || _address}` : ""}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Admission</span>
                <span className={styles.detailValue}>
                  {_free ? (
                    <span className={styles.freeTag}>Free — No cover</span>
                  ) : event.price ? (
                    event.price
                  ) : (
                    "Free — No cover"
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
              {venue && (
                <Link href={`/venues/${venue.slug}`} className={styles.venueActionBtn} style={{ marginTop: "0.75rem", display: "inline-block" }}>
                  View all shows at {venue.name} →
                </Link>
              )}
            </section>
          )}

          {/* Nearby events in same neighborhood */}
          {nearbyEvents.length > 0 && (
            <section className={styles.eventSection}>
              <h2>More in {neighborhood?.name || "This Area"}</h2>
              <div className={styles.relatedList}>
                {nearbyEvents.map((e) => {
                  const eSlug = String((e as Record<string, unknown>).venueSlug ?? "");
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
                      <span className={styles.relatedVenue}>
                        {String((e as Record<string, unknown>).venue ?? "")}
                      </span>
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