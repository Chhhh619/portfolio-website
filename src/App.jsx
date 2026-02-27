import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Experience from './components/Experience'
import ASRDemo from './components/ASRDemo'
import Footer from './components/Footer'

function App() {
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    return (
        <div className={`app ${isLoaded ? 'loaded' : ''}`}>
            <Navbar />
            <main>
                <Hero />
                <Projects />
                <Experience />
                <ASRDemo />
            </main>
            <Footer />
        </div>
    )
}

export default App
