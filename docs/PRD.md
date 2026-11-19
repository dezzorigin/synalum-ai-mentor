# PRD — SYNALUM AI Mentor

## 1. Informasi Proyek

| Field | Nilai |
|---|---|
| Nama Proyek | SYNALUM AI Mentor |
| Repo | dezzorigin/synalum-ai-mentor (branch default `master`) |
| Tech Stack | Node.js 20+ · Express 4 · @google/genai (Gemini 2.5 Flash) · HTML/CSS/JS statis (UI chat) |
| Status | v1.1.0 — proper (CI + tes + docs + deploy) |
| Penanggung Jawab | Nabil Aulia Dika |
| Versi Dokumen | 2.0 (rewrite dari PRD template v1.0 — isi asli, bukan generik) |
| Tanggal | 19 Nov 2026 |

## 2. Latar Belakang

Mahasiswa tech sering stuck bukan karena kurang pintar, tapi karena tidak
tahu urutan belajar yang benar dan tidak ada yang memberi feedback jujur.
SYNALUM AI Mentor adalah mentor akademik berbasis chat: pengguna bertanya
dalam bahasa Indonesia santai, mentor menjawab dengan roadmap terstruktur
dan feedback blak-blakan tapi memotivasi — persona "Gen Z academic
advisor" yang ditulis langsung di system instruction.

## 3. Masalah yang Diselesaikan

1. **Tidak tahu mulai dari mana** — mentor memecah topik besar (mis.
   "belajar Web Development") menjadi fase berminggu-minggu yang bisa
   dieksekusi.
2. **Butuh motivasi yang tidak menggurui** — persona jujur + slang Gen Z,
   bukan nasihat template.
3. **Butuh jawaban cepat tanpa akun** — API stateless, tanpa auth, satu
   POST langsung dijawab.

## 4. Tujuan & Sasaran

- `POST /api/chat` menjawab dalam hitungan detik dengan balasan persona
  yang konsisten (roadmap bernomor, jujur, ditutup penyemangat).
- API bisa diuji tanpa API key (mode demo) dan tanpa menyimpan data
  pengguna (stateless).
- UI chat di `public/` memakai API yang sama persis dengan yang
  didokumentasikan — tidak ada endpoint rahasia.
- Deploy server terdokumentasi (Docker + Coolify); dokumentasi statis di
  Cloudflare Pages jujur soal apa yang live dan apa yang tidak.

## 5. Ruang Lingkup

### In Scope
- `GET /api/health` — status, mode (live/demo), model, uptime.
- `POST /api/chat` — chat dengan riwayat, validasi, rate limit.
- Mode demo (tanpa `GEMINI_API_KEY`): balasan contoh deterministik,
  ditandai `"demo": true`.
- UI chat statis (`public/`) — kirim riwayat, render markdown, badge mode.
- Validasi input, error JSON konsisten, header keamanan, CORS.
- Tes otomatis (21 tes), CI, advisory sweep OSV, smoke end-to-end.
- Docs: API, arsitektur, deploy, diagram, transkrip curl asli.
- Situs dokumentasi statis (`docs-site/`) untuk Cloudflare Pages.

### Out of Scope
- Akun / autentikasi pengguna, penyimpanan riwayat di server.
- Streaming (SSE/WebSocket) — respons sekali kirim (JSON).
- Upload file / gambar.
- Panel admin, analitik, billing.
- Hosting API di Cloudflare Pages (tidak mungkin — Pages statis;
  Express butuh server, lihat docs/DEPLOY.md).

## 6. Fitur & Persyaratan Fungsional

| ID | Fitur | Kriteria |
|---|---|---|
| FR-1 | `GET /api/health` | 200 + `{status, mode, model, version, uptime_seconds}`. |
| FR-2 | `POST /api/chat` | 200 + `{reply, model, demo}` untuk pesan valid. |
| FR-3 | Validasi `messages` | Array 1–50 item; role `user`/`model` (`assistant` alias); content 1–4000 karakter; body JSON ≤100 KB; pelanggaran → 400 dengan pesan jelas. |
| FR-4 | Mode demo | Tanpa key → balasan contoh deterministik per kata kunci (roadmap web, data science, motivasi, karir, umum) + `"demo": true`. |
| FR-5 | Rate limit | 30 req/menit/IP ke `/api/chat`; lebih → 429 + `Retry-After`. |
| FR-6 | Error JSON | 400/404/405/429/500 selalu JSON; 500 tidak membocorkan detail internal. |
| FR-7 | UI chat | Kirim pesan (Enter), riwayat dikirim utuh tiap request, markdown di-render (list `<ol>` benar), chip saran, chat baru, penghitung karakter 2000, badge mode dari `/api/health`, sidebar bisa dibuka di mobile. |
| FR-8 | Keamanan | Header `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`; `X-Powered-By` dimatikan; CORS bisa dibatasi via `CORS_ORIGIN`. |

## 7. Persyaratan Non-Fungsional

- **Performa:** health <50 ms lokal; chat mengikuti latensi Gemini
  (mode demo <50 ms).
- **Keamanan:** `.env` tidak boleh ter-commit (`.env.example` sebagai
  contoh); secret disapu di CI; tanpa secret di log/error.
- **Maintainability:** app factory (`src/app.js`) bisa diimpor tes tanpa
  listen; logika persona terpisah (`src/mentor.js`); validasi terpisah
  (`src/validate.js`).
- **Portabilitas:** Node.js ≥20, Linux/macOS/Windows; Docker image
  `node:24-alpine`.
- **Keterujian:** `npm test` 21 tes tanpa API key & tanpa jaringan
  eksternal; `npm run smoke` end-to-end mode demo.

## 8. Arsitektur & Tech Stack

Lihat `docs/ARCHITECTURE.md` + `docs/architecture.html` (diagram).

- Entry: `server.js` (tipis — hanya wiring config + client Gemini).
- App: `src/app.js` — Express, rute, middleware.
- Persona: `src/mentor.js` — system instruction + mock demo.
- Validasi: `src/validate.js`; rate limit: `src/rateLimit.js`.
- UI: `public/` (disajikan Express) — chat app.
- Docs statis: `docs-site/` (Cloudflare Pages).

## 9. Milestone / Roadmap

| Fase | Status |
|---|---|
| v1.0 scaffolding (Express + Gemini + UI bento gelap) | ✅ (commit awal) |
| v1.1 proper: validasi, rate limit, health, mode demo, tes, CI, docs, redesign anti-slop | ✅ (PR ini) |
| Deploy server (Coolify/VPS) | ⏳ terdokumentasi di docs/DEPLOY.md, belum di-deploy |
| Streaming respons | 🔮 wacana |
| Riwayat tersimpan per pengguna (butuh auth) | 🔮 wacana, di luar scope |

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| `GEMINI_API_KEY` bocor ke repo | `.env` di `.gitignore` + `.env.example` + sapu secret di CI; key hanya lewat env. |
| API key habis kuota / model berubah | Model & temperatur via env (`GEMINI_MODEL`, `GEMINI_TEMPERATURE`); error 500 ramah. |
| Spam / abuse endpoint tanpa auth | Rate limit 30/menit/IP; untuk produksi, tambah auth/reverse-proxy (lihat DEPLOY.md). |
| Rate limiter hilang saat restart | Diterima untuk v1.1 (in-memory); ganti Redis bila trafik ramai. |
| Klaim "live di Pages" yang salah | Docs-site menulis jujur: Pages hanya dokumentasi; API butuh server (lihat bagian Status). |

## 11. Kriteria Keberhasilan

- `npm test` 21/21 hijau; CI hijau; `npm run smoke` lolos.
- Play-test curl end-to-end mode demo terekam di
  `docs/demo/curl-transcript.md` (respons asli).
- Semua tombol/link di UI chat & docs-site berfungsi (tidak ada yang mati).
- Gate anti-slop 7 sumbu ≥4/5 (lihat `docs/DESIGN.md`).
- Tidak ada secret ter-commit (sapu CI hijau).

## 12. Lampiran

- API: `docs/API.md`
- Arsitektur: `docs/ARCHITECTURE.md`, diagram `docs/architecture.html`
- Deploy: `docs/DEPLOY.md`
- Desain: `docs/DESIGN.md`
- Demo: `docs/demo/curl-transcript.md`
- Lisensi: MIT (`LICENSE`)
