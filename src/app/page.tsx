'use client'

import { useGame } from '@/contexts/GameContext'
import GameSetup from '@/components/GameSetup'
import Scoreboard from '@/components/Scoreboard'
import ScoreInput from '@/components/ScoreInput'
import GameControls from '@/components/GameControls'
import StorageNotification from '@/components/StorageNotification'

export default function Home() {
  const { state, storageError, clearStorageError } = useGame()
  const { gameStarted } = state

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-[1400px] mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🎮 Game Score Tracker
          </h1>
          <p className="text-xl text-gray-600">
            Track scores and declare winners in your favorite games
          </p>
        </header>

        <main className="space-y-12">
          {!gameStarted ? (
            <GameSetup />
          ) : (
            <>
              <Scoreboard />
              <div className="grid gap-12 lg:grid-cols-2">
                <ScoreInput />
                <GameControls />
              </div>
            </>
          )}
        </main>

        <footer className="text-center mt-16 text-gray-500">
          <p className="text-lg">Built with Next.js, TypeScript, and Tailwind CSS</p>
        </footer>
      </div>

      {/* Storage Error Notification */}
      <StorageNotification
        show={!!storageError}
        message={storageError || ''}
        type="warning"
        onClose={clearStorageError}
      />
    </div>
  )
}
