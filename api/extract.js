// Server-side proxy for the PocketRinggit demo (FinanceDemo).
// Keeps the Gemini key off the client and validates everything crossing
// the boundary: the uploaded image on the way in, the model output on the way out.

const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
// Image requests to Gemini routinely take 25-40 s; stays under the 60 s maxDuration in vercel.json.
const GEMINI_TIMEOUT_MS = 55_000

// Vercel caps request bodies at 4.5 MB. The client downscales before upload,
// so a real receipt lands well under this.
const MAX_BODY_BYTES = 4 * 1024 * 1024
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/

// Best-effort limiter: state lives per function instance, so it slows abuse
// rather than guaranteeing a global cap. The Gemini quota is the hard backstop.
const RATE_LIMIT = 8
const RATE_WINDOW_MS = 10 * 60 * 1000
const hits = new Map()

const MAX_TRANSACTIONS = 20
const MAX_AMOUNT = 10_000_000

const CATEGORIES = [
    'Food', 'Drinks', 'Groceries', 'Transport', 'Shopping',
    'Bills', 'Entertainment', 'Health', 'Income', 'Others',
]

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
    `Assign ONE category from this list: ${CATEGORIES.join(', ')}.`,
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

function log(requestId, stage, extra = {}) {
    console.log(JSON.stringify({ requestId, stage, ...extra }))
}

function reply(status, requestId, body) {
    return Response.json({ ...body, requestId }, { status })
}

function fail(status, requestId, message) {
    return reply(status, requestId, { status: 'error', message })
}

function isSameOrigin(request) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
    if (!origin || !host) return false
    try {
        return new URL(origin).host === host
    } catch {
        return false
    }
}

function isRateLimited(ip) {
    const now = Date.now()
    const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS)
    if (recent.length >= RATE_LIMIT) {
        hits.set(ip, recent)
        return true
    }
    recent.push(now)
    hits.set(ip, recent)
    if (hits.size > 5000) hits.clear()
    return false
}

function clientIp(request) {
    const forwarded = request.headers.get('x-forwarded-for')
    return (forwarded && forwarded.split(',')[0].trim()) || request.headers.get('x-real-ip') || 'unknown'
}

// Model output is untrusted: coerce each entry to the exact shape the UI renders,
// drop anything without a usable amount.
function sanitizeTransaction(raw) {
    if (!raw || typeof raw !== 'object') return null
    const amount = Number(raw.amount)
    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) return null

    const merchant = typeof raw.merchant === 'string' && raw.merchant.trim()
        ? raw.merchant.trim().slice(0, 120)
        : 'Unknown merchant'
    const confidence = Number(raw.confidence)
    const tx = {
        amount: Math.round(amount * 100) / 100,
        merchant,
        direction: raw.direction === 'income' ? 'income' : 'expense',
        category: CATEGORIES.includes(raw.category) ? raw.category : 'Others',
        confidence: Number.isFinite(confidence) ? Math.min(Math.max(confidence, 0), 1) : 0,
    }
    if (typeof raw.transaction_at === 'string' && raw.transaction_at.length <= 40
        && !Number.isNaN(Date.parse(raw.transaction_at))) {
        tx.transaction_at = raw.transaction_at
    }
    return tx
}

export async function POST(request) {
    const requestId = crypto.randomUUID()
    log(requestId, 'received')

    if (!isSameOrigin(request)) {
        log(requestId, 'rejected_origin', { origin: request.headers.get('origin') })
        return fail(403, requestId, 'Requests are only accepted from this site.')
    }

    const ip = clientIp(request)
    if (isRateLimited(ip)) {
        log(requestId, 'rate_limited')
        return fail(429, requestId, 'Too many requests. Try again in a few minutes.')
    }

    const declaredLength = Number(request.headers.get('content-length') || 0)
    if (declaredLength > MAX_BODY_BYTES) {
        return fail(413, requestId, 'That image is too large. Try a smaller one.')
    }

    let body
    try {
        const text = await request.text()
        if (text.length > MAX_BODY_BYTES) {
            return fail(413, requestId, 'That image is too large. Try a smaller one.')
        }
        body = JSON.parse(text)
    } catch {
        return fail(400, requestId, 'Malformed request.')
    }

    const { mimeType, data } = body || {}
    if (typeof mimeType !== 'string' || !ALLOWED_MIME.has(mimeType)) {
        return fail(415, requestId, 'Only JPG, PNG, or WebP images are supported.')
    }
    if (typeof data !== 'string' || data.length === 0 || !BASE64_RE.test(data)) {
        return fail(400, requestId, 'Malformed image data.')
    }
    log(requestId, 'validated', { mimeType, bytes: data.length })

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        log(requestId, 'missing_api_key')
        return fail(503, requestId, 'The demo is not configured right now.')
    }

    let geminiRes
    try {
        geminiRes = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: [{ parts: [{ inlineData: { mimeType, data } }] }],
                generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
            }),
            signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        })
    } catch (err) {
        log(requestId, 'gemini_unreachable', { error: String(err?.name || err) })
        return fail(502, requestId, 'The AI service did not respond. Try again.')
    }

    if (!geminiRes.ok) {
        const detail = (await geminiRes.text().catch(() => '')).slice(0, 500)
        log(requestId, 'gemini_error', { status: geminiRes.status, detail })
        const message = geminiRes.status === 429
            ? 'The demo is busy right now. Try again in a minute.'
            : 'The AI service returned an error. Try again.'
        return fail(502, requestId, message)
    }

    let parsed
    try {
        const payload = await geminiRes.json()
        const content = payload?.candidates?.[0]?.content?.parts?.[0]?.text
        parsed = JSON.parse(content)
    } catch {
        log(requestId, 'gemini_unparseable')
        return fail(502, requestId, 'The AI returned something unreadable. Try another image.')
    }
    if (!Array.isArray(parsed)) {
        log(requestId, 'gemini_not_array')
        return fail(502, requestId, 'The AI returned something unreadable. Try another image.')
    }

    const transactions = parsed
        .slice(0, MAX_TRANSACTIONS)
        .map(sanitizeTransaction)
        .filter(Boolean)
    log(requestId, 'done', { raw: parsed.length, kept: transactions.length })

    return reply(200, requestId, { status: 'ok', transactions })
}
