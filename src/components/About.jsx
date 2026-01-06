import './About.css'

function About() {
    const skills = {
        'Languages': ['JavaScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Dart', 'Kotlin'],
        'Web & Frontend': ['HTML', 'CSS', 'React', 'Vite'],
        'Backend & DB': ['Node.js', 'PHP', 'SQL'],
        'AI & ML': ['Whisper ASR', 'PyTorch', 'HuggingFace', 'LoRA Fine-tuning'],
        'Mobile': ['Flutter', 'Android (Kotlin)'],
        'Tools': ['Git', 'VS Code', 'Figma'],
    }

    return (
        <section className="about section" id="about">
            <div className="container">
                <h2 className="section-title">
                    About <span className="gradient-text">Me</span>
                </h2>

                <div className="about-content">
                    <div className="about-text">
                        <p className="about-intro">
                            A passionate software engineer with a results-oriented work style and excellent
                            problem-solving skills. My diverse skillset spans multiple programming languages,
                            hands-on AI model experiences, project management, and graphic design foundations.
                        </p>

                        <div className="about-highlights">
                            <div className="highlight-card glass-card">
                                <div className="highlight-icon">🎓</div>
                                <div className="highlight-content">
                                    <h4>Education</h4>
                                    <p>Bachelor of IT (Honours) in Software Systems Development</p>
                                    <span className="highlight-detail">TARUMT • CGPA 3.60/4.00</span>
                                    <span className="highlight-badge">President's List • Dean's List ×2</span>
                                </div>
                            </div>

                            <div className="highlight-card glass-card">
                                <div className="highlight-icon">💼</div>
                                <div className="highlight-content">
                                    <h4>Current Role</h4>
                                    <p>IT Intern @ Dataverse Sdn Bhd</p>
                                    <span className="highlight-detail">Nov 2025 - Apr 2026</span>
                                    <span className="highlight-badge">R&D Team • AI Product Development</span>
                                </div>
                            </div>
                        </div>

                        <div className="about-languages">
                            <h4>Languages</h4>
                            <div className="language-list">
                                <span className="language-item">🇬🇧 English (Fluent)</span>
                                <span className="language-item">🇨🇳 Chinese (Native)</span>
                                <span className="language-item">🇲🇾 Malay (Good)</span>
                            </div>
                        </div>
                    </div>

                    <div className="about-skills">
                        <h3>Technical Skills</h3>
                        <div className="skills-grid">
                            {Object.entries(skills).map(([category, items]) => (
                                <div key={category} className="skill-category">
                                    <h4>{category}</h4>
                                    <div className="skill-tags">
                                        {items.map((skill) => (
                                            <span key={skill} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default About
