import styles from "./about.module.css";

export const metadata = {
  title: "About LiveMusic DFW — Dallas Fort Worth Live Music Calendar",
  description:
    "LiveMusic DFW is your free guide to live music events across Dallas-Fort Worth neighborhood bars and venues. No arena fees, no Ticketmaster — just local bands at places you already love. Part of the Daily Dallas News network.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I find live music in Dallas-Fort Worth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LiveMusic DFW aggregates free and low-cost live music events at neighborhood bars and venues across DFW — including Deep Ellum, Lower Greenville, Oak Cliff, and Fort Worth. Browse the calendar or search by neighborhood to find shows near you.",
      },
    },
    {
      "@type": "Question",
      name: "Are these really free shows?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most listings on LiveMusic DFW are free or have no cover charge. Some venues charge a small cover (typically under $10). Each event listing clearly indicates whether it's free or has a cover charge.",
      },
    },
    {
      "@type": "Question",
      name: "What kinds of music can I find on LiveMusic DFW?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LiveMusic DFW covers blues, jazz, country, rock, punk, honky-tonk, and more — all at local neighborhood bars and mid-size venues. We don't list arena shows or ticketed concerts with high fees.",
      },
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
        <a href="https://dallas-music-scene.com" target="_blank" rel="noopener">
          Daily Dallas News
        </a>{" "}
        network.
      </p>
    </div>
    </>
  );
}
