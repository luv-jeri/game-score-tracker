'use client'

import { useState } from 'react'
import { useGame } from '@/contexts/GameContext'

export default function GameSetup() {
  const { startGame } = useGame()
  const [players, setPlayers] = useState<string[]>([''])
  const [targetScore, setTargetScore] = useState<number>(100)

  const addPlayer = () => {
    setPlayers([...players, ''])
  }

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index))
    }
  }

  const updatePlayerName = (index: number, name: string) => {
    const updatedPlayers = [...players]
    updatedPlayers[index] = name
    setPlayers(updatedPlayers)
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

  const handleStartGame = () => {
    const validPlayers = players.filter(name => name.trim() !== '')
    if (validPlayers.length >= 2 && targetScore > 0) {
      startGame(validPlayers, targetScore)
    }
  }

  const isValid = players.filter(name => name.trim() !== '').length >= 2 && targetScore > 0

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8">
      <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        🎯 Game Setup
      </h2>

      <div className="space-y-8">
        {/* Target Score */}
        <div>
          <label htmlFor="targetScore" className="block text-xl font-semibold text-gray-700 mb-4">
            Target Score to Win
          </label>
          <input
            id="targetScore"
            type="number"
            min="1"
            value={targetScore}
            onChange={(e) => setTargetScore(Number(e.target.value))}
            onWheel={handleWheel}
            onWheelCapture={handleWheelCapture}
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-bold"
            placeholder="Enter target score"
            style={{ MozAppearance: 'textfield' }}
          />
        </div>

        {/* Players */}
        <div>
          <label className="block text-xl font-semibold text-gray-700 mb-4">
            Players ({players.filter(name => name.trim() !== '').length})
          </label>
          <div className="space-y-4">
            {players.map((player, index) => (
              <div key={index} className="flex items-center space-x-4">
                <input
                  type="text"
                  value={player}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                  placeholder={`Player ${index + 1} name`}
                />
                {players.length > 1 && (
                  <button
                    onClick={() => removePlayer(index)}
                    className="px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addPlayer}
            className="mt-4 px-8 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            ➕ Add Player
          </button>
        </div>

        {/* Start Game Button */}
        <button
          onClick={handleStartGame}
          disabled={!isValid}
          className={`w-full py-6 px-6 rounded-xl font-bold text-2xl transition-all duration-200 ${
            isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          🚀 Start Game
        </button>
      </div>
    </div>
  )
}
