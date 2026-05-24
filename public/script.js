/* ============================================================
   SYNALUM AI MENTOR — Frontend Script
   Handles: chat history, fetch /api/chat, UI rendering
   ============================================================ */

// ── State ────────────────────────────────────────────────────
/** @type {Array<{role: 'user'|'model', content: string}>} */
const conversationHistory = [];

// ── DOM refs ─────────────────────────────────────────────────
const messagesContainer = document.getElementById('messagesContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const charCount = document.getElementById('charCount');
const newChatBtn = document.getElementById('newChatBtn');
const welcomeTime = document.getElementById('welcomeTime');

// ── Init ─────────────────────────────────────────────────────
welcomeTime.textContent = formatTime(new Date());

// ── Utilities ────────────────────────────────────────────────
function formatTime(date) {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Lightweight markdown → HTML converter
 * Handles: bold, italic, inline code, fenced code blocks, ordered/unordered lists, headings
 */
function renderMarkdown(text) {
  let html = text;

  // Escape raw HTML (safety)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Fenced code blocks ```lang\n...\n```
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="${lang ? 'lang-' + lang : ''}">${code.trim()}</code></pre>`;
  });

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold & italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Unordered lists (- or *)
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Ordered lists (1. 2. etc)
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Paragraphs: double newline
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      // Don't wrap elements that are already block-level
      if (/^<(h[1-3]|ul|ol|pre|li)/.test(block.trim())) return block;
      const trimmed = block.trim();
      return trimmed ? `<p>${trimmed}</p>` : '';
    })
    .join('\n');

  // Single line breaks inside paragraphs → <br>
  html = html.replace(/([^>])\n([^<])/g, '$1<br>$2');

  return html;
}

// ── Scroll helpers ────────────────────────────────────────────
function scrollToBottom(smooth = true) {
  messagesContainer.scrollTo({
    top: messagesContainer.scrollHeight,
    behavior: smooth ? 'smooth' : 'instant',
  });
}

// ── Message rendering ─────────────────────────────────────────
function createUserMessage(text) {
  const row = document.createElement('div');
  row.className = 'message-row user-row';
  row.innerHTML = `
    <div class="message-bubble user-bubble">
      <p>${text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}</p>
      <span class="message-time">${formatTime(new Date())}</span>
    </div>`;
  return row;
}

function createThinkingBubble() {
  const row = document.createElement('div');
  row.className = 'message-row ai-row';
  row.id = 'thinkingRow';
  row.innerHTML = `
    <div class="message-avatar-wrap">
      <img src="avatar.png" alt="AI" class="message-avatar" />
    </div>
    <div class="message-bubble ai-bubble thinking-bubble">
      <div class="dots-anim">
        <span></span><span></span><span></span>
      </div>
      <span class="thinking-label">Thinking...</span>
    </div>`;
  return row;
}

function createAIMessage(htmlContent, isError = false) {
  const row = document.createElement('div');
  row.className = 'message-row ai-row';
  row.innerHTML = `
    <div class="message-avatar-wrap">
      <img src="avatar.png" alt="AI" class="message-avatar" />
    </div>
    <div class="message-bubble ai-bubble ${isError ? 'error-bubble' : ''}">
      ${htmlContent}
      <span class="message-time">${formatTime(new Date())}</span>
    </div>`;
  return row;
}

// ── Core send logic ───────────────────────────────────────────
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Lock UI
  setUIState(false);
  userInput.value = '';
  updateCharCount();
  autoResize();

  // Add user message to DOM & history
  const userRow = createUserMessage(text);
  messagesContainer.appendChild(userRow);
  conversationHistory.push({ role: 'user', content: text });
  scrollToBottom();

  // Show thinking
  const thinkingRow = createThinkingBubble();
  messagesContainer.appendChild(thinkingRow);
  scrollToBottom();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    const data = await response.json();

    // Remove thinking bubble
    thinkingRow.remove();

    if (!response.ok || data.error) {
      const errMsg = data.error || `Error ${response.status}: Gagal dapat respons.`;
      const errRow = createAIMessage(`<p>❌ ${errMsg}</p>`, true);
      messagesContainer.appendChild(errRow);
    } else {
      const aiText = data.reply || '';
      conversationHistory.push({ role: 'model', content: aiText });
      const rendered = renderMarkdown(aiText);
      const aiRow = createAIMessage(rendered);
      messagesContainer.appendChild(aiRow);
    }
  } catch (err) {
    thinkingRow.remove();
    const errRow = createAIMessage(`<p>❌ Koneksi gagal, bestie. Cek internet lo atau coba lagi nanti 😭</p>`, true);
    messagesContainer.appendChild(errRow);
    console.error('Fetch error:', err);
  }

  scrollToBottom();
  setUIState(true);
  userInput.focus();
}

// ── UI helpers ────────────────────────────────────────────────
function setUIState(enabled) {
  sendBtn.disabled = !enabled;
  userInput.disabled = !enabled;
}

function updateCharCount() {
  const len = userInput.value.length;
  charCount.textContent = `${len}/2000`;
  charCount.style.color = len > 1800 ? '#f87171' : '';
}

function autoResize() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 160) + 'px';
}

// ── New Chat ──────────────────────────────────────────────────
function startNewChat() {
  conversationHistory.length = 0;

  // Keep only the welcome message, remove all others
  const allRows = messagesContainer.querySelectorAll('.message-row:not(#welcomeMessage)');
  allRows.forEach((row) => {
    row.style.animation = 'none';
    row.style.opacity = '0';
    row.style.transform = 'translateY(10px)';
    setTimeout(() => row.remove(), 200);
  });

  userInput.focus();
}

// ── Suggestion chips ──────────────────────────────────────────
document.querySelectorAll('.suggestion-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const text = chip.dataset.text;
    if (!text) return;
    userInput.value = text;
    updateCharCount();
    autoResize();
    userInput.focus();
  });
});

// ── Event listeners ───────────────────────────────────────────
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener('input', () => {
  updateCharCount();
  autoResize();
});

newChatBtn.addEventListener('click', startNewChat);

// Initial focus
userInput.focus();
