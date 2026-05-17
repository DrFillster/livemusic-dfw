#!/usr/bin/env python3
"""Build sitemap.xml and generate auto-descriptions for events."""
import json, os

BASE = "https://livemusic.dailydallasnews.com"

# ── Event & venue data (mirrors the JSON files) ─────────────────────────────
local_events = [
    {"id": "the-goat-dallas-texas-slim", "title": "Texas Slim", "venue": "The Goat Dallas", "venueSlug": "the-goat-dallas", "neighborhood": "lakewood", "published": "2026-05-16", "free": True, "time": ""},
    {"id": "the-goat-dallas-delta-blues-guest-edward-desab", "title": "Delta Blues Guest Edward Desabelle", "venue": "The Goat Dallas", "venueSlug": "the-goat-dallas", "neighborhood": "lakewood", "published": "2026-05-19", "free": True, "time": ""},
    {"id": "the-goat-dallas-jason-elmore-and-hoodoo-witch", "title": "Jason Elmore and Hoodoo Witch", "venue": "The Goat Dallas", "venueSlug": "the-goat-dallas", "neighborhood": "lakewood", "published": "2026-05-22", "free": True, "time": ""},
    {"id": "the-goat-dallas-texas-kitchen", "title": "Texas Kitchen", "venue": "The Goat Dallas", "venueSlug": "the-goat-dallas", "neighborhood": "lakewood", "published": "2026-05-23", "free": True, "time": ""},
    {"id": "the-goat-dallas-delta-blues-jam", "title": "Delta Blues Jam", "venue": "The Goat Dallas", "venueSlug": "the-goat-dallas", "neighborhood": "lakewood", "published": "2026-05-29", "free": True, "time": ""},
    {"id": "lee-harveys-open-mic-1", "title": "Open Mic Night", "venue": "Lee Harvey's", "venueSlug": "lee-harveys", "neighborhood": "deep-ellum", "published": "2026-05-16", "free": True, "time": ""},
    {"id": "lee-harveys-local-rock-showcase", "title": "Local Rock Showcase", "venue": "Lee Harvey's", "venueSlug": "lee-harveys", "neighborhood": "deep-ellum", "published": "2026-05-21", "free": True, "time": ""},
    {"id": "lee-harveys-jukebox-jam", "title": "Jukebox Jam", "venue": "Lee Harvey's", "venueSlug": "lee-harveys", "neighborhood": "deep-ellum", "published": "2026-05-23", "free": True, "time": ""},
    {"id": "double-wide-punk-rock-nite", "title": "Punk Rock Nite", "venue": "Double Wide", "venueSlug": "double-wide", "neighborhood": "deep-ellum", "published": "2026-05-15", "free": False, "time": ""},
    {"id": "double-wide-local-rock-battle", "title": "Local Rock Battle", "venue": "Double Wide", "venueSlug": "double-wide", "neighborhood": "deep-ellum", "published": "2026-05-17", "free": False, "time": ""},
    {"id": "granada-theater-the-texas-john-scholars", "title": "The Texas John Scholars", "venue": "Granada Theater", "venueSlug": "granada-theater", "neighborhood": "lower-greenville", "published": "2026-05-18", "free": False, "time": ""},
    {"id": "granada-theater-sold-out-summer-series", "title": "Sold Out Summer Series ft. Midnight River", "venue": "Granada Theater", "venueSlug": "granada-theater", "neighborhood": "lower-greenville", "published": "2026-05-23", "free": False, "time": ""},
    {"id": "granada-theater-billow", "title": "Billow", "venue": "Granada Theater", "venueSlug": "granada-theater", "neighborhood": "lower-greenville", "published": "2026-05-24", "free": False, "time": ""},
    {"id": "kessler-theater-ana", "title": "Ana", "venue": "Kessler Theater", "venueSlug": "kessler-theater", "neighborhood": "bishop-arts", "published": "2026-05-20", "free": False, "time": ""},
    {"id": "kessler-theater-ghost-note", "title": "Ghost Note", "venue": "Kessler Theater", "venueSlug": "kessler-theater", "neighborhood": "bishop-arts", "published": "2026-05-22", "free": False, "time": ""},
    {"id": "balcony-club-jazz-night-1", "title": "Jazz Night with The Dallas Six", "venue": "The Balcony Club", "venueSlug": "balcony-club", "neighborhood": "lakewood", "published": "2026-05-21", "free": False, "time": ""},
    {"id": "balcony-club-jazz-night-2", "title": "Blues & Soul Session", "venue": "The Balcony Club", "venueSlug": "balcony-club", "neighborhood": "lakewood", "published": "2026-05-22", "free": False, "time": ""},
    {"id": "adairs-saloon-honky-tonk-friday", "title": "Honky Tonk Friday", "venue": "Adair's Saloon", "venueSlug": "adairs-saloon", "neighborhood": "deep-ellum", "published": "2026-05-16", "free": True, "time": ""},
    {"id": "adairs-saloon-saturday-country", "title": "Saturday Country Night", "venue": "Adair's Saloon", "venueSlug": "adairs-saloon", "neighborhood": "deep-ellum", "published": "2026-05-17", "free": True, "time": ""},
    {"id": "truck-yard-weekend-music", "title": "Weekend Music on the Patio", "venue": "Truck Yard Dallas", "venueSlug": "truck-yard", "neighborhood": "lower-greenville", "published": "2026-05-16", "free": True, "time": ""},
    {"id": "truck-yard-sunday-funday", "title": "Sunday Funday Live", "venue": "Truck Yard Dallas", "venueSlug": "truck-yard", "neighborhood": "lower-greenville", "published": "2026-05-18", "free": True, "time": ""},
    {"id": "wild-horse-line-dancing", "title": "Line Dancing Night", "venue": "Wild Horse Saloon", "venueSlug": "wild-horse", "neighborhood": "fort-worth", "published": "2026-05-16", "free": False, "time": ""},
    {"id": "wild-horse-country-saturday", "title": "Country Saturday", "venue": "Wild Horse Saloon", "venueSlug": "wild-horse", "neighborhood": "fort-worth", "published": "2026-05-17", "free": False, "time": ""},
]

neighborhoods = [
    {"id": "deep-ellum", "name": "Deep Ellum"},
    {"id": "lower-greenville", "name": "Lower Greenville"},
    {"id": "oak-cliff", "name": "Oak Cliff"},
    {"id": "bishop-arts", "name": "Bishop Arts"},
    {"id": "lakewood", "name": "Lakewood"},
    {"id": "fort-worth", "name": "Fort Worth"},
    {"id": "downtown-dallas", "name": "Downtown Dallas"},
]

venues = [
    {"slug": "the-goat-dallas"}, {"slug": "lee-harveys"}, {"slug": "double-wide"},
    {"slug": "single-wide"}, {"slug": "blue-light"}, {"slug": "the-foundry"},
    {"slug": "balcony-club"}, {"slug": "barley-house"}, {"slug": "lakewood-theater"},
    {"slug": "granada-theater"}, {"slug": "truck-yard"}, {"slug": "curious-mechanic"},
    {"slug": "the-wild-horse"}, {"slug": "lenny-civil"}, {"slug": "madness-at-the-woods"},
    {"slug": "kessler-theater"}, {"slug": "across-the-way"}, {"slug": "adairs-saloon"},
]

venue_descriptions = {
    "the-goat-dallas": "Dallas dive blues bar at its finest. No pretension, no attitude — just cold drinks and live music. The neighborhood's favorite for over 20 years, The Goat hosts acoustic blues, karaoke, and local band showcases throughout the week. Free admission on most nights.",
    "lee-harveys": "The definition of a dive bar done right. Lee Harvey's has been the heart of Dallas's local rock scene for decades — cheap drinks, a legendary jukebox, and open mic nights that have launched more than a few local bands. No frills, no cover, always a good time.",
    "double-wide": "A Deep Ellum institution with a raw edge and even rawer drinks. Double Wide is where punk and rock come to play — local bands most nights, touring acts on weekends. The crowd is eclectic, the energy is high, and the cover is almost always under $10.",
    "granada-theater": "Dallas's best mid-size concert venue. A beautifully restored 1940s theater that consistently books acts way bigger than its 400-person capacity would suggest. Stellar acoustics, a full bar, and an intimate layout means every seat is close to the stage.",
    "kessler-theater": "Oak Cliff's premier live music room. This restored 1940s movie house in the heart of Bishop Arts hosts local and national acts in a space where you can see the performer's eyes. The beating heart of the neighborhood's music scene.",
    "balcony-club": "Dallas's coziest jazz spot tucked into Lakewood. An intimate room that holds maybe 60 people, excellent musicians playing seven nights a week, and BYOB allowed. The Balcony Club is where jazz goes to be serious and the audience goes to listen.",
    "adairs-saloon": "Dallas's enduring honky-tonk since 1963. No frills, no cover, just cold drinks and live country music every weekend. Adair's is the real deal — the kind of place that makes Deep Ellum what it is.",
    "truck-yard": "Food trucks, cold beer, and live music under the Texas sky. Truck Yard is what outdoor bar dreams are made of — rotating truck vendors, picnic tables, and bands that make summer nights in Lower Greenville something to remember.",
    "wild-horse": "Fort Worth's premier country music and line dancing venue in the heart of the Stockyards. A little bit Nashville, right here in DFW. Two-step lessons, live country bands, and a dance floor that fills up fast on weekends.",
    "the-goat-dallas": "Dallas dive blues bar at its finest. No pretension, no attitude — just cold drinks and live music. The neighborhood's favorite for over 20 years.",
}

# ── Generate event descriptions ─────────────────────────────────────────────
def neighborhood_name(nid):
    mapping = {
        "deep-ellum": "Deep Ellum", "lower-greenville": "Lower Greenville",
        "oak-cliff": "Oak Cliff", "bishop-arts": "Bishop Arts",
        "lakewood": "Lakewood", "fort-worth": "Fort Worth", "downtown-dallas": "Downtown Dallas",
    }
    return mapping.get(nid, nid.replace("-", " ").title())

def generate_description(event):
    vd = venue_descriptions.get(event["venueSlug"], f"{event['venue']} is a local venue in the Dallas-Fort Worth area.")
    date = event["published"]
    try:
        dt = __import__("datetime").datetime.strptime(date, "%Y-%m-%d")
        day_name = dt.strftime("%A")
        month_day = dt.strftime("%B %d")
    except Exception:
        day_name = "this week"
        month_day = date

    free_text = "Free admission — no cover" if event.get("free") else "A small cover charge applies"
    templates = [
        f"{event['title']} hits the stage at {event['venue']} in {neighborhood_name(event['neighborhood'])} this {day_name}, {month_day}. {vd} {free_text}. Arrive early to grab a spot near the stage.",
        f"Head to {event['venue']} this {day_name} for {event['title']}. {vd} This is a {'free, no-cover show' if event.get('free') else 'a show with a small cover'} — the kind of local music night that makes DFW's neighborhood bar scene worth exploring.",
    ]
    idx = (ord(event['id'][0]) + ord(event['id'][1])) % len(templates)
    return templates[idx]

# ── Build sitemap.xml ────────────────────────────────────────────────────────
def build_sitemap():
    today = __import__("datetime").datetime.now().strftime("%Y-%m-%d")
    urls = [
        (BASE, "1.0", "daily"),
        (f"{BASE}/in-your-backyard", "0.9", "daily"),
        (f"{BASE}/neighborhoods", "0.8", "weekly"),
        (f"{BASE}/venues", "0.8", "weekly"),
    ]
    for n in neighborhoods:
        urls.append((f"{BASE}/neighborhoods/{n['id']}", "0.7", "weekly"))
    for v in venues:
        urls.append((f"{BASE}/venues/{v['slug']}", "0.7", "weekly"))
    for e in local_events:
        urls.append((f"{BASE}/events/{e['id']}", "0.6", "monthly"))

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, pri, freq in urls:
        lines.append(f'  <url>')
        lines.append(f'    <loc>{url}</loc>')
        lines.append(f'    <lastmod>{today}</lastmod>')
        lines.append(f'    <changefreq>{freq}</changefreq>')
        lines.append(f'    <priority>{pri}</priority>')
        lines.append(f'  </url>')
    lines.append('</urlset>')
    return '\n'.join(lines) + '\n'

# ── Generate updated events JSON ────────────────────────────────────────────
def build_events_json():
    updated = []
    for e in local_events:
        e2 = dict(e)
        e2["description"] = generate_description(e)
        # Ensure other fields present
        e2["url"] = ""
        e2["summary"] = f"{e['title']} at {e['venue']}"
        e2["source"] = e["venue"]
        e2["sourceLogo"] = "IYB"
        e2["address"] = ""
        e2["cover"] = ""
        e2["image"] = ""
        e2["ticketUrl"] = ""
        e2["genres"] = []
        e2["raw_time"] = ""
        if e.get("time"):
            e2["time"] = e["time"]
        updated.append(e2)
    return json.dumps({"generated": __import__("datetime").datetime.now().isoformat(), "total": len(updated), "events": updated}, indent=2)

# ── Write files ──────────────────────────────────────────────────────────────
sitemap = build_sitemap()
sitemap_path = "/Users/philipbernard/livemusic-dfw/src/app/sitemap.ts"
with open(sitemap_path, "w") as f:
    f.write(sitemap)
print(f"✓ sitemap.ts written ({len(sitemap)} bytes)")

events_json = build_events_json()
events_path = "/Users/philipbernard/livemusic-dfw/src/app/data/local-events-generated.json"
with open(events_path, "w") as f:
    f.write(events_json)
print(f"✓ local-events-generated.json written")

# Copy to local-events.json
events_dest = "/Users/philipbernard/livemusic-dfw/src/app/data/local-events.json"
with open(events_dest, "w") as f:
    f.write(events_json)
print(f"✓ local-events.json updated ({len(events_json)} bytes)")