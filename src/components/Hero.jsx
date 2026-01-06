import './Hero.css'

function Hero() {
    return (
        <section className="hero" id="hero">
            <div className="hero-background">
                <div className="grid-background"></div>
                <div className="hero-gradient-orb orb-1"></div>
                <div className="hero-gradient-orb orb-2"></div>
            </div>

            <div className="container hero-content">
                <div className="hero-text">
                    <p className="hero-greeting">Hi, I'm</p>
                    <h1 className="hero-name">
                        Tan Cheng Hong
                    </h1>
                    <h2 className="hero-title gradient-text">
                        Software Engineer
                    </h2>
                    <p className="hero-description">
                        A passionate and results-oriented software engineer with proficient problem-solving
                        skills, diverse skillset spanning AI/ML, web development, and mobile applications.
                        Currently specializing in ASR model training and React development.
                    </p>
                    <div className="hero-cta">
                        <a href="#asr-demo" className="btn btn-primary">
                            <span>Try My ASR Model</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                        <a href="#contact" className="btn btn-secondary">
                            Get in Touch
                        </a>
                    </div>
                </div>

                <div className="hero-image">
                    <div className="hero-image-wrapper">
                        <div className="hero-image-placeholder">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>Your Photo</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hero-scroll-indicator">
                <div className="scroll-mouse">
                    <div className="scroll-wheel"></div>
                </div>
                <span>Scroll to explore</span>
            </div>
        </section>
    )
}

export default Hero
