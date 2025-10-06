'use client'

import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react'

export type Turn = {
  scores: number[]
  total: number
  turnNumber: number
  excessScore: number // Amount by which the turn exceeded the target
  isExcessTurn: boolean // Whether this turn exceeded the target
}

export type Team = {
  id: string
  name: string
  players: string[] // Array of player IDs
  score: number
  color: string // For UI display
}

export type Player = {
  id: string
  name: string
  score: number
  turns: Turn[]
  currentTurnScores: number[]
  teamId?: string // Optional team assignment
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
  teams: Team[]
  targetScore: number
  currentPlayerIndex: number
  gameStarted: boolean
  gameEnded: boolean
  winner: Player | null
  winningTeam: Team | null
  history: GameHistoryEntry[]
  gameMode: 'individual' | 'team' // New field to track game mode
}

type GameAction =
  | { type: 'START_GAME'; payload: { players: string[]; targetScore: number; gameMode: 'individual' | 'team'; teams?: Team[] } }
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
  teams: [],
  targetScore: 0,
  currentPlayerIndex: 0,
  gameStarted: false,
  gameEnded: false,
  winner: null,
  winningTeam: null,
  history: [],
  gameMode: 'individual',
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

// Helper function to calculate team scores
const calculateTeamScores = (players: Player[], teams: Team[]): Team[] => {
  return teams.map(team => {
    const teamPlayers = players.filter(player => player.teamId === team.id)
    const teamScore = teamPlayers.reduce((sum, player) => sum + player.score, 0)
    return {
      ...team,
      score: teamScore,
    }
  })
}

// Helper function to check for team winner
const checkTeamWinner = (teams: Team[], targetScore: number): Team | null => {
  return teams.find(team => team.score === targetScore) || null
}

// Helper function to add history entry
const addToHistory = (state: GameState, action: string, description: string, turnNumber: number): GameState => {
  const historyEntry = createHistoryEntry(action, description, state, turnNumber)
  const newHistory = [...(state.history || []), historyEntry]

  return {
    ...state,
    history: newHistory,
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
        teamId: action.payload.gameMode === 'team' && action.payload.teams
          ? action.payload.teams.find(team => team.players.includes(`player-${index}`))?.id
          : undefined,
      }))

      const teams = action.payload.gameMode === 'team' && action.payload.teams
        ? calculateTeamScores(players, action.payload.teams)
        : []

      const newState = {
        ...state,
        players,
        teams,
        targetScore: action.payload.targetScore,
        currentPlayerIndex: 0,
        gameStarted: true,
        gameEnded: false,
        winner: null,
        winningTeam: null,
        history: [],
        gameMode: action.payload.gameMode,
      }

      const gameModeText = action.payload.gameMode === 'team' ? 'team mode' : 'individual mode'
      const teamInfo = action.payload.gameMode === 'team' ? ` with ${teams.length} teams` : ''

      return addToHistory(newState, 'START_GAME', `Game started in ${gameModeText} with ${players.length} players${teamInfo}, target score: ${action.payload.targetScore}`, 0)
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

      // Update team scores
      const updatedTeams = state.gameMode === 'team'
        ? calculateTeamScores(updatedPlayers, state.teams)
        : []

      // Check for winner (exact target score only)
      const winner = state.gameMode === 'individual'
        ? updatedPlayers.find(player => player.score === state.targetScore)
        : null

      const winningTeam = state.gameMode === 'team'
        ? checkTeamWinner(updatedTeams, state.targetScore)
        : null

      const player = updatedPlayers.find(p => p.id === action.payload.playerId)
      const turnNumber = player?.turns.length || 0

      const newState = {
        ...state,
        players: updatedPlayers,
        teams: updatedTeams,
        gameEnded: !!(winner || winningTeam),
        winner: winner || null,
        winningTeam: winningTeam || null,
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

      const resetTeams = state.gameMode === 'team'
        ? calculateTeamScores(resetPlayers, state.teams)
        : []

      return {
        ...state,
        players: resetPlayers,
        teams: resetTeams,
        currentPlayerIndex: 0,
        gameEnded: false,
        winner: null,
        winningTeam: null,
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
        teams: action.payload.teams || [],
        gameMode: action.payload.gameMode || 'individual',
        winningTeam: action.payload.winningTeam || null,
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
      // Check if any player or team has already reached the new target score (exact match)
      const winner = state.gameMode === 'individual'
        ? state.players.find(player => player.score === action.payload.targetScore)
        : null

      const winningTeam = state.gameMode === 'team'
        ? checkTeamWinner(state.teams, action.payload.targetScore)
        : null

      return {
        ...state,
        targetScore: action.payload.targetScore,
        gameEnded: !!(winner || winningTeam),
        winner: winner || null,
        winningTeam: winningTeam || null,
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
      const winner = state.gameMode === 'individual'
        ? updatedPlayers.find(player => player.score === state.targetScore)
        : null

      const updatedTeams = state.gameMode === 'team'
        ? calculateTeamScores(updatedPlayers, state.teams)
        : []

      const winningTeam = state.gameMode === 'team'
        ? checkTeamWinner(updatedTeams, state.targetScore)
        : null

      return {
        ...state,
        players: updatedPlayers,
        teams: updatedTeams,
        gameEnded: !!(winner || winningTeam),
        winner: winner || null,
        winningTeam: winningTeam || null,
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
  startGame: (players: string[], targetScore: number, gameMode: 'individual' | 'team', teams?: Team[]) => void
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
  loadFromFile: () => Promise<void>
  exportData: () => void
  changeFileLocation: () => Promise<void>
}

const GameContext = createContext<GameContextType | undefined>(undefined)

// File System Access API for saving to text file
let fileHandle: FileSystemFileHandle | null = null

// Type definitions for File System Access API
interface FileSystemAccessWindow extends Window {
  showSaveFilePicker?: (options?: {
    suggestedName?: string
    types?: Array<{
      description: string
      accept: Record<string, string[]>
    }>
  }) => Promise<FileSystemFileHandle>
  showOpenFilePicker?: (options?: {
    types?: Array<{
      description: string
      accept: Record<string, string[]>
    }>
    multiple?: boolean
  }) => Promise<FileSystemFileHandle[]>
}

// Helper function to request file access
const requestFileAccess = async (): Promise<FileSystemFileHandle | null> => {
  try {
    // Check if File System Access API is supported
    if (!('showSaveFilePicker' in window)) {
      console.warn('File System Access API not supported in this browser')
      return null
    }

    const handle = await (window as FileSystemAccessWindow).showSaveFilePicker!({
      suggestedName: 'game-score-tracker-data.json',
      types: [
        {
          description: 'Game Data File',
          accept: {
            'application/json': ['.json'],
          },
        },
      ],
    })

    fileHandle = handle
    console.log('File access granted')
    return handle
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Failed to request file access:', error)
    }
    return null
  }
}

// Helper function to save to file (requires fileHandle to be set first)
const saveToFile = async (data: GameState): Promise<boolean> => {
  try {
    if (!fileHandle) {
      console.warn('No file handle available. Use "Change Auto-Save Location" to set one up.')
      return false
    }

    // Check if we still have permission
    const permission = await fileHandle.queryPermission({ mode: 'readwrite' })
    if (permission !== 'granted') {
      const requestPermission = await fileHandle.requestPermission({ mode: 'readwrite' })
      if (requestPermission !== 'granted') {
        console.warn('File permission denied')
        fileHandle = null
        return false
      }
    }

    // Write to file
    const writable = await fileHandle.createWritable()
    const jsonData = JSON.stringify(data, null, 2)
    await writable.write(jsonData)
    await writable.close()

    console.log('Game saved to file successfully')
    return true
  } catch (error) {
    console.error('Failed to save to file:', error)
    fileHandle = null
    return false
  }
}

// Helper function to load from file
const loadFromFile = async (): Promise<GameState | null> => {
  try {
    // Check if File System Access API is supported
    if (!('showOpenFilePicker' in window)) {
      console.warn('File System Access API not supported in this browser')
      return null
    }

    const [handle] = await (window as FileSystemAccessWindow).showOpenFilePicker!({
      types: [
        {
          description: 'Game Data File',
          accept: {
            'application/json': ['.json'],
          },
        },
      ],
      multiple: false,
    })

    fileHandle = handle

    const file = await handle.getFile()
    const text = await file.text()
    const gameState = JSON.parse(text) as GameState

    console.log('Game loaded from file successfully')
    return gameState
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Failed to load from file:', error)
    }
    return null
  }
}

// Helper function to export game data (download)
const exportGameData = (data: GameState): void => {
  const jsonData = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `game-score-tracker-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  console.log('Game data exported successfully')
}


// Helper function to split data into chunks
const splitIntoChunks = (data: string, chunkSize: number = 50000): string[] => {
  const chunks: string[] = []
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize))
  }
  return chunks
}

// Helper function to save data in chunks
const saveChunkedData = (baseKey: string, data: string): boolean => {
  try {
    // First, clean up any existing chunks for this key
    cleanupChunks(baseKey)

    // Split data into chunks
    const chunks = splitIntoChunks(data)

    // If data is small enough, save as single chunk
    if (chunks.length === 1) {
      localStorage.setItem(baseKey, data)
      return true
    }

    // Save metadata about the chunks
    const metadata = {
      totalChunks: chunks.length,
      timestamp: Date.now(),
      dataSize: data.length,
      version: '2.0' // Version for compatibility
    }

    // Save metadata
    localStorage.setItem(`${baseKey}-meta`, JSON.stringify(metadata))

    // Save each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunkKey = `${baseKey}-chunk-${i}`
      localStorage.setItem(chunkKey, chunks[i])
    }

    return true
  } catch (error) {
    console.error('Failed to save chunked data:', error)
    return false
  }
}

// Helper function to load data from chunks
const loadChunkedData = (baseKey: string): string | null => {
  try {
    // First try to load as single item (for small data)
    const singleData = localStorage.getItem(baseKey)
    if (singleData) {
      return singleData
    }

    // Load metadata
    const metadataStr = localStorage.getItem(`${baseKey}-meta`)
    if (!metadataStr) {
      return null
    }

    const metadata = JSON.parse(metadataStr)
    const { totalChunks } = metadata

    // Load all chunks
    const chunks: string[] = []
    for (let i = 0; i < totalChunks; i++) {
      const chunkKey = `${baseKey}-chunk-${i}`
      const chunk = localStorage.getItem(chunkKey)
      if (!chunk) {
        console.error(`Missing chunk ${i} for key ${baseKey}`)
        return null
      }
      chunks.push(chunk)
    }

    // Combine chunks
    return chunks.join('')
  } catch (error) {
    console.error('Failed to load chunked data:', error)
    return null
  }
}

// Helper function to cleanup old chunks
const cleanupChunks = (baseKey: string): void => {
  try {
    // Remove metadata
    localStorage.removeItem(`${baseKey}-meta`)

    // Remove all chunks (we don't know how many there might be, so we'll try up to 100)
    for (let i = 0; i < 100; i++) {
      const chunkKey = `${baseKey}-chunk-${i}`
      if (localStorage.getItem(chunkKey)) {
        localStorage.removeItem(chunkKey)
      } else {
        // If we hit a missing chunk, we've probably cleaned them all
        break
      }
    }

    // Also clean up old format chunks for backward compatibility
    for (let i = 0; i < 100; i++) {
      const oldChunkKey = `${baseKey}-${i}`
      if (localStorage.getItem(oldChunkKey)) {
        localStorage.removeItem(oldChunkKey)
      } else {
        break
      }
    }
  } catch (error) {
    console.error('Failed to cleanup chunks:', error)
  }
}

// Helper function to check localStorage size (no limits applied)
const checkAndCleanStorage = (): boolean => {
  try {
    // Log localStorage usage for monitoring only, no cleanup
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

    // Just log the size, don't enforce any limits
    console.log(`LocalStorage size: ${Math.round(totalSize / 1024)}KB`)
    return false
  } catch (error) {
    console.warn('Error checking localStorage size:', error)
    return false
  }
}



export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const [storageError, setStorageError] = useState<string | null>(null)
  const [isFirstSave, setIsFirstSave] = useState(true)

  const clearStorageError = () => setStorageError(null)

  // Load game on mount - try localStorage first, or allow user to load from file
  useEffect(() => {
    const loadGame = async () => {
      try {
        // Try to load from localStorage first (for backward compatibility)
        let savedGame = loadChunkedData('game-score-tracker')
        if (!savedGame) {
          savedGame = localStorage.getItem('game-score-tracker')
        }

        if (savedGame) {
          try {
            const parsedState = JSON.parse(savedGame)
            dispatch({ type: 'LOAD_GAME', payload: parsedState })
            console.log('Game loaded from localStorage')

            // Clean up localStorage after loading since we'll use file storage going forward
            cleanupChunks('game-score-tracker')
            localStorage.removeItem('game-score-tracker')
          } catch (error) {
            console.error('Failed to load saved game:', error)
            cleanupChunks('game-score-tracker')
            localStorage.removeItem('game-score-tracker')
          }
        }
      } catch (error) {
        console.error('Failed to load game:', error)
      }
    }

    loadGame()
  }, [])

  // Save game to file whenever state changes (only if file handle exists)
  useEffect(() => {
    if (state.gameStarted && fileHandle) {
      const saveGame = async () => {
        const success = await saveToFile(state)

        if (!success) {
          // Silent fallback - don't show error on every save
          console.warn('File save failed, game data may not be persisted')
          setStorageError('Auto-save failed. Click "Change Auto-Save Location" to set up file saving.')
        } else {
          setStorageError(null)
        }
      }

      saveGame()
    } else if (state.gameStarted && !fileHandle && isFirstSave) {
      // Show notification to set up auto-save
      setIsFirstSave(false)
      setStorageError('Click "Change Auto-Save Location" in Game Controls to enable auto-save to file.')
    }
  }, [state, isFirstSave])

  const startGame = (players: string[], targetScore: number, gameMode: 'individual' | 'team', teams?: Team[]) => {
    dispatch({ type: 'START_GAME', payload: { players, targetScore, gameMode, teams } })
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
    // Clear file handle
    fileHandle = null
    setIsFirstSave(true)
    // Clean up any remaining localStorage
    cleanupChunks('game-score-tracker')
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

  // Load game data from a file
  const loadFromFileHandler = async () => {
    const gameState = await loadFromFile()
    if (gameState) {
      dispatch({ type: 'LOAD_GAME', payload: gameState })
      setIsFirstSave(false) // File handle is set, so subsequent saves will work
    }
  }

  // Export game data as download
  const exportData = () => {
    exportGameData(state)
  }

  // Change the file location for auto-save (requires user click)
  const changeFileLocation = async () => {
    try {
      // Request new file location (this requires user gesture)
      const newHandle = await requestFileAccess()
      if (newHandle) {
        fileHandle = newHandle
        setIsFirstSave(false)

        // Save current state to the new file
        const success = await saveToFile(state)
        if (success) {
          setStorageError(null)
        } else {
          setStorageError('Failed to save to the selected file.')
        }
      }
    } catch (error) {
      console.error('Failed to change file location:', error)
    }
  }

  return (
    <GameContext.Provider value={{
      state,
      startGame,
      addScore,
      completeTurn,
      nextTurn,
      restartGame,
      resetGame,
      updateTargetScore,
      editTurnScore,
      travelToHistory,
      clearHistory,
      storageError,
      clearStorageError,
      loadFromFile: loadFromFileHandler,
      exportData,
      changeFileLocation
    }}>
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
