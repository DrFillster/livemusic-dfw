#!/usr/bin/env python3
"""
scrape_venues.py — Fetch local venue events via camofox browser.
Uses headless Chrome to scrape client-side rendered venue event pages.
"""

import json
import sys
import time
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta

CAMOFOX = "http://localhost:9377"
USER_ID = "livemusic-dfw"
SESSION = "venue-scraper"

VENUES = [
    {
        "id": "the-goat-dallas",
        "name": "The Goat Dallas",
        "url": "https://www.thegoatdallas.com",
        "schedulePage": "https://www.thegoatdallas.com",
        "neighborhood": "deep-ellum",
        "neighborhoodName": "Deep Ellum",
    },
    {
        "id": "lee-harveys",
        "name": "Lee Harvey's",
        "url": "https://www.leeharveysdallas.com",
        "schedulePage": "https://www.leeharveysdallas.com/event-list",
        "neighborhood": "deep-ellum",
        "neighborhoodName": "Deep Ellum",
    },
    {
        "id": "double-wide",
        "name": "Double Wide",
        "url": "https://doublewidedallas.com",
        "schedulePage": "https://doublewidedallas.com/shows",
        "neighborhood": "deep-ellum",
        "neighborhoodName": "Deep Ellum",
    },
    {
        "id": "single-wide",
        "name": "Single Wide",
        "url": "https://singlewidebar.com",
        "schedulePage": "https://singlewidebar.com/shows",
        "neighborhood": "deep-ellum",
        "neighborhoodName": "Deep Ellum",
    },
    {
        "id": "the-foundry-dallas",
        "name": "The Foundry",
        "url": "https://www.facebook.com/TheFoundryDallas",
        "schedulePage": "https://www.facebook.com/TheFoundryDallas/events",
        "neighborhood": "deep-ellum",
        "neighborhoodName": "Deep Ellum",
    },
    {
        "id": "balcony-club",
        "name": "The Balcony Club",
        "url": "https://www.balconyclub.com",
        "schedulePage": "https://www.balconyclub.com/shows-events",
        "neighborhood": "lakewood",
        "neighborhoodName": "Lakewood",
    },
    {
        "id": "truck-yard",
        "name": "Truck Yard Dallas",
        "url": "https://truckyard.com",
        "schedulePage": "https://truckyard.com/events",
        "neighborhood": "lower-greenville",
        "neighborhoodName": "Lower Greenville",
    },
]


def api(method, path, body=None):
    url = f"{CAMOFOX}{path}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    if body:
        req.data = json.dumps(body).encode()
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def create_tab(url):
    result = api("POST", "/tabs", {"userId": USER_ID, "sessionKey": SESSION, "url": url})
    return result.get("tabId")


def get_snapshot(tab_id):
    result = api("GET", f"/tabs/{tab_id}/snapshot?userId={USER_ID}")
    return result.get("snapshot", "")


def close_tab(tab_id):
    try:
        api("DELETE", f"/tabs/{tab_id}?userId={USER_ID}")
    except:
        pass


def parse_goat(snap):
    """Parse The Goat Dallas events from their page."""
    events = []
    lines = snap.split("\n")
    current_event = {}

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Look for article blocks
        if stripped.startswith("- article:"):
            if current_event.get("title"):
                events.append(current_event)
            current_event = {}

        # Links (event titles)
        elif stripped.startswith("- link") and "/" in stripped:
            if "http" in stripped:
                parts = stripped.split("/url: ")
                if len(parts) > 1:
                    url_part = parts[1].strip().split(")")[0].strip()
                    if url_part.startswith("http"):
                        current_event["url"] = url_part

            # Extract title from link text
            if "[e" in stripped:
                start = stripped.find("]") + 1
                end = stripped.find(" [")
                if end > start:
                    title = stripped[start:end].strip()
                    if title and len(title) > 2:
                        current_event["title"] = title

        # Time/date patterns
        if "time:" in stripped.lower():
            date_part = stripped.split("time:")[1].strip()
            if "/" in date_part or "-" in date_part:
                current_event["raw_date"] = date_part
            elif ":" in date_part:
                current_event["time"] = date_part

    if current_event.get("title"):
        events.append(current_event)
    return events


def parse_prekindle(snap):
    """Parse Prekindle-powered venue event pages."""
    events = []
    for block in snap.split("- article:"):
        if not block.strip():
            continue
        lines = block.strip().split("\n")
        ev = {"sourceLogo": "Prekindle"}
        for line in lines:
            stripped = line.strip()
            if stripped.startswith("- link") and "/url:" in stripped:
                url = stripped.split("/url:")[1].split(")")[0].strip()
                if url.startswith("http"):
                    ev["url"] = url
            elif stripped.startswith("- link") and "]" in stripped:
                # Get link text
                title = stripped.split("]")[1].split("[")[0].strip().split(" —")[0].strip()
                if title and len(title) > 3:
                    ev["title"] = title
            if "time:" in stripped.lower():
                parts = stripped.split("time:")[1].strip()
                if "/" in parts or "-" in parts:
                    ev["raw_date"] = parts.split()[0]
                elif ":" in parts:
                    ev["time"] = parts.split()[0]
        if ev.get("title") and ev.get("url"):
            events.append(ev)
    return events


def scrape_venue(venue):
    """Scrape events from a single venue's schedule page."""
    tab_id = create_tab(venue["schedulePage"])
    time.sleep(7)  # Wait for JS rendering
    snap = get_snapshot(tab_id)
    close_tab(tab_id)

    if not snap or len(snap) < 200:
        print(f"  ⚠ Empty snapshot for {venue['name']}")
        return []

    # Detect which scraper to use
    url_lower = venue["schedulePage"].lower()
    if "prekindle" in url_lower:
        events = parse_prekindle(snap)
    elif "facebook" in url_lower:
        # Facebook events need special handling
        events = []
    else:
        events = parse_goat(snap)

    print(f"  ✓ {venue['name']}: {len(events)} events found")
    return events


def main():
    all_events = []
    today_ct = datetime.now(tz=timezone(timedelta(hours=-6))).date()

    print("Scraping local venue events...")
    for venue in VENUES:
        try:
            events = scrape_venue(venue)
            for ev in events:
                ev["venueId"] = venue["id"]
                ev["venue"] = venue["name"]
                ev["venueSlug"] = venue["id"]
                ev["neighborhood"] = venue["neighborhood"]
                ev["neighborhoodName"] = venue["neighborhoodName"]
                ev["source"] = venue["name"]
                ev["sourceLogo"] = "IYB"
                ev["free"] = True  # Local bar shows are typically free
                ev["cover"] = ""
                ev["image"] = ""
                ev["address"] = ""

                # Normalize date
                raw_date = ev.get("raw_date", "")
                if raw_date:
                    ev["published"] = raw_date + "T00:00"
                else:
                    ev["published"] = ""

                ev["id"] = f"{venue['id']}-{ev.get('title','event')[:30]}".replace(" ", "-")

            all_events.extend(events)
        except Exception as e:
            print(f"  ✗ Error scraping {venue['name']}: {e}")

    # Deduplicate by title+date
    seen = set()
    unique = []
    for ev in all_events:
        key = f"{ev.get('title','')}-{ev.get('published','')}"
        if key not in seen:
            seen.add(key)
            unique.append(ev)

    output = {
        "generated": datetime.now(tz=timezone(timedelta(hours=-6))).isoformat(),
        "total": len(unique),
        "events": unique,
    }

    with open("public/local-events.json", "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n✓ Scraped {len(unique)} local venue events → public/local-events.json")


if __name__ == "__main__":
    main()