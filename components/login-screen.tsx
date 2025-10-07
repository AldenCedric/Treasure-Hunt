"use client"

import { useEffect, useState } from "react"
import { pauseWelcome } from "@/lib/audio"
import { Button } from "./ui/button"

interface LoginScreenProps {
  onLogin: (username: string, avatar?: string) => void
  onBack?: () => void
}

export default function LoginScreen({ onLogin, onBack }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [avatar, setAvatar] = useState<string | undefined>(undefined)
  // Ensure welcome soundtrack stops when entering login screen
  useEffect(() => {
    // stop welcome music on login screen
    pauseWelcome()
  }, [])

  const avatars = ["🏴‍☠️", "🦜", "⚓️", "🏝️", "🗺️"]

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    onLogin(username.trim())
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background island map (light opacity) */}
      <div className="absolute inset-0 opacity-30">
        <img src="/treasure-island-map-with-palm-trees-and-paths.jpg" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl w-full">

        <div className="parchment rounded-3xl p-12 shadow-2xl border-8 border-amber-900 max-w-xl w-full bg-white/80">
          <h2 className="text-5xl md:text-6xl font-black text-amber-950 mb-6 [text-shadow:_2px_2px_0_rgb(255_255_255_/_30%)]">
            Welcome{username ? `, ${username}` : ""}
          </h2>
          <p className="text-2xl md:text-3xl font-bold text-amber-950 leading-relaxed">Quick setup</p>
          <p className="text-sm text-amber-800 mt-4 mb-6">
            Please enter a display name for the pirate. This name will be shown while you play and on the victory screen.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium">User:</label>
            <input
              className="w-full px-3 py-2 border rounded-md text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              aria-label="User name"
            />

            <div>
              <label className="block text-sm font-medium mt-4">Choose an avatar (optional):</label>
              <div className="flex gap-2 mt-2">
                {avatars.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvatar(a)}
                    className={`p-2 rounded-md text-xl ${avatar === a ? "ring-2 ring-offset-2 ring-indigo-500" : "hover:scale-110"}`}
                    aria-pressed={avatar === a}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              {onBack && (
                <Button variant="secondary" onClick={onBack} type="button">
                  Back
                </Button>
              )}
              <Button onClick={() => handleSubmit()} type="submit" disabled={!username.trim()}>
                Continue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
