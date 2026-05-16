"use client";

import { useState, useMemo } from "react";
import type { LiveEvent } from "@/lib/events-data";
import { formatDate, timeAgo } from "@/lib/events-data";

interface Props {
  initialEvents: LiveEvent[];
  cities: string[];
}

export default function EventsClient({ initialEvents, cities }: Props) {
  const [city, setCity] = useState("all");

  const filtered = useMemo(() => {
    if (city === "all") return initialEvents;
    return initialEvents.filter((e) => e.city.toLowerCase() === city.toLowerCase());
  }, [initialEvents, city]);

  return (
    <div>
      {/* Controls */}
      <div className="controls">
        <div className="city-filter">
          <label htmlFor="city-select">Filter by city:</label>
          <select
            id="city-select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="all">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <p className="event-count">{filtered.length} live music events</p>
      </div>

      {/* Events Grid */}
      <div className="events-grid">
        {filtered.map((event) => (
          <article key={event.id} className="event-card">
            {event.image && (
              <div className="event-image">
                <img src={event.image} alt={event.title} loading="lazy" />
              </div>
            )}
            <div className="event-content">
              <div className="event-meta-top">
                <span className="event-date">{formatDate(event.published)}</span>
                <span className="event-city">{event.city}</span>
              </div>
              {event.venue && (
                <p className="event-venue-top">{event.venue}</p>
              )}
              <h3>
                <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                  {event.title}
                </a>
              </h3>
              <p className="event-venue">
                <span className="venue-name">{event.venue}</span>
                {event.price && <span className="event-price">{event.price}</span>}
              </p>
              {event.summary && (
                <p className="event-summary">{event.summary.slice(0, 120)}...</p>
              )}
              <a
                href={event.ticketUrl}
                className="ticket-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Tickets →
              </a>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="no-events">No events found for this filter.</p>
      )}
    </div>
  );
}