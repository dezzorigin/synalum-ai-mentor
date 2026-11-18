# Arsitektur — SYNALUM AI Mentor v1.1.0

Diagram visual: `docs/architecture.html` (HTML + SVG, bukan Mermaid).

## Gambaran

```
Pengguna / curl / UI chat (public/)
        │  HTTP (JSON)
        ▼
┌──────────────────────────────────────────────────┐
│ server.js (entry, tipis)                         │
│  loadConfig() → {port, model, apiKey, demo, ...} │
│  bila live: GoogleGenAI client → generate()      │
│  bila demo: generate = null                      │
└──────────────────────┬───────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────┐
│ src/app.js — createApp({config, generate})       │
│  middleware: header keamanan → CORS → json 100KB │
│  GET  /api/health                                │
│  POST /api/chat → rate limit → validate →        │
│        generate() ATAU mockReply() (demo)        │
│  ALL  /api/chat → 405 · /api/* lain → 404 JSON   │
│  static public/ → 404 teks → error handler JSON  │
└──────┬───────────────┬───────────────┬───────────┘
       ▼               ▼               ▼
 src/mentor.js   src/validate.js  src/rateLimit.js
 persona + mock  aturan messages  in-memory 30/menit
```

## Lapisan & file

| File | Tugas | Bergantung ke |
|---|---|---|
| `server.js` | Entry: baca config, buat client Gemini (live saja), listen. | `src/*`, `@google/genai`, `dotenv` |
| `src/config.js` | `loadConfig(env)` — semua env var + default. Demo = tanpa key atau `SYNALUM_MOCK=1`. | — |
| `src/app.js` | `createApp({config, generate})` — Express app tanpa listen (bisa diimpor tes). Rute, middleware, error handler. | `src/mentor.js`, `src/validate.js`, `src/rateLimit.js`, `express`, `cors` |
| `src/mentor.js` | `SYSTEM_INSTRUCTION` (persona asli v1.0), `buildContents()`, `mockReply()` (balasan contoh deterministik mode demo). | — |
| `src/validate.js` | `validateMessages()` + `normalizeMessages()` — aturan di `docs/API.md`. | — |
| `src/rateLimit.js` | `createRateLimiter({max, windowMs})` — Map per IP, jendela geser sederhana. | — |
| `public/` | UI chat statis (HTML/CSS/JS). Fetch `/api/health` (badge mode) + `/api/chat`. | API di atas |
| `docs-site/` | Situs dokumentasi statis (Cloudflare Pages). Tidak memanggil API. | — |
| `test/api.test.js` | 21 tes (node:test + fetch, port acak, tanpa key/jaringan). | `src/app.js`, `src/config.js` |
| `scripts/` | `check-links.mjs` (validasi statis + gate P0), `smoke.mjs` (e2e mode demo), `advisory-sweep.py` (OSV), `screenshot.mjs`. | — |

## Alur request POST /api/chat

1. Header keamanan + CORS + `express.json({limit: "100kb"})`.
   Body bukan JSON → 400 JSON (`entity.parse.failed`).
2. Rate limiter (per IP, 30/menit) → lebih → 429 + `Retry-After`.
3. `validateMessages()` → tidak valid → 400 + pesan field-spesifik.
4. `normalizeMessages()` — trim + alias `assistant` → `model`.
5. Demo → `mockReply(messages)` (pilih template dari kata kunci pesan
   user terakhir). Live → `generate(buildContents(messages))` ke Gemini
   2.5 Flash, temperatur 0.8, system instruction persona.
6. Balasan kosong / error client → 500 ramah, detail hanya di `console.error`.
7. Respons `{reply, model, demo}`.

## Alur GET /api/health

Tanpa rate limit (dipakai healthcheck Docker/Coolify + badge UI).
Mengembalikan `{status, mode, model, version, uptime_seconds}`.

## Keputusan desain

- **App factory, bukan singleton:** `createApp()` menerima `generate`
  injeksi — tes memakai client palsu, server memakai client Gemini asli,
  demo memakai `null`. Server tidak perlu di-refactor untuk diuji.
- **Demo mode eksplisit, bukan error:** v1.0 melempar 500 tanpa key.
  v1.1 tetap jalan dengan balasan contoh + flag `demo` — API bisa
  didemo/dites siapa pun tanpa kredensial.
- **Tanpa database, tanpa auth (v1.1):** API stateless; riwayat dipegang
  klien. Konsekuensi: rate limit in-memory hilang saat restart; untuk
  produksi, tambah auth di reverse proxy (lihat `docs/DEPLOY.md`).
- **Tanpa dependensi keamanan berat:** header ditulis manual (4 header,
  ~6 baris) daripada menambah `helmet` — permukaan audit lebih kecil.
- **CORS default `*`:** UI chat disajikan origin yang sama, tapi API
  sengaja bisa dipanggil dari mana pun di v1.1; batasi via `CORS_ORIGIN`
  untuk produksi.

## Environment

| Variabel | Default | Arti |
|---|---|---|
| `GEMINI_API_KEY` | (kosong → demo) | API key Google AI Studio. |
| `PORT` | `3000` | Port listen. |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Model Gemini. |
| `GEMINI_TEMPERATURE` | `0.8` | Temperatur sampling. |
| `SYNALUM_MOCK` | — | `1` = paksa mode demo meski key terisi (tes). |
| `RATE_LIMIT_MAX` | `30` | Maks permintaan `/api/chat` per IP per jendela. |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Jendela rate limit (ms). |
| `CORS_ORIGIN` | `*` | Origin CORS yang diizinkan. |

## Dependensi produksi

| Paket | Versi | Untuk |
|---|---|---|
| `express` | ^4.22.2 | Server HTTP + routing + statis. |
| `@google/genai` | ^1.52.0 | Client Gemini. |
| `cors` | ^2.8.6 | Middleware CORS. |
| `dotenv` | ^16.6.1 | Baca `.env` ke `process.env`. |

Dev-only: `html-validate` (markup docs-site + UI), `puppeteer-core`
(screenshot dokumentasi). Keduanya tidak ikut ke image Docker
(`npm ci --omit=dev`).
