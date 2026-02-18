import { executeGroqCall } from "./groqClient.js";

// Groq models
const TEXT_MODEL = "llama-3.3-70b-versatile";

const QUOTATION_PROMPT = `You are an AI Procurement Assistant.
Your task is to interpret a user's natural language request for products and match them against the available inventory.

INPUTS:
1. User Request: A text string describing what they need (e.g., "I need 5 laptops and 10 office chairs").
2. Inventory Context: A list of available products with IDs, Names, Categories, and SKUs.

INSTRUCTIONS:
- Analyze the user's request to identify **Purchase Intent**.
- Map each requested item to a product in the inventory **ONLY if it is a clear match** (same model, same type, or clear semantic overlap).
- **DO NOT** perform generic category-only matches (e.g., matching "laptop" to a generic "Electronics" item if it's not actually a laptop).
- If a high-confidence match is found, return it in the "available" list with the *inventory product ID* and the *requested quantity*.
- If a product is NOT found or the match is ambiguous, add it to the "missing" list with the *requested name* and *quantity*.
- Infer quantities: "a laptop" = 1, "two chairs" = 2. If no quantity specified, default to 1.

OUTPUT FORMAT:
Return ONLY a raw JSON object (no markdown, no explanations) with this schema:
{
  "available": [
    { "id": 1, "quantity": 5, "matchReason": "Matched 'laptops' to 'MacBook Pro' (Electronics)" }
  ],
  "missing": [
    { "name": "Office Chair", "quantity": 10 }
  ]
}
`;

export async function parseQuotationRequest(query, inventory) {
    // Simplify inventory to save tokens
    const inventoryContext = inventory.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category
    }));

    try {
        const completion = await executeGroqCall(groq => groq.chat.completions.create({
            model: TEXT_MODEL,
            messages: [
                {
                    role: "user",
                    content: `${QUOTATION_PROMPT}\n\nUser Request: "${query}"\n\nInventory Context:\n${JSON.stringify(inventoryContext)}`
                },
            ],
            temperature: 0.1,
            max_tokens: 2048,
        }));

        return parseResponse(completion);

    } catch (error) {
        console.error("❌ AI Quotation Error:", error.message);
        console.warn("⚠️  Falling back to simulation due to API failure.");
        return simulateQuotation(query, inventory);
    }
}

function parseResponse(completion) {
    const text = completion.choices[0]?.message?.content || "";
    const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    try {
        const parsed = JSON.parse(cleaned);
        // Validate structure
        if (!parsed.available || !parsed.missing) {
            throw new Error("Invalid JSON structure");
        }
        return parsed;
    } catch (e) {
        console.error("Failed to parse AI response:", text);
        throw new Error("AI returned invalid JSON");
    }
}

function simulateQuotation(query, inventory) {
    // Simple local fallback using string matching if no API key
    const terms = query.toLowerCase().split(/\s+/);
    const available = [];
    const missing = [];

    // Simple local fallback using word matching if no API key
    inventory.forEach(p => {
        const productName = p.name.toLowerCase();
        // Check if any significant term from the query is actually IN the product name
        // (Avoiding generic short words like 'and', 'the', 'item')
        if (terms.some(t => {
            if (['need', 'want', 'laptop', 'office', 'chairs', 'laptops'].includes(t)) {
                // Prioritize specific keywords
                return productName.includes(t);
            }
            return t.length > 3 && productName.includes(t);
        })) {
            available.push({ id: p.id, quantity: 1, matchReason: "Simulated Keyword Match" });
        }
    });

    if (available.length === 0) {
        missing.push({ name: "Unknown Item", quantity: 1 });
    }

    return { available, missing };
}
