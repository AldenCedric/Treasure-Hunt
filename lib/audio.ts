let gameAudio: HTMLAudioElement | null = null

function ensureGame(): HTMLAudioElement {
  if (!gameAudio) {
    gameAudio = new Audio("/game.mp3")
    gameAudio.loop = true
    gameAudio.preload = "auto"
    gameAudio.volume = 0.5
  }
  return gameAudio
}

export async function playGame() {
  const a = ensureGame()
  try { 
    await a.play() 
  } catch { 
    // Will resume on user gesture 
  }
}

export function pauseGame() {
  try { 
    ensureGame().pause() 
  } catch {}
}

export function getGameAudio(): HTMLAudioElement {
  return ensureGame()
}

export function resumeOnUserGesture() {
  if (typeof window === "undefined") return
  
  const handler = async () => {
    try { 
      await gameAudio?.play().catch(() => {}) 
    } catch {}
    
    window.removeEventListener("pointerdown", handler)
    window.removeEventListener("keydown", handler)
    window.removeEventListener("touchstart", handler)
  }
  
  window.addEventListener("pointerdown", handler, { once: true })
  window.addEventListener("keydown", handler, { once: true })
  window.addEventListener("touchstart", handler, { once: true })
}
