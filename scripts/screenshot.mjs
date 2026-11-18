#!/usr/bin/env node
/**
 * Screenshot dokumentasi ke docs/screenshots/*.png — dipakai README.
 *
 * Prasyarat: puppeteer-core (devDependency), Chromium di cache
 * (~/.cache/ms-playwright/chromium-1234 — JANGAN jalankan
 * `npx playwright install chromium`, itu menghapus cache ini), dan
 * forwarder 127.0.0.1:18081 hidup (untuk Google Fonts).
 *
 * Adegan:
 *   01 chat desktop — kirim "Roadmap Web Dev" (balasan demo tampil)
 *   02 chat mobile 390px
 *   03 docs-site desktop (hero)
 *   04 docs-site mobile 390px
 *   05 siluet — 03 diubah grayscale + thumbnail (dibuat via PIL)
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs", "screenshots");
const CHAT_PORT = process.env.CHAT_PORT || "8331";
const DOCS_PORT = process.env.DOCS_PORT || "8332";
const CHROMIUM = `${process.env.HOME}/.cache/ms-playwright/chromium-1234/chrome-linux/chrome`;

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

mkdirSync(OUT, { recursive: true });

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".json": "application/json" };

function staticServer(root, port) {
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    let fp = join(root, urlPath === "/" ? "index.html" : urlPath);
    if (!fp.startsWith(root) || !existsSync(fp) || !readFileSync) {
      res.writeHead(404); res.end("not found"); return;
    }
    try {
      const data = readFileSync(fp);
      res.writeHead(200, { "Content-Type": MIME[extname(fp)] || "application/octet-stream" });
      res.end(data);
    } catch {
      res.writeHead(404); res.end("not found");
    }
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  // Server API mode demo (chat sungguhan) + server statis docs-site.
  const api = spawn("node", ["server.js"], {
    cwd: ROOT,
    env: { ...process.env, PORT: CHAT_PORT, SYNALUM_MOCK: "1" },
    stdio: "ignore",
  });
  const docsServer = await staticServer(join(ROOT, "docs-site"), DOCS_PORT);

  const waitUp = async (url) => {
    for (let i = 0; i < 40; i++) {
      try {
        const res = await fetch(url);
        if (res.ok) return;
      } catch { /* belum hidup */ }
      await sleep(250);
    }
    throw new Error(`server tidak hidup: ${url}`);
  };

  try {
    await waitUp(`http://127.0.0.1:${CHAT_PORT}/api/health`);
    await waitUp(`http://127.0.0.1:${DOCS_PORT}/`);

    const browser = await puppeteer.launch({
      executablePath: CHROMIUM,
      headless: "new",
      args: ["--proxy-server=http://127.0.0.1:18081", "--no-sandbox", "--disable-dev-shm-usage", "--force-device-scale-factor=1"],
    });
    const page = await browser.newPage();

    // ── 01 — chat desktop: kirim pertanyaan roadmap ────────────────
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`http://127.0.0.1:${CHAT_PORT}/`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(1200);
    await page.evaluate(() => {
      const chip = [...document.querySelectorAll(".suggestion-chip")].find((c) => c.textContent.includes("Roadmap Web Dev"));
      chip?.click();
    });
    await sleep(300);
    await page.click("#sendBtn");
    await page.waitForFunction(
      () => document.querySelectorAll(".message-row").length >= 3 && !document.querySelector("#thinkingRow"),
      { timeout: 15000 },
    );
    await sleep(600);
    await page.screenshot({ path: join(OUT, "01-chat-desktop.png") });
    console.log("shot: 01-chat-desktop.png");

    // ── 02 — chat mobile 390 ────────────────────────────────────────
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`http://127.0.0.1:${CHAT_PORT}/`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(1200);
    await page.evaluate(() => {
      const chip = [...document.querySelectorAll(".suggestion-chip")].find((c) => c.textContent.includes("Roadmap Web Dev"));
      chip?.click();
    });
    await sleep(300);
    await page.click("#sendBtn");
    await page.waitForFunction(
      () => document.querySelectorAll(".message-row").length >= 3 && !document.querySelector("#thinkingRow"),
      { timeout: 15000 },
    );
    await sleep(600);
    await page.screenshot({ path: join(OUT, "02-chat-mobile-390.png") });
    console.log("shot: 02-chat-mobile-390.png");

    // ── 03 — docs-site desktop ──────────────────────────────────────
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`http://127.0.0.1:${DOCS_PORT}/`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(1500);
    await page.screenshot({ path: join(OUT, "03-docs-desktop.png") });
    console.log("shot: 03-docs-desktop.png");

    // ── 04 — docs-site mobile 390 ───────────────────────────────────
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`http://127.0.0.1:${DOCS_PORT}/`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(1500);
    await page.screenshot({ path: join(OUT, "04-docs-mobile-390.png") });
    console.log("shot: 04-docs-mobile-390.png");

    await browser.close();
    console.log("selesai: 4 screenshot di docs/screenshots/");
  } finally {
    api.kill();
    docsServer.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
