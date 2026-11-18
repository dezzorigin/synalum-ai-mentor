/**
 * SYNALUM AI Mentor — Express app factory.
 *
 * createApp({ config, generate }) mengembalikan aplikasi Express tanpa
 * listen(), supaya tes bisa menjalankannya di port acak (node:test +
 * fetch). `generate` adalah fungsi async (contents) => string teks
 * balasan model; bila null, app jalan MODE DEMO (mockReply).
 *
 * Endpoint:
 *   GET  /            -> UI chat statis (public/)
 *   GET  /api/health -> status, mode (live|demo), model, uptime
 *   POST /api/chat   -> chat dengan mentor (rate-limited, tervalidasi)
 */
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { buildContents, mockReply } from "./mentor.js";
import { normalizeMessages, validateMessages } from "./validate.js";
import { createRateLimiter } from "./rateLimit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createApp({ config, generate = null }) {
  const app = express();
  const startedAt = Date.now();
  // Mode demo = tidak ada fungsi generate yang di-injeksi. Kalau pemanggil
  // meng-injeksi generate (client Gemini asli atau client palsu di tes),
  // mode-nya live — config.demo hanya dipakai server.js untuk memutuskan
  // apakah client asli dibuat atau tidak.
  const demo = typeof generate !== "function";

  app.set("trust proxy", 1); // di belakang proxy Coolify/VPS
  app.disable("x-powered-by");

  // ── Header keamanan minimal (tanpa dependensi tambahan) ──────────────
  app.use((req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    res.set("X-Frame-Options", "SAMEORIGIN");
    res.set("Referrer-Policy", "no-referrer");
    res.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: "100kb" }));

  // Body bukan JSON valid -> 400 JSON (bukan HTML bawaan Express).
  app.use((err, req, res, next) => {
    if (err && err.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Body harus JSON yang valid." });
    }
    if (err && err.type === "entity.too.large") {
      return res.status(413).json({ error: "Body terlalu besar (maks 100 KB)." });
    }
    return next(err);
  });

  // ── GET /api/health ──────────────────────────────────────────────────
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      mode: demo ? "demo" : "live",
      model: config.model,
      version: config.version,
      uptime_seconds: Math.floor((Date.now() - startedAt) / 1000),
    });
  });

  // ── POST /api/chat (rate-limited) ────────────────────────────────────
  const chatLimiter = createRateLimiter({
    max: config.rateLimitMax,
    windowMs: config.rateLimitWindowMs,
  });
  app.post("/api/chat", chatLimiter, async (req, res) => {
    const error = validateMessages(req.body);
    if (error) return res.status(400).json({ error });

    const messages = normalizeMessages(req.body.messages);
    try {
      let reply;
      if (demo) {
        reply = mockReply(messages);
      } else {
        reply = await generate(buildContents(messages));
      }
      if (typeof reply !== "string" || reply.length === 0) {
        throw new Error("Model mengembalikan balasan kosong.");
      }
      return res.json({ reply, model: config.model, demo });
    } catch (err) {
      console.error("Chat error:", err);
      return res.status(500).json({
        error: "Gagal konek ke AI. Coba lagi bentar ya bestie 😅",
      });
    }
  });

  // Method lain ke /api/chat -> 405 JSON (bukan 404 HTML).
  app.all("/api/chat", (req, res) => {
    res.status(405).json({ error: "Method tidak didukung — gunakan POST /api/chat." });
  });

  // Endpoint /api/* lain -> 404 JSON.
  app.use("/api", (req, res) => {
    res.status(404).json({ error: `Endpoint ${req.method} ${req.path} tidak ditemukan.` });
  });

  // ── UI chat statis ───────────────────────────────────────────────────
  app.use(express.static(join(__dirname, "..", "public")));

  // Halaman lain yang tidak ada -> 404 teks polos (bukan stack trace).
  app.use((req, res) => {
    res.status(404).type("text/plain").send("Tidak ditemukan.");
  });

  // Error handler terakhir — selalu JSON, jangan bocorkan detail internal.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Terjadi kesalahan di server." });
  });

  return app;
}
