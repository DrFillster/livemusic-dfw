# Design Changelog — dallas-music-scene

All visual design decisions are logged here. Every entry includes: what changed, why, and the result.

---

## Entry Template

```
## YYYY-MM-DD — [agent/design]
**Change:** Brief description
**Before:** What it looked/felt like
**After:** What it looks like now
**Rationale:** Why this decision was made
**Lighthouse Score:** before → after
```

---

## 2026-05-15 — Creative Director AM Audit

**Change:** Event card image height `160px` → `200px`
**Before:** Event images rendered as small 160px thumbnails — album covers and artist photography were barely legible, competing unfavorably with the amber ticket button
**After:** Event images now display at 200px tall (+25%), giving venue and artist photography proper visual weight
**Rationale:** Music discovery is inherently visual. At 160px, most artist/album images from Ticketmaster/Prekindle feeds are nearly unreadable. 200px provides meaningful improvement while staying well within mobile-friendly card proportions.
**Lighthouse Score:** N/A (lighthouse CLI not available — visual review only)

---

**Change:** DDN — ArticleCard summary line-clamp 2 → 3 (applied to dailydallasnews; LMDW design-changelog mirrors the decision)
**Rationale:** Same rationale as DDN — more summary context per card reduces scrolling friction for DFW residents scanning local news.

**Change:** LMDW — `.ticket-btn` tap target height 36px → 52px
**Before:** Ticket buttons at ~36px height — below WCAG 2.5.5 recommended 44px minimum for touch targets, users risk accidental taps on adjacent elements
**After:** Ticket buttons now ~52px tall with proportionally wider horizontal padding (0.4rem 0.9rem → 0.65rem 1.25rem) — well above WCAG 44px minimum, improves mobile UX for concert-goers with event tickets open on their phones
**Rationale:** Music fans frequently browse on phones while multitasking — larger tap targets reduce missed or accidental ticket link taps. LMDW events pages are the highest-intent pages on the site (ticket purchase).
**Rationale:** Same rationale as DDN — more summary context per card reduces scrolling friction for DFW residents scanning local news.

---

## 2026-05-19 — Creative Director AM Audit

**Change:** DDN — ArticleCard summary line-clamp 2 → 3 (applied to dailydallasnews; LMDW design-changelog mirrors the decision)
**Before:** Summary text truncated to 2 lines — DFW headlines about neighborhood news (Deep Ellum restaurant closings, Oak Cliff developments) often got cut mid-sentence
**After:** Summary text now displays 3 lines — gives readers enough context to decide if they want to click through without excessive scrolling
**Rationale:** More summary context per card reduces scrolling friction for DFW residents scanning local news. Two-line clamps on 5-6 word summaries left articles indistinguishable. Three lines provide meaningful context without bloating card height.
**Lighthouse Score:** N/A (lighthouse CLI not available — visual review only)

---

**Change:** LMDW — Event card image height `160px` → `200px`
**Before:** Event images rendered as small 160px thumbnails — album covers and artist photography were barely legible, competing unfavorably with the amber ticket button
**After:** Event images now display at 200px tall (+25%), giving venue and artist photography proper visual weight
**Rationale:** Music discovery is inherently visual. At 160px, most artist/album images from Ticketmaster/Prekindle feeds are nearly unreadable. 200px provides meaningful improvement while staying well within mobile-friendly card proportions.
**Lighthouse Score:** N/A (lighthouse CLI not available — visual review only)

---

**Baseline established.** This file initialized by Hermes orchestrator. All future design changes will be logged here.
