import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { extractFromDocument } from './services/extractService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Extraction Entry Point
app.post('/api/extract', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No document uploaded' });
        }

        console.log(`Processing document: ${req.file.originalname}`);

        const result = await extractFromDocument(req.file.buffer, req.file.mimetype);

        res.json(result);
    } catch (error) {
        console.error('Extraction Error:', error);
        res.status(500).json({ error: 'AI Extraction failed', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 AI Extraction Server running at http://localhost:${port}`);
});
