#!/bin/sh
set -e

echo "Starting Backend API (Uvicorn)..."
cd /app/backend
uvicorn app.main:app --host 127.0.0.1 --port 8001 &

echo "Starting Frontend SSR Server (Nitro)..."
PORT=3000 HOST=127.0.0.1 node /app/frontend/.output/server/index.mjs &

echo "Starting Nginx Reverse Proxy on port 8000..."
nginx -g "daemon off;"
