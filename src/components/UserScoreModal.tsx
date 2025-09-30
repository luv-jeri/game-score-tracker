'use client'

import { useState } from 'react'
import { useGame } from '@/contexts/GameContext'
import type { Player } from '@/contexts/GameContext'

type UserScoreModalProps = {
  player: Player
  isOpen: boolean
  onClose: () => void
}

export default function UserScoreModal({ player, isOpen, onClose }: UserScoreModalProps) {
  const { editTurnScore, state } = useGame()
  const [editingTurn, setEditingTurn] = useState<number | null>(null)
  const [editScores, setEditScores] = useState<[string, string, string]>(['', '', ''])

  if (!isOpen) return null

  const remainingPoints = state.targetScore - player.score

  const handleEditClick = (turnIndex: number, currentScores: number[]) => {
    setEditingTurn(turnIndex)
    setEditScores([currentScores[0].toString(), currentScores[1].toString(), currentScores[2].toString()])
  }

  const handleEditScoreChange = (index: number, value: string) => {
    const newScores: [string, string, string] = [...editScores]
    newScores[index] = value
    setEditScores(newScores)
  }

  const handleSaveEdit = () => {
    if (editingTurn !== null) {
      const newScores = editScores.map(score => Number(score) || 0)
      editTurnScore(player.id, editingTurn, newScores)
      setEditingTurn(null)
      setEditScores(['', '', ''])
    }
  }

  const handleCancelEdit = () => {
    setEditingTurn(null)
    setEditScores(['', '', ''])
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      if (index < 2) {
        // Move to next input
        const nextInput = e.currentTarget.parentElement?.nextElementSibling?.querySelector('input')
        if (nextInput) {
          (nextInput as HTMLInputElement).focus()
        }
      } else {
        // On the last input, save the edit
        handleSaveEdit()
      }
    } else if (e.key === 'Escape') {
      handleCancelEdit()
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

  let runningTotal = 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">
              📊 {player.name}'s Score History
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="mt-4 flex items-center space-x-6">
            <div className="text-lg">
              <span className="font-semibold">Total Score:</span>
              <span className={`ml-2 text-2xl font-bold ${player.score < 0 ? 'text-red-300' : 'text-white'}`}>
                {player.score < 0 ? `(${player.score})` : player.score}
              </span>
            </div>
            <div className="text-lg">
              <span className="font-semibold">Completed Turns:</span>
              <span className="ml-2 text-xl font-bold">{player.turns.length}</span>
            </div>
            <div className="text-lg">
              <span className="font-semibold">Points to Win:</span>
              <span className="ml-2 text-xl font-bold text-green-300">{remainingPoints}</span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {editingTurn !== null && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-base text-blue-800 font-semibold">
                ✏️ Editing mode: Press Enter to move between fields, Enter on last field to save, Escape to cancel
              </p>
              <p className="text-sm text-blue-700 mt-2">
                ⚠️ Use negative numbers for fouls (e.g., -5 for a foul)
              </p>
            </div>
          )}

          {player.turns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-semibold text-gray-700">
                      Turn
                    </th>
                    <th className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-semibold text-gray-700">
                      Score 1
                    </th>
                    <th className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-semibold text-gray-700">
                      Score 2
                    </th>
                    <th className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-semibold text-gray-700">
                      Score 3
                    </th>
                        <th className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-semibold text-gray-700">
                          Turn Total
                        </th>
                        <th className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-semibold text-gray-700">
                          Excess
                        </th>
                        <th className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-semibold text-gray-700">
                          Running Total
                        </th>
                        <th className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-semibold text-gray-700">
                          Actions
                        </th>
                  </tr>
                </thead>
                <tbody>
                  {player.turns.map((turn, turnIndex) => {
                    runningTotal += turn.total
                    const isEditing = editingTurn === turnIndex

                    return (
                      <tr key={turnIndex} className="hover:bg-gray-50">
                        <td className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-semibold text-gray-600">
                          {turn.turnNumber}
                        </td>
                        {isEditing ? (
                          <>
                            <td className="border-2 border-gray-300 px-6 py-4 text-center">
                              <input
                                type="number"
                                value={editScores[0]}
                                onChange={(e) => handleEditScoreChange(0, e.target.value)}
                                onKeyDown={(e) => handleEditKeyDown(e, 0)}
                                onWheel={handleWheel}
                                onWheelCapture={handleWheelCapture}
                                className="w-20 px-3 py-2 text-lg text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                style={{ MozAppearance: 'textfield' }}
                              />
                            </td>
                            <td className="border-2 border-gray-300 px-6 py-4 text-center">
                              <input
                                type="number"
                                value={editScores[1]}
                                onChange={(e) => handleEditScoreChange(1, e.target.value)}
                                onKeyDown={(e) => handleEditKeyDown(e, 1)}
                                onWheel={handleWheel}
                                onWheelCapture={handleWheelCapture}
                                className="w-20 px-3 py-2 text-lg text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ MozAppearance: 'textfield' }}
                              />
                            </td>
                            <td className="border-2 border-gray-300 px-6 py-4 text-center">
                              <input
                                type="number"
                                value={editScores[2]}
                                onChange={(e) => handleEditScoreChange(2, e.target.value)}
                                onKeyDown={(e) => handleEditKeyDown(e, 2)}
                                onWheel={handleWheel}
                                onWheelCapture={handleWheelCapture}
                                className="w-20 px-3 py-2 text-lg text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ MozAppearance: 'textfield' }}
                              />
                            </td>
                                <td className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-bold text-blue-600">
                                  {editScores.reduce((sum, score) => sum + (Number(score) || 0), 0)}
                                </td>
                                <td className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-bold text-red-600">
                                  {editScores.reduce((sum, score) => sum + (Number(score) || 0), 0) > 0 ? 'Calculating...' : '0'}
                                </td>
                                <td className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-bold text-green-600">
                                  {runningTotal}
                                </td>
                            <td className="border-2 border-gray-300 px-6 py-4 text-center">
                              <div className="flex flex-col space-y-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="px-4 py-2 bg-green-500 text-white text-base rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-4 py-2 bg-gray-500 text-white text-base rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-semibold text-gray-600">
                              {turn.scores[0] < 0 ? `(${turn.scores[0]})` : turn.scores[0]}
                            </td>
                            <td className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-semibold text-gray-600">
                              {turn.scores[1] < 0 ? `(${turn.scores[1]})` : turn.scores[1]}
                            </td>
                            <td className="border-2 border-gray-300 px-6 py-4 text-center text-lg font-semibold text-gray-600">
                              {turn.scores[2] < 0 ? `(${turn.scores[2]})` : turn.scores[2]}
                            </td>
                                <td className={`border-2 border-gray-300 px-6 py-4 text-center text-lg font-bold ${
                                  turn.total < 0 ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                  {turn.total < 0 ? `(${turn.total})` : turn.total}
                                </td>
                                <td className={`border-2 border-gray-300 px-6 py-4 text-center text-lg font-bold ${
                                  turn.isExcessTurn ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                  {turn.isExcessTurn ? `+${turn.excessScore}` : '0'}
                                </td>
                                <td className={`border-2 border-gray-300 px-6 py-4 text-center text-lg font-bold ${
                                  runningTotal < 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {runningTotal < 0 ? `(${runningTotal})` : runningTotal}
                                </td>
                            <td className="border-2 border-gray-300 px-6 py-4 text-center">
                              <button
                                onClick={() => handleEditClick(turnIndex, turn.scores)}
                                className="px-4 py-2 bg-blue-500 text-white text-base rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                              >
                                Edit
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-400 text-xl italic py-16">
              No turns completed yet
            </div>
          )}

          {/* Current Turn Progress */}
          {player.currentTurnScores.length > 0 && (
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">Current Turn:</h4>
              <div className="text-lg text-blue-700 font-semibold">
                {player.currentTurnScores.map(score => score < 0 ? `(${score})` : score).join(' + ')} = {player.currentTurnScores.reduce((sum, score) => sum + score, 0)}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold text-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
