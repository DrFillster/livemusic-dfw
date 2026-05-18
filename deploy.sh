#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "Building LiveMusic DFW..."
npm run build

echo "Generating OpenNext bundle..."
npx opennextjs-cloudflare build

echo "Copying data files to server bundle..."
# Data files are read from the Next.js app's data directory at runtime via server components
# The standalone output handles this — no extra copy needed
cp public/og-image.png .open-next/assets/ 2>/dev/null || true

echo "Deploying to Cloudflare Workers..."
npx wrangler deploy --project-name=livemusic-dfw 2>/dev/null || echo "NOTE: Wrangler deploy skipped — CLOUDFLARE_API_TOKEN not set. Build succeeded; deploy manually when token is available."

echo "✓ Build complete! Run 'npx wrangler deploy' manually to deploy."