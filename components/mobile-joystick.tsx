"use client"

import { useEffect, useRef, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface MobileJoystickProps {
  onMove: (direction: { x: number; y: number }) => void
  onEPress: (pressed: boolean) => void
}

export default function MobileJoystick({ onMove, onEPress }: MobileJoystickProps) {
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
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !joystickRef.current) return

      const rect = joystickRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      let deltaX = e.clientX - centerX
      let deltaY = e.clientY - centerY

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

    const handleMouseUp = () => {
      setIsDragging(false)
      setPosition({ x: 0, y: 0 })
      onMove({ x: 0, y: 0 })
    }

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, onMove, isMobile])

  useEffect(() => {
    if (!isMobile) return

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
  }, [isDragging, onMove, isMobile])

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleTouchStart = () => {
    setIsDragging(true)
  }

  const handleActionPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    onEPress(true)
  }

  const handleActionRelease = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    onEPress(false)
  }

  return (
    <>
      <div className={`fixed z-50 ${
        isMobile 
          ? "bottom-8 left-8" 
          : "bottom-8 left-8"
      }`}>
        <div
          ref={joystickRef}
          className={`relative bg-gray-800/80 rounded-full border-4 border-gray-700 shadow-2xl backdrop-blur-sm ${
            isMobile ? "w-32 h-32" : "w-28 h-28"
          }`}
          onMouseDown={!isMobile ? handleMouseDown : undefined}
          onTouchStart={isMobile ? handleTouchStart : undefined}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-700 to-gray-900" />

          <div
            className={`absolute bg-gradient-to-br from-gray-400 to-gray-600 rounded-full border-4 border-gray-800 shadow-lg transition-all duration-100 ${
              isMobile ? "w-16 h-16" : "w-14 h-14"
            }`}
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
            }}
          />
        </div>
      </div>

      <div className={`fixed z-50 ${
        isMobile 
          ? "bottom-8 right-8" 
          : "bottom-8 right-8"
      }`}>
        <button
          className={`bg-gradient-to-b from-orange-600 to-orange-800 rounded-full border-4 border-orange-900 shadow-2xl flex items-center justify-center text-white font-black active:scale-95 transition-transform duration-200 ${
            isMobile ? "w-20 h-20 text-xl" : "w-16 h-16 text-lg"
          }`}
          onMouseDown={!isMobile ? handleActionPress : undefined}
          onMouseUp={!isMobile ? handleActionRelease : undefined}
          onMouseLeave={!isMobile ? handleActionRelease : undefined}
          onTouchStart={isMobile ? handleActionPress : undefined}
          onTouchEnd={isMobile ? handleActionRelease : undefined}
          aria-label="Interact"
        >
          E
        </button>
      </div>

      {!isMobile && (
        <div className="fixed bottom-24 left-8 z-50">
          <div className="bg-blue-500/90 text-blue-900 px-4 py-2 rounded-lg border-2 border-blue-700 shadow-lg text-center max-w-xs">
            <p className="font-bold text-xs">
              🎮 Use joystick or WASD keys
            </p>
          </div>
        </div>
      )}

      {isMobile && isPortrait && (
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
