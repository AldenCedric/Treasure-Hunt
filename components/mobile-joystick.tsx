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

  const calculateMovement = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return

    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let deltaX = clientX - centerX
    let deltaY = clientY - centerY

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

  const resetJoystick = () => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    onMove({ x: 0, y: 0 })
  }

  useEffect(() => {
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      calculateMovement(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      resetJoystick()
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
      if (!isDragging || e.touches.length === 0) return
      calculateMovement(e.touches[0].clientX, e.touches[0].clientY)
    }

    const handleTouchEnd = () => {
      resetJoystick()
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

  const handleInteractionStart = () => {
    setIsDragging(true)
  }

  const handleActionPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEPress(true)
  }

  const handleActionRelease = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEPress(false)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <>
      {/* Joystick */}
      <div className={`fixed z-50 ${isMobile ? "bottom-8 left-8" : "bottom-8 left-8"}`}>
        <div
          ref={joystickRef}
          className={`relative bg-gray-800/80 rounded-full border-4 border-gray-700 shadow-2xl backdrop-blur-sm ${
            isMobile ? "w-32 h-32" : "w-28 h-28"
          }`}
          onMouseDown={!isMobile ? handleInteractionStart : undefined}
          onTouchStart={isMobile ? handleInteractionStart : undefined}
          onContextMenu={handleContextMenu}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-700 to-gray-900" />

          <div className="absolute inset-0 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-gray-400/50 rounded-full" />
          </div>

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

      <div className={`fixed z-50 ${isMobile ? "bottom-8 right-8" : "bottom-8 right-8"}`}>
        <button
          className={`bg-gradient-to-b from-orange-600 to-orange-800 rounded-full border-4 border-orange-900 shadow-2xl flex items-center justify-center text-white font-black active:scale-95 transition-transform duration-200 ${
            isMobile ? "w-20 h-20 text-xl" : "w-16 h-16 text-lg"
          }`}
          onMouseDown={!isMobile ? handleActionPress : undefined}
          onMouseUp={!isMobile ? handleActionRelease : undefined}
          onMouseLeave={!isMobile ? handleActionRelease : undefined}
          onTouchStart={isMobile ? handleActionPress : undefined}
          onTouchEnd={isMobile ? handleActionRelease : undefined}
          onContextMenu={handleContextMenu}
          aria-label="Interact"
        >
          E
        </button>
      </div>

      {!isMobile && (
        <div className="fixed bottom-24 left-8 z-50">
          <div className="bg-blue-500/90 text-blue-900 px-4 py-2 rounded-lg border-2 border-blue-700 shadow-lg text-center max-w-xs backdrop-blur-sm">
            <p className="font-bold text-xs">
              🎮 Use joystick or WASD keys
            </p>
          </div>
        </div>
      )}
    </>
  )
}
