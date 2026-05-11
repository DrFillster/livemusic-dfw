#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "Building LiveMusic DFW..."
npm run build

echo "Deploying to Cloudflare Pages..."
npx wrangler pages deploy .next --project-name=livemusic-dfw --commit-message="$(git log -1 --pretty=%B 2>/dev/null || echo 'manual deploy')"

echo "✓ Done! https://livemusic-dfw.pages.dev"