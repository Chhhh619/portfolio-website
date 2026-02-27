import './Hero.css'

function Hero() {
    return (
        <section className="hero" id="hero">
            <div className="container hero-content">
                <div className="hero-text">
                    <div className="hero-availability">
                        <span className="availability-dot"></span>
                        Available May 2026
                    </div>
                    <h1 className="hero-name">
                        <span className="hero-greeting">Hi, I'm</span><br />
                        Tan Cheng Hong.
                    </h1>
                    <p className="hero-tagline">
                        A software engineer passionately building innovative digital
                        experiences — from AI-powered speech recognition to modern web platforms.
                    </p>
                </div>
            </div>

            <div className="hero-scroll-indicator">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
            </div>
        </section>
    )
}

export default Hero
