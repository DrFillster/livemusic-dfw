#!/usr/bin/env python3
"""
scrape_venues.py — Fetch local venue events via Camofox stealth browser.
Uses C++ engine-level anti-detection (Camoufox) to scrape client-side
rendered venue event pages without getting blocked.

Usage:
    python3 scripts/scrape_venues.py
"""

import json
import os
import re
import time
import urllib.request
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict

CAMOFOX = "http://localhost:9377"
USER_ID = "livemusic-dfw"

# Per-domain sessions so cookies persist within each venue's domain
_SESSION_KEYS = {}

VENUES = [
    # ── Plain HTML (no JS required) ──
    {
        "id": "the-goat-dallas",
        "name": "The Goat Dallas",
        "url": "https://www.thegoatdallas.com",
        "schedulePage": "https://www.thegoatdallas.com/gigs.html",
        "neighborhood": "lakewood",
        "neighborhoodName": "Lakewood",
        "parser": "goat",
    },
    {
        "id": "balcony-club",
        "name": "The Balcony Club",
        "url": "https://www.balconyclub.com",
        "schedulePage": "https://www.balconyclub.com/shows-events",
        "neighborhood": "lakewood",
        "neighborhoodName": "Lakewood",
        "parser": "balcony",
    },
    # ── Wix-rendered (JS-heavy) ──
    {
        "id": "lee-harveys",
        "name": "Lee Harvey's",
        "url": "https://www.leeharveysdallas.com",
        "schedulePage": "https://www.leeharveysdallas.com/event-list",
        "neighborhood": "deep-ellum",
        "neighborhoodName": "Deep Ellum",
        "parser": "wix",
    },
    # ── Prekindle-powered (JS, stateful — click TEXAS first) ──
    {
        "id": "double-wide",
        "name": "Double Wide",
        "url": "https://doublewidedallas.com",
        "schedulePage": "https://www.prekindle.com/events/thedoublewide",
        "neighborhood": "deep-ellum",
        "neighborhoodName": "Deep Ellum",
        "parser": "prekindle",
    },
    # ── Site dead / no events page ──
    {
        "id": "truck-yard",
        "name": "Truck Yard Dallas",
        "url": "https://truckyard.com",
        "schedulePage": "https://truckyard.com/events",
        "neighborhood": "lower-greenville",
        "neighborhoodName": "Lower Greenville",
        "parser": "gone",
    },
    {
        "id": "single-wide",
        "name": "Single Wide",
        "url": "https://singlewidebar.com",
        "schedulePage": "https://singlewidebar.com/events-2/",
        "neighborhood": "lower-greenville",
        "neighborhoodName": "Lower Greenville",
        "parser": "gone",
    },
]


# ─── Camofox REST API helpers ───────────────────────────────────────────────

def _session_key_for(url: str) -> str:
    from urllib.parse import urlparse
    domain = urlparse(url).netloc.replace(".", "-")
    if domain not in _SESSION_KEYS:
        _SESSION_KEYS[domain] = f"dfw-{domain}"
    return _SESSION_KEYS[domain]


def _api(method: str, path: str, body=None, retries: int = 4) -> dict:
    url = f"{CAMOFOX}{path}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    if body:
        req.data = json.dumps(body).encode()
    last_err = None
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            last_err = e
            if e.code == 429 and attempt < retries:
                wait = 10 * (attempt + 1)  # 10, 20, 30, 40s
                time.sleep(wait)
                continue
            raise
        except Exception as e:
            last_err = e
            if attempt < retries:
                time.sleep(5 * (attempt + 1))
                continue
            raise
    raise last_err


def create_tab(url: str, session_key: str) -> str:
    result = _api("POST", "/tabs", {
        "userId": USER_ID,
        "sessionKey": session_key,
        "url": url,
    })
    return result.get("tabId")


def get_snapshot(tab_id: str, offset: int = 0) -> str:
    result = _api("GET",
                  f"/tabs/{tab_id}/snapshot?userId={USER_ID}&offset={offset}")
    return result.get("snapshot", "")


def act_click(tab_id: str, ref: str) -> bool:
    try:
        r = _api("POST", f"/tabs/{tab_id}/act", {
            "userId": USER_ID,
            "ref": ref,
            "action": "click",
        })
        return r.get("ok", False)
    except Exception:
        return False


def close_tab(tab_id: str):
    try:
        _api("DELETE", f"/tabs/{tab_id}?userId={USER_ID}")
    except Exception:
        pass


# ─── Parsers ────────────────────────────────────────────────────────────────

def parse_goat(snap: str) -> list[dict]:
    """
    The Goat Dallas: Camofox accessibility snapshot of a plain HTML table.

    Band rows look like (indented, quoted):
      - 'row "Fr 05/22 : Jason Elmore and Hoodoo Witch"':
        - cell "Fr"
        - cell "05/22"
        - cell ":"
        - cell "Jason Elmore and Hoodoo Witch"

    Note: the entire row text including day/date/band is inside the quoted
    string that starts the row — pattern matches the leading 'row "..."'
    line only.
    """
    events = []
    # Match the leading 'row "..."' line; the day/date/band are inside quotes
    rows = re.findall(
        r"^\s*-\s+'row\s+\"(\w{2})\s+(\d{2}/\d{2})\s+:\s+([^\"]+)\"",
        snap, re.MULTILINE
    )
    for day, date_str, band in rows:
        band = band.strip()
        if not band or len(band) < 2:
            continue
        events.append({"raw_date": date_str, "title": band, "raw_time": ""})
    return events


def parse_wix(snap: str) -> list[dict]:
    """
    Lee Harvey's: Wix-rendered event list.

    Real accessibility-tree format (multi-line):
      - link "BandName" [eN]:
        - /url: https://.../event-details/...
      - text: Sat, May 16 Lee Harvey's

    We scan line-by-line and pair band-name links with the date text
    that follows them (same listitem, ~5 lines later).
    """
    events = []
    lines = snap.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        m = re.search(r'link "([^"]+)" \[e(\d+)\]:', line)
        if m:
            title = m.group(1).strip()
            # Verify the URL on the next line leads to event-details
            if i + 1 < len(lines) and "event-details" in lines[i + 1]:
                # Scan forward for date text (within same listitem block)
                for j in range(i + 1, min(i + 6, len(lines))):
                    next_line = lines[j].strip()
                    dm = re.search(
                        r'(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+'
                        r'([A-Z][a-z]+ \d{1,2})',
                        next_line, re.IGNORECASE
                    )
                    if dm:
                        events.append({
                            "title": title,
                            "raw_date": dm.group(2),
                            "raw_time": "",
                        })
                        break
        i += 1
    return events


def parse_balcony(snap: str) -> list[dict]:
    """
    The Balcony Club: plain HTML, multi-night calendar.

    Real accessibility-tree format (each listitem = one event entry):
      - paragraph: Tuesday, May 12 - 8:00 PM - 12:00 AM
      - paragraph: Balcony's Blues Jam with Junior Clark & Nick Snyder
      - paragraph: (Three Generations of Blues)
      - paragraph: The Balcony Club (map)
      - paragraph: 1825 Abrams Road
      - paragraph: Dallas TX 75214
      ...

    Strategy: scan for date anchor lines, then grab the first paragraph
    that looks like a show title (skip time/detail sub-lines like "6:30 PM:...").
    """
    events = []

    # Lines: "      - paragraph: Tuesday, May 12 - 8:00 PM - 12:00 AM"
    # Critical: use literal space before digit `\s+[0-9]+` not `\s+\d{1,2}\s+`
    # because greedy \s+ matches the leading spaces first when comma is optional
    date_pat = re.compile(
        r'paragraph:\s+((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+'
        r'[A-Z][a-z]+ [0-9]+)\s+-\s+\d{1,2}:\d{2}\s*[AP]M',
        re.IGNORECASE
    )
    # Sub-event time lines like paragraph: "6:30 PM: Open Mic Signup"
    sub_time_pat = re.compile(r'^paragraph:\s+"\d{1,2}:\d{2}\s*[AP]M:', re.IGNORECASE)

    lines = snap.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        m = date_pat.search(line)
        if m:
            # Grab the date portion (group 1 — the only capture group)
            raw_date = m.group(1).strip()
            # The next non-empty line is the show title
            title = ""
            for j in range(i + 1, min(i + 10, len(lines))):
                raw_line = lines[j].strip()
                # Accessibility tree lines: "  - \"- paragraph: Title" or "      - paragraph: Title"
                # Strip leading whitespace first, then strip leading "- chars, then strip remaining quotes
                next_line = raw_line.lstrip().lstrip('"').lstrip('-').strip()
                if not next_line:
                    continue
                # Skip sub-event times (e.g. "6:30 PM: Open Mic Signup")
                if sub_time_pat.match(next_line):
                    continue
                # Skip metadata paragraphs
                skip_prefixes = [
                    "paragraph: (", "paragraph: Age", "paragraph: 18",
                    "paragraph: 21", "paragraph: Entry", "paragraph: The Balcony Club",
                    "paragraph: Dallas", "paragraph: 1825", "paragraph: map",
                    "paragraph: img", "paragraph: link", "paragraph: - ",
                    "paragraph: $", "paragraph: *", "paragraph: cover",
                ]
                if any(next_line.lower().startswith(p) for p in skip_prefixes):
                    continue
                # Skip lines that are just times or sub-event lines
                if re.match(r'^paragraph:\s+"\d{1,2}:\d{2}\s*[AP]M', next_line, re.IGNORECASE):
                    continue
                # The title paragraph starts with "paragraph: Title"
                m2 = re.match(r'^paragraph:\s+(.+)', next_line)
                if m2:
                    title = m2.group(1).strip()
                    # Remove any parenthetical genre like "(Blues)"
                    title = re.sub(r'\s*\([^)]*\)\s*$', '', title).strip()
                    break
                break  # some other content, stop scanning
            if title and len(title) > 2:
                events.append({"title": title, "raw_date": raw_date, "raw_time": ""})
        i += 1
    return events


def parse_prekindle(snap: str) -> list[dict]:
    """
    Prekindle table (after clicking TEXAS).

    Table rows look like:
      'row "Sat 16 MAY 9:00pm The Double Wide - Dallas TX ... Band Name TICKETS"':
        cell "Sat 16 MAY"
        cell "9:00pm"
        ...

    The full row text is in the leading quoted line.
    """
    events = []
    # Extract the row "..." line for each table row
    row_lines = re.findall(
        r"^\s*-\s+'row\s+\"(.+?)\"\s*:'",
        snap, re.MULTILINE
    )
    for row_text in row_lines:
        # Skip header rows
        if row_text.startswith("Upcoming") or row_text.startswith("The ") \
           or not any(c.isdigit() for c in row_text):
            continue

        # Pattern: Day DD MON time Venue ... Title
        # e.g. "Sat 16 MAY 9:00pm The Double Wide - Dallas TX John Falvo & ..."
        m = re.match(
            r"((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\s+[A-Z]{3})"
            r"\s+(\d{1,2}:\d{2}[ap]m)"
            r"\s+[^\s]+\s+[^\s]+\s+[^\s]+\s+[^\s]+\s+"
            r"(.+)",
            row_text, re.IGNORECASE
        )
        if m:
            date_str, time_str, tail = m.groups()
            # Title ends at TICKETS / RSVP / TICKET / etc.
            title = re.split(r"\s+(?:TICKETS?\.?|RSVP\.?)\s*$",
                             tail, flags=re.IGNORECASE)[0].strip()
            if len(title) > 1:
                events.append({
                    "title": title,
                    "raw_date": date_str,
                    "raw_time": time_str,
                })
    return events


# ─── Per-venue scraper ──────────────────────────────────────────────────────

def _list_tabs() -> list[dict]:
    """Get list of open tabs for USER_ID."""
    try:
        result = _api("GET", f"/tabs?userId={USER_ID}")
        return result.get("tabs", [])
    except Exception:
        return []


def _find_tab(url: str) -> Optional[str]:
    """Find an existing tab for USER_ID whose URL contains the same domain as url."""
    from urllib.parse import urlparse
    domain = urlparse(url).netloc
    tabs = _list_tabs()
    for tab in tabs:
        tab_url = tab.get("url", "")
        if domain in tab_url:
            return tab.get("tabId")
    return None


def scrape_venue(venue: dict) -> list[dict]:
    """
    Scrape raw events from one venue's schedule page.

    Strategy: reuse an existing tab on the same domain by calling get_snapshot
    directly (no PATCH navigate needed). Each venue's tab already has the
    correct page loaded — just fetch its snapshot.
    """
    parser = venue.get("parser", "goat")
    if parser == "gone":
        return []

    url = venue["schedulePage"]
    tab_id = None

    # Find existing tab on same domain (tab already has correct page loaded)
    tab_id = _find_tab(url)
    if tab_id:
        print(f"  → Reusing tab {tab_id[:12]} for {venue['name']}")
    else:
        print(f"  → No existing tab for {venue['name']} — creating new tab")
        tab_id = create_tab(url, _session_key_for(url))
        time.sleep(10)  # Wait for new tab to fully load

    snap = get_snapshot(tab_id)

    # Only close the tab if we created it ourselves (don't close shared tabs)
    if tab_id and not _find_tab(url) == tab_id:
        close_tab(tab_id)

    if not snap or len(snap) < 200:
        print(f"  ⚠ Empty snapshot for {venue['name']}")
        return []

    if parser == "goat":
        raw = parse_goat(snap)
    elif parser == "wix":
        raw = parse_wix(snap)
    elif parser == "balcony":
        raw = parse_balcony(snap)
    elif parser == "prekindle":
        raw = parse_prekindle(snap)
    else:
        raw = []

    print(f"  ✓ {venue['name']}: {len(raw)} raw entries")
    return raw


def normalize_date(raw_date: str, year: int = None) -> str:
    """Convert various date formats to YYYY-MM-DD."""
    if not year:
        year = datetime.now().year
    # "05/01" format
    m = re.match(r"(\d{2})/(\d{2})", raw_date)
    if m:
        return f"{year}-{m.group(1)}-{m.group(2)}"
    # "May 16" or "May 16, 2026"
    for fmt in ("%b %d", "%b %d, %Y", "%B %d", "%B %d, %Y"):
        try:
            dt = datetime.strptime(raw_date.strip(), fmt)
            return dt.replace(year=year).strftime("%Y-%m-%d")
        except ValueError:
            pass
    # "Sat 16 MAY" (Prekindle)
    m = re.match(
        r"(\w{3})\s+(\d{1,2})\s+([A-Z]{3})",
        raw_date, re.IGNORECASE
    )
    if m:
        day_abbr, dd, mon_abbr = m.groups()
        mon_num = {
            "JAN": "01", "FEB": "02", "MAR": "03", "APR": "04",
            "MAY": "05", "JUN": "06", "JUL": "07", "AUG": "08",
            "SEP": "09", "OCT": "10", "NOV": "11", "DEC": "12",
        }.get(mon_abbr.upper())
        if mon_num:
            return f"{year}-{mon_num}-{int(dd):02d}"
    return ""


def main():
    all_events = []
    today_ct = datetime.now(tz=timezone(timedelta(hours=-6))).date()
    this_year = today_ct.year

    print("Scraping local venue events with Camofox (anti-detect)...")
    for venue in VENUES:
        try:
            raw = scrape_venue(venue)
            for ev in raw:
                title = ev.get("title", "").strip()
                if not title:
                    continue
                raw_date = ev.get("raw_date", "")
                pub_date = normalize_date(raw_date, this_year)

                # Skip past events
                if pub_date:
                    try:
                        event_dt = datetime.strptime(pub_date, "%Y-%m-%d").date()
                        if event_dt < today_ct:
                            continue
                    except ValueError:
                        pass

                event = {
                    "id": f"{venue['id']}-{title[:30]}".replace(" ", "-").lower(),
                    "title": title,
                    "url": "",
                    "summary": f"{title} at {venue['name']}",
                    "published": pub_date + "T00:00" if pub_date else "",
                    "time": ev.get("raw_time", ""),
                    "source": venue["name"],
                    "sourceLogo": "IYB",
                    "venue": venue["name"],
                    "venueSlug": venue["id"],
                    "neighborhood": venue["neighborhood"],
                    "neighborhoodName": venue["neighborhoodName"],
                    "address": "",
                    "price": "",
                    "free": True,
                    "cover": "",
                    "image": "",
                    "ticketUrl": "",
                    "genres": [],
                    "description": "",
                    "raw_time": ev.get("raw_time", ""),
                }
                all_events.append(event)

            # Rate-limit: pause between venues to avoid 429
            time.sleep(3)

        except Exception as e:
            print(f"  ✗ Error scraping {venue['name']}: {e}")

    # Deduplicate by title+date
    seen = set()
    unique = []
    for ev in all_events:
        key = f"{ev.get('title', '')}-{ev.get('published', '')}"
        if key not in seen:
            seen.add(key)
            unique.append(ev)

    output = {
        "generated": datetime.now(tz=timezone(timedelta(hours=-6))).isoformat(),
        "total": len(unique),
        "events": unique,
    }

    out_path = "src/app/data/local-events.json"
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n✓ Scraped {len(unique)} local venue events → {out_path}")


if __name__ == "__main__":
    main()