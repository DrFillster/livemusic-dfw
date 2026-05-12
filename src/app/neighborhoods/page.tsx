import type { Metadata } from "next";
import Link from "next/link";
import type { VenuesData } from "@/lib/events-data";
import venuesData from "@/app/data/venues.json";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Dallas Fort Worth Neighborhoods With Live Music — Deep Ellum, Lower Greenville, Oak Cliff, Fort Worth",
    description:
      "Find live music by DFW neighborhood. Browse shows in Deep Ellum, Lower Greenville, Oak Cliff, Bishop Arts, Lakewood, Downtown Dallas, and Fort Worth bars.",
    alternates: {
      canonical: "https://livemusic.dailydallasnews.com/neighborhoods",
    },
    keywords: "live music Deep Ellum, live music Lower Greenville, live music Oak Cliff, live music Fort Worth, live music Bishop Arts",
  };
}

export default async function NeighborhoodsPage() {
  const data = venuesData;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Neighborhoods</h1>
        <p>Find live music by area. Every corner of DFW has something playing.</p>
      </section>

      <section className={styles.neighborhoods}>
        {data.neighborhoods.map((n) => (
          <Link key={n.id} href={`/neighborhoods/${n.id}`} className={styles.neighborhoodCard}>
            <div className={styles.neighborhoodDot} style={{ background: n.color }} />
            <div>
              <h2>{n.name}</h2>
              <p>{n.description}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
