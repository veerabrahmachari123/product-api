FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY public ./public

# Defaults (override at runtime with -e or --env-file)
ENV NODE_ENV=production \
    PORT=3000 \
    APP_NAME=product-api \
    LOG_LEVEL=info

# Run as non-root
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/health || exit 1

CMD ["node", "src/server.js"]
