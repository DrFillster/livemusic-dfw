#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "Building LiveMusic DFW..."
npm run build

echo "Generating OpenNext bundle..."
npx opennextjs-cloudflare build

echo "Copying data files to server bundle..."
cp src/app/data/local-events.json .open-next/server-functions/default/public/

echo "Deploying to Cloudflare Workers..."
npx wrangler deploy --project-name=livemusic-dfw

echo "✓ Done! https://livemusic-dfw.philipbernard.workers.dev"