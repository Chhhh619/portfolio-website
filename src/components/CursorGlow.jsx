import { useState, useEffect } from 'react'
import './CursorGlow.css'

function CursorGlow() {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handleMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY })
            if (!isVisible) setIsVisible(true)
        }

        const handleMouseLeave = () => {
            setIsVisible(false)
        }

        window.addEventListener('mousemove', handleMouseMove)
        document.body.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            document.body.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [isVisible])

    return (
        <div
            className={`cursor-glow-effect ${isVisible ? 'visible' : ''}`}
            style={{
                left: position.x,
                top: position.y,
            }}
        />
    )
}

export default CursorGlow
