const { GoogleGenAI } = require("@google/genai");
require("dotenv").config({ path: ".env.local" });

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: "hello world"
    });
    console.log("Success text-embedding-004", response.embeddings[0].values.slice(0, 5));
  } catch (e) {
    console.error("Error text-embedding-004:", e.message);
  }
}

run();
