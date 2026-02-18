import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env FIRST, before anything else
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try loading from server/ folder first, then from project root
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🔑 Groq API Key Status:", process.env.GROQ_API_KEY ? "✅ LOADED" : "❌ NOT FOUND");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { extractFromDocument } from './services/extractService.js';
import { parseQuotationRequest } from './services/quotationService.js';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer — in-memory storage, 50MB limit for large PO scans
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        groqKeysLoaded: !!(process.env.GROQ_API_KEY || process.env.GROQ_API_KEYS),
        environment: process.env.VERCEL ? 'production' : 'development'
    });
});

// Main extraction endpoint
app.post('/api/extract', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No document uploaded' });
        }

        console.log(`\n📄 Received file: ${req.file.originalname}`);
        console.log(`   Size: ${(req.file.size / 1024).toFixed(1)} KB`);

        const result = await extractFromDocument(req.file.buffer, req.file.mimetype);

        console.log(`📦 Sending ${result.length} documents back to frontend.\n`);
        res.json(result);
    } catch (error) {
        console.error('❌ Extraction Error:', error.message);
        res.status(500).json({
            error: 'AI Extraction failed',
            details: error.message
        });
    }
});

app.post('/api/parse-quotation', async (req, res) => {
    try {
        const { query, inventory } = req.body;

        if (!query || !inventory) {
            return res.status(400).json({ error: 'Missing query or inventory context' });
        }

        const result = await parseQuotationRequest(query, inventory);
        res.json(result);

    } catch (error) {
        console.error('❌ Quotation Parsing Error:', error.message);
        res.status(500).json({
            error: 'AI Parsing failed',
            details: error.message
        });
    }
});

// Export the app for Vercel
export default app;

// Only listen when running locally
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`\n🚀 AI Extraction Server running at http://localhost:${port}`);
    });
}
