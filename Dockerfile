# syntax=docker/dockerfile:1.7

ARG BUN_IMAGE=oven/bun:1-alpine

FROM ${BUN_IMAGE} AS deps
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile

FROM ${BUN_IMAGE} AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock next.config.js postcss.config.js tailwind.config.js tsconfig.json next-env.d.ts ./
COPY config ./config
COPY public ./public
COPY src ./src

RUN bun run build

FROM ${BUN_IMAGE} AS runner
WORKDIR /app

ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  HOSTNAME=0.0.0.0 \
  PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/config ./config
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN mkdir -p /app/data

VOLUME ["/app/data"]

EXPOSE 3000

CMD ["bun", "server.js"]
