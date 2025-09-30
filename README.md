# 🎮 Game Score Tracker

A modern Next.js application for tracking and managing game scores with multiple players. Built with TypeScript, Tailwind CSS, and React Context for state management.

## Features

- **Multi-Player Support**: Add any number of players to your game
- **Custom Target Score**: Set your own target score to win
- **3 Scores Per Turn**: Each player enters 3 scores per turn, with automatic sum calculation
- **Intuitive Input Interface**: Three separate input boxes for easy score entry
- **Real-Time Scoreboard**: Live updates as players enter their scores
- **Individual Player Score Tables**: Separate, easy-to-read tables for each player at the bottom
- **Running Total Tracking**: See cumulative scores for each player
- **Turn Management**: Automatic turn rotation between players
- **Win Detection**: Automatic winner declaration when target score is reached
- **Current Turn Tracking**: See progress on current turn with visual indicators
- **Game Persistence**: Automatic save to browser's local storage
- **Restart Functionality**: Restart game with same players and target score
- **Reset Functionality**: Complete reset to setup screen
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Modern UI**: Beautiful, clean interface with improved font visibility

## How to Use

1. **Setup**: Enter a target score and add player names
2. **Start Game**: Click "Start Game" to begin
3. **Play**: Each player enters 3 scores per turn:
   - Fill in Score 1, Score 2, and Score 3 input boxes
   - See real-time turn total calculation
   - Click "Complete Turn & Next Player" when all scores are entered
4. **Track Progress**: Watch the scoreboard update with complete history
5. **Win**: First player to reach or exceed the target score wins!
6. **Restart**: After a game ends, click "Restart Game" to play again with the same players
7. **Reset**: Click "Reset Game" to return to setup screen
8. **Persistence**: Your game is automatically saved and will resume when you reload the page

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd game-score-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Context** - State management
- **React Hooks** - Modern React patterns

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with GameProvider
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   ├── GameSetup.tsx       # Game configuration component
│   ├── Scoreboard.tsx      # Score display component
│   ├── ScoreInput.tsx      # Score entry component
│   └── GameControls.tsx    # Game control buttons
└── contexts/
    └── GameContext.tsx     # Game state management
```

## Game Logic

- Players take turns in the order they were added
- Each turn, a player enters 3 individual scores
- The sum of these 3 scores becomes the turn total
- Turn totals are added to the player's cumulative score
- Game ends when any player reaches or exceeds the target score
- Winner is automatically declared
- Game can be reset at any time
- Current turn progress is tracked with visual indicators

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
