"use client"

import { Button } from "@/components/ui/button"

interface InstructionsScreenProps {
  onBegin: () => void
}

export default function InstructionsScreen({ onBegin }: InstructionsScreenProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Instructions Scroll */}
        <div className="parchment rounded-3xl p-8 shadow-2xl border-4 border-amber-900 relative">
          {/* Scroll top decoration */}
          <div className="absolute -top-4 left-0 right-0 h-8 bg-gradient-to-b from-amber-800 to-amber-700 rounded-t-3xl" />

          <div className="relative">
            <h2 className="text-4xl font-black text-amber-950 mb-6 text-center [text-shadow:_2px_2px_0_rgb(255_255_255_/_30%)]">
              Instructions
            </h2>

            <ol className="space-y-4 text-amber-950 text-lg leading-relaxed">
              <li className="flex gap-3">
                <span className="font-black text-2xl">1.</span>
                <span>Click the questions button at the left part to reveal the question.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-2xl">2.</span>
                <span>
                  If they got the correct answer, click the &quot;Click to move&quot; button at the bottom left corner to move the
                  pirate.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-2xl">3.</span>
                <span>If they finally reach the treasure chest, click the treasure chest to reveal what&apos;s inside.</span>
              </li>
            </ol>

            {/* Treasure chest decoration */}
            <div className="absolute -bottom-6 -right-6 text-7xl opacity-80">💰</div>
          </div>

          {/* Scroll bottom decoration */}
          <div className="absolute -bottom-4 left-0 right-0 h-8 bg-gradient-to-t from-amber-800 to-amber-700 rounded-b-3xl" />
        </div>

        {/* Game Preview */}
        <div className="space-y-6">
          <div className="relative">
            <img src="/treasure-hunt-game-board-with-islands-and-paths.jpg" alt="Game Preview" className="w-full rounded-2xl shadow-2xl" />
          </div>

          <Button
            onClick={onBegin}
            size="lg"
            className="w-full bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-black text-3xl py-8 rounded-2xl shadow-2xl border-4 border-orange-900 transform hover:scale-105 transition-transform"
          >
            START
          </Button>
        </div>
      </div>
    </div>
  )
}
