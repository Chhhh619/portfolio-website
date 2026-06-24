const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const SYSTEM_PROMPT = [
    'You are a financial transaction extractor for a Malaysian budgeting app.',
    'Extract financial transactions from the input image (receipts, bank notifications, e-wallet notifications, or any spending screenshot).',
    '',
    'IMPORTANT RULES:',
    '- For receipts: extract ONE transaction using the FINAL TOTAL amount (after tax/service charge). Do NOT extract subtotals, individual items, or tax lines as separate transactions.',
    '- For bank/e-wallet notifications: extract each distinct transaction.',
    '- The merchant should be the store or business name, NOT individual item names.',
    '- If the input has multiple unrelated transactions, extract each one.',
    '',
    'Assign ONE category from this list: Food, Drinks, Groceries, Transport, Shopping, Bills, Entertainment, Health, Income, Others.',
    "If none fit well, use 'Others' and set confidence lower.",
    '',
    'For each transaction return a JSON object with:',
    '- amount: number (positive, final amount paid in MYR)',
    "- merchant: string (business/store name, e.g. 'McDonald\\'s', 'Grab', 'Touch n Go')",
    '- direction: "expense" or "income"',
    '- category: string (from the list above)',
    '- source: "receipt"',
    '- confidence: number 0-1',
    '- transaction_at: ISO datetime string if visible, otherwise omit.',
    '',
    'Return a JSON array only. No markdown, no explanation.',
    'If no financial transaction is found, return: []',
].join('\n')

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key not configured on the server.' })
    }

    const { mimeType, data } = req.body ?? {}
    if (!mimeType || !data) {
        return res.status(400).json({ error: 'Missing mimeType or data in request body.' })
    }

    const body = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ inlineData: { mimeType, data } }] }],
        generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
        },
    }

    let geminiRes
    try {
        geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
    } catch (e) {
        return res.status(502).json({ error: `Failed to reach Gemini: ${e.message}` })
    }

    if (!geminiRes.ok) {
        const errText = await geminiRes.text()
        return res.status(geminiRes.status).json({ error: `Gemini ${geminiRes.status}: ${errText.slice(0, 300)}` })
    }

    const payload = await geminiRes.json()
    const content = payload.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) {
        return res.status(500).json({ error: 'No content returned from Gemini.' })
    }

    let transactions
    try {
        transactions = JSON.parse(content)
    } catch {
        return res.status(500).json({ error: `Could not parse Gemini response: ${content.slice(0, 200)}` })
    }

    if (!Array.isArray(transactions)) {
        return res.status(500).json({ error: 'Gemini did not return a JSON array.' })
    }

    return res.status(200).json({ transactions })
}
