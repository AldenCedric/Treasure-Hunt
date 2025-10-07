"use client"

import { useState } from "react"
import { Button } from "./ui/button"

interface LoginScreenProps {
  onLogin: (username: string, avatar?: string) => void
  onBack?: () => void
}

export default function LoginScreen({ onLogin, onBack }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [avatar, setAvatar] = useState<string | undefined>(undefined)

  const avatars = ["🏴‍☠️", "🦜", "⚓️", "🏝️", "🗺️"]

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    onLogin(username.trim(), avatar)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute inset-0 opacity-30">
        <img src="/treasure-island-map-with-palm-trees-and-paths.jpg" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl w-full">
        <div className="parchment rounded-3xl p-8 md:p-12 shadow-2xl border-8 border-amber-900 max-w-xl w-full relative overflow-hidden">

          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-amber-800 to-transparent opacity-50" />
          
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-black text-center text-amber-950 mb-6 [text-shadow:_2px_2px_0_rgb(255_255_255_/_30%)]">
              Welcome{username ? `, ${username}` : ""}
              {avatar && <span className="ml-2">{avatar}</span>}
            </h2>
            
            <p className="text-xl md:text-2xl font-bold text-amber-950 text-center leading-relaxed">
              Quick Setup
            </p>
            
            <p className="text-sm text-amber-800 mt-4 mb-6 text-center">
              Enter your pirate name and choose an avatar for your adventure!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-bold text-amber-950 mb-2">
                  Pirate Name:
                </label>
                <input
                  className="w-full px-4 py-3 bg-amber-50 border-4 border-amber-800 rounded-xl text-lg text-amber-950 placeholder-amber-600 font-bold text-center"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your pirate name"
                  aria-label="Pirate name"
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-amber-950 mb-3">
                  Choose an Avatar:
                </label>
                <div className="flex gap-3 justify-center">
                  {avatars.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvatar(a)}
                      className={`text-4xl p-3 rounded-2xl transition-all duration-200 ${
                        avatar === a 
                          ? "bg-amber-200 border-4 border-amber-800 scale-110" 
                          : "bg-amber-100 border-4 border-amber-700 hover:scale-110 hover:bg-amber-200"
                      }`}
                      aria-pressed={avatar === a}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                {onBack && (
                  <Button
                    variant="secondary"
                    onClick={onBack}
                    type="button"
                    className="bg-amber-100 border-2 border-amber-800 text-amber-950 font-bold text-xl px-8 py-4 rounded-xl shadow-2xl hover:bg-amber-200 transform hover:scale-105 transition-transform">
                     BACK
                  </Button>
                )}
                <Button
                  onClick={() => handleSubmit()}
                  type="submit"
                  disabled={!username.trim()}
                  className="bg-gradient-to-b from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-black text-xl px-8 py-4 rounded-xl shadow-2xl border-4 border-green-950 transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                  START
                </Button>
              </div>
            </form>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-800 to-transparent opacity-50" />
        </div>
      </div>
    </div>
  )
}
