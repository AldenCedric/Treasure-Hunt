"use client"

import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import styles from "./game-board.module.css"
import MobileJoystick from "./mobile-joystick"
import dotPositions from "./dot-positions.json"
import { useIsMobile } from "@/hooks/use-mobile"
import { playGame, resumeOnUserGesture, getGameAudio } from "@/lib/audio"

interface GameBoardProps {
  currentLevel: number
  completedLevels: number[]
  onLevelClick: (level: number) => void
  piratePosition?: number
}

interface QuestionMarker {
  id: number
  x: number
  y: number
  color: string
}

export default function GameBoard(props: GameBoardProps) {
  const { completedLevels, onLevelClick } = props
  const DEFAULT_SPEED = 3.2
  const DEFAULT_CAMERA_CLAMP_X = { min: 0, max: 400 }
  const DEFAULT_CAMERA_CLAMP_Y = { min: 0, max: 300 }

  const SPEED_BASE_REF = useRef(DEFAULT_SPEED)
  const [lowAnimations, setLowAnimations] = useState(false)
  const MAP_WIDTH = 1600
  const MAP_HEIGHT = 1200

  const cameraClampXRef = useRef({ ...DEFAULT_CAMERA_CLAMP_X })
  const cameraClampYRef = useRef({ ...DEFAULT_CAMERA_CLAMP_Y })

  useEffect(() => {
    try {
      const raw = localStorage.getItem("thq_debug_settings")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.lowAnimations != null) setLowAnimations(Boolean(parsed.lowAnimations))
      }
    } catch {
    }
  }, [])

  useEffect(() => {
    try {
      const payload = JSON.stringify({ lowAnimations })
      localStorage.setItem("thq_debug_settings", payload)
    } catch {
    }
  }, [lowAnimations])

  const [playerPos, setPlayerPos] = useState({ x: 400, y: 300 })
  const playerPosRef = useRef(playerPos)
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 })
  const keysRef = useRef<Set<string>>(new Set())
  const [nearestQuestion, setNearestQuestion] = useState<number | null>(null)
  const animationFrameRef = useRef<number>()
  const lastUpdateRef = useRef<number>(Date.now())
  const [ambientEnabled, setAmbientEnabled] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("thq_ambient_enabled")
      return raw == null ? true : JSON.parse(raw)
    } catch {
      return true
    }
  })

  const MAP_IMAGE = "treasure-hunt-game-board-with-islands-and-paths.jpg"

  const DEFAULT_MARKERS: QuestionMarker[] = [
    { id: 1, x: 717, y: 395, color: "hsl(138 60% 72%)" },
    { id: 2, x: 552, y: 270, color: "hsl(275 60% 72%)" },
    { id: 3, x: 758, y: 698, color: "hsl(53 60% 72%)" },
    { id: 4, x: 708, y: 169, color: "hsl(190 60% 72%)" },
    { id: 5, x: 880, y: 305, color: "hsl(328 60% 72%)" },
    { id: 6, x: 848, y: 643, color: "hsl(105 60% 72%)" },
    { id: 7, x: 1106, y: 328, color: "hsl(243 60% 72%)" },
    { id: 8, x: 1241, y: 492, color: "hsl(20 60% 72%)" },
    { id: 9, x: 1223, y: 577, color: "hsl(158 60% 72%)" },
    { id: 10, x: 899, y: 734, color: "hsl(295 60% 72%)" },
    { id: 11, x: 383, y: 577, color: "hsl(73 60% 72%)" },
    { id: 12, x: 1091, y: 153, color: "hsl(210 60% 72%)" },
    { id: 13, x: 1285, y: 237, color: "hsl(348 60% 72%)" },
    { id: 14, x: 601, y: 764, color: "hsl(125 60% 72%)" },
    { id: 15, x: 1120, y: 876, color: "hsl(263 60% 72%)" },
    { id: 16, x: 857, y: 897, color: "hsl(40 60% 72%)" },
    { id: 17, x: 488, y: 900, color: "hsl(178 60% 72%)" },
    { id: 18, x: 444, y: 408, color: "hsl(315 60% 72%)" },
    { id: 19, x: 420, y: 691, color: "hsl(93 60% 72%)" },
    { id: 20, x: 257, y: 357, color: "hsl(230 60% 72%)" },
  ]

  const pastelColor = (id: number) => {
    const hue = (id * 137.508) % 360
    const saturation = 100
    const lightness = 100
    return `hsl(${Math.round(hue)} ${saturation}% ${lightness}%)`
  }

  const isTailwindBgClass = (s?: string) => typeof s === "string" && s.startsWith("bg-")

  const [questionMarkers, setQuestionMarkers] = useState<QuestionMarker[]>(() => {
    try {
      const raw = localStorage.getItem("thq_marker_positions")
      if (raw) {
        const parsed = JSON.parse(raw) as QuestionMarker[]
        return parsed.map((m) => ({ ...m, color: isTailwindBgClass(m.color) || !m.color ? pastelColor(m.id) : m.color }))
      }
    } catch {
    }
    return DEFAULT_MARKERS.map((m) => ({ ...m, color: pastelColor(m.id) }))
  })

  const visibleMarkers = useMemo(() => {
    return questionMarkers.filter(marker => !completedLevels.includes(marker.id))
  }, [questionMarkers, completedLevels])

  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(0)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mapImageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = `/${MAP_IMAGE}`
    img.crossOrigin = "anonymous"
    img.onload = () => {
      mapImageRef.current = img
    }
    img.onerror = () => {
      mapImageRef.current = null
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === "[") {
        setSelectedMarkerIndex((i) => Math.max(0, i - 1))
      }
      if (key === "]") {
        setSelectedMarkerIndex((i) => Math.min(questionMarkers.length - 1, i + 1))
      }
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "e"].includes(key)) {
        e.preventDefault()
        keysRef.current.add(key)

        if (key === "e" && nearestQuestion !== null) {
          onLevelClick(nearestQuestion)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keysRef.current.delete(key)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [nearestQuestion, onLevelClick, questionMarkers.length])

  useEffect(() => {
    try {
      localStorage.setItem("thq_marker_positions", JSON.stringify(questionMarkers))
    } catch {
    }
  }, [questionMarkers])

  useEffect(() => {
    try {
      localStorage.setItem("thq_ambient_enabled", JSON.stringify(ambientEnabled))
    } catch {
    }
  }, [ambientEnabled])

  useEffect(() => {
    if (typeof window === "undefined") return
    resumeOnUserGesture()
    const audio = getGameAudio()
    const run = async () => {
      try {
        if (ambientEnabled) await playGame()
        else audio.pause()
      } catch {}
    }
    run()
  }, [ambientEnabled])

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = MAP_WIDTH / rect.width
    const scaleY = MAP_HEIGHT / rect.height
    const logicalX = (e.clientX - rect.left) * scaleX
    const logicalY = (e.clientY - rect.top) * scaleY
    setQuestionMarkers((prev) => {
      const copy = prev.map((m) => ({ ...m }))
      const idx = Math.max(0, Math.min(copy.length - 1, selectedMarkerIndex))
      copy[idx].x = Math.round(logicalX)
      copy[idx].y = Math.round(logicalY)
      return copy
    })
  }

  const checkCollision = (x: number, y: number) => {
    if (x < 150 || x > 1400 || y < 100 || y > 1050) {
      return true
    }
    return false
  }

  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = (now - lastUpdateRef.current) / 16.67
      lastUpdateRef.current = now
      const speed = SPEED_BASE_REF.current * deltaTime
      let newX = playerPosRef.current.x
      let newY = playerPosRef.current.y

      const k = keysRef.current
      if (k.has("w") || k.has("arrowup")) {
        newY -= speed
      }
      if (k.has("s") || k.has("arrowdown")) {
        newY += speed
      }
      if (k.has("a") || k.has("arrowleft")) {
        newX -= speed
      }
      if (k.has("d") || k.has("arrowright")) {
        newX += speed
      }

      newX = Math.max(150, Math.min(1400, newX))
      newY = Math.max(100, Math.min(1050, newY))

      if (!checkCollision(newX, newY)) {
        playerPosRef.current = { x: newX, y: newY }
        setPlayerPos({ x: newX, y: newY })

        const rect = containerRef.current?.getBoundingClientRect()
        const viewportWidth = rect?.width ?? 1000
        const viewportHeight = rect?.height ?? (viewportWidth * 3) / 4
        const cameraX = Math.max(cameraClampXRef.current.min, Math.min(cameraClampXRef.current.max, newX - viewportWidth / 2))
        const cameraY = Math.max(cameraClampYRef.current.min, Math.min(cameraClampYRef.current.max, newY - viewportHeight / 2))
        setCameraOffset({ x: -cameraX, y: -cameraY })
      }

      let closest: number | null = null
      let closestDist = Number.POSITIVE_INFINITY

      visibleMarkers.forEach((marker) => {
        const dist = Math.hypot(marker.x - newX, marker.y - newY)
        if (dist < 60 && dist < closestDist) {
          closest = marker.id
          closestDist = dist
        }
      })

      setNearestQuestion(closest)

      try {
        const canvas = canvasRef.current
        const img = mapImageRef.current
        if (canvas && canvas.getContext) {
          const ctx = canvas.getContext("2d")
          if (ctx) {
            const dpr = window.devicePixelRatio || 1
            const logicalWidth = MAP_WIDTH
            const logicalHeight = MAP_HEIGHT
            if (canvas.width !== logicalWidth * dpr || canvas.height !== logicalHeight * dpr) {
              canvas.width = logicalWidth * dpr
              canvas.height = logicalHeight * dpr
              canvas.style.width = `${logicalWidth}px`
              canvas.style.height = `${logicalHeight}px`
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

            ctx.clearRect(0, 0, logicalWidth, logicalHeight)

            if (img && img.complete) {
              ctx.drawImage(img, 0, 0, logicalWidth, logicalHeight)
            } else {
              ctx.fillStyle = "#7cb342"
              ctx.fillRect(0, 0, logicalWidth, logicalHeight)
            }

            const nowMs = Date.now()
            for (const marker of visibleMarkers) {
              ctx.save()
              ctx.translate(marker.x, marker.y)
              
              const isNearby = nearestQuestion === marker.id
              const radius = 24
              
              // Draw question marker base (solid color)
              const baseColor = marker.color || pastelColor(marker.id)
              ctx.fillStyle = baseColor
              ctx.globalAlpha = 0
              ctx.beginPath()
              ctx.arc(0, 0, radius, 0, Math.PI * 2)
              ctx.fill()

              if (isNearby) {
                const shinePhase = (nowMs / 800) % 1
                const shineGradient = ctx.createRadialGradient(
                  -radius * 0.8, -radius * 0.8, 0,
                  0, 0, radius * 1.5
                )
                shineGradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * (1 - shinePhase)})`)
                shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
                
                ctx.fillStyle = shineGradient
                ctx.globalAlpha = 1.0
                ctx.beginPath()
                ctx.arc(0, 0, radius * 1.2, 0, Math.PI * 2)
                ctx.fill()
              }

              const glowGradient = ctx.createRadialGradient(0, 0, radius * 0.3, 0, 0, radius)
              glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
              glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)')
              ctx.fillStyle = glowGradient
              ctx.globalAlpha = 1.0
              ctx.beginPath()
              ctx.arc(0, 0, radius, 0, Math.PI * 2)
              ctx.fill()
              
              // Number text
              ctx.fillStyle = "#222"
              ctx.globalAlpha = 1
              ctx.font = "bold 16px segoe ui"
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
              ctx.fillText(String(marker.id), 0, 0)

              if (isNearby) {
                ctx.fillStyle = "rgba(0,0,0,0.85)"
                ctx.font = "bold 16px monospace"
                ctx.fillText("Press [E]", 0, -36)
              }
              ctx.restore()
            }

            ctx.save()
            ctx.translate(playerPosRef.current.x, playerPosRef.current.y)
            
            // Player body
            ctx.fillStyle = "#2196f3"
            ctx.globalAlpha = 1.0
            ctx.fillRect(-6, -8, 12, 16)
            
            // Player head
            ctx.fillStyle = "#ffcc80"
            ctx.beginPath()
            ctx.arc(0, -10, 5, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.restore()
          }
        }
      } catch {
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [visibleMarkers, nearestQuestion])

  const handleJoystickMove = useCallback((direction: { x: number; y: number }) => {
    if (Math.abs(direction.x) > 0.1 || Math.abs(direction.y) > 0.1) {
      if (direction.y < -0.3) keysRef.current.add("w")
      else keysRef.current.delete("w")
      if (direction.y > 0.3) keysRef.current.add("s")
      else keysRef.current.delete("s")
      if (direction.x < -0.3) keysRef.current.add("a")
      else keysRef.current.delete("a")
      if (direction.x > 0.3) keysRef.current.add("d")
      else keysRef.current.delete("d")
    } else {
      keysRef.current.clear()
    }
  }, [])

  const isMobile = useIsMobile()
  const [isPortrait, setIsPortrait] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const updateOrientation = () => {
      const portrait = window.matchMedia && window.matchMedia("(orientation: portrait)").matches
      setIsPortrait(portrait)
    }
    updateOrientation()
    const mql = window.matchMedia("(orientation: portrait)")
    const onChange = () => updateOrientation()
    try { mql.addEventListener("change", onChange) } catch { mql.addListener(onChange) }
    return () => { try { mql.removeEventListener("change", onChange) } catch { mql.removeListener(onChange) } }
  }, [])

  useEffect(() => {
    if (!isMobile) return
    const orientation = (screen as any).orientation
    if (orientation && orientation.lock) {
      try { orientation.lock("landscape") } catch { /* ignore */ }
    }
  }, [isMobile])

  const handleEPress = useCallback((pressed: boolean) => {
    if (pressed) {
      keysRef.current.add("e")
      if (nearestQuestion !== null) onLevelClick(nearestQuestion)
    } else {
      keysRef.current.delete("e")
    }
  }, [nearestQuestion, onLevelClick])

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center p-4 relative overflow-hidden ${
      lowAnimations ? styles.lowAnimations : ""
    }`}>
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {useMemo(() => {
          type DotPos = { left: number; top: number; bob: 0 | 1 | 2; delay: number }
          const dots = dotPositions as unknown as DotPos[]
          return dots.map((dot, i) => (
            <div
              key={i}
              className={`absolute ${styles["bg-dot"]} ${styles[`bob${dot.bob}`]} ${styles[`delay${dot.delay}`]}`}
              style={{ left: `${dot.left}%`, top: `${dot.top}%` }}
            />
          ))
        }, [])}
      </div>

      <div className="relative w-full max-w-7xl" ref={containerRef}>

        <div className={`absolute top-0 left-0 right-0 z-30 flex justify-between items-start p-4 ${
          lowAnimations ? styles.lowAnimations : ""
        }`}>
          <div className="bg-gray-200 border-4 border-gray-800 rounded-lg p-4 shadow-xl pixel-corners max-w-xs">
            <h3 className="font-black text-gray-800 text-lg mb-2 pixel-text">Gather Questions</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 border-2 border-gray-800 rounded-sm" />
                <span className="font-bold text-red-600">{completedLevels.length} / 20</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border-4 border-gray-600 rounded-full p-2 shadow-xl w-20 h-20 relative overflow-hidden">
            <div className="absolute inset-1 bg-teal-600 rounded-full">
              <div className="absolute inset-2 bg-green-600 rounded-full" />
              <div
                className="absolute w-2 h-2 bg-red-500 rounded-full border border-white"
                style={{
                  left: `${(playerPos.x / 1400) * 100}%`,
                  top: `${(playerPos.y / 1050) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          </div>
        </div>

        <div className={`${styles["map-container"]} relative w-full border-8 rounded-lg shadow-2xl overflow-hidden ${styles["map-frame"]} mt-20 mb-32`}>
          <div
            className="absolute inset-0 transition-transform duration-100"
            style={{
              transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px)`,
            }}
          >
            <div className="absolute inset-0" onClick={handleCanvasClick}>
              <canvas ref={canvasRef} className="block w-full h-full" />
            </div>

            {!canvasRef.current &&
              visibleMarkers.map((marker) => (
                <div
                  key={marker.id}
                  className="absolute"
                  style={{
                    left: marker.x - 20,
                    top: marker.y - 20,
                    zIndex: 100,
                  }}
                >
                  <div
                    className={`w-10 h-10 border-4 border-gray-800 rounded-lg shadow-xl flex items-center justify-center font-black text-gray-900 text-sm transform hover:scale-110 transition-transform ${styles["marker-pulse"]}`}
                    style={{ backgroundColor: marker.color }}
                  >
                    {marker.id}
                  </div>
                  {nearestQuestion === marker.id && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border-2 border-white animate-bounce">
                      Press [E]
                    </div>
                  )}
                </div>
              ))}

            {!canvasRef.current && (
              <div
                className="absolute transition-all duration-100"
                style={{
                  left: playerPos.x - 12,
                  top: playerPos.y - 16,
                  zIndex: 101,
                }}
              >
                <div className="relative w-6 h-8">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-5 bg-[#2196f3] border-2 border-[#1565c0] rounded-sm" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#ffcc80] border-2 border-[#ff9800] rounded-full" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-[#5d4037] border border-[#3e2723] rounded-t-full" />
                </div>
              </div>
            )}
          </div>
          
          {isMobile && (
            <div className={`${styles.controlsOverlay}`}>
              <div className={`${styles.controlsOverlayInner}`}>
                <div>
                  <MobileJoystick onMove={handleJoystickMove} />
                </div>
                <button
                  type="button"
                  aria-label="Action"
                  onMouseDown={() => handleEPress(true)}
                  onMouseUp={() => handleEPress(false)}
                  onTouchStart={() => handleEPress(true)}
                  onTouchEnd={() => handleEPress(false)}
                  className="select-none rounded-full bg-gradient-to-b from-orange-600 to-orange-800 text-white font-black text-xl w-16 h-16 border-4 border-orange-900 shadow-xl active:scale-95 transition-transform"
                >
                  E
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30 flex justify-center items-end p-4">
          <div className="bg-gray-800 border-4 border-gray-600 rounded-lg px-6 py-3 shadow-xl">
            <div className="flex items-center gap-4">
              <span className="font-black text-white text-sm">PROGRESS:</span>
              <div className="w-64 h-6 bg-gray-700 border-2 border-gray-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${(completedLevels.length / 20) * 100}%` }}
                />
              </div>
              <span className="font-black text-yellow-400 text-lg">{completedLevels.length} / 20</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-20 left-4 z-30 bg-gray-900/80 text-white px-4 py-2 rounded-lg border-2 border-gray-700 text-xs font-mono">
          <div>[WASD] - movement</div>
          <div>[E] - action</div>
        </div>
      </div>

      {!isMobile && <MobileJoystick onMove={handleJoystickMove} />}
    </div>
  )
}