# =============================================================
# Dockerfile para Next.js Frontend - Multi-stage build
# =============================================================

# ==================== STAGE 1: Dependencies ====================
FROM node:20-alpine AS deps
WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# ==================== STAGE 2: Builder ====================
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias desde stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build de producción
# NEXT_PUBLIC_* variables se deben pasar aquí para quedar embebidas en el bundle
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NODE_ENV=production

RUN npm run build

# ==================== STAGE 3: Runner ====================
FROM node:20-alpine AS runner
WORKDIR /app

# Metadata
LABEL maintainer="Sistema de Vales"
LABEL description="Next.js Frontend"

# Variables de entorno
ENV NODE_ENV=production

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Cambiar ownership a usuario nextjs
RUN chown -R nextjs:nodejs /app

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Comando de inicio
CMD ["node", "server.js"]
