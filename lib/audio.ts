// let welcomeAudio: HTMLAudioElement | null = null
let gameAudio: HTMLAudioElement | null = null

// function ensureWelcome(): HTMLAudioElement {
//   if (!welcomeAudio) {
//     welcomeAudio = new Audio("/welcome.mp3")
//     welcomeAudio.loop = true
//     welcomeAudio.preload = "auto"
//     welcomeAudio.volume = 0.6
//   }
//   return welcomeAudio
// }

function ensureGame(): HTMLAudioElement {
  if (!gameAudio) {
    gameAudio = new Audio("/game.mp3")
    gameAudio.loop = true
    gameAudio.preload = "auto"
    gameAudio.volume = 0.5
  }
  return gameAudio
}

export async function playWelcome() {
  // const a = ensureWelcome()
  // ensure game track is not playing simultaneously
  try { gameAudio?.pause() } catch {}
  // try { await a.play() } catch { /* will resume on user gesture */ }
}

export function pauseWelcome() {
  // try { ensureWelcome().pause() } catch {}
}

export async function playGame() {
  const a = ensureGame()
  // ensure welcome track is not playing simultaneously
  // try { welcomeAudio?.pause() } catch {}
  try { await a.play() } catch { /* will resume on user gesture */ }
}

export function pauseGame() {
  try { ensureGame().pause() } catch {}
}

export function getGameAudio(): HTMLAudioElement {
  return ensureGame()
}

export function resumeOnUserGesture() {
  if (typeof window === "undefined") return
  const handler = async () => {
    // try { await welcomeAudio?.play().catch(() => {}) } catch {}
    try { await gameAudio?.play().catch(() => {}) } catch {}
    window.removeEventListener("pointerdown", handler)
    window.removeEventListener("keydown", handler)
    window.removeEventListener("touchstart", handler)
  }
  window.addEventListener("pointerdown", handler, { once: true })
  window.addEventListener("keydown", handler, { once: true })
  window.addEventListener("touchstart", handler, { once: true })
}
