import { Grid } from './grid.js';
import { Effects } from './effects.js';
import { Tray, getRandomShape } from './tray.js';
import { Storage } from './storage.js';
import { Sound } from './sound.js';
import { Modes } from './modes.js';
import { Input } from './input.js';
import { THEMES, PUZZLES, SHAPE_PATTERNS_EASY, SHAPE_PATTERNS_DIFFICULT } from './const.js';
class GameScene extends Phaser.Scene {
  // Draw placement highlight during drag
  drawPlacementHighlight(shape, gridRow, gridCol) {
    if (
      !shape ||
      typeof shape !== 'object' ||
      !Array.isArray(shape.pattern) ||
      !Array.isArray(shape.pattern[0])
    ) {
      console.warn('drawPlacementHighlight called with invalid shape:', shape);
      return;
    }
    if (this.placementHighlight) this.placementHighlight.clear();
    else this.placementHighlight = this.add.graphics();
    const theme = GameScene.getActiveTheme();
    const pattern = shape.pattern;
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[0].length; c++) {
        if (pattern[r][c]) {
          const gr = gridRow + r;
          const gc = gridCol + c;
          const x = this.gridOrigin.x + gc * this.cellSize;
          const y = this.gridOrigin.y + gr * this.cellSize;
          this.placementHighlight.lineStyle(4, theme.button.color, 0.7);
          this.placementHighlight.strokeRect(x + 2, y + 2, this.cellSize - 6, this.cellSize - 6);
        }
      }
    }
    this.children.bringToTop(this.placementHighlight);
  }
  create() {
    // Theme and initial state
    const theme = GameScene.getActiveTheme();
    this.gridSize = 10;
    this.cellSize = 60;
    this.gridOrigin = { x: 120, y: 120 };
    this.trayOrigin = { x: 120, y: 780 };
    this.gridState = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
    this.tray = new Tray(this, { gridSize: this.gridSize, cellSize: this.cellSize, trayOrigin: this.trayOrigin });
    this.score = 0;
    this.highScore = Storage.getHighScore();
    this.gridGraphics = this.add.graphics();
    this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: 32, color: theme.text });
    this.highScoreText = this.add.text(20, 60, 'High Score: ' + this.highScore, { fontSize: 24, color: theme.text });
    const sfx = Sound.create(this);
    this.sfxPlace = sfx.sfxPlace;
    this.sfxClear = sfx.sfxClear;
    this.sfxGameOver = sfx.sfxGameOver;
    this.drawGrid();
    this.tray.drawTray();
    this.tray.renderTrayShapes();
    Input.setup(this);
    this.dragData = null;
    this.settingsButton = this.add.text(820, 60, 'Settings', {
      fontSize: 20,
      color: theme.button.color,
      backgroundColor: theme.button.background,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive();
    this.settingsButton.on('pointerdown', this.showSettingsMenu, this);
    this.updateOptionsDisplay();
    window.DIFFICULTY = GameScene.DIFFICULTY;
  }
  static activeThemeIdx = 0;
  static DIFFICULTY = 'easy'; // 'easy' or 'difficult'
  static GAME_MODE = 'normal'; // 'normal', 'daily', 'puzzle'
  static getActiveTheme() { return THEMES[GameScene.activeThemeIdx]; }

  constructor() {
    super('GameScene');
    this.moveHistory = [];
    this.redoHistory = [];
    this.lastPointerDown = null;
    this.gameStarted = false;
  }

  // Removed duplicate create() method. Only the correct modular version remains below.
  undoMove() {
    if (!this.moveHistory.length) return;
    const move = this.moveHistory.pop();
    this.grid = new Grid(this.gridSize);
    // --- MODE LOGIC ---
    if (GameScene.GAME_MODE === 'normal') {
      this.grid.reset();
      this.tray.trayShapes = [getRandomShape(), getRandomShape(), getRandomShape()];
    } else if (GameScene.GAME_MODE === 'daily') {
      this.generateDailyChallenge();
      if (this.dailySeedText) this.dailySeedText.destroy();
      this.dailySeedText = this.add.text(450, 180, `Seed: ${this.getDailySeed()}`, {
        fontSize: 18,
        color: GameScene.getActiveTheme().text,
        fontFamily: 'Arial',
        backgroundColor: 'rgba(0,0,0,0)',
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      }).setOrigin(0.5);
      this.children.bringToTop(this.dailySeedText);
    } else if (GameScene.GAME_MODE === 'puzzle') {
      this.loadPuzzle(0);
      if (this.puzzleIdText) this.puzzleIdText.destroy();
      this.puzzleIdText = this.add.text(450, 180, `Puzzle #${PUZZLES[0].id + 1}`, {
        fontSize: 18,
        color: GameScene.getActiveTheme().text,
        fontFamily: 'Arial',
        backgroundColor: 'rgba(0,0,0,0)',
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      }).setOrigin(0.5);
      this.children.bringToTop(this.puzzleIdText);
    }
    if (this.placementHighlight) this.placementHighlight.destroy();
    this.placementHighlight = this.add.graphics();
    this.children.bringToTop(this.placementHighlight);
    this.score = 0;
    this.highScore = Storage.getHighScore();
    this.gridGraphics = this.add.graphics();
    const theme = GameScene.getActiveTheme();
    this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: 32, color: theme.text });
    this.highScoreText = this.add.text(20, 60, 'High Score: ' + this.highScore, { fontSize: 24, color: theme.text });
    this.sfxPlace = Sound.get(this, 'place');
    this.sfxClear = Sound.get(this, 'clear');
    this.sfxGameOver = Sound.get(this, 'gameover');
    this.drawGrid();
    this.tray.drawTray();
    this.tray.renderTrayShapes();
    Input.setup(this);
    this.dragData = null;
    if (!this.gameStarted) {
      this.settingsButton = this.add.text(820, 60, 'Settings', {
        fontSize: 20,
        color: theme.button.color,
        backgroundColor: theme.button.background,
        padding: { left: 12, right: 12, top: 6, bottom: 6 }
      }).setOrigin(0.5).setInteractive();
      this.settingsButton.on('pointerdown', this.showSettingsMenu, this);
    }
    this.updateOptionsDisplay();
    // Removed broken glow effect: color, x, y, size, duration were undefined
  }
  // Track if game has started
  gameStarted = false;
  // --- MODE LOGIC SECTION ---
  // Helper: Get today's seed for daily challenge
  getDailySeed() {
    const today = new Date();
    return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  }

  // Helper: Seeded random for daily mode
  seededRandom(seed) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return () => {
      h ^= h >>> 13;
      h ^= h << 7;
      h ^= h >>> 17;
      return (h >>> 0) / 4294967295;
    };
  }

  // Helper: Generate daily challenge tray and grid (deterministic)
  generateDailyChallenge() {
    const seed = this.getDailySeed();
    const rand = this.seededRandom(seed);
    // Deterministic tray shapes and seeded grid for daily mode
    const patterns = GameScene.DIFFICULTY === 'easy' ? SHAPE_PATTERNS_EASY : SHAPE_PATTERNS_DIFFICULT;
    this.trayShapes = [];
    for (let i = 0; i < 3; i++) {
      const patternIdx = Math.floor(rand() * patterns.length);
      const colorIdx = Math.floor(rand() * GameScene.getActiveTheme().blockColors.length);
      this.trayShapes.push({ pattern: patterns[patternIdx], color: GameScene.getActiveTheme().blockColors[colorIdx] });
    }
    // Seeded grid: fill 8 blocks in fixed positions for challenge
    this.gridState = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
    for (let i = 0; i < 8; i++) {
      const r = Math.floor(rand() * this.gridSize);
      const c = Math.floor(rand() * this.gridSize);
      const colorIdx = Math.floor(rand() * GameScene.getActiveTheme().blockColors.length);
      this.gridState[r][c] = GameScene.getActiveTheme().blockColors[colorIdx];
    }
  }
  // Draw placed blocks on grid
  redrawGridBlocks() {
    const theme = GameScene.getActiveTheme();
    if (this.gridBlocks) { this.gridBlocks.forEach(b => b.destroy()); }
    this.gridBlocks = [];
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const color = this.gridState[r][c];
        if (color) {
          const x = this.gridOrigin.x + c * this.cellSize;
          const y = this.gridOrigin.y + r * this.cellSize;
          const block = this.add.graphics();
          block.fillStyle(color, 1);
          block.fillRect(x + 2, y + 2, this.cellSize - 6, this.cellSize - 6);
          block.lineStyle(3, theme.gridLine, 0.25);
          block.strokeRect(x + 2, y + 2, this.cellSize - 6, this.cellSize - 6);
          block.lineStyle(6, theme.background, 0.15);
          block.strokeRect(x + 6, y + 6, this.cellSize - 14, this.cellSize - 14);
          this.gridBlocks.push(block);
        }
      }
    }
  }
  showSettingsMenu() {
    const theme = THEMES[GameScene.activeThemeIdx];
    // Always destroy previous settings UI if present
    if (this.settingsOverlay) { this.settingsOverlay.destroy(); this.settingsOverlay = null; }
    if (this.settingsTitle) { this.settingsTitle.destroy(); this.settingsTitle = null; }
    if (this.settingsThemeButton) { this.settingsThemeButton.destroy(); this.settingsThemeButton = null; }
    if (this.settingsDifficultyButton) { this.settingsDifficultyButton.destroy(); this.settingsDifficultyButton = null; }
    if (this.settingsModeButton) { this.settingsModeButton.destroy(); this.settingsModeButton = null; }
    if (this.settingsCloseButton) { this.settingsCloseButton.destroy(); this.settingsCloseButton = null; }

    // Mode selector
    this.settingsModeButton = this.add.text(450, 340, 'Mode: ' + GameScene.GAME_MODE.charAt(0).toUpperCase() + GameScene.GAME_MODE.slice(1), {
      fontSize: 24,
      color: theme.button.color,
      backgroundColor: theme.button.background,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive();
    this.settingsModeButton.on('pointerdown', () => {
      // Switch mode using Modes module and restart
      GameScene.GAME_MODE = Modes.getNextMode(GameScene.GAME_MODE);
      window._blockwoodJustRestartedFromSettings = true;
      this.time.delayedCall(0, () => {
        this.scene.restart();
      });
    });

    this.settingsOverlay = this.add.rectangle(450, 450, 400, 320, theme.overlay, theme.overlayAlpha).setOrigin(0.5);
    this.settingsTitle = this.add.text(450, 300, 'Settings', { fontFamily: 'Arial', fontSize: 36, color: theme.text, fontStyle: 'bold' }).setOrigin(0.5);
    // Theme selector
    this.settingsThemeButton = this.add.text(450, 380, 'Theme: ' + theme.name, {
      fontSize: 24,
      color: theme.button.color,
      backgroundColor: theme.button.background,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive();
    this.settingsThemeButton.on('pointerdown', () => {
      GameScene.activeThemeIdx = (GameScene.activeThemeIdx + 1) % THEMES.length;
      window._blockwoodJustRestartedFromSettings = true;
      this.time.delayedCall(0, () => {
        this.scene.restart();
      });
    });
    // Difficulty selector
    this.settingsDifficultyButton = this.add.text(450, 420, 'Difficulty: ' + (GameScene.DIFFICULTY === 'easy' ? 'Easy' : 'Difficult'), {
      fontSize: 24,
      color: theme.button.color,
      backgroundColor: theme.button.background,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive();
    this.settingsDifficultyButton.on('pointerdown', () => {
      GameScene.DIFFICULTY = GameScene.DIFFICULTY === 'easy' ? 'difficult' : 'easy';
      window._blockwoodJustRestartedFromSettings = true;
      this.time.delayedCall(0, () => {
        this.scene.restart();
      });
    });
    // Close button
    this.settingsCloseButton = this.add.text(450, 500, 'Close', {
      fontSize: 24,
      color: '#fff',
      backgroundColor: '#222',
      padding: { left: 24, right: 24, top: 12, bottom: 12 }
    }).setOrigin(0.5).setInteractive();
    this.settingsCloseButton.on('pointerdown', () => {
      if (this.settingsOverlay) { this.settingsOverlay.destroy(); this.settingsOverlay = null; }
      if (this.settingsTitle) { this.settingsTitle.destroy(); this.settingsTitle = null; }
      if (this.settingsThemeButton) { this.settingsThemeButton.destroy(); this.settingsThemeButton = null; }
      if (this.settingsDifficultyButton) { this.settingsDifficultyButton.destroy(); this.settingsDifficultyButton = null; }
      if (this.settingsModeButton) { this.settingsModeButton.destroy(); this.settingsModeButton = null; }
      if (this.settingsCloseButton) { this.settingsCloseButton.destroy(); this.settingsCloseButton = null; }
    });
    this.children.bringToTop(this.settingsOverlay);
    this.children.bringToTop(this.settingsTitle);
    this.children.bringToTop(this.settingsModeButton);
    this.children.bringToTop(this.settingsThemeButton);
    this.children.bringToTop(this.settingsDifficultyButton);
    this.children.bringToTop(this.settingsCloseButton);
  }
  updateOptionsDisplay() {
    const theme = GameScene.getActiveTheme();
    let modeLabel = 'Mode: ' + (GameScene.GAME_MODE === 'normal' ? 'Normal' : GameScene.GAME_MODE === 'daily' ? 'Daily' : 'Puzzle');
    let text = `${modeLabel}    Theme: ${theme.name}    Difficulty: ${GameScene.DIFFICULTY === 'easy' ? 'Easy' : 'Difficult'}`;
    // Always destroy and recreate optionsText for robustness
    if (this.optionsText) {
      this.optionsText.destroy();
      this.optionsText = null;
    }
    this.optionsText = this.add.text(450, 90, text, {
      fontSize: 24,
      color: theme.text,
      fontFamily: 'Arial',
      backgroundColor: 'rgba(0,0,0,0)',
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5);
    this.children.bringToTop(this.optionsText);

    // No mode banners; only show top options text
  }
  preload() {
    // Load simple sound assets (replace with custom files if desired)
    this.load.audio('place', 'assets/place.wav');
    this.load.audio('clear', 'assets/clear.wav');
    this.load.audio('gameover', 'assets/gameover.wav');
  }
  onPointerMove(pointer) {
    // No-op: required to avoid event listener error
  }
  // Helper: Refill tray if all slots are empty
  // Tray refill now handled by Tray module
  // ...existing code...
  // ...existing code...
  drawGrid() {
    const theme = GameScene.getActiveTheme();
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(2, theme.gridLine, theme.gridLineAlpha);
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        this.gridGraphics.strokeRect(this.gridOrigin.x + c * this.cellSize,this.gridOrigin.y + r * this.cellSize,this.cellSize,this.cellSize);
      }
    }
  }

  // Helper: Place shape on grid
  placeShapeAt(shape, gridRow, gridCol) {
    const pattern = shape.pattern;
    // Save move for undo
    let placedBlocks = [];
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[0].length; c++) {
        if (pattern[r][c]) {
          const gr = gridRow + r;
          const gc = gridCol + c;
          placedBlocks.push({ r: gr, c: gc, prev: this.gridState[gr][gc] });
        }
      }
    }
    this.moveHistory.push({
      type: 'place',
      shape: JSON.parse(JSON.stringify(shape)),
      gridRow,
      gridCol,
      placedBlocks,
      trayIdx: this.tray.trayShapes.indexOf(shape)
    });
    this.redoHistory = [];
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[0].length; c++) {
        if (pattern[r][c]) {
          const gr = gridRow + r;
          const gc = gridCol + c;
          this.gridState[gr][gc] = shape.color;
          // Visual effect: glow and burst on block placement
          const x = this.gridOrigin.x + gc * this.cellSize + this.cellSize / 2;
          const y = this.gridOrigin.y + gr * this.cellSize + this.cellSize / 2;
          Effects.showGlowEffect(this, x, y, shape.color, this.cellSize / 2, 350);
          Effects.showParticleBurst(this, x, y, shape.color, 8, 7, 400);
        }
      }
    }
    // Hide settings button after first move
    if (!this.gameStarted && this.settingsButton) {
      this.settingsButton.destroy();
      this.settingsButton = null;
      this.gameStarted = true;
    }
    // Play block placement sound
    if (this.sfxPlace) this.sfxPlace.play();
    this.redrawGridBlocks();
    this.checkAndClearLines();
    // After placing, check for game over
    if (!this.anyMovePossible()) {
      this.showGameOverOverlay();
    }
  }
  // Tray rendering now handled by Tray module
  // Returns true if all tray shapes can be placed somewhere
  anyMovePossible() {
    for (let i = 0; i < this.tray.trayShapes.length; i++) {
      const shape = this.tray.trayShapes[i];
      if (
        !shape ||
        typeof shape !== 'object' ||
        !Array.isArray(shape.pattern) ||
        !Array.isArray(shape.pattern[0])
      ) continue;
      let canPlace = false;
      for (let r = 0; r <= this.gridSize - shape.pattern.length; r++) {
        for (let c = 0; c <= this.gridSize - shape.pattern[0].length; c++) {
          if (this.canPlaceShapeAt(shape, r, c)) {
            canPlace = true;
            break;
          }
        }
        if (canPlace) break;
      }
      if (!canPlace) {
        // If any shape cannot be placed, game should end immediately
        return false;
      }
    }
    return true;
  }

  showGameOverOverlay() {
    const theme = GameScene.getActiveTheme();
    if (this.gameOverOverlay) return;
    // Play game over sound
    if (this.sfxGameOver) this.sfxGameOver.play();
    this.gameOverOverlay = this.add.rectangle(450, 450, 600, 300, theme.overlay, theme.overlayAlpha).setOrigin(0.5);
    // Visual effect: big burst and glow for game over
    Effects.showGlowEffect(this, 450, 450, theme.overlay, 300, 1200);
    Effects.showParticleBurst(this, 450, 450, theme.button.color, 32, 18, 1200);
    this.gameOverText = this.add.text(450, 400, 'Game Over!', { fontFamily: 'Arial', fontSize: 64, color: theme.text, fontStyle: 'bold' }).setOrigin(0.5);
    this.restartButton = this.add.text(450, 500, 'Restart', { fontFamily: 'Arial', fontSize: 36, color: theme.button.color, backgroundColor: theme.button.background, padding: { left: 24, right: 24, top: 12, bottom: 12 } }).setOrigin(0.5).setInteractive();
    this.restartButton.on('pointerdown', () => {
      this.restartGame();
    });
    // Bring overlay and buttons to top after a short delay to ensure they are above all blocks
    this.time.delayedCall(50, () => {
      this.children.bringToTop(this.gameOverOverlay);
      this.children.bringToTop(this.gameOverText);
      this.children.bringToTop(this.restartButton);
    });
  }

  hideGameOverOverlay() {
    if (this.gameOverOverlay) this.gameOverOverlay.destroy();
    if (this.gameOverText) this.gameOverText.destroy();
    if (this.restartButton) this.restartButton.destroy();
    this.gameOverOverlay = null;
    this.gameOverText = null;
    this.restartButton = null;
  }

  restartGame() {
    // Reset optionsText reference to avoid accessing destroyed object
    this.optionsText = null;
    this.updateOptionsDisplay();
    this.hideGameOverOverlay();
    this.gridState = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
    this.trayShapes = [getRandomShape(), getRandomShape(), getRandomShape()];
    this.score = 0;
    this.scoreText.setText('Score: 0');
    this.drawGrid();
    this.drawTray();
    this.renderTrayShapes();
    Input.setup(this);
    this.redrawGridBlocks();
    // Show settings button again after restart
    this.gameStarted = false;
    if (this.settingsButton) this.settingsButton.destroy();
    const theme = GameScene.getActiveTheme();
    this.settingsButton = this.add.text(820, 60, 'Settings', {
      fontSize: 20,
      color: theme.button.color,
      backgroundColor: theme.button.background,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive();
    this.settingsButton.on('pointerdown', this.showSettingsMenu, this);
    window.DIFFICULTY = GameScene.DIFFICULTY;
  }
  // Tray rendering now handled by Tray module
  // Tray drag handlers now handled by Tray module
  onPointerDown(pointer) {
    for (let i = 0; i < this.trayBlockMap.length; i++) {
      const { shapeIdx, blocks } = this.trayBlockMap[i];
      for (let b = 0; b < blocks.length; b++) {
        const block = blocks[b];
        // Manually calculate bounds for graphics object
        const bounds = {
          x: block.x,
          y: block.y,
          width: this.cellSize - 6,
          height: this.cellSize - 6
        };
        if (
          pointer.x >= bounds.x &&
          pointer.x <= bounds.x + bounds.width &&
          pointer.y >= bounds.y &&
          pointer.y <= bounds.y + bounds.height
        ) {
          this.dragData = {
            shapeIdx,
            blocks,
            startPos: blocks.map(bl => ({ x: bl.x, y: bl.y })),
            offsetX: pointer.x - block.x,
            offsetY: pointer.y - block.y,
          };
          blocks.forEach(bl => bl.setAlpha(0.7));
          return;
        }
      }
    }
  }
  // Helper: Check if shape can be placed at grid position
  canPlaceShapeAt(shape, gridRow, gridCol) {
    const pattern = shape.pattern;
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[0].length; c++) {
        if (pattern[r][c]) {
          const gr = gridRow + r;
          const gc = gridCol + c;
          if (
            gr < 0 || gr >= this.gridSize ||
            gc < 0 || gc >= this.gridSize ||
            this.gridState[gr][gc]
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }
  // Removed duplicate create() method. Only the correct modular version remains above.

  // Check and clear filled rows/columns
  checkAndClearLines() {
    let linesCleared = 0;
    let clearedRows = [];
    let clearedCols = [];
    // Rows
    for (let r = 0; r < this.gridSize; r++) {
      if (this.gridState[r].every(cell => cell)) {
        clearedRows.push(r);
        linesCleared++;
      }
    }
    // Columns
    for (let c = 0; c < this.gridSize; c++) {
      let full = true;
      for (let r = 0; r < this.gridSize; r++) {
        if (!this.gridState[r][c]) full = false;
      }
      if (full) {
        clearedCols.push(c);
        linesCleared++;
      }
    }
    // Save clear for undo
    let clearedBlocks = [];
    for (let r of clearedRows) {
      for (let c = 0; c < this.gridSize; c++) {
        clearedBlocks.push({ r, c, prev: this.gridState[r][c] });
      }
    }
    for (let c of clearedCols) {
      for (let r = 0; r < this.gridSize; r++) {
        if (!clearedBlocks.some(b => b.r === r && b.c === c)) {
          clearedBlocks.push({ r, c, prev: this.gridState[r][c] });
        }
      }
    }
    this.moveHistory.push({ type: 'clear', clearedBlocks });
    this.redoHistory = [];
    if (linesCleared > 0) {
      // Play line clear sound
      if (this.sfxClear) this.sfxClear.play();
      // Combo bonus: 10 points per line, +5 per extra line
      let bonus = 10 * linesCleared + (linesCleared > 1 ? 5 * (linesCleared - 1) : 0);
      // Animate cleared blocks
      let blocksToClear = [];
      if (!this.gridBlocks) return;
      // Find blocks in cleared rows
      for (let r of clearedRows) {
        for (let c = 0; c < this.gridSize; c++) {
          blocksToClear.push({ r, c });
        }
      }
      // Find blocks in cleared columns
      for (let c of clearedCols) {
        for (let r = 0; r < this.gridSize; r++) {
          // Avoid duplicate blocks
          if (!blocksToClear.some(b => b.r === r && b.c === c)) {
            blocksToClear.push({ r, c });
          }
        }
      }
      // Animate fade out and show visual effects
      let fadePromises = [];
      for (let blockInfo of blocksToClear) {
        const idx = blockInfo.r * this.gridSize + blockInfo.c;
        const block = this.gridBlocks[idx];
        const x = this.gridOrigin.x + blockInfo.c * this.cellSize + this.cellSize / 2;
        const y = this.gridOrigin.y + blockInfo.r * this.cellSize + this.cellSize / 2;
        // Visual effect: burst and glow for cleared block
        Effects.showGlowEffect(this, x, y, 0xffffff, this.cellSize / 2, 500);
        Effects.showParticleBurst(this, x, y, 0xffffff, 10, 8, 600);
        if (block) {
          fadePromises.push(new Promise(resolve => {
            this.tweens.add({
              targets: block,
              alpha: 0,
              duration: 900,
              onComplete: () => resolve()
            });
          }));
        }
      }
      // Show score popup at center of cleared lines
      let popupPositions = [];
      for (let r of clearedRows) {
        popupPositions.push({ x: this.gridOrigin.x + (this.gridSize * this.cellSize) / 2, y: this.gridOrigin.y + r * this.cellSize + this.cellSize / 2 });
      }
      for (let c of clearedCols) {
        popupPositions.push({ x: this.gridOrigin.x + c * this.cellSize + this.cellSize / 2, y: this.gridOrigin.y + (this.gridSize * this.cellSize) / 2 });
      }
      for (let pos of popupPositions) {
        const popup = this.add.text(pos.x, pos.y, '+' + bonus, { fontSize: 32, color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        window.DIFFICULTY = GameScene.DIFFICULTY;
        this.tweens.add({
          targets: popup,
          alpha: 0,
          y: pos.y - 40,
          duration: 700,
          onComplete: () => popup.destroy()
        });
      }
      Promise.all(fadePromises).then(() => {
        setTimeout(() => {
          // Actually clear grid state
          for (let r of clearedRows) {
            for (let c = 0; c < this.gridSize; c++) this.gridState[r][c] = 0;
          }
          for (let c of clearedCols) {
            for (let r = 0; r < this.gridSize; r++) this.gridState[r][c] = 0;
          }
          this.score += bonus;
          this.scoreText.setText('Score: ' + this.score);
          if (this.score > this.highScore) {
            this.highScore = this.score;
            Storage.setHighScore(this.highScore);
            this.highScoreText.setText('High Score: ' + this.highScore);
          }
          this.redrawGridBlocks();
        }, 500); // 100ms buffer after animation for clarity
      });
    }
  }

  // Calculate score
  getScore() {
    let score = 0;
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        if (this.gridState[r][c]) score++;
      }
    }
    return score;
  }

  // Handle drop: try to place block on grid
  onPointerUp(pointer) {
    if (this.dragData) {
      const { shapeIdx, blocks, startPos } = this.dragData;
      blocks.forEach((block, idx) => {
        block.setAlpha(1);
        block.x = startPos[idx].x;
        block.y = startPos[idx].y;
      });
      // Try to place shape on grid
      const gridX = Math.floor((pointer.x - this.gridOrigin.x) / this.cellSize);
      const gridY = Math.floor((pointer.y - this.gridOrigin.y) / this.cellSize);
      const shape = this.tray.trayShapes[shapeIdx];
      if (shape && this.canPlaceShapeAt(shape, gridY, gridX)) {
        this.placeShapeAt(shape, gridY, gridX);
        // Remove shape from tray
        this.tray.trayShapes[shapeIdx] = null;
        this.refillTrayIfNeeded();
      }
      this.dragData = null;
    }
  }
}


const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 900,
  backgroundColor: '#222',
  parent: 'game-container',
  scene: [GameScene]
};
new Phaser.Game(config);
