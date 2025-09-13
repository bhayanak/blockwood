// ...existing code...
// Helper: Place shape on grid
// Theme system
const THEMES = [
  {
    name: 'Vibrant',
    blockColors: [0xff6b6b, 0x48e6e6, 0x6b8cff, 0x7fffd4, 0xffd86b, 0x9dff6b, 0xff6bff, 0x6bffb2],
    background: '#222',
    gridLine: 0xffffff,
    gridLineAlpha: 0.2,
    highlight: 0x48e6e6,
    highlightAlpha: 0.7,
    highlightFillAlpha: 0.15,
    text: '#fff',
    overlay: 0x222222,
    overlayAlpha: 0.85,
    button: { color: '#ff6b6b', background: '#fff' }
  },
  {
    name: 'Forest',
    blockColors: [0x228B22, 0x6B8E23, 0x8FBC8F, 0x556B2F, 0xBDB76B, 0x2E8B57, 0x3CB371, 0x9ACD32],
    background: '#1a2e1a',
    gridLine: 0xBDB76B,
    gridLineAlpha: 0.18,
    highlight: 0x9ACD32,
    highlightAlpha: 0.6,
    highlightFillAlpha: 0.12,
    text: '#eaffea',
    overlay: 0x1a2e1a,
    overlayAlpha: 0.88,
    button: { color: '#228B22', background: '#eaffea' }
  },
  {
    name: 'Neon',
    blockColors: [0x39ff14, 0xff073a, 0x00f0ff, 0xfffb00, 0xff00fb, 0x00ff90, 0xffa600, 0x00ffea],
    background: '#0a0a23',
    gridLine: 0xffffff,
    gridLineAlpha: 0.25,
    highlight: 0x39ff14,
    highlightAlpha: 0.8,
    highlightFillAlpha: 0.18,
    text: '#fff',
    overlay: 0x0a0a23,
    overlayAlpha: 0.92,
    button: { color: '#39ff14', background: '#222' }
  },
  {
    name: 'Pastel',
    blockColors: [0xffb3ba, 0xbaffc9, 0xbae1ff, 0xffffba, 0xffdfba, 0xc9baff, 0xbaffff, 0xffbae1],
    background: '#f7f7fa',
    gridLine: 0xcccccc,
    gridLineAlpha: 0.15,
    highlight: 0xbaffc9,
    highlightAlpha: 0.5,
    highlightFillAlpha: 0.10,
    text: '#222',
    overlay: 0xf7f7fa,
    overlayAlpha: 0.90,
    button: { color: '#baaeff', background: '#fff' }
  },
  {
    name: 'Space',
    blockColors: [0x6b6bff, 0x8c6bff, 0x6b8cff, 0x48e6e6, 0x7fffd4, 0x2222ff, 0x9dff6b, 0x6bffb2],
    background: '#181830',
    gridLine: 0xccccff,
    gridLineAlpha: 0.22,
    highlight: 0x8c6bff,
    highlightAlpha: 0.7,
    highlightFillAlpha: 0.16,
    text: '#fff',
    overlay: 0x181830,
    overlayAlpha: 0.93,
    button: { color: '#8c6bff', background: '#222' }
  },
  {
    name: 'Colorblind',
    blockColors: [0x000000, 0xE69F00, 0x56B4E9, 0x009E73, 0xF0E442, 0x0072B2, 0xD55E00, 0xCC79A7],
    background: '#f5f5f5',
    gridLine: 0x222222,
    gridLineAlpha: 0.18,
    highlight: 0x56B4E9,
    highlightAlpha: 0.7,
    highlightFillAlpha: 0.13,
    text: '#222',
    overlay: 0xf5f5f5,
    overlayAlpha: 0.92,
    button: { color: '#56B4E9', background: '#fff' }
  },
  // End of GameScene class
];
let activeThemeIdx = 0;
function getActiveTheme() { return THEMES[activeThemeIdx]; }
// Difficulty modes
let DIFFICULTY = 'easy'; // 'easy' or 'difficult'
let GAME_MODE = 'normal'; // 'normal', 'daily', 'puzzle'
const SHAPE_PATTERNS_EASY = [
  [[1, 1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1]],
  [[1, 1, 1, 1]],
  [[1, 0], [1, 1]],
  [[1, 1], [0, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 0], [1, 0]],
  [[1], [1], [1]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 1], [1, 0, 0]],
];
const SHAPE_PATTERNS_DIFFICULT = [
  ...SHAPE_PATTERNS_EASY,
  [[1, 0], [1, 0], [1, 1]],
  [[1, 1, 1], [0, 1, 0]], // plus shape
  [[0, 1, 0], [1, 1, 1], [0, 1, 0]], // big plus
  [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
];
function getRandomShape() {
  const patterns = DIFFICULTY === 'easy' ? SHAPE_PATTERNS_EASY : SHAPE_PATTERNS_DIFFICULT;
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const theme = getActiveTheme();
  const color = theme.blockColors[Math.floor(Math.random() * theme.blockColors.length)];
  return { pattern, color };
}
class GameScene extends Phaser.Scene {
  // --- Mobile UX: Undo/Redo Gesture ---
  moveHistory = [];
  redoHistory = [];
  lastPointerDown = null;
  create() {
    // ...existing code...
    // Swipe gesture detection for undo/redo
    this.input.on('pointerdown', (pointer) => {
      this.lastPointerDown = { x: pointer.x, y: pointer.y, time: Date.now() };
    });
    this.input.on('pointerup', (pointer) => {
      if (!this.lastPointerDown) return;
      const dx = pointer.x - this.lastPointerDown.x;
      const dy = pointer.y - this.lastPointerDown.y;
      const dt = Date.now() - this.lastPointerDown.time;
      // Only consider horizontal swipes, quick gesture
      if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) && dt < 500) {
        if (dx < 0) {
          this.undoMove();
        } else {
          this.redoMove();
        }
      }
      this.lastPointerDown = null;
    });
    // ...existing code...
  }
  undoMove() {
    if (!this.moveHistory.length) return;
    const move = this.moveHistory.pop();
    this.redoHistory.push(move);
    if (move.type === 'place') {
      // Remove placed blocks
      move.placedBlocks.forEach(({ r, c, prev }) => {
        this.gridState[r][c] = prev;
      });
      // Restore shape to tray
      this.trayShapes[move.trayIdx] = move.shape;
      this.renderTrayShapes();
      this.redrawGridBlocks();
    } else if (move.type === 'clear') {
      // Restore cleared blocks
      move.clearedBlocks.forEach(({ r, c, prev }) => {
        this.gridState[r][c] = prev;
      });
      this.redrawGridBlocks();
    }
  }
  redoMove() {
    if (!this.redoHistory.length) return;
    const move = this.redoHistory.pop();
    this.moveHistory.push(move);
    if (move.type === 'place') {
      // Re-place blocks
      move.placedBlocks.forEach(({ r, c }) => {
        this.gridState[r][c] = move.shape.color;
      });
      this.trayShapes[move.trayIdx] = null;
      this.renderTrayShapes();
      this.redrawGridBlocks();
    } else if (move.type === 'clear') {
      // Re-clear blocks
      move.clearedBlocks.forEach(({ r, c }) => {
        this.gridState[r][c] = 0;
      });
      this.redrawGridBlocks();
    }
  }
  // --- Visual Effects ---
  showParticleBurst(x, y, color, count = 12, size = 10, duration = 600) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const dx = Math.cos(angle) * 40;
      const dy = Math.sin(angle) * 40;
      const particle = this.add.graphics();
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, size);
      particle.x = x;
      particle.y = y;
      this.tweens.add({
        targets: particle,
        x: x + dx,
        y: y + dy,
        alpha: 0,
        duration,
        onComplete: () => particle.destroy()
      });
    }
  }
  showGlowEffect(x, y, color, size = 60, duration = 500) {
    const glow = this.add.graphics();
    glow.fillStyle(color, 0.4);
    glow.fillCircle(x, y, size);
    this.tweens.add({
      targets: glow,
      alpha: 0,
      duration,
      onComplete: () => glow.destroy()
    });
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
    const patterns = DIFFICULTY === 'easy' ? SHAPE_PATTERNS_EASY : SHAPE_PATTERNS_DIFFICULT;
    this.trayShapes = [];
    for (let i = 0; i < 3; i++) {
      const patternIdx = Math.floor(rand() * patterns.length);
      const colorIdx = Math.floor(rand() * getActiveTheme().blockColors.length);
      this.trayShapes.push({ pattern: patterns[patternIdx], color: getActiveTheme().blockColors[colorIdx] });
    }
    // Seeded grid: fill 8 blocks in fixed positions for challenge
    this.gridState = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
    for (let i = 0; i < 8; i++) {
      const r = Math.floor(rand() * this.gridSize);
      const c = Math.floor(rand() * this.gridSize);
      const colorIdx = Math.floor(rand() * getActiveTheme().blockColors.length);
      this.gridState[r][c] = getActiveTheme().blockColors[colorIdx];
    }
  }

  // --- PUZZLE MODE ---
  // Predefined puzzles (expand as needed)
  static PUZZLES = [
    {
      id: 0,
      grid: [
        // Example: a puzzle with a cross pattern
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0x48e6e6, 0, 0, 0, 0, 0],
        [0, 0, 0, 0x48e6e6, 0x48e6e6, 0x48e6e6, 0, 0, 0, 0],
        [0, 0, 0, 0, 0x48e6e6, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      tray: [
        { pattern: [[1, 1]], color: 0xff6b6b },
        { pattern: [[1, 1, 1]], color: 0x48e6e6 },
        { pattern: [[1], [1], [1]], color: 0x6b8cff }
      ]
    },
    {
      id: 1,
      grid: [
        // Example: a puzzle with a block in each corner
        [0xff6b6b, 0, 0, 0, 0, 0, 0, 0, 0, 0x48e6e6],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0x6b8cff, 0, 0, 0, 0, 0, 0, 0, 0, 0xffd86b],
      ],
      tray: [
        { pattern: [[1, 1, 1, 1]], color: 0xffd86b },
        { pattern: [[1, 0], [1, 1]], color: 0x9dff6b },
        { pattern: [[1, 1], [0, 1]], color: 0x6bffb2 }
      ]
    }
  ];

  // Helper: Load a predefined puzzle
  loadPuzzle(puzzleId) {
    const puzzle = GameScene.PUZZLES[puzzleId % GameScene.PUZZLES.length];
    this.trayShapes = puzzle.tray.map(s => ({ ...s }));
    // Deep copy grid
    this.gridState = puzzle.grid.map(row => row.slice());
  }
  // Draw highlight for valid placement during drag
  drawPlacementHighlight(shape, gridRow, gridCol) {
    const theme = getActiveTheme();
    // Remove previous highlight
    if (this.placementHighlight) {
      this.placementHighlight.clear();
    } else {
      this.placementHighlight = this.add.graphics();
      this.children.bringToTop(this.placementHighlight);
    }
    const pattern = shape.pattern;
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[0].length; c++) {
        if (pattern[r][c]) {
          const gr = gridRow + r;
          const gc = gridCol + c;
          if (
            gr >= 0 && gr < this.gridSize &&
            gc >= 0 && gc < this.gridSize &&
            !this.gridState[gr][gc]
          ) {
            const x = this.gridOrigin.x + gc * this.cellSize;
            const y = this.gridOrigin.y + gr * this.cellSize;
            // Draw highlight block
            this.placementHighlight.fillStyle(theme.highlight, theme.highlightFillAlpha);
            this.placementHighlight.fillRect(x + 2, y + 2, this.cellSize - 6, this.cellSize - 6);
            this.placementHighlight.lineStyle(3, theme.highlight, theme.highlightAlpha);
            this.placementHighlight.strokeRect(x + 2, y + 2, this.cellSize - 6, this.cellSize - 6);
          }
        }
      }
    }
  }
  // Draw placed blocks on grid
  redrawGridBlocks() {
    const theme = getActiveTheme();
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
    const theme = getActiveTheme();
    // Mode selector
    this.settingsModeButton = this.add.text(450, 340, 'Mode: ' + (GAME_MODE === 'normal' ? 'Normal' : GAME_MODE === 'daily' ? 'Daily' : 'Puzzle'), {
      fontSize: 24,
      color: theme.button.color,
      backgroundColor: theme.button.background,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive();
    this.settingsModeButton.on('pointerdown', () => {
      if (this.settingsOverlay) this.settingsOverlay.destroy();
      if (this.settingsTitle) this.settingsTitle.destroy();
      if (this.settingsThemeButton) this.settingsThemeButton.destroy();
      if (this.settingsDifficultyButton) this.settingsDifficultyButton.destroy();
      if (this.settingsModeButton) this.settingsModeButton.destroy();
      if (this.settingsCloseButton) this.settingsCloseButton.destroy();
      this.settingsOverlay = null;
      // Cycle mode
      if (GAME_MODE === 'normal') GAME_MODE = 'daily';
      else if (GAME_MODE === 'daily') GAME_MODE = 'puzzle';
      else GAME_MODE = 'normal';
      window._blockwoodJustRestartedFromSettings = true;
      this.time.delayedCall(0, () => {
        this.scene.restart();
      });
    });
    if (this.settingsOverlay) return;
    this.settingsOverlay = this.add.rectangle(450, 450, 400, 320, theme.overlay, theme.overlayAlpha).setOrigin(0.5);
    this.settingsTitle = this.add.text(450, 300, 'Settings', { fontFamily: 'Arial', fontSize: 36, color: theme.text, fontStyle: 'bold' }).setOrigin(0.5);
    // Theme selector
    this.settingsThemeButton = this.add.text(450, 380, 'Theme: ' + theme.name, {
      fontSize: 24,
      color: theme.button.color,
      backgroundColor: theme.button.background,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive();
    // Difficulty selector (missing creation)
    this.settingsDifficultyButton = this.add.text(450, 420, 'Difficulty: ' + (DIFFICULTY === 'easy' ? 'Easy' : 'Difficult'), {
      fontSize: 24,
      color: theme.button.color,
      backgroundColor: theme.button.background,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive();
    this.settingsThemeButton.on('pointerdown', () => {
      if (this.settingsOverlay) this.settingsOverlay.destroy();
      if (this.settingsTitle) this.settingsTitle.destroy();
      if (this.settingsThemeButton) this.settingsThemeButton.destroy();
      if (this.settingsDifficultyButton) this.settingsDifficultyButton.destroy();
      if (this.settingsCloseButton) this.settingsCloseButton.destroy();
      this.settingsOverlay = null;
      // Switch to next theme and restart scene
      activeThemeIdx = (activeThemeIdx + 1) % THEMES.length;
      window._blockwoodJustRestartedFromSettings = true;
      this.time.delayedCall(0, () => {
        this.scene.restart();
        if (this.placementHighlight) this.placementHighlight.destroy();
        this.placementHighlight = this.add.graphics();
        this.children.bringToTop(this.placementHighlight);
      });
    });
    this.settingsDifficultyButton.on('pointerdown', () => {
      if (this.settingsOverlay) this.settingsOverlay.destroy();
      if (this.settingsTitle) this.settingsTitle.destroy();
      if (this.settingsThemeButton) this.settingsThemeButton.destroy();
      if (this.settingsDifficultyButton) this.settingsDifficultyButton.destroy();
      if (this.settingsCloseButton) this.settingsCloseButton.destroy();
      this.settingsOverlay = null;
      DIFFICULTY = DIFFICULTY === 'easy' ? 'difficult' : 'easy';
      window._blockwoodJustRestartedFromSettings = true;
      this.time.delayedCall(0, () => {
        this.scene.restart();
        if (this.placementHighlight) this.placementHighlight.destroy();
        this.placementHighlight = this.add.graphics();
        this.children.bringToTop(this.placementHighlight);
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
      this.settingsOverlay.destroy();
      this.settingsTitle.destroy();
      this.settingsThemeButton.destroy();
      this.settingsDifficultyButton.destroy();
      this.settingsCloseButton.destroy();
      this.settingsOverlay = null;
    });
    this.children.bringToTop(this.settingsOverlay);
    this.children.bringToTop(this.settingsTitle);
    this.children.bringToTop(this.settingsModeButton);
    this.children.bringToTop(this.settingsThemeButton);
    this.children.bringToTop(this.settingsDifficultyButton);
    this.children.bringToTop(this.settingsCloseButton);
  }
  updateOptionsDisplay() {
    const theme = getActiveTheme();
    let modeLabel = 'Mode: ' + (GAME_MODE === 'normal' ? 'Normal' : GAME_MODE === 'daily' ? 'Daily' : 'Puzzle');
    let text = `${modeLabel}    Theme: ${theme.name}    Difficulty: ${DIFFICULTY === 'easy' ? 'Easy' : 'Difficult'}`;
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
  create() {
    const theme = getActiveTheme();
    this.gridSize = 10;
    this.cellSize = 60;
    this.gridOrigin = { x: 120, y: 120 };
    this.trayOrigin = { x: 120, y: 780 };
    // --- MODE LOGIC ---
    if (GAME_MODE === 'normal') {
      this.gridState = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
      this.trayShapes = [getRandomShape(), getRandomShape(), getRandomShape()];
    } else if (GAME_MODE === 'daily') {
      this.generateDailyChallenge();
      // Add a visual cue for daily seed (date)
      if (this.dailySeedText) this.dailySeedText.destroy();
      this.dailySeedText = this.add.text(450, 180, `Seed: ${this.getDailySeed()}`, {
        fontSize: 18,
        color: getActiveTheme().text,
        fontFamily: 'Arial',
        backgroundColor: 'rgba(0,0,0,0)',
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      }).setOrigin(0.5);
      this.children.bringToTop(this.dailySeedText);
    } else if (GAME_MODE === 'puzzle') {
      // Always load puzzle 0 for now
      this.loadPuzzle(0);
      // Show puzzle ID
      if (this.puzzleIdText) this.puzzleIdText.destroy();
      this.puzzleIdText = this.add.text(450, 180, `Puzzle #${GameScene.PUZZLES[0].id + 1}`, {
        fontSize: 18,
        color: getActiveTheme().text,
        fontFamily: 'Arial',
        backgroundColor: 'rgba(0,0,0,0)',
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      }).setOrigin(0.5);
      this.children.bringToTop(this.puzzleIdText);
    }
    // Always create placementHighlight graphics object after restart
    if (this.placementHighlight) this.placementHighlight.destroy();
    this.placementHighlight = this.add.graphics();
    this.children.bringToTop(this.placementHighlight);
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('blockwood_highscore') || '0');
    this.gridGraphics = this.add.graphics();
    this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: 32, color: theme.text });
    this.highScoreText = this.add.text(20, 60, 'High Score: ' + this.highScore, { fontSize: 24, color: theme.text });
    this.sfxPlace = this.sound.add('place');
    this.sfxClear = this.sound.add('clear');
    this.sfxGameOver = this.sound.add('gameover');
    this.drawGrid();
    this.drawTray();
    this.renderTrayShapes();
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.dragData = null;
    // Show settings button only if game not started
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
  refillTrayIfNeeded() {
    if (this.trayShapes.every(s => s === null)) {
      this.trayShapes = [getRandomShape(), getRandomShape(), getRandomShape()];
    }
    this.renderTrayShapes();
    // After refill, check if any move is possible
    if (!this.anyMovePossible()) {
      this.showGameOverOverlay();
    }
  }
  // ...existing code...
  // ...existing code...
  drawGrid() {
    const theme = getActiveTheme();
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
      trayIdx: this.trayShapes.indexOf(shape)
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
          this.showGlowEffect(x, y, shape.color, this.cellSize / 2, 350);
          this.showParticleBurst(x, y, shape.color, 8, 7, 400);
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
  drawTray() {
    // Calculate tray slot positions for each shape
    this.traySlotPositions = [];
    let trayY = this.trayOrigin.y;
    let trayX = this.trayOrigin.x;
    let spacing = 48;
    for (let i = 0; i < this.trayShapes.length; i++) {
      const shape = this.trayShapes[i];
      if (!shape) continue;
      const shapeWidth = shape.pattern[0].length;
      const shapeHeight = shape.pattern.length;
      const slotWidth = shapeWidth * this.cellSize + 16;
      const slotHeight = shapeHeight * this.cellSize + 16;
      this.traySlotPositions.push({
        x: trayX + i * (this.cellSize * 4 + spacing),
        width: slotWidth,
        height: slotHeight
      });
    }
  }
  // Returns true if all tray shapes can be placed somewhere
  anyMovePossible() {
    for (let i = 0; i < this.trayShapes.length; i++) {
      const shape = this.trayShapes[i];
      if (!shape) continue;
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
    const theme = getActiveTheme();
    if (this.gameOverOverlay) return;
    // Play game over sound
    if (this.sfxGameOver) this.sfxGameOver.play();
    this.gameOverOverlay = this.add.rectangle(450, 450, 600, 300, theme.overlay, theme.overlayAlpha).setOrigin(0.5);
    // Visual effect: big burst and glow for game over
    this.showGlowEffect(450, 450, theme.overlay, 300, 1200);
    this.showParticleBurst(450, 450, theme.button.color, 32, 18, 1200);
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
    this.setupDragHandlers(); // Ensure drag handlers are always set up after restart
    this.redrawGridBlocks();
    // Show settings button again after restart
    this.gameStarted = false;
    if (this.settingsButton) this.settingsButton.destroy();
    const theme = getActiveTheme();
    this.settingsButton = this.add.text(820, 60, 'Settings', {
      fontSize: 20,
      color: theme.button.color,
      backgroundColor: theme.button.background,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive();
    this.settingsButton.on('pointerdown', this.showSettingsMenu, this);
  }
  renderTrayShapes() {
    if (this.trayBlocks) { this.trayBlocks.forEach(block => block.destroy()); }
    this.trayBlocks = [];
    this.trayBlockMap = [];
    if (this.trayShapeGroups) { this.trayShapeGroups.forEach(g => g.destroy()); }
    this.trayShapeGroups = [];
    // Use dynamic slot positions from drawTray
    let slotPositions = this.traySlotPositions || [];
    for (let i = 0; i < this.trayShapes.length; i++) {
      const shape = this.trayShapes[i];
      if (!shape) continue;
      const { pattern, color } = shape;
      const shapeWidth = pattern[0].length;
      const shapeHeight = pattern.length;
      const slot = slotPositions[i] || { x: this.trayOrigin.x + i * (this.cellSize * 4 + 48), width: shapeWidth * this.cellSize + 16, height: shapeHeight * this.cellSize + 16 };
      const slotX = slot.x;
      const slotY = this.trayOrigin.y;
      // Center shape in slot
      const offsetX = slotX + (slot.width - shapeWidth * this.cellSize) / 2;
      const offsetY = slotY + (slot.height - shapeHeight * this.cellSize) / 2;
      const group = this.add.container(offsetX, offsetY);
      let shapeBlocks = [];
      for (let r = 0; r < shapeHeight; r++) {
        for (let c = 0; c < shapeWidth; c++) {
          if (pattern[r][c]) {
            const x = c * this.cellSize;
            const y = r * this.cellSize;
            const block = this.add.graphics();
            block.fillStyle(color, 1);
            block.fillRect(x, y, this.cellSize - 6, this.cellSize - 6);
            block.lineStyle(3, 0xffffff, 0.25);
            block.strokeRect(x, y, this.cellSize - 6, this.cellSize - 6);
            block.lineStyle(6, 0x222222, 0.15);
            block.strokeRect(x + 4, y + 4, this.cellSize - 14, this.cellSize - 14);
            block.alpha = 0;
            group.add(block);
            shapeBlocks.push(block);
            this.trayBlocks.push(block);
            // Animate fade in for new tray blocks
            this.tweens.add({
              targets: block,
              alpha: 1,
              duration: 400,
              delay: 100 * i,
              ease: 'Quad.Out'
            });
          }
        }
      }
      group.setSize(shapeWidth * this.cellSize, shapeHeight * this.cellSize);
      // Set hit area to cover all blocks in the group
      group.setInteractive(new Phaser.Geom.Rectangle(0, 0, shapeWidth * this.cellSize, shapeHeight * this.cellSize), Phaser.Geom.Rectangle.Contains);
      this.input.setDraggable(group, true);
      group.shapeIdx = i;
      this.trayShapeGroups.push(group);
      this.trayBlockMap.push({ shapeIdx: i, blocks: shapeBlocks, group });
    }
    // Ensure drag handlers are set up for new tray shapes
    this.setupDragHandlers();
    // Always bring highlight to top after tray shapes are rendered
    if (this.placementHighlight) {
      this.children.bringToTop(this.placementHighlight);
      this.placementHighlight.clear();
    }
  }
  setupDragHandlers() {
    // Remove previous drag event listeners to avoid duplicates
    this.input.off('dragstart');
    this.input.off('drag');
    this.input.off('dragend');
    // Always bring highlight to top before drag events
    if (this.placementHighlight) {
      this.children.bringToTop(this.placementHighlight);
      this.placementHighlight.clear();
    }
  // Offset for mobile UX: show shape above finger
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setAlpha(0.7);
      // Store offset so shape is above pointer
      const shapeHeight = gameObject.height || 0;
      gameObject._dragOffsetY = shapeHeight / 2 + 24; // 24px extra for finger size
    });
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      // Offset shape above pointer
      const offsetY = gameObject._dragOffsetY || 0;
      gameObject.x = dragX;
      gameObject.y = dragY - offsetY;
      // Placement highlight logic
      const shape = this.trayShapes[gameObject.shapeIdx];
      if (!shape) {
        if (this.placementHighlight) this.placementHighlight.clear();
        return;
      }
      // Calculate grid position under pointer
      const gridX = Math.floor((gameObject.x - this.gridOrigin.x) / this.cellSize);
      const gridY = Math.floor((gameObject.y - this.gridOrigin.y) / this.cellSize);
      if (this.canPlaceShapeAt(shape, gridY, gridX)) {
        this.drawPlacementHighlight(shape, gridY, gridX);
      } else {
        if (this.placementHighlight) this.placementHighlight.clear();
      }
    });
    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.setAlpha(1);
      // Try to place shape on grid
      const gridX = Math.floor((gameObject.x - this.gridOrigin.x) / this.cellSize);
      const gridY = Math.floor((gameObject.y - this.gridOrigin.y) / this.cellSize);
      const shape = this.trayShapes[gameObject.shapeIdx];
      if (shape && this.canPlaceShapeAt(shape, gridY, gridX)) {
        this.placeShapeAt(shape, gridY, gridX);
        // Remove shape from tray
        this.trayShapes[gameObject.shapeIdx] = null;
        this.refillTrayIfNeeded();
      } else {
        // Snap back to tray
        // Recalculate slot position
        if (!shape) return; // Prevent error if shape is null
        const shapeWidth = shape.pattern[0].length;
        const shapeHeight = shape.pattern.length;
        const slotPositions = this.traySlotPositions || [];
        const slot = slotPositions[gameObject.shapeIdx] || { x: this.trayOrigin.x + gameObject.shapeIdx * (this.cellSize * 4 + 48), width: shapeWidth * this.cellSize + 16, height: shapeHeight * this.cellSize + 16 };
        const slotX = slot.x;
        const slotY = this.trayOrigin.y;
        const offsetX = slotX + (slot.width - shapeWidth * this.cellSize) / 2;
        const offsetY = slotY + (slot.height - shapeHeight * this.cellSize) / 2;
        gameObject.x = offsetX;
        gameObject.y = offsetY;
      }
      // Remove highlight after drag ends
      if (this.placementHighlight) this.placementHighlight.clear();
    });
  }
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
  create() {
    const theme = getActiveTheme();
    this.gridSize = 10;
    this.cellSize = 60;
    this.gridOrigin = { x: 120, y: 120 };
    this.trayOrigin = { x: 120, y: 780 };
    this.gridState = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
    this.trayShapes = [getRandomShape(), getRandomShape(), getRandomShape()];
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('blockwood_highscore') || '0');
    this.gridGraphics = this.add.graphics();
    this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: 32, color: theme.text });
    this.highScoreText = this.add.text(20, 60, 'High Score: ' + this.highScore, { fontSize: 24, color: theme.text });
    this.sfxPlace = this.sound.add('place');
    this.sfxClear = this.sound.add('clear');
    this.sfxGameOver = this.sound.add('gameover');
    this.drawGrid();
    this.drawTray();
    this.renderTrayShapes();
    this.setupDragHandlers();
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.dragData = null;
    // Theme button removed; theme switching only via settings
    // Add settings button
    this.settingsButton = this.add.text(820, 60, 'Settings', {
      fontSize: 20,
      color: theme.button.color,
      backgroundColor: theme.button.background,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive();
    this.settingsButton.on('pointerdown', this.showSettingsMenu, this);
    this.updateOptionsDisplay();
  }

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
        this.showGlowEffect(x, y, 0xffffff, this.cellSize / 2, 500);
        this.showParticleBurst(x, y, 0xffffff, 10, 8, 600);
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
            localStorage.setItem('blockwood_highscore', this.highScore);
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
      const shape = this.trayShapes[shapeIdx];
      if (shape && this.canPlaceShapeAt(shape, gridY, gridX)) {
        this.placeShapeAt(shape, gridY, gridX);
        // Remove shape from tray
        this.trayShapes[shapeIdx] = null;
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
