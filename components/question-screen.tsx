"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface QuestionScreenProps {
  level: number
  onCorrectAnswer: () => void
  onBack: () => void
  onWrong?: (level: number) => void
  completedLevels: number[]
}

const questions = [
  { question: "What is 2 + 2?", answer: "4" },
  { question: "What color is the sky?", answer: "blue" },
  { question: "How many legs does a spider have?", answer: "8" },
  { question: "What is the capital of France?", answer: "paris" },
  { question: "How many days in a week?", answer: "7" },
  { question: "What animal says 'meow'?", answer: "cat" },
  { question: "What is 5 x 5?", answer: "25" },
  { question: "What season comes after winter?", answer: "spring" },
  { question: "How many sides does a triangle have?", answer: "3" },
  { question: "What is the largest ocean?", answer: "pacific" },
  { question: "How many continents are there?", answer: "7" },
  { question: "What is 10 - 3?", answer: "7" },
  { question: "What color are emeralds?", answer: "green" },
  { question: "How many hours in a day?", answer: "24" },
  { question: "What is the opposite of hot?", answer: "cold" },
  { question: "How many months in a year?", answer: "12" },
  { question: "What is 3 x 3?", answer: "9" },
  { question: "What animal says 'woof'?", answer: "dog" },
  { question: "What is the first letter of the alphabet?", answer: "a" },
  { question: "How many wheels does a bicycle have?", answer: "2" },
]

export default function QuestionScreen({ level, onCorrectAnswer, onBack, onWrong, completedLevels }: QuestionScreenProps) {
  const [userAnswer, setUserAnswer] = useState("")
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [wrongAttempts, setWrongAttempts] = useState(0)

  const currentQuestion = questions[level - 1] || questions[0]
  const showRevealButton = wrongAttempts >= 3

  // Check if this level is already completed and auto-return to map
  useEffect(() => {
    if (completedLevels.includes(level)) {
      onBack()
    }
  }, [level, completedLevels, onBack])

  const handleRevealAnswer = () => {
    setShowAnswer(true)
  }

  const handleCheckAnswer = () => {
    const correct = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase()
    setIsCorrect(correct)

    if (correct) {
      setTimeout(() => {
        onCorrectAnswer()
      }, 1500)
    } else {
      setWrongAttempts(prev => prev + 1)
      if (typeof onWrong === "function") onWrong(level)
    }
  }
  // If level is already completed, show loading or return null
  if (completedLevels.includes(level)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
        <div className="text-center">
          <p className="text-2xl text-white">Returning to map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img src="/treasure-map-background.jpg" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-4 bg-amber-100 border-2 border-amber-800 text-amber-950 font-bold hover:bg-amber-200"
        >
          ← Back to Map
        </Button>

        <div className="parchment rounded-3xl shadow-2xl border-8 border-amber-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-amber-800 to-transparent opacity-50" />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-800 to-transparent opacity-50" />

          <div className="p-12 md:p-16 space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-black">
                <span className="text-yellow-400 [text-shadow:_2px_2px_0_rgb(139_69_19)]">Treasure</span>{" "}
                <span className="text-white [text-shadow:_2px_2px_0_rgb(139_69_19)]">Hunt</span>
              </h2>
              <div className="text-2xl mt-2">🗝️</div>
            </div>

            <h1 className="text-5xl md:text-3xl font-black text-center text-amber-950 [text-shadow:_2px_2px_0_rgb(255_255_255_/_30%)]">
              Question # {level}
            </h1>

            <div className="text-center space-y-6">
              <p className="text-2xl md:text-1xl font-bold text-amber-950 leading-relaxed">
                {currentQuestion.question}
              </p>

              <div className="max-w-md mx-auto">
                <Input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="text-2xl py-6 text-center bg-amber-50 border-4 border-amber-800 text-amber-950 placeholder:text-amber-600 font-bold"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCheckAnswer()
                    }
                  }}
                />
              </div>

              {isCorrect !== null && (
                <div className={`text-3xl font-black ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? "✓ Correct! Moving pirate..." : "✗ Try again!"}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              {showRevealButton && (
                <Button
                  onClick={handleRevealAnswer}
                  size="lg"
                  className="bg-gradient-to-b from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-black text-2xl px-12 py-6 rounded-xl shadow-2xl border-4 border-red-950 transform hover:scale-105 transition-transform">
                  Reveal Answer
                </Button>
              )}
              
              <Button
                onClick={handleCheckAnswer}
                size="lg"
                className="bg-gradient-to-b from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-black text-2xl px-12 py-6 rounded-xl shadow-2xl border-4 border-green-950 transform hover:scale-105 transition-transform">
                Submit Answer
              </Button>
            </div>

            {showAnswer && (
              <div className="text-center p-6 bg-amber-100 rounded-2xl border-4 border-amber-800">
                <p className="text-2xl font-black text-amber-950">Answer: {currentQuestion.answer}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
