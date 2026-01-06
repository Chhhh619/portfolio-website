import './Projects.css'

function Projects() {
    const projects = [
        {
            title: 'Hong Kong Cantonese ASR Model',
            description: 'Fine-tuned Whisper Large V3 model for Hong Kong Cantonese speech recognition using LoRA. Trained on custom datasets with optimized hyperparameters for accurate transcription.',
            tags: ['Whisper', 'PyTorch', 'HuggingFace', 'LoRA', 'ASR'],
            featured: true,
            link: 'https://huggingface.co/Chhhh619/whisper-large-v3-hongkongtuned',
            linkText: 'View on HuggingFace',
        },
        {
            title: 'Automated Workflow Management System',
            description: 'Enterprise workflow automation solution built during internship at Dataverse. Streamlined business processes and improved operational efficiency.',
            tags: ['React', 'Node.js', 'Automation', 'Enterprise'],
            featured: false,
        },
        {
            title: 'AI Product Development (R&D)',
            description: 'Part of the R&D team developing innovative AI products. Involved in research, prototyping, and implementation of cutting-edge AI solutions.',
            tags: ['AI', 'Machine Learning', 'Research', 'Python'],
            featured: false,
        },
        {
            title: 'Mobile Application Development',
            description: 'Cross-platform mobile applications built with Flutter and Dart, featuring modern UI/UX design and seamless user experience.',
            tags: ['Flutter', 'Dart', 'Mobile', 'UI/UX'],
            featured: false,
        },
    ]

    return (
        <section className="projects section" id="projects">
            <div className="container">
                <h2 className="section-title">
                    Featured <span className="gradient-text">Projects</span>
                </h2>

                <div className="projects-grid">
                    {projects.map((project, index) => (
                        <article
                            key={index}
                            className={`project-card glass-card ${project.featured ? 'featured' : ''}`}
                        >
                            {project.featured && <span className="featured-badge">⭐ Featured</span>}

                            <div className="project-image">
                                <div className="project-image-placeholder">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                </div>
                            </div>

                            <div className="project-content">
                                <h3>{project.title}</h3>
                                <p>{project.description}</p>

                                <div className="project-tags">
                                    {project.tags.map((tag) => (
                                        <span key={tag} className="skill-tag">{tag}</span>
                                    ))}
                                </div>

                                {project.link && (
                                    <a
                                        href={project.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="project-link"
                                    >
                                        {project.linkText}
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Projects
