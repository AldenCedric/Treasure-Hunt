"use client"

import { useEffect, useRef, useState } from "react"

interface MobileJoystickProps {
  onMove: (direction: { x: number; y: number }) => void
}

export default function MobileJoystick({ onMove }: MobileJoystickProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const joystickRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !joystickRef.current) return

      const touch = e.touches[0]
      const rect = joystickRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      let deltaX = touch.clientX - centerX
      let deltaY = touch.clientY - centerY

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = 40

      if (distance > maxDistance) {
        deltaX = (deltaX / distance) * maxDistance
        deltaY = (deltaY / distance) * maxDistance
      }

      setPosition({ x: deltaX, y: deltaY })

      const normalizedX = deltaX / maxDistance
      const normalizedY = deltaY / maxDistance

      onMove({ x: normalizedX, y: normalizedY })
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
      setPosition({ x: 0, y: 0 })
      onMove({ x: 0, y: 0 })
    }

    if (isDragging) {
      window.addEventListener("touchmove", handleTouchMove)
      window.addEventListener("touchend", handleTouchEnd)
      window.addEventListener("touchcancel", handleTouchEnd)
    }

    return () => {
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [isDragging, onMove])

  const handleActionPress = (e: React.TouchEvent) => {
    e.preventDefault()
    const keyDownEvent = new KeyboardEvent("keydown", { 
      key: "e",
      code: "KeyE",
      keyCode: 69,
      which: 69,
      bubbles: true
    })
    window.dispatchEvent(keyDownEvent)
  }

  return (
    <>
      <div className="md:hidden fixed bottom-8 left-8 z-50">
        <div
          ref={joystickRef}
          className="relative w-32 h-32 bg-gray-800/80 rounded-full border-4 border-gray-700 shadow-2xl backdrop-blur-sm"
          onTouchStart={() => setIsDragging(true)}>
      
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-700 to-gray-900" />
          
          <div
            className="absolute w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full border-4 border-gray-800 shadow-lg transition-all duration-100"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
            }}
          />
        </div>
      </div>

      <div className="md:hidden fixed bottom-8 right-8 z-50">
        <button
          className="w-20 h-20 bg-gradient-to-b from-orange-600 to-orange-800 rounded-full border-4 border-orange-900 shadow-2xl flex items-center justify-center text-white font-black text-xl active:scale-95 transition-transform duration-200"
          onTouchStart={handleActionPress}
          onTouchEnd={(e) => e.preventDefault()}
          aria-label="Interact">
          E
        </button>
      </div>
    </>
  )
}
