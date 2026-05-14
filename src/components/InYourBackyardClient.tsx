"use client";

import { useState, useMemo } from "react";
import type { LocalEvent } from "@/lib/events-data";
import { formatDate } from "@/lib/events-data";
import Link from "next/link";

interface Props {
  events: (LocalEvent | Record<string, unknown>)[];
  neighborhoods: { id: string; name: string; description: string; color: string }[];
}

export default function InYourBackyardClient({ events, neighborhoods }: Props) {
  const [activeNeighborhood, setActiveNeighborhood] = useState<string>("all");
  const [showWeekendOnly, setShowWeekendOnly] = useState(false);
  const [activeDay, setActiveDay] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat

  const filtered = useMemo(() => {
    const todayStr = today.toISOString().split("T")[0];
    let result = (events as Record<string, unknown>[]).filter((e) => String(e.published ?? "") >= todayStr);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          String(e.title ?? "").toLowerCase().includes(q) ||
          String(e.venue ?? "").toLowerCase().includes(q) ||
          String(e.summary ?? "").toLowerCase().includes(q) ||
          String(e.neighborhood ?? "").toLowerCase().includes(q)
      );
    }

    if (activeNeighborhood !== "all") {
      result = result.filter((e) => String(e.neighborhood ?? "") === activeNeighborhood);
    }

    if (showWeekendOnly) {
      result = result.filter((e) => {
        const d = new Date(String(e.published ?? ""));
        return d.getDay() === 0 || d.getDay() === 6;
      });
    }

    if (activeDay === "today") {
      result = result.filter((e) => {
        const d = new Date(String(e.published ?? "").split("T")[0]);
        return d.toDateString() === today.toDateString();
      });
    } else if (activeDay === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      result = result.filter((e) => {
        const d = new Date(String(e.published ?? "").split("T")[0]);
        return d.toDateString() === tomorrow.toDateString();
      });
    } else if (activeDay === "weekend") {
      result = result.filter((e) => {
        const d = new Date(String(e.published ?? ""));
        return d.getDay() === 0 || d.getDay() === 6;
      });
    }

    return result as (LocalEvent | Record<string, unknown>)[];
  }, [events, activeNeighborhood, showWeekendOnly, activeDay, searchQuery, today]);

  // Group by date for "Tonight/Tomorrow" view
  const upcomingDates = useMemo(() => {
    const sorted = [...filtered].sort(
      (a, b) => new Date(String(a.published)).getTime() - new Date(String(b.published)).getTime()
    );
    const seen = new Set<string>();
    const result: { label: string; events: (LocalEvent | Record<string, unknown>)[] }[] = [];

    for (const ev of sorted) {
      const d = new Date(String(ev.published).split("T")[0]);
      const key = d.toDateString();
      if (!seen.has(key)) {
        seen.add(key);
        const isToday = d.toDateString() === today.toDateString();
        const isTomorrow =
          d.toDateString() ===
          new Date(today.getTime() + 86400000).toDateString();
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;

        let label = formatDate(String(ev.published));
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

        {/* Search */}
        <div className="search-wrapper">
          <input
            type="search"
            placeholder="Search bands, venues, or neighborhoods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search events"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="search-clear"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

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
              {group.events.map((event) => {
                const e = event as Record<string, unknown>;
                return (
                <article key={String(e.id ?? "")} className="event-card">
                  {typeof e.image === 'string' && e.image ? (
                    <div className="event-image">
                      <img src={String(e.image)} alt={String(e.title ?? "")} loading="lazy" />
                    </div>
                  ) : null}
                  <div className="event-content">
                    <div className="event-meta-top">
                      <span className="event-time">
                        {String(e.time ?? "8pm")}
                      </span>
                      {typeof e.venueSlug === 'string' && e.venueSlug ? (
                        <Link
                          href={`/venues/${String(e.venueSlug)}`}
                          className="venue-link"
                        >
                          {String(e.venue ?? "")}
                        </Link>
                      ) : null}
                      <span className="event-neighborhood">{String(e.neighborhoodName ?? "")}</span>
                    </div>
                    <h3>
                      <Link href={`/events/${encodeURIComponent(String(e.id ?? ""))}`}>
                        {String(e.title ?? "")}
                      </Link>
                    </h3>
                    {typeof e.summary === 'string' && e.summary ? (
                      <p className="event-summary">
                        {String(e.summary).slice(0, 100)}
                        {String(e.summary).length > 100 ? "..." : ""}
                      </p>
                    ) : null}
                    <div className="event-footer">
                      {typeof e.price === 'string' && e.price ? (
                        <span className="event-price">{String(e.price)}</span>
                      ) : null}
                      {typeof e.free === 'boolean' && e.free ? <span className="free-badge">Free</span> : null}
                      <Link
                        href={`/events/${encodeURIComponent(String(e.id ?? ""))}`}
                        className="ticket-btn"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}