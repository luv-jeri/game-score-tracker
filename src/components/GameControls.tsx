'use client'

import { useState } from 'react'
import { useGame } from '@/contexts/GameContext'
import GameHistoryModal from './GameHistoryModal'

export default function GameControls() {
  const { state, resetGame, restartGame, updateTargetScore, clearHistory, loadFromFile, exportData, changeFileLocation, storageError } = useGame()
  const { gameStarted, targetScore } = state
  const [showRestartConfirm, setShowRestartConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showTargetScoreModal, setShowTargetScoreModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false)
  const [newTargetScore, setNewTargetScore] = useState(targetScore)

  if (!gameStarted) {
    return null
  }

  const handleRestartClick = () => {
    setShowRestartConfirm(true)
  }

  const handleResetClick = () => {
    setShowResetConfirm(true)
  }

  const confirmRestart = () => {
    restartGame()
    setShowRestartConfirm(false)
  }

  const confirmReset = () => {
    resetGame()
    setShowResetConfirm(false)
  }

  const cancelAction = () => {
    setShowRestartConfirm(false)
    setShowResetConfirm(false)
  }

  const handleUpdateTargetScore = () => {
    setNewTargetScore(targetScore)
    setShowTargetScoreModal(true)
  }

  const confirmTargetScoreUpdate = () => {
    if (newTargetScore > 0) {
      updateTargetScore(newTargetScore)
      setShowTargetScoreModal(false)
    }
  }

  const cancelTargetScoreUpdate = () => {
    setShowTargetScoreModal(false)
    setNewTargetScore(targetScore)
  }

  const handleCleanupClick = () => {
    setShowCleanupConfirm(true)
  }

  const confirmCleanup = () => {
    clearHistory()
    setShowCleanupConfirm(false)
  }

  const cancelCleanup = () => {
    setShowCleanupConfirm(false)
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

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-xl p-8">
      <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        🎮 Game Controls
      </h3>

      {/* Setup Auto-Save Prompt - shown when no file is configured */}
      {storageError && storageError.includes('Change Auto-Save Location') && (
        <div className="mb-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-400 rounded-xl">
          <p className="text-center text-sm font-semibold text-gray-700 mb-3">
            💾 Enable Auto-Save to File
          </p>
          <button
            onClick={changeFileLocation}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            📍 Setup Auto-Save Now
          </button>
          <p className="text-center text-xs text-gray-600 mt-2">
            Click to choose where to save your game file
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Game History Button */}
        <button
          onClick={() => setShowHistoryModal(true)}
          className="w-full py-5 px-6 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          ⏰ Game History
        </button>

        {/* Update Target Score Button */}
        <button
          onClick={handleUpdateTargetScore}
          className="w-full py-5 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          📊 Update Target Score
        </button>

        {/* File Management Section */}
        <div className="border-t-2 border-gray-300 pt-4 space-y-4">
          <p className="text-center text-sm font-semibold text-gray-600">📁 File Management</p>

          {/* Export Data Button */}
          <button
            onClick={exportData}
            className="w-full py-5 px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            💾 Export Data
          </button>

          {/* Load from File Button */}
          <button
            onClick={loadFromFile}
            className="w-full py-5 px-6 bg-teal-600 text-white rounded-xl hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            📂 Load from File
          </button>

          {/* Change File Location Button */}
          <button
            onClick={changeFileLocation}
            className="w-full py-5 px-6 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            📍 Change Auto-Save Location
          </button>
        </div>

        {/* Cleanup Storage Button */}
        <button
          onClick={handleCleanupClick}
          className="w-full py-5 px-6 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          🧹 Cleanup History
        </button>

        {/* Restart Game Button - Always visible when game is started */}
        <button
          onClick={handleRestartClick}
          className="w-full py-5 px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          🔄 Restart Game
        </button>

        {/* Reset Game Button */}
        <button
          onClick={handleResetClick}
          className="w-full py-5 px-6 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          🗑️ Reset Game
        </button>
      </div>

      <div className="text-base text-gray-500 text-center mt-6 space-y-2">
        <p className="font-semibold">💡 Quick Tips:</p>
        <p>• View game history and travel back in time</p>
        <p>• Update target score during the game</p>
        <p>• Export data to save a backup copy</p>
        <p>• Load from file to restore previous games</p>
        <p>• Game auto-saves to file on every change</p>
        <p>• Cleanup history to remove old entries</p>
        <p>• Restart keeps the same players and target score</p>
        <p>• Reset clears all scores and returns to setup</p>
      </div>

      {/* Restart Confirmation Modal */}
      {showRestartConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔄 Confirm Restart</h3>
            <p className="text-lg text-gray-600 mb-8 text-center">
              Are you sure you want to restart the game? This will reset all scores to 0 but keep the same players and target score.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={confirmRestart}
                className="flex-1 py-4 px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ✅ Yes, Restart
              </button>
              <button
                onClick={cancelAction}
                className="flex-1 py-4 px-6 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🗑️ Confirm Reset</h3>
            <p className="text-lg text-gray-600 mb-8 text-center">
              Are you sure you want to reset the game? This will completely clear all data and return to the setup screen. This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={confirmReset}
                className="flex-1 py-4 px-6 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ✅ Yes, Reset
              </button>
              <button
                onClick={cancelAction}
                className="flex-1 py-4 px-6 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Target Score Update Modal */}
      {showTargetScoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">📊 Update Target Score</h3>
            <p className="text-lg text-gray-600 mb-6 text-center">
              Current target score: <span className="font-bold text-2xl text-blue-600">{targetScore}</span>
            </p>
            <div className="mb-8">
              <label htmlFor="newTargetScore" className="block text-lg font-semibold text-gray-700 mb-4 text-center">
                New Target Score
              </label>
              <input
                id="newTargetScore"
                type="number"
                min="1"
                value={newTargetScore}
                onChange={(e) => setNewTargetScore(Number(e.target.value))}
                onWheel={handleWheel}
                onWheelCapture={handleWheelCapture}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-bold"
                placeholder="Enter new target score"
                autoFocus
                style={{ MozAppearance: 'textfield' }}
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={confirmTargetScoreUpdate}
                disabled={newTargetScore <= 0}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${
                  newTargetScore > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                ✅ Update Target Score
              </button>
              <button
                onClick={cancelTargetScoreUpdate}
                className="flex-1 py-4 px-6 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cleanup History Confirmation Modal */}
      {showCleanupConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🧹 Cleanup History</h3>
            <p className="text-lg text-gray-600 mb-8 text-center">
              This will clear the game history. Your current game progress will be saved, but you won&apos;t be able to travel back in time through old history entries.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={confirmCleanup}
                className="flex-1 py-4 px-6 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ✅ Cleanup
              </button>
              <button
                onClick={cancelCleanup}
                className="flex-1 py-4 px-6 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game History Modal */}
      <GameHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  )
}
