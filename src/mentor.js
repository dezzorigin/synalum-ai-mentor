/**
 * Persona + pemanggilan model SYNALUM AI Mentor.
 *
 * SYSTEM_INSTRUCTION dipertahankan dari server.js asli (v1.0.0) — itu
 * karakter produknya. Yang baru: buildContents() (dipakai live & demo)
 * dan mockReply() untuk MODE DEMO, supaya API bisa diuji end-to-end
 * tanpa API key dan tanpa membocorkan kredensial apa pun.
 */

// System instruction untuk persona SYNALUM AI Mentor (asli, dipertahankan).
export const SYSTEM_INSTRUCTION = `You are SYNALUM AI Mentor, a Gen Z academic advisor and mentor. You give structured learning roadmaps and brutally honest, sarcastic, but highly motivational feedback to tech students. Speak in casual Indonesian slang.

When giving learning roadmaps, format them clearly with numbered steps or phases.
Use emojis occasionally to keep things fun.
Be direct, don't sugarcoat — but always end with encouragement.
Mix in words like "bestie", "gaskeun", "anjay", "gokil", "mantap", "santuy", "chill", "nggak usah lebay", "real talk", and similar Gen Z Indonesian slang naturally.`;

/**
 * Ubah pesan tervalidasi [{role, content}] menjadi format contents
 * yang diminta @google/genai (role "user" | "model").
 */
export function buildContents(messages) {
  return messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));
}

/**
 * Balasan mock deterministik untuk MODE DEMO (tanpa GEMINI_API_KEY).
 * Dipilih dari kata kunci pesan terakhir pengguna; formatnya meniru
 * gaya persona (roadmap bernomor, jujur, ditutup penyemangat). Bukan
 * panggilan model — respons JSON selalu menandai `"demo": true`.
 */
export function mockReply(messages) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const q = (lastUser?.content || "").toLowerCase();

  if (q.includes("roadmap") && (q.includes("web") || q.includes("website"))) {
    return [
      "Oke bestie, real talk: roadmap Web Development dari nol, nggak usah lebay. Ini jalurnya:",
      "",
      "1. **Fondasi (minggu 1–2):** HTML, CSS, JavaScript dasar. Bikin 3 landing page jelek dulu, nggak apa-apa.",
      "2. **Naik level (minggu 3–6):** Git, satu framework (React atau Vue), fetch API, deploy ke hosting gratis.",
      "3. **Jadi beneran (minggu 7–12):** 2 proyek full-stack kecil, tulis di GitHub yang rapi, bukan cuma README template.",
      "",
      "Kuncinya bukan nonton tutorial 100 jam, tapi ngetik. Gaskeun hari ini, jangan besok-besok mulu. 🔥",
      "",
      "_Balasan contoh — mode demo, bukan dari model Gemini._",
    ].join("\n");
  }

  if (q.includes("data science") || q.includes("data scientist") || q.includes("machine learning")) {
    return [
      "Data Science? Gokil, tapi jangan kejebak tutorial hell ya bestie:",
      "",
      "1. **Python dulu:** dasar, pandas, visualisasi. Satu bahasa, jangan loncat-loncat.",
      "2. **Statistik yang kepake:** distribusi, korelasi, regresi — bukan hafalan rumus.",
      "3. **Satu proyek end-to-end:** ambil dataset beneran, bersihin, analisis, ceritain hasilnya.",
      "",
      "Portofolio lo yang ngomong, bukan sertifikat. Santuy tapi konsisten. 💪",
      "",
      "_Balasan contoh — mode demo, bukan dari model Gemini._",
    ].join("\n");
  }

  if (q.includes("mager") || q.includes("malas") || q.includes("motivasi") || q.includes("semangat")) {
    return [
      "Real talk ya: mager itu bukan penyakit, itu sinyal lo capek atau bingung mulai dari mana. Jadi gini:",
      "",
      "1. Kerjain 10 menit doang. Timer. Kalau abis itu masih mager, berhenti — biasanya lo malah lanjut.",
      "2. Kecilin tugasnya sampai konyol: bukan \"belajar React\", tapi \"bikin satu tombol\".",
      "3. Tidur yang bener. Otak capek nggak bisa dipaksa pake motivasi.",
      "",
      "Lo nggak ketinggalan, lo cuma belum mulai. Gaskeun 10 menit sekarang. 🔥",
      "",
      "_Balasan contoh — mode demo, bukan dari model Gemini._",
    ].join("\n");
  }

  if (q.includes("karir") || q.includes("karier") || q.includes("kerja") || q.includes("magang") || q.includes("interview")) {
    return [
      "Masuk tech company besar itu bukan soal pinter doang, bestie. Checklist jujurnya:",
      "",
      "1. **Portofolio yang bisa dibuka:** 2–3 proyek jalan, bukan screenshot doang.",
      "2. **Dasar yang kuat:** struktur data, algoritma, dan cara lo mikir — ini yang ditanya di interview.",
      "3. **Latihan ngomong:** jelasin proyek lo 2 menit tanpa gagap. Ini yang bikin lo beda.",
      "",
      "Apply 20 tempat, bukan 2. Penolakan itu data, bukan vonis. Mantap, gaskeun. 💼",
      "",
      "_Balasan contoh — mode demo, bukan dari model Gemini._",
    ].join("\n");
  }

  const topic = lastUser?.content?.trim().slice(0, 80) || "itu";
  return [
    `Oke, soal "${topic}" — real talk dulu ya bestie:`,
    "",
    "1. **Pecah masalahnya:** tulis apa yang lo tahu, apa yang lo bingungin, dan hasil akhir yang lo mau.",
    "2. **Kerjain bagian terkecil dulu:** 25 menit fokus, tanpa HP. Progress kecil tetap progress.",
    "3. **Minta feedback:** tunjukin hasilnya ke orang, jangan simpen sendiri.",
    "",
    "Lo udah nanya — itu setengah jalan. Tinggal gaskeun eksekusinya. 💪",
    "",
    "_Balasan contoh — mode demo, bukan dari model Gemini._",
  ].join("\n");
}
