# SYNALUM AI Mentor — image produksi (Node 24 Alpine).
# Build: docker build -t synalum-ai-mentor .
# Jalan:  docker run -p 3000:3000 --env-file .env synalum-ai-mentor
FROM node:24-alpine

WORKDIR /app

# Install dulu hanya dari lockfile (cache layer stabil).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Salin kode aplikasi (docs-site/docs/test tidak dibutuhkan runtime,
# tapi ikut tersalin — lihat .dockerignore untuk yang dikecualikan).
COPY . .

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
