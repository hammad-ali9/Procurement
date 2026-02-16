import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

/**
 * Orchestrates high-fidelity procurement data extraction using Gemini AI.
 * Transforms a single PO into a "Triangulated" multi-document JSON.
 */
export async function extractFromDocument(fileBuffer, mimeType) {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        // Fallback for demo if key is missing, though we should ideally error out
        console.warn("⚠️ GOOGLE_GEMINI_API_KEY is missing. Falling back to mock data for demo.");
        return await simulateAIExtraction();
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
        You are an expert Procurement Digitization Engine. Your task is to analyze the provided Purchase Order document and extract ALL relevant information.
        
        Then, "Triangulate" this information into THREE distinct document types for our platform:
        1. SALES INVOICE: The primary billable document.
        2. DELIVERY INVOICE: Document focused on shipping and quantities.
        3. PURCHASE INVOICE: The internal procurement record.

        OUTPUT REQUIREMENTS:
        - Return ONLY a JSON array containing these 3 objects.
        - Ensure all quantities, rates, and tax calculations are logically consistent.
        - Use this EXACT schema for each object:
          {
            "type": "Sales Invoice" | "Delivery Invoice" | "Purchase Invoice",
            "customer": "Extracted Company Name",
            "date": "Extracted Date (e.g., Feb 16, 2024)",
            "total": number (Subtotal + Tax + Delivery),
            "status": "In Review",
            "items": [
              { "id": number, "desc": "Item Description", "qty": number, "rate": number }
            ],
            "taxRate": number (Extracted tax percentage or 0),
            "delivery": number (Extracted delivery charge or 0)
          }

        If information is missing, use your best logical inference based on standard SaaS procurement patterns.
    `;

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: fileBuffer.toString("base64"),
                    mimeType,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Sanitize response (remove markdown code blocks if AI included them)
        const cleanJson = text.replace(/```json|```/gi, "").trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Gemini AI failed to process document: " + error.message);
    }
}

/**
 * Fallback simulation so the app still "works" visually for the user 
 * even if they haven't set up the API key yet.
 */
async function simulateAIExtraction() {
    await new Promise(r => setTimeout(r, 2000));
    const timestamp = Date.now();
    const newGroupId = `GRP-${timestamp}`;
    return [
        {
            id: `SAL-${timestamp}`,
            groupId: newGroupId,
            type: 'Sales Invoice',
            customer: 'Demo extracted Corp',
            date: new Date().toLocaleDateString(),
            total: 1150.00,
            status: 'In Review',
            items: [{ id: 1, desc: 'Hardware & Systems (Simulated)', qty: 1, rate: 1000 }],
            taxRate: 15, delivery: 0
        },
        {
            id: `DLV-${timestamp}`,
            groupId: newGroupId,
            type: 'Delivery Invoice',
            customer: 'Demo extracted Corp',
            date: new Date().toLocaleDateString(),
            total: 50.00,
            status: 'In Review',
            items: [{ id: 1, desc: 'Global Logistics (Simulated)', qty: 1, rate: 50 }],
            taxRate: 0, delivery: 0
        },
        {
            id: `PUR-${timestamp}`,
            groupId: newGroupId,
            type: 'Purchase Invoice',
            customer: 'Demo extracted Corp',
            date: new Date().toLocaleDateString(),
            total: 1200.00,
            status: 'In Review',
            items: [{ id: 1, desc: 'Enterprise Hardware (Simulated)', qty: 1, rate: 1200 }],
            taxRate: 0, delivery: 0
        }
    ];
}
