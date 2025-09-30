'use client'

import { useState, useEffect, useRef } from 'react'
import { useGame } from '@/contexts/GameContext'

export default function ScoreInput() {
  const { state, addScore, completeTurn, nextTurn } = useGame()
  const { players, currentPlayerIndex, gameEnded } = state
  const [scores, setScores] = useState<[string, string, string]>(['', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const currentPlayer = players[currentPlayerIndex]

  // Focus first input field when current player changes
  useEffect(() => {
    if (currentPlayer && !gameEnded) {
      const firstInput = document.getElementById('score-0')
      if (firstInput) {
        firstInput.focus()
      }
    }
  }, [currentPlayerIndex, currentPlayer, gameEnded])

  // Prevent wheel events on all number inputs
  useEffect(() => {
    const preventWheel = (e: Event) => {
      if (e.target instanceof HTMLInputElement && e.target.type === 'number') {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    // Add event listeners to all number inputs
    const numberInputs = document.querySelectorAll('input[type="number"]')
    numberInputs.forEach(input => {
      input.addEventListener('wheel', preventWheel, { passive: false })
      input.addEventListener('mousewheel', preventWheel, { passive: false })
    })

    return () => {
      numberInputs.forEach(input => {
        input.removeEventListener('wheel', preventWheel)
        input.removeEventListener('mousewheel', preventWheel)
      })
    }
  }, [scores]) // Re-run when scores change to catch new inputs

  const handleScoreChange = (index: number, value: string) => {
    const newScores: [string, string, string] = [...scores]
    newScores[index] = value
    setScores(newScores)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      if (index < 2) {
        // Move to next input
        const nextInput = document.getElementById(`score-${index + 1}`)
        nextInput?.focus()
      } else {
        // On the last input, submit the form if all scores are valid
        if (canSubmit) {
          handleSubmit(e as React.FormEvent)
        }
      }
    }
  }

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    // Prevent scroll from changing the input value
    e.preventDefault()
    e.stopPropagation()
  }

  const handleWheelCapture = (e: React.WheelEvent<HTMLInputElement>) => {
    // Also prevent wheel events during capture phase
    e.preventDefault()
    e.stopPropagation()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (currentPlayer) {
      // Add all 3 scores at once (including negative scores for fouls)
      scores.forEach((score) => {
        const scoreValue = Number(score)
        if (!isNaN(scoreValue)) {
          addScore(currentPlayer.id, scoreValue)
        }
      })

      // Complete the turn
      completeTurn(currentPlayer.id)

      // Reset scores and move to next turn
      setScores(['', '', ''])

      // Only move to next turn if game hasn't ended
      if (!gameEnded) {
        nextTurn()
      }
    }
  }

  const handleSkipTurn = () => {
    if (currentPlayer) {
      // Add three 0 scores for the skipped turn
      addScore(currentPlayer.id, 0)
      addScore(currentPlayer.id, 0)
      addScore(currentPlayer.id, 0)

      // Complete the turn
      completeTurn(currentPlayer.id)

      // Reset scores and move to next turn
      setScores(['', '', ''])

      // Only move to next turn if game hasn't ended
      if (!gameEnded) {
        nextTurn()
      }
    }
  }

  const canSubmit = scores.every(score => score !== '' && !isNaN(Number(score)))

  if (gameEnded) {
    return null
  }

  const currentTurnTotal = scores.reduce((sum, score) => sum + (Number(score) || 0), 0)
  const wouldExceedTarget = currentPlayer && (currentPlayer.score + currentTurnTotal) > state.targetScore
  const excessAmount = wouldExceedTarget ? (currentPlayer.score + currentTurnTotal) - state.targetScore : 0
  const remainingPoints = currentPlayer ? state.targetScore - currentPlayer.score : 0

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8">
      <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        🎯 Enter Turn Scores
      </h3>

      <div className="text-center mb-8">
        <p className="text-xl text-gray-600 mb-3">
          Current Player:
        </p>
        <p className="text-4xl font-bold text-blue-600 mb-2">
          {currentPlayer?.name}
        </p>
        <div className="flex justify-center space-x-6 text-lg text-gray-500">
          <span>Total: <span className="font-semibold text-gray-700">{currentPlayer?.score || 0}</span></span>
          <span>Turn: <span className="font-semibold text-gray-700">{currentPlayer?.turns.length ? currentPlayer.turns.length + 1 : 1}</span></span>
          <span>Remaining: <span className="font-semibold text-green-600">{remainingPoints}</span></span>
        </div>
      </div>

      {/* Three Large Input Boxes */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700 mb-4 text-center">
            Enter 3 scores for this turn:
          </label>
          <p className="text-sm text-gray-500 mb-6 text-center">
            💡 Press Enter to move to next field, Enter on last field to submit<br/>
            ⚠️ Use negative numbers for fouls (e.g., -5 for a foul)
          </p>

          <div className="grid grid-cols-3 gap-6">
            {[0, 1, 2].map((index) => (
              <div key={index} className="text-center">
                <label htmlFor={`score-${index}`} className="block text-lg font-semibold text-gray-700 mb-3">
                  Score {index + 1}
                </label>
                <input
                  ref={(el) => { inputRefs.current[index] = el }}
                  id={`score-${index}`}
                  type="number"
                  value={scores[index]}
                  onChange={(e) => handleScoreChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onWheel={handleWheel}
                  onWheelCapture={handleWheelCapture}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-center text-3xl font-bold text-gray-800"
                  placeholder="0"
                  autoFocus={index === 0}
                  style={{ MozAppearance: 'textfield' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Turn Total Display */}
        <div className={`text-center p-6 rounded-xl border-2 ${
          wouldExceedTarget
            ? 'bg-red-50 border-red-200'
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <p className="text-lg text-gray-600 mb-2">Turn Total:</p>
          <p className={`text-5xl font-bold ${
            wouldExceedTarget ? 'text-red-600' : 'text-blue-600'
          }`}>
            {currentTurnTotal < 0 ? `(${currentTurnTotal})` : currentTurnTotal}
          </p>
          {wouldExceedTarget && (
            <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 font-semibold">
                ⚠️ This turn would exceed the target score by {excessAmount} points!
              </p>
              <p className="text-red-700 text-sm mt-1">
                Only {state.targetScore - currentPlayer.score} points will be added to your total score.
              </p>
            </div>
          )}
          {!wouldExceedTarget && currentTurnTotal > 0 && (
            <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-800 font-semibold">
                {remainingPoints - currentTurnTotal === 0
                  ? '🎉 This turn would WIN the game!'
                  : `✅ After this turn: ${remainingPoints - currentTurnTotal} points remaining to win`
                }
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-6 px-6 rounded-xl font-bold text-xl transition-all duration-200 ${
              canSubmit
                ? 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            ✅ Complete Turn & Next Player
          </button>

          <button
            type="button"
            onClick={handleSkipTurn}
            className="w-full py-4 px-6 bg-orange-600 text-white rounded-xl hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            ⏭️ Skip Turn (Score: 0)
          </button>
        </div>
      </form>
    </div>
  )
}
