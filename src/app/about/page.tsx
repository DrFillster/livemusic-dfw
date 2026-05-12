import styles from "./about.module.css";

export const metadata = {
  title: "About LiveMusic DFW — Dallas Fort Worth Live Music Calendar",
  description:
    "LiveMusic DFW is your free guide to live music events across Dallas-Fort Worth neighborhood bars and venues. No arena fees, no Ticketmaster — just local bands at places you already love. Part of the Daily Dallas News network.",
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <h1>About LiveMusic DFW</h1>
      <p>
        LiveMusic DFW is your free guide to live music across the Dallas-Fort
        Worth metroplex. We aggregate shows from neighborhood bars and venues
        across DFW — no arena fees, no Ticketmaster markup.
      </p>
      <p>
        Our goal is simple: make it easier to find live music happening right
        now, this week, or this weekend at bars and venues in your own
        neighborhood. From Deep Ellum dive bars to the Granada Theater, we
        cover the local scene that bigger sites miss.
      </p>
      <p>
        Part of the{" "}
        <a href="https://dailydallasnews.com" target="_blank" rel="noopener">
          Daily Dallas News
        </a>{" "}
        network.
      </p>
    </div>
  );
}
