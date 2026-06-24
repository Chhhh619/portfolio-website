import { useRef, useState } from 'react'
import './FinanceDemo.css'

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result
            const comma = result.indexOf(',')
            resolve({
                mimeType: file.type || 'image/jpeg',
                data: comma >= 0 ? result.slice(comma + 1) : result,
                dataUrl: result,
            })
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

async function callGemini({ mimeType, data }) {
    const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mimeType, data }),
    })

    const json = await res.json()
    if (!res.ok) {
        throw new Error(json.error || `Server error ${res.status}`)
    }

    return json.transactions
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
        try {
            const { mimeType, data, dataUrl } = await fileToBase64(file)
            setPreview(dataUrl)
            setFileMeta({ mimeType, data })
        } catch (e) {
            setError('Could not read the selected file.')
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
            const transactions = await callGemini(fileMeta)
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
                    Upload or snap a receipt / payment notification. The image goes straight to Gemini 2.5 Flash and comes back as structured transactions. No account, no storage — purely a demo of the PocketRinggit extraction pipeline.
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
                                        ? 'Saved 1 transaction'
                                        : `Saved ${results.length} transactions`}
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
