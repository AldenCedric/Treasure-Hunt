"use client"

import { useState } from "react"
import WelcomeScreen from "@/components/welcome-screen"
import InstructionsScreen from "@/components/instructions-screen"
import GameBoard from "@/components/game-board"
import QuestionScreen from "@/components/question-screen"
import VictoryScreen from "@/components/victory-screen"

export default function TreasureHuntPage() {
  const [screen, setScreen] = useState<"welcome" | "instructions" | "game" | "question" | "victory">("welcome")
  const [currentLevel, setCurrentLevel] = useState(1)
  const [completedLevels, setCompletedLevels] = useState<number[]>([])
  const [piratePosition, setPiratePosition] = useState(1)

  const handleStart = () => {
    setScreen("instructions")
  }

  const handleBeginGame = () => {
    setScreen("game")
  }

  const handleLevelClick = (level: number) => {
    setCurrentLevel(level)
    setScreen("question")
  }

  const handleAnswerCorrect = () => {
    if (!completedLevels.includes(currentLevel)) {
      setCompletedLevels([...completedLevels, currentLevel])
    }

    if (piratePosition < 20) {
      setPiratePosition(piratePosition + 1)
    }

    if (completedLevels.length + 1 >= 20) {
      setScreen("victory")
    } else {
      setScreen("game")
    }
  }

  const handleBackToGame = () => {
    setScreen("game")
  }

  return (
    <main className="min-h-screen w-full">
      {screen === "welcome" && <WelcomeScreen onStart={handleStart} />}
      {screen === "instructions" && <InstructionsScreen onBegin={handleBeginGame} />}
      {screen === "game" && (
        <GameBoard
          currentLevel={currentLevel}
          completedLevels={completedLevels}
          piratePosition={piratePosition}
          onLevelClick={handleLevelClick}
        />
      )}
      {screen === "question" && (
        <QuestionScreen level={currentLevel} onCorrectAnswer={handleAnswerCorrect} onBack={handleBackToGame} />
      )}
      {screen === "victory" && (
        <VictoryScreen
          onRestart={() => {
            setScreen("welcome")
            setCurrentLevel(1)
            setCompletedLevels([])
            setPiratePosition(1)
          }}
        />
      )}
    </main>
  )
}
