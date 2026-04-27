FROM oven/bun:alpine AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM alpine:latest
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000 KEEP_ALIVE_TIMEOUT=70000
RUN apk add --no-cache nodejs && mkdir -p /app/data
COPY --from=build /app/public ./public
COPY --from=build /app/config ./config
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
VOLUME ["/app/data"]
EXPOSE 3000
CMD ["node", "server.js"]
