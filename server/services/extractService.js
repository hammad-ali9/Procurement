import { executeGroqCall } from "./groqClient.js";
import { executeGeminiVisionCall } from "./geminiClient.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// ── Models ──────────────────────────────────────────
const GROQ_TEXT_MODEL = "llama-3.3-70b-versatile";

// ── Prompt for structured extraction (used by BOTH pipelines) ──
const EXTRACTION_PROMPT = `You are an expert Procurement Document Processor.

Analyze the provided Purchase Order data carefully and extract every piece of information — company names, addresses, dates, item names, item specifications, item descriptions, item quantities, unit of measures (UoM), package sizes, unit prices, subtotals, tax rates, delivery/shipping charges, PO numbers, etc.

CRITICAL RULES FOR ACCURACY:
1. WORD-FOR-WORD EXTRACTION: You MUST extract the ACTUAL data from the document verbatim. 
2. NO SUMMARIZATION: Do NOT shorten, summarize, or modify product names or descriptions. Use the exact text found in the document.
3. EXACT COMPANY NAMES: Extract company names and addresses word-for-word. Do NOT correct spelling or change formatting.
4. NO FAKE DATA: Do NOT invent data. If a field is missing, use null or 0 as appropriate.

Then create exactly 3 invoice documents from this data:

1. **Tax Invoice** — The primary billable document with all line items, subtotal, tax, and grand total.
2. **Delivery Challan** — Focused on shipping/logistics with delivery charges and item quantities.
3. **Purchase Invoice** — The internal procurement record summarizing what was ordered and from whom.

ADDITIONAL RULES:
- Extract the ACTUAL data from the document. Do NOT invent fake data.
- All item descriptions, quantities, and rates must come from the document.
- All monetary values should be in PKR (Pakistani Rupees). Do NOT add currency symbols to the numbers.
- If tax rate is visible, use it. If not, set taxRate to 0.
- If delivery/shipping charge is visible, use it. If not, set delivery to 0.
- The "total" field must equal the sum of (item qty * rate) + tax amount + delivery.
- The "customer" field MUST be the party who issued or sent the document (The Buyer/Sender) verbatim. 
- If the document is addressed "To: Muazzam Traders" (or similar), do NOT use that name; use the Sender's name instead.
- The "poNumber" MUST be the actual reference number or PO number found on the document.
- The "date" should be the date on the PO document.

Return ONLY a raw JSON array (no markdown, no code fences, no explanation) with this exact schema:
[
  {
    "type": "Tax Invoice",
    "customer": "Company Name from PO",
    "customerAddress": "Full Address of the Sender",
    "customerPhone": "Sender Phone number",
    "customerEmail": "Sender Email address",
    "poNumber": "PO Number from document",
    "date": "Date from PO",
    "total": 1234.56,
    "status": "In Review",
    "items": [
      { "id": 1, "name": "Item name", "itemDescription": "Item description", "itemQuantity": 2, "unitOfMeasure": "unit of measure", "packageSize": "package size", "itemRate": 100.00 }
    ],
    "taxRate": 5,
    "delivery": 25
  },
  {
    "type": "Delivery Challan",
    "customer": "Company Name from PO",
    "customerAddress": "Full Address",
    "customerPhone": "...",
    "customerEmail": "...",
    "poNumber": "...",
    "date": "...",
    "total": 0,
    "status": "In Review",
    "items": [
      { "id": 1, "name": "Item name", "itemDescription": "...", "itemSpecification": "...", "itemQuantity": 2, "unitOfMeasure": "...", "packageSize": "...", "itemRate": 0 }
    ],
    "taxRate": 0,
    "delivery": ...
  },
  {
    "type": "Purchase Invoice",
    "customer": "Company Name from PO",
    "customerAddress": "Full Address",
    "customerPhone": "...",
    "customerEmail": "...",
    "poNumber": "...",
    "date": "...",
    "total": ...,
    "status": "In Review",
    "items": [
      { "id": 1, "name": "Item name", "itemDescription": "...", "itemSpecification": "...", "itemQuantity": 2, "unitOfMeasure": "...", "packageSize": "...", "itemRate": ... }
    ],
    "taxRate": 0,
    "delivery": 0
  }
]`;

// ── OCR-only prompt for Gemini (just read the text) ─
const OCR_ONLY_PROMPT = `Give me the complete content of this file. Every single word, number, and symbol. Nothing else.`;

// ── MAIN ENTRY POINT ────────────────────────────────
export async function extractFromDocument(fileBuffer, mimeType) {
    try {
        const isImage = mimeType.startsWith("image/");
        const isPdf = mimeType === "application/pdf";

        if (isImage) {
            console.log("📷 Input: Direct Image → OCR + Text Pipeline");
            return await ocrThenExtract([fileBuffer], mimeType);
        } else if (isPdf) {
            return await routePdf(fileBuffer);
        } else {
            throw new Error(`Unsupported file type: ${mimeType}. Upload an image (JPG/PNG) or PDF.`);
        }
    } catch (error) {
        console.error("❌ CRITICAL: Extraction failed. Fallback triggered.");
        console.error(`   Reason: ${error.message}`);
        return simulateExtraction();
    }
}

// ── PDF TYPE DETECTOR & ROUTER ──────────────────────
async function routePdf(fileBuffer) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 Detecting PDF type...");

    let extractedText = "";
    try {
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text?.trim() || "";
    } catch (err) {
        console.warn(`⚠️ Text detection failed: ${err.message}`);
    }

    if (extractedText.length > 150) {
        // ✅ TEXT-BASED PDF → Direct to Groq Llama
        console.log(`✅ TEXT-BASED PDF (${extractedText.length} chars)`);
        console.log(`🧠 Pipeline: Text → Groq Llama`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        return await extractWithGroqText(extractedText);
    } else {
        // 🖼️ IMAGE-BASED PDF → Gemini OCR → Groq Llama
        console.log(`✅ IMAGE-BASED PDF (only ${extractedText.length} chars — scanned/image)`);
        console.log(`🧠 Pipeline: Gemini OCR → Groq Llama`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        return await ocrPdfThenExtract(fileBuffer);
    }
}

// ══════════════════════════════════════════════════════
// PATH 1: TEXT-BASED PDF → Groq Llama directly
// ══════════════════════════════════════════════════════
async function extractWithGroqText(text) {
    console.log("📝 Sending text to Groq Llama for extraction...");

    const completion = await executeGroqCall(groq => groq.chat.completions.create({
        model: GROQ_TEXT_MODEL,
        messages: [
            {
                role: "user",
                content: `${EXTRACTION_PROMPT}\n\nHere is the Purchase Order document text:\n\n---\n${text}\n---`,
            },
        ],
        temperature: 0.1,
        max_tokens: 4096,
    }));

    const rawText = completion.choices[0]?.message?.content || "";
    return parseResponse(rawText);
}

// ══════════════════════════════════════════════════════
// PATH 2: IMAGE-BASED → Step 1: Gemini OCR → Step 2: Groq Llama
// ══════════════════════════════════════════════════════

// Convert PDF to images, then run 2-step pipeline
async function ocrPdfThenExtract(fileBuffer) {
    console.log("📄 Converting PDF to high-res images...");

    const { pdf } = await import("pdf-to-img");
    const pageBuffers = [];

    const doc = await pdf(fileBuffer, { scale: 3.0 });
    let count = 0;
    for await (const page of doc) {
        pageBuffers.push(Buffer.from(page));
        count++;
        if (count >= 3) break;
    }

    if (pageBuffers.length === 0) {
        throw new Error("Could not render any pages from the PDF.");
    }

    console.log(`🖼️ Rendered ${pageBuffers.length} page(s) at 3x scale`);
    return await ocrThenExtract(pageBuffers, "image/png");
}

// The core 2-step pipeline: Gemini OCR → Groq Text
async function ocrThenExtract(imageBuffers, mimeType) {
    // ── STEP 1: Gemini VLM as pure OCR engine ──
    console.log(`\n🔎 STEP 1: Gemini OCR — Reading ${imageBuffers.length} image(s)...`);

    const contents = imageBuffers.map(buffer => ({
        inlineData: {
            data: buffer.toString("base64"),
            mimeType: mimeType
        }
    }));

    const ocrText = await executeGeminiVisionCall(contents, OCR_ONLY_PROMPT);

    console.log(`✅ OCR Complete — Extracted ${ocrText.length} characters of text`);
    console.log("─── OCR Output (first 500 chars) ───");
    console.log(ocrText.substring(0, 500));
    console.log("─────────────────────────────────────");

    if (ocrText.length < 20) {
        throw new Error("OCR extracted too little text — document may be blank or unreadable.");
    }

    // ── STEP 2: Forward OCR text to Groq Llama for structured extraction ──
    console.log(`\n🧠 STEP 2: Groq Llama — Extracting structured data from OCR text...`);

    return await extractWithGroqText(ocrText);
}

// ── RESPONSE PARSER ─────────────────────────────────
function parseResponse(rawText) {
    if (!rawText) throw new Error("AI returned empty content.");

    console.log("✅ AI response received:");
    console.log(`   ${rawText.substring(0, 200)}...`);

    const cleaned = rawText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/gi, "")
        .trim();

    try {
        const parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new Error("Expected a JSON array of documents.");
        }
        console.log(`✅ Successfully extracted ${parsed.length} documents from PO.`);
        return parsed;
    } catch (e) {
        console.error("❌ JSON Parse Error:", e.message);
        console.error("   Raw (first 500):", cleaned.substring(0, 500));
        throw new Error("Failed to parse structured data from AI response.");
    }
}

// ── FALLBACK SIMULATION ─────────────────────────────
function simulateExtraction() {
    return [
        {
            type: "Tax Invoice",
            customer: "Global Heavy Industries (Fallback)",
            customerAddress: "Plot 42, Industrial Area Phase II\nSector 8, Karachi, Pakistan",
            customerPhone: "+92 21 3456 7890",
            customerEmail: "procurement@globalheavy.com",
            poNumber: "PO-2026-X88",
            date: new Date().toLocaleDateString(),
            total: 1150,
            status: "In Review",
            items: [
                { id: 1, name: "API Key Configuration Required", itemDescription: "Please configure your Groq/Gemini API keys for real extraction.", itemSpecification: "System Info", itemQuantity: 1, unitOfMeasure: "Unit", packageSize: "N/A", itemRate: 1000 }
            ],
            taxRate: 15,
            delivery: 0
        },
        {
            type: "Delivery Challan",
            customer: "Global Heavy Industries",
            customerAddress: "Plot 42, Industrial Area Phase II\nSector 8, Karachi, Pakistan",
            customerPhone: "+92 21 3456 7890",
            customerEmail: "procurement@globalheavy.com",
            poNumber: "PO-2026-X88",
            date: new Date().toLocaleDateString(),
            total: 0,
            status: "In Review",
            items: [
                { id: 1, name: "API Key Configuration Required", itemDescription: "Logistics details pending real extraction.", itemSpecification: "System Info", itemQuantity: 1, unitOfMeasure: "Unit", packageSize: "N/A", itemRate: 1000 }
            ],
            taxRate: 0,
            delivery: 50
        },
        {
            type: "Purchase Invoice",
            customer: "Global Heavy Industries",
            customerAddress: "Plot 42, Industrial Area Phase II\nSector 8, Karachi, Pakistan",
            customerPhone: "+92 21 3456 7890",
            customerEmail: "procurement@globalheavy.com",
            poNumber: "PO-2026-X88",
            date: new Date().toLocaleDateString(),
            total: 1200,
            status: "In Review",
            items: [
                { id: 1, name: "API Key Configuration Required", itemDescription: "Internal record pending real extraction.", itemSpecification: "System Info", itemQuantity: 1, unitOfMeasure: "Unit", packageSize: "N/A", itemRate: 1200 }
            ],
            taxRate: 0,
            delivery: 0
        }
    ];
}
