"use client"

import { useEffect, useRef, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface MobileJoystickProps {
  onMove: (direction: { x: number; y: number }) => void
}

export default function MobileJoystick({ onMove }: MobileJoystickProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const joystickRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    
    const updateOrientation = () => {
      const portrait = window.matchMedia("(orientation: portrait)").matches
      setIsPortrait(portrait)
    }
    
    updateOrientation()
    
    const mql = window.matchMedia("(orientation: portrait)")
    const handleOrientationChange = () => updateOrientation()
    
    try { 
      mql.addEventListener("change", handleOrientationChange) 
    } catch { 
      mql.addListener(handleOrientationChange) 
    }
    
    return () => {
      try { 
        mql.removeEventListener("change", handleOrientationChange) 
      } catch { 
        mql.removeListener(handleOrientationChange) 
      }
    }
  }, [])

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

  if (!isMobile) {
    return null
  }

  return (
    <>
      <div className="fixed bottom-8 left-8 z-50">
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

      <div className="fixed bottom-8 right-8 z-50">
        <button
          className="w-20 h-20 bg-gradient-to-b from-orange-600 to-orange-800 rounded-full border-4 border-orange-900 shadow-2xl flex items-center justify-center text-white font-black text-xl active:scale-95 transition-transform duration-200"
          onTouchStart={handleActionPress}
          onTouchEnd={(e) => e.preventDefault()}
          aria-label="Interact">
          E
        </button>
      </div>

      {isPortrait && (
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
          <div className="bg-yellow-500/90 text-yellow-900 px-6 py-3 rounded-lg border-2 border-yellow-700 shadow-lg text-center max-w-md mx-4">
            <p className="font-bold text-sm">
              💡 For better gameplay, rotate your device to landscape mode
            </p>
          </div>
        </div>
      )}
    </>
  )
}
