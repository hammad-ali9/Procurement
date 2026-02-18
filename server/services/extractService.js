import { executeGroqCall } from "./groqClient.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// Groq models
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const TEXT_MODEL = "llama-3.3-70b-versatile";

const EXTRACTION_PROMPT = `You are an expert Procurement Document Processor.

Analyze the provided Purchase Order data carefully and extract every piece of information — company names, dates, item descriptions, quantities, unit prices, subtotals, tax rates, delivery/shipping charges, PO numbers, etc.

Then create exactly 3 invoice documents from this data:

1. **Tax Invoice** — The primary billable document with all line items, subtotal, tax, and grand total.
2. **Delivery Challan** — Focused on shipping/logistics with delivery charges and item quantities.
3. **Purchase Invoice** — The internal procurement record summarizing what was ordered and from whom.

CRITICAL RULES:
- Extract the ACTUAL data from the document. Do NOT invent fake data.
- All item descriptions, quantities, and rates must come from the document.
- All monetary values should be in PKR (Pakistani Rupees). Do NOT add currency symbols to the numbers.
- If tax rate is visible, use it. If not, set taxRate to 0.
- If delivery/shipping charge is visible, use it. If not, set delivery to 0.
- The "total" field must equal the sum of (item qty * rate) + tax amount + delivery.
- The "customer" field should be the company name from the PO.
- The "date" should be the date on the PO document.

Return ONLY a raw JSON array (no markdown, no code fences, no explanation) with this exact schema:
[
  {
    "type": "Tax Invoice",
    "customer": "Company Name from PO",
    "date": "Date from PO",
    "total": 1234.56,
    "status": "In Review",
    "items": [
      { "id": 1, "name": "Item name", "sku": "SKU if available", "quantity": 2, "rate": 100.00 }
    ],
    "taxRate": 5,
    "delivery": 25
  },
  {
    "type": "Delivery Challan",
    "customer": "...",
    "date": "...",
    "total": ...,
    "status": "In Review",
    "items": [...],
    "taxRate": 0,
    "delivery": ...
  },
  {
    "type": "Purchase Invoice",
    "customer": "...",
    "date": "...",
    "total": ...,
    "status": "In Review",
    "items": [...],
    "taxRate": 0,
    "delivery": 0
  }
]`;

/**
 * Main extraction function — routes to vision or text pipeline.
 */
export async function extractFromDocument(fileBuffer, mimeType) {
    try {
        const isImage = mimeType.startsWith("image/");
        const isPdf = mimeType === "application/pdf";

        if (isImage) {
            // Direct image → vision model
            return await extractFromImage(fileBuffer, mimeType);
        } else if (isPdf) {
            // Try text extraction first; if no text, convert to image
            return await extractFromPdf(fileBuffer);
        } else {
            throw new Error(`Unsupported file type: ${mimeType}. Upload an image (JPG/PNG) or PDF.`);
        }
    } catch (error) {
        console.warn(`⚠️ API/Processing Error: ${error.message}. Simulation fallback engaged.`);
        // If API fails completely, fallback to simulation
        return simulateExtraction();
    }
}

/**
 * IMAGE PIPELINE: Sends image directly to Groq's vision model.
 */
async function extractFromImage(imageBuffer, mimeType) {
    console.log(`   🖼️  Using Vision model: ${VISION_MODEL}`);

    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const completion = await executeGroqCall(groq => groq.chat.completions.create({
        model: VISION_MODEL,
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: EXTRACTION_PROMPT },
                    { type: "image_url", image_url: { url: dataUrl } },
                ],
            },
        ],
        temperature: 0.1,
        max_tokens: 4096,
    }));

    return parseResponse(completion);
}

/**
 * PDF PIPELINE:
 * 1. Try extracting selectable text → send to text model
 * 2. If no text (scanned PDF) → convert to PNG image → send to vision model
 */
async function extractFromPdf(fileBuffer) {
    console.log("   📄 Step 1: Trying to extract selectable text from PDF...");

    try {
        const pdfData = await pdfParse(fileBuffer);
        const extractedText = pdfData.text?.trim() || "";

        if (extractedText.length > 30) {
            // PDF has selectable text — use the fast text model
            console.log(`   ✅ Found ${extractedText.length} characters of text.`);
            console.log(`   📝 Preview: "${extractedText.substring(0, 150)}..."`);
            console.log(`   🧠 Using Text model: ${TEXT_MODEL}`);

            const completion = await executeGroqCall(groq => groq.chat.completions.create({
                model: TEXT_MODEL,
                messages: [
                    {
                        role: "user",
                        content: `${EXTRACTION_PROMPT}\n\nHere is the Purchase Order document text:\n\n---\n${extractedText}\n---`,
                    },
                ],
                temperature: 0.1,
                max_tokens: 4096,
            }));

            return parseResponse(completion);
        }
    } catch (err) {
        console.log(`   ⚠️  Text extraction failed: ${err.message}`);
    }

    // Scanned PDF — convert first page to PNG image
    console.log("   📄 Step 2: Scanned PDF detected. Converting to image...");

    try {
        // Dynamic import for pdf-to-img (ESM-only package)
        const { pdf } = await import("pdf-to-img");

        let firstPageBuffer = null;

        const doc = await pdf(fileBuffer, { scale: 2.0 });
        for await (const page of doc) {
            firstPageBuffer = Buffer.from(page);
            break; // Only need the first page
        }

        if (!firstPageBuffer) {
            throw new Error("Could not render any pages from the PDF.");
        }

        console.log(`   ✅ Converted PDF page to PNG (${(firstPageBuffer.length / 1024).toFixed(0)} KB)`);

        // Now send the rendered image to the vision model
        return await extractFromImage(firstPageBuffer, "image/png");

    } catch (conversionError) {
        console.error(`   ❌ PDF-to-image conversion failed: ${conversionError.message}`);
        throw new Error(
            `This PDF is a scanned image with no selectable text, and we could not convert it. ` +
            `Please try uploading the document as a JPG or PNG image instead.`
        );
    }
}

/**
 * Parses the Groq response into structured JSON.
 */
function parseResponse(completion) {
    const text = completion.choices[0]?.message?.content || "";

    console.log("   ✅ AI response received:");
    console.log(`   ${text.substring(0, 400)}...`);

    const cleaned = text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/gi, "")
        .trim();

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("AI returned invalid structure — expected a JSON array.");
    }

    console.log(`   ✅ Successfully extracted ${parsed.length} documents from PO.`);
    return parsed;
}

/**
 * Fallback simulation when no API key is set.
 */
function simulateExtraction() {
    return [
        {
            type: "Tax Invoice",
            customer: "Demo Corp (Fallback Mode)",
            date: new Date().toLocaleDateString(),
            total: 1150, status: "In Review",
            items: [{ id: 1, name: "Configure GROQ_API_KEYS for real extraction", sku: "SETUP-01", quantity: 1, rate: 1000 }],
            taxRate: 15, delivery: 0
        },
        {
            type: "Delivery Challan",
            customer: "Demo Corp",
            date: new Date().toLocaleDateString(),
            total: 50, status: "In Review",
            items: [{ id: 1, name: "Shipping (simulated)", sku: "LOG-01", quantity: 1, rate: 50 }],
            taxRate: 0, delivery: 50
        },
        {
            type: "Purchase Invoice",
            customer: "Demo Corp",
            date: new Date().toLocaleDateString(),
            total: 1200, status: "In Review",
            items: [{ id: 1, name: "Bulk Order (simulated)", sku: "PRC-01", quantity: 1, rate: 1200 }],
            taxRate: 0, delivery: 0
        }
    ];
}
