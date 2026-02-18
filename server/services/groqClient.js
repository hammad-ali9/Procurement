import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

// Get keys from .env, split by comma, and filter out empty strings
const apiKeys = (process.env.GROQ_API_KEYS || "").split(',').map(k => k.trim()).filter(k => k);

if (apiKeys.length === 0 && process.env.GROQ_API_KEY) {
    apiKeys.push(process.env.GROQ_API_KEY);
}

let currentKeyIndex = 0;

/**
 * Rotates to the next API key.
 */
function rotateKey() {
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    console.log(`🔄 Switching to API Key Index: ${currentKeyIndex}`);
}

/**
 * Wrapper for Groq API calls with automatic key rotation on failure.
 * @param {Function} apiCall - Function that accepts a Groq client and returns a promise.
 */
export async function executeGroqCall(apiCall) {
    if (apiKeys.length === 0) {
        throw new Error("No Groq API keys found in .env (GROQ_API_KEYS or GROQ_API_KEY).");
    }

    let attempts = 0;
    const maxAttempts = apiKeys.length * 2; // Try each key twice at most

    while (attempts < maxAttempts) {
        const apiKey = apiKeys[currentKeyIndex];
        const groq = new Groq({ apiKey });

        try {
            return await apiCall(groq);
        } catch (error) {
            attempts++;
            console.warn(`⚠️ Groq API Error (Key Index ${currentKeyIndex}): ${error.message}`);

            // If it's a rate limit (429) or authentication error (401), rotate key
            if (error.status === 429 || error.status === 401 || error.message.includes("429") || error.message.includes("401")) {
                rotateKey();
            } else {
                // If it's a different error (e.g., bad request), throw it immediately
                // preventing infinite loops on bad input
                // throw error; // Actually, let's retry even on other errors just in case, but maybe log it differently
                rotateKey(); // For now, rotate on any error to be safe as per user request "use any api... until resolved"
            }
        }
    }

    throw new Error("All Groq API keys failed.");
}
