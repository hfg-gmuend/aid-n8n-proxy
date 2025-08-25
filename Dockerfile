# syntax=docker/dockerfile:1

# --- Base stage ---
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies separately to leverage Docker layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY server.js ./
COPY js ./js
COPY volume ./volume
# md directory is not required at runtime, copy if needed
# 'md' directory excluded via .dockerignore; omit from image

# Expose port (can be overridden)
EXPOSE 3000

# Healthcheck hitting /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://localhost:3000/health || exit 1

# Default command
CMD ["node", "server.js"]
