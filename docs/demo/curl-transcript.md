# Transkrip demo curl — SYNALUM AI Mentor (mode demo)

Direkam dari server lokal yang sedang jalan (`PORT=3102 node server.js`, tanpa `GEMINI_API_KEY`).
Semua respons di bawah ini ASLI dari server — bukan karangan. Mode demo membalas dengan
balasan contoh deterministik dan menandai `"demo": true`.

```console
$ curl -s http://127.0.0.1:3102/api/health
{"status":"ok","mode":"demo","model":"gemini-2.5-flash","version":"1.1.0","uptime_seconds":2}

$ curl -s -X POST http://127.0.0.1:3102/api/chat -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"Buatin roadmap belajar Web Development dari nol dong"}]}'
{"reply":"Oke bestie, real talk: roadmap Web Development dari nol, nggak usah lebay. Ini jalurnya:\n\n1. **Fondasi (minggu 1–2):** HTML, CSS, JavaScript dasar. Bikin 3 landing page jelek dulu, nggak apa-apa.\n2. **Naik level (minggu 3–6):** Git, satu framework (React atau Vue), fetch API, deploy ke hosting gratis.\n3. **Jadi beneran (minggu 7–12):** 2 proyek full-stack kecil, tulis di GitHub yang rapi, bukan cuma README template.\n\nKuncinya bukan nonton tutorial 100 jam, tapi ngetik. Gaskeun hari ini, jangan besok-besok mulu. 🔥\n\n_Balasan contoh — mode demo, bukan dari model Gemini._","model":"gemini-2.5-flash","demo":true}

$ curl -s -X POST http://127.0.0.1:3102/api/chat -H "Content-Type: application/json" -d "{}"
{"error":"Field \"messages\" wajib berupa array yang tidak kosong."}
HTTP 400

$ curl -s http://127.0.0.1:3102/ -o /dev/null -w "HTTP %{http_code}"
HTTP 200
```
