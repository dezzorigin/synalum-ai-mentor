/**
 * Tes API SYNALUM AI Mentor — node:test bawaan + fetch, tanpa framework.
 * Server dijalankan di port acak per grup tes. Dua mode diuji:
 *  - demo (generate null): balasan mock deterministik, demo:true
 *  - live dengan client palsu: generate injeksi mengembalikan teks kaleng
 * Tidak ada panggilan ke Gemini asli di tes mana pun (tanpa API key).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.js";
import { createApp } from "../src/app.js";

function testConfig(overrides = {}) {
  return {
    ...loadConfig({ ...process.env, GEMINI_API_KEY: "", SYNALUM_MOCK: "1" }),
    ...overrides,
  };
}

async function startServer({ config, generate = null }) {
  const app = createApp({ config, generate });
  const server = await new Promise((resolve, reject) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
    s.on("error", reject);
  });
  const { port } = server.address();
  return {
    base: `http://127.0.0.1:${port}`,
    close: () => new Promise((r) => server.close(r)),
  };
}

async function postChat(base, body, extraHeaders = {}) {
  return fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

// ── Health ──────────────────────────────────────────────────────────────
test("GET /api/health -> 200, status ok, mode demo tanpa key", async () => {
  const srv = await startServer({ config: testConfig() });
  try {
    const res = await fetch(`${srv.base}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
    assert.equal(body.mode, "demo");
    assert.equal(body.model, "gemini-2.5-flash");
    assert.equal(typeof body.uptime_seconds, "number");
  } finally {
    await srv.close();
  }
});

test("GET /api/health mode live bila generate di-injeksi", async () => {
  const srv = await startServer({
    config: testConfig(),
    generate: async () => "halo bestie",
  });
  try {
    const body = await (await fetch(`${srv.base}/api/health`)).json();
    assert.equal(body.mode, "live");
  } finally {
    await srv.close();
  }
});

// ── Chat mode demo ──────────────────────────────────────────────────────
test("POST /api/chat mode demo -> 200, reply roadmap, demo:true", async () => {
  const srv = await startServer({ config: testConfig() });
  try {
    const res = await postChat(srv.base, {
      messages: [{ role: "user", content: "Buatin roadmap belajar Web Development dari nol dong" }],
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.demo, true);
    assert.match(body.reply, /Fondasi/);
    assert.match(body.reply, /Gaskeun/);
  } finally {
    await srv.close();
  }
});

test("POST /api/chat dengan generate injeksi -> reply dari client, demo:false", async () => {
  const srv = await startServer({
    config: testConfig(),
    generate: async (contents) => {
      assert.equal(contents[0].role, "user");
      assert.equal(contents[0].parts[0].text, "halo");
      return "halo juga, bestie";
    },
  });
  try {
    const res = await postChat(srv.base, { messages: [{ role: "user", content: "halo" }] });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.reply, "halo juga, bestie");
    assert.equal(body.demo, false);
  } finally {
    await srv.close();
  }
});

test("POST /api/chat client error -> 500 JSON, tanpa detail internal", async () => {
  const srv = await startServer({
    config: testConfig(),
    generate: async () => {
      throw new Error("RAHASIA_INTERNAL_BOOM");
    },
  });
  try {
    const res = await postChat(srv.base, { messages: [{ role: "user", content: "halo" }] });
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.match(body.error, /Gagal konek ke AI/);
    assert.doesNotMatch(JSON.stringify(body), /RAHASIA_INTERNAL_BOOM/);
  } finally {
    await srv.close();
  }
});

// ── Validasi ────────────────────────────────────────────────────────────
const invalidCases = [
  ["body kosong {}", {}, /messages/],
  ["messages bukan array", { messages: "halo" }, /messages/],
  ["messages kosong", { messages: [] }, /messages/],
  ["role tidak dikenal", { messages: [{ role: "system", content: "x" }] }, /role/],
  ["content kosong", { messages: [{ role: "user", content: "   " }] }, /content/],
  ["content bukan string", { messages: [{ role: "user", content: 42 }] }, /content/],
  ["content >4000 karakter", { messages: [{ role: "user", content: "a".repeat(4001) }] }, /4000/],
  [
    "messages >50 item",
    { messages: Array.from({ length: 51 }, () => ({ role: "user", content: "x" })) },
    /Maksimal 50/,
  ],
  ["item bukan objek", { messages: ["halo"] }, /objek/],
];

for (const [name, body, pattern] of invalidCases) {
  test(`validasi: ${name} -> 400`, async () => {
    const srv = await startServer({ config: testConfig() });
    try {
      const res = await postChat(srv.base, body);
      assert.equal(res.status, 400);
      const parsed = await res.json();
      assert.match(parsed.error, pattern);
    } finally {
      await srv.close();
    }
  });
}

test("validasi: body bukan JSON -> 400 JSON", async () => {
  const srv = await startServer({ config: testConfig() });
  try {
    const res = await postChat(srv.base, "{bukan json");
    assert.equal(res.status, 400);
    assert.match((await res.json()).error, /JSON/);
  } finally {
    await srv.close();
  }
});

test("validasi: role assistant dinormalisasi jadi model (diterima)", async () => {
  const srv = await startServer({ config: testConfig() });
  try {
    const res = await postChat(srv.base, {
      messages: [
        { role: "user", content: "halo" },
        { role: "assistant", content: "hai" },
        { role: "user", content: "lanjut" },
      ],
    });
    assert.equal(res.status, 200);
  } finally {
    await srv.close();
  }
});

// ── Method / rute ───────────────────────────────────────────────────────
test("GET /api/chat -> 405 JSON", async () => {
  const srv = await startServer({ config: testConfig() });
  try {
    const res = await fetch(`${srv.base}/api/chat`);
    assert.equal(res.status, 405);
    assert.match((await res.json()).error, /POST \/api\/chat/);
  } finally {
    await srv.close();
  }
});

test("GET /api/tidak-ada -> 404 JSON (bukan HTML)", async () => {
  const srv = await startServer({ config: testConfig() });
  try {
    const res = await fetch(`${srv.base}/api/tidak-ada`);
    assert.equal(res.status, 404);
    assert.match(res.headers.get("content-type"), /json/);
    assert.match((await res.json()).error, /tidak ditemukan/);
  } finally {
    await srv.close();
  }
});

// ── Rate limit ──────────────────────────────────────────────────────────
test("rate limit: permintaan ke-4 dari 3 -> 429 + Retry-After", async () => {
  const srv = await startServer({
    config: testConfig({ rateLimitMax: 3, rateLimitWindowMs: 60_000 }),
  });
  try {
    const body = { messages: [{ role: "user", content: "halo" }] };
    for (let i = 0; i < 3; i++) {
      assert.equal((await postChat(srv.base, body)).status, 200);
    }
    const res = await postChat(srv.base, body);
    assert.equal(res.status, 429);
    assert.ok(res.headers.get("retry-after"));
    assert.match((await res.json()).error, /Terlalu banyak/);
  } finally {
    await srv.close();
  }
});

// ── Header & statis ─────────────────────────────────────────────────────
test("header keamanan + CORS hadir di /api/health", async () => {
  const srv = await startServer({ config: testConfig() });
  try {
    const res = await fetch(`${srv.base}/api/health`, { headers: { Origin: "https://contoh.id" } });
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("x-frame-options"), "SAMEORIGIN");
    assert.equal(res.headers.get("access-control-allow-origin"), "*");
    assert.equal(res.headers.get("x-powered-by"), null);
  } finally {
    await srv.close();
  }
});

test("GET / menyajikan UI chat statis (200, ada form input)", async () => {
  const srv = await startServer({ config: testConfig() });
  try {
    const res = await fetch(`${srv.base}/`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type"), /html/);
    const html = await res.text();
    assert.match(html, /id="userInput"/);
    assert.match(html, /SYNALUM/);
  } finally {
    await srv.close();
  }
});
