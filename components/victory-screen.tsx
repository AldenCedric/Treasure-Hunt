"use client"

import { Button } from "@/components/ui/button"

interface VictoryScreenProps {
  onRestart: () => void
  username?: string | null
  avatar?: string | null
  completedLevels?: number[]
  wrongLevels?: number[]
}

const MAP_IMAGE = "treasure-map-background.jpg"

export default function VictoryScreen({ 
  onRestart, 
  username, 
  avatar, 
  completedLevels = [], 
  wrongLevels = [] 
}: VictoryScreenProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute inset-0 opacity-20">
        <img src={`/${MAP_IMAGE}`} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-4xl w-full">

        <div className="text-9xl animate-bounce">🎉</div>

        <div className="parchment rounded-3xl p-8 md:p-12 shadow-2xl border-8 border-amber-900 relative overflow-hidden">

          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-amber-800 to-transparent opacity-50" />
          
          <div className="relative">

            <div className="flex items-center justify-center gap-4 mb-6">
              {avatar && (
                <span className="text-4xl md:text-5xl">{avatar}</span>
              )}
              <h1 className="text-4xl md:text-5xl font-black text-amber-950 [text-shadow:_2px_2px_0_rgb(255_255_255_/_30%)]">
                Congratulations{username ? `, ${username}` : ""}!
              </h1>
            </div>
            
            <p className="text-2xl md:text-3xl font-bold text-amber-950 leading-relaxed mb-6">
              You found the treasure! 🏴‍☠️
            </p>
            
            <div className="bg-amber-100 rounded-2xl border-4 border-amber-800 p-6 max-w-md mx-auto">
              <p className="text-xl font-bold text-amber-950 mb-4">Adventure Results:</p>
              
              <div className="space-y-3 text-lg text-amber-900">
                <div className="flex justify-between">
                  <span>Questions Completed:</span>
                  <span className="font-bold text-green-700">{completedLevels.length} / 20</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Challenges Faced:</span>
                  <span className="font-bold text-red-700">{wrongLevels.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="font-bold text-blue-700">
                    {completedLevels.length > 0 
                      ? `${Math.round((completedLevels.length / 20) * 100)}%` 
                      : "0%"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-800 to-transparent opacity-50" />
        </div>

        <Button
          onClick={onRestart}
          size="lg"
          className="bg-gradient-to-b from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-black text-2xl px-12 py-6 rounded-xl shadow-2xl border-4 border-green-950 transform hover:scale-105 transition-transform">
          Play Again
        </Button>
      </div>
    </div>
  )
}
