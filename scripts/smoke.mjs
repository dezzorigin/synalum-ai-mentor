#!/usr/bin/env node
/**
 * Smoke end-to-end: jalankan server mode demo di port acak, lalu
 * GET /api/health + POST /api/chat + GET / dan pastikan semuanya 200
 * dengan bentuk respons yang benar. Dipakai CI job `smoke` dan lokal
 * (`npm run smoke`). Tanpa API key — mode demo.
 *
 * Pola dari repo #29: JANGAN pakai `curl | grep -q` + pipefail (grep -q
 * menutup pipe, curl mati SIGPIPE exit 23). Di sini pakai fetch Node
 * dan assert langsung — tanpa shell pipe sama sekali.
 */
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = process.env.SMOKE_PORT || "3199";
const BASE = `http://127.0.0.1:${PORT}`;

const server = spawn("node", ["server.js"], {
  cwd: ROOT,
  env: { ...process.env, PORT, SYNALUM_MOCK: "1" },
  stdio: "pipe",
});
let log = "";
server.stdout.on("data", (d) => { log += d; });
server.stderr.on("data", (d) => { log += d; });

async function waitUp() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return;
    } catch { /* belum hidup */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`server tidak hidup. log:\n${log}`);
}

try {
  await waitUp();

  const health = await fetch(`${BASE}/api/health`);
  assert.equal(health.status, 200);
  const h = await health.json();
  assert.equal(h.status, "ok");
  assert.equal(h.mode, "demo");
  console.log("smoke: GET /api/health 200 mode=demo OK");

  const chat = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: "halo" }] }),
  });
  assert.equal(chat.status, 200);
  const c = await chat.json();
  assert.equal(c.demo, true);
  assert.equal(typeof c.reply, "string");
  assert.ok(c.reply.length > 20);
  console.log("smoke: POST /api/chat 200 demo:true OK");

  const bad = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(bad.status, 400);
  console.log("smoke: POST /api/chat {} -> 400 OK");

  const root = await fetch(`${BASE}/`);
  assert.equal(root.status, 200);
  assert.match(await root.text(), /SYNALUM/);
  console.log("smoke: GET / 200 (UI chat) OK");

  console.log("smoke: SEMUA OK");
} finally {
  server.kill();
}
