import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import ASRDemo from './components/ASRDemo'
import Contact from './components/Contact'
import Footer from './components/Footer'
import CursorGlow from './components/CursorGlow'

function App() {
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    return (
        <div className={`app ${isLoaded ? 'loaded' : ''}`}>
            <CursorGlow />
            <Navbar />
            <main>
                <Hero />
                <About />
                <Projects />
                <ASRDemo />
                <Contact />
            </main>
            <Footer />
        </div>
    )
}

export default App
