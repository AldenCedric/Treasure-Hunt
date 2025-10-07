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


// Environment objects and collisions removed — map is now static with no collidable props

interface QuestionMarker {
  id: number
  x: number
  y: number
  color: string
}

export default function GameBoard(props: GameBoardProps) {
  const { completedLevels, onLevelClick } = props
  // Tunable gameplay constants
  const DEFAULT_SPEED = 3.2
  const DEFAULT_CAMERA_CLAMP_X = { min: 0, max: 400 }
  const DEFAULT_CAMERA_CLAMP_Y = { min: 0, max: 300 }

  const SPEED_BASE_REF = useRef(DEFAULT_SPEED)
  const [lowAnimations, setLowAnimations] = useState(false)
  const MAP_WIDTH = 1600
  const MAP_HEIGHT = 1200

  // Camera clamp refs (editable via debug UI)
  const cameraClampXRef = useRef({ ...DEFAULT_CAMERA_CLAMP_X })
  const cameraClampYRef = useRef({ ...DEFAULT_CAMERA_CLAMP_Y })
  // Camera clamp state removed (no runtime debug UI). Refs keep defaults.

    // Persist minimal user settings (only low animation preference)
    useEffect(() => {
      try {
        const raw = localStorage.getItem("thq_debug_settings")
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed.lowAnimations != null) setLowAnimations(Boolean(parsed.lowAnimations))
        }
    } catch {
        // ignore parse errors
      }
    }, [])

    useEffect(() => {
      try {
        const payload = JSON.stringify({ lowAnimations })
        localStorage.setItem("thq_debug_settings", payload)
    } catch {
      // ignore storage errors
    }
    }, [lowAnimations])

  const [playerPos, setPlayerPos] = useState({ x: 400, y: 300 })
  const playerPosRef = useRef(playerPos)
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 })
  // Use a ref for pressed keys for lower-overhead, more responsive controls
  const keysRef = useRef<Set<string>>(new Set())
  const [nearestQuestion, setNearestQuestion] = useState<number | null>(null)
  // playerDirection removed (canvas rendering only)
  const animationFrameRef = useRef<number>()
  const lastUpdateRef = useRef<number>(Date.now())
  // Game soundtrack audio via shared singleton
  const [ambientEnabled, setAmbientEnabled] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("thq_ambient_enabled")
      return raw == null ? true : JSON.parse(raw)
    } catch {
      return true
    }
  })

  // const tileSize = 32 // removed: tile grid replaced by single map image
  //  replaced the tile grid with a single pre-rendered map image for visual fidelity
  // and far fewer DOM nodes (better performance). The image lives in /public and
  // is rendered at the same logical map size (MAP_WIDTH x MAP_HEIGHT).
  const MAP_IMAGE = "treasure-hunt-game-board-with-islands-and-paths.jpg"

  // Default question marker positions (can be edited in-place with placement mode)
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

  // Simple pastel color generator: uses marker id to get a reproducible hue spread
  const pastelColor = (id: number) => {
    // golden angle spread
    const hue = (id * 137.508) % 360
    const saturation = 10
    const lightness = 10
    return `hsl(${Math.round(hue)} ${saturation}% ${lightness}%)`
  }

  const isTailwindBgClass = (s?: string) => typeof s === "string" && s.startsWith("bg-")

  const [questionMarkers, setQuestionMarkers] = useState<QuestionMarker[]>(() => {
    try {
      const raw = localStorage.getItem("thq_marker_positions")
      if (raw) {
        const parsed = JSON.parse(raw) as QuestionMarker[]
        // ensure each marker has a unique pastel color (preserve if non-tailwind color exists)
        return parsed.map((m) => ({ ...m, color: isTailwindBgClass(m.color) || !m.color ? pastelColor(m.id) : m.color }))
      }
  } catch {
    // ignore
  }
    return DEFAULT_MARKERS.map((m) => ({ ...m, color: pastelColor(m.id) }))
  })

  // placement mode for aligning markers to the background map
  const [placementMode, setPlacementMode] = useState(false)
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(0)

  // environment objects removed

  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mapImageRef = useRef<HTMLImageElement | null>(null)

  // Preload map image for canvas rendering
  useEffect(() => {
    const img = new Image()
    img.src = `/${MAP_IMAGE}`
    img.crossOrigin = "anonymous"
    img.onload = () => {
      mapImageRef.current = img
    }
    img.onerror = () => {
      // ignore load errors; canvas has fallback fill
      mapImageRef.current = null
    }
  }, [])

  // Keyboard input handling using a ref for lower overhead
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      // backtick/tilde debug toggle removed
      // Toggle placement mode with 'p'
      if (key === "p") {
        setPlacementMode((v) => !v)
      }
      // Cycle selected marker with '[' and ']'
      if (key === "[" ) {
        setSelectedMarkerIndex((i) => Math.max(0, i - 1))
      }
      if (key === "]") {
        setSelectedMarkerIndex((i) => Math.min(questionMarkers.length - 1, i + 1))
      }
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "e"].includes(key)) {
  e.preventDefault()
  keysRef.current.add(key)

        // Interact with nearest question
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

  // Save marker positions when they change
  useEffect(() => {
    try {
      localStorage.setItem("thq_marker_positions", JSON.stringify(questionMarkers))
  } catch {
      // ignore
    }
  }, [questionMarkers])

  // persist ambient preference
  useEffect(() => {
    try {
      localStorage.setItem("thq_ambient_enabled", JSON.stringify(ambientEnabled))
    } catch {
      // ignore
    }
  }, [ambientEnabled])

  // Game soundtrack: loop via audio singleton, continue across screens
  useEffect(() => {
    if (typeof window === "undefined") return
    // ensure any welcome music is paused when entering game
    // pauseWelcome()
    resumeOnUserGesture()
    const audio = getGameAudio()
    const run = async () => {
      try {
        if (ambientEnabled) await playGame()
        else audio.pause()
      } catch {}
    }
    run()
    // do not pause on unmount; we want to continue when opening question screen
  }, [ambientEnabled])

  // Canvas click to place selected marker (maps client coordinates to logical map coordinates)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!placementMode) return
    const canvas = canvasRef.current
    if (!canvas) return
  const rect = canvas.getBoundingClientRect()
    // compute scale between displayed canvas size and logical map size
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

  // Export/import handlers removed (unused)

  const checkCollision = (x: number, y: number) => {
  // playerSize removed (unused)

    // environment object collisions removed; only world bounds remain

    if (x < 150 || x > 1400 || y < 100 || y > 1050) {
      return true
    }

    return false
  }

  // Game loop for smooth movement (uses refs so effect can run once)
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

      // Collision check
      if (!checkCollision(newX, newY)) {
        // update both state and ref
        playerPosRef.current = { x: newX, y: newY }
        setPlayerPos({ x: newX, y: newY })

        // measure viewport size responsively
        const rect = containerRef.current?.getBoundingClientRect()
        const viewportWidth = rect?.width ?? 1000
        const viewportHeight = rect?.height ?? (viewportWidth * 3) / 4
  const cameraX = Math.max(cameraClampXRef.current.min, Math.min(cameraClampXRef.current.max, newX - viewportWidth / 2))
  const cameraY = Math.max(cameraClampYRef.current.min, Math.min(cameraClampYRef.current.max, newY - viewportHeight / 2))
        setCameraOffset({ x: -cameraX, y: -cameraY })
      }

      // Check proximity to question markers
      let closest: number | null = null
      let closestDist = Number.POSITIVE_INFINITY

      questionMarkers.forEach((marker) => {
        const dist = Math.hypot(marker.x - newX, marker.y - newY)
        if (dist < 60 && dist < closestDist) {
          closest = marker.id
          closestDist = dist
        }
      })

      setNearestQuestion(closest)

      // draw canvas (synchronous with movement updates)
      try {
        const canvas = canvasRef.current
        const img = mapImageRef.current
        if (canvas && canvas.getContext) {
          const ctx = canvas.getContext("2d")
          if (ctx) {
            // HiDPI support
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

            // Clear
            ctx.clearRect(0, 0, logicalWidth, logicalHeight)

            // Draw base map image if loaded
            if (img && img.complete) {
              ctx.drawImage(img, 0, 0, logicalWidth, logicalHeight)
            } else {
              // fallback background
              ctx.fillStyle = "#7cb342"
              ctx.fillRect(0, 0, logicalWidth, logicalHeight)
            }

            // environment objects removed — canvas draws only map, markers and player

            // Question markers (circular, transparent with shiny effect)
            const nowMs = Date.now()
            for (const marker of questionMarkers) {
              ctx.save()
              ctx.translate(marker.x, marker.y)
              
              const isNearby = nearestQuestion === marker.id
              const radius = 24
              
              // Shiny effect when nearby/interactable
              if (isNearby && !completedLevels.includes(marker.id)) {
                // Animated shine effect
                const shinePhase = (nowMs / 800) % 1
                const shineGradient = ctx.createRadialGradient(
                  -radius * 0.3, -radius * 0.3, 0,
                  0, 0, radius * 1.5
                )
                shineGradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * (1 - shinePhase)})`)
                shineGradient.addColorStop(0.4, `rgba(255, 255, 255, ${0.3 * (1 - shinePhase)})`)
                shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
                
                ctx.fillStyle = shineGradient
                ctx.beginPath()
                ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2)
                ctx.fill()
              }
              
              // Transparent circular marker with subtle glow
              const baseColor = marker.color || pastelColor(marker.id)
              const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
              
              // Parse color and create transparent version
              try {
                ctx.save()
                ctx.globalAlpha = 0
                ctx.fillStyle = baseColor
                ctx.beginPath()
                ctx.arc(0, 0, radius, 0, Math.PI * 2)
                ctx.fill()
                ctx.restore()
              } catch {
                // fallback: semi-transparent yellow
                ctx.fillStyle = `rgba(255, 213, 79, 0.6)`
                ctx.beginPath()
                ctx.arc(0, 0, radius, 0, Math.PI * 2)
                ctx.fill()
              }
              
              // Inner glow for depth
              const glowGradient = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius)
              glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
              glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
              ctx.fillStyle = glowGradient
              ctx.beginPath()
              ctx.arc(0, 0, radius, 0, Math.PI * 2)
              ctx.fill()
              
              // Number text
              ctx.fillStyle = "#222"
              ctx.font = "bold 18px sans-serif"
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
              ctx.fillText(completedLevels.includes(marker.id) ? "✓" : String(marker.id), 0, 0)
              
              // Proximity hint
              if (isNearby && !completedLevels.includes(marker.id)) {
                ctx.fillStyle = "rgba(0,0,0,0.85)"
                ctx.font = "bold 12px monospace"
                ctx.fillText("Press [E]", 0, -36)
              }
              ctx.restore()
            }

            // Player
            ctx.save()
            ctx.translate(playerPosRef.current.x, playerPosRef.current.y)
            ctx.fillStyle = "#2196f3"
            ctx.fillRect(-6, -8, 12, 16)
            ctx.fillStyle = "#ffcc80"
            ctx.beginPath()
            ctx.arc(0, -10, 5, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
            }
        }
      } catch {
        // drawing errors should not break game loop
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  // intentionally use refs for the game loop; disable exhaustive-deps warning
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // SPEED_BASE_REF is initialized to DEFAULT_SPEED; no runtime speed UI present


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

  // Mobile detection and orientation handling
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
    // Try to request landscape screen orientation on mobile
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

  // terrain color helper removed; map uses a single pre-rendered image

  // environment render helpers removed

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center p-4 relative overflow-hidden ${
      lowAnimations ? styles.lowAnimations : ""
    }`}>
      {/* animations moved to `game-board.module.css` */}
      {/* Pixel art water effect background */}
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

      {/* Game Container */}
      <div className="relative w-full max-w-7xl" ref={containerRef}>
        {/* Top UI Bar */}
          <div className={`absolute top-0 left-0 right-0 z-20 flex justify-between items-start p-4 ${
            lowAnimations ? styles.lowAnimations : ""
          }`}>
          {/* Quest Panel */}
          <div className="bg-gray-200 border-4 border-gray-800 rounded-lg p-4 shadow-xl pixel-corners max-w-xs">
            <h3 className="font-black text-gray-800 text-lg mb-2 pixel-text">Gather Questions</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 border-2 border-gray-800 rounded-sm" />
                <span className="font-bold text-red-600">{completedLevels.length} / 20</span>
              </div>
            </div>
          </div>

          {/* Placement Mode Panel */}
          <div className="bg-black/60 text-white rounded-lg p-3 border-2 border-white ml-auto flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold">Placement</span>
              <button
                type="button"
                className={`px-2 py-1 rounded text-xs font-bold border ${placementMode ? "bg-emerald-500 border-emerald-700" : "bg-gray-600 border-gray-800"}`}
                onClick={() => setPlacementMode(v => !v)}
              >
                {placementMode ? "ON" : "OFF"}
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button type="button" className="px-2 py-1 bg-gray-700 rounded border border-gray-500"
                onClick={() => setSelectedMarkerIndex(i => Math.max(0, i - 1))}>
                ◀
              </button>
              <span>Marker {selectedMarkerIndex + 1} / {questionMarkers.length}</span>
              <button type="button" className="px-2 py-1 bg-gray-700 rounded border border-gray-500"
                onClick={() => setSelectedMarkerIndex(i => Math.min(questionMarkers.length - 1, i + 1))}>
                ▶
              </button>
            </div>
            <div className="text-[10px] opacity-80">P to toggle • [ / ] to change • Click map to move</div>
          </div>

          {/* Minimap */}
          <div className="bg-gray-800 border-4 border-gray-600 rounded-full p-2 shadow-xl w-20 h-20 relative overflow-hidden">
            <div className="absolute inset-1 bg-teal-600 rounded-full">
              <div className="absolute inset-2 bg-green-600 rounded-full" />
              {/* Player dot */}
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

        {/* DebugPanel removed */}

        {/* Game Viewport */}
        <div className={`${styles["map-container"]} relative w-full border-8 rounded-lg shadow-2xl overflow-hidden ${styles["map-frame"]}`}>
          <div
            className="absolute inset-0 transition-transform duration-100"
            style={{
              transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px)`,
            }}
          >
            {/* Canvas-based renderer (draws map, objects, markers, and player) */}
            <div className="absolute inset-0" onClick={handleCanvasClick}>
              <canvas ref={canvasRef} className="block w-full h-full" />
              {placementMode && (
                <div className="absolute top-2 left-2 z-50 bg-black/70 text-white px-2 py-1 text-xs rounded">
                  Placement mode: selected {selectedMarkerIndex + 1} — click to move marker
                </div>
              )}
            </div>

            {/* environment DOM fallbacks removed */}

            {/* Question Markers */}
            {/* DOM fallback for question markers when canvas is not available */}
            {!canvasRef.current &&
              questionMarkers.map((marker) => (
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
                    className={`w-10 h-10 border-4 border-gray-800 rounded-lg shadow-xl flex items-center justify-center font-black text-gray-900 text-sm transform hover:scale-110 transition-transform ${
                      completedLevels.includes(marker.id) ? "opacity-50" : ""
                    } ${styles["marker-pulse"]}`}
                    style={{ backgroundColor: marker.color }}
                  >
                    {completedLevels.includes(marker.id) ? "✓" : marker.id}
                  </div>
                  {nearestQuestion === marker.id && !completedLevels.includes(marker.id) && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border-2 border-white animate-bounce">
                      Press [E]
                    </div>
                  )}
                </div>
              ))}

            {/* DOM fallback player when canvas not supported */}
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
                  {/* Character body */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-5 bg-[#2196f3] border-2 border-[#1565c0] rounded-sm" />
                  {/* Character head */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#ffcc80] border-2 border-[#ff9800] rounded-full" />
                  {/* Hair */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-[#5d4037] border border-[#3e2723] rounded-t-full" />
                </div>
              </div>
            )}
          </div>
          {/* Mobile overlay controls (joystick + E) */}
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
                  className="select-none rounded-full bg-orange-600 text-white font-black text-xl w-16 h-16 border-4 border-orange-900 shadow-xl active:scale-95"
                >
                  E
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom UI Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center items-end p-4">
          {/* Health/Progress Bar */}
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

        {/* Controls hint */}
        <div className="absolute bottom-4 left-4 z-10 bg-gray-900/80 text-white px-4 py-2 rounded-lg border-2 border-gray-700 text-xs font-mono">
          <div>[WASD] - movement</div>
          <div>[E] - action</div>
        </div>
      </div>

      {!isMobile && <MobileJoystick onMove={handleJoystickMove} />}
    </div>
  )
}
