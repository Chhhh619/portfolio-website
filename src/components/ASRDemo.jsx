import { useState, useRef, useEffect } from 'react'
import './ASRDemo.css'

// HuggingFace Space URL
const SPACE_URL = 'Chhhh619/whisper-hk-asr'

function ASRDemo() {
    const [audioFile, setAudioFile] = useState(null)
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [transcription, setTranscription] = useState('')
    const [error, setError] = useState('')
    const [dragActive, setDragActive] = useState(false)
    const [spaceStatus, setSpaceStatus] = useState('unknown') // 'unknown', 'waking', 'ready', 'error'
    const fileInputRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const sectionRef = useRef(null)
    const hasWarmedUp = useRef(false)

    // Warm up the Space when section becomes visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasWarmedUp.current) {
                    hasWarmedUp.current = true
                    warmUpSpace()
                }
            },
            { threshold: 0.1 }
        )

        if (sectionRef.current) {
            observer.observe(sectionRef.current)
        }

        return () => observer.disconnect()
    }, [])

    const warmUpSpace = async () => {
        setSpaceStatus('waking')
        try {
            // Simple fetch to wake up the Space
            const response = await fetch(`https://${SPACE_URL.replace('/', '-')}.hf.space/`, {
                method: 'HEAD',
                mode: 'no-cors'
            })
            // Give it a moment then check if it's ready
            setTimeout(async () => {
                try {
                    const { Client } = await import('@gradio/client')
                    await Client.connect(SPACE_URL)
                    setSpaceStatus('ready')
                } catch {
                    setSpaceStatus('waking') // Still waking up
                }
            }, 3000)
        } catch {
            setSpaceStatus('waking') // Still waking up
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('audio/')) {
            setAudioFile(file)
            setError('')
        } else {
            setError('Please upload an audio file')
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setAudioFile(file)
            setError('')
        }
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaRecorderRef.current = new MediaRecorder(stream)
            audioChunksRef.current = []

            mediaRecorderRef.current.ondataavailable = (e) => {
                audioChunksRef.current.push(e.data)
            }

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })
                setAudioFile(file)
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorderRef.current.start()
            setIsRecording(true)
        } catch (err) {
            setError('Microphone access denied. Please allow microphone access.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const transcribeAudio = async () => {
        if (!audioFile) {
            setError('Please upload or record an audio file first')
            return
        }

        setIsProcessing(true)
        setError('')
        setTranscription('')

        try {
            // Import Gradio client dynamically
            const { Client } = await import('@gradio/client')

            // Connect to HuggingFace Space
            const client = await Client.connect(SPACE_URL)
            setSpaceStatus('ready')

            // Call the transcribe function
            const result = await client.predict('/transcribe', {
                audio: audioFile,
            })

            const transcriptionText = result.data[0]
            setTranscription(transcriptionText || 'No transcription generated.')

        } catch (err) {
            console.error('Transcription error:', err)

            // Check if it's a connection error (Space not deployed yet)
            if (err.message?.includes('Could not connect') || err.message?.includes('fetch')) {
                setError(
                    'Unable to connect to the ASR service. The HuggingFace Space may not be deployed yet. ' +
                    'Please deploy the Space first, then try again.'
                )
            } else {
                setError(`Transcription failed: ${err.message || 'Please try again.'}`)
            }
        } finally {
            setIsProcessing(false)
        }
    }

    const clearAll = () => {
        setAudioFile(null)
        setTranscription('')
        setError('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <section className="asr-demo section" id="asr-demo" ref={sectionRef}>
            <div className="container">
                <h2 className="section-title">
                    Try My <span className="gradient-text">ASR Model</span>
                </h2>
                <p className="section-subtitle">
                    Experience my fine-tuned Whisper Large V3 model for Hong Kong Cantonese speech recognition.
                    Upload an audio file or record directly from your browser.
                </p>

                <div className="asr-container glass-card">
                    <div className="asr-input-section">
                        {/* Drag and Drop Zone */}
                        <div
                            className={`drop-zone ${dragActive ? 'active' : ''} ${audioFile ? 'has-file' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*"
                                onChange={handleFileChange}
                                hidden
                            />

                            {audioFile ? (
                                <div className="file-info">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 18V5l12-2v13" />
                                        <circle cx="6" cy="18" r="3" />
                                        <circle cx="18" cy="16" r="3" />
                                    </svg>
                                    <span className="file-name">{audioFile.name}</span>
                                    <span className="file-size">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                            ) : (
                                <div className="drop-content">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    <p>Drag & drop your audio file here</p>
                                    <span>or click to browse</span>
                                </div>
                            )}
                        </div>

                        {/* Record Button */}
                        <div className="record-section">
                            <span className="divider-text">or</span>
                            <button
                                className={`record-btn ${isRecording ? 'recording' : ''}`}
                                onClick={isRecording ? stopRecording : startRecording}
                            >
                                <span className="record-indicator"></span>
                                {isRecording ? 'Stop Recording' : 'Record Audio'}
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button
                                className="btn btn-primary"
                                onClick={transcribeAudio}
                                disabled={!audioFile || isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="spinner"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                                        </svg>
                                        Transcribe
                                    </>
                                )}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={clearAll}
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="asr-output-section">
                        <h3>Transcription Result</h3>

                        {error && (
                            <div className="error-message">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="transcription-box">
                            {transcription ? (
                                <p className="transcription-text">{transcription}</p>
                            ) : (
                                <p className="placeholder-text">
                                    Your transcription will appear here...
                                </p>
                            )}
                        </div>

                        <div className="model-info">
                            <span className={`info-badge status-${spaceStatus}`}>
                                {spaceStatus === 'ready' && '✅ Model Ready'}
                                {spaceStatus === 'waking' && '⏳ Waking up model...'}
                                {spaceStatus === 'unknown' && '💤 Model sleeping'}
                                {spaceStatus === 'error' && '❌ Model unavailable'}
                            </span>
                            <span className="info-badge">
                                🤖 Chhhh619/whisper-large-v3-hongkongtuned
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ASRDemo
