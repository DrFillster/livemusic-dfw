import type { Metadata } from "next";
import Link from "next/link";
import { readFile } from "fs/promises";
import { join } from "path";
import type { VenuesData } from "@/lib/events-data";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

async function getVenuesData(): Promise<VenuesData> {
  try {
    const filePath = join(process.cwd(), "public", "venues.json");
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return { generated: "", neighborhoods: [], venues: [] };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Dallas Fort Worth Neighborhoods With Live Music",
    description:
      "Find live music by DFW neighborhood — Deep Ellum, Lower Greenville, Oak Cliff, Bishop Arts, Fort Worth, and more. Browse live events by area.",
    alternates: {
      canonical: "https://livemusic.dailydallasnews.com/neighborhoods",
    },
  };
}

export default async function NeighborhoodsPage() {
  const data = await getVenuesData();

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