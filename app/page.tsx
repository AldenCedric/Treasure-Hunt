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
  const [avatar, setAvatar] = useState<string | null>(null)
  const [wrongLevels, setWrongLevels] = useState<number[]>([])

  const handleStart = () => {
    setScreen("instructions")
  }

  const handleBeginGame = () => {
    setScreen("login")
  }

  const handleLogin = (name: string, av?: string) => {
    setUsername(name)
    setAvatar(av || null)
    try {
      localStorage.setItem("thq_user", JSON.stringify({ name, avatar: av }))
    } catch {
      // ignore errors
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
      setCompletedLevels(prev => [...prev, currentLevel])
    }

    if (piratePosition < 20) {
      setPiratePosition(prev => prev + 1)
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

  const handleRestart = () => {
    setScreen("welcome")
    setCurrentLevel(1)
    setCompletedLevels([])
    setPiratePosition(1)
    setWrongLevels([])
    setUsername(null)
    setAvatar(null)
  }

  return (
    <main className="min-h-screen w-full">
      {screen === "welcome" && <WelcomeScreen onStart={handleStart} />}
      {screen === "instructions" && <InstructionsScreen onBegin={handleBeginGame} />}
      {screen === "login" && (
        <LoginScreen 
          onLogin={handleLogin} 
          onBack={() => setScreen("instructions")} 
        />
      )}
      {screen === "game" && (
        <GameBoard
          currentLevel={currentLevel}
          completedLevels={completedLevels}
          piratePosition={piratePosition}
          onLevelClick={handleLevelClick}
        />
      )}
      {screen === "question" && (
        <QuestionScreen 
          level={currentLevel} 
          onCorrectAnswer={handleAnswerCorrect} 
          onBack={handleBackToGame} 
          onWrong={handleMarkWrong}
          completedLevels={completedLevels}
        />
      )}
      {screen === "victory" && (
        <VictoryScreen
          username={username}
          avatar={avatar}
          completedLevels={completedLevels}
          onRestart={handleRestart}
          wrongLevels={wrongLevels}
        />
      )}
    </main>
  )
}
