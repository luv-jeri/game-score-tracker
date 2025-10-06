'use client'

import { useState } from 'react'
import { useGame } from '@/contexts/GameContext'
import UserScoreModal from './UserScoreModal'

export default function Scoreboard() {
  const { state } = useGame()
  const { players, teams, targetScore, currentPlayerIndex, winner, winningTeam, gameMode } = state
  const [selectedPlayer, setSelectedPlayer] = useState<typeof players[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score)

  const handlePlayerClick = (player: typeof players[0]) => {
    setSelectedPlayer(player)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPlayer(null)
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">🏆 Scoreboard</h2>
        <p className="text-2xl text-gray-600">
          Target Score: <span className="font-bold text-blue-600 text-3xl">{targetScore}</span>
        </p>
        <p className="text-lg text-gray-500 mt-2">
          Mode: <span className="font-semibold">{gameMode === 'team' ? '👥 Team' : '👤 Individual'}</span>
        </p>
      </div>

      {/* Winner Display */}
      {winner && (
        <div className="mb-8 p-6 bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-yellow-800 mb-3">🎉 Winner! 🎉</h3>
            <p className="text-2xl text-yellow-700">
              <span className="font-bold">{winner.name}</span> wins with <span className="font-bold text-3xl">{winner.score}</span> points!
            </p>
          </div>
        </div>
      )}

      {winningTeam && (
        <div className="mb-8 p-6 bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-yellow-800 mb-3">🎉 Team Wins! 🎉</h3>
            <p className="text-2xl text-yellow-700">
              <span className="font-bold">{winningTeam.name}</span> wins with <span className="font-bold text-3xl">{winningTeam.score}</span> points!
            </p>
            <div className="mt-4 text-lg text-yellow-600">
              <p className="font-semibold">Team Members:</p>
              <div className="flex justify-center space-x-4 mt-2">
                {players.filter(p => p.teamId === winningTeam.id).map(player => (
                  <span key={player.id} className="bg-yellow-200 px-3 py-1 rounded-full text-yellow-800 font-medium">
                    {player.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Scores Section (only in team mode) */}
      {gameMode === 'team' && teams.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">👥 Team Scores</h3>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sortedTeams.map((team) => {
              const isWinningTeam = winningTeam?.id === team.id
              const teamPlayers = players.filter(player => player.teamId === team.id)
              const progressPercentage = team.score < 0 ? 0 : Math.min((team.score / targetScore) * 100, 100)

              return (
                <div
                  key={team.id}
                  className={`p-6 rounded-xl border-3 transition-all duration-300 ${
                    isWinningTeam
                      ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-2xl'
                      : 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-blue-300'
                  }`}
                >
                  {/* Team Name and Status */}
                  <div className="mb-4">
                    <h3 className={`font-bold text-2xl mb-2 ${
                      isWinningTeam ? 'text-yellow-800' : 'text-gray-800'
                    }`}>
                      {team.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {isWinningTeam && (
                        <span className="text-sm bg-yellow-500 text-white px-3 py-1 rounded-full font-semibold">
                          Winner!
                        </span>
                      )}
                      <span className="text-sm bg-gray-500 text-white px-3 py-1 rounded-full font-semibold">
                        {teamPlayers.length} players
                      </span>
                    </div>
                  </div>

                  {/* Team Score Display */}
                  <div className="text-center mb-6">
                    <span className={`text-5xl font-bold ${
                      isWinningTeam ? 'text-yellow-600' : team.score < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {team.score}
                    </span>
                  </div>

                  {/* Remaining Points */}
                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-500 mb-1">Points to Win</div>
                    <div className={`text-2xl font-bold ${
                      isWinningTeam ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {isWinningTeam ? '🎉 WON!' : targetScore - team.score}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isWinningTeam ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {/* Team Members */}
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Team Members:</span>
                    <div className="mt-2 space-y-1">
                      {teamPlayers.map(player => (
                        <div key={player.id} className="flex justify-between items-center bg-white rounded-lg p-2 border border-gray-200">
                          <span className="font-medium text-gray-800">{player.name}</span>
                          <span className="text-sm font-bold text-blue-600">{player.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Individual Player Scores - Only show in individual mode */}
      {gameMode === 'individual' && (
        <>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              👤 Player Scores
            </h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sortedPlayers.map((player) => {
              const isCurrentPlayer = player.id === players[currentPlayerIndex]?.id
              const isWinner = winner?.id === player.id
              const progressPercentage = player.score < 0 ? 0 : Math.min((player.score / targetScore) * 100, 100)

              return (
                <div
                  key={player.id}
                  onClick={() => handlePlayerClick(player)}
                  className={`p-6 rounded-xl border-3 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl ${
                    isWinner
                      ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-2xl'
                      : isCurrentPlayer
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl'
                      : 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-blue-300'
                  }`}
                >
                  {/* Player Name and Status */}
                  <div className="mb-4">
                    <h3 className={`font-bold text-2xl mb-2 ${
                      isWinner ? 'text-yellow-800' : isCurrentPlayer ? 'text-blue-800' : 'text-gray-800'
                    }`}>
                      {player.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {isCurrentPlayer && !winner && (
                        <span className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full font-semibold">
                          Current Turn
                        </span>
                      )}
                      {isWinner && (
                        <span className="text-sm bg-yellow-500 text-white px-3 py-1 rounded-full font-semibold">
                          Winner!
                        </span>
                      )}
                      <span className="text-sm bg-gray-500 text-white px-3 py-1 rounded-full font-semibold">
                        📊 View History
                      </span>
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="text-center mb-6">
                    <span className={`text-5xl font-bold ${
                      isWinner ? 'text-yellow-600' : isCurrentPlayer ? 'text-blue-600' : player.score < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {player.score}
                    </span>
                  </div>

                  {/* Remaining Points */}
                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-500 mb-1">Points to Win</div>
                    <div className={`text-2xl font-bold ${
                      isWinner ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {isWinner ? '🎉 WON!' : targetScore - player.score}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isWinner ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : isCurrentPlayer ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {/* Current Turn Progress */}
                  {player.currentTurnScores.length > 0 && (
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Current Turn:</span>
                      <div className="px-3 py-2 bg-blue-100 rounded-lg text-sm mt-1 border border-blue-200">
                        <div className="font-bold text-blue-800">
                          Scores: {player.currentTurnScores.map(score => score < 0 ? `(${score})` : score).join(' + ')} = {player.currentTurnScores.reduce((sum, score) => sum + score, 0)}
                        </div>
                        {player.currentTurnScores.length > 0 && (player.score + player.currentTurnScores.reduce((sum, score) => sum + score, 0)) > targetScore && (
                          <div className="mt-2 text-sm text-red-700 font-semibold">
                            ⚠️ Would exceed target by {(player.score + player.currentTurnScores.reduce((sum, score) => sum + score, 0)) - targetScore} points
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Turn Count */}
                  <div className="text-sm text-gray-600 text-center">
                    <span className="font-semibold">Completed Turns:</span> <span className="text-lg font-bold">{player.turns.length}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* User Score Modal */}
      {selectedPlayer && (
        <UserScoreModal
          player={selectedPlayer}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
