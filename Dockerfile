# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
ENV NITRO_PRESET=node-server
RUN npm run build

# Stage 2: Unified Runtime Environment
FROM python:3.11-slim

# Install system dependencies, Node.js runtime, and Nginx
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    nginx \
    build-essential \
    libpq-dev \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python backend dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy Python backend source code
COPY backend/ /app/backend

# Copy compiled frontend Nitro build from Stage 1
COPY --from=frontend-builder /app/frontend/.output /app/frontend/.output

# Copy Nginx configuration and entrypoint script
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose frontend (5173) and backend API (8000)
EXPOSE 5173 8000

ENTRYPOINT ["/app/entrypoint.sh"]
