<div align="center">

# 🧠 SYNALUM AI Mentor

**Your brutally honest, Gen Z-speaking, AI-powered academic advisor.**

*Gaskeun belajar, bestie — no cap, no sugarcoating.* 🚀

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-AI-8B5CF6?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-ISC-22D3EE?style=for-the-badge)](LICENSE)

</div>

---

## 📸 Preview

![SYNALUM AI Mentor Chat UI]

> <img width="1920" height="2135" alt="chatbot ai" src="https://github.com/user-attachments/assets/867604b6-2979-4137-a445-f29026a2aafc" />


---

## 📖 About

**SYNALUM AI Mentor** is an AI-powered chatbot built as a Gen Z academic advisor and mentor. It doesn't coddle you — it gives you **structured learning roadmaps**, **brutally honest feedback**, and **highly motivational** (read: sarcastic) advice to push you forward.

It speaks in casual **Indonesian slang** so it feels like getting roasted by your smartest friend. Whether you need a Web Dev roadmap, career tips, or just a kick of motivation — SYNALUM's got you. *Real talk.*

---

## ✨ Features

- 🔥 **Brutally Honest Persona** — Sarcastic, no-nonsense feedback that actually motivates. SYNALUM won't sugarcoat your procrastination, bestie.
- 🗺️ **Structured Learning Roadmaps** — Ask for a roadmap (Web Dev, Data Science, etc.) and get a clear, phase-by-phase plan.
- 🌙 **Dark Bento Grid UI** — A premium dark-mode interface with glassmorphism, ambient animated blobs, and purple/cyan gradient accents.
- 💬 **Multi-Turn Chat History** — The AI remembers your full conversation context for more coherent, personalized advice.
- 🤖 **Gemini AI Integration** — Powered by Google's `gemini-2.5-flash` model at temperature `0.8` for creative, dynamic responses.
- ⚡ **Suggestion Chips** — One-click prompt shortcuts to get started instantly.
- ✍️ **Markdown Rendering** — AI responses render with full markdown: bold, code blocks, headings, and lists.
- 🔄 **New Chat** — Start a fresh session without refreshing the page.
- 📱 **Responsive Design** — Works cleanly on both desktop and mobile.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | [Node.js](https://nodejs.org/) |
| **Backend** | [Express.js](https://expressjs.com/) |
| **AI Model** | [Gemini 2.5 Flash](https://ai.google.dev/) via `@google/genai` |
| **Frontend** | Vanilla JavaScript, HTML5, CSS3 |
| **Design** | Dark Bento Grid, Glassmorphism, CSS animations |
| **Fonts** | Inter & Space Grotesk (Google Fonts) |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher → [Download here](https://nodejs.org/)
- A **Gemini API Key** → [Get one free at Google AI Studio](https://aistudio.google.com/apikey)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/synalum-ai-mentor.git
cd synalum-ai-mentor
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then open `.env` and **add your Gemini API key**:

```env
# ⚠️ REQUIRED — Get your key at https://aistudio.google.com/apikey
GEMINI_API_KEY=your_api_key_here

# Optional — defaults to 3000
PORT=3000
```

> **⚠️ Important:** Never commit your `.env` file. It is already included in `.gitignore`.

---

### 4. Start the Server

**Production:**
```bash
npm start
```

**Development** (auto-restarts on file changes):
```bash
npm run dev
```

**Or run directly:**
```bash
node server.js
```

---

### 5. Open in Browser

```
http://localhost:3000
```

Gaskeun ngobrol sama SYNALUM! 🎉

---

## 📁 Project Structure

```
synalum-ai-mentor/
├── server.js           # Express backend & Gemini API integration
├── package.json        # Project metadata & scripts
├── .env                # 🔒 Your secret API key (gitignored)
├── .env.example        # Template for environment variables
├── .gitignore
└── public/             # Static frontend files served by Express
    ├── index.html      # App structure (Bento Grid layout)
    ├── style.css       # Premium dark theme & animations
    ├── script.js       # Chat logic, fetch, markdown renderer
    └── avatar.png      # SYNALUM AI avatar image
```

---

## 🔌 API Reference

### `POST /api/chat`

Sends a conversation history to the AI and returns a response.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Buatin roadmap belajar Web Dev dong" },
    { "role": "model", "content": "Oke bestie, dengerin baik-baik..." }
  ]
}
```

**Success Response `200`:**
```json
{
  "reply": "Anjay, akhirnya mau serius juga lo. Oke gaskeun, ini roadmap-nya..."
}
```

**Error Response `500`:**
```json
{
  "error": "Gagal konek ke AI. Coba lagi bentar ya bestie 😅"
}
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

---

<div align="center">

Made with 💜 and lots of Indonesian slang.

*"Nggak ada yang namanya terlambat buat mulai belajar — yang ada lo mager aja."*
— SYNALUM AI Mentor

</div>
