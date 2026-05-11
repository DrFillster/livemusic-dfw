import styles from "./about.module.css";

export const metadata = {
  title: "About — LiveMusic DFW",
  description:
    "About LiveMusic DFW — your guide to live music events across Dallas-Fort Worth.",
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <h1>About LiveMusic DFW</h1>
      <p>
        LiveMusic DFW aggregates live music events from venues across the
        Dallas-Fort Worth metroplex. We pull from Ticketmaster and other
        sources to give you a comprehensive view of whats happening in DFW.
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