import { useRef, useState } from 'react'
import './FinanceDemo.css'

// Receipts stay legible at this size, and it keeps uploads far below the
// 4.5 MB request cap on the server function.
const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.85
const MAX_FILE_BYTES = 8 * 1024 * 1024

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file)
        const img = new Image()
        img.onload = () => {
            URL.revokeObjectURL(url)
            resolve(img)
        }
        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('decode failed'))
        }
        img.src = url
    })
}

// Re-encodes as a downscaled JPEG, which also strips EXIF metadata such as GPS location.
async function prepareImage(file) {
    const img = await loadImage(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
    return {
        mimeType: 'image/jpeg',
        data: dataUrl.slice(dataUrl.indexOf(',') + 1),
        dataUrl,
    }
}

async function extractTransactions({ mimeType, data }) {
    let res
    try {
        res = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mimeType, data }),
        })
    } catch {
        throw new Error('Could not reach the demo server. Check your connection and try again.')
    }

    const payload = await res.json().catch(() => null)
    if (!res.ok || payload?.status !== 'ok' || !Array.isArray(payload.transactions)) {
        throw new Error(payload?.message || 'The demo is unavailable right now. Try again in a minute.')
    }
    return payload.transactions
}

function FinanceDemo() {
    const [preview, setPreview] = useState(null)
    const [fileMeta, setFileMeta] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [error, setError] = useState(null)
    const [rawJson, setRawJson] = useState(null)
    const fileInputRef = useRef(null)
    const cameraInputRef = useRef(null)

    const handleFile = async (file) => {
        setError(null)
        setResults(null)
        setRawJson(null)
        if (!file) return
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file.')
            return
        }
        if (file.size > MAX_FILE_BYTES) {
            setError('That image is over 8 MB. Try a smaller screenshot or photo.')
            return
        }
        try {
            const { mimeType, data, dataUrl } = await prepareImage(file)
            setPreview(dataUrl)
            setFileMeta({ mimeType, data })
        } catch (e) {
            setError('Could not read this image. Try a JPG or PNG.')
        }
    }

    const onDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
    }

    const onDragOver = (e) => {
        e.preventDefault()
    }

    const runExtraction = async () => {
        if (!fileMeta) return
        setIsLoading(true)
        setError(null)
        setResults(null)
        setRawJson(null)
        try {
            const transactions = await extractTransactions(fileMeta)
            setResults(transactions)
            setRawJson(JSON.stringify(transactions, null, 2))
        } catch (e) {
            setError(e.message || 'Something went wrong.')
        } finally {
            setIsLoading(false)
        }
    }

    const reset = () => {
        setPreview(null)
        setFileMeta(null)
        setResults(null)
        setError(null)
        setRawJson(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        if (cameraInputRef.current) cameraInputRef.current.value = ''
    }

    return (
        <section className="fd section" id="finance-demo">
            <div className="container">
                <div className="section-header">
                    <span className="section-title">Finance Tracker Demo</span>
                </div>

                <p className="fd-subtitle">
                    This is a hands-on demo of <span className="fd-subtitle-name">PocketRinggit</span>, the finance tracker PWA showcased above. It's a simple way to try its core feature yourself: upload or snap a receipt or payment notification, and Gemini 2.5 Flash turns it into structured transactions, just like it does in the app. You don't need an account, and nothing you upload is stored.
                </p>

                <div className="fd-grid">
                    <div className="fd-input-panel">
                        <div
                            className={`fd-dropzone ${preview ? 'has-image' : ''}`}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                        >
                            {preview ? (
                                <img src={preview} alt="Uploaded receipt" className="fd-preview" />
                            ) : (
                                <div className="fd-dropzone-empty">
                                    <div className="fd-icon">
                                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <rect x="3" y="5" width="18" height="14" rx="2" />
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M8 5l1.5-2h5L16 5" />
                                        </svg>
                                    </div>
                                    <div className="fd-dropzone-title">Drop receipt or screenshot</div>
                                    <div className="fd-dropzone-hint">PNG, JPG up to ~8 MB</div>
                                </div>
                            )}
                        </div>

                        <div className="fd-actions">
                            <button
                                type="button"
                                className="fd-btn"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 3v12M7 8l5-5 5 5M5 21h14" />
                                </svg>
                                Upload
                            </button>

                            <button
                                type="button"
                                className="fd-btn"
                                onClick={() => cameraInputRef.current?.click()}
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="6" width="18" height="14" rx="2" />
                                    <circle cx="12" cy="13" r="4" />
                                    <path d="M8 6l1.5-2h5L16 6" />
                                </svg>
                                Take photo
                            </button>

                            {preview && (
                                <button type="button" className="fd-btn fd-btn-ghost" onClick={reset}>
                                    Clear
                                </button>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFile(e.target.files?.[0])}
                        />
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFile(e.target.files?.[0])}
                        />

                        <button
                            type="button"
                            className="fd-btn-primary"
                            onClick={runExtraction}
                            disabled={!fileMeta || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="fd-spinner" />
                                    Extracting…
                                </>
                            ) : (
                                <>Extract transactions</>
                            )}
                        </button>
                    </div>

                    <div className="fd-output-panel">
                        <div className="fd-output-label">Detected transactions</div>

                        {error && (
                            <div className="fd-error">
                                <div className="fd-error-title">Something went wrong</div>
                                <div className="fd-error-body">{error}</div>
                            </div>
                        )}

                        {!error && !results && !isLoading && (
                            <div className="fd-empty">
                                Transactions will appear here once you extract.
                            </div>
                        )}

                        {isLoading && (
                            <div className="fd-skeleton">
                                <div className="fd-skeleton-row" />
                                <div className="fd-skeleton-row" />
                                <div className="fd-skeleton-row" />
                            </div>
                        )}

                        {results && results.length === 0 && !isLoading && (
                            <div className="fd-empty">
                                No transaction detected in this image.
                            </div>
                        )}

                        {results && results.length > 0 && (
                            <>
                                <div className="fd-banner">
                                    {results.length === 1
                                        ? 'Found 1 transaction'
                                        : `Found ${results.length} transactions`}
                                </div>
                                <ul className="fd-tx-list">
                                    {results.map((tx, i) => (
                                        <li key={i} className="fd-tx">
                                            <div className="fd-tx-top">
                                                <div className={`fd-tx-amount ${tx.direction === 'income' ? 'income' : 'expense'}`}>
                                                    {tx.direction === 'income' ? '+' : '−'}
                                                    RM{Number(tx.amount).toFixed(2)}
                                                </div>
                                                <span className="fd-tx-cat">{tx.category || 'Others'}</span>
                                            </div>
                                            <div className="fd-tx-merchant">{tx.merchant}</div>
                                            <div className="fd-tx-meta">
                                                <span>confidence {(Number(tx.confidence) * 100).toFixed(0)}%</span>
                                                {tx.transaction_at && (
                                                    <span>· {new Date(tx.transaction_at).toLocaleString()}</span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {rawJson && (
                            <details className="fd-raw">
                                <summary>Raw JSON</summary>
                                <pre>{rawJson}</pre>
                            </details>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FinanceDemo
