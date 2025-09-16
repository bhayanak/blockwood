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
    const previousScore = this.score;
    this.score += points;
    if (this.scoreText) this.scoreText.setText('Score: ' + this.score);

    // Award 1 coin per 100 points earned (not total score)
    const coinsEarnedBefore = Math.floor(previousScore / 100);
    const coinsEarnedAfter = Math.floor(this.score / 100);
    const coinsToAdd = coinsEarnedAfter - coinsEarnedBefore;

    if (coinsToAdd > 0) {
      import('./powerups.js').then(module => {
        if (module.addCoins) {
          module.addCoins(coinsToAdd);
        }
        // Always refresh coin display from localStorage
        if (this.updateCoinDisplay) {
          this.updateCoinDisplay();
        }
      });
    }
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
    const width = this.sys.game.config.width;
    const centerX = width / 2;
    const isMobile = width < 600;

    // Modern styled overlay with gradient background
    this.puzzlePackOverlay = this.add.rectangle(centerX, 450, isMobile ? width - 40 : 500, 400, 0x1a1a2e, 0.95).setOrigin(0.5);
    this.puzzlePackOverlay.setStrokeStyle(3, 0x16213e);
    this.add.graphics()
      .fillGradientStyle(0x2c3e50, 0x34495e, 0x2c3e50, 0x34495e)
      .fillRoundedRect(centerX - (isMobile ? (width - 40) / 2 : 250), 252, isMobile ? width - 44 : 496, 396, 12);

    this.puzzlePackTitle = this.add.text(centerX, 300, 'Puzzle Packs', {
      fontFamily: 'Poppins, Arial, sans-serif',
      fontSize: isMobile ? 28 : 36,
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 2, offsetY: 2, color: theme.button.color, blur: 6, stroke: true }
    }).setOrigin(0.5);
    const unlockedPacks = getUnlockedPacks();
    let y = 360;
    const buttonColors = [
      { primary: 0xe91e63, secondary: 0xf06292 }, // Pink
      { primary: 0x00bcd4, secondary: 0x4dd0e1 }, // Cyan
      { primary: 0x4caf50, secondary: 0x81c784 }  // Green
    ];

    unlockedPacks.forEach((pack, idx) => {
      const label = pack.unlocked ? pack.name : `${pack.name} (Locked)`;
      const colors = buttonColors[idx % buttonColors.length];

      // Create gradient background for pack button
      if (pack.unlocked) {
        const btnBg = this.add.rectangle(centerX, y, isMobile ? width - 100 : 300, 40, colors.primary, 1).setOrigin(0.5);
        btnBg.setStrokeStyle(2, colors.secondary);
        this.add.graphics()
          .fillGradientStyle(colors.primary, colors.secondary, colors.primary, colors.secondary)
          .fillRoundedRect(centerX - (isMobile ? (width - 100) / 2 : 150), y - 18, isMobile ? width - 104 : 296, 36, 8);
      }

      const btn = this.add.text(centerX, y, label, {
        fontSize: isMobile ? 18 : 22,
        fontFamily: 'Poppins, Arial, sans-serif',
        color: pack.unlocked ? '#ffffff' : '#888',
        fontStyle: 'bold',
        shadow: pack.unlocked ? { offsetX: 1, offsetY: 1, color: 'rgba(0,0,0,0.3)', blur: 2, stroke: false } : undefined
      }).setOrigin(0.5).setInteractive();
      if (pack.unlocked) {
        btn.on('pointerdown', () => {
          this.showPuzzleSelectionMenu(idx);
        });
      }
      this.puzzlePackButtons.push(btn);
      y += 50;
    });
    // Add Close button with modern styling
    const closeBg = this.add.rectangle(centerX, 580, 120, 36, 0x6610f2, 1).setOrigin(0.5);
    closeBg.setStrokeStyle(2, 0x8d3cff);
    this.add.graphics()
      .fillGradientStyle(0x6610f2, 0x8d3cff, 0x6610f2, 0x8d3cff)
      .fillRoundedRect(centerX - 58, 564, 116, 32, 8);

    this.puzzlePackCloseButton = this.add.text(centerX, 580, 'Close', {
      fontSize: isMobile ? 18 : 20,
      fontFamily: 'Poppins, Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: 'rgba(0,0,0,0.3)', blur: 2, stroke: false }
    }).setOrigin(0.5).setInteractive();
    this.puzzlePackCloseButton.on('pointerdown', () => {
      if (this.puzzlePackOverlay) { this.puzzlePackOverlay.destroy(); this.puzzlePackOverlay = null; }
      if (this.puzzlePackTitle) { this.puzzlePackTitle.destroy(); this.puzzlePackTitle = null; }
      if (this.puzzlePackButtons) { this.puzzlePackButtons.forEach(b => b.destroy()); }
      if (this.resetProgressButton) { this.resetProgressButton.destroy(); this.resetProgressButton = null; }
      if (this.puzzlePackCloseButton) { this.puzzlePackCloseButton.destroy(); this.puzzlePackCloseButton = null; }
    });
    // Add Reset Progress button with modern red gradient styling
    const resetBg = this.add.rectangle(centerX, 620, 160, 36, 0xdc3545, 1).setOrigin(0.5);
    resetBg.setStrokeStyle(2, 0xff6b6b);
    this.add.graphics()
      .fillGradientStyle(0xdc3545, 0xff6b6b, 0xdc3545, 0xff6b6b)
      .fillRoundedRect(centerX - 78, 604, 156, 32, 8);

    this.resetProgressButton = this.add.text(centerX, 620, 'Reset Progress', {
      fontSize: isMobile ? 16 : 18,
      fontFamily: 'Poppins, Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: 'rgba(0,0,0,0.3)', blur: 2, stroke: false }
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
  updateResponsiveLayout() {
  // Enhanced responsive UI helpers with better font sizing for all screen sizes
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;
    const isMobile = width < 600;
    const isSmallMobile = width < 400;
    const isWideScreen = width > 1200;

    // Scale font sizes based on screen width for better desktop experience
    const baseFontScale = isMobile ? width * 0.001 : Math.max(1, width * 0.0008);
    const scoreFontSize = isMobile ? Math.round(width * 0.035) : Math.round(24 * baseFontScale);
    const highScoreFontSize = isMobile ? Math.round(width * 0.025) : Math.round(18 * baseFontScale);
    const coinFontSize = isMobile ? Math.round(width * 0.03) : Math.round(20 * baseFontScale);
    const speakerFontSize = isMobile ? Math.round(width * 0.03) : Math.round(24 * baseFontScale);

    const leftPad = isMobile ? (isSmallMobile ? 8 : 12) : (isWideScreen ? 60 : 40);
    const topPad = isMobile ? (isSmallMobile ? 8 : 10) : (isWideScreen ? 40 : 30);

    // Scale right-side element positions for wide screens with proper padding
    // Use larger padding on mobile to prevent clipping, especially on small screens
    const rightPadding = isMobile ? (isSmallMobile ? 80 : 60) : 40;
    const coinRight = isMobile ? width - rightPadding : (isWideScreen ? width - 200 : Math.min(width - 40, 860));
    const speakerRight = isMobile ? width - rightPadding - 50 : (isWideScreen ? width - 250 : Math.min(width - 100, 800));

    // Responsive grid and tray positioning with dramatically improved scaling
    this.gridSize = 10;
    // Much more aggressive scaling for better mobile vs desktop difference
    let baseCellSize;
    if (isSmallMobile) baseCellSize = Math.max(35, width * 0.08);
    else if (isMobile) baseCellSize = Math.max(45, width * 0.085);
    else if (isWideScreen) baseCellSize = Math.max(65, Math.min(95, width * 0.07));
    else baseCellSize = Math.max(55, width * 0.065);

    this.cellSize = Math.round(baseCellSize);
    const gridWidth = this.gridSize * this.cellSize;
    const gridHeight = this.gridSize * this.cellSize;

    // Center the grid horizontally and position it below the UI elements
    const gridTopMargin = isMobile ? (isSmallMobile ? 160 : 170) : (isWideScreen ? 120 : 130);

    // Ensure grid doesn't exceed screen bounds with proper padding
    const gridSidePadding = isMobile ? (isSmallMobile ? 10 : 15) : 20;
    const maxGridX = width - gridWidth - gridSidePadding;
    const centeredGridX = (width - gridWidth) / 2;

    this.gridOrigin = {
      x: Math.max(gridSidePadding, Math.min(centeredGridX, maxGridX)),
      y: gridTopMargin
    };

    // Position tray below the grid with responsive spacing
    const traySpacing = isMobile ? (isSmallMobile ? 30 : 35) : (isWideScreen ? 80 : 50);
    this.trayOrigin = {
      x: this.gridOrigin.x,
      y: this.gridOrigin.y + gridHeight + traySpacing
    };

    // Update tray if it exists
    if (this.tray) {
      this.tray.gridSize = this.gridSize;
      this.tray.cellSize = this.cellSize;
      this.tray.trayOrigin = this.trayOrigin;
      // Redraw tray with new dimensions
      this.tray.drawTray();
      this.tray.renderTrayShapes();
    }

    // Update UI element positions if they exist
    if (this.scoreText) {
      this.scoreText.setFontSize(scoreFontSize);
      this.scoreText.setPosition(leftPad, topPad);
    }
    if (this.highScoreText) {
      this.highScoreText.setFontSize(highScoreFontSize);
      this.highScoreText.setPosition(leftPad, topPad + (isMobile ? 30 : 35));
    }
    if (this.coinText) {
      this.coinText.setFontSize(coinFontSize);
      this.coinText.setPosition(coinRight, topPad, 1, 0);
    }
    if (this.speakerButton) {
      this.speakerButton.setFontSize(speakerFontSize);
      this.speakerButton.setPosition(speakerRight, topPad + (isMobile ? 30 : 35), 1, 0);
    }

    // Redraw grid with new dimensions
    if (this.gridGraphics) {
      this.drawGrid();
    }

    // Return layout values for initial setup
    return {
      width, height, isMobile, isSmallMobile, isWideScreen,
      scoreFontSize, highScoreFontSize, coinFontSize, speakerFontSize,
      leftPad, topPad, coinRight, speakerRight
    };
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

    // Initialize responsive layout
    const layout = this.updateResponsiveLayout();
    const { width, height, isMobile, isSmallMobile, isWideScreen, scoreFontSize, highScoreFontSize, coinFontSize, speakerFontSize, leftPad, topPad, coinRight, speakerRight } = layout;

    this.gridState = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
    this.tray = new Tray(this, { gridSize: this.gridSize, cellSize: this.cellSize, trayOrigin: this.trayOrigin });
    this.score = 0;
    // Use bestScoreEasy or bestScoreDifficult from stats
    this.highScore = (GameScene.DIFFICULTY === 'easy' ? STATS.bestScoreEasy : STATS.bestScoreDifficult) || 0;
    this.gridGraphics = this.add.graphics();
    // Set vibrant background with subtle animated particles
    this.cameras.main.setBackgroundColor(theme.background);

    // Add subtle floating particles for visual appeal
    this.backgroundParticles = [];
    for (let i = 0; i < 15; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, 900),
        Phaser.Math.Between(2, 6),
        0xffffff,
        0.1
      );
      this.backgroundParticles.push(particle);

      // Animate particles floating upward
      this.tweens.add({
        targets: particle,
        y: particle.y - 100,
        duration: Phaser.Math.Between(3000, 6000),
        ease: 'Power1',
        repeat: -1,
        yoyo: true,
        delay: Phaser.Math.Between(0, 2000)
      });

      // Add horizontal drift
      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-30, 30),
        duration: Phaser.Math.Between(2000, 4000),
        ease: 'Sine.easeInOut',
        repeat: -1,
        yoyo: true,
        delay: Phaser.Math.Between(0, 1000)
      });
    }
    // Score and high score text with modern design
    const scoreContainer = this.add.rectangle(leftPad + (isMobile ? 120 : 140), topPad + (scoreFontSize / 2) + 8, isMobile ? 240 : 280, scoreFontSize + 16, 0x1a1a2e, 0.9).setOrigin(0.5);
    scoreContainer.setStrokeStyle(2, 0x16213e);
    this.add.graphics()
      .fillGradientStyle(0x7209b7, 0xa663cc, 0x7209b7, 0xa663cc)
      .fillRoundedRect(leftPad + (isMobile ? 120 : 140) - (isMobile ? 118 : 138), topPad + 6, isMobile ? 236 : 276, scoreFontSize + 12, 8);

    this.scoreText = this.add.text(leftPad + (isMobile ? 120 : 140), topPad + (scoreFontSize / 2) + 8, 'Score: 0', {
      fontFamily,
      fontSize: scoreFontSize,
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: 'rgba(0,0,0,0.15)', blur: 3, stroke: false }
    }).setOrigin(0.5);

    const highScoreY = topPad + scoreFontSize + 30;
    const highScoreContainer = this.add.rectangle(leftPad + (isMobile ? 120 : 140), highScoreY + (highScoreFontSize / 2) + 6, isMobile ? 240 : 280, highScoreFontSize + 12, 0x0f3460, 0.9).setOrigin(0.5);
    highScoreContainer.setStrokeStyle(2, 0x16537e);
    this.add.graphics()
      .fillGradientStyle(0x2196f3, 0x64b5f6, 0x2196f3, 0x64b5f6)
      .fillRoundedRect(leftPad + (isMobile ? 120 : 140) - (isMobile ? 118 : 138), highScoreY + 2, isMobile ? 236 : 276, highScoreFontSize + 8, 6);

    this.highScoreText = this.add.text(leftPad + (isMobile ? 120 : 140), highScoreY + (highScoreFontSize / 2) + 6, 'High Score: ' + this.highScore, {
      fontFamily,
      fontSize: highScoreFontSize,
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: 'rgba(0,0,0,0.12)', blur: 3, stroke: false }
    }).setOrigin(0.5);

    // --- Speaker Icon for Audio Toggle with modern design ---
    this.isAudioOn = true;
    const speakerBg = this.add.rectangle(speakerRight - (speakerFontSize / 2) - 8, topPad + (speakerFontSize / 2) + 8, speakerFontSize + 16, speakerFontSize + 16, 0x1a1a2e, 0.9).setOrigin(1, 0);
    speakerBg.setStrokeStyle(2, 0x16213e);
    this.add.graphics()
      .fillGradientStyle(0xff6b35, 0xff8f65, 0xff6b35, 0xff8f65)
      .fillRoundedRect(speakerRight - speakerFontSize - 14, topPad + 2, speakerFontSize + 12, speakerFontSize + 12, 8);

    this.speakerIcon = this.add.text(speakerRight - (speakerFontSize / 2) - 8, topPad + (speakerFontSize / 2) + 8, '🔊', {
      fontFamily,
      fontSize: speakerFontSize,
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
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
    // Coin display with modern golden design
    import('./powerups.js').then(module => {
      const coinX = isMobile ? width - 16 : 860;
      const coinY = isMobile ? topPad + scoreFontSize + 70 : 90;
      const coinContainer = this.add.rectangle(coinX - 60, coinY + 14, 120, coinFontSize + 12, 0x1a1a2e, 0.9).setOrigin(1, 0);
      coinContainer.setStrokeStyle(2, 0x16213e);
      this.add.graphics()
        .fillGradientStyle(0xffd700, 0xffed4e, 0xffc107, 0xffab00)
        .fillRoundedRect(coinX - 118, coinY + 2, 116, coinFontSize + 8, 8);

      this.coinText = this.add.text(coinX - 60, coinY + 14, '⭑ ' + (module.getCoins ? module.getCoins() : 0), {
        fontFamily,
        fontSize: coinFontSize,
        color: '#1a1a2e',
        fontStyle: 'bold',
        shadow: { offsetX: 1, offsetY: 1, color: '#ffffff', blur: 2, stroke: true }
      }).setOrigin(0.5);
      this.children.bringToTop(this.coinText);
      this.children.bringToTop(this.speakerIcon);
      this.updateCoinDisplay = () => {
        import('./powerups.js').then(mod => {
          this.coinText.setText('⭑ ' + (mod.getCoins ? mod.getCoins() : 0));
        });
      };
      // Power-up UI panel with vibrant modern design
      const panelX = isMobile ? width - 110 : 820;
      const panelY = isMobile ? 280 : 220;
      const panelBg = this.add.rectangle(panelX, panelY, isMobile ? 180 : 200, 170, 0x1a1a2e, 0.95).setOrigin(0.5);
      panelBg.setStrokeStyle(3, 0x16213e);

      const typeLabels = { CLEAR_ROW: 'Row', SWAP_TRAY: 'Swap', EXTRA_UNDO: 'Undo' };
      const buttonColors = [
        { primary: 0xe91e63, secondary: 0xf06292 }, // Pink
        { primary: 0x00bcd4, secondary: 0x4dd0e1 }, // Cyan  
        { primary: 0x4caf50, secondary: 0x81c784 }  // Green
      ];
      const yStart = panelY - 60;
      const yStep = 44;
      this.powerupButtons = {};

      Object.keys(module.POWERUP_TYPES).forEach((type, idx) => {
        const count = module.getPowerupCount(type);
        const label = `${typeLabels[type] || type} (${count})`;
        const colors = buttonColors[idx];

        // Create gradient background for each button
        const btnBg = this.add.rectangle(panelX, yStart + idx * yStep, isMobile ? 160 : 180, 36, colors.primary, count > 0 ? 1 : 0.4).setOrigin(0.5);
        btnBg.setStrokeStyle(2, colors.secondary);
        this.add.graphics()
          .fillGradientStyle(colors.primary, colors.secondary, colors.primary, colors.secondary)
          .fillRoundedRect(panelX - (isMobile ? 78 : 88), yStart + idx * yStep - 16, isMobile ? 156 : 176, 32, 6);

        const btn = this.add.text(panelX, yStart + idx * yStep, label, {
          fontFamily,
          fontSize: isMobile ? 18 : 20,
          color: '#ffffff',
          fontStyle: 'bold',
          shadow: { offsetX: 1, offsetY: 1, color: 'rgba(0,0,0,0.12)', blur: 3, stroke: false }
        }).setOrigin(0.5);
        btn.setInteractive({ useHandCursor: true });
        // Add hover effects
        btn.on('pointerover', () => {
          if (count > 0) {
            btn.setScale(1.05);
            this.tweens.add({
              targets: btn,
              scaleX: 1.05,
              scaleY: 1.05,
              duration: 150,
              ease: 'Power2'
            });
          }
        });

        btn.on('pointerout', () => {
          btn.setScale(1);
          this.tweens.add({
            targets: btn,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: 'Power2'
          });
        });

        if (count === 0) {
          btn.setAlpha(0.5);
          btn.disableInteractive();
        } else {
          btn.setAlpha(1);
          btn.on('pointerdown', () => {
            // Add click animation
            this.tweens.add({
              targets: btn,
              scaleX: 0.95,
              scaleY: 0.95,
              duration: 100,
              yoyo: true,
              ease: 'Power2'
            });

            import('./powerups.js').then(mod => {
              if (mod.getPowerupCount(type) > 0) {
                mod.usePowerup(type);
                // Action for each powerup
                if (type === 'CLEAR_ROW') {
                  this.powerupRowActive = true;
                  if (this.powerupPromptOverlay) this.powerupPromptOverlay.destroy();

                  // Modern prompt design
                  this.powerupPromptOverlay = this.add.rectangle(width / 2, 450, 500, 80, 0x1a1a2e, 0.95).setOrigin(0.5);
                  this.powerupPromptOverlay.setStrokeStyle(3, 0x16213e);
                  this.add.graphics()
                    .fillGradientStyle(0x9c27b0, 0xba68c8, 0x9c27b0, 0xba68c8)
                    .fillRoundedRect(width / 2 - 248, 412, 496, 76, 8);

                  this.powerupPromptText = this.add.text(width / 2, 450, 'Click a row to clear (Power-Up)', {
                    fontFamily,
                    fontSize: 22,
                    color: '#ffffff',
                    fontStyle: 'bold',
                    shadow: { offsetX: 1, offsetY: 1, color: 'rgba(0,0,0,0.15)', blur: 3, stroke: false }
                  }).setOrigin(0.5);
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
        this.powerupButtons[type] = { text: btn, background: btnBg };
      });
      this.updatePowerupDisplay = () => {
        import('./powerups.js').then(mod => {
          Object.keys(module.POWERUP_TYPES).forEach(type => {
            const count = mod.getPowerupCount(type);
            const btnObj = this.powerupButtons[type];
            if (btnObj && btnObj.text) {
              btnObj.text.setText(`${typeLabels[type] || type} (${count})`);
              btnObj.text.setAlpha(count > 0 ? 1 : 0.5);
              if (btnObj.background) {
                btnObj.background.setAlpha(count > 0 ? 1 : 0.4);
              }
              if (count > 0) btnObj.text.setInteractive({ useHandCursor: true });
              else btnObj.text.disableInteractive();
            }
          });
        });
      };
      this.children.bringToTop(panelBg);
      Object.values(this.powerupButtons).forEach(btnObj => {
        if (btnObj.background) this.children.bringToTop(btnObj.background);
        if (btnObj.text) this.children.bringToTop(btnObj.text);
      });

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
        const fontFamily = 'Poppins, Montserrat, Arial, sans-serif';
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;
        const isMobile = width < 600;
        const centerX = width / 2;
        const centerY = height / 2;

        // Create modern gradient overlay background
        this.endlessStuckOverlay = this.add.graphics();
        this.endlessStuckOverlay.fillGradientStyle(
          parseInt(theme.background.replace('#', '0x')),
          parseInt(theme.background.replace('#', '0x')),
          0x1a1a2e,
          0x16213e
        );

        const overlayWidth = isMobile ? width - 60 : 520;
        const overlayHeight = isMobile ? height - 120 : 380;
        this.endlessStuckOverlay.fillRoundedRect(
          centerX - overlayWidth / 2,
          centerY - overlayHeight / 2,
          overlayWidth,
          overlayHeight,
          20
        );
        this.endlessStuckOverlay.setAlpha(0.98);
        this.endlessStuckOverlay.setDepth(1000);

        // Entrance animation
        this.endlessStuckOverlay.setScale(0.8);
        this.endlessStuckOverlay.setAlpha(0);
        this.tweens.add({
          targets: this.endlessStuckOverlay,
          scaleX: 1,
          scaleY: 1,
          alpha: 0.98,
          duration: 400,
          ease: 'Back.Out'
        });

        // Title text with modern styling
        this.endlessStuckText = this.add.text(centerX, centerY - 100, 'No moves left!', {
          fontFamily,
          fontSize: isMobile ? 24 : 32,
          fill: '#ffd700',
          fontStyle: 'bold',
          stroke: theme.button.color,
          strokeThickness: 2,
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: theme.button.color,
            blur: 10
          }
        }).setOrigin(0.5);
        this.endlessStuckText.setDepth(1001);

        // Show current score and best score
        const bestEndless = STATS.bestScoreEndless || 0;
        const isNewRecord = this.score > bestEndless;
        const scoreColor = isNewRecord ? '#ffdd44' : '#ffffff';
        const scoreText = isNewRecord ? `Score: ${this.score} (NEW RECORD!)` : `Score: ${this.score}`;

        this.endlessScoreText = this.add.text(centerX, centerY - 70, scoreText, {
          fontFamily,
          fontSize: isMobile ? 16 : 20,
          fill: scoreColor,
          fontStyle: isNewRecord ? 'bold' : 'normal',
          stroke: '#000000',
          strokeThickness: 1
        }).setOrigin(0.5);
        this.endlessScoreText.setDepth(1001);

        this.endlessBestText = this.add.text(centerX, centerY - 50, `Best: ${bestEndless}`, {
          fontFamily,
          fontSize: isMobile ? 14 : 16,
          fill: '#cccccc',
          fontStyle: 'normal',
          stroke: '#000000',
          strokeThickness: 1
        }).setOrigin(0.5);
        this.endlessBestText.setDepth(1001);

        // Subtitle
        const subtitleText = this.add.text(centerX, centerY - 20, 'Remove a row, column, or block?', {
          fontFamily,
          fontSize: isMobile ? 16 : 20,
          fill: '#ffffff',
          fontStyle: 'normal',
          stroke: '#000000',
          strokeThickness: 1
        }).setOrigin(0.5);
        subtitleText.setDepth(1001);

        // Helper function to create gradient buttons
        const createEndlessButton = (x, y, text, cost, action) => {
          const btnWidth = isMobile ? 140 : 160;
          const btnHeight = 45;

          const btnBg = this.add.graphics();
          btnBg.fillGradientStyle(
            parseInt(theme.button.color.replace('#', '0x')),
            parseInt(theme.button.color.replace('#', '0x')),
            parseInt(theme.button.color.replace('#', '0x')),
            parseInt(theme.button.color.replace('#', '0x'))
          );
          btnBg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 12);
          btnBg.setDepth(1001);

          const btn = this.add.text(x, y - 5, text, {
            fontFamily,
            fontSize: isMobile ? 14 : 16,
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 1
          }).setOrigin(0.5).setInteractive({ useHandCursor: true });
          btn.setDepth(1002);

          const costText = this.add.text(x, y + 10, cost, {
            fontFamily,
            fontSize: isMobile ? 11 : 12,
            fill: '#ffcccc',
            fontStyle: 'normal'
          }).setOrigin(0.5);
          costText.setDepth(1002);

          // Button interactions
          btn.on('pointerover', () => {
            this.tweens.add({
              targets: [btn, btnBg, costText],
              scaleX: 1.05,
              scaleY: 1.05,
              duration: 150,
              ease: 'Power2'
            });
          });

          btn.on('pointerout', () => {
            this.tweens.add({
              targets: [btn, btnBg, costText],
              scaleX: 1,
              scaleY: 1,
              duration: 150
            });
          });

          btn.on('pointerdown', () => {
            this.tweens.add({
              targets: [btn, btnBg, costText],
              scaleX: 0.95,
              scaleY: 0.95,
              duration: 100,
              yoyo: true,
              onComplete: () => {
                this.destroyEndlessStuckOverlay();
                action();
              }
            });
          });

          return { btn, bg: btnBg, cost: costText };
        };

        // Create buttons with responsive positioning
        const buttonY = centerY + 15;
        const buttonSpacing = isMobile ? 120 : 140;

        // Check if in endless mode to determine cost display
        const isEndless = isEndlessMode && isEndlessMode();
        const rowCost = isEndless ? '(-50 score)' : '(-5 coins)';
        const colCost = isEndless ? '(-50 score)' : '(-5 coins)';
        const blockCost = isEndless ? '(-20 score)' : '(-2 coins)';

        this.removeRowButton = createEndlessButton(
          centerX - buttonSpacing, buttonY, 'Remove Row', rowCost,
          () => this.promptRemove('row')
        );

        this.removeColButton = createEndlessButton(
          centerX, buttonY, 'Remove Column', colCost,
          () => this.promptRemove('col')
        );

        this.removeBlockButton = createEndlessButton(
          centerX + buttonSpacing, buttonY, 'Remove Block', blockCost,
          () => this.promptRemove('block')
        );

        // Cancel button with different styling
        const cancelBtnBg = this.add.graphics();
        cancelBtnBg.fillGradientStyle(0x666666, 0x666666, 0x888888, 0x888888);
        cancelBtnBg.fillRoundedRect(centerX - 60, centerY + 80, 120, 35, 10);
        cancelBtnBg.setDepth(1001);

        this.closeStuckButton = this.add.text(centerX, centerY + 97, 'Cancel', {
          fontFamily,
          fontSize: isMobile ? 16 : 18,
          fill: '#ffffff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 1
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.closeStuckButton.setDepth(1002);
        // Cancel button hover effects
        this.closeStuckButton.on('pointerover', () => {
          this.tweens.add({
            targets: [this.closeStuckButton, cancelBtnBg],
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 150,
            ease: 'Power2'
          });
        });

        this.closeStuckButton.on('pointerout', () => {
          this.tweens.add({
            targets: [this.closeStuckButton, cancelBtnBg],
            scaleX: 1,
            scaleY: 1,
            duration: 150
          });
        });

        this.closeStuckButton.on('pointerdown', () => {
          this.tweens.add({
            targets: [this.closeStuckButton, cancelBtnBg],
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 100,
            yoyo: true,
            onComplete: () => {
              this.destroyEndlessStuckOverlay();
            }
          });
        });

        // Store elements for cleanup
        this.endlessStuckCancelBg = cancelBtnBg;
        this.endlessStuckSubtitle = subtitleText;
      };
      this.destroyEndlessStuckOverlay = () => {
        // Clean up main overlay elements
        if (this.endlessStuckOverlay) this.endlessStuckOverlay.destroy();
        if (this.endlessStuckText) this.endlessStuckText.destroy();
        if (this.endlessScoreText) this.endlessScoreText.destroy();
        if (this.endlessBestText) this.endlessBestText.destroy();
        if (this.endlessStuckSubtitle) this.endlessStuckSubtitle.destroy();

        // Clean up buttons and their backgrounds
        if (this.removeRowButton && this.removeRowButton.btn) this.removeRowButton.btn.destroy();
        if (this.removeRowButton && this.removeRowButton.bg) this.removeRowButton.bg.destroy();
        if (this.removeRowButton && this.removeRowButton.cost) this.removeRowButton.cost.destroy();

        if (this.removeColButton && this.removeColButton.btn) this.removeColButton.btn.destroy();
        if (this.removeColButton && this.removeColButton.bg) this.removeColButton.bg.destroy();
        if (this.removeColButton && this.removeColButton.cost) this.removeColButton.cost.destroy();

        if (this.removeBlockButton && this.removeBlockButton.btn) this.removeBlockButton.btn.destroy();
        if (this.removeBlockButton && this.removeBlockButton.bg) this.removeBlockButton.bg.destroy();
        if (this.removeBlockButton && this.removeBlockButton.cost) this.removeBlockButton.cost.destroy();

        if (this.closeStuckButton) this.closeStuckButton.destroy();
        if (this.endlessStuckCancelBg) this.endlessStuckCancelBg.destroy();

        // Reset references
        this.endlessStuckOverlay = null;
        this.endlessStuckText = null;
        this.endlessScoreText = null;
        this.endlessBestText = null;
        this.endlessStuckSubtitle = null;
        this.removeRowButton = null;
        this.removeColButton = null;
        this.removeBlockButton = null;
        this.closeStuckButton = null;
        this.endlessStuckCancelBg = null;
      };

      // Prompt for removing rows, columns, or blocks in endless mode
      this.promptRemove = (type) => {
        const theme = GameScene.getActiveTheme();
        const fontFamily = 'Poppins, Montserrat, Arial, sans-serif';
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;
        const isMobile = width < 600;
        const centerX = width / 2;
        const centerY = height / 2;

        // Create styled prompt overlay with transparency
        const promptOverlay = this.add.graphics();
        promptOverlay.fillGradientStyle(
          parseInt(theme.background.replace('#', '0x')),
          parseInt(theme.background.replace('#', '0x')),
          0x1a1a2e,
          0x16213e
        );
        promptOverlay.fillRoundedRect(centerX - 250, centerY - 160, 500, 320, 20);
        promptOverlay.setAlpha(0.7); // Make it more transparent so users can see behind it
        promptOverlay.setDepth(1010);

        // Check if in endless mode to determine cost display and type
        const isEndless = isEndlessMode && isEndlessMode();
        let promptText = '';
        if (type === 'row') promptText = isEndless ? 'Click a row to remove (-50 score)' : 'Click a row to remove (-5 coins)';
        else if (type === 'col') promptText = isEndless ? 'Click a column to remove (-50 score)' : 'Click a column to remove (-5 coins)';
        else promptText = isEndless ? 'Click a block to remove (-20 score)' : 'Click a block to remove (-2 coins)';

        const promptTextObj = this.add.text(centerX, centerY - 100, promptText, {
          fontFamily,
          fontSize: isMobile ? 18 : 22,
          fill: '#ffd700',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 1
        }).setOrigin(0.5);
        promptTextObj.setDepth(1011);

        if (type === 'row') {
          // Create row selection rectangles
          const rowRects = [];
          for (let r = 0; r < this.gridSize; r++) {
            const rect = this.add.rectangle(
              centerX,
              this.gridOrigin.y + r * this.cellSize + this.cellSize / 2,
              this.gridSize * this.cellSize,
              this.cellSize,
              0xff0000,
              0.15
            ).setOrigin(0.5).setInteractive({ useHandCursor: true });
            rect.setDepth(1012);

            rect.on('pointerdown', () => {
              if (isEndless) {
                // In endless mode, use score instead of coins
                if (this.score < 50) {
                  alert('Not enough score!');
                  promptOverlay.destroy();
                  promptTextObj.destroy();
                  rowRects.forEach(rr => rr.destroy());
                  return;
                }
                this.score -= 50;
                if (this.scoreText) this.scoreText.setText('Score: ' + this.score);
                for (let c = 0; c < this.gridSize; c++) this.gridState[r][c] = 0;
                this.redrawGridBlocks();
                promptOverlay.destroy();
                promptTextObj.destroy();
                rowRects.forEach(rr => rr.destroy());

                // Let anyMovePossible handle the endless mode logic
                this.anyMovePossible();
              } else {
                // Regular mode, use coins
                import('./powerups.js').then(module => {
                  const coins = module.getCoins ? module.getCoins() : 0;
                  if (coins < 5) {
                    alert('Not enough coins!');
                    promptOverlay.destroy();
                    promptTextObj.destroy();
                    rowRects.forEach(rr => rr.destroy());
                    return;
                  }
                  module.spendCoins(5);
                  for (let c = 0; c < this.gridSize; c++) this.gridState[r][c] = 0;
                  if (this.updateCoinDisplay) this.updateCoinDisplay();
                  this.redrawGridBlocks();
                  promptOverlay.destroy();
                  promptTextObj.destroy();
                  rowRects.forEach(rr => rr.destroy());

                  if (!this._canAnyMove()) {
                    this.showEndlessStuckOverlay();
                  }
                });
              }
            });
            rowRects.push(rect);
          }
        } else if (type === 'col') {
          // Create column selection rectangles
          const colRects = [];
          for (let c = 0; c < this.gridSize; c++) {
            const rect = this.add.rectangle(
              this.gridOrigin.x + c * this.cellSize + this.cellSize / 2,
              centerY,
              this.cellSize,
              this.gridSize * this.cellSize,
              0x00ff00,
              0.15
            ).setOrigin(0.5).setInteractive({ useHandCursor: true });
            rect.setDepth(1012);

            rect.on('pointerdown', () => {
              if (isEndless) {
                // In endless mode, use score instead of coins
                if (this.score < 50) {
                  alert('Not enough score!');
                  promptOverlay.destroy();
                  promptTextObj.destroy();
                  colRects.forEach(cr => cr.destroy());
                  return;
                }
                this.score -= 50;
                if (this.scoreText) this.scoreText.setText('Score: ' + this.score);
                for (let r = 0; r < this.gridSize; r++) this.gridState[r][c] = 0;
                this.redrawGridBlocks();
                promptOverlay.destroy();
                promptTextObj.destroy();
                colRects.forEach(cr => cr.destroy());

                // Let anyMovePossible handle the endless mode logic
                this.anyMovePossible();
              } else {
                // Regular mode, use coins
                import('./powerups.js').then(module => {
                  const coins = module.getCoins ? module.getCoins() : 0;
                  if (coins < 5) {
                    alert('Not enough coins!');
                    promptOverlay.destroy();
                    promptTextObj.destroy();
                    colRects.forEach(cr => cr.destroy());
                    return;
                  }
                  module.spendCoins(5);
                  for (let r = 0; r < this.gridSize; r++) this.gridState[r][c] = 0;
                  if (this.updateCoinDisplay) this.updateCoinDisplay();
                  this.redrawGridBlocks();
                  promptOverlay.destroy();
                  promptTextObj.destroy();
                  colRects.forEach(cr => cr.destroy());

                  if (!this._canAnyMove()) {
                    this.showEndlessStuckOverlay();
                  }
                });
              }
            });
            colRects.push(rect);
          }
        } else if (type === 'block') {
          // Block removal - click on grid
          const pointerHandler = (pointer) => {
            const gridX = Math.floor((pointer.x - this.gridOrigin.x) / this.cellSize);
            const gridY = Math.floor((pointer.y - this.gridOrigin.y) / this.cellSize);

            if (gridX < 0 || gridX >= this.gridSize || gridY < 0 || gridY >= this.gridSize) {
              promptOverlay.destroy();
              promptTextObj.destroy();
              this.input.off('pointerdown', pointerHandler);
              return;
            }

            if (isEndless) {
              // In endless mode, use score instead of coins
              if (this.score < 20) {
                alert('Not enough score!');
                promptOverlay.destroy();
                promptTextObj.destroy();
                this.input.off('pointerdown', pointerHandler);
                return;
              }
              this.score -= 20;
              if (this.scoreText) this.scoreText.setText('Score: ' + this.score);
              this.gridState[gridY][gridX] = 0;
              this.redrawGridBlocks();
              promptOverlay.destroy();
              promptTextObj.destroy();
              this.input.off('pointerdown', pointerHandler);

              // Let anyMovePossible handle the endless mode logic
              this.anyMovePossible();
            } else {
            // Regular mode, use coins
              import('./powerups.js').then(module => {
                const coins = module.getCoins ? module.getCoins() : 0;
                if (coins < 2) {
                  alert('Not enough coins!');
                  promptOverlay.destroy();
                  promptTextObj.destroy();
                  this.input.off('pointerdown', pointerHandler);
                  return;
                }
                module.spendCoins(2);
                this.gridState[gridY][gridX] = 0;
                if (this.updateCoinDisplay) this.updateCoinDisplay();
                this.redrawGridBlocks();
                promptOverlay.destroy();
                promptTextObj.destroy();
                this.input.off('pointerdown', pointerHandler);
              });
            }
          };

          this.input.once('pointerdown', pointerHandler);
        }
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

    // Add resize event listener for responsive layout updates
    this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
      this.updateResponsiveLayout();
    });
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
    // Enhanced styling for options text with responsive font size and proper positioning
    const isMobileOptions = this.sys.game.config.width < 600;
    const optionsFontSize = isMobileOptions ? 14 : 16;
    const optionsY = isMobileOptions ? this.sys.game.config.height - 40 : 90; // Move to bottom on mobile
    const optionsX = isMobileOptions ? this.sys.game.config.width / 2 : 450;

    this.optionsText = this.add.text(optionsX, optionsY, text, {
      fontSize: optionsFontSize,
      color: '#ffffff',
      fontFamily: 'Poppins, Arial, sans-serif',
      fontStyle: 'bold',
      backgroundColor: 'rgba(26, 26, 46, 0.9)',
      padding: { left: 12, right: 12, top: 6, bottom: 6 },
      shadow: { offsetX: 1, offsetY: 1, color: theme.button.color, blur: 3, stroke: true }
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

  // Show endless mode game over when no moves are available and no powerups are affordable
  showEndlessGameOverOverlay() {
    const theme = GameScene.getActiveTheme();
    const fontFamily = 'Poppins, Montserrat, Arial, sans-serif';
    if (this.endlessGameOverOverlay) return;

    // Update endless mode stats
    STATS.totalEndlessGames++;
    if (this.score > (STATS.bestScoreEndless || 0)) {
      STATS.bestScoreEndless = this.score;
    }
    STATS.lastPlayed = new Date().toISOString();
    saveStats(STATS);

    if (this.sfxGameOver) this.sfxGameOver.play();

    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;
    const isMobile = width < 600;
    const isSmallMobile = width < 400;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create modern gradient overlay background
    this.endlessGameOverOverlay = this.add.graphics();
    this.endlessGameOverOverlay.fillGradientStyle(
      parseInt(theme.background.replace('#', '0x')),
      parseInt(theme.background.replace('#', '0x')),
      0x1a1a2e,
      0x16213e
    );

    const overlayWidth = isMobile ? width - 40 : 600;
    const overlayHeight = isMobile ? height - 80 : 400;
    this.endlessGameOverOverlay.fillRoundedRect(
      centerX - overlayWidth / 2,
      centerY - overlayHeight / 2,
      overlayWidth,
      overlayHeight,
      20
    );
    this.endlessGameOverOverlay.setAlpha(0.98);
    this.endlessGameOverOverlay.setDepth(1000);

    // Entrance animation
    this.endlessGameOverOverlay.setScale(0.8);
    this.endlessGameOverOverlay.setAlpha(0);
    this.tweens.add({
      targets: this.endlessGameOverOverlay,
      scaleX: 1,
      scaleY: 1,
      alpha: 0.98,
      duration: 500,
      ease: 'Back.Out'
    });

    // Endless Game Over title
    const titleFontSize = isMobile ? (isSmallMobile ? 42 : 48) : 64;
    this.endlessGameOverText = this.add.text(centerX, centerY - 120, 'Endless Game Over!', {
      fontFamily,
      fontSize: titleFontSize,
      fill: '#ffffff',
      fontStyle: 'bold',
      stroke: theme.button.color,
      strokeThickness: 4,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: theme.button.color,
        blur: 10
      }
    }).setOrigin(0.5);
    this.endlessGameOverText.setDepth(1001);

    // Show final score and best score
    const bestEndless = STATS.bestScoreEndless || 0;
    const isNewRecord = this.score >= bestEndless;
    const scoreColor = isNewRecord ? '#ffdd44' : '#ffffff';
    const scoreFontSize = isMobile ? (isSmallMobile ? 22 : 26) : 32;

    const scoreText = isNewRecord ? `Final Score: ${this.score} (NEW RECORD!)` : `Final Score: ${this.score}`;
    this.endlessScoreDisplay = this.add.text(centerX, centerY - 70, scoreText, {
      fontFamily,
      fontSize: scoreFontSize,
      fill: scoreColor,
      fontStyle: isNewRecord ? 'bold' : 'normal',
      stroke: '#000000',
      strokeThickness: 2,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: isNewRecord ? '#ffaa00' : '#333333',
        blur: 8
      }
    }).setOrigin(0.5);
    this.endlessScoreDisplay.setDepth(1001);

    this.endlessBestDisplay = this.add.text(centerX, centerY - 35, `Best: ${bestEndless}`, {
      fontFamily,
      fontSize: isMobile ? (isSmallMobile ? 16 : 18) : 22,
      fill: '#cccccc',
      fontStyle: 'normal',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);
    this.endlessBestDisplay.setDepth(1001);

    // Create gradient buttons for restart and main menu
    const buttonY = centerY + 40;
    const buttonSpacing = isMobile ? 120 : 140;
    const btnWidth = isMobile ? 110 : 130;
    const btnHeight = 45;

    // Restart button
    this.endlessRestartButtonBg = this.add.graphics();
    this.endlessRestartButtonBg.fillGradientStyle(
      parseInt(theme.button.color.replace('#', '0x')),
      parseInt(theme.button.color.replace('#', '0x')),
      parseInt(theme.button.color.replace('#', '0x')),
      parseInt(theme.button.color.replace('#', '0x'))
    );
    this.endlessRestartButtonBg.fillRoundedRect(
      centerX - buttonSpacing - btnWidth / 2,
      buttonY - btnHeight / 2,
      btnWidth,
      btnHeight,
      12
    );
    this.endlessRestartButtonBg.setDepth(1001);

    this.endlessRestartButton = this.add.text(centerX - buttonSpacing, buttonY, 'Restart', {
      fontFamily,
      fontSize: isMobile ? 16 : 20,
      fill: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.endlessRestartButton.setDepth(1002);

    // Main Menu button
    this.endlessMainMenuButtonBg = this.add.graphics();
    this.endlessMainMenuButtonBg.fillGradientStyle(
      parseInt(theme.button.color.replace('#', '0x')),
      parseInt(theme.button.color.replace('#', '0x')),
      parseInt(theme.button.color.replace('#', '0x')),
      parseInt(theme.button.color.replace('#', '0x'))
    );
    this.endlessMainMenuButtonBg.fillRoundedRect(
      centerX + buttonSpacing - btnWidth / 2,
      buttonY - btnHeight / 2,
      btnWidth,
      btnHeight,
      12
    );
    this.endlessMainMenuButtonBg.setDepth(1001);

    this.endlessMainMenuButton = this.add.text(centerX + buttonSpacing, buttonY, 'Main Menu', {
      fontFamily,
      fontSize: isMobile ? 16 : 20,
      fill: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.endlessMainMenuButton.setDepth(1002);

    // Button interactions
    this.endlessRestartButton.on('pointerover', () => {
      this.tweens.add({
        targets: [this.endlessRestartButton, this.endlessRestartButtonBg],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
        ease: 'Power2'
      });
    });

    this.endlessRestartButton.on('pointerout', () => {
      this.tweens.add({
        targets: [this.endlessRestartButton, this.endlessRestartButtonBg],
        scaleX: 1,
        scaleY: 1,
        duration: 150
      });
    });

    this.endlessRestartButton.on('pointerdown', () => {
      this.tweens.add({
        targets: [this.endlessRestartButton, this.endlessRestartButtonBg],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => this.restartGame()
      });
    });

    this.endlessMainMenuButton.on('pointerover', () => {
      this.tweens.add({
        targets: [this.endlessMainMenuButton, this.endlessMainMenuButtonBg],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
        ease: 'Power2'
      });
    });

    this.endlessMainMenuButton.on('pointerout', () => {
      this.tweens.add({
        targets: [this.endlessMainMenuButton, this.endlessMainMenuButtonBg],
        scaleX: 1,
        scaleY: 1,
        duration: 150
      });
    });

    this.endlessMainMenuButton.on('pointerdown', () => {
      this.tweens.add({
        targets: [this.endlessMainMenuButton, this.endlessMainMenuButtonBg],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          this.scene.start('MainMenu');
        }
      });
    });

    // Entrance animations for buttons
    [this.endlessRestartButtonBg, this.endlessRestartButton, this.endlessMainMenuButtonBg, this.endlessMainMenuButton].forEach((element, index) => {
      element.setAlpha(0);
      element.setScale(0.8);
      this.tweens.add({
        targets: element,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        delay: 400 + index * 100,
        ease: 'Back.Out'
      });
    });
  }

  showGameOverOverlay() {
    // Handle endless mode differently
    if (isEndlessMode && isEndlessMode()) {
      // Check if player can afford any powerups
      const canAffordRow = this.score >= 50;
      const canAffordCol = this.score >= 50;
      const canAffordBlock = this.score >= 20;

      if (!canAffordRow && !canAffordCol && !canAffordBlock) {
        // Player can't afford any powerups, show endless game over
        this.showEndlessGameOverOverlay();
        return;
      } else {
        // Player can still afford powerups, show stuck overlay
        if (this.showEndlessStuckOverlay) this.showEndlessStuckOverlay();
        return;
      }
    }

    const theme = GameScene.getActiveTheme();
    const fontFamily = 'Poppins, Montserrat, Arial, sans-serif';
    if (this.gameOverOverlay) return;

    // Update stats
    if (this.sfxGameOver) this.sfxGameOver.play();
    STATS.totalGames++;
    if (GameScene.DIFFICULTY === 'easy') {
      if (this.score > (STATS.bestScoreEasy || 0)) STATS.bestScoreEasy = this.score;
    } else {
      if (this.score > (STATS.bestScoreDifficult || 0)) STATS.bestScoreDifficult = this.score;
    }
    STATS.lastPlayed = new Date().toISOString();
    saveStats(STATS);

    // Get responsive dimensions
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;
    const isMobile = width < 600;
    const isSmallMobile = width < 400;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create modern gradient overlay background
    this.gameOverOverlay = this.add.graphics();
    this.gameOverOverlay.fillGradientStyle(
      parseInt(theme.background.replace('#', '0x')),
      parseInt(theme.background.replace('#', '0x')),
      0x1a1a2e,
      0x16213e
    );

    const overlayWidth = isMobile ? width - 40 : Math.min(600, width - 100);
    const overlayHeight = isMobile ? height - 100 : Math.min(500, height - 150);
    this.gameOverOverlay.fillRoundedRect(
      centerX - overlayWidth / 2,
      centerY - overlayHeight / 2,
      overlayWidth,
      overlayHeight,
      20
    );
    this.gameOverOverlay.setAlpha(0.98);
    this.gameOverOverlay.setDepth(1000); // Ensure it's on top

    // Add dramatic entrance animation
    this.gameOverOverlay.setScale(0.8);
    this.gameOverOverlay.setAlpha(0);
    this.tweens.add({
      targets: this.gameOverOverlay,
      scaleX: 1,
      scaleY: 1,
      alpha: 0.98,
      duration: 500,
      ease: 'Back.Out'
    });

    // Game Over title with modern styling
    const titleFontSize = isMobile ? (isSmallMobile ? 48 : 56) : 72;
    this.gameOverText = this.add.text(centerX, centerY - 80, 'Game Over!', {
      fontFamily,
      fontSize: titleFontSize,
      fill: '#ffffff',
      fontStyle: 'bold',
      stroke: theme.button.color,
      strokeThickness: 4,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: theme.button.color,
        blur: 15,
        stroke: false,
        fill: true
      }
    }).setOrigin(0.5);
    this.gameOverText.setDepth(1001);

    // Title entrance animation
    this.gameOverText.setScale(0.5);
    this.gameOverText.setAlpha(0);
    this.tweens.add({
      targets: this.gameOverText,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 600,
      delay: 200,
      ease: 'Bounce.Out'
    });

    // Score display with enhanced styling
    const scoreFontSize = isMobile ? (isSmallMobile ? 20 : 24) : 32;
    const currentScoreText = `Final Score: ${this.score}`;
    const bestScore = GameScene.DIFFICULTY === 'easy' ? STATS.bestScoreEasy : STATS.bestScoreDifficult;
    const bestScoreText = `Best: ${bestScore}`;
    const isNewRecord = this.score >= bestScore;

    this.currentScoreText = this.add.text(centerX, centerY - 20, currentScoreText, {
      fontFamily,
      fontSize: scoreFontSize,
      fill: isNewRecord ? '#ffd700' : '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: 'rgba(0,0,0,0.5)',
        blur: 8
      }
    }).setOrigin(0.5);
    this.currentScoreText.setDepth(1001);

    this.bestScoreText = this.add.text(centerX, centerY + 15, bestScoreText, {
      fontFamily,
      fontSize: scoreFontSize - 4,
      fill: '#cccccc',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);
    this.bestScoreText.setDepth(1001);

    // New record celebration
    if (isNewRecord && this.score > 0) {
      const newRecordText = this.add.text(centerX, centerY + 45, '🎉 NEW RECORD! 🎉', {
        fontFamily,
        fontSize: isMobile ? 18 : 24,
        fill: '#ffd700',
        fontStyle: 'bold',
        stroke: '#ff6b6b',
        strokeThickness: 2
      }).setOrigin(0.5);
      newRecordText.setDepth(1001);

      // Pulsing animation for new record
      this.tweens.add({
        targets: newRecordText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut'
      });
    }

    // Create gradient button backgrounds for Restart button
    this.restartButtonBg = this.add.graphics();
    const btnWidth = isMobile ? 200 : 240;
    const btnHeight = isMobile ? 50 : 60;
    const btnY = centerY + 100;

    this.restartButtonBg.fillGradientStyle(
      parseInt(theme.button.color.replace('#', '0x')),
      parseInt(theme.button.color.replace('#', '0x')),
      parseInt(theme.button.color.replace('#', '0x')),
      parseInt(theme.button.color.replace('#', '0x'))
    );
    this.restartButtonBg.fillRoundedRect(
      centerX - btnWidth / 2,
      btnY - btnHeight / 2,
      btnWidth,
      btnHeight,
      15
    );
    this.restartButtonBg.setDepth(1001);

    // Restart button with modern styling
    const restartFontSize = isMobile ? (isSmallMobile ? 20 : 24) : 32;
    this.restartButton = this.add.text(centerX, btnY, 'Restart Game', {
      fontFamily,
      fontSize: restartFontSize,
      fill: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: 'rgba(0,0,0,0.8)',
        blur: 4
      }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.restartButton.setDepth(1002);

    // Add Main Menu button
    this.mainMenuButtonBg = this.add.graphics();
    const mainMenuBtnY = btnY + 70;

    this.mainMenuButtonBg.fillGradientStyle(
      0x666666, 0x666666, 0x888888, 0x888888
    );
    this.mainMenuButtonBg.fillRoundedRect(
      centerX - btnWidth / 2,
      mainMenuBtnY - btnHeight / 2,
      btnWidth,
      btnHeight,
      15
    );
    this.mainMenuButtonBg.setDepth(1001);

    this.mainMenuButton = this.add.text(centerX, mainMenuBtnY, 'Main Menu', {
      fontFamily,
      fontSize: restartFontSize,
      fill: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: 'rgba(0,0,0,0.8)',
        blur: 4
      }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.mainMenuButton.setDepth(1002);

    // Button animations and interactions
    this.restartButton.on('pointerover', () => {
      this.tweens.add({
        targets: [this.restartButton, this.restartButtonBg],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
        ease: 'Power2'
      });
    });

    this.restartButton.on('pointerout', () => {
      this.tweens.add({
        targets: [this.restartButton, this.restartButtonBg],
        scaleX: 1,
        scaleY: 1,
        duration: 150
      });
    });

    this.restartButton.on('pointerdown', () => {
      this.tweens.add({
        targets: [this.restartButton, this.restartButtonBg],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => this.restartGame()
      });
    });

    this.mainMenuButton.on('pointerover', () => {
      this.tweens.add({
        targets: [this.mainMenuButton, this.mainMenuButtonBg],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
        ease: 'Power2'
      });
    });

    this.mainMenuButton.on('pointerout', () => {
      this.tweens.add({
        targets: [this.mainMenuButton, this.mainMenuButtonBg],
        scaleX: 1,
        scaleY: 1,
        duration: 150
      });
    });

    this.mainMenuButton.on('pointerdown', () => {
      this.tweens.add({
        targets: [this.mainMenuButton, this.mainMenuButtonBg],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Handle stats for ending games when going to main menu
          if (isEndlessMode && isEndlessMode()) {
            // Only update stats if not already updated by endless game over overlay
            if (!this.endlessGameOverOverlay) {
              STATS.totalEndlessGames++;
              if (this.score > (STATS.bestScoreEndless || 0)) {
                STATS.bestScoreEndless = this.score;
              }
              STATS.lastPlayed = new Date().toISOString();
              saveStats(STATS);
            }
          }
          this.scene.start('MainMenu');
        }
      });
    });

    // Entrance animations for buttons
    [this.restartButtonBg, this.restartButton, this.mainMenuButtonBg, this.mainMenuButton].forEach((element, index) => {
      element.setAlpha(0);
      element.setScale(0.8);
      this.tweens.add({
        targets: element,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 400,
        delay: 400 + index * 100,
        ease: 'Back.Out'
      });
    });

    // Score text animations
    [this.currentScoreText, this.bestScoreText].forEach((element, index) => {
      element.setAlpha(0);
      element.setY(element.y + 20);
      this.tweens.add({
        targets: element,
        alpha: 1,
        y: element.y - 20,
        duration: 500,
        delay: 300 + index * 100,
        ease: 'Power2.Out'
      });
    });

    // Enhanced visual effects
    Effects.showGlowEffect && Effects.showGlowEffect(this, centerX, centerY, theme.button.color, 400, 2500);
    Effects.showConfettiBurst ?
      Effects.showConfettiBurst(this, centerX, centerY, theme.button.color, 60, 30, 2500) :
      Effects.showParticleBurst && Effects.showParticleBurst(this, centerX, centerY, theme.button.color, 60, 30, 2500);

    if (this.cameras && this.cameras.main) {
      this.cameras.main.shake(800, 0.01);
    }
  }

  hideGameOverOverlay() {
    if (this.gameOverOverlay) this.gameOverOverlay.destroy();
    if (this.gameOverText) this.gameOverText.destroy();
    if (this.restartButton) this.restartButton.destroy();
    if (this.restartButtonBg) this.restartButtonBg.destroy();
    if (this.mainMenuButton) this.mainMenuButton.destroy();
    if (this.mainMenuButtonBg) this.mainMenuButtonBg.destroy();
    if (this.currentScoreText) this.currentScoreText.destroy();
    if (this.bestScoreText) this.bestScoreText.destroy();

    this.gameOverOverlay = null;
    this.gameOverText = null;
    this.restartButton = null;
    this.restartButtonBg = null;
    this.mainMenuButton = null;
    this.mainMenuButtonBg = null;
    this.currentScoreText = null;
    this.bestScoreText = null;
  }

  hideEndlessGameOverOverlay() {
    if (this.endlessGameOverOverlay) this.endlessGameOverOverlay.destroy();
    if (this.endlessGameOverText) this.endlessGameOverText.destroy();
    if (this.endlessScoreDisplay) this.endlessScoreDisplay.destroy();
    if (this.endlessBestDisplay) this.endlessBestDisplay.destroy();
    if (this.endlessRestartButton) this.endlessRestartButton.destroy();
    if (this.endlessRestartButtonBg) this.endlessRestartButtonBg.destroy();
    if (this.endlessMainMenuButton) this.endlessMainMenuButton.destroy();
    if (this.endlessMainMenuButtonBg) this.endlessMainMenuButtonBg.destroy();

    this.endlessGameOverOverlay = null;
    this.endlessGameOverText = null;
    this.endlessScoreDisplay = null;
    this.endlessBestDisplay = null;
    this.endlessRestartButton = null;
    this.endlessRestartButtonBg = null;
    this.endlessMainMenuButton = null;
    this.endlessMainMenuButtonBg = null;
  }

  restartGame() {
    // Handle stats for ending games
    if (isEndlessMode && isEndlessMode()) {
      // Only update stats if not already updated by endless game over overlay
      if (!this.endlessGameOverOverlay) {
        STATS.totalEndlessGames++;
        if (this.score > (STATS.bestScoreEndless || 0)) {
          STATS.bestScoreEndless = this.score;
        }
        STATS.lastPlayed = new Date().toISOString();
        saveStats(STATS);
      }
    } else {
      // Regular game restart
      STATS.totalGames++;
      STATS.lastPlayed = new Date().toISOString();
      saveStats(STATS);
    }

    // Reset optionsText reference to avoid accessing destroyed object
    this.optionsText = null;
    this.updateOptionsDisplay();
    this.hideGameOverOverlay();
    this.hideEndlessGameOverOverlay();
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
