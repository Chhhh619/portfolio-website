import { useState, useEffect, useRef } from 'react'
import './Projects.css'

function Projects() {
    const [activeIndex, setActiveIndex] = useState(0)
    const sectionRef = useRef(null)

    const projects = [
        {
            title: 'HK Cantonese ASR',
            subtitle: 'AI / Speech Recognition',
            description: 'Fine-tuned Whisper Large V3 for Hong Kong Cantonese speech recognition using LoRA, with optimized hyperparameters for accurate code-switching transcription.',
            tags: ['Whisper', 'PyTorch', 'HuggingFace', 'LoRA'],
            image: '/images/ASR.png',
            link: 'https://huggingface.co/Chhhh619/whisper-large-v3-hongkongtuned',
            bgText: 'ASR MODEL',
        },
        {
            title: 'CariSEO Landing Page',
            subtitle: 'AI-Powered SEO Platform',
            description: 'Corporate AI SEO platform that leverages artificial intelligence to optimize search engine rankings and provide intelligent recommendations.',
            tags: ['AI', 'SEO', 'Web Platform'],
            image: '/images/solutions.png',
            link: 'https://www.cariseo.com/',
            bgText: 'CARISEO',
        },
        {
            title: 'Minimalist Mock Up Website',
            subtitle: 'Web Design / Development',
            description: 'Modern, responsive cafe website featuring elegant design, menu display, and seamless user experience.',
            tags: ['HTML', 'CSS', 'JavaScript'],
            image: '/images/bil.png',
            link: 'https://bil-coffee-website.vercel.app',
            bgText: 'BREW IS LIFE',
        },
        {
            title: 'Self-Budgeting Mobile App',
            subtitle: 'Cross-Platform Development',
            description: 'Cross-platform mobile applications with modern UI/UX design and seamless user experience.',
            tags: ['Flutter', 'Dart', 'Mobile'],
            image: '/images/fyp.png',
            link: null,
            bgText: 'MOBILE APP',
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

    return (
        <section className="projects-section" id="work" ref={sectionRef}>
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

                        const CardWrapper = project.link ? 'a' : 'div'
                        const cardProps = project.link
                            ? { href: project.link, target: '_blank', rel: 'noopener noreferrer' }
                            : {}

                        return (
                            <CardWrapper
                                key={index}
                                {...cardProps}
                                className={`project-card ${isActive ? 'active' : ''} ${isPast ? 'past' : ''} ${isFuture ? 'future' : ''} ${project.link ? 'has-link' : ''}`}
                            >
                                {/* Front — image in container */}
                                <div className="project-card-face project-card-front">
                                    {project.link && (
                                        <div className="project-link-arrow">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M7 17L17 7M17 7H7M17 7V17" />
                                            </svg>
                                        </div>
                                    )}
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
                            </CardWrapper>
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
    )
}

export default Projects
