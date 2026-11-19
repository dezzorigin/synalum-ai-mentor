/* SYNALUM AI Mentor — docs-site interactivity.
 * Hanya dua perilaku, keduanya harus jalan (tombol mati = cacat):
 *   1. Tab contoh (curl / fetch / Node) — ganti panel.
 *   2. Tombol "Salin" — salin isi <code> target ke clipboard.
 * Plus: sorot link sidenav sesuai section yang sedang dibaca.
 */

// ── Tabs contoh ───────────────────────────────────────────────────────
const tabBtns = document.querySelectorAll(".tab-btn");
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    document.getElementById(btn.dataset.tab)?.classList.add("active");
  });
});

// ── Tombol salin ──────────────────────────────────────────────────────
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const target = document.getElementById(btn.dataset.copyTarget);
    if (!target) return;
    const text = target.textContent;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback untuk konteks non-HTTPS / clipboard diblokir.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    btn.textContent = "Disalin";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "Salin";
      btn.classList.remove("copied");
    }, 1800);
  });
});

// ── Sorot sidenav aktif ───────────────────────────────────────────────
const sections = [...document.querySelectorAll("main section[id], main article[id]")];
const navLinks = [...document.querySelectorAll(".sidenav a[href^='#']")];
if ("IntersectionObserver" in window && sections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = `#${entry.target.id}`;
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id));
      }
    },
    { rootMargin: "-20% 0px -70% 0px" },
  );
  sections.forEach((s) => observer.observe(s));
}
