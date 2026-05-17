# Design Changelog — livemusic-dfw

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

**Baseline established.** This file initialized by Hermes orchestrator. All future design changes will be logged here.
