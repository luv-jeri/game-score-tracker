'use client'

import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react'

export type Turn = {
  scores: number[]
  total: number
  turnNumber: number
  excessScore: number // Amount by which the turn exceeded the target
  isExcessTurn: boolean // Whether this turn exceeded the target
}

export type Player = {
  id: string
  name: string
  score: number
  turns: Turn[]
  currentTurnScores: number[]
}

export type GameHistoryEntry = {
  id: string
  timestamp: number
  action: string
  description: string
  gameState: GameState
  turnNumber: number
}

export type GameState = {
  players: Player[]
  targetScore: number
  currentPlayerIndex: number
  gameStarted: boolean
  gameEnded: boolean
  winner: Player | null
  history: GameHistoryEntry[]
}

type GameAction =
  | { type: 'START_GAME'; payload: { players: string[]; targetScore: number } }
  | { type: 'ADD_SCORE'; payload: { playerId: string; score: number } }
  | { type: 'COMPLETE_TURN'; payload: { playerId: string } }
  | { type: 'NEXT_TURN' }
  | { type: 'RESTART_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'UPDATE_TARGET_SCORE'; payload: { targetScore: number } }
  | { type: 'EDIT_TURN_SCORE'; payload: { playerId: string; turnIndex: number; newScores: number[] } }
  | { type: 'TRAVEL_TO_HISTORY'; payload: { historyEntry: GameHistoryEntry } }
  | { type: 'CLEAR_HISTORY' }

const initialState: GameState = {
  players: [],
  targetScore: 0,
  currentPlayerIndex: 0,
  gameStarted: false,
  gameEnded: false,
  winner: null,
  history: [],
}

// Helper function to create history entries
const createHistoryEntry = (action: string, description: string, gameState: GameState, turnNumber: number): GameHistoryEntry => ({
  id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  timestamp: Date.now(),
  action,
  description,
  gameState: JSON.parse(JSON.stringify(gameState)), // Deep clone
  turnNumber,
})

// Helper function to add history entry with automatic cleanup
const addToHistory = (state: GameState, action: string, description: string, turnNumber: number): GameState => {
  const historyEntry = createHistoryEntry(action, description, state, turnNumber)
  const newHistory = [...(state.history || []), historyEntry]

  // Keep only the last 50 history entries to prevent storage bloat
  const maxHistoryEntries = 50
  const cleanedHistory = newHistory.length > maxHistoryEntries
    ? newHistory.slice(-maxHistoryEntries)
    : newHistory

  return {
    ...state,
    history: cleanedHistory,
  }
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const players: Player[] = action.payload.players.map((name, index) => ({
        id: `player-${index}`,
        name,
        score: 0,
        turns: [],
        currentTurnScores: [],
      }))

      const newState = {
        ...state,
        players,
        targetScore: action.payload.targetScore,
        currentPlayerIndex: 0,
        gameStarted: true,
        gameEnded: false,
        winner: null,
        history: [],
      }

      return addToHistory(newState, 'START_GAME', `Game started with ${players.length} players, target score: ${action.payload.targetScore}`, 0)
    }

    case 'ADD_SCORE': {
      const updatedPlayers = state.players.map(player => {
        if (player.id === action.payload.playerId) {
          const newCurrentTurnScores = [...player.currentTurnScores, action.payload.score]

          return {
            ...player,
            currentTurnScores: newCurrentTurnScores,
          }
        }
        return player
      })

      return {
        ...state,
        players: updatedPlayers,
      }
    }

    case 'COMPLETE_TURN': {
      const updatedPlayers = state.players.map(player => {
        if (player.id === action.payload.playerId && player.currentTurnScores.length === 3) {
          const turnTotal = player.currentTurnScores.reduce((sum, score) => sum + score, 0)
          const currentScore = player.score
          const newScore = currentScore + turnTotal

          // Check if this turn would exceed the target score
          const wouldExceedTarget = newScore > state.targetScore
          const excessAmount = wouldExceedTarget ? newScore - state.targetScore : 0

          // IMPORTANT: If the turn exceeds the target, don't add ANY points to the player's score
          // The player's score should remain unchanged when they exceed the target
          const finalScore = wouldExceedTarget ? currentScore : newScore

          const newTurn: Turn = {
            scores: [...player.currentTurnScores],
            total: turnTotal,
            turnNumber: player.turns.length + 1,
            excessScore: excessAmount,
            isExcessTurn: wouldExceedTarget,
          }

          return {
            ...player,
            score: finalScore,
            turns: [...player.turns, newTurn],
            currentTurnScores: [],
          }
        }
        return player
      })

      // Check for winner (exact target score only)
      const winner = updatedPlayers.find(player => player.score === state.targetScore)
      const player = updatedPlayers.find(p => p.id === action.payload.playerId)
      const turnNumber = player?.turns.length || 0

      const newState = {
        ...state,
        players: updatedPlayers,
        gameEnded: !!winner,
        winner: winner || null,
      }

      const description = player?.turns[player.turns.length - 1]?.isExcessTurn
        ? `${player?.name} completed turn ${turnNumber} (exceeded by ${player?.turns[player.turns.length - 1]?.excessScore})`
        : `${player?.name} completed turn ${turnNumber}`

      return addToHistory(newState, 'COMPLETE_TURN', description, turnNumber)
    }

    case 'NEXT_TURN': {
      const nextIndex = (state.currentPlayerIndex + 1) % state.players.length
      return {
        ...state,
        currentPlayerIndex: nextIndex,
      }
    }

    case 'RESTART_GAME': {
      // Reset scores but keep players and target score
      const resetPlayers = state.players.map(player => ({
        ...player,
        score: 0,
        turns: [],
        currentTurnScores: [],
      }))

      return {
        ...state,
        players: resetPlayers,
        currentPlayerIndex: 0,
        gameEnded: false,
        winner: null,
      }
    }

    case 'RESET_GAME': {
      return initialState
    }

    case 'LOAD_GAME': {
      // Ensure history property exists for backward compatibility
      const loadedState = {
        ...action.payload,
        history: action.payload.history || [],
        players: action.payload.players.map(player => ({
          ...player,
          turns: player.turns.map(turn => ({
            ...turn,
            excessScore: turn.excessScore || 0,
            isExcessTurn: turn.isExcessTurn || false,
          }))
        }))
      }
      return loadedState
    }

    case 'UPDATE_TARGET_SCORE': {
      // Check if any player has already reached the new target score (exact match)
      const winner = state.players.find(player => player.score === action.payload.targetScore)

      return {
        ...state,
        targetScore: action.payload.targetScore,
        gameEnded: !!winner,
        winner: winner || null,
      }
    }

    case 'EDIT_TURN_SCORE': {
      const updatedPlayers = state.players.map(player => {
        if (player.id === action.payload.playerId) {
          const updatedTurns = [...player.turns]
          const turnIndex = action.payload.turnIndex

          if (updatedTurns[turnIndex]) {
            // Update the turn with new scores
            const newTotal = action.payload.newScores.reduce((sum, score) => sum + score, 0)

            // Calculate what the score would be if we recalculated from this turn
            const scoreUpToThisTurn = updatedTurns.slice(0, turnIndex).reduce((sum, turn) => sum + turn.total, 0)
            const newScoreFromThisTurn = scoreUpToThisTurn + newTotal

            // Check if this turn would exceed the target
            const wouldExceedTarget = newScoreFromThisTurn > state.targetScore
            const excessAmount = wouldExceedTarget ? newScoreFromThisTurn - state.targetScore : 0

            updatedTurns[turnIndex] = {
              ...updatedTurns[turnIndex],
              scores: [...action.payload.newScores],
              total: newTotal,
              excessScore: excessAmount,
              isExcessTurn: wouldExceedTarget,
            }

            // Recalculate player's total score
            // IMPORTANT: If a turn exceeds the target, don't add ANY points from that turn
            const newScore = updatedTurns.reduce((sum, turn) => {
              const scoreUpToTurn = updatedTurns.slice(0, updatedTurns.indexOf(turn)).reduce((s, t) => s + t.total, 0)
              const scoreWithTurn = scoreUpToTurn + turn.total
              // If this turn would exceed the target, don't add any points from this turn
              return scoreWithTurn > state.targetScore ? scoreUpToTurn : scoreWithTurn
            }, 0)

            return {
              ...player,
              score: newScore,
              turns: updatedTurns,
            }
          }
        }
        return player
      })

      // Check for winner after score update (exact target score only)
      const winner = updatedPlayers.find(player => player.score === state.targetScore)

      return {
        ...state,
        players: updatedPlayers,
        gameEnded: !!winner,
        winner: winner || null,
      }
    }

    case 'TRAVEL_TO_HISTORY': {
      const { historyEntry } = action.payload
      return {
        ...historyEntry.gameState,
        history: state.history, // Keep current history
      }
    }

    case 'CLEAR_HISTORY': {
      return {
        ...state,
        history: [],
      }
    }

    default:
      return state
  }
}

type GameContextType = {
  state: GameState
  startGame: (players: string[], targetScore: number) => void
  addScore: (playerId: string, score: number) => void
  completeTurn: (playerId: string) => void
  nextTurn: () => void
  restartGame: () => void
  resetGame: () => void
  updateTargetScore: (targetScore: number) => void
  editTurnScore: (playerId: string, turnIndex: number, newScores: number[]) => void
  travelToHistory: (historyEntry: GameHistoryEntry) => void
  clearHistory: () => void
  storageError: string | null
  clearStorageError: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

// Helper function to compress game state for localStorage
const compressGameState = (state: GameState): string => {
  // Create a minimal version of the state for storage
  const compressedState = {
    players: state.players.map(player => ({
      id: player.id,
      name: player.name,
      score: player.score,
      // Only keep essential turn data - remove detailed scores, keep only totals
      turns: player.turns.map(turn => ({
        total: turn.total,
        turnNumber: turn.turnNumber,
        isExcessTurn: turn.isExcessTurn
        // Remove scores array and excessScore to save space
      })),
      currentTurnScores: player.currentTurnScores
    })),
    targetScore: state.targetScore,
    currentPlayerIndex: state.currentPlayerIndex,
    gameStarted: state.gameStarted,
    gameEnded: state.gameEnded,
    winner: state.winner ? {
      id: state.winner.id,
      name: state.winner.name
      // Remove score to save space
    } : null,
    // Limit history to last 10 entries for storage to prevent quota issues
    history: (state.history || []).slice(-10).map(entry => ({
      id: entry.id,
      timestamp: entry.timestamp,
      action: entry.action,
      description: entry.description,
      turnNumber: entry.turnNumber
      // Remove full gameState to save space
    }))
  }

  return JSON.stringify(compressedState)
}

// Helper function to check localStorage size and clean if needed
const checkAndCleanStorage = (): boolean => {
  try {
    // Estimate localStorage usage
    let totalSize = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += key.length + value.length
        }
      }
    }

    // If we're using more than 4MB (conservative estimate), clean up
    const maxSize = 4 * 1024 * 1024 // 4MB
    if (totalSize > maxSize) {
      console.warn(`LocalStorage size (${Math.round(totalSize / 1024)}KB) approaching limit. Cleaning up...`)

      // Clear all game-related data
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('game-score-tracker') || key.includes('game'))) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key))
      return true
    }

    return false
  } catch (error) {
    console.warn('Error checking localStorage size:', error)
    return false
  }
}

// Helper function to safely save to localStorage with error handling
const saveToLocalStorage = (key: string, data: string): boolean => {
  // Check storage size before attempting to save
  checkAndCleanStorage()

  try {
    localStorage.setItem(key, data)
    return true
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded. Attempting aggressive cleanup...')

      try {
        // Step 1: Clear all game-related localStorage items
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('game-score-tracker') || key.includes('game'))) {
            keysToRemove.push(key)
          }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key))

        // Step 2: Try saving again
        localStorage.setItem(key, data)
        return true
      } catch (retryError) {
        console.warn('First cleanup failed. Attempting more aggressive cleanup...')

        try {
          // Step 3: Clear ALL localStorage if still failing
          localStorage.clear()

          // Step 4: Try saving one more time
          localStorage.setItem(key, data)
          return true
        } catch (finalError) {
          console.error('All cleanup attempts failed. Game state cannot be saved:', finalError)
          return false
        }
      }
    } else {
      console.error('Failed to save game state:', error)
      return false
    }
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const [storageError, setStorageError] = useState<string | null>(null)

  const clearStorageError = () => setStorageError(null)

  // Load game from localStorage on mount
  useEffect(() => {
    const savedGame = localStorage.getItem('game-score-tracker')
    if (savedGame) {
      try {
        const gameState = JSON.parse(savedGame)
        dispatch({ type: 'LOAD_GAME', payload: gameState })
      } catch (error) {
        console.error('Failed to load saved game:', error)
        // Clear corrupted data
        localStorage.removeItem('game-score-tracker')
      }
    }
  }, [])

  // Save game to localStorage whenever state changes
  useEffect(() => {
    if (state.gameStarted) {
      const compressedData = compressGameState(state)
      const success = saveToLocalStorage('game-score-tracker', compressedData)

      if (!success) {
        console.warn('Game state could not be saved to localStorage. Game will continue but progress may be lost on page refresh.')
        setStorageError('Unable to save game progress. Your game will continue but may be lost on page refresh.')
      } else {
        setStorageError(null) // Clear any previous errors
      }
    }
  }, [state])

  const startGame = (players: string[], targetScore: number) => {
    dispatch({ type: 'START_GAME', payload: { players, targetScore } })
  }

  const addScore = (playerId: string, score: number) => {
    dispatch({ type: 'ADD_SCORE', payload: { playerId, score } })
  }

  const completeTurn = (playerId: string) => {
    dispatch({ type: 'COMPLETE_TURN', payload: { playerId } })
  }

  const nextTurn = () => {
    dispatch({ type: 'NEXT_TURN' })
  }

  const restartGame = () => {
    dispatch({ type: 'RESTART_GAME' })
  }

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' })
    localStorage.removeItem('game-score-tracker')
  }

  const updateTargetScore = (targetScore: number) => {
    dispatch({ type: 'UPDATE_TARGET_SCORE', payload: { targetScore } })
  }

  const editTurnScore = (playerId: string, turnIndex: number, newScores: number[]) => {
    dispatch({ type: 'EDIT_TURN_SCORE', payload: { playerId, turnIndex, newScores } })
  }

  const travelToHistory = (historyEntry: GameHistoryEntry) => {
    dispatch({ type: 'TRAVEL_TO_HISTORY', payload: { historyEntry } })
  }

  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' })
  }

  return (
    <GameContext.Provider value={{ state, startGame, addScore, completeTurn, nextTurn, restartGame, resetGame, updateTargetScore, editTurnScore, travelToHistory, clearHistory, storageError, clearStorageError }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
