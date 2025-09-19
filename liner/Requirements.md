# BlockQuest - Functional Requirements Document

## 1. Project Overview

### 1.1 Application Name
**BlockQuest** - A modern, animated puzzle game

### 1.2 Purpose
BlockQuest is a Tetris-inspired puzzle game where players place shapes on a grid to complete lines and columns for points. The game features multiple modes, power-ups, themes, and progression systems designed for both casual and competitive play.

### 1.3 Target Platform
- **Primary**: Web browsers (HTML5/JavaScript)
- **Framework**: Phaser 3 game engine
- **Responsive Design**: Mobile-first approach with desktop support
- **Screen Sizes**: Optimized for mobile (320px+), tablet, and desktop

### 1.4 Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Game Engine**: Phaser 3.60.0
- **Audio**: Web Audio API via Phaser
- **Storage**: LocalStorage for persistence
- **Build**: Module-based architecture with ES6 imports

---

## 2. Core Gameplay Mechanics

### 2.1 Primary Game Loop
1. **Shape Placement**: Players drag and drop shapes from a tray onto a 10x10 game grid
2. **Line Completion**: When a complete row or column is filled, it gets cleared and awards points
3. **Continuous Play**: New shapes appear in the tray after placement
4. **Game Over**: Game ends when no valid moves are possible with current shapes

### 2.2 Grid System
- **Size**: 10x10 fixed grid
- **Cell System**: Each cell can be empty (0) or occupied (colored block)
- **Visual Feedback**: Highlight system shows valid placement areas during drag operations
- **Responsive**: Grid scales to fit screen while maintaining aspect ratio

### 2.3 Shape System
- **Shape Library**: Predefined patterns in `SHAPE_PATTERNS_EASY` and `SHAPE_PATTERNS_DIFFICULT`
- **Tray Management**: 3 shapes available at once
- **Random Generation**: Shapes generated based on difficulty setting
- **Drag & Drop**: Touch and mouse support for shape placement

### 2.4 Scoring System
- **Base Points**: Points awarded per completed line/column
- **Score Multipliers**: Based on difficulty and game mode
- **Coin Conversion**: Score generates coins for power-up purchases
- **High Score Tracking**: Separate high scores for different difficulties and modes

---

## 3. Game Modes

### 3.1 Normal Mode
- **Description**: Standard gameplay with endless shape placement
- **Objective**: Achieve highest possible score before running out of moves
- **Features**: 
  - Basic scoring system
  - Power-up availability
  - High score tracking

### 3.2 Daily Mode
- **Description**: Daily challenge with seeded random generation
- **Objective**: Complete daily puzzle with consistent seed across all players  
- **Features**:
  - Daily seed generation using current date
  - Reproducible shape sequences
  - Daily leaderboard potential
  - Single attempt per day

### 3.3 Puzzle Mode
- **Description**: Pre-designed puzzles with specific solutions
- **Structure**: Organized into puzzle packs with progressive difficulty
- **Features**:
  - Handcrafted puzzle scenarios
  - Pack-based progression system
  - Completion tracking
  - Pack unlocking mechanism
  - Specific win/loss conditions per puzzle

### 3.4 Adventure Mode
- **Description**: Story-driven campaign with themed chapters
- **Structure**: Chapter-based progression with unlock requirements
- **Features**:
  - Themed chapters (Forest Start, Crystal Lake, Mountain Pass)
  - Progressive unlocking system
  - Theme rewards for chapter completion
  - Completion status tracking
  - Story progression integration

### 3.5 Endless Mode
- **Description**: Extended gameplay with power-up integration
- **Special Features**:
  - Score-based power-up purchasing
  - "Stuck" detection with removal options
  - Extended survival gameplay
  - Enhanced power-up mechanics

---

## 4. Power-Up System

### 4.1 Power-Up Types
1. **Clear Row** (`CLEAR_ROW`)
   - **Function**: Instantly clears a selected row
   - **Usage**: Click on grid row after activation
   - **Cost**: Varies by mode (coins in normal, score in endless)

2. **Swap Tray** (`SWAP_TRAY`)
   - **Function**: Replaces all current tray shapes with new ones
   - **Usage**: Instant activation
   - **Cost**: Varies by mode

3. **Extra Undo** (`EXTRA_UNDO`)
   - **Function**: Allows reverting the last move made
   - **Usage**: Activates undo functionality
   - **Cost**: Varies by mode

### 4.2 Power-Up Economy
- **Coin System**: Primary currency for power-up purchases
- **Earning Coins**: Awarded based on score achievement
- **Persistent Storage**: Coins and power-up inventory saved in localStorage
- **Inventory Management**: Track owned power-ups across sessions

### 4.3 Power-Up Interface
- **Purchase Menu**: Accessible from main menu
- **In-Game Usage**: Horizontal button panel above tray
- **Visual Feedback**: Quantity indicators and availability status
- **Confirmation System**: Purchase and usage confirmations

---

## 5. User Interface Requirements

### 5.1 Main Menu
- **Layout**: Mobile-first button grid (2 columns)
- **Components**:
  - Animated title with color-changing effects
  - Game mode selector buttons
  - Difficulty toggle
  - Theme selector
  - Adventure mode access
  - Puzzle pack browser
  - Statistics viewer
  - Power-up shop
  - Settings access

### 5.2 Game Interface
- **Header Section** (2-row compact layout):
  - **Row 1**: Score, High Score, Coins, (empty)
  - **Row 2**: Mode, Theme, Difficulty, Speaker Icon
- **Main Game Area**: 
  - Responsive grid with minimal margins
  - Visual highlighting for valid placements
- **Bottom Section**:
  - Power-up buttons (horizontal panel)
  - Shape tray with drag-enabled shapes

### 5.3 Responsive Design
- **Mobile Optimization**: 
  - 1% margins for maximum screen usage
  - Touch-friendly button sizes
  - Compact font sizing
- **Desktop Enhancement**:
  - Larger fonts and margins where appropriate
  - Mouse hover effects
  - Keyboard shortcuts

### 5.4 Visual Themes
- **Theme System**: 6 predefined themes
  1. **Vibrant**: Bright colors with dark background
  2. **Forest**: Green/nature tones  
  3. **Neon**: High-contrast electric colors
  4. **Pastel**: Soft, muted colors with light background
  5. **Space**: Deep blues and purples
  6. **Colorblind**: Accessibility-focused color palette

---

## 6. Audio System

### 6.1 Sound Effects
- **Placement Sound** (`place.wav`): Played when shape is successfully placed
- **Line Clear Sound** (`clear.wav`): Played when lines are completed
- **Game Over Sound** (`gameover.wav`): Played at game termination
Note: audio files are in assets folder.

### 6.2 Audio Controls
- **Toggle Control**: Speaker icon in game interface
- **Persistence**: Audio preference saved across sessions
- **Visual Feedback**: Icon changes between 🔊 (on) and 🔇 (muted)

---

## 7. Data Persistence

### 7.1 Statistics Tracking
- **Score Records**: Best scores for each difficulty and mode
- **Game Counters**: Total games played, endless games
- **Achievement Data**: Lines cleared, puzzles solved, streaks
- **Session Data**: Last played timestamp

### 7.2 Progress Tracking
- **Adventure Progress**: Chapter completion and unlock status
- **Puzzle Progress**: Individual puzzle completion status
- **Power-up Inventory**: Current power-up quantities
- **Coin Balance**: Current coin count

### 7.3 Storage Implementation
- **Method**: HTML5 localStorage
- **Keys**: Prefixed with 'timbertiles_' for namespace isolation
- **Data Format**: JSON serialization for complex objects
- **Error Handling**: Graceful fallbacks for storage failures

---

## 8. Performance Requirements

### 8.1 Responsiveness
- **Touch Response**: <100ms delay for touch interactions
- **Animation Smoothness**: 60 FPS for all animations
- **Loading Time**: <3 seconds initial load on 3G connection

### 8.2 Memory Management
- **Texture Management**: Efficient sprite reuse
- **Garbage Collection**: Proper cleanup of game objects
- **Scene Management**: Memory cleanup between scene transitions

---

## 9. Accessibility Requirements

### 9.1 Visual Accessibility
- **Colorblind Support**: Dedicated colorblind-friendly theme
- **High Contrast**: Sufficient contrast ratios in all themes
- **Font Sizing**: Scalable text for different screen sizes

### 9.2 Input Accessibility
- **Multiple Input Methods**: Touch, mouse, and keyboard support
- **Large Touch Targets**: Minimum 44px touch targets on mobile
- **Visual Feedback**: Clear indication of interactive elements

---

## 10. Technical Architecture

### 10.1 Module Structure
Make all js as module and related files in separate folders. create good maintanable and easy to understand structure.
sounds and logo and icon is placed under assets folder.

### 10.2 Data Flow
1. **Initialization**: Load saved data and initialize game state
2. **Game Loop**: Handle input → Update game state → Render → Repeat
3. **Event System**: Phaser event system for component communication
4. **State Management**: Scene-based state with persistent data layer

---

## 11. Quality Assurance

### 11.1 Testing Requirements
- **Cross-browser Testing**: Chrome, Firefox, Safari, Edge
- **Device Testing**: iOS and Android mobile devices
- **Performance Testing**: Frame rate and memory usage monitoring
- **Regression Testing**: Feature compatibility across updates

### 11.2 Error Handling
- **Graceful Degradation**: Fallbacks for failed localStorage operations
- **User Feedback**: Clear error messages for user-facing issues
- **Logging**: Console logging for debugging in development

---

## 12. Future Enhancement Opportunities

### 12.1 Multiplayer Features
- Real-time multiplayer battles
- Leaderboards and tournaments
- Social sharing integration

### 12.2 Extended Content
- Additional puzzle packs
- More adventure chapters
- New power-up types
- Seasonal events and challenges

### 12.3 Monetization Options
- In-app purchases for coins/power-ups
- Premium themes
- Ad-supported free version
- Subscription for unlimited features

---

## 13. Acceptance Criteria

### 13.1 Core Functionality
- ✅ All game modes must be fully functional
- ✅ Power-up system must work across all modes
- ✅ Data persistence must maintain user progress
- ✅ Responsive design must work on all target devices

### 13.2 Performance Standards
- ✅ Game must maintain 60 FPS during normal gameplay
- ✅ Loading screens must complete within performance requirements
- ✅ Memory usage must remain stable during extended play

### 13.3 User Experience
- ✅ All user interactions must provide immediate visual feedback
- ✅ Game must be playable without tutorial for intuitive users
- ✅ Error states must be handled gracefully with user guidance

---

*This document represents the complete functional specification for BlockQuest v1.0. All features and requirements are based on the current codebase implementation and intended functionality.*