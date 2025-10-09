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

type PlayerDirection = 'north' | 'south' | 'east' | 'west';

export default function GameBoard(props: GameBoardProps) {
  const { completedLevels, onLevelClick } = props
  const DEFAULT_SPEED = 3.2

  const SPEED_BASE_REF = useRef(DEFAULT_SPEED)
  const [lowAnimations, setLowAnimations] = useState(false)

  const MAP_WIDTH = 1024
  const MAP_HEIGHT = 1200

  const [playerDirection, setPlayerDirection] = useState<PlayerDirection>('south')
  const [isMoving, setIsMoving] = useState(false)
  const [animationFrame, setAnimationFrame] = useState(0)

  const spriteSheets = {
    north: './player-north-sheet.png',
    south: './player-south-sheet.png',
    east: './player-east-sheet.png',
    west: './player-west-sheet.png'
  };

  const singleSprites = {
    north: './player-north.png',
    south: './player-south.png',
    east: './player-east.png',
    west: './player-west.png'
  };

  const spriteImagesRef = useRef<{ [key in PlayerDirection]: HTMLImageElement | null }>({
    north: null,
    south: null,
    east: null,
    west: null
  });

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

  const [playerPos, setPlayerPos] = useState({ x: 512, y: 512 })
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
    { id: 1, x: 259, y: 114, color: "hsl(138 60% 72%)" },
    { id: 2, x: 452, y: 170, color: "hsl(275 60% 72%)" },
    { id: 3, x: 354, y: 266, color: "hsl(53 60% 72%)" },
    { id: 4, x: 285, y: 406, color: "hsl(190 60% 72%)" },
    { id: 5, x: 247, y: 575, color: "hsl(328 60% 72%)" },
    { id: 6, x: 270, y: 690, color: "hsl(105 60% 72%)" },
    { id: 7, x: 542, y: 639, color: "hsl(243 60% 72%)" },
    { id: 8, x: 484, y: 700, color: "hsl(20 60% 72%)" },
    { id: 9, x: 384, y: 763, color: "hsl(158 60% 72%)" },
    { id: 10, x: 312, y: 900, color: "hsl(295 60% 72%)" },
    { id: 11, x: 717, y: 874, color: "hsl(73 60% 72%)" },
    { id: 12, x: 829, y: 676, color: "hsl(210 60% 72%)" },
    { id: 13, x: 785, y: 578, color: "hsl(348 60% 72%)" },
    { id: 14, x: 795, y: 489, color: "hsl(125 60% 72%)" },
    { id: 15, x: 461, y: 394, color: "hsl(263 60% 72%)" },
    { id: 16, x: 710, y: 326, color: "hsl(40 60% 72%)" },
    { id: 17, x: 564, y: 304, color: "hsl(178 60% 72%)" },
    { id: 18, x: 610, y: 226, color: "hsl(315 60% 72%)" },
    { id: 19, x: 697, y: 149, color: "hsl(93 60% 72%)" },
    { id: 20, x: 824, y: 232, color: "hsl(230 60% 72%)" },
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

  const [containerDimensions, setContainerDimensions] = useState({ width: 1024, height: 1200 })
  
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  useEffect(() => {
    const directions: PlayerDirection[] = ['north', 'south', 'east', 'west'];
    directions.forEach(direction => {
      const img = new Image();
      img.src = spriteSheets[direction];
      img.onload = () => {
        spriteImagesRef.current[direction] = img;
      };
      img.onerror = () => {
        const fallbackImg = new Image();
        fallbackImg.src = singleSprites[direction];
        fallbackImg.onload = () => {
          spriteImagesRef.current[direction] = fallbackImg;
        };
      };
    });
  }, []);

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
    let animationInterval: NodeJS.Timeout;

    if (isMoving) {
      animationInterval = setInterval(() => {
        setAnimationFrame(prev => (prev + 1) % 4); // 4-frame animation cycle
      }, 120);
    } else {
      setAnimationFrame(0);
    }

    return () => {
      if (animationInterval) clearInterval(animationInterval);
    };
  }, [isMoving]);

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

        if (key === "w" || key === "arrowup") setPlayerDirection('north')
        if (key === "s" || key === "arrowdown") setPlayerDirection('south')
        if (key === "a" || key === "arrowleft") setPlayerDirection('west')
        if (key === "d" || key === "arrowright") setPlayerDirection('east')

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
    if (x < 100 || x > 924 || y < 100 || y > 1100) {
      return true
    }
    return false
  }

  const renderPlayerSprite = (ctx: CanvasRenderingContext2D) => {
    const spriteSize = 64;
    const currentSprite = spriteImagesRef.current[playerDirection];

    ctx.save();
    ctx.translate(playerPosRef.current.x, playerPosRef.current.y);

    if (currentSprite && currentSprite.complete) {
      const isSpriteSheet = currentSprite.width > spriteSize;
      
      if (isSpriteSheet && isMoving) {

        const frameWidth = currentSprite.width / 4;
        const frameHeight = spriteSize;
        
        ctx.drawImage(
          currentSprite,
          animationFrame * frameWidth, 0,
          frameWidth, frameHeight,
          -spriteSize/2, -spriteSize/2,
          spriteSize, spriteSize
        );
      } else {
        const sourceWidth = isSpriteSheet ? currentSprite.width / 4 : currentSprite.width;
        const sourceHeight = isSpriteSheet ? spriteSize : currentSprite.height;
        
        ctx.drawImage(
          currentSprite,
          0, 0,
          sourceWidth, sourceHeight,
          -spriteSize/2, -spriteSize/2,
          spriteSize, spriteSize
        );
      }
    } else {
      ctx.fillStyle = "#2196f3"
      ctx.globalAlpha = 1.0
      ctx.fillRect(-6, -8, 12, 16)
      
      ctx.fillStyle = "#ffcc80"
      ctx.beginPath()
      ctx.arc(0, -10, 5, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore();
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
      const wasMoving = isMoving;
      let nowMoving = false;

      if (k.has("w") || k.has("arrowup")) {
        newY -= speed
        nowMoving = true;
      }
      if (k.has("s") || k.has("arrowdown")) {
        newY += speed
        nowMoving = true;
      }
      if (k.has("a") || k.has("arrowleft")) {
        newX -= speed
        nowMoving = true;
      }
      if (k.has("d") || k.has("arrowright")) {
        newX += speed
        nowMoving = true;
      }

      if (wasMoving !== nowMoving) {
        setIsMoving(nowMoving);
      }

      newX = Math.max(100, Math.min(924, newX))
      newY = Math.max(100, Math.min(1100, newY))

      if (!checkCollision(newX, newY)) {
        playerPosRef.current = { x: newX, y: newY }
        setPlayerPos({ x: newX, y: newY })

        const rect = containerRef.current?.getBoundingClientRect()
        const viewportWidth = rect?.width ?? 1024
        const viewportHeight = rect?.height ?? 1200
        
        const targetCameraX = newX - viewportWidth / 2
        const targetCameraY = newY - viewportHeight / 2

        const cameraMinX = 0
        const cameraMaxX = MAP_WIDTH - viewportWidth
        const cameraMinY = 0
        const cameraMaxY = MAP_HEIGHT - viewportHeight
        
        const clampedCameraX = Math.max(cameraMinX, Math.min(cameraMaxX, targetCameraX))
        const clampedCameraY = Math.max(cameraMinY, Math.min(cameraMaxY, targetCameraY))
        
        setCameraOffset({ x: -clampedCameraX, y: -clampedCameraY })
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

              ctx.fillStyle = "#white"
              ctx.globalAlpha = 0
              ctx.font = "bold 16px segoe ui"
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
              ctx.fillText(String(marker.id), 0, 0)

              if (isNearby) {
                ctx.fillStyle = "rgba(255,255,0,0.85)"
                ctx.globalAlpha = 1
                ctx.font = "bold 16px segoe ui"
                ctx.fillText("Press [E]", 0, -36)
              }
              ctx.restore()
            }

            renderPlayerSprite(ctx);
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
  }, [visibleMarkers, nearestQuestion, isMoving, animationFrame, playerDirection])

  const handleJoystickMove = useCallback((direction: { x: number; y: number }) => {
    if (Math.abs(direction.x) > 0.1 || Math.abs(direction.y) > 0.1) {
      if (direction.y < -0.3) {
        keysRef.current.add("w")
        setPlayerDirection('north')
      }
      else keysRef.current.delete("w")
      if (direction.y > 0.3) {
        keysRef.current.add("s")
        setPlayerDirection('south')
      }
      else keysRef.current.delete("s")
      if (direction.x < -0.3) {
        keysRef.current.add("a")
        setPlayerDirection('west')
      }
      else keysRef.current.delete("a")
      if (direction.x > 0.3) {
        keysRef.current.add("d")
        setPlayerDirection('east')
      }
      else keysRef.current.delete("d")
    } else {
      keysRef.current.clear()
    }
  }, [])

  const isMobile = useIsMobile()

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

        <div 
          className={`relative w-full border-8 rounded-lg shadow-2xl overflow-hidden ${styles["map-frame"]} mx-auto mt-28 mb-32`}
          style={{
            aspectRatio: '1 / 1',
            maxHeight: 'calc(100vh - 240px)',
            background: '#1a202c',
            maxWidth: '1024px'
          }}>
          <div
            className="absolute inset-0 transition-transform duration-100"
            style={{
              transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px)`,
            }}>
            <div className="absolute inset-0" onClick={handleCanvasClick}>
              <canvas 
                ref={canvasRef} 
                className="block w-full h-full"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}/>
            </div>

            {!canvasRef.current &&
              visibleMarkers.map((marker) => {
                const relativeX = (marker.x / MAP_WIDTH) * 100
                const relativeY = (marker.y / MAP_HEIGHT) * 100
                
                return (
                  <div
                    key={marker.id}
                    className="absolute"
                    style={{
                      left: `${relativeX}%`,
                      top: `${relativeY}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 100,
                    }}>
                    <div
                      className={`w-10 h-10 border-4 border-gray-800 rounded-lg shadow-xl flex items-center justify-center font-black text-gray-900 text-sm transform hover:scale-110 transition-transform ${styles["marker-pulse"]}`}
                      style={{ backgroundColor: marker.color }}>
                      {marker.id}
                    </div>
                    {nearestQuestion === marker.id && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border-2 border-white animate-bounce">
                        Press [E]
                      </div>
                    )}
                  </div>
                )
              })}

            {!canvasRef.current && (
              <div
                className="absolute transition-all duration-100"
                style={{
                  left: `${(playerPos.x / MAP_WIDTH) * 100}%`,
                  top: `${(playerPos.y / MAP_HEIGHT) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 101,
                }}>
                <div className="relative w-16 h-16">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-10 bg-[#2196f3] border-2 border-[#1565c0] rounded-sm" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#ffcc80] border-2 border-[#ff9800] rounded-full" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-3 bg-[#5d4037] border border-[#3e2723] rounded-t-full" />
                </div>
              </div>
            )}
          </div>

          <div className={`${styles.controlsOverlay}`}>
            <div className={`${styles.controlsOverlayInner}`}>
              <MobileJoystick 
                onMove={handleJoystickMove}
                onEPress={handleEPress}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex justify-center items-end">
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
      </div>
    </div>
  )
}
