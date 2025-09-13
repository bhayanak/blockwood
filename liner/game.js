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
  }
  // End of GameScene class
];
let activeThemeIdx = 0;
function getActiveTheme() { return THEMES[activeThemeIdx]; }
// Difficulty modes
let DIFFICULTY = 'easy'; // 'easy' or 'difficult'
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
    if (this.settingsOverlay) return;
    this.settingsOverlay = this.add.rectangle(450, 450, 400, 320, theme.overlay, theme.overlayAlpha).setOrigin(0.5);
    this.settingsTitle = this.add.text(450, 320, 'Settings', { fontFamily: 'Arial', fontSize: 36, color: theme.text, fontStyle: 'bold' }).setOrigin(0.5);
    // Theme selector
    this.settingsThemeButton = this.add.text(450, 380, 'Theme: ' + theme.name, {
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
      activeThemeIdx = (activeThemeIdx + 1) % THEMES.length;
      this.time.delayedCall(0, () => this.scene.restart());
    });
    // Difficulty selector
    this.settingsDifficultyButton = this.add.text(450, 440, 'Difficulty: ' + (DIFFICULTY === 'easy' ? 'Easy' : 'Difficult'), {
      fontSize: 24,
      color: '#fff',
      backgroundColor: '#444',
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive();
    this.settingsDifficultyButton.on('pointerdown', () => {
      if (this.settingsOverlay) this.settingsOverlay.destroy();
      if (this.settingsTitle) this.settingsTitle.destroy();
      if (this.settingsThemeButton) this.settingsThemeButton.destroy();
      if (this.settingsDifficultyButton) this.settingsDifficultyButton.destroy();
      if (this.settingsCloseButton) this.settingsCloseButton.destroy();
      this.settingsOverlay = null;
      DIFFICULTY = DIFFICULTY === 'easy' ? 'difficult' : 'easy';
      this.time.delayedCall(0, () => this.scene.restart());
    });
    // Close button
    this.settingsCloseButton = this.add.text(450, 520, 'Close', {
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
    this.children.bringToTop(this.settingsThemeButton);
    this.children.bringToTop(this.settingsDifficultyButton);
    this.children.bringToTop(this.settingsCloseButton);
  }
  updateOptionsDisplay() {
    const theme = getActiveTheme();
    const text = `Theme: ${theme.name}    Difficulty: ${DIFFICULTY === 'easy' ? 'Easy' : 'Difficult'}`;
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
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.dragData = null;
    // Add theme switcher button
    this.themeButton = this.add.text(820, 20, theme.name, {
      fontSize: 20,
      color: theme.button.color,
      backgroundColor: theme.button.background,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive();
    this.themeButton.on('pointerdown', () => {
      activeThemeIdx = (activeThemeIdx + 1) % THEMES.length;
      this.scene.restart();
    });
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
  drawPlacementHighlight(shape, gridRow, gridCol) {
    const theme = getActiveTheme();
    // Remove previous highlight
    if (this.placementHighlight) {
      this.placementHighlight.clear();
    } else {
      this.placementHighlight = this.add.graphics();
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
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[0].length; c++) {
        if (pattern[r][c]) {
          const gr = gridRow + r;
          const gc = gridCol + c;
          this.gridState[gr][gc] = shape.color;
        }
      }
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
    this.gameOverText = this.add.text(450, 400, 'Game Over!', { fontFamily: 'Arial', fontSize: 64, color: theme.text, fontStyle: 'bold' }).setOrigin(0.5);
    this.restartButton = this.add.text(450, 500, 'Restart', { fontFamily: 'Arial', fontSize: 36, color: theme.button.color, backgroundColor: theme.button.background, padding: { left: 24, right: 24, top: 12, bottom: 12 } }).setOrigin(0.5).setInteractive();
    this.restartButton.on('pointerdown', () => {
      this.restartGame();
    });
    this.children.bringToTop(this.gameOverOverlay);
    this.children.bringToTop(this.gameOverText);
    this.children.bringToTop(this.restartButton);
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
    this.redrawGridBlocks();
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
  }
  setupDragHandlers() {
    // Remove previous drag event listeners to avoid duplicates
    this.input.off('dragstart');
    this.input.off('drag');
    this.input.off('dragend');
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
    // Add theme switcher button
    this.themeButton = this.add.text(820, 20, theme.name, {
      fontSize: 20,
      color: theme.button.color,
      backgroundColor: theme.button.background,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive();
    this.themeButton.on('pointerdown', () => {
      activeThemeIdx = (activeThemeIdx + 1) % THEMES.length;
      this.scene.restart();
    });
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
      // Animate fade out (no scale, no movement)
      let fadePromises = [];
      for (let blockInfo of blocksToClear) {
        const idx = blockInfo.r * this.gridSize + blockInfo.c;
        const block = this.gridBlocks[idx];
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
