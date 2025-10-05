"use client"

import { useState } from "react"
import WelcomeScreen from "@/components/welcome-screen"
import InstructionsScreen from "@/components/instructions-screen"
import LoginScreen from "@/components/login-screen"
import GameBoard from "@/components/game-board"
import QuestionScreen from "@/components/question-screen"
import VictoryScreen from "@/components/victory-screen"

export default function TreasureHuntPage() {
  const [screen, setScreen] = useState<"welcome" | "instructions" | "login" | "game" | "question" | "victory">("welcome")
  const [currentLevel, setCurrentLevel] = useState(1)
  const [completedLevels, setCompletedLevels] = useState<number[]>([])
  const [piratePosition, setPiratePosition] = useState(1)
  const [username, setUsername] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | undefined>(undefined)
  const [wrongLevels, setWrongLevels] = useState<number[]>([])

  const handleStart = () => {
    setScreen("instructions")
  }

  const handleBeginGame = () => {
    // after reading instructions, show login to collect username
    setScreen("login")
  }

  const handleLogin = (name: string, av?: string) => {
    setUsername(name)
    setAvatar(av)
    try {
      localStorage.setItem("thq_user", JSON.stringify({ name, avatar: av }))
    } catch {
      // ignore
    }
    setScreen("game")
  }

  const handleLevelClick = (level: number) => {
    setCurrentLevel(level)
    setScreen("question")
  }

  const handleMarkWrong = (level: number) => {
    setWrongLevels((prev) => {
      if (prev.includes(level)) return prev
      return [...prev, level]
    })
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
      {screen === "login" && <LoginScreen onLogin={handleLogin} onBack={() => setScreen("instructions")} />}
      {screen === "game" && (
        <GameBoard
          currentLevel={currentLevel}
          completedLevels={completedLevels}
          piratePosition={piratePosition}
          onLevelClick={handleLevelClick}
        />
      )}
      {screen === "question" && (
        <QuestionScreen level={currentLevel} onCorrectAnswer={handleAnswerCorrect} onBack={handleBackToGame} onWrong={handleMarkWrong} />
      )}
      {screen === "victory" && (
        <VictoryScreen
          username={username}
          completedLevels={completedLevels}
          // pass wrongLevels so VictoryScreen can show exactly which levels were marked wrong
          // (these are levels where the user clicked Check Answer and it was incorrect at least once)
          // This is cumulative and not cleared when user later answers correctly.
          onRestart={() => {
            setScreen("welcome")
            setCurrentLevel(1)
            setCompletedLevels([])
            setPiratePosition(1)
            setWrongLevels([])
          }}
          wrongLevels={wrongLevels}
        />
      )}
    </main>
  )
}
