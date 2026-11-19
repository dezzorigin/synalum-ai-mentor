#!/usr/bin/env node
/**
 * Pemeriksaan statis (tanpa browser) — dipakai `npm run validate` dan job
 * `static-checks` di CI:
 *   1. Referensi lokal di public/index.html + docs-site/index.html ada di disk.
 *   2. Semua <img> punya alt.
 *   3. LICENSE + README + docs inti ada.
 *   4. Sapu secret kasar di file sumber (bukan node_modules).
 *   5. Gate anti-slop P0 (docs/DESIGN.md): tanpa gradient ungu/biru,
 *      tanpa headline gradient (bg-clip-text), tanpa impor font Inter,
 *      tanpa emoji mentah sebagai ikon fungsi di markup/style, tanpa
 *      rounded-2xl/3xl + shadow-lg di semua permukaan.
 * Keluar 1 bila ada satu saja temuan; semua temuan dicetak sekaligus.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fail = (msg) => failures.push(msg);

const HTML_FILES = ["public/index.html", "docs-site/index.html"];
const CSS_FILES = ["public/style.css", "docs-site/style.css"];
const JS_FILES = ["server.js", "src/app.js", "src/config.js", "src/mentor.js", "src/validate.js", "src/rateLimit.js", "public/script.js", "docs-site/app.js"];

// ── 1. Referensi lokal + alt ──────────────────────────────────────────
for (const rel of HTML_FILES) {
  const html = readFileSync(join(ROOT, rel), "utf-8");
  const base = dirname(rel);
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const ref = m[1];
    if (/^(https?:|mailto:|tel:|data:|#)/.test(ref)) continue;
    const clean = ref.split(/[?#]/)[0].replace(/^\//, "");
    if (!clean) continue;
    if (!existsSync(join(ROOT, base, clean)) && !existsSync(join(ROOT, clean))) {
      fail(`${rel}: file lokal hilang: ${ref}`);
    }
  }
  for (const m of html.matchAll(/<img([^>]*)>/g)) {
    if (!/alt=/.test(m[1])) fail(`${rel}: <img> tanpa alt: ${m[0].slice(0, 80)}...`);
  }
}

// ── 2. File wajib ada ─────────────────────────────────────────────────
for (const f of [
  "LICENSE", "README.md", ".env.example", "Dockerfile", "docker-compose.yml",
  "docs/PRD.md", "docs/API.md", "docs/ARCHITECTURE.md", "docs/DEPLOY.md",
  "docs/DESIGN.md", "docs/architecture.html", "docs/demo/curl-transcript.md",
]) {
  if (!existsSync(join(ROOT, f))) fail(`${f} hilang`);
}

// ── 3. Sapu secret kasar ─────────────────────────────────────────────
const SECRET_PATTERNS = [
  [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key"],
  [/ghp_[A-Za-z0-9]{20,}/, "GitHub PAT"],
  [/gho_[A-Za-z0-9]{20,}/, "GitHub OAuth token"],
  [/AIza[0-9A-Za-z_-]{35}/, "Google API key"],
  [/sk-[A-Za-z0-9]{16,}/, "API key sk-..."],
  [/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key"],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/, "Slack token"],
];
const scanFiles = [...HTML_FILES, ...CSS_FILES, ...JS_FILES, "package.json", "README.md", "docs/API.md", "docs/DEPLOY.md"];
for (const rel of scanFiles) {
  if (!existsSync(join(ROOT, rel))) continue;
  const content = readFileSync(join(ROOT, rel), "utf-8");
  for (const [re, label] of SECRET_PATTERNS) {
    if (re.test(content)) fail(`${rel}: pola secret terdeteksi (${label})`);
  }
  // .env asli tidak boleh dirujuk sebagai file yang di-commit.
  if (/require\(['"]\.\/\.env['"]\)|from ['"]\.\/\.env['"]/.test(content)) {
    fail(`${rel}: mengimpor .env langsung`);
  }
}

// ── 4. Gate anti-slop P0 di HTML/CSS/JS UI ────────────────────────────
const P0_CHECKS = [
  [/linear-gradient\([^)]*(#7c5cbf|#22d3ee|violet|purple|indigo|blue|cyan)/i, "gradient ungu/biru"],
  [/bg-clip-text/, "headline gradient (bg-clip-text)"],
  [/font-family:\s*['"]?Inter|family=Inter/, "impor font Inter"],
  [/rounded-2xl|rounded-3xl/, "rounded-2xl/3xl (radius template, pakai 4px/8px)"],
  [/shadow-lg|shadow-2xl/, "shadow-lg/2xl di permukaan"],
];
for (const rel of [...HTML_FILES, ...CSS_FILES]) {
  if (!existsSync(join(ROOT, rel))) continue;
  const content = readFileSync(join(ROOT, rel), "utf-8");
  for (const [re, label] of P0_CHECKS) {
    if (re.test(content)) fail(`${rel}: pelanggaran P0 — ${label}`);
  }
  // Emoji mentah di markup/style UI (bukan di string balasan chat model).
  for (const m of content.matchAll(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu)) {
    fail(`${rel}: emoji mentah terdeteksi (${m[0]}) — pakai ikon SVG`);
  }
}

// ── 5. Kontrak API di README/docs konsisten dengan kode ───────────────
const appJs = readFileSync(join(ROOT, "src/app.js"), "utf-8");
for (const endpoint of ["/api/health", "/api/chat"]) {
  if (!appJs.includes(`"${endpoint}"`) && !appJs.includes(`'${endpoint}'`)) {
    fail(`src/app.js: endpoint ${endpoint} tidak ditemukan di kode`);
  }
}
const readme = readFileSync(join(ROOT, "README.md"), "utf-8");
for (const endpoint of ["/api/health", "/api/chat"]) {
  if (!readme.includes(endpoint)) fail(`README.md: endpoint ${endpoint} tidak didokumentasikan`);
}

// ── Ringkasan ─────────────────────────────────────────────────────────
if (failures.length > 0) {
  console.error(`check-links: ${failures.length} temuan:`);
  for (const f of failures) console.error(`  FAIL ${f}`);
  process.exit(1);
}
console.log("check-links: OK (referensi lokal + alt + file wajib + secret + gate P0 + kontrak API)");
