import type { Metadata } from "next";
import { readFile } from "fs/promises";
import { join } from "path";
import type { LocalEvent, VenuesData } from "@/lib/events-data";
import InYourBackyardClient from "@/components/InYourBackyardClient";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

async function getLocalEvents(): Promise<{ events: LocalEvent[]; neighborhoods: VenuesData["neighborhoods"] }> {
  try {
    // Try local-events.json first (venue-sourced events)
    const localPath = join(process.cwd(), "public", "local-events.json");
    const localContent = await readFile(localPath, "utf8").catch(() => null);
    if (localContent) {
      const data = JSON.parse(localContent);
      const venuesPath = join(process.cwd(), "public", "venues.json");
      const venuesContent = await readFile(venuesPath, "utf8").catch(() => null);
      const venuesData: VenuesData = venuesContent ? JSON.parse(venuesContent) : { neighborhoods: [], venues: [] };
      return { events: data.events || [], neighborhoods: venuesData.neighborhoods };
    }
  } catch {}
  return { events: [], neighborhoods: [] };
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "DFW Live Music Events — Dallas Fort Worth Concerts This Week",
    description:
      "Discover live music events happening this week at neighborhood bars and venues across Dallas-Fort Worth. Local bands, no cover charge, find shows near you.",
    openGraph: {
      title: "In Your Backyard — DFW Live Music This Week",
      description:
        "Discover live music at neighborhood bars near you. The bands you haven't heard yet, playing at places you already love.",
      type: "website",
      siteName: "LiveMusic DFW",
    },
    alternates: {
      canonical: "https://livemusic.dailydallasnews.com/in-your-backyard",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function InYourBackyardPage() {
  const { events, neighborhoods } = await getLocalEvents();

  return (
    <div className={styles.page}>
      <InYourBackyardClient events={events} neighborhoods={neighborhoods} />
    </div>
  );
}