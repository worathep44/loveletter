# ---- build stage ----
FROM node:20-slim AS build
WORKDIR /app
RUN corepack enable
# ติดตั้ง deps ก่อน (cache layer) — ไม่มี postinstall แล้ว nuxt prepare จะรันตอน build เอง
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ---- runtime stage ----
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
# .output ของ Nitro self-contained (มี node_modules ของ runtime ในตัว)
COPY --from=build /app/.output ./.output
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
