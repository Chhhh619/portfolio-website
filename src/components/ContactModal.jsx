import { useEffect, useRef, useState } from 'react'
import { contacts } from '../lib/contacts'
import './ContactModal.css'

const EXIT_MS = 200

// Hairline marks at strokeWidth 1.5 to match the arrows and close glyph
// used elsewhere in the site. Outlines follow Feather (MIT).
const icons = {
    email: (
        <>
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <polyline points="22,6 12,13 2,6" />
        </>
    ),
    whatsapp: (
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    ),
    linkedin: (
        <>
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
        </>
    ),
    github: (
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    ),
}

function ContactModal({ open, onClose }) {
    const [render, setRender] = useState(open)
    const [closing, setClosing] = useState(false)
    const renderedRef = useRef(open)
    const panelRef = useRef(null)
    const closeRef = useRef(null)

    // Mount immediately on open; keep mounted through the exit animation
    useEffect(() => {
        if (open) {
            renderedRef.current = true
            setRender(true)
            setClosing(false)
            return
        }
        if (!renderedRef.current) return
        setClosing(true)
        const id = setTimeout(() => {
            renderedRef.current = false
            setRender(false)
            setClosing(false)
        }, EXIT_MS)
        return () => clearTimeout(id)
    }, [open])

    // Lock page scroll while open; hand focus back to the trigger on close
    useEffect(() => {
        if (!open) return
        const trigger = document.activeElement
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = previousOverflow
            if (trigger instanceof HTMLElement) trigger.focus()
        }
    }, [open])

    // Move focus into the panel once it is actually in the DOM
    useEffect(() => {
        if (!open || !render) return
        closeRef.current?.focus()
    }, [open, render])

    // Escape closes; Tab cycles within the panel
    useEffect(() => {
        if (!open) return
        const onKey = (e) => {
            if (e.key === 'Escape') {
                onClose()
                return
            }
            if (e.key !== 'Tab') return
            const focusable = panelRef.current?.querySelectorAll('a[href], button:not([disabled])')
            if (!focusable?.length) return
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first.focus()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    if (!render) return null

    return (
        <div className={`cm-overlay ${closing ? 'is-closing' : ''}`}>
            <div className="cm-backdrop" onClick={onClose} />

            <div
                className="cm-panel"
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cm-title"
            >
                <button
                    type="button"
                    className="cm-close"
                    ref={closeRef}
                    onClick={onClose}
                    aria-label="Close contact options"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M5 5 L19 19 M19 5 L5 19" />
                    </svg>
                </button>

                <div className="cm-eyebrow">Get in touch</div>
                <h2 className="cm-title" id="cm-title">Let's talk.</h2>

                <ul className="cm-list">
                    {contacts.map((channel) => (
                        <li key={channel.id}>
                            <a
                                className="cm-row"
                                href={channel.href}
                                target={channel.external ? '_blank' : undefined}
                                rel={channel.external ? 'noopener noreferrer' : undefined}
                            >
                                <span className="cm-row-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        {icons[channel.id]}
                                    </svg>
                                </span>
                                <span className="cm-row-text">
                                    <span className="cm-row-label">{channel.label}</span>
                                    <span className="cm-row-detail">{channel.detail}</span>
                                </span>
                                <span className="cm-row-arrow" aria-hidden="true">→</span>
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="cm-foot">Selangor, Malaysia</div>
            </div>
        </div>
    )
}

export default ContactModal
