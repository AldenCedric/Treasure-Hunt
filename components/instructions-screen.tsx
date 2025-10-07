"use client"

import { Button } from "@/components/ui/button"

interface InstructionsScreenProps {
  onBegin: () => void
}

export default function InstructionsScreen({ onBegin }: InstructionsScreenProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative">
      
      <div className="absolute inset-0 opacity-30">
        <img src="/treasure-island-map-with-palm-trees-and-paths.jpg" alt="" className="w-full h-full object-cover" />
      </div>
      
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center relative z-10">

        <div className="parchment rounded-3xl p-8 shadow-2xl border-8 border-amber-900 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-amber-800 to-transparent opacity-50" />
          
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-black text-center text-amber-950 mb-8 [text-shadow:_2px_2px_0_rgb(255_255_255_/_30%)]">
              Instructions
            </h2>

            <ol className="space-y-6 text-amber-950 text-lg md:text-xl leading-relaxed">
              <li className="flex gap-4 items-start">
                <span className="font-black text-2xl flex-shrink-0">1.</span>
                <span>Move your pirate using WASD keys or on-screen controls to explore the treasure map.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="font-black text-2xl flex-shrink-0">2.</span>
                <span>Approach question markers and press [E] to reveal questions when you get close.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="font-black text-2xl flex-shrink-0">3.</span>
                <span>Answer questions correctly to collect treasures and progress through the game.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="font-black text-2xl flex-shrink-0">4.</span>
                <span>Complete all 20 questions to find the ultimate treasure!</span>
              </li>
            </ol>

            <div className="absolute -bottom-6 -right-6 text-7xl opacity-80">🗺️</div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-800 to-transparent opacity-50" />
        </div>

        <div className="space-y-8">
          <div className="relative">
            <img 
              src="/treasure-hunt-game-board-with-islands-and-paths.jpg" 
              alt="Game Preview" 
              className="w-full rounded-2xl shadow-2xl border-4 border-amber-800"
            />
            <div className="absolute inset-0 rounded-2xl border-4 border-amber-400 opacity-30 pointer-events-none" />
          </div>

          <Button
            onClick={onBegin}
            size="lg"
            className="w-full bg-gradient-to-b from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-black text-2xl md:text-3xl py-6 md:py-8 rounded-xl shadow-2xl border-4 border-green-950 transform hover:scale-105 transition-transform duration-200">
            START
          </Button>
        </div>
      </div>
    </div>
  )
}
