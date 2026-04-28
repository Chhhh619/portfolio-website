import { useEffect, useState } from 'react'
import { extractOverlayColor } from '../lib/extractColor'
import './ProjectModal.css'

const DURATION = 550
const CLOSE_BUFFER = 60 // extra ms after morph transition to keep overlay mounted

function ProjectModal({ project, origin, onClose }) {
    const [state, setState] = useState('idle') // idle | opening | open | closing
    const [overlayColor, setOverlayColor] = useState(null)
    const [viewport, setViewport] = useState(() => ({
        w: typeof window !== 'undefined' ? window.innerWidth : 0,
        h: typeof window !== 'undefined' ? window.innerHeight : 0,
    }))

    // Mount / unmount lifecycle
    useEffect(() => {
        if (project && origin) {
            document.body.style.overflow = 'hidden'
            setState('opening')
            return () => {
                document.body.style.overflow = ''
            }
        }
    }, [project, origin])

    // Extract dominant color from thumbnail
    useEffect(() => {
        if (!project) {
            setOverlayColor(null)
            return
        }
        let cancelled = false
        extractOverlayColor(project.image).then((color) => {
            if (cancelled) return
            setOverlayColor(color)
        })
        return () => {
            cancelled = true
        }
    }, [project])

    // Promote opening → open after first paint (setTimeout avoids React 18 batching)
    useEffect(() => {
        if (state !== 'opening') return
        const id = setTimeout(() => setState('open'), 20)
        return () => clearTimeout(id)
    }, [state])

    // Escape key to close
    useEffect(() => {
        if (!project) return
        const onKey = (e) => {
            if (e.key === 'Escape') handleClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project, state])

    // Track viewport for responsive morph targets
    useEffect(() => {
        const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const handleClose = () => {
        if (state === 'closing' || state === 'idle') return
        setState('closing')
        setTimeout(() => {
            setState('idle')
            onClose()
        }, DURATION + CLOSE_BUFFER)
    }

    if (!project || !origin) return null

    // Target 90% x 90% frame geometry — used to center the morph image
    const sizePct = 0.9
    const targetW = viewport.w * sizePct
    const targetH = viewport.h * sizePct
    const targetY = (viewport.h - targetW) / 2

    // Centered morphing image target — preserves card aspect ratio
    const cardAspect = origin.width / origin.height || 1.5
    const isMobile = viewport.w <= 760
    const imgMaxW = Math.min(targetW * 0.68, 760)
    const imgMaxH = Math.min(targetH * 0.5, 520)
    let imgW = isMobile ? origin.width : imgMaxW
    let imgH = isMobile ? origin.height : imgW / cardAspect
    if (!isMobile && imgH > imgMaxH) {
        imgH = imgMaxH
        imgW = imgH * cardAspect
    }
    const imgX = (viewport.w - imgW) / 2
    const imgY = isMobile
        ? Math.max(40, viewport.h * 0.12)
        : Math.max(targetY + targetH * 0.08, viewport.h * 0.05 + 40)

    const isOpen = state === 'open'
    const isClosing = state === 'closing'
    const isOpening = state === 'opening'

    const morphStyle =
        isOpen
            ? { left: imgX, top: imgY, width: imgW, height: imgH }
            : { left: origin.left, top: origin.top, width: origin.width, height: origin.height }

    const shadowLayers = 3
    const contentTop = imgY + imgH + (isMobile ? 44 : 40)

    const bgStyle = {
        background: overlayColor || project.accent || '#0a0a0a',
    }

    return (
        <div
            className={`pm-overlay ${isOpen ? 'is-open' : ''} ${isClosing ? 'is-closing' : ''} ${isOpening ? 'is-opening' : ''}`}
            style={{ '--pm-dur': `${DURATION}ms` }}
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} details`}
        >
            {/* Accent background tint */}
            <div className="pm-bg" style={bgStyle} onClick={handleClose} />

            {/* Morphing card with stacked shadow layers — renders full card content for seamless close */}
            <div className="pm-morph" style={morphStyle}>
                {Array.from({ length: shadowLayers }).map((_, i) => {
                    const n = shadowLayers - i
                    return (
                        <div
                            key={i}
                            className="pm-morph-shadow"
                            style={{
                                transform: `translate(${n * 14}px, ${n * 16}px)`,
                                opacity: 0.22 + (shadowLayers - n) * 0.08,
                            }}
                        />
                    )
                })}
                <div className="pm-morph-inner">
                    <div className="pm-morph-image">
                        <img src={project.image} alt={project.title} />
                    </div>
                    <div className="pm-morph-info">
                        <h3>{project.title}</h3>
                        <div className="pm-morph-tags">
                            {project.tags.map((tag) => (
                                <span key={tag} className="pm-morph-tag">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Close button */}
            <button
                type="button"
                className="pm-close"
                onClick={handleClose}
                aria-label="Close"
            >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M5 5 L19 19 M19 5 L5 19" />
                </svg>
            </button>

            {/* Content below the morphed image */}
            <div className="pm-content" style={{ top: contentTop }}>
                <div className="pm-title-row">
                    <div>
                        <div className="pm-eyebrow">{project.subtitle}</div>
                        <h2 className="pm-title">{project.title}</h2>
                    </div>

                    {project.link && (
                        <a
                            className="pm-visit"
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span>Visit the site</span>
                            <span className="pm-visit-arrow">→</span>
                        </a>
                    )}
                </div>

                <div className="pm-grid">
                    <div className="pm-col">
                        <div className="pm-label">Project Description</div>
                        <p className="pm-desc">{project.fullDescription || project.description}</p>
                    </div>
                    <div className="pm-col">
                        <div className="pm-label">Tech Stack</div>
                        <div className="pm-pills">
                            {(project.techStack || project.tags).map((item) => (
                                <span key={item} className="pm-pill">{item}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectModal
