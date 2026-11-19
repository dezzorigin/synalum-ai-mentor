/**
 * Konfigurasi runtime SYNALUM AI Mentor — dibaca dari environment.
 * Tanpa GEMINI_API_KEY, server jalan dalam MODE DEMO: /api/chat membalas
 * dengan balasan mock deterministik (lihat src/mentor.js) dan /api/health
 * melaporkan mode "demo". Tidak ada kredensial yang pernah di-commit;
 * lihat .env.example.
 */
export function loadConfig(env = process.env) {
  const apiKey = (env.GEMINI_API_KEY || "").trim();
  // Mode demo = tanpa key, atau dipaksa lewat SYNALUM_MOCK=1 (untuk tes).
  const demo = env.SYNALUM_MOCK === "1" || apiKey === "";
  return {
    port: Number(env.PORT || 3000),
    model: env.GEMINI_MODEL || "gemini-2.5-flash",
    temperature: Number(env.GEMINI_TEMPERATURE || 0.8),
    apiKey,
    demo,
    rateLimitMax: Number(env.RATE_LIMIT_MAX || 30),
    rateLimitWindowMs: Number(env.RATE_LIMIT_WINDOW_MS || 60_000),
    corsOrigin: env.CORS_ORIGIN || "*",
    version: "1.1.0",
  };
}
