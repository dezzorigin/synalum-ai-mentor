/**
 * Rate limiter in-memory (tanpa dependensi) untuk /api/chat.
 * Batas default: 30 permintaan per IP per 60 detik — bisa diubah lewat
 * env RATE_LIMIT_MAX / RATE_LIMIT_WINDOW_MS. Kelebihan -> 429 JSON
 * dengan header Retry-After. Bukan anti-abuse kelas produksi (restart
 * menghapus hitungan); untuk deploy ramai, ganti dengan limiter berbasis
 * Redis (lihat docs/DEPLOY.md).
 */
export function createRateLimiter({ max, windowMs }) {
  const hits = new Map(); // ip -> { count, resetAt }
  const middleware = (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    let entry = hits.get(ip);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(ip, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: `Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`,
      });
    }
    return next();
  };
  // Dipakai tes: reset hitungan tanpa restart server.
  middleware.reset = () => hits.clear();
  middleware._hits = hits;
  return middleware;
}
