"use client"

import { Button } from "@/components/ui/button"

interface VictoryScreenProps {
  onRestart: () => void
}

const MAP_IMAGE = "treasure-map-background.jpg"

export default function VictoryScreen({ onRestart }: VictoryScreenProps) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        backgroundImage: `url('/${MAP_IMAGE}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      <div className="relative text-center space-y-8 max-w-2xl">
        {/* Treasure Chest */}
        <div className="text-9xl animate-bounce">💎</div>

        {/* Victory Message */}
        <div className="parchment rounded-3xl p-12 shadow-2xl border-8 border-amber-900">
          <h1 className="text-5xl md:text-6xl font-black text-amber-950 mb-6 [text-shadow:_2px_2px_0_rgb(255_255_255_/_30%)]">
            Congratulations!
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-amber-950 leading-relaxed">You found the treasure! 🏴‍☠️</p>
          <p className="text-xl text-amber-800 mt-4">All levels completed successfully!</p>
        </div>

        {/* Restart Button */}
        <Button
          onClick={onRestart}
          size="lg"
          className="bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-black text-3xl px-16 py-8 rounded-2xl shadow-2xl border-4 border-orange-900 transform hover:scale-105 transition-transform"
        >
          Play Again
        </Button>
      </div>
    </div>
  )
}
