'use client'

import { useState } from 'react'
import { useGame } from '@/contexts/GameContext'
import type { GameHistoryEntry } from '@/contexts/GameContext'

type GameHistoryModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function GameHistoryModal({ isOpen, onClose }: GameHistoryModalProps) {
  const { state, travelToHistory, clearHistory } = useGame()
  const { history = [] } = state // Provide default empty array
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  if (!isOpen) return null

  const handleTimeTravel = (historyEntry: GameHistoryEntry) => {
    travelToHistory(historyEntry)
    onClose()
  }

  const handleClearHistory = () => {
    clearHistory()
    setShowConfirmClear(false)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'START_GAME':
        return '🚀'
      case 'COMPLETE_TURN':
        return '🎯'
      case 'UPDATE_TARGET_SCORE':
        return '📊'
      case 'EDIT_TURN_SCORE':
        return '✏️'
      case 'RESTART_GAME':
        return '🔄'
      case 'RESET_GAME':
        return '🗑️'
      default:
        return '📝'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'START_GAME':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'COMPLETE_TURN':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'UPDATE_TARGET_SCORE':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'EDIT_TURN_SCORE':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'RESTART_GAME':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'RESET_GAME':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">
              ⏰ Game History Timeline
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-lg">
              Click on any moment to travel back in time
            </p>
            <button
              onClick={() => setShowConfirmClear(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              Clear History
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {(history || []).length === 0 ? (
            <div className="text-center text-gray-400 text-xl italic py-16">
              No game history yet. Start playing to see your timeline!
            </div>
          ) : (
            <div className="space-y-4">
              {(history || []).map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => handleTimeTravel(entry)}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-start space-x-4">
                    {/* Timeline Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 ${getActionColor(entry.action)}`}>
                        {getActionIcon(entry.action)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {entry.description}
                        </h3>
                        <div className="text-sm text-gray-500">
                          {formatDate(entry.timestamp)} at {formatTime(entry.timestamp)}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        Turn #{entry.turnNumber} • {entry.action.replace('_', ' ')}
                      </div>

                      {/* Game State Snapshot */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Game State at this moment:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {entry.gameState.players.map(player => (
                            <div key={player.id} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="font-semibold text-sm text-gray-800">{player.name}</div>
                              <div className="text-lg font-bold text-blue-600">{player.score}</div>
                              <div className="text-xs text-gray-500">{player.turns.length} turns</div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-sm text-gray-600">
                          <span className="font-semibold">Target Score:</span> {entry.gameState.targetScore}
                          {entry.gameState.winner && (
                            <span className="ml-4 text-yellow-600 font-semibold">
                              🏆 Winner: {entry.gameState.winner.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Click to Travel Button */}
                      <div className="mt-4 text-center">
                        <span className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                          🕰️ Travel to this moment
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {(history || []).length} history entries
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold text-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Clear History Confirmation Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🗑️ Clear History</h3>
            <p className="text-lg text-gray-600 mb-8 text-center">
              Are you sure you want to clear all game history? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleClearHistory}
                className="flex-1 py-4 px-6 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ✅ Yes, Clear
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 py-4 px-6 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
