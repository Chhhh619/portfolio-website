import './Experience.css'

function Experience() {
    const experiences = [
        {
            company: 'Dataverse Sdn Bhd',
            role: 'IT Intern',
            period: 'Nov 2025 - Apr 2026',
            location: 'Selangor',
        },
        {
            company: 'GOAT Lab',
            role: 'Sales Assistant (Part-Time)',
            period: 'Dec 2023 - Nov 2025',
            location: 'Kuala Lumpur',
        },
    ]

    return (
        <section className="experience section section-light" id="experience">
            <div className="container">
                <div className="section-header">
                    <span className="section-title">Worked with</span>
                    <span className="section-count">({experiences.length})</span>
                </div>

                <div className="experience-list">
                    {experiences.map((exp, index) => (
                        <div key={index} className="experience-row">
                            <div className="exp-company">{exp.company}</div>
                            <div className="exp-role">{exp.role}</div>
                            <div className="exp-period">{exp.period}</div>
                            <div className="exp-location">{exp.location}</div>
                        </div>
                    ))}
                </div>

                <div className="skills-section">
                    <div className="section-header">
                        <span className="section-title">Skills</span>
                    </div>
                    <div className="skills-tags">
                        {['JavaScript', 'Python', 'React', 'Node.js', 'Flutter', 'PyTorch', 'HuggingFace', 'Whisper ASR', 'LoRA', 'Java', 'C#', 'C++', 'PHP', 'Kotlin', 'SQL', 'Git', 'AWS', 'Figma', 'Vite', 'n8n'].map((skill) => (
                            <span key={skill} className="tag">{skill}</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Experience
