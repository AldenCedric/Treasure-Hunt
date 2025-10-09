"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface QuestionScreenProps {
  level: number
  onCorrectAnswer: () => void
  onBack: () => void
  onWrong?: (level: number) => void
  completedLevels: number[]
}

interface Question {
  question: string
  choices: {
    a: string
    b: string
    c: string
    d: string
  }
  correctAnswer: keyof Question['choices']
}

const questions: Question[] = [
  {
    question: "Which of the following best explains a fundamental difference between plant and animal reproduction?",
    choices: {
      a: "Both rely solely on sexual reproduction.",
      b: "Plants can reproduce both sexually and asexually, while most animals primarily reproduce sexually.",
      c: "Animals can produce gametes without meiosis, but plants cannot.",
      d: "Plants and animals both depend on external fertilization only."
    },
    correctAnswer: "b"
  },
  {
    question: "Why is plant development considered more flexible compared to animal development?",
    choices: {
      a: "Plant cells retain totipotency, allowing them to regenerate tissues, while animal cells usually cannot.",
      b: "Animal embryos develop faster than plant embryos.",
      c: "Plants have nervous systems to regulate growth, but animals do not.",
      d: "Animals rely on hormones, but plants rely only on genes."
    },
    correctAnswer: "a"
  },
  {
    question: "Which statement highlights a contrast in nutrition between plants and animals?",
    choices: {
      a: "Both plants and animals rely on photosynthesis.",
      b: "Plants are autotrophs that produce glucose, while animals are heterotrophs that obtain energy from consuming organic matter.",
      c: "Animals synthesize their own food, while plants rely on fungi.",
      d: "Both depend solely on decomposers for survival."
    },
    correctAnswer: "b"
  },
  {
    question: "Why do plants primarily exchange gases through stomata while animals use lungs or gills?",
    choices: {
      a: "Plants lack a circulatory system to transport oxygen internally.",
      b: "Animals do not require oxygen for cellular respiration.",
      c: "Plants have blood cells that carry oxygen, while animals do not.",
      d: "Animals have chloroplasts that store gases."
    },
    correctAnswer: "a"
  },
  {
    question: "How does the transport of materials differ between plants and animals?",
    choices: {
      a: "Plants use xylem and phloem to move water and nutrients, while animals use blood in a circulatory system.",
      b: "Animals transport nutrients passively like diffusion, while plants pump nutrients actively.",
      c: "Both rely on a heart to circulate fluids.",
      d: "Plants circulate blood, while animals circulate sap."
    },
    correctAnswer: "a"
  },
  {
    question: "Which comparison is accurate regarding fluid regulation?",
    choices: {
      a: "Animals regulate osmotic balance via kidneys, while plants rely on vacuoles and stomata to manage water.",
      b: "Both plants and animals regulate fluids through lungs.",
      c: "Plants have nephron-like structures, but animals do not.",
      d: "Animals and plants both use stomata to remove excess salts."
    },
    correctAnswer: "a"
  },
  {
    question: "How does coordination differ between plants and animals?",
    choices: {
      a: "Plants rely mainly on hormones (auxins, gibberellins), while animals rely on both hormones and rapid nervous impulses.",
      b: "Plants use nerves and hormones, but animals rely only on hormones.",
      c: "Animals lack chemical signaling, unlike plants.",
      d: "Both rely equally on nervous systems for coordination."
    },
    correctAnswer: "a"
  },
  {
    question: "What is the main difference between plant and animal immune responses?",
    choices: {
      a: "Plants rely on innate defenses like physical barriers and chemicals, while animals use both innate and adaptive immunity.",
      b: "Animals have no immune defenses, while plants have antibodies.",
      c: "Plants use white blood cells, while animals rely on thorns.",
      d: "Both plants and animals rely entirely on external microbiomes."
    },
    correctAnswer: "a"
  },
  {
    question: "Why are animal sensory systems generally more complex than those of plants?",
    choices: {
      a: "Animals need specialized sensory organs (eyes, ears, skin) for mobility and survival, while plants rely on general responses like phototropism and gravitropism.",
      b: "Plants can see, but animals cannot detect light.",
      c: "Plants have nervous systems for faster reflexes.",
      d: "Animals do not respond to external stimuli."
    },
    correctAnswer: "a"
  },
  {
    question: "Which explanation best describes the difference in movement between plants and animals?",
    choices: {
      a: "Plants exhibit growth-based movements (tropisms and nastic movements), while animals use muscles and skeletal systems for active locomotion.",
      b: "Both plants and animals move actively using muscle fibers.",
      c: "Animals move passively, while plants actively chase food.",
      d: "Plants have bones that allow them to move quickly"
    },
    correctAnswer: "a"
  },
  {
    question: "Which best explains why homeostasis is vital for survival in organisms?",
    choices: {
      a: "It allows organisms to remain completely unaffected by external changes.",
      b: "It keeps internal conditions stable, ensuring enzymes and cellular processes function properly.",
      c: "It stops organisms from needing energy for metabolism.",
      d: "It prevents organisms from interacting with their environment."
    },
    correctAnswer: "b"
  },
  {
    question: "A desert lizard basks in the sun in the morning but hides under rocks during the hottest hours. Which homeostatic strategy does this represent?",
    choices: {
      a: "Behavioral regulation to maintain body temperature",
      b: "Structural adaptation through thick skin",
      c: "Chemical regulation by hormones",
      d: "Circulatory adjustment like sweating"
    },
    correctAnswer: "a"
  },
  {
    question: "How do stomata help plants regulate internal water balance?",
    choices: {
      a: "They absorb water directly from the soil.",
      b: "They control water loss through transpiration by opening and closing.",
      c: "They store water like vacuoles.",
      d: "They transport minerals from roots to leaves."
    },
    correctAnswer: "b"
  },
  {
    question: "Why does having a closed circulatory system support homeostasis better than an open system?",
    choices: {
      a: "Blood can be directed to specific organs more efficiently.",
      b: "It requires less energy to pump blood.",
      c: "It eliminates the need for a heart.",
      d: "It avoids the use of oxygen in cells."
    },
    correctAnswer: "a"
  },
  {
    question: "Freshwater fish constantly gain water by osmosis. How do they maintain homeostasis?",
    choices: {
      a: "By drinking large amounts of water",
      b: "By excreting very dilute urine through kidneys",
      c: "By storing excess water in their gills",
      d: "By closing off their skin pores"
    },
    correctAnswer: "b"
  },
  {
    question: "When a person exercises, sweat production increases. How does this maintain homeostasis?",
    choices: {
      a: "It adds more water to the body for hydration.",
      b: "It lowers body temperature through evaporative cooling.",
      c: "It removes wastes like urea from the skin.",
      d: "It reduces oxygen demand in muscles."
    },
    correctAnswer: "b"
  },
  {
    question: "Why is phototropism considered a homeostatic response?",
    choices: {
      a: "It allows plants to balance water and salt concentration.",
      b: "It ensures optimal light capture for photosynthesis.",
      c: "It prevents leaf overheating.",
      d: "It regulates nutrient absorption from roots."
    },
    correctAnswer: "b"
  },
  {
    question: "Why is the coordination of hormones and the nervous system essential for maintaining homeostasis in humans?",
    choices: {
      a: "Both systems allow rapid muscle growth.",
      b: "Hormones provide slow, long-lasting regulation while nerves allow fast, targeted responses.",
      c: "They both release only electrical signals.",
      d: "They replace the role of blood circulation."
    },
    correctAnswer: "b"
  },
  {
    question: "How does the immune system contribute to homeostasis?",
    choices: {
      a: "By preventing entry of nutrients into the blood",
      b: "By defending against pathogens that could disrupt normal body function",
      c: "By regulating hormone production in glands",
      d: "By maintaining constant body temperature"
    },
    correctAnswer: "b"
  },
  {
    question: "Which example best shows how different organisms use different structures for the same homeostatic goal?",
    choices: {
      a: "Human kidneys and plant stomata both regulate internal water balance.",
      b: "Human skin and fish gills both transport blood.",
      c: "Plant xylem and human lungs both store oxygen.",
      d: "Animal brains and plant roots both release sweat."
    },
    correctAnswer: "a"
  }
]

export default function QuestionScreen({ level, onCorrectAnswer, onBack, onWrong, completedLevels }: QuestionScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<keyof Question['choices'] | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [isChecking, setIsChecking] = useState(false)

  const currentQuestion = questions[level - 1]
  const showRevealButton = wrongAttempts >= 3

  useEffect(() => {
    if (completedLevels.includes(level)) {
      onBack()
    }
  }, [level, completedLevels, onBack])

  useEffect(() => {
    setSelectedAnswer(null)
    setShowAnswer(false)
    setIsCorrect(null)
    setWrongAttempts(0)
    setIsChecking(false)
  }, [level])

  const handleRevealAnswer = () => {
    setShowAnswer(true)
  }

  const handleSelectAnswer = (choice: keyof Question['choices']) => {
    if (isChecking || isCorrect !== null) return
    setSelectedAnswer(choice)
  }

  const handleCheckAnswer = () => {
    if (selectedAnswer === null || isChecking) return
    
    const correct = selectedAnswer === currentQuestion.correctAnswer
    setIsCorrect(correct)
    setIsChecking(true)

    if (correct) {
      setTimeout(() => {
        onCorrectAnswer()
      }, 1500)
    } else {
      setWrongAttempts(prev => prev + 1)
      if (typeof onWrong === "function") onWrong(level)
      
      // Reset after 1500ms for wrong answer
      setTimeout(() => {
        setIsCorrect(null)
        setSelectedAnswer(null)
        setIsChecking(false)
      }, 1500)
    }
  }

  if (!currentQuestion || completedLevels.includes(level)) {
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
              Question #{level}
            </h1>

            <div className="text-center space-y-6">
              <p className="text-2xl md:text-1xl font-bold text-amber-950 leading-relaxed">
                {currentQuestion.question}
              </p>

              <div className="max-w-2xl mx-auto space-y-4">
                {Object.entries(currentQuestion.choices).map(([key, choice]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectAnswer(key as keyof Question['choices'])}
                    disabled={isChecking || isCorrect !== null}
                    className={`w-full p-4 text-left rounded-xl border-4 font-bold text-lg transition-all ${
                      selectedAnswer === key
                        ? isCorrect === true
                          ? 'bg-green-100 border-green-600 text-green-900 shadow-lg'
                          : isCorrect === false
                          ? 'bg-red-100 border-red-600 text-red-900 shadow-lg'
                          : 'bg-blue-100 border-blue-600 text-blue-900 shadow-lg scale-105'
                        : 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100 hover:border-amber-500'
                    } ${(isChecking || isCorrect !== null) ? 'opacity-80' : ''}`}>
                    <span className="font-black mr-3">{key.toUpperCase()}.</span>
                    {choice}
                  </button>
                ))}
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
                  disabled={isChecking}
                  size="lg"
                  className="bg-gradient-to-b from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-black text-2xl px-12 py-6 rounded-xl shadow-2xl border-4 border-red-950 transform hover:scale-105 transition-transform">
                  Reveal Answer
                </Button>
              )}
              
              <Button
                onClick={handleCheckAnswer}
                disabled={selectedAnswer === null || isChecking}
                size="lg"
                className="bg-gradient-to-b from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-black text-2xl px-12 py-6 rounded-xl shadow-2xl border-4 border-green-950 transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                {isChecking ? "Checking..." : "Submit Answer"}
              </Button>
            </div>

            {showAnswer && (
              <div className="text-center p-6 bg-amber-100 rounded-2xl border-4 border-amber-800">
                <p className="text-2xl font-black text-amber-950">
                  Correct Answer: {currentQuestion.correctAnswer.toUpperCase()}. {currentQuestion.choices[currentQuestion.correctAnswer]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
