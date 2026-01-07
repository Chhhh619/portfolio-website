import './Footer.css'

function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="footer-logo gradient-text">Tan Cheng Hong</span>
                        <p>Building innovative solutions with code.</p>
                    </div>

                    <div className="footer-links">
                        <a href="#about">About</a>
                        <a href="#projects">Projects</a>
                        <a href="#asr-demo">ASR Demo</a>
                        <a href="#contact">Contact</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {currentYear} Tan Cheng Hong. All rights reserved.</p>
                    <p className="footer-credit">
                        Built with React + Vite • Deployed on Vercel
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
