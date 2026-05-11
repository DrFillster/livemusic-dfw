"use client";

import { useState, useMemo } from "react";
import type { LocalEvent } from "@/lib/events-data";
import { formatDate } from "@/lib/events-data";
import Link from "next/link";

interface Props {
  events: LocalEvent[];
  neighborhoods: { id: string; name: string; description: string; color: string }[];
}

export default function InYourBackyardClient({ events, neighborhoods }: Props) {
  const [activeNeighborhood, setActiveNeighborhood] = useState<string>("all");
  const [showWeekendOnly, setShowWeekendOnly] = useState(false);
  const [activeDay, setActiveDay] = useState<string>("all");

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat

  const filtered = useMemo(() => {
    const todayStr = today.toISOString().split("T")[0];
    let result = events.filter((e) => e.published >= todayStr);

    if (activeNeighborhood !== "all") {
      result = result.filter((e) => e.neighborhood === activeNeighborhood);
    }

    if (showWeekendOnly) {
      result = result.filter((e) => {
        const d = new Date(e.published);
        return d.getDay() === 0 || d.getDay() === 6;
      });
    }

    if (activeDay === "today") {
      result = result.filter((e) => {
        const d = new Date(e.published.split("T")[0]);
        return d.toDateString() === today.toDateString();
      });
    } else if (activeDay === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      result = result.filter((e) => {
        const d = new Date(e.published.split("T")[0]);
        return d.toDateString() === tomorrow.toDateString();
      });
    } else if (activeDay === "weekend") {
      result = result.filter((e) => {
        const d = new Date(e.published);
        return d.getDay() === 0 || d.getDay() === 6;
      });
    }

    return result;
  }, [events, activeNeighborhood, showWeekendOnly, activeDay]);

  // Group by date for "Tonight/Tomorrow" view
  const upcomingDates = useMemo(() => {
    const sorted = [...filtered].sort(
      (a, b) => new Date(a.published).getTime() - new Date(b.published).getTime()
    );
    const seen = new Set<string>();
    const result: { label: string; events: LocalEvent[] }[] = [];

    for (const ev of sorted) {
      const d = new Date(ev.published.split("T")[0]);
      const key = d.toDateString();
      if (!seen.has(key)) {
        seen.add(key);
        const isToday = d.toDateString() === today.toDateString();
        const isTomorrow =
          d.toDateString() ===
          new Date(today.getTime() + 86400000).toDateString();
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;

        let label = formatDate(ev.published);
        if (isToday) label = "Tonight";
        else if (isTomorrow) label = "Tomorrow";
        else if (isWeekend) label = `This Weekend — ${label}`;

        result.push({ label, events: [] });
      }
      result[result.length - 1].events.push(ev);
    }
    return result;
  }, [filtered, today]);

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-tag">🎵 In Your Backyard</div>
        <h1>The local music scene, discovered.</h1>
        <p>
          The bands you haven&apos;t heard yet, playing at bars you already love.
          No arena. No ticket fees. Just live music, steps from your door.
        </p>

        {/* Quick filters */}
        <div className="quick-filters">
          <button
            className={activeDay === "today" ? "active" : ""}
            onClick={() => setActiveDay(activeDay === "today" ? "all" : "today")}
          >
            Tonight
          </button>
          <button
            className={activeDay === "tomorrow" ? "active" : ""}
            onClick={() =>
              setActiveDay(activeDay === "tomorrow" ? "all" : "tomorrow")
            }
          >
            Tomorrow
          </button>
          <button
            className={activeDay === "weekend" ? "active" : ""}
            onClick={() =>
              setActiveDay(activeDay === "weekend" ? "all" : "weekend")
            }
          >
            This Weekend
          </button>
          <button
            className={showWeekendOnly ? "active" : ""}
            onClick={() => setShowWeekendOnly(!showWeekendOnly)}
          >
            🎸 All Shows
          </button>
        </div>
      </section>

      {/* Neighborhood pills */}
      <section className="neighborhood-filter">
        <div className="neighborhood-scroll">
          <button
            className={activeNeighborhood === "all" ? "active" : ""}
            onClick={() => setActiveNeighborhood("all")}
          >
            All Neighborhoods
          </button>
          {neighborhoods.map((n) => (
            <button
              key={n.id}
              className={
                activeNeighborhood === n.id ? "active" : ""
              }
              style={
                activeNeighborhood === n.id
                  ? { borderColor: n.color, color: n.color }
                  : {}
              }
              onClick={() =>
                setActiveNeighborhood(
                  activeNeighborhood === n.id ? "all" : n.id
                )
              }
            >
              {n.name}
            </button>
          ))}
        </div>
      </section>

      {/* Results count */}
      <div className="results-meta">
        <span>
          {filtered.length} show{filtered.length !== 1 ? "s" : ""} found
        </span>
        {activeNeighborhood !== "all" && (
          <span className="active-filter">
            in{" "}
            {neighborhoods.find((n) => n.id === activeNeighborhood)?.name ||
              activeNeighborhood}
          </span>
        )}
      </div>

      {/* Events by date */}
      <div className="events-by-date">
        {upcomingDates.length === 0 && (
          <div className="empty-state">
            <p>
              No shows found
              {activeNeighborhood !== "all"
                ? ` in ${neighborhoods.find((n) => n.id === activeNeighborhood)?.name}`
                : ""}
              .
            </p>
            <p>
              Check back soon — local venues are adding shows every week.
            </p>
          </div>
        )}

        {upcomingDates.map((group) => (
          <div key={group.label} className="date-group">
            <h3 className="date-heading">{group.label}</h3>
            <div className="events-grid">
              {group.events.map((event) => (
                <article key={event.id} className="event-card">
                  {event.image && (
                    <div className="event-image">
                      <img src={event.image} alt={event.title} loading="lazy" />
                    </div>
                  )}
                  <div className="event-content">
                    <div className="event-meta-top">
                      <span className="event-time">
                        {event.time || "8pm"}
                      </span>
                      {event.venueSlug && (
                        <Link
                          href={`/venues/${event.venueSlug}`}
                          className="venue-link"
                        >
                          {event.venue}
                        </Link>
                      )}
                      <span className="event-neighborhood">{event.neighborhoodName}</span>
                    </div>
                    <h3>
                      <a
                        href={event.ticketUrl || event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {event.title}
                      </a>
                    </h3>
                    {event.summary && (
                      <p className="event-summary">
                        {event.summary.slice(0, 100)}
                        {event.summary.length > 100 ? "..." : ""}
                      </p>
                    )}
                    <div className="event-footer">
                      {event.price && (
                        <span className="event-price">{event.price}</span>
                      )}
                      {event.free && <span className="free-badge">Free</span>}
                      <a
                        href={event.ticketUrl || event.url}
                        className="ticket-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Details →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}