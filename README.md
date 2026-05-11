# LiveMusic DFW

DFW live music events aggregator — a filtered view of the [Daily Dallas News](https://dailydallasnews.com) events feed, focused exclusively on live music.

**URL**: https://livemusic.dailydallasnews.com

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Cloudflare Pages** (via `wrangler`)
- **Ticketmaster Discovery API** for event data

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # Production build
```

## Deployment

Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets in GitHub.

```bash
# Manual deploy
bash deploy.sh
```

## Data Pipeline

`scripts/fetch_events.py` fetches music-category events from Ticketmaster for the DFW area. Run via cron or manually:

```bash
python3 scripts/fetch_events.py
```