import { useState, useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Experience from './components/Experience'
import FinanceDemo from './components/FinanceDemo'
import Footer from './components/Footer'
import ContactModal from './components/ContactModal'

function App() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [contactOpen, setContactOpen] = useState(false)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    const openContact = () => setContactOpen(true)
    const closeContact = () => setContactOpen(false)

    return (
        <div className={`app ${isLoaded ? 'loaded' : ''}`}>
            <Navbar onContactClick={openContact} />
            <main>
                <Hero onContactClick={openContact} />
                <Projects />
                <Experience />
                <FinanceDemo />
            </main>
            <Footer />
            <ContactModal open={contactOpen} onClose={closeContact} />
            <Analytics />
        </div>
    )
}

export default App
