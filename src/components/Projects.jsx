import { useState, useEffect, useRef } from 'react'
import ProjectModal from './ProjectModal'
import './Projects.css'

function Projects() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [modalProject, setModalProject] = useState(null)
    const [modalOrigin, setModalOrigin] = useState(null)
    const sectionRef = useRef(null)

    const projects = [
        {
            id: 'pocketringgit',
            title: 'PocketRinggit',
            subtitle: 'AI Finance Tracker / PWA',
            description: 'Mobile-first Malaysian budgeting app that turns payment notifications and receipt screenshots into categorised transactions with Gemini Flash.',
            fullDescription:
                'A production-grade mobile-first finance tracker built for Malaysian users. It ingests bank/e-wallet notifications and receipt screenshots, then uses Gemini 2.5 Flash via a Supabase Edge Function to extract structured transactions — amount, merchant, direction, category, and confidence. Features multi-entry parsing, smart-merge duplicate detection, user-defined categories that become runtime AI routing options, iOS Shortcuts integration for one-tap capture, and offline-queued writes that sync when back online. Ships as an installable PWA with auth-gated multi-device sync over Supabase Postgres.',
            tags: ['React', 'TypeScript', 'Gemini'],
            techStack: ['React 19', 'TypeScript', 'Vite PWA', 'Tailwind CSS', 'Supabase', 'Gemini 2.5 Flash', 'Zod', 'Radix UI', 'Recharts', 'iOS Shortcuts'],
            image: '/images/pocketringgitdemo.png',
            link: 'https://ai-finance-tracker-59sl.onrender.com/#',
            bgText: 'POCKETRINGGIT',
            accent: '#0f1c17',
            accentEdge: '#3a7a5c',
        },
        {
            id: 'sapot',
            title: 'SAPOT.AI',
            subtitle: 'Sales Assistant Performance Optimization Tool',
            description: 'AI-powered sales enablement platform designed to optimize sales assistant performance and boost team productivity.',
            fullDescription:
                'SAPOT.AI is a sales enablement platform that leverages AI to coach and evaluate sales assistants in real time — surfacing performance insights, flagging conversation gaps, and helping teams convert more consistently across multilingual markets.',
            tags: ['AI', 'SaaS', 'Web Platform'],
            techStack: ['AI', 'Web Platform', 'Sales Enablement', 'Multilingual NLP'],
            image: '/images/sapot.png',
            link: 'https://www.sapot.ai/',
            bgText: 'SAPOT.AI',
            accent: '#0e1328',
            accentEdge: '#4a5dd6',
        },
        {
            id: 'asr',
            title: 'HK Cantonese ASR',
            subtitle: 'AI / Speech Recognition',
            description: 'Fine-tuned Whisper Large V3 for Hong Kong Cantonese speech recognition using LoRA, with optimized hyperparameters for accurate code-switching transcription.',
            fullDescription:
                'A fine-tuned Whisper Large V3 model targeting Hong Kong Cantonese, trained with LoRA adapters to keep compute cost low while dramatically improving accuracy on Cantonese-English code-switching. Hyperparameters were tuned against a held-out evaluation set; the resulting checkpoint is published on the HuggingFace Hub for open use.',
            tags: ['Whisper', 'PyTorch', 'HuggingFace', 'LoRA'],
            techStack: ['PyTorch', 'HuggingFace Transformers', 'Whisper Large V3', 'PEFT / LoRA', 'Python'],
            image: '/images/ASR.png',
            link: 'https://huggingface.co/Chhhh619/whisper-large-v3-hongkongtuned',
            bgText: 'ASR MODEL',
            accent: '#0d1a1f',
            accentEdge: '#4a7d8f',
        },
        {
            id: 'cariseo',
            title: 'CariSEO Landing Page',
            subtitle: 'AI-Powered SEO Platform',
            description: 'Corporate AI SEO platform that leverages artificial intelligence to optimize search engine rankings and provide intelligent recommendations.',
            fullDescription:
                'A corporate marketing site for CariSEO, an AI SEO platform. The landing page communicates the product value proposition — AI-driven ranking optimisation and intelligent content recommendations — across a fast, responsive, SEO-optimised experience.',
            tags: ['AI', 'SEO', 'Web Platform'],
            techStack: ['HTML', 'CSS', 'JavaScript', 'Responsive Design', 'SEO'],
            image: '/images/solutions.png',
            link: 'https://www.cariseo.com/',
            bgText: 'CARISEO',
            accent: '#0c1626',
            accentEdge: '#3d6aa8',
        },
        {
            id: 'bil',
            title: 'Minimalist Mock Up Website',
            subtitle: 'Web Design / Development',
            description: 'Modern, responsive cafe website featuring elegant design, menu display, and seamless user experience.',
            fullDescription:
                'A design-led cafe website exploring minimalist visual language — clean typography, restrained palette, and generous spacing. Built with vanilla HTML/CSS/JavaScript to stay lightweight and easy to host anywhere, with full responsiveness across mobile, tablet, and desktop.',
            tags: ['HTML', 'CSS', 'JavaScript'],
            techStack: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'Vercel'],
            image: '/images/bil.png',
            link: 'https://bil-coffee-website.vercel.app',
            bgText: 'BREW IS LIFE',
            accent: '#1a120a',
            accentEdge: '#8a6232',
        },
        {
            id: 'fyp',
            title: 'Self-Budgeting Mobile App',
            subtitle: 'Cross-Platform Development',
            description: 'Cross-platform mobile applications with modern UI/UX design and seamless user experience.',
            fullDescription:
                'A Flutter-based self-budgeting mobile app built as my final year project. Focuses on a clean cross-platform UX for tracking personal spending and setting budget targets, with offline-first data flow and a modern mobile interface.',
            tags: ['Flutter', 'Dart', 'Mobile'],
            techStack: ['Flutter', 'Dart', 'SQLite', 'Mobile UX'],
            image: '/images/fyp.png',
            link: null,
            bgText: 'MOBILE APP',
            accent: '#131129',
            accentEdge: '#5a5797',
        },
    ]

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return

            const section = sectionRef.current
            const rect = section.getBoundingClientRect()
            const sectionTop = -rect.top
            const totalScrollable = section.offsetHeight - window.innerHeight

            if (sectionTop < 0 || totalScrollable <= 0) {
                setActiveIndex(0)
                return
            }

            const progress = Math.min(sectionTop / totalScrollable, 1)
            const newIndex = Math.min(
                Math.floor(progress * projects.length),
                projects.length - 1
            )
            setActiveIndex(newIndex)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [projects.length])

    const openModal = (project, cardEl) => {
        const rect = cardEl.getBoundingClientRect()
        setModalOrigin({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        })
        setModalProject(project)
    }

    const closeModal = () => {
        setModalProject(null)
    }

    const sectionHeightVh = projects.length * 100

    return (
        <>
            <section
                className="projects-section"
                id="work"
                ref={sectionRef}
                style={{ height: `${sectionHeightVh}vh` }}
            >
                <div className="projects-sticky">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-title">Past Projects</span>
                            <span className="section-count">({projects.length})</span>
                        </div>
                    </div>

                    {/* Background running text */}
                    <div className="project-bg-text-wrapper">
                        {projects.map((project, index) => (
                            <div
                                key={index}
                                className={`project-bg-text ${activeIndex === index ? 'active' : ''}`}
                            >
                                <span>{project.bgText}</span>
                                <span>{project.bgText}</span>
                                <span>{project.bgText}</span>
                            </div>
                        ))}
                    </div>

                    {/* Card stack */}
                    <div className="project-card-stack">
                        {projects.map((project, index) => {
                            const isActive = index === activeIndex
                            const isPast = index < activeIndex
                            const isFuture = index > activeIndex
                            const isHidden = modalProject?.id === project.id

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={(e) => {
                                        if (!isActive) return
                                        openModal(project, e.currentTarget)
                                    }}
                                    className={`project-card ${isActive ? 'active' : ''} ${isPast ? 'past' : ''} ${isFuture ? 'future' : ''} has-link`}
                                    style={{ visibility: isHidden ? 'hidden' : 'visible' }}
                                    aria-label={`Open details for ${project.title}`}
                                >
                                    <div className="project-card-face project-card-front">
                                        <div className="project-link-arrow">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M7 17L17 7M17 7H7M17 7V17" />
                                            </svg>
                                        </div>
                                        <div className="project-image-wrapper">
                                            <img
                                                src={project.image}
                                                alt={project.title}
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="project-info-bar">
                                            <h3>{project.title}</h3>
                                            <div className="project-tags">
                                                {project.tags.map((tag) => (
                                                    <span key={tag} className="tag">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* Progress dots */}
                    <div className="project-dots">
                        {projects.map((_, index) => (
                            <div
                                key={index}
                                className={`project-dot ${activeIndex === index ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <ProjectModal
                project={modalProject}
                origin={modalOrigin}
                onClose={closeModal}
            />
        </>
    )
}

export default Projects
