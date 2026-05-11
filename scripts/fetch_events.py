#!/usr/bin/env python3
"""
Standalone events fetcher for livemusic-dfw.
Pulls music events from Ticketmaster and writes to public/events.json.
Can be run as a standalone script or cron job.
"""

import json
import urllib.request
import urllib.parse
import time
from datetime import datetime, timezone, timedelta

# Ticketmaster API - using the same credentials as the main DFW pipeline
TM_API_KEY = "j9ZGEVBo6kMVnGG8RE2iAPWnkZwEk9l0"

TM_BASE = "https://app.ticketmaster.com/discovery/v2/events.json"
DFW_LAT, DFW_LON = 32.7767, -96.7970
CLASSIFICATION_MUSIC = "KZFzniwnSyZfZ7v7n1"  # Music segment

BLOCKLIST_KEYWORDS = [
    "wine tasting", "wine dinner", "paint and sip", "paint night",
    "trivia night", "karaoke", "open mic", "comedy night",
    "brunch", "bottomless", "bar crawl", "pub crawl",
    "single mingle", "singles", "speed dating", "meetup",
    "webinar", "zoom", "online event", "virtual event",
    "private event", "club meeting", "business meeting",
    "walmart", "target", "costco", "food lion",
    "church service", "bible study", "sunday school",
    "mass", "worship", "yoga", "fitness class",
    "farmers market", "market day",
]

ALLOWLIST_VENUES = [
    "american airlines center", "toyota center", "kia forum",
    "bass hall", "winspear", "meyerson", "dealy", "edward",
    "att pac", "at&t pac", "winspear opera house",
    "meyerson symphony", "nasher sculpture", "dma",
    "dallas museum of art", "kimbell", "modern art museum",
    "perot museum", "heard museum", "crow museum",
    "glass house", "house of blues", "granada",
    "majestic theatre", "majestic", "fair park", "cotton bowl",
    "texas motor speedway", "charlotte boxing", "american airlines",
    "kessler", "south side ballroom", "south side",
    "dallas arena", "frisco star", "comerica",
    "leviathan", "pier", "reef", "bomb factory",
    "studio at the ranch", "lakeshore", "vitruvian",
]


def fetch_tm_page(lat, lon, page=0, size=200):
    """Fetch one page of music events from Ticketmaster."""
    params = {
        "apikey": TM_API_KEY,
        "latlong": f"{lat},{lon}",
        "radius": 50,
        "unit": "miles",
        "segmentId": CLASSIFICATION_MUSIC,
        "size": size,
        "page": page,
        "sort": "date,asc",
    }
    url = f"{TM_BASE}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"TM API error page {page}: {e}", file=__import__('sys').stderr)
        return {"_error": str(e)}


def is_blocklisted(event):
    text = f"{event.get('name', '')} {event.get('description', '')}".lower()
    return any(kw in text for kw in BLOCKLIST_KEYWORDS)


def score_event(event, today_ct):
    """Score an event. Returns 0 if should be filtered."""
    venue_name = ""
    if event.get("_embedded"):
        venues = event["_embedded"].get("venues", [])
        if venues:
            venue_name = venues[0].get("name", "").lower()

    is_quality = any(v in venue_name for v in ALLOWLIST_VENUES)
    authority = 0.8 if is_quality else 0.3

    pub_date = event.get("dates", {}).get("start", {}).get("localDate", "")
    try:
        event_dt = datetime.strptime(pub_date, "%Y-%m-%d").date()
        if event_dt < today_ct:
            return 0.0
        days_until = (event_dt - today_ct).days
        recency = 1.0 if days_until <= 7 else 0.7
    except:
        recency = 0.5

    text = f"{event.get('name', '')} {event.get('description', '')}".lower()
    quality_kw = [
        "concert", "festival", "tour", "live music", "headliner",
        "showcase", "performance", "show", "artist", "band",
        "premiere", "exhibit", "opening", "symphony", "orchestra",
        "ballet", "opera", "national", "exposition", "awards",
        "gala", "recital", "studio",
    ]
    kw_score = min(1.0, sum(1 for kw in quality_kw if kw in text) / 3)

    return round(0.25 * recency + 0.35 * authority + 0.40 * kw_score, 4)


def fetch_all():
    """Fetch all music event pages from Ticketmaster."""
    all_events = []
    page = 0
    seen_ids = set()

    while True:
        data = fetch_tm_page(DFW_LAT, DFW_LON, page=page)
        if "_error" in data:
            break

        embedded = data.get("_embedded", {}).get("events", [])
        if not embedded:
            break

        for event in embedded:
            eid = event.get("id", "")
            if eid and eid not in seen_ids:
                seen_ids.add(eid)
                all_events.append(event)

        total_pages = data.get("page", {}).get("totalPages", 0)
        if page >= total_pages - 1:
            break

        page += 1
        time.sleep(0.25)

    return all_events


def normalize_event(event, score):
    """Convert Ticketmaster event to our normalized schema."""
    emb = event.get("_embedded", {})
    venues = emb.get("venues", [])
    venue = venues[0] if venues else {}
    images = event.get("images", [])
    img = next((i["url"] for i in images if i.get("width", 0) >= 500), "")

    pub_date = event.get("dates", {}).get("start", {}).get("localDate", "")
    if pub_date:
        # Append T00:00 for consistent date handling
        pub_date = pub_date + "T00:00"

    price = ""
    p = event.get("priceRanges", [])
    if p:
        price = f"${p[0].get('min', 0):.0f}"

    return {
        "id": event.get("id", ""),
        "idType": "event",
        "title": event.get("name", ""),
        "url": event.get("url", ""),
        "summary": event.get("description", "")[:280] if event.get("description") else "",
        "published": event.get("dates", {}).get("start", {}).get("localDate", ""),
        "source": "Ticketmaster",
        "sourceLogo": "TM",
        "author": venue.get("name", ""),
        "image": img,
        "authority": 0.6,
        "category": "music",
        "venue": venue.get("name", ""),
        "venueAddress": venue.get("address", {}).get("line1", ""),
        "city": venue.get("city", {}).get("name", ""),
        "price": price,
        "ticketUrl": event.get("url", ""),
        "score": score,
    }


def main():
    today_ct = datetime.now(tz=timezone(timedelta(hours=-6))).date()
    raw_events = fetch_all()

    scored = []
    for event in raw_events:
        if is_blocklisted(event):
            continue
        score = score_event(event, today_ct)
        if score > 0:
            scored.append(normalize_event(event, score))

    # Sort by date ASC, then score DESC
    scored.sort(key=lambda e: (
        datetime.strptime(e["published"], "%Y-%m-%d") if e["published"] else datetime.max,
        -e["score"]
    ))

    output = {
        "ok": True,
        "generated": datetime.now(tz=timezone(timedelta(hours=-6))).isoformat(),
        "total": len(scored),
        "events": scored,
    }

    with open("public/events.json", "w") as f:
        json.dump(output, f, indent=2)

    print(f"Fetched {len(scored)} music events → public/events.json")


if __name__ == "__main__":
    main()