# API Reference — SYNALUM AI Mentor v1.1.0

Base URL lokal: `http://localhost:3000` (port via env `PORT`).
Semua respons JSON. Semua error JSON. Tidak ada autentikasi (v1.1).

> Contoh respons di bawah ini ASLI dari server mode demo — direkam
> 19 Nov 2026, transkrip lengkap di `docs/demo/curl-transcript.md`.

## GET /api/health

Cek server hidup, mode, dan model. Tidak kena rate limit.

```console
$ curl -s http://localhost:3000/api/health
```

```json
{"status":"ok","mode":"demo","model":"gemini-2.5-flash","version":"1.1.0","uptime_seconds":2}
```

| Field | Tipe | Arti |
|---|---|---|
| `status` | string | Selalu `"ok"` bila server hidup. |
| `mode` | string | `"live"` (Gemini asli) atau `"demo"` (balasan contoh, tanpa key). |
| `model` | string | Model Gemini yang dikonfigurasi (`GEMINI_MODEL`, default `gemini-2.5-flash`). |
| `version` | string | Versi API. |
| `uptime_seconds` | number | Lama server berjalan (detik). |

## POST /api/chat

Kirim riwayat percakapan, terima balasan mentor. **Stateless** — kirim
seluruh riwayat tiap permintaan; server tidak menyimpan apa pun.

Rate limit: **30 permintaan / menit / IP**. Lebih → `429` + header
`Retry-After` (detik).

### Request

```console
$ curl -s -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"Buatin roadmap belajar Web Development dari nol dong"}]}'
```

| Field | Aturan |
|---|---|
| `messages` | Wajib. Array 1–50 item. |
| `messages[].role` | `"user"` atau `"model"`. `"assistant"` diterima sebagai alias `"model"`. |
| `messages[].content` | Wajib string tidak kosong, maks **4000 karakter**. |
| Body | JSON, maks **100 KB**. |

### Respons 200

```json
{"reply":"Oke bestie, real talk: roadmap Web Development dari nol, nggak usah lebay. Ini jalurnya:\n\n1. **Fondasi (minggu 1–2):** HTML, CSS, JavaScript dasar. Bikin 3 landing page jelek dulu, nggak apa-apa.\n2. **Naik level (minggu 3–6):** Git, satu framework (React atau Vue), fetch API, deploy ke hosting gratis.\n3. **Jadi beneran (minggu 7–12):** 2 proyek full-stack kecil, tulis di GitHub yang rapi, bukan cuma README template.\n\nKuncinya bukan nonton tutorial 100 jam, tapi ngetik. Gaskeun hari ini, jangan besok-besok mulu. 🔥\n\n_Balasan contoh — mode demo, bukan dari model Gemini._","model":"gemini-2.5-flash","demo":true}
```

| Field | Tipe | Arti |
|---|---|---|
| `reply` | string | Balasan mentor (markdown ringan: bold, list, heading). |
| `model` | string | Model yang dipakai. |
| `demo` | boolean | `true` = balasan contoh mode demo; `false` = dari Gemini asli. |

### Error

Semua error berbentuk `{"error": "<pesan>"}`.

| Kode | Contoh `error` | Penyebab |
|---|---|---|
| `400` | `Field "messages" wajib berupa array yang tidak kosong.` | Body `{}` / `messages` kosong / bukan array. |
| `400` | `Pesan ke-1: role harus "user" atau "model".` | Role tidak dikenal. |
| `400` | `Pesan ke-1: content wajib string yang tidak kosong.` | Content kosong / bukan string. |
| `400` | `Pesan ke-1: content maksimal 4000 karakter.` | Content terlalu panjang. |
| `400` | `Maksimal 50 pesan per permintaan.` | Riwayat >50 item. |
| `400` | `Body harus JSON yang valid.` | Body bukan JSON. |
| `413` | `Body terlalu besar (maks 100 KB).` | Body >100 KB. |
| `405` | `Method tidak didukung — gunakan POST /api/chat.` | GET/PUT/dll ke `/api/chat`. |
| `404` | `Endpoint GET /tidak-ada tidak ditemukan.` | Path `/api/*` lain. |
| `429` | `Terlalu banyak permintaan. Coba lagi dalam 42 detik.` | Rate limit; cek header `Retry-After`. |
| `500` | `Gagal konek ke AI. Coba lagi bentar ya bestie 😅` | Gemini tidak bisa dihubungi / balasan kosong. Detail internal tidak dibocorkan. |

### Mode demo

Tanpa `GEMINI_API_KEY` (atau `SYNALUM_MOCK=1`), server tetap jalan dan
`/api/chat` membalas dengan balasan contoh deterministik berdasarkan kata
kunci pesan terakhir pengguna:

| Kata kunci | Balasan contoh |
|---|---|
| `roadmap` + `web` | Roadmap Web Dev 3 fase (12 minggu) |
| `data science` / `machine learning` | Roadmap Data Science 3 langkah |
| `mager` / `malas` / `motivasi` | Teknik 10 menit + kecilkan tugas |
| `karir` / `kerja` / `magang` / `interview` | Checklist karir tech |
| (lainnya) | Template umum: pecah masalah → langkah kecil → minta feedback |

Mode demo cocok untuk tes, demo, dan CI — jangan dipakai menilai
kualitas model Gemini.

### Contoh lain

JavaScript (fetch):

```js
const res = await fetch("http://localhost:3000/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      { role: "user", content: "Buatin roadmap belajar Web Development dari nol dong" },
      { role: "model", content: "Oke bestie, ini jalurnya…" },
      { role: "user", content: "Lanjut ke bagian proyeknya dong" },
    ],
  }),
});
console.log(await res.json());
```

## UI chat (GET /)

`GET /` menyajikan UI chat statis (`public/`). UI ini memanggil
`POST /api/chat` yang sama persis dan menampilkan badge mode dari
`GET /api/health` (`Mode demo — balasan contoh` atau `Live · <model>`).

## Header

| Header | Arti |
|---|---|
| `Access-Control-Allow-Origin` | `*` default; batasi lewat env `CORS_ORIGIN`. |
| `Retry-After` | (hanya 429) detik sampai boleh coba lagi. |
| `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: no-referrer`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` | Header keamanan di semua respons. `X-Powered-By` dimatikan. |
