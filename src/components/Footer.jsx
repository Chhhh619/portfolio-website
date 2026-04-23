import './Footer.css'

function Footer() {
    const currentYear = new Date().getFullYear()

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-top">
                    <div className="footer-cta">
                        <p className="footer-cta-text">Let's build something great together.</p>
                    </div>

                    <div className="footer-columns">
                        <div className="footer-col">
                            <h4>Menu</h4>
                            <a href="#work">Work</a>
                            <a href="#experience">Experience</a>
                            <a href="#finance-demo">Finance Demo</a>
                        </div>

                        <div className="footer-col">
                            <h4>Contact</h4>
                            <a href="mailto:tanchenghong619@gmail.com" target="_blank" rel="noopener noreferrer">Email</a>
                            <a href="https://api.whatsapp.com/send?phone=60127857687&text=Hi%2C%20are%20you%20interested%20in%20a%20job%3F" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                            <a href="https://www.linkedin.com/in/cheng-hong-tan-a68a76388/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                            <a href="https://github.com/Chhhh619" target="_blank" rel="noopener noreferrer">GitHub</a>
                        </div>

                        <div className="footer-col">
                            <h4>Location</h4>
                            <span className="footer-location">Selangor, Malaysia</span>
                        </div>
                    </div>
                </div>

                <div className="footer-back-top">
                    <button onClick={scrollToTop} className="back-to-top-btn">
                        Back to top
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                    </button>
                </div>

                <div className="footer-wordmark">
                    <span>TAN CHENG HONG</span>
                </div>

                <div className="footer-bottom">
                    <p>© {currentYear} Tan Cheng Hong. All rights reserved.</p>
                    <p className="footer-credit">Built with React + Vite</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
