# BlockQuest - Modern Puzzle Game

A Tetris-inspired puzzle game built with Phaser 3, featuring multiple game modes, power-ups, themes, and responsive design.

## Features

### Core Gameplay
- **10x10 Grid**: Strategic placement of shapes on a fixed grid
- **Shape Variety**: Easy and hard difficulty with different shape patterns
- **Line Clearing**: Complete rows or columns to score points and earn coins
- **Combo System**: Chain multiple line clears for bonus points

### Game Modes
- **Normal Mode**: Classic endless gameplay
- **Daily Challenge**: Seeded daily puzzles for consistent competition
- **Endless Mode**: Score-based power-up purchasing system
- **Adventure Mode**: Story campaign with themed chapters
- **Puzzle Mode**: Handcrafted challenge scenarios

### Power-Up System
- **Clear Row**: Instantly clear any selected row
- **Swap Tray**: Replace all tray shapes with new ones
- **Extra Undo**: Revert your last move
- **Coin Economy**: Earn coins from scoring to purchase power-ups

### Visual Themes
- **Vibrant**: Bright colors with dark background
- **Forest**: Nature-inspired green tones
- **Neon**: High-contrast electric colors
- **Pastel**: Soft, muted colors with light background
- **Space**: Deep blues and purples
- **Colorblind Friendly**: Accessibility-focused palette

### Technical Features
- **Responsive Design**: Mobile-first approach with desktop support
- **Local Storage**: Persistent progress and settings
- **Audio System**: Sound effects with toggle controls
- **Performance**: 60 FPS smooth animations
- **Modular Architecture**: Clean, maintainable code structure

## Quick Start

1. **Setup**: Open `index.html` in a modern web browser
2. **Controls**: 
   - **Mouse/Touch**: Drag shapes from tray to grid
   - **ESC**: Return to menu
   - **Space**: Pause/resume game
3. **Objective**: Place shapes to complete lines and achieve high scores

## File Structure

```
blockquest/
├── index.html              # Main entry point
├── package.json           # Project configuration
├── assets/                # Game assets
│   ├── clear.wav         # Line clear sound
│   ├── place.wav         # Shape placement sound
│   ├── gameover.wav      # Game over sound
│   ├── favicon.png       # Browser icon
│   └── logo.png          # Game logo
└── js/                    # Game code
    ├── main.js           # Game initialization
    ├── core/             # Core systems
    │   ├── constants.js  # Game configuration
    │   ├── utils.js      # Utility functions
    │   ├── storage.js    # Data persistence
    │   ├── audio.js      # Sound management
    │   └── themes.js     # Visual themes
    ├── systems/          # Game systems
    │   ├── shapes.js     # Shape patterns and generation
    │   ├── grid.js       # Game board management
    │   ├── scoring.js    # Score calculation
    │   └── powerups.js   # Power-up system
    ├── modes/            # Game mode logic (placeholder)
    └── scenes/           # Phaser scenes
        ├── MenuScene.js  # Main menu
        ├── GameScene.js  # Core gameplay
        ├── PuzzleScene.js # Puzzle mode
        └── AdventureScene.js # Adventure mode
```

## Development

### Requirements
- Modern web browser with ES6 module support
- Local web server (for file:// protocol limitations)

### Running Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or use any static file server
python -m http.server 8080
```

### Architecture

The game follows a modular architecture with clear separation of concerns:

- **Core Systems**: Fundamental game services (storage, audio, themes)
- **Game Systems**: Gameplay mechanics (shapes, grid, scoring, power-ups)
- **Scenes**: Phaser-based game screens and state management
- **Utils**: Shared utility functions and helpers

### Key Classes
- `GameGrid`: Manages the 10x10 playing field
- `ShapeGenerator`: Creates and manages game pieces
- `ScoringManager`: Handles point calculation and progression
- `PowerUpManager`: Manages special abilities and economy
- `StorageManager`: Persistent data and settings
- `ThemeManager`: Visual customization system

## Game Mechanics

### Scoring
- **Base Points**: 100 points per completed line
- **Difficulty Multiplier**: Easy (1.0x), Hard (1.5x)
- **Combo Bonus**: Additional multiplier for consecutive clears
- **Cross Clear Bonus**: 50% bonus for clearing both rows and columns
- **Mode Bonuses**: Daily (20%), Endless (10%), Adventure (90%)

### Power-Up Costs
- **Normal Mode**: 30-50 coins per power-up
- **Endless Mode**: 300-500 score points per use

### Progression
- Coins earned from score (1 coin per 10 points)
- High scores tracked per mode and difficulty
- Adventure chapters unlock based on completion
- Statistics tracking for total games, lines cleared, etc.

## Browser Compatibility

- **Chrome/Chromium**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 12+)
- **Edge**: Full support

## Performance

- **Frame Rate**: Consistent 60 FPS
- **Memory**: Efficient sprite management and cleanup
- **Loading**: <3 seconds on 3G connection
- **Responsive**: Scales from 320px mobile to desktop

## Credits

Built with [Phaser 3](https://phaser.io/) game framework.

Audio assets in the `assets/` folder.

## License

MIT License - See source code for details.