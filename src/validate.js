/**
 * Validasi payload POST /api/chat.
 * Aturan: messages wajib array 1..50 item; tiap item {role, content};
 * role "user" | "model" ("assistant" diterima sebagai alias "model");
 * content string tidak kosong, maks 4000 karakter.
 * Mengembalikan string pesan error, atau null bila valid.
 */

export const MAX_MESSAGES = 50;
export const MAX_CONTENT_CHARS = 4000;

export function validateMessages(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return 'Body harus objek JSON dengan field "messages".';
  }
  const { messages } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return 'Field "messages" wajib berupa array yang tidak kosong.';
  }
  if (messages.length > MAX_MESSAGES) {
    return `Maksimal ${MAX_MESSAGES} pesan per permintaan.`;
  }
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (!m || typeof m !== "object" || Array.isArray(m)) {
      return `Pesan ke-${i + 1} harus berupa objek { role, content }.`;
    }
    if (!["user", "model", "assistant"].includes(m.role)) {
      return `Pesan ke-${i + 1}: role harus "user" atau "model".`;
    }
    if (typeof m.content !== "string" || m.content.trim().length === 0) {
      return `Pesan ke-${i + 1}: content wajib string yang tidak kosong.`;
    }
    if (m.content.length > MAX_CONTENT_CHARS) {
      return `Pesan ke-${i + 1}: content maksimal ${MAX_CONTENT_CHARS} karakter.`;
    }
  }
  return null;
}

/** Normalisasi: trim content, alias "assistant" -> "model". */
export function normalizeMessages(messages) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : m.role,
    content: m.content.trim(),
  }));
}
