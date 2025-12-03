# Base stage
FROM node:18-alpine AS base

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Dependencies stage
FROM base AS dependencies

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM base AS production

ENV NODE_ENV=production

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start with dumb-init to handle signals properly
CMD ["dumb-init", "node", "server.js"]
