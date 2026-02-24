import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const apiKey = process.env.GEMINI_API_KEY?.trim() || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Log status on load
if (apiKey) {
    console.log(`🔑 Gemini API Key Status: ✅ LOADED (${apiKey.substring(0, 8)}...)`);
} else {
    console.warn("⚠️ Gemini API Key Status: ❌ MISSING — Image-based PDF extraction will fail.");
}

/**
 * Executes a call to Gemini 1.5 Flash for multimodal extraction.
 * @param {Array} contents - Array of inlineData parts (base64 images)
 * @param {string} prompt - The extraction instruction prompt
 */
export async function executeGeminiVisionCall(contents, prompt) {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing in .env — cannot use OCR pipeline.");
    }

    console.log("🌐 Calling Gemini 2.5 Flash API...");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
        prompt,
        ...contents
    ]);

    const response = await result.response;
    const text = response.text();
    console.log(`✅ Gemini response received (${text.length} chars)`);
    return text;
}
