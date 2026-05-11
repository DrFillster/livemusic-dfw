#!/bin/bash
# Deploy LiveMusic DFW to Cloudflare Pages

set -e

cd "$(dirname "$0")"

echo "Building..."
npm run build

echo "Deploying to Cloudflare Pages..."
npx wrangler pages deploy .next --project-name=livemusic-dfw --commit-message="$(git log -1 --pretty=%B)"

echo "Done!"