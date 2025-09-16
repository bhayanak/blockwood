import { Grid } from './grid.js';
import { Effects } from './effects.js';
import { Tray, getRandomShape } from './tray.js';
import { Storage } from './storage.js';
import { Sound } from './sound.js';
import { Modes } from './modes.js';
import { Input } from './input.js';
import { THEMES, PUZZLES, SHAPE_PATTERNS_EASY, SHAPE_PATTERNS_DIFFICULT } from './const.js';
import { DEFAULT_STATS, loadStats, saveStats } from './stats.js';

import {
  PUZZLE_PACKS,
  getUnlockedPacks,
  loadCompletedPuzzles,
  markPuzzleCompleted,
  unlockNextPack,
  isPackCompleted
} from './puzzles.js';
import { resetPuzzleProgress } from './puzzles.js';
import { PUZZLE_DATA } from './puzzleData.js';
import { enableEndlessMode, disableEndlessMode, isEndlessMode } from './endless.js';

let STATS = loadStats();
export class GameScene extends Phaser.Scene {
  // Score-to-coins conversion: award coins as score increases
  addScore(points) {
    this.score += points;
    if (this.scoreText) this.scoreText.setText('Score: ' + this.score);
    // Award 1 coin per 100 points, always persist and update display
    import('./powerups.js').then(module => {
      const coinsBefore = module.getCoins ? module.getCoins() : 0;
      const coinsToAdd = Math.floor(this.score / 100) - coinsBefore;
      if (coinsToAdd > 0 && module.addCoins) {
        module.addCoins(coinsToAdd);
      }
      // Always refresh coin display from localStorage
      if (this.updateCoinDisplay) {
        this.updateCoinDisplay();
      }
    });
  }
  static activeThemeIdx = 0;
  static DIFFICULTY = 'easy'; // 'easy' or 'difficult'
  static GAME_MODE = 'normal'; // 'normal', 'daily', 'puzzle'
  static getActiveTheme() { return THEMES[GameScene.activeThemeIdx]; }
  showPuzzlePackMenu() {
    // Destroy previous overlay if present
    if (this.puzzlePackOverlay) { this.puzzlePackOverlay.destroy(); this.puzzlePackOverlay = null; }
    if (this.puzzlePackTitle) { this.puzzlePackTitle.destroy(); this.puzzlePackTitle = null; }
    if (this.puzzlePackButtons) { this.puzzlePackButtons.forEach(b => b.destroy()); }
    if (this.resetProgressButton) { this.resetProgressButton.destroy(); this.resetProgressButton = null; }
    if (this.puzzlePackCloseButton) { this.puzzlePackCloseButton.destroy(); this.puzzlePackCloseButton = null; }
    this.puzzlePackButtons = [];
    const theme = GameScene.getActiveTheme();
    this.puzzlePackOverlay = this.add.rectangle(450, 450, 500, 400, theme.overlay, theme.overlayAlpha).setOrigin(0.5);
    this.puzzlePackTitle = this.add.text(450, 300, 'Puzzle Packs', { fontFamily: 'Arial', fontSize: 36, color: theme.text, fontStyle: 'bold' }).setOrigin(0.5);
    const unlockedPacks = getUnlockedPacks();
    let y = 360;
    unlockedPacks.forEach((pack, idx) => {
      const label = pack.unlocked ? pack.name : `${pack.name} (Locked)`;
      const btn = this.add.text(450, y, label, {
        fontSize: 24,
        color: pack.unlocked ? theme.button.color : '#888',
        backgroundColor: pack.unlocked ? theme.button.background : '#333',
        padding: { left: 16, right: 16, top: 8, bottom: 8 }
      }).setOrigin(0.5).setInteractive();
      if (pack.unlocked) {
        btn.on('pointerdown', () => {
          this.showPuzzleSelectionMenu(idx);
        });
      }
      this.puzzlePackButtons.push(btn);
      y += 50;
    });
    // Add Close button above Reset Progress for visibility
    this.puzzlePackCloseButton = this.add.text(450, 650, 'Close', {
      fontSize: 22,
      color: '#fff',
      backgroundColor: '#222',
      fontStyle: 'bold',
      padding: { left: 24, right: 24, top: 10, bottom: 10 },
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, stroke: true }
    }).setOrigin(0.5).setInteractive();
    this.puzzlePackCloseButton.on('pointerdown', () => {
      if (this.puzzlePackOverlay) { this.puzzlePackOverlay.destroy(); this.puzzlePackOverlay = null; }
      if (this.puzzlePackTitle) { this.puzzlePackTitle.destroy(); this.puzzlePackTitle = null; }
      if (this.puzzlePackButtons) { this.puzzlePackButtons.forEach(b => b.destroy()); }
      if (this.resetProgressButton) { this.resetProgressButton.destroy(); this.resetProgressButton = null; }
      if (this.puzzlePackCloseButton) { this.puzzlePackCloseButton.destroy(); this.puzzlePackCloseButton = null; }
    });
    // Add Reset Progress button at the bottom, always visible
    this.resetProgressButton = this.add.text(450, 700, 'Reset Progress', {
      fontSize: 22,
      color: '#fff',
      backgroundColor: '#c00',
      fontStyle: 'bold',
      padding: { left: 24, right: 24, top: 10, bottom: 10 }
    }).setOrigin(0.5).setInteractive();
    this.resetProgressButton.on('pointerdown', () => {
      resetPuzzleProgress();
      this.showPuzzlePackMenu();
    });
    this.children.bringToTop(this.puzzlePackOverlay);
    this.children.bringToTop(this.puzzlePackTitle);
    this.puzzlePackButtons.forEach(b => this.children.bringToTop(b));
    this.children.bringToTop(this.puzzlePackCloseButton);
    this.children.bringToTop(this.resetProgressButton);
  }

  showPuzzleSelectionMenu(packIdx) {
    // Destroy previous overlay if present
    if (this.puzzleSelectionOverlay) { this.puzzleSelectionOverlay.destroy(); this.puzzleSelectionOverlay = null; }
    if (this.puzzleSelectionTitle) { this.puzzleSelectionTitle.destroy(); this.puzzleSelectionTitle = null; }
    if (this.puzzleSelectionButtons) { this.puzzleSelectionButtons.forEach(b => b.destroy()); }
    this.puzzleSelectionButtons = [];
    const theme = GameScene.getActiveTheme();
    this.puzzleSelectionOverlay = this.add.rectangle(450, 450, 500, 400, theme.overlay, theme.overlayAlpha).setOrigin(0.5);
    this.puzzleSelectionTitle = this.add.text(450, 300, 'Select Puzzle', { fontFamily: 'Arial', fontSize: 32, color: theme.text, fontStyle: 'bold' }).setOrigin(0.5);
    const pack = PUZZLE_PACKS[packIdx];
    const completed = loadCompletedPuzzles();
    let y = 360;
    pack.puzzles.forEach(pid => {
      const isCompleted = completed.includes(pid);
      const label = isCompleted ? `Puzzle #${pid + 1} (Done)` : `Puzzle #${pid + 1}`;
      const btn = this.add.text(450, y, label, {
        fontSize: 22,
        color: isCompleted ? '#aaa' : theme.button.color,
        backgroundColor: isCompleted ? '#333' : theme.button.background,
        padding: { left: 12, right: 12, top: 6, bottom: 6 }
      }).setOrigin(0.5).setInteractive();
      if (!isCompleted) {
        btn.on('pointerdown', () => {
          this.startPuzzle(pid, packIdx);
        });
      }
      this.puzzleSelectionButtons.push(btn);
      y += 40;
    });
    this.children.bringToTop(this.puzzleSelectionOverlay);
    this.children.bringToTop(this.puzzleSelectionTitle);
    this.puzzleSelectionButtons.forEach(b => this.children.bringToTop(b));
  }

  startPuzzle(puzzleId, packIdx) {
    // Load puzzle data
    const pdata = PUZZLE_DATA.find(p => p.id === puzzleId);
    if (!pdata) return;
    // Set up grid for puzzle
    this.gridState = pdata.grid.map(row => row.slice());
    this.gridSize = pdata.grid.length;
    this.cellSize = 60;
    this.gridOrigin = { x: 120, y: 120 };
    this.trayOrigin = { x: 120, y: 780 };
    // Initialize tray and tray shapes for puzzle mode
    if (!this.tray) {
      this.tray = new Tray(this, { gridSize: this.gridSize, cellSize: this.cellSize, trayOrigin: this.trayOrigin });
    }
    // Generate tray shapes for puzzle mode
    this.tray.trayShapes = [getRandomShape(), getRandomShape(), getRandomShape()];
    this.tray.drawTray();
    this.tray.renderTrayShapes();
    this.score = 0;
    this.highScore = Storage.getHighScore();
    if (!this.gridGraphics) this.gridGraphics = this.add.graphics();
    if (!this.scoreText) this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: 32, color: GameScene.getActiveTheme().text });
    else this.scoreText.setText('Score: 0');
    if (!this.highScoreText) this.highScoreText = this.add.text(20, 60, 'High Score: ' + this.highScore, { fontSize: 24, color: GameScene.getActiveTheme().text });
    else this.highScoreText.setText('High Score: ' + this.highScore);
    // Draw grid lines before blocks
    this.drawGrid();
    this.redrawGridBlocks();
    // Track initial filled blocks for completion check
    this.initialFilledBlocks = [];
    for (let r = 0; r < pdata.grid.length; r++) {
      for (let c = 0; c < pdata.grid[r].length; c++) {
        if (pdata.grid[r][c]) {
          this.initialFilledBlocks.push({ r, c });
        }
      }
    }
    // Store current puzzle context
    this.currentPuzzleId = puzzleId;
    this.currentPackIdx = packIdx;
    this.puzzleGoal = pdata.goal;
    // Optionally show puzzle goal
    if (this.puzzleGoalText) this.puzzleGoalText.destroy();
    this.puzzleGoalText = this.add.text(450, 60, `Goal: ${pdata.goal}`, {
      fontSize: 20,
      color: '#fff',
      backgroundColor: '#222',
      padding: { left: 16, right: 16, top: 8, bottom: 8 }
    }).setOrigin(0.5);
    this.children.bringToTop(this.puzzleGoalText);
    // Hide overlays
    if (this.puzzlePackOverlay) { this.puzzlePackOverlay.destroy(); this.puzzlePackOverlay = null; }
    if (this.puzzlePackTitle) { this.puzzlePackTitle.destroy(); this.puzzlePackTitle = null; }
    if (this.puzzlePackButtons) { this.puzzlePackButtons.forEach(b => b.destroy()); }
    if (this.resetProgressButton) { this.resetProgressButton.destroy(); this.resetProgressButton = null; }
    if (this.puzzlePackCloseButton) { this.puzzlePackCloseButton.destroy(); this.puzzlePackCloseButton = null; }
    if (this.puzzleSelectionOverlay) { this.puzzleSelectionOverlay.destroy(); this.puzzleSelectionOverlay = null; }
    if (this.puzzleSelectionTitle) { this.puzzleSelectionTitle.destroy(); this.puzzleSelectionTitle = null; }
    if (this.puzzleSelectionButtons) { this.puzzleSelectionButtons.forEach(b => b.destroy()); }
    // Mark puzzle as active
    this.puzzleActive = true;
  }

  checkPuzzleCompletion() {
    if (typeof this.currentPuzzleId === 'number' && Array.isArray(this.initialFilledBlocks)) {
      // Puzzle is complete when all initial filled blocks are now empty
      const allCleared = this.initialFilledBlocks.every(pos => this.gridState[pos.r][pos.c] === 0);
      if (allCleared) {
        // Puzzle solved!
        console.log('Puzzle completed:', this.currentPuzzleId);
        markPuzzleCompleted(this.currentPuzzleId);
        const completed = loadCompletedPuzzles();
        if (isPackCompleted(this.currentPackIdx, completed)) {
          unlockNextPack(this.currentPackIdx);
        }
        // Always reload stats before updating
        STATS = loadStats();
        if (typeof STATS.puzzlesSolved === 'number') {
          STATS.puzzlesSolved++;
        } else {
          STATS.puzzlesSolved = 1;
        }
        saveStats(STATS);
        // Show game over overlay
        this.showGameOverOverlay();
        // Block further moves until menu
        this.puzzleActive = false;
        // Show success and return to pack menu after delay
        if (this.puzzleGoalText) this.puzzleGoalText.destroy();
        this.puzzleGoalText = this.add.text(450, 60, 'Puzzle Completed!', {
          fontSize: 24,
          color: '#0f0',
          backgroundColor: '#222',
          padding: { left: 16, right: 16, top: 8, bottom: 8 }
        }).setOrigin(0.5);
        this.children.bringToTop(this.puzzleGoalText);
        this.time.delayedCall(1200, () => {
          if (this.puzzleGoalText) this.puzzleGoalText.destroy();
          this.showPuzzlePackMenu();
          this.currentPuzzleId = null;
          this.currentPackIdx = null;
          this.puzzleActive = false;
        });
      }
    }
  }
  // showStatsMenu removed; stats now only accessible from main menu
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
          // Use a bright cyan for highlight, high opacity for visibility
          this.placementHighlight.lineStyle(5, 0x00ffff, 0.95);
          this.placementHighlight.strokeRect(x + 2, y + 2, this.cellSize - 6, this.cellSize - 6);
        }
      }
    }
    this.children.bringToTop(this.placementHighlight);
  }
  create() {
    // Theme and initial state
    const theme = GameScene.getActiveTheme();
    const fontFamily = 'Poppins, Montserrat, Arial, sans-serif';
    // Read scene data for endless mode
    const data = this.scene.settings.data || {};
    const mode = data.mode || GameScene.GAME_MODE;
    const packIdx = typeof data.packIdx === 'number' ? data.packIdx : undefined;
    const puzzleId = typeof data.puzzleId === 'number' ? data.puzzleId : undefined;

    this.gridSize = 10;
    this.cellSize = 60;
    this.gridOrigin = { x: 120, y: 120 };
    this.trayOrigin = { x: 120, y: 780 };
    this.gridState = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
    this.tray = new Tray(this, { gridSize: this.gridSize, cellSize: this.cellSize, trayOrigin: this.trayOrigin });
  this.score = 0;
  // Use bestScoreEasy or bestScoreDifficult from stats
  this.highScore = (GameScene.DIFFICULTY === 'easy' ? STATS.bestScoreEasy : STATS.bestScoreDifficult) || 0;
  this.gridGraphics = this.add.graphics();
  // Set vibrant background
  this.cameras.main.setBackgroundColor(theme.background);
  // Score and high score text
  this.scoreText = this.add.text(40, 30, 'Score: 0', { fontFamily, fontSize: 32, color: theme.text, fontStyle: 'bold', shadow: { offsetX: 2, offsetY: 2, color: theme.background, blur: 8, stroke: true } });
  this.highScoreText = this.add.text(40, 70, 'High Score: ' + this.highScore, { fontFamily, fontSize: 24, color: theme.text, fontStyle: 'bold', shadow: { offsetX: 1, offsetY: 1, color: theme.background, blur: 6, stroke: true } });

  // --- Speaker Icon for Audio Toggle ---
  this.isAudioOn = true;
  this.speakerIcon = this.add.text(800, 40, '🔊', {
    fontFamily,
    fontSize: 32,
    color: theme.text,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: { left: 10, right: 10, top: 6, bottom: 6 },
    borderRadius: 16
  }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
  this.speakerIcon.on('pointerdown', () => {
    this.isAudioOn = !this.isAudioOn;
    this.speakerIcon.setText(this.isAudioOn ? '🔊' : '🔇');
    // Mute/unmute all game audio
    if (this.sound) {
      this.sound.mute = !this.isAudioOn;
    }
  });
  // Set initial mute state (in case of reload)
  if (this.sound) {
    this.sound.mute = !this.isAudioOn;
  }
    // Coin display (modern gold, never clips grid)
    import('./powerups.js').then(module => {
      this.coinText = this.add.text(860, 40, '⭑ ' + (module.getCoins ? module.getCoins() : 0), {
        fontFamily,
        fontSize: 28,
        color: '#FFD700',
        fontStyle: 'bold',
        backgroundColor: 'rgba(255,255,255,0.08)',
        padding: { left: 18, right: 18, top: 8, bottom: 8 },
        borderRadius: 16
      }).setOrigin(1, 0);
      this.children.bringToTop(this.coinText);
      this.children.bringToTop(this.speakerIcon);
      this.updateCoinDisplay = () => {
        import('./powerups.js').then(mod => {
          this.coinText.setText('⭑ ' + (mod.getCoins ? mod.getCoins() : 0));
        });
      };
      // Power-up UI panel: Row (N), Swap (N), Undo (N) as modern buttons
      const panelBg = this.add.rectangle(820, 220, 200, 170, theme.overlay, theme.overlayAlpha).setOrigin(0.5);
      const typeLabels = { CLEAR_ROW: 'Row', SWAP_TRAY: 'Swap', EXTRA_UNDO: 'Undo' };
      const yStart = 180;
      const yStep = 44;
      this.powerupButtons = {};
      Object.keys(module.POWERUP_TYPES).forEach((type, idx) => {
        const count = module.getPowerupCount(type);
        const label = `${typeLabels[type] || type} (${count})`;
        const btn = this.add.text(820, yStart + idx * yStep, label, {
          fontFamily,
          fontSize: 22,
          color: count > 0 ? theme.button.background : '#aaa',
          backgroundColor: count > 0 ? theme.button.color : '#eee',
          fontStyle: 'bold',
          padding: { left: 22, right: 22, top: 10, bottom: 10 },
          borderRadius: 16
        }).setOrigin(0.5);
        btn.setInteractive({ useHandCursor: true });
        if (count === 0) {
          btn.setAlpha(0.5);
          btn.disableInteractive();
        } else {
          btn.setAlpha(1);
          btn.on('pointerdown', () => {
            import('./powerups.js').then(mod => {
              if (mod.getPowerupCount(type) > 0) {
                mod.usePowerup(type);
                // Action for each powerup
                if (type === 'CLEAR_ROW') {
                  this.powerupRowActive = true;
                  if (this.powerupPromptOverlay) this.powerupPromptOverlay.destroy();
                  this.powerupPromptOverlay = this.add.rectangle(450, 450, 500, 80, theme.overlay, 0.92).setOrigin(0.5);
                  this.powerupPromptText = this.add.text(450, 450, 'Click a row to clear (Power-Up)', { fontFamily, fontSize: 22, color: theme.button.color, backgroundColor: theme.overlay, padding: { left: 12, right: 12, top: 6, bottom: 6 } }).setOrigin(0.5);
                  this.children.bringToTop(this.powerupPromptOverlay);
                  this.children.bringToTop(this.powerupPromptText);
                } else if (type === 'SWAP_TRAY') {
                  if (this.tray && this.tray.trayShapes) {
                    this.tray.trayShapes = [getRandomShape(), getRandomShape(), getRandomShape()];
                    this.tray.drawTray();
                    this.tray.renderTrayShapes();
                  }
                } else if (type === 'EXTRA_UNDO') {
                  this.undoMove();
                }
                this.updatePowerupDisplay();
              }
            });
          });
        }
        this.powerupButtons[type] = btn;
      });
      this.updatePowerupDisplay = () => {
        import('./powerups.js').then(mod => {
          Object.keys(module.POWERUP_TYPES).forEach(type => {
            const count = mod.getPowerupCount(type);
            const btn = this.powerupButtons[type];
            btn.setText(`${typeLabels[type] || type} (${count})`);
            btn.setAlpha(count > 0 ? 1 : 0.5);
            if (count > 0) btn.setInteractive({ useHandCursor: true });
            else btn.disableInteractive();
          });
        });
      };
      this.children.bringToTop(panelBg);
      Object.values(this.powerupButtons).forEach(btn => this.children.bringToTop(btn));

      // Listen for grid clicks for power-up row clear
      this.input.on('pointerdown', pointer => {
        if (this.powerupRowActive) {
          const gridY = Math.floor((pointer.y - this.gridOrigin.y) / this.cellSize);
          if (gridY >= 0 && gridY < this.gridSize) {
            for (let c = 0; c < this.gridSize; c++) this.gridState[gridY][c] = 0;
            this.redrawGridBlocks();
            this.powerupRowActive = false;
            if (this.powerupPromptOverlay) this.powerupPromptOverlay.destroy();
            if (this.powerupPromptText) this.powerupPromptText.destroy();
            if (this.updatePowerupDisplay) this.updatePowerupDisplay();
          }
        }
      });
    });
    const sfx = Sound.create(this);
    this.sfxPlace = sfx.sfxPlace;
    this.sfxClear = sfx.sfxClear;
    this.sfxGameOver = sfx.sfxGameOver;
    Input.setup(this);
    this.dragData = null;
    this.updateOptionsDisplay();
    window.DIFFICULTY = GameScene.DIFFICULTY;

    // Endless mode logic
    if (isEndlessMode && isEndlessMode()) {
      enableEndlessMode();
      this.drawGrid();
      this.tray.drawTray();
      this.tray.renderTrayShapes();
      // Helper to check if any move is possible (original logic)
      this._canAnyMove = () => {
        for (let i = 0; i < this.tray.trayShapes.length; i++) {
          const shape = this.tray.trayShapes[i];
          if (!shape || typeof shape !== 'object' || !Array.isArray(shape.pattern) || !Array.isArray(shape.pattern[0])) continue;
          for (let r = 0; r <= this.gridSize - shape.pattern.length; r++) {
            for (let c = 0; c <= this.gridSize - shape.pattern[0].length; c++) {
              if (this.canPlaceShapeAt(shape, r, c)) return true;
            }
          }
        }
        return false;
      };
      // Override anyMovePossible to show stuck overlay if no moves
      this.anyMovePossible = () => {
        if (!this._canAnyMove()) {
          this.showEndlessStuckOverlay();
          return false;
        }
        return true;
      };
      // Overlay for stuck state in endless mode
      this.showEndlessStuckOverlay = () => {
        if (this.endlessStuckOverlay) return;
        const theme = GameScene.getActiveTheme();
        this.endlessStuckOverlay = this.add.rectangle(450, 450, 500, 320, theme.overlay, theme.overlayAlpha).setOrigin(0.5);
        this.endlessStuckText = this.add.text(450, 340, 'No moves left! Remove a row, column, or block?', {
          fontSize: 24,
          color: '#ffd700',
          backgroundColor: '#222',
          padding: { left: 16, right: 16, top: 8, bottom: 8 }
        }).setOrigin(0.5);
        // Remove Row button
        this.removeRowButton = this.add.text(300, 420, 'Remove Row (-5 coins)', {
          fontSize: 22,
          color: '#fff',
          backgroundColor: '#444',
          padding: { left: 16, right: 16, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive();
        this.removeRowButton.on('pointerdown', () => {
          this.destroyEndlessStuckOverlay();
          this.promptRemove('row');
        });
        // Remove Column button
        this.removeColButton = this.add.text(600, 420, 'Remove Column (-5 coins)', {
          fontSize: 22,
          color: '#fff',
          backgroundColor: '#444',
          padding: { left: 16, right: 16, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive();
        this.removeColButton.on('pointerdown', () => {
          this.destroyEndlessStuckOverlay();
          this.promptRemove('col');
        });
        // Remove Block button
        this.removeBlockButton = this.add.text(450, 500, 'Remove Block (-2 coins)', {
          fontSize: 22,
          color: '#fff',
          backgroundColor: '#444',
          padding: { left: 16, right: 16, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive();
        this.removeBlockButton.on('pointerdown', () => {
          this.destroyEndlessStuckOverlay();
          this.promptRemove('block');
        });
        // Close button
        this.closeStuckButton = this.add.text(450, 570, 'Cancel', {
          fontSize: 20,
          color: '#fff',
          backgroundColor: '#222',
          padding: { left: 24, right: 24, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive();
        this.closeStuckButton.on('pointerdown', () => {
          this.destroyEndlessStuckOverlay();
          // Optionally, show restart and main menu options for full escape
          if (!this.stuckEscapeOverlay) {
            const theme = GameScene.getActiveTheme();
            this.stuckEscapeOverlay = this.add.rectangle(450, 700, 400, 120, theme.overlay, theme.overlayAlpha).setOrigin(0.5);
            this.stuckRestartButton = this.add.text(320, 700, 'Restart', {
              fontSize: 20,
              color: '#fff',
              backgroundColor: '#444',
              padding: { left: 24, right: 24, top: 10, bottom: 10 }
            }).setOrigin(0.5).setInteractive();
            this.stuckRestartButton.on('pointerdown', () => {
              this.destroyEndlessStuckOverlay();
              if (this.stuckEscapeOverlay) this.stuckEscapeOverlay.destroy();
              if (this.stuckRestartButton) this.stuckRestartButton.destroy();
              if (this.stuckMainMenuButton) this.stuckMainMenuButton.destroy();
              this.stuckEscapeOverlay = null;
              this.stuckRestartButton = null;
              this.stuckMainMenuButton = null;
              this.restartGame();
            });
            this.stuckMainMenuButton = this.add.text(580, 700, 'Main Menu', {
              fontSize: 20,
              color: '#fff',
              backgroundColor: '#444',
              padding: { left: 24, right: 24, top: 10, bottom: 10 }
            }).setOrigin(0.5).setInteractive();
            this.stuckMainMenuButton.on('pointerdown', () => {
              this.destroyEndlessStuckOverlay();
              if (this.stuckEscapeOverlay) this.stuckEscapeOverlay.destroy();
              if (this.stuckRestartButton) this.stuckRestartButton.destroy();
              if (this.stuckMainMenuButton) this.stuckMainMenuButton.destroy();
              this.stuckEscapeOverlay = null;
              this.stuckRestartButton = null;
              this.stuckMainMenuButton = null;
              this.scene.start('MainMenu');
            });
            this.children.bringToTop(this.stuckEscapeOverlay);
            this.children.bringToTop(this.stuckRestartButton);
            this.children.bringToTop(this.stuckMainMenuButton);
          }
        });
        // Always bring overlay and menu to top
        this.children.bringToTop(this.endlessStuckOverlay);
        this.children.bringToTop(this.endlessStuckText);
        this.children.bringToTop(this.removeRowButton);
        this.children.bringToTop(this.removeColButton);
        this.children.bringToTop(this.removeBlockButton);
        this.children.bringToTop(this.closeStuckButton);
        // New: Click-to-remove for row/col/block
        this.promptRemove = (type) => {
          const theme = GameScene.getActiveTheme();
          let promptOverlay = this.add.rectangle(450, 450, 500, 320, theme.overlay, theme.overlayAlpha).setOrigin(0.5);
          let promptText = this.add.text(450, 340, '', {
            fontSize: 24,
            color: '#ffd700',
            backgroundColor: '#222',
            padding: { left: 16, right: 16, top: 8, bottom: 8 }
          }).setOrigin(0.5);
          if (type === 'row') {
            promptText.setText('Click a row to remove (-2 coins, -10 score)');
            let rowRects = [];
            for (let r = 0; r < this.gridSize; r++) {
              let rect = this.add.rectangle(450, this.gridOrigin.y + r * this.cellSize + this.cellSize / 2, this.gridSize * this.cellSize, this.cellSize, 0xff0000, 0.15).setOrigin(0.5).setInteractive();
              rect.on('pointerdown', () => {
                import('./powerups.js').then(module => {
                  let coins = module.getCoins ? module.getCoins() : 0;
                  if (coins < 2 || this.score < 10) {
                    alert('Not enough coins or score!');
                    promptOverlay.destroy();
                    promptText.destroy();
                    rowRects.forEach(rr => rr.destroy());
                    this.showEndlessStuckOverlay();
                    return;
                  }
                  module.spendCoins(2);
                  this.score -= 10;
                  if (this.scoreText) this.scoreText.setText('Score: ' + this.score);
                  for (let c = 0; c < this.gridSize; c++) this.gridState[r][c] = 0;
                  if (this.updateCoinDisplay) this.updateCoinDisplay();
                  this.redrawGridBlocks();
                  promptOverlay.destroy();
                  promptText.destroy();
                  rowRects.forEach(rr => rr.destroy());
                  if (!this._canAnyMove()) {
                    this.showEndlessStuckOverlay();
                  }
                });
              });
              rowRects.push(rect);
            }
          } else if (type === 'col') {
            promptText.setText('Click a column to remove (-2 coins, -10 score)');
            let colRects = [];
            for (let c = 0; c < this.gridSize; c++) {
              let rect = this.add.rectangle(this.gridOrigin.x + c * this.cellSize + this.cellSize / 2, 450, this.cellSize, this.gridSize * this.cellSize, 0x00ff00, 0.15).setOrigin(0.5).setInteractive();
              rect.on('pointerdown', () => {
                import('./powerups.js').then(module => {
                  let coins = module.getCoins ? module.getCoins() : 0;
                  if (coins < 2 || this.score < 10) {
                    alert('Not enough coins or score!');
                    promptOverlay.destroy();
                    promptText.destroy();
                    colRects.forEach(cr => cr.destroy());
                    this.showEndlessStuckOverlay();
                    return;
                  }
                  module.spendCoins(2);
                  this.score -= 10;
                  if (this.scoreText) this.scoreText.setText('Score: ' + this.score);
                  for (let r = 0; r < this.gridSize; r++) this.gridState[r][c] = 0;
                  if (this.updateCoinDisplay) this.updateCoinDisplay();
                  this.redrawGridBlocks();
                  promptOverlay.destroy();
                  promptText.destroy();
                  colRects.forEach(cr => cr.destroy());
                  if (!this._canAnyMove()) {
                    this.showEndlessStuckOverlay();
                  }
                });
              });
              colRects.push(rect);
            }
            if (type === 'row') {
              promptText.setText('Click a row to remove');
              let rowRects = [];
            for (let r = 0; r < this.gridSize; r++) {
              let rect = this.add.rectangle(450, this.gridOrigin.y + r * this.cellSize + this.cellSize / 2, this.gridSize * this.cellSize, this.cellSize, 0xff0000, 0.15).setOrigin(0.5).setInteractive();
              rect.on('pointerdown', () => {
                // If called from power-up, don't check coins/score, just clear
                if (arguments.length > 1 && arguments[1] === true) {
                  for (let c = 0; c < this.gridSize; c++) this.gridState[r][c] = 0;
                  this.redrawGridBlocks();
                  promptOverlay.destroy();
                  promptText.destroy();
                  rowRects.forEach(rr => rr.destroy());
                  if (this.updatePowerupDisplay) this.updatePowerupDisplay();
                  return;
                }
                import('./powerups.js').then(module => {
                  let coins = module.getCoins ? module.getCoins() : 0;
                  if (coins < 2 || this.score < 10) {
                    alert('Not enough coins or score!');
                    promptOverlay.destroy();
                    promptText.destroy();
                    rowRects.forEach(rr => rr.destroy());
                    this.showEndlessStuckOverlay();
                    return;
                  }
                  module.spendCoins(2);
                  this.score = Math.max(0, this.score - 10);
                  if (this.scoreText) this.scoreText.setText('Score: ' + this.score);
                  for (let c = 0; c < this.gridSize; c++) this.gridState[r][c] = 0;
                  if (this.updateCoinDisplay) this.updateCoinDisplay();
                  this.redrawGridBlocks();
                  promptOverlay.destroy();
                  promptText.destroy();
                  rowRects.forEach(rr => rr.destroy());
                  if (!this._canAnyMove()) {
                    this.showEndlessStuckOverlay();
                  }
                });
              });
              rowRects.push(rect);
              }
            }
          }
        };
      };
      this.destroyEndlessStuckOverlay = () => {
        if (this.endlessStuckOverlay) this.endlessStuckOverlay.destroy();
        if (this.endlessStuckText) this.endlessStuckText.destroy();
        if (this.removeRowButton) this.removeRowButton.destroy();
        if (this.removeColButton) this.removeColButton.destroy();
        if (this.removeBlockButton) this.removeBlockButton.destroy();
        if (this.closeStuckButton) this.closeStuckButton.destroy();
        if (this.stuckEscapeOverlay) this.stuckEscapeOverlay.destroy();
        if (this.stuckRestartButton) this.stuckRestartButton.destroy();
        if (this.stuckMainMenuButton) this.stuckMainMenuButton.destroy();
        this.endlessStuckOverlay = null;
        this.endlessStuckText = null;
        this.removeRowButton = null;
        this.removeColButton = null;
        this.removeBlockButton = null;
        this.closeStuckButton = null;
        this.stuckEscapeOverlay = null;
        this.stuckRestartButton = null;
        this.stuckMainMenuButton = null;
      };
      // Prompt for which row/col/block to remove
      this.promptRowColBlock = (type) => {
        this.destroyEndlessStuckOverlay();
        let promptText = '';
        if (type === 'row') promptText = 'Enter row (1-10) to remove:';
        else if (type === 'col') promptText = 'Enter column (1-10) to remove:';
        else promptText = 'Click a block to remove.';
        this.endlessPromptOverlay = this.add.rectangle(450, 450, 400, 180, 0x222222, 0.9).setOrigin(0.5);
        this.endlessPromptText = this.add.text(450, 420, promptText, {
          fontSize: 22,
          color: '#ffd700',
          backgroundColor: '#222',
          padding: { left: 12, right: 12, top: 6, bottom: 6 }
        }).setOrigin(0.5);
        if (type === 'row' || type === 'col') {
          // Simple input: use browser prompt for now
          let idx = parseInt(prompt(promptText));
          if (isNaN(idx) || idx < 1 || idx > 10) {
            alert('Invalid input.');
            this.endlessPromptOverlay.destroy();
            this.endlessPromptText.destroy();
            return;
          }
          import('./powerups.js').then(module => {
            let coins = module.getCoins ? module.getCoins() : 0;
            if (coins < 5) {
              alert('Not enough coins!');
              this.endlessPromptOverlay.destroy();
              this.endlessPromptText.destroy();
              return;
            }
            module.spendCoins(5);
            if (type === 'row') {
              for (let c = 0; c < this.gridSize; c++) this.gridState[idx - 1][c] = 0;
            } else {
              for (let r = 0; r < this.gridSize; r++) this.gridState[r][idx - 1] = 0;
            }
            if (this.updateCoinDisplay) this.updateCoinDisplay();
            this.redrawGridBlocks();
            this.endlessPromptOverlay.destroy();
            this.endlessPromptText.destroy();
          });
        } else if (type === 'block') {
          // Click a block to remove
          this.endlessPromptText.setText('Click a block to remove (-2 coins)');
          this.input.once('pointerdown', pointer => {
            const gridX = Math.floor((pointer.x - this.gridOrigin.x) / this.cellSize);
            const gridY = Math.floor((pointer.y - this.gridOrigin.y) / this.cellSize);
            if (gridX < 0 || gridX >= this.gridSize || gridY < 0 || gridY >= this.gridSize) {
              this.endlessPromptOverlay.destroy();
              this.endlessPromptText.destroy();
              return;
            }
            import('./powerups.js').then(module => {
              let coins = module.getCoins ? module.getCoins() : 0;
              if (coins < 2) {
                alert('Not enough coins!');
                this.endlessPromptOverlay.destroy();
                this.endlessPromptText.destroy();
                return;
              }
              module.spendCoins(2);
              this.gridState[gridY][gridX] = 0;
              if (this.updateCoinDisplay) this.updateCoinDisplay();
              this.redrawGridBlocks();
              this.endlessPromptOverlay.destroy();
              this.endlessPromptText.destroy();
            });
          });
        }
      };
      // Optionally, show endless mode banner
      this.endlessBanner = this.add.text(450, 40, 'Endless Mode', {
        fontSize: 28,
        color: '#0ff',
        backgroundColor: '#222',
        fontStyle: 'bold',
        padding: { left: 16, right: 16, top: 8, bottom: 8 }
      }).setOrigin(0.5);
      this.children.bringToTop(this.endlessBanner);
      return;
    }

    // If puzzle mode and valid puzzleId/packIdx, start correct puzzle
    if (mode === 'puzzle') {
      if (typeof packIdx === 'number' && typeof puzzleId === 'number') {
        this.startPuzzle(puzzleId, packIdx);
        return;
      } else {
        // If puzzle mode but no puzzle selected, show puzzle pack menu
        this.showPuzzlePackMenu();
        return;
      }
    }
    // Otherwise, normal game start
    this.drawGrid();
    this.tray.drawTray();
    this.tray.renderTrayShapes();
  }
  // Remove duplicate static/class property declarations outside the class body

  constructor() {
    super('GameScene');
    this.moveHistory = [];
    this.redoHistory = [];
    this.lastPointerDown = null;
    this.gameStarted = false;
  }

  // Removed duplicate create() method. Only the correct modular version remains below.
  undoMove() {
    // Remove any invalid entries from the end of moveHistory
    while (this.moveHistory.length && (!this.moveHistory[this.moveHistory.length - 1].gridState || !this.moveHistory[this.moveHistory.length - 1].trayShapes)) {
      this.moveHistory.pop();
    }
    if (!this.moveHistory.length) {
      alert('No move to undo!');
      return;
    }
    const prev = this.moveHistory.pop();
    try {
      this.gridState = JSON.parse(JSON.stringify(prev.gridState));
      this.tray.trayShapes = JSON.parse(JSON.stringify(prev.trayShapes));
    } catch (e) {
      alert('Undo failed: could not restore previous state.');
      console.error('UndoMove: Failed to restore state:', e, prev);
      return;
    }
    this.score = prev.score || 0;
    this.highScore = prev.highScore || 0;
    if (this.scoreText) this.scoreText.setText('Score: ' + this.score);
    if (this.highScoreText) this.highScoreText.setText('High Score: ' + this.highScore);
    if (this.sfxPlace) this.sfxPlace.play();
    this.redrawGridBlocks();
    this.tray.drawTray();
    this.tray.renderTrayShapes();
  }
  // Track if game has started
  // gameStarted is initialized in constructor
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
    // Destroy previous grid blocks
    if (this.gridBlocks) { this.gridBlocks.forEach(b => b.destroy()); }
    this.gridBlocks = [];
    // Draw new grid blocks for filled cells
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
  drawGrid() {
    const theme = GameScene.getActiveTheme();
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(2, theme.gridLine, theme.gridLineAlpha);
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        this.gridGraphics.strokeRect(this.gridOrigin.x + c * this.cellSize, this.gridOrigin.y + r * this.cellSize, this.cellSize, this.cellSize);
      }
    }
  }

  // Helper: Place shape on grid
  placeShapeAt(shape, gridRow, gridCol) {
    // Ensure moveHistory is initialized and cleared on game start/reset
    if (!this.moveHistory || !Array.isArray(this.moveHistory)) {
      this.moveHistory = [];
    }
    // Block moves if puzzle is completed
    if (this.puzzleActive === false) return;
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
    // Save a full game state snapshot for undo
    this.moveHistory.push({
      gridState: JSON.parse(JSON.stringify(this.gridState)),
      trayShapes: JSON.parse(JSON.stringify(this.tray.trayShapes)),
      score: this.score,
      coins: this.coinText ? parseInt(this.coinText.text.replace(/\D/g, '')) : 0,
  powerups: window.localStorage.getItem('timbertiles_powerups'),
      // Add any other relevant state here
    });
    this.redoHistory = [];
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[0].length; c++) {
        if (pattern[r][c]) {
          const gr = gridRow + r;
          const gc = gridCol + c;
          this.gridState[gr][gc] = shape.color;
          // New effect: sparkle burst and larger glow on block placement
          const x = this.gridOrigin.x + gc * this.cellSize + this.cellSize / 2;
          const y = this.gridOrigin.y + gr * this.cellSize + this.cellSize / 2;
          Effects.showGlowEffect(this, x, y, shape.color, this.cellSize / 1.5, 500);
          Effects.showSparkleBurst ? Effects.showSparkleBurst(this, x, y, shape.color, 12, 10, 600) : Effects.showGlowEffect(this, x, y, 0xffffff, this.cellSize / 2, 400);
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
    this.checkPuzzleCompletion();
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
    // Prevent game over overlay in endless mode
    if (isEndlessMode && isEndlessMode()) {
      // Instead, show stuck overlay if not already shown
      if (this.showEndlessStuckOverlay) this.showEndlessStuckOverlay();
      return;
    }
    // ...existing code for normal/daily/puzzle modes...
    const theme = GameScene.getActiveTheme();
    if (this.gameOverOverlay) return;
    if (this.sfxGameOver) this.sfxGameOver.play();
    STATS.totalGames++;
    if (GameScene.DIFFICULTY === 'easy') {
      if (this.score > (STATS.bestScoreEasy || 0)) STATS.bestScoreEasy = this.score;
    } else {
      if (this.score > (STATS.bestScoreDifficult || 0)) STATS.bestScoreDifficult = this.score;
    }
    STATS.lastPlayed = new Date().toISOString();
    saveStats(STATS);
    this.gameOverOverlay = this.add.rectangle(450, 450, 700, 400, theme.overlay, theme.overlayAlpha).setOrigin(0.5);
    Effects.showGlowEffect(this, 450, 450, theme.button.color, 400, 2500);
    Effects.showConfettiBurst ? Effects.showConfettiBurst(this, 450, 450, theme.button.color, 60, 30, 2500) : Effects.showParticleBurst(this, 450, 450, theme.button.color, 60, 30, 2500);
    if (this.cameras && this.cameras.main) {
      this.cameras.main.shake(800, 0.01);
    }
    this.gameOverText = this.add.text(450, 400, 'Game Over!', { fontFamily: 'Arial', fontSize: 72, color: theme.text, fontStyle: 'bold' }).setOrigin(0.5);
    this.restartButton = this.add.text(450, 520, 'Restart', { fontFamily: 'Arial', fontSize: 40, color: theme.button.color, backgroundColor: theme.button.background, padding: { left: 32, right: 32, top: 16, bottom: 16 } }).setOrigin(0.5).setInteractive();
    this.restartButton.on('pointerdown', () => {
      this.restartGame();
    });
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
    // If restarting after game over, increment totalGames and save
    STATS.totalGames++;
    saveStats(STATS);
    // Reset optionsText reference to avoid accessing destroyed object
    this.optionsText = null;
    this.updateOptionsDisplay();
    this.hideGameOverOverlay();
    this.gridState = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
    this.tray.trayShapes = [getRandomShape(), getRandomShape(), getRandomShape()];
    this.score = 0;
    this.scoreText.setText('Score: 0');
    this.drawGrid();
    this.tray.drawTray();
    this.tray.renderTrayShapes();
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
    // Do not push partial clear actions to moveHistory; only push full game state snapshots for undo
    this.redoHistory = [];
    if (linesCleared > 0) {
      STATS.totalLines += linesCleared;
      saveStats(STATS);
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
          this.addScore(bonus);
          if (GameScene.DIFFICULTY === 'easy') {
            if (this.score > (STATS.bestScoreEasy || 0)) {
              STATS.bestScoreEasy = this.score;
              this.highScore = this.score;
              this.highScoreText.setText('High Score: ' + this.highScore);
              saveStats(STATS);
            }
          } else {
            if (this.score > (STATS.bestScoreDifficult || 0)) {
              STATS.bestScoreDifficult = this.score;
              this.highScore = this.score;
              this.highScoreText.setText('High Score: ' + this.highScore);
              saveStats(STATS);
            }
          }
          this.redrawGridBlocks();
          // Check puzzle completion after clearing lines
          this.checkPuzzleCompletion();
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


import { MainMenu } from './mainmenu.js';
const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 900,
  backgroundColor: '#222',
  parent: 'game-container',
  scene: [MainMenu, GameScene]
};
new Phaser.Game(config);
