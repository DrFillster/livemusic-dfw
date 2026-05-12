#!/usr/bin/env python3
"""
fetch_kessler.py — Fetch Kessler Theater events via Ticketmaster API direct venueId.
Kessler Theater uses Ticketmaster for ticketing.
VenueId: Z7r9jZa6OnkZA (verified via TM venue search)
"""

import json, re, urllib.request, urllib.parse, time
from datetime import datetime, timezone, timedelta

TM_API_KEY = "j9ZGEVBo6kMVnGG8RE2iAPWnkZwEk9l0"
TM_BASE = "https://app.ticketmaster.com/discovery/v2/events.json"

# Kessler Theater venueId from TM geo search
TM_VENUES = {
    "KovZpZAE6F7A": {"name": "The Kessler", "city": "Dallas"},
}


def fetch_tm_venue_events():
    all_events = []
    for vid, vinfo in TM_VENUES.items():
        params = {
            "apikey": TM_API_KEY,
            "venueId": vid,
            "size": 50,
            "includeFamily": "no",
        }
        url = f"{TM_BASE}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers={"User-Agent": "livemusic-dfw/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read())
        except Exception as e:
            print(f"  ✗ TM request failed for {vinfo['name']}: {e}", file=__import__("sys").stderr)
            continue

        events_raw = data.get("_embedded", {}).get("events", [])
        print(f"  ✓ {vinfo['name']}: {len(events_raw)} events")

        for raw in events_raw:
            try:
                eid = raw.get("id", "")
                name = raw.get("name", "")
                if isinstance(name, dict):
                    name = name.get("text", "")

                url = raw.get("url", "")
                desc = ""
                if "description" in raw:
                    d = raw["description"]
                    raw_desc = d.get("text", "") if isinstance(d, dict) else str(d)
                    stripped = re.sub(r"<[^>]+>", " ", raw_desc)
                    stripped = re.sub(r"\s+", " ", stripped).strip()
                    if stripped and len(stripped) <= 500:
                        desc = stripped

                classifications = raw.get("classifications", []) or []
                category = "music"
                for c in classifications:
                    seg = (c.get("segment", {}) or {}).get("name", "").lower()
                    if seg in {"music", "sports", "arts", "theatre", "comedy"} and category == "music":
                        category = seg

                embedded = raw.get("_embedded", {}) or {}
                venues = embedded.get("venues", []) or []
                venue_name, venue_address, city_name = "", "", ""
                if venues:
                    v = venues[0]
                    venue_name = v.get("name", "")
                    addr = v.get("address", {}) or {}
                    street = addr.get("line1", "") or addr.get("line2", "") or ""
                    city_obj = v.get("city", {}) or {}
                    state_obj = v.get("state", {}) or {}
                    country_obj = v.get("country", {}) or {}
                    state_code = state_obj.get("stateCode", "") or ""
                    country_code = country_obj.get("countryCode", "") or ""
                    venue_address = ", ".join(
                        p for p in [street, city_obj.get("name", ""), state_code, country_code] if p
                    )
                    city_name = city_obj.get("name", "") or ""

                images = raw.get("images", []) or []
                image_url = ""
                for img in images:
                    if img.get("width", 0) >= 500 and not image_url:
                        image_url = img.get("url", "")
                        break

                dates = raw.get("dates", {}) or {}
                start = dates.get("start", {}) or {}
                start_iso = start.get("dateTime", "") or start.get("localDate", "")
                m = re.match(r"(\d{4}-\d{2}-\d{2})", start_iso) if start_iso else None
                published = m.group(1) if m else ""

                price_str = ""
                p = raw.get("priceRanges", [])
                if p:
                    price_str = f"${p[0].get('min', 0):.0f}"

                all_events.append(
                    {
                        "id": f"kessler-{eid}",
                        "idType": "event",
                        "title": name[:200],
                        "url": url,
                        "summary": desc[:280] if desc else "",
                        "published": published,
                        "source": "Ticketmaster",
                        "sourceLogo": "TM",
                        "author": venue_name or vinfo["name"],
                        "image": image_url,
                        "authority": 0.75,
                        "category": category,
                        "venue": venue_name or vinfo["name"],
                        "venueAddress": venue_address,
                        "city": city_name,
                        "price": price_str,
                        "ticketUrl": url,
                        "score": 0.0,
                    }
                )
            except Exception as e:
                print(f"  ✗ Failed to parse event: {e}", file=__import__("sys").stderr)

    return all_events


def main():
    today_ct = datetime.now(tz=timezone(timedelta(hours=-6))).date()
    events = fetch_tm_venue_events()

    # Filter past events
    filtered = []
    for e in events:
        if e["published"]:
            try:
                ed = datetime.strptime(e["published"], "%Y-%m-%d").date()
                if ed < today_ct:
                    continue
            except Exception:
                pass
        filtered.append(e)

    # Sort by date
    filtered.sort(
        key=lambda e: datetime.strptime(e["published"], "%Y-%m-%d")
        if e["published"]
        else datetime.max
    )

    output = {
        "generated": datetime.now(tz=timezone(timedelta(hours=-6))).isoformat(),
        "total": len(filtered),
        "events": filtered,
    }

    with open("public/kessler-events.json", "w") as f:
        json.dump(output, f, indent=2)

    print(f"✓ Fetched {len(filtered)} Kessler Theater events → public/kessler-events.json")


if __name__ == "__main__":
    main()