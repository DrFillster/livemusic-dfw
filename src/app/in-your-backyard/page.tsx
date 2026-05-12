import type { Metadata } from "next";
import type { LocalEvent, VenuesData } from "@/lib/events-data";
import InYourBackyardClient from "@/components/InYourBackyardClient";
import localEventsData from "@/app/data/local-events.json";
import venuesData from "@/app/data/venues.json";
import styles from "./page.module.css";

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
  const events: LocalEvent[] = localEventsData.events || [];
  const neighborhoods: VenuesData["neighborhoods"] = venuesData.neighborhoods;

  return (
    <div className={styles.page}>
      <InYourBackyardClient events={events} neighborhoods={neighborhoods} />
    </div>
  );
}