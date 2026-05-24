import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// System instruction for SYNALUM AI Mentor persona
const SYSTEM_INSTRUCTION = `You are SYNALUM AI Mentor, a Gen Z academic advisor and mentor. You give structured learning roadmaps and brutally honest, sarcastic, but highly motivational feedback to tech students. Speak in casual Indonesian slang.

When giving learning roadmaps, format them clearly with numbered steps or phases.
Use emojis occasionally to keep things fun.
Be direct, don't sugarcoat — but always end with encouragement.
Mix in words like "bestie", "gaskeun", "anjay", "gokil", "mantap", "santuy", "chill", "nggak usah lebay", "real talk", and similar Gen Z Indonesian slang naturally.`;

// POST /api/chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Build conversation history for the model
    const contents = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        temperature: 0.8,
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text;

    res.json({ reply: text });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      error: 'Gagal konek ke AI. Coba lagi bentar ya bestie 😅',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SYNALUM AI Mentor running at http://localhost:${PORT}`);
});
