/**
 * SYNALUM AI Mentor — entry point.
 * Semua logika ada di src/app.js (bisa diimpor tes tanpa listen).
 * Tanpa GEMINI_API_KEY server jalan MODE DEMO — lihat src/config.js.
 */
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { loadConfig } from "./src/config.js";
import { createApp } from "./src/app.js";
import { SYSTEM_INSTRUCTION } from "./src/mentor.js";

const config = loadConfig();

let generate = null;
if (!config.demo) {
  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  generate = async (contents) => {
    const response = await ai.models.generateContent({
      model: config.model,
      contents,
      config: {
        temperature: config.temperature,
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    return response.text;
  };
}

const app = createApp({ config, generate });

app.listen(config.port, () => {
  if (config.demo) {
    console.log(
      `SYNALUM AI Mentor (MODE DEMO — tanpa GEMINI_API_KEY, balasan contoh) di http://localhost:${config.port}`,
    );
  } else {
    console.log(`SYNALUM AI Mentor (live, model ${config.model}) di http://localhost:${config.port}`);
  }
});
