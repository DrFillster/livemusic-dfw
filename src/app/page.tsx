import type { Metadata } from "next";
import { readFile } from "fs/promises";
import { join } from "path";
import type { LiveEvent, EventsData } from "@/lib/events-data";
import { getUniqueCities } from "@/lib/events-data";
import EventsClient from "@/components/EventsClient";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

async function getMusicEvents(): Promise<LiveEvent[]> {
  try {
    const filePath = join(process.cwd(), "public", "events.json");
    const fileContents = await readFile(filePath, "utf8");
    const data: EventsData = JSON.parse(fileContents);
    return data.events;
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "LiveMusic DFW — Dallas-Fort Worth Live Music Events",
    description:
      "Discover live music events across Dallas-Fort Worth. Concerts, festivals, and live performances at the best venues in DFW.",
    openGraph: {
      title: "LiveMusic DFW — Dallas-Fort Worth Live Music Events",
      description:
        "Discover live music events across Dallas-Fort Worth. Concerts, festivals, and live performances at the best venues in DFW.",
      type: "website",
      siteName: "LiveMusic DFW",
    },
    alternates: {
      canonical: "https://livemusic.dailydallasnews.com",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function HomePage() {
  const events = await getMusicEvents();
  const cities = getUniqueCities(events);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Live Music in Dallas-Fort Worth</h1>
        <p>
          Concerts, festivals, and live performances at venues across DFW.
          {events.length} events found.
        </p>
      </section>

      <section className={styles.content}>
        <EventsClient initialEvents={events} cities={cities} />
      </section>
    </div>
  );
}