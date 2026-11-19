# Deploy — SYNALUM AI Mentor v1.1.0

## Yang penting dulu: Pages TIDAK bisa meng-host API ini

Cloudflare Pages itu hosting **statis**. SYNALUM AI Mentor adalah server
Express (Node.js) — butuh proses yang jalan terus. Yang live di Pages
(`docs-site/`) hanyalah **dokumentasi**. API-nya harus jalan di server
sendiri. Jangan klaim sebaliknya di mana pun.

## Opsi 1 — Docker (lokal / VPS mana pun)

```bash
git clone https://github.com/dezzorigin/synalum-ai-mentor.git
cd synalum-ai-mentor
cp .env.example .env   # isi GEMINI_API_KEY (atau kosong = mode demo)
docker compose up -d --build
curl -s http://localhost:3000/api/health
# {"status":"ok","mode":"live","model":"gemini-2.5-flash",...}
```

Image memakai `node:24-alpine`, `npm ci --omit=dev`, user non-root
(`node`), dan healthcheck `GET /api/health` tiap 30 detik. Port container
`3000`.

Perintah manual (tanpa compose):

```bash
docker build -t synalum-ai-mentor .
docker run -d --name synalum -p 3000:3000 --env-file .env --restart unless-stopped synalum-ai-mentor
```

## Opsi 2 — Coolify di VPS (jalur yang dipakai tim)

1. Coolify → **+ New Resource** → **GitHub App / Public Repository** →
   pilih `dezzorigin/synalum-ai-mentor`, branch `master`.
2. Build Pack: **Dockerfile** (otomatis terdeteksi dari `Dockerfile` di
   root). Port: `3000`.
3. **Environment Variables** → tambah `GEMINI_API_KEY` (ambil dari
   [Google AI Studio](https://aistudio.google.com/apikey)). Opsional:
   `GEMINI_MODEL`, `RATE_LIMIT_MAX`, `CORS_ORIGIN` (isi domain UI bila
   ada).
4. Deploy. Healthcheck memakai `GET /api/health` (sudah di `Dockerfile`).
5. Verifikasi dari luar:
   ```bash
   curl -s https://<domain-atau-ip-vps>:3000/api/health
   # mode harus "live" — kalau "demo", berarti GEMINI_API_KEY tidak terbaca
   ```
6. (Opsional) pasang domain + TLS di Coolify (proxy bawaan), lalu batasi
   `CORS_ORIGIN` ke domain itu.

## Opsi 3 — Node langsung (tanpa Docker)

```bash
npm ci --omit=dev
cp .env.example .env   # isi GEMINI_API_KEY
PORT=3000 node server.js
```

Untuk produksi, jalankan di bawah process manager (`systemd` / `pm2`)
supaya restart otomatis. Contoh unit systemd minimal ada di bawah
(sesuaikan path & user):

```ini
[Unit]
Description=SYNALUM AI Mentor
After=network.target

[Service]
User=deploy
WorkingDirectory=/opt/synalum-ai-mentor
EnvironmentFile=/opt/synalum-ai-mentor/.env
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## Variabel environment produksi

| Variabel | Wajib? | Catatan |
|---|---|---|
| `GEMINI_API_KEY` | Ya (live) | Tanpa ini server jalan mode demo. Jangan commit; isi di Coolify env / `.env` di server saja. |
| `PORT` | Tidak | Default `3000`. |
| `CORS_ORIGIN` | Dianjurkan | Default `*`. Produksi: isi domain UI, mis. `https://synalum-ai-mentor.pages.dev`. |
| `RATE_LIMIT_MAX` | Tidak | Default 30/menit/IP. |
| `GEMINI_MODEL` / `GEMINI_TEMPERATURE` | Tidak | Default `gemini-2.5-flash` / `0.8`. |

## Checklist produksi

- [ ] `GET /api/health` mengembalikan `"mode":"live"` (bukan `"demo"`).
- [ ] `POST /api/chat` dengan key asli mengembalikan `"demo":false`.
- [ ] `CORS_ORIGIN` dibatasi ke domain yang benar.
- [ ] Reverse proxy (Coolify/Caddy/Nginx) di depan, TLS aktif.
- [ ] Log dipantau — error Gemini hanya muncul sebagai 500 ramah ke
      klien, detailnya di `console.error` server.
- [ ] Bila trafik ramai: ganti rate limiter in-memory dengan Redis dan
      tambah auth (API key per klien) di reverse proxy — keduanya di luar
      scope v1.1.

## Status deploy saat ini

- **Dokumentasi statis (Pages):** live — lihat URL di README / About repo.
- **API server:** **belum di-deploy** (terdokumentasi di sini; butuh
  keputusan Nabil soal VPS/Coolify). Verifikasi yang sudah dilakukan:
  server jalan lokal mode demo + 21 tes + smoke CI (lihat
  `docs/demo/curl-transcript.md`).
