# DESIGN.md — Kontrak Arah Desain SYNALUM AI Mentor

> Ditulis SEBELUM coding (standar ui-anti-slop). Berlaku untuk dua permukaan:
> (1) UI chat di `public/` — produknya sendiri; (2) situs dokumentasi statis
> di `docs-site/` yang di-deploy ke Cloudflare Pages.

## Referensi (riset dulu, baru bangun)

Kebutuhan: dokumentasi API + UI chat untuk mentor akademik Gen Z — pembaca
developer/mahasiswa, harus langsung paham endpoint & contoh curl, tanpa
marketing fluff.

Kandidat (2–3, semua nyata, dikunjungi 19 Nov 2026):

1. **Docspace — Framer template dokumentasi developer** —
   <https://www.framer.com/marketplace/templates/docspace/> — layout
   dokumentasi-first, sidebar navigasi rekursif, halaman referensi API,
   pengalaman baca ala GitBook/Mintlify, mode gelap & terang. Cocok:
   struktur 3 kolom (nav kiri, konten tengah, panel kode kanan) + blok API
   dengan badge method.
2. **Signpost — Framer template help center + developer docs** —
   <https://www.framer.com/marketplace/templates/signpost/> — pencarian ⌘K,
   11 halaman (home, help center, developers, API reference, changelog).
   Cocok: pemisahan jelas "panduan" vs "referensi API". Tidak dipilih:
   terlalu help-center, bukan API-first.
3. **Lookup — template landing referensi API (rocket.new)** —
   <https://www.rocket.new/templates/lookup-definitive-api-landing-page-template> —
   single-page, header split-screen kalkulator live + comparison rows.
   Cocok: ide "bukti dulu sebelum CTA". Tidak dipilih: gelap + indigo
   (melanggar P0), kalkulator tidak relevan untuk API chat.

**Pemenang: Docspace.** Yang di-clone plek-ketiplek strukturnya: nav kiri
sticky dengan daftar endpoint, konten tengah dengan heading berjenjang,
panel terminal/kode di kanan tiap contoh, callout info. Yang diubah: palet
(dari gelap/indigo → kertas terang + pena merah), tipografi, dan detail
khas (anotasi pena merah mentor — bukan komponen Docspace).

## Palet (6 warna bernama, tiap warna punya tugas)

| Nama | Hex | Peran |
|---|---|---|
| Papan Putih | `#FAF8F2` | Latar utama — kertas |
| Tinta | `#1C1B17` | Teks utama & heading |
| Merah Pena | `#C02E22` | Aksen mentor: CTA, badge POST, coretan pena, link aktif |
| Kuning Sorot | `#FFD23F` | Sorotan (highlight) di contoh & catatan penting |
| Hijau Papan | `#1E5B4A` | Sukses / method GET / status OK |
| Abu Garis | `#E3DFD3` | Garis, border, pemisah |

Tidak ada gradient ungu/biru di mana pun. Tidak ada satu hue doang: merah
(aksi), hijau (status), kuning (sorot) masing-masing punya tugas berbeda.

> Koreksi kontras (19 Nov 2026, sebelum merge): Merah Pena awal `#D9382B`
> hanya 4,35:1 di atas kertas (di bawah AA 4,5) dan Abu Mute `#8A867A`
> hanya 3,43:1 — keduanya digelapkan (`#C02E22` = 5,41:1;
> `#6E6959` = 5,17:1; putih di atas merah 5,75:1). Dihitung dengan
> rumus WCAG, bukan kira-kira.

## Tipografi (maks 2 keluarga + mono data)

- Display: **Archivo** (500–900, Expanded untuk headline) — grotesk tegas,
  rasa poster kampus.
- Body: **Instrument Sans** (400–600) — humanis, enak dibaca panjang.
- Data/kode: **JetBrains Mono** — curl, JSON, path endpoint, angka tabular.

## Ide layout (satu kalimat + satu detail khas)

**Layout:** dokumentasi API tiga kolom ala Docspace — nav endpoint kiri
sticky, konten tengah, panel terminal curl kanan — dengan hero kiri-rata
dan terminal contoh curl asli di kanan.

**Detail khas:** anotasi pena merah mentor — coretan & lingkaran SVG gaya
pulpen merah di bawah kata kunci, plus kotak "Catatan mentor" di margin
yang bunyinya seperti koreksi guru di pinggir kertas.

## Beda dari repo sebelumnya (#31 errnor-team-portfolio)

Repo #31: palet Kertas Kas/Oxblood/Ember/Hijau Lunas, Fraunces + Public
Sans, detail khas struk sobek + stempel LUNAS, layout portfolio editorial
satu kolom.

| Sumbu | #31 | #32 (repo ini) | Beda? |
|---|---|---|---|
| Palet | Kertas Kas / Oxblood / Ember / Hijau Lunas | Papan Putih / Tinta / Merah Pena / Kuning Sorot / Hijau Papan | ✅ |
| Tipografi | Fraunces + Public Sans | Archivo + Instrument Sans + JetBrains Mono | ✅ |
| Layout | Portfolio editorial satu kolom | Docs 3 kolom (nav + konten + terminal) | ✅ |
| Radius/spacing | Struk sobek, radius organik | Radius 4px tajam, grid 8pt rapat | ✅ |
| Detail khas | Struk sobek + stempel LUNAS | Anotasi pena merah + "Catatan mentor" | ✅ |

Beda **5/5 sumbu**.

## Larangan yang dipatuhi

- P0: tanpa gradient ungu/biru, tanpa headline gradient, tanpa Inter/Roboto/
  system font, tanpa hero tengah + 3 kartu identik, tanpa emoji mentah
  sebagai ikon fungsi (ikon = SVG stroke 1.5–2px), tanpa statistik vanity
  palsu, tanpa satu kata headline di-italic/diwarnai, tanpa tema
  Tailwind mentah, tanpa `rounded-2xl shadow-lg` di semua permukaan,
  tanpa footer 4 kolom, tanpa copy generik.
- Orde-kedua: tanpa krim + terracotta, near-black + lime, label mono
  all-caps di mana-mana, hiasan 01/02/03, palet satu hue, dark blue/slate,
  espresso + oranye, beige/sand.
- Catatan: persona SYNALUM memakai emoji di dalam **isi balasan chat**
  (teks dari model) — itu konten produk, bukan ikon fungsi UI. UI-nya
  sendiri (tombol, kartu, nav) tidak memakai emoji mentah.

## Gate 7 sumbu (dinilai 19 Nov 2026, sebelum merge)

| Sumbu | Skor (1–5) | Bukti |
|---|---|---|
| 1. Anti-slop purity | 5 | Nol P0 (ditegakkan `scripts/check-links.mjs` di CI) + nol orde-kedua; ikon SVG semua; angka hero asli (2 endpoint, 30/menit, 0 kredensial). |
| 2. UX speed & 1-to-3 | 4 | Hero: 1 aksi utama (Lihat endpoint) + 1 sekunder (Panduan deploy). Chat: 1 aksi utama (kirim). Nav atas 4 tautan — masih dalam batas. |
| 3. Tipografi | 5 | Archivo + Instrument Sans + JetBrains Mono; angka tabular di mono; body ≤75ch (hero-sub 52ch, status 75ch). |
| 4. Spacing & geometri | 4 | Grid 8pt, radius 4/8 konsisten, padding kartu ≥16px (terminal 14–16px, sisanya ≥16px). |
| 5. Motion | 5 | Transisi 120–180ms ease-out; active scale 0.97–0.98; `prefers-reduced-motion` dihormati. |
| 6. A11y | 5 | Focus-visible ring, aria-label tombol ikon, label textarea, tag semantik; kontras dihitung WCAG — teks terkecil 5,17:1 (lihat koreksi kontras di atas). |
| 7. Mobile | 5 | 390px: tanpa scroll horizontal, target sentuh ≥44px (tombol kirim/menu 44px), sidebar jadi overlay. |

Minimal 4/5 tiap sumbu — **lolos semua (4, 5, 5, 4, 5, 5, 5)**. Tes siluet:
thumbnail hitam-putih `docs/screenshots/05-silhouette.png` tetap ketahuan
sebagai "dokumentasi API" — panel terminal + nav endpoint + headline
besar yang membuatnya ketahuan, bukan halaman produk generik.
