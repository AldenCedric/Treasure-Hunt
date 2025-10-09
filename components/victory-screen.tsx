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

  const calculateSuccessRate = () => {
    const totalCorrect = completedLevels.length
    const totalWrong = wrongLevels.length
    const totalAttempts = totalCorrect + totalWrong
    
    if (totalAttempts === 0) return 0

    const successRate = (totalCorrect / totalAttempts) * 100
    return Math.round(successRate)
  }

  const successRate = calculateSuccessRate()
  const totalCorrect = completedLevels.length
  const totalWrong = wrongLevels.length
  const totalAttempts = totalCorrect + totalWrong

  const revealButtonStats = {
    timesUsed: 3,
    questionsRevealed: 5,
    mostRevealedQuestion: 7
  }

  const answerReveals = [
    { question: 7, answer: "Plants rely on innate defenses like physical barriers and chemicals, while animals use both innate and adaptive immunity." },
    { question: 12, answer: "Behavioral regulation to maintain body temperature" },
    { question: 15, answer: "By excreting very dilute urine through kidneys" }
  ]

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute inset-0 opacity-20">
        <img src={`/${MAP_IMAGE}`} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-6xl w-full">

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
              Here are your personal results!
            </p>
            
            <div className="bg-amber-100 rounded-2xl border-4 border-amber-800 p-6 max-w-md mx-auto mb-8">
              <p className="text-xl font-bold text-amber-950 mb-4">Adventure Results:</p>
              
              <div className="space-y-3 text-lg text-amber-900">
                <div className="flex justify-between">
                  <span>Questions Completed:</span>
                  <span className="font-bold text-green-700">{totalCorrect} / 20</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Correct Answers:</span>
                  <span className="font-bold text-green-700">{totalCorrect}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Wrong Answers:</span>
                  <span className="font-bold text-red-700">{totalWrong}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Total Attempts:</span>
                  <span className="font-bold text-blue-700">{totalAttempts}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className={`font-bold ${
                    successRate >= 80 ? "text-green-700" : 
                    successRate >= 60 ? "text-yellow-600" : 
                    "text-red-700"
                  }`}>
                    {successRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-800 to-transparent opacity-50" />
        </div>

        <div className="parchment rounded-3xl p-8 md:p-12 shadow-2xl border-8 border-amber-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-amber-800 to-transparent opacity-50" />
          
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black text-amber-950 [text-shadow:_2px_2px_0_rgb(255_255_255_/_30%)] mb-6">
              Reveal Button Usage
            </h2>
            
            <div className="bg-amber-100 rounded-2xl border-4 border-amber-800 p-6 max-w-md mx-auto">
              <p className="text-xl font-bold text-amber-950 mb-4">Reveal Statistics:</p>
              
              <div className="space-y-3 text-lg text-amber-900">
                <div className="flex justify-between">
                  <span>Times Used:</span>
                  <span className="font-bold text-purple-700">{revealButtonStats.timesUsed}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Questions Revealed:</span>
                  <span className="font-bold text-purple-700">{revealButtonStats.questionsRevealed}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Most Revealed:</span>
                  <span className="font-bold text-purple-700">Question #{revealButtonStats.mostRevealedQuestion}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-800 to-transparent opacity-50" />
        </div>

        {/* Answer Reveals Section */}
        <div className="parchment rounded-3xl p-8 md:p-12 shadow-2xl border-8 border-amber-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-amber-800 to-transparent opacity-50" />
          
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black text-amber-950 [text-shadow:_2px_2px_0_rgb(255_255_255_/_30%)] mb-6">
              Answers Revealed
            </h2>
            
            <div className="space-y-4 max-w-2xl mx-auto">
              {answerReveals.map((reveal, index) => (
                <div key={index} className="bg-amber-100 rounded-2xl border-4 border-amber-800 p-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-800 text-amber-50 rounded-lg px-3 py-1 font-bold text-lg min-w-12 text-center">
                      #{reveal.question}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-lg font-bold text-amber-950">Correct Answer:</p>
                      <p className="text-amber-800 font-medium">{reveal.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {answerReveals.length === 0 && (
                <div className="bg-amber-100 rounded-2xl border-4 border-amber-800 p-6 text-center">
                  <p className="text-xl font-bold text-amber-950">No answers were revealed during your adventure!</p>
                  <p className="text-amber-700 mt-2">Great job figuring everything out on your own! 🎯</p>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-800 to-transparent opacity-50" />
        </div>

        {/* Play Again Button */}
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
