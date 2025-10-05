"use client"

import { Button } from "@/components/ui/button"

interface WelcomeScreenProps {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background island map */}
      <div className="absolute inset-0 opacity-30">
        <img src="/treasure-island-map-with-palm-trees-and-paths.jpg" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl w-full">
        {/* Pirate character */}
        <div className="w-48 h-48 md:w-64 md:h-64">
          <img src="/cute-cartoon-pirate-character-with-hat-and-sword.jpg" alt="Pirate" className="w-full h-full object-contain drop-shadow-2xl" />
        </div>

        {/* Treasure Hunt Logo */}
        <div className="relative">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight">
              <span className="text-yellow-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] [text-shadow:_3px_3px_0_rgb(139_69_19)]">
                Treasure
              </span>
            </h1>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight -mt-4">
              <span className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] [text-shadow:_3px_3px_0_rgb(139_69_19)]">
                Hunt
              </span>
            </h1>
          </div>
          {/* Treasure chest icon */}
          <div className="absolute -right-16 top-1/2 -translate-y-1/2 text-6xl">🗝️</div>
        </div>

        {/* Start Button */}
        <Button
          onClick={onStart}
          size="lg"
          className="bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-black text-3xl md:text-4xl px-16 py-8 rounded-2xl shadow-2xl border-4 border-orange-900 transform hover:scale-105 transition-transform"
        >
          START
        </Button>
      </div>
    </div>
  )
}
