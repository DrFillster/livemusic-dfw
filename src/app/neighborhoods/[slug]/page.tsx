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

// Rich SEO descriptions for each neighborhood
const NEIGHBORHOOD_INTROS: Record<string, { intro: string; musicVibe: string; whyVisit: string }> = {
  "deep-ellum": {
    intro: "Dallas's creative heartbeat — a neighborhood where murals cover every block, the music never stops, and the drinks are always cheap. Deep Ellum has been the epicenter of DFW's underground music scene since the 90s, home to dive bars, indie rock rooms, and one of the most concentrated collections of live music venues in Texas.",
    musicVibe: "Punk, indie rock, blues, and country — sometimes all in the same night.",
    whyVisit: "No cover, no attitude, just the best local music scene in Dallas.",
  },
  "lower-greenville": {
    intro: "Lower Greenville is where Dallas goes when it wants something for every taste — cocktail bars, coffee houses, dive spots, and live music venues lining both sides of Greenville Avenue for nearly a mile. It's walkable, diverse, and the kind of neighborhood where you can find a different vibe on every block.",
    musicVibe: "Indie rock, americana, folk, and outdoor patio sessions.",
    whyVisit: "The perfect neighborhood bar-crawl — park once, walk to five venues.",
  },
  "oak-cliff": {
    intro: "Oak Cliff sits just across the Trinity River from downtown Dallas, and it feels like a different city entirely. A neighborhood built on craftsman bungalows, independent coffee shops, and a music scene centered around the Kessler Theater and the Bishop Arts corridor. For Dallas music lovers, Oak Cliff is a destination.",
    musicVibe: "Indie rock, folk, americana, and intimate songwriter sets.",
    whyVisit: "Oak Cliff is where DFW goes to see a show and make a night of it.",
  },
  "bishop-arts": {
    intro: "Bishop Arts is Oak Cliff's commercial heart — a few square blocks around Davis and Bishop Avenues that have become Dallas's most walkable neighborhood strip. Boutique shops, wine bars, craft coffee, and live music rooms that seat maybe 100 people at a time. The Kessler Theater sits at the center of it all, booking national acts in a 400-seat restored 1940s movie house.",
    musicVibe: "Indie rock, world music, folk, and singer-songwriters in intimate rooms.",
    whyVisit: "The best walkable music strip in Dallas outside of Deep Ellum.",
  },
  "lakewood": {
    intro: "Lakewood is East Dallas at its most neighborhood — tree-lined streets, a handful of legendary local bars, and one of DFW's best-kept secrets: The Balcony Club, a 60-seat jazz room that attracts musicians from across the country. For Dallas residents in the know, Lakewood is where you catch a great show without going downtown.",
    musicVibe: "Jazz, blues, soul, and acoustic — intimate and serious about the music.",
    whyVisit: "The hidden jazz gem of Dallas, plus blues and karaoke at The Goat.",
  },
  "fort-worth": {
    intro: "Fort Worth's music scene runs on honky-tonk, blues, and Texas roots — and it runs deep. The Stockyards district draws country fans from across the region for line dancing and live acts most nights of the week, while downtown Fort Worth hosts a growing collection of underground rooms where the next generation of Texas musicians cut their teeth.",
    musicVibe: "Country, blues, Texas two-step, and the occasional surprise metal booking.",
    whyVisit: "A little bit Nashville, right here in DFW. And almost no cover charges.",
  },
  "downtown-dallas": {
    intro: "Downtown Dallas hosts DFW's big stages — the AAC, Granada Theater, and a growing cluster of smaller venues in the Bryan Park corridor. But between the arena shows, there's a circuit of rooms where local musicians play for audiences small enough to have a conversation between songs.",
    musicVibe: "Variety — from singer-songwriters to full bands, depending on the room.",
    whyVisit: "Catch national acts in intimate rooms, then walk to three local bars afterwards.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const neighborhood = venuesData.neighborhoods.find((n) => n.id === slug);

  if (!neighborhood) {
    return { title: "Neighborhood Not Found" };
  }

  const introData = NEIGHBORHOOD_INTROS[slug];
  const fullDescription = introData
    ? `${introData.intro} ${introData.whyVisit}`
    : `Browse live music events and venues in ${neighborhood.name}, Dallas-Fort Worth. Find upcoming shows, free admission nights, and local band showcases at ${neighborhood.name} bars and venues.`;

  return {
    title: `Live Music in ${neighborhood.name} — DFW | LiveMusic DFW`,
    description: fullDescription,
    alternates: {
      canonical: `https://dallas-music-scene.com/neighborhoods/${neighborhood.id}`,
    },
    openGraph: {
      title: `Live Music in ${neighborhood.name} | LiveMusic DFW`,
      description: fullDescription,
      type: "website",
      siteName: "LiveMusic DFW",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `Live music venues in ${neighborhood.name}, Dallas-Fort Worth`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Live Music in ${neighborhood.name} | LiveMusic DFW`,
      description: fullDescription,
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function NeighborhoodPage({ params }: Props) {
  const { slug } = await params;

  const neighborhood = venuesData.neighborhoods.find((n) => n.id === slug) as Neighborhood | undefined;
  const allEvents = eventsData.events as Record<string, unknown>[];
  const neighborhoodEvents = allEvents
    .filter((e) => String(e.neighborhood ?? "") === slug)
    .map((e) => ({
      id: String(e.id ?? ""),
      title: String(e.title ?? ""),
      url: e.url ? String(e.url) : undefined,
      ticketUrl: e.ticketUrl ? String(e.ticketUrl) : undefined,
      published: String(e.published ?? ""),
      time: String(e.time ?? ""),
      venue: String(e.venue ?? ""),
      venueSlug: String(e.venueSlug ?? ""),
      neighborhood: String(e.neighborhood ?? ""),
      free: Boolean(e.free ?? false),
      price: String(e.price ?? ""),
    } as { id: string; title: string; url?: string; ticketUrl?: string; published: string; time: string; venue: string; venueSlug: string; neighborhood: string; free: boolean; price: string }));

  const neighborhoodVenues = venuesData.venues.filter((v) => v.neighborhood === slug);
  const introData = NEIGHBORHOOD_INTROS[slug];

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
    <>
      {neighborhoodEvents.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `Upcoming Live Music in ${neighborhood.name}`,
              description: `Live music shows and events happening in ${neighborhood.name}, Dallas-Fort Worth this week.`,
              numberOfItems: neighborhoodEvents.length,
              itemListElement: neighborhoodEvents.map((event, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `https://dallas-music-scene.com/events/${encodeURIComponent(event.id)}`,
                name: event.title,
              })),
            }),
          }}
        />
      )}
      <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/neighborhoods">← All Neighborhoods</Link>
      </div>

      <section className={styles.hero}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ background: neighborhood.color, width: 16, height: 16, borderRadius: "50%" }} />
          <span style={{ fontSize: "0.8rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Dallas-Fort Worth
          </span>
        </div>
        <h1>🎵 {neighborhood.name}</h1>

        {introData && (
          <>
            <p className={styles.neighborhoodIntro}>{introData.intro}</p>
            <div className={styles.neighborhoodVibe}>
              <span style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>🎸</span>
              <span>{introData.musicVibe}</span>
            </div>
            <p className={styles.neighborhoodWhy}>{introData.whyVisit}</p>
          </>
        )}
        {!introData && neighborhood.description && (
          <p className={styles.neighborhoodIntro}>{neighborhood.description}</p>
        )}
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
                  <Link href={`/events/${encodeURIComponent(event.id)}`}>
                    {event.title}
                  </Link>
                </h3>
                <div className={styles.eventMeta}>
                  <span>{event.time}</span>
                  <span>·</span>
                  <Link href={`/venues/${event.venueSlug}`}>{event.venue}</Link>
                  {event.free && <span style={{ color: "#059669", fontWeight: 600 }}>· Free</span>}
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
    </>
  );
}