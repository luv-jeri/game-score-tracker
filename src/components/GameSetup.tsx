'use client'

import { useState } from 'react'
import { useGame } from '@/contexts/GameContext'
import type { Team } from '@/contexts/GameContext'

export default function GameSetup() {
  const { startGame, loadFromFile } = useGame()
  const [players, setPlayers] = useState<string[]>([''])
  const [targetScore, setTargetScore] = useState<number>(100)
  const [gameMode, setGameMode] = useState<'individual' | 'team'>('individual')
  const [teams, setTeams] = useState<Team[]>([])

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

  const handleGameModeChange = (mode: 'individual' | 'team') => {
    setGameMode(mode)
    if (mode === 'individual') {
      setTeams([])
    } else {
      // Initialize with 2 teams for team mode
      setTeams([
        { id: 'team-1', name: 'Team 1', players: [], score: 0, color: 'blue' },
        { id: 'team-2', name: 'Team 2', players: [], score: 0, color: 'red' }
      ])
    }
  }

  const updateTeamName = (teamId: string, name: string) => {
    setTeams(teams.map(team =>
      team.id === teamId ? { ...team, name } : team
    ))
  }

  const assignPlayerToTeam = (playerIndex: number, teamId: string) => {
    const playerId = `player-${playerIndex}`

    // Remove player from all teams first
    const updatedTeams = teams.map(team => ({
      ...team,
      players: team.players.filter(id => id !== playerId)
    }))

    // Add player to selected team
    const finalTeams = updatedTeams.map(team =>
      team.id === teamId
        ? { ...team, players: [...team.players, playerId] }
        : team
    )

    setTeams(finalTeams)
  }

  const addTeam = () => {
    const newTeamId = `team-${teams.length + 1}`
    const colors = ['green', 'purple', 'yellow', 'orange', 'pink', 'indigo']
    const newTeam: Team = {
      id: newTeamId,
      name: `Team ${teams.length + 1}`,
      players: [],
      score: 0,
      color: colors[teams.length % colors.length]
    }
    setTeams([...teams, newTeam])
  }

  const removeTeam = (teamId: string) => {
    if (teams.length > 2) {
      setTeams(teams.filter(team => team.id !== teamId))
    }
  }

  const handleStartGame = () => {
    const validPlayers = players.filter(name => name.trim() !== '')
    if (validPlayers.length >= 2 && targetScore > 0) {
      if (gameMode === 'team') {
        // Validate that all players are assigned to teams
        const assignedPlayers = teams.flatMap(team => team.players)
        const allPlayersAssigned = validPlayers.every((_, index) =>
          assignedPlayers.includes(`player-${index}`)
        )

        if (!allPlayersAssigned) {
          alert('Please assign all players to teams before starting the game.')
          return
        }
      }

      startGame(validPlayers, targetScore, gameMode, gameMode === 'team' ? teams : undefined)
    }
  }

  const isValid = players.filter(name => name.trim() !== '').length >= 2 && targetScore > 0

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
      <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        🎯 Game Setup
      </h2>

      <div className="space-y-8">
        {/* Game Mode Selection */}
        <div>
          <label className="block text-xl font-semibold text-gray-700 mb-4">
            Game Mode
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => handleGameModeChange('individual')}
              className={`px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                gameMode === 'individual'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              👤 Individual
            </button>
            <button
              onClick={() => handleGameModeChange('team')}
              className={`px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                gameMode === 'team'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              👥 Team
            </button>
          </div>
        </div>

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

        {/* Team Assignment (only shown in team mode) */}
        {gameMode === 'team' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-xl font-semibold text-gray-700">
                Team Assignment
              </label>
              <button
                onClick={addTeam}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
              >
                ➕ Add Team
              </button>
            </div>

            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="p-4 border-2 border-gray-200 rounded-xl">
                  <div className="flex items-center space-x-4 mb-3">
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => updateTeamName(team.id, e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: team.color }}
                    ></div>
                    {teams.length > 2 && (
                      <button
                        onClick={() => removeTeam(team.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {players.map((playerName, playerIndex) => {
                      const playerId = `player-${playerIndex}`
                      const isAssigned = team.players.includes(playerId)
                      const isAssignedToOtherTeam = teams.some(t => t.id !== team.id && t.players.includes(playerId))

                      return playerName.trim() !== '' ? (
                        <button
                          key={playerIndex}
                          onClick={() => assignPlayerToTeam(playerIndex, team.id)}
                          disabled={isAssignedToOtherTeam}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isAssigned
                              ? 'bg-blue-500 text-white'
                              : isAssignedToOtherTeam
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {playerName} {isAssigned && '✓'}
                        </button>
                      ) : null
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Load from File Button */}
        <div className="border-t-2 border-gray-300 pt-6 mt-6">
          <p className="text-center text-sm font-semibold text-gray-600 mb-4">📁 Or load a saved game:</p>
          <button
            onClick={loadFromFile}
            className="w-full py-5 px-6 bg-teal-600 text-white rounded-xl hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-offset-2 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            📂 Load from File
          </button>
        </div>
      </div>
    </div>
  )
}
