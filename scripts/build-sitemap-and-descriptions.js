#!/usr/bin/env node
/**
 * Build sitemap.xml and generate auto-descriptions for events.
 */
import { writeFileSync } from "fs";

const BASE = "https://livemusic.dailydallasnews.com";

// ── Venue & event data (mirrors the JSON files) ─────────────────────────────
const neighborhoods = [
  { id: "deep-ellum", name: "Deep Ellum", description: "Dallas's creative hub — murals, dive bars, and the best punk and indie scene in DFW." },
  { id: "lower-greenville", name: "Lower Greenville", description: "A diverse strip of bars and restaurants with something for every taste." },
  { id: "oak-cliff", name: "Oak Cliff", description: "Bishop Arts, the Kessler, and a growing scene of local neighborhood spots." },
  { id: "bishop-arts", name: "Bishop Arts", description: "Bishop Arts is Oak Cliff's heart — boutique shops, wine bars, and intimate live music rooms. The neighborhood has become Dallas's most walkable commercial strip, drawing a crowd that wants craft cocktails, local art, and live music without the downtown scene." },
  { id: "lakewood", name: "Lakewood", description: "East Dallas residential with a handful of legendary local bars and the Balcony Club." },
  { id: "fort-worth", name: "Fort Worth", description: "From the Stockyards to downtown — honky-tonk, blues, and Texas music roots." },
  { id: "downtown-dallas", name: "Downtown Dallas", description: "Arts District, Main Street, and the Bryan Pkwy corridor." },
];

const venues = [
  { slug: "the-goat-dallas", name: "The Goat Dallas", neighborhood: "lakewood", type: "Dive Bar" },
  { slug: "lee-harveys", name: "Lee Harvey's", neighborhood: "deep-ellum", type: "Dive Bar" },
  { slug: "double-wide", name: "Double Wide", neighborhood: "deep-ellum", type: "Dive Bar" },
  { slug: "single-wide", name: "Single Wide", neighborhood: "lower-greenville", type: "Dive Bar" },
  { slug: "blue-light", name: "The Blue Light", neighborhood: "deep-ellum", type: "Bar" },
  { slug: "the-foundry", name: "The Foundry", neighborhood: "deep-ellum", type: "Patio Bar" },
  { slug: "balcony-club", name: "The Balcony Club", neighborhood: "lakewood", type: "Jazz Club" },
  { slug: "barley-house", name: "The Barley House", neighborhood: "lakewood", type: "Restaurant & Bar" },
  { slug: "lakewood-theater", name: "Bowlski's / Lakewood Theater", neighborhood: "lakewood", type: "Music Venue / Bowling" },
  { slug: "granada-theater", name: "Granada Theater", neighborhood: "lower-greenville", type: "Live Music Venue / Theater" },
  { slug: "truck-yard", name: "Truck Yard Dallas", neighborhood: "lower-greenville", type: "Outdoor Bar" },
  { slug: "curious-mechanic", name: "Curious Mechanic", neighborhood: "bishop-arts", type: "Bar / Coffee" },
  { slug: "the-wild-horse", name: "Wild Horse Saloon", neighborhood: "fort-worth", type: "Honky Tonk" },
  { slug: "lenny-civil", name: "Lenny C's", neighborhood: "fort-worth", type: "BBQ & Bar" },
  { slug: "madness-at-the-woods", name: "Madness at the Woods", neighborhood: "fort-worth", type: "Music Venue" },
  { slug: "kessler-theater", name: "Kessler Theater", neighborhood: "bishop-arts", type: "Live Music Venue" },
  { slug: "across-the-way", name: "Across the Way", neighborhood: "oak-cliff", type: "Bar" },
  { slug: "adairs-saloon", name: "Adair's Saloon", neighborhood: "deep-ellum", type: "Honky Tonk" },
];

// All local events
const localEvents = [
  { id: "the-goat-dallas-texas-slim", title: "Texas Slim", venue: "The Goat Dallas", venueSlug: "the-goat-dallas", neighborhood: "lakewood", published: "2026-05-16", description: "" },
  { id: "the-goat-dallas-delta-blues-guest-edward-desab", title: "Delta Blues Guest Edward Desabelle", venue: "The Goat Dallas", venueSlug: "the-goat-dallas", neighborhood: "lakewood", published: "2026-05-19", description: "" },
  { id: "the-goat-dallas-jason-elmore-and-hoodoo-witch", title: "Jason Elmore and Hoodoo Witch", venue: "The Goat Dallas", venueSlug: "the-goat-dallas", neighborhood: "lakewood", published: "2026-05-22", description: "" },
  { id: "the-goat-dallas-texas-kitchen", title: "Texas Kitchen", venue: "The Goat Dallas", venueSlug: "the-goat-dallas", neighborhood: "lakewood", published: "2026-05-23", description: "" },
  { id: "the-goat-dallas-delta-blues-jam", title: "Delta Blues Jam", venue: "The Goat Dallas", venueSlug: "the-goat-dallas", neighborhood: "lakewood", published: "2026-05-29", description: "" },
  { id: "lee-harveys-open-mic-1", title: "Open Mic Night", venue: "Lee Harvey's", venueSlug: "lee-harveys", neighborhood: "deep-ellum", published: "2026-05-16", description: "" },
  { id: "lee-harveys-local-rock-showcase", title: "Local Rock Showcase", venue: "Lee Harvey's", venueSlug: "lee-harveys", neighborhood: "deep-ellum", published: "2026-05-21", description: "" },
  { id: "lee-harveys-jukebox-jam", title: "Jukebox Jam", venue: "Lee Harvey's", venueSlug: "lee-harveys", neighborhood: "deep-ellum", published: "2026-05-23", description: "" },
  { id: "double-wide-punk-rock-nite", title: "Punk Rock Nite", venue: "Double Wide", venueSlug: "double-wide", neighborhood: "deep-ellum", published: "2026-05-15", description: "" },
  { id: "double-wide-local-rock-battle", title: "Local Rock Battle", venue: "Double Wide", venueSlug: "double-wide", neighborhood: "deep-ellum", published: "2026-05-17", description: "" },
  { id: "granada-theater-the-texas-john-scholars", title: "The Texas John Scholars", venue: "Granada Theater", venueSlug: "granada-theater", neighborhood: "lower-greenville", published: "2026-05-18", description: "" },
  { id: "granada-theater-sold-out-summer-series", title: "Sold Out Summer Series ft. Midnight River", venue: "Granada Theater", venueSlug: "granada-theater", neighborhood: "lower-greenville", published: "2026-05-23", description: "" },
  { id: "granada-theater-billow", title: "Billow", venue: "Granada Theater", venueSlug: "granada-theater", neighborhood: "lower-greenville", published: "2026-05-24", description: "" },
  { id: "kessler-theater-ana", title: "Ana", venue: "Kessler Theater", venueSlug: "kessler-theater", neighborhood: "bishop-arts", published: "2026-05-20", description: "" },
  { id: "kessler-theater-ghost-note", title: "Ghost Note", venue: "Kessler Theater", venueSlug: "kessler-theater", neighborhood: "bishop-arts", published: "2026-05-22", description: "" },
  { id: "balcony-club-jazz-night-1", title: "Jazz Night with The Dallas Six", venue: "The Balcony Club", venueSlug: "balcony-club", neighborhood: "lakewood", published: "2026-05-21", description: "" },
  { id: "balcony-club-jazz-night-2", title: "Blues & Soul Session", venue: "The Balcony Club", venueSlug: "balcony-club", neighborhood: "lakewood", published: "2026-05-22", description: "" },
  { id: "adairs-saloon-honky-tonk-friday", title: "Honky Tonk Friday", venue: "Adair's Saloon", venueSlug: "adairs-saloon", neighborhood: "deep-ellum", published: "2026-05-16", description: "" },
  { id: "adairs-saloon-saturday-country", title: "Saturday Country Night", venue: "Adair's Saloon", venueSlug: "adairs-saloon", neighborhood: "deep-ellum", published: "2026-05-17", description: "" },
  { id: "truck-yard-weekend-music", title: "Weekend Music on the Patio", venue: "Truck Yard Dallas", venueSlug: "truck-yard", neighborhood: "lower-greenville", published: "2026-05-16", description: "" },
  { id: "truck-yard-sunday-funday", title: "Sunday Funday Live", venue: "Truck Yard Dallas", venueSlug: "truck-yard", neighborhood: "lower-greenville", published: "2026-05-18", description: "" },
  { id: "wild-horse-line-dancing", title: "Line Dancing Night", venue: "Wild Horse Saloon", venueSlug: "wild-horse", neighborhood: "fort-worth", published: "2026-05-16", description: "" },
  { id: "wild-horse-country-saturday", title: "Country Saturday", venue: "Wild Horse Saloon", venueSlug: "wild-horse", neighborhood: "fort-worth", published: "2026-05-17", description: "" },
];

const venueDescriptions: Record<string, string> = {
  "the-goat-dallas": "Dallas dive blues bar at its finest. No pretension, no attitude — just cold drinks and live music. The neighborhood's favorite for over 20 years, The Goat hosts acoustic blues, karaoke, and local band showcases throughout the week. Free admission on most nights. Arrive early, the room fills up.",
  "lee-harveys": "The definition of a dive bar done right. Lee Harvey's has been the heart of Dallas's local rock scene for decades — cheap drinks, a legendary jukebox, and open mic nights that have launched more than a few local bands. No frills, no cover, always a good time.",
  "double-wide": "A Deep Ellum institution with a raw edge and even rawer drinks. Double Wide is where punk and rock come to play — local bands most nights, touring acts on weekends. The crowd is eclectic, the energy is high, and the cover is almost always under $10.",
  "single-wide": "Lower Greenville's favorite low-key hangout. Local rock, country, and everything in between on a stage that sits maybe 20 people deep. Cheap drinks, friendly crowd, no attitude. If you're looking for the real DFW music scene, you found it.",
  "granada-theater": "Dallas's best mid-size concert venue. A beautifully restored 1940s theater that consistently books acts way bigger than its 400-person capacity would suggest. Stellar acoustics, a full bar, and an intimate layout means every seat is close to the stage.",
  "kessler-theater": "Oak Cliff's premier live music room. This restored 1940s movie house in the heart of Bishop Arts hosts local and national acts in a space where you can see the performer's eyes. The beating heart of the neighborhood's music scene.",
  "balcony-club": "Dallas's coziest jazz spot tucked into Lakewood. An intimate room that holds maybe 60 people, excellent musicians playing seven nights a week, and BYOB allowed. The Balcony Club is where jazz goes to be serious and the audience goes to listen.",
  "the-foundry": "A hidden gem patio bar off the beaten path in Deep Ellum. Fried chicken, cold beer, and live folk and rock on a sprawling backyard deck. The Foundry is where locals go when they want music without the crowds.",
  "adairs-saloon": "Dallas's enduring honky-tonk since 1963. No frills, no cover, just cold drinks and live country music every weekend. Adair's is the real deal — the kind of place that makes Deep Ellum what it is.",
  "truck-yard": "Food trucks, cold beer, and live music under the Texas sky. Truck Yard is what outdoor bar dreams are made of — rotating truck vendors, picnic tables, and bands that make summer nights in Lower Greenville something to remember.",
  "wild-horse": "Fort Worth's premier country music and line dancing venue in the heart of the Stockyards. A little bit Nashville, right here in DFW. Two-step lessons, live country bands, and a dance floor that fills up fast on weekends.",
  "blue-light": "Deep Ellum's longest-running rock and blues bar. The Blue Light has been home to the neighborhood's music scene for decades — a no-frills room where the drinks are cold and the music is always loud.",
  "barley-house": "East Dallas neighborhood spot with solid food, good beer, and live music on weekends. A comfortable, unpretentious local bar where the music is an afterthought to the conversation — and that's exactly how regulars like it.",
  "lakewood-theater": "An old theater space reimagined as a bowling alley and live music venue. Big room, big acts, cheap cover. Bowlski's is where DFW comes to bowl and catch a show without paying arena prices.",
  "lenny-civil": "BBQ and live music in the heart of Fort Worth's Stockyards. Lenny C's is what Texas music is all about — no frills, good food, and bands that know how to play for a crowd that came to have a good time.",
  "madness-at-the-woods": "Fort Worth's underground music scene lives here. A small room that books big sounds — punk, metal, indie, and everything loud. If you want to find what's next in Fort Worth music, this is where it's happening.",
  "curious-mechanic": "Bishop Arts coffee shop by day, neighborhood bar by night. Local acoustic acts and open mic Tuesdays in a space that feels like someone's living room — if that living room had a stage and a solid sound system.",
  "across-the-way": "The go-to live music bar in the Oak Cliff corridor near Bishop Arts. Outdoor patio, solid jukebox, and live rock and blues on weekends. No pretense, just good music and cold drinks.",
};

// ── Generate event descriptions ───────────────────────────────────────────────
const genreKeywords: Record<string, string[]> = {
  blues: ["blues", "slide guitar", "delta blues", "electric blues", "blues rock"],
  jazz: ["jazz", "improvisation", "swing", "smooth jazz", "bebop"],
  rock: ["rock", "guitar-driven", "power trio", "classic rock", "indie rock"],
  country: ["country", "honky-tonk", "two-step", "outlaw country", "Texas country"],
  punk: ["punk", "hardcore", "garage punk", " DIY", "noise rock"],
  folk: ["folk", "acoustic", "singer-songwriter", "americana", "storytelling"],
  metal: ["metal", "heavy", "thrash", "doom", "metalcore"],
  indie: ["indie", "alternative", "lo-fi", "dream pop", "post-rock"],
  soul: ["soul", "R&B", "groove", "funk", " Motown"],
};

function generateDescription(event) {
  const venueSlug = event.venueSlug;
  const venueDesc = venueDescriptions[venueSlug] || `${event.venue} is a local venue in the Dallas-Fort Worth area.`;
  const date = new Date(event.published);
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = date.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const templates = [
    `${event.title} hits the stage at ${event.venue} in ${event.neighborhood.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} this ${dayName}, ${monthDay}. ${venueDesc} Free admission — arrive early to grab a spot near the stage.`,
    `Head to ${event.venue} this ${dayName} for ${event.title}. ${venueDesc} This is a free, no-cover show — the kind of local music night that makes DFW's neighborhood bar scene worth exploring. Show starts when the doors open.`,
    `${event.title} is playing at ${event.venue} this week in ${event.neighborhood.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}. ${venueDesc} Free show, no cover. The kind of local act that makes discovering new music in your own neighborhood the best night out of the week.`,
  ];

  const template = templates[Math.floor(event.id.charCodeAt(0) + event.id.charCodeAt(1)) % templates.length];
  return template;
}

// ── Build sitemap entries ───────────────────────────────────────────────────
function buildSitemap() {
  const today = new Date().toISOString().split("T")[0];

  const entries = [
    { url: BASE, priority: "1.0", changefreq: "daily" },
    { url: `${BASE}/in-your-backyard`, priority: "0.9", changefreq: "daily" },
    { url: `${BASE}/neighborhoods`, priority: "0.8", changefreq: "weekly" },
    { url: `${BASE}/venues`, priority: "0.8", changefreq: "weekly" },
  ];

  // Neighborhoods
  for (const n of neighborhoods) {
    entries.push({ url: `${BASE}/neighborhoods/${n.id}`, priority: "0.7", changefreq: "weekly" });
  }

  // Venues
  for (const v of venues) {
    entries.push({ url: `${BASE}/venues/${v.slug}`, priority: "0.7", changefreq: "weekly" });
  }

  // Events (all)
  for (const e of localEvents) {
    entries.push({ url: `${BASE}/events/${encodeURIComponent(e.id)}`, priority: "0.6", changefreq: "monthly" });
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const entry of entries) {
    xml += `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

// ── Generate updated events JSON with descriptions ───────────────────────────
function buildEventsJson() {
  const updated = localEvents.map((e) => ({
    ...e,
    description: generateDescription(e),
  }));
  return JSON.stringify({ generated: new Date().toISOString(), total: updated.length, events: updated }, null, 2);
}

// ── Write sitemap ────────────────────────────────────────────────────────────
writeFileSync("/Users/philipbernard/livemusic-dfw/src/app/sitemap.ts", buildSitemap());
console.log("✓ sitemap.ts written");

// ── Write updated events JSON (append descriptions) ─────────────────────────
writeFileSync("/Users/philipbernard/livemusic-dfw/src/app/data/local-events-generated.json", buildEventsJson());
console.log("✓ local-events-generated.json written (copy into local-events.json)");