"use client"

import { useEffect, useRef, useState } from "react"

interface MobileJoystickProps {
  onMove: (direction: { x: number; y: number }) => void
}

export default function MobileJoystick({ onMove }: MobileJoystickProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const joystickRef = useRef<HTMLDivElement>(null)
  const [showActionButton, setShowActionButton] = useState(false)

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
    }

    return () => {
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, onMove])

  return (
    <>
      {/* Movement Joystick */}
      <div className="md:hidden fixed bottom-8 left-8 z-50">
        <div
          ref={joystickRef}
          className="relative w-32 h-32 bg-gray-800/70 rounded-full border-4 border-gray-600 shadow-2xl backdrop-blur-sm"
          onTouchStart={() => setIsDragging(true)}
        >
          <div
            className="absolute w-12 h-12 bg-gray-400 rounded-full border-4 border-gray-700 shadow-lg transition-transform"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
            }}
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="md:hidden fixed bottom-8 right-8 z-50">
        <button
          className="w-20 h-20 bg-red-600 rounded-full border-4 border-red-800 shadow-2xl flex items-center justify-center text-white font-black text-xl active:scale-95 transition-transform"
          onTouchStart={(e) => {
            e.preventDefault()
            // Simulate 'E' key press
            const event = new KeyboardEvent("keydown", { key: "e" })
            window.dispatchEvent(event)
          }}
        >
          E
        </button>
      </div>
    </>
  )
}
