const SHAPE_PATTERNS = [
  [[1, 1], [1, 1]],
  [[1, 1, 1, 1]],
  [[1, 0], [1, 0], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
  [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
];
const BLOCK_COLORS = [0xff6b6b,0x48e6e6,0x6b8cff,0x7fffd4,0xffd86b,0x9dff6b,0xff6bff,0x6bffb2];
function getRandomShape() {
  const pattern = SHAPE_PATTERNS[Math.floor(Math.random()*SHAPE_PATTERNS.length)];
  const color = BLOCK_COLORS[Math.floor(Math.random()*BLOCK_COLORS.length)];
  return { pattern, color };
}
class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }
  create() {
    this.cameras.main.setBackgroundColor('#222');
    this.add.text(450, 40, 'Blockwood Puzzle', { fontFamily: 'Arial', fontSize: 48, color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    this.scoreText = this.add.text(40, 20, 'Score: 0', { fontSize: 24, color: '#fff' });
    this.highScoreText = this.add.text(700, 20, 'High Score: 0', { fontSize: 24, color: '#fff' });
    this.gridOrigin = { x: 150, y: 100 };
    this.gridSize = 9;
    this.cellSize = 48;
    this.gridGraphics = this.add.graphics();
  this.trayOrigin = { x: 150, y: 750 };
    this.trayGraphics = this.add.graphics();
    // Add grid state (2D array)
    this.gridState = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
    // Initialize tray shapes before drawing tray
    this.trayShapes = [getRandomShape(), getRandomShape(), getRandomShape()];
    this.drawGrid();
    this.drawTray();
    this.renderTrayShapes();
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.dragData = null;
  }
  drawGrid() {
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(2, 0xffffff, 0.2);
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        this.gridGraphics.strokeRect(this.gridOrigin.x + c * this.cellSize,this.gridOrigin.y + r * this.cellSize,this.cellSize,this.cellSize);
      }
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
  anyMovePossible() {
    for (let i = 0; i < this.trayShapes.length; i++) {
      const shape = this.trayShapes[i];
      if (!shape) continue;
      for (let r = 0; r <= this.gridSize - shape.pattern.length; r++) {
        for (let c = 0; c <= this.gridSize - shape.pattern[0].length; c++) {
          if (this.canPlaceShapeAt(shape, r, c)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  showGameOverOverlay() {
    if (this.gameOverOverlay) return;
    this.gameOverOverlay = this.add.rectangle(450, 450, 600, 300, 0x222222, 0.85).setOrigin(0.5);
    this.gameOverText = this.add.text(450, 400, 'Game Over!', { fontFamily: 'Arial', fontSize: 64, color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    this.restartButton = this.add.text(450, 500, 'Restart', { fontFamily: 'Arial', fontSize: 36, color: '#ff6b6b', backgroundColor: '#fff', padding: { left: 24, right: 24, top: 12, bottom: 12 } }).setOrigin(0.5).setInteractive();
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
    this.hideGameOverOverlay();
    this.gridState = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
    this.trayShapes = [getRandomShape(), getRandomShape(), getRandomShape()];
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
            group.add(block);
            shapeBlocks.push(block);
            this.trayBlocks.push(block);
          }
        }
      }
      group.setSize(shapeWidth * this.cellSize, shapeHeight * this.cellSize);
      group.setInteractive({ draggable: true });
      group.shapeIdx = i;
      this.trayShapeGroups.push(group);
      this.trayBlockMap.push({ shapeIdx: i, blocks: shapeBlocks, group });
    }
    // Enable drag events for groups
    this.input.setDraggable(this.trayShapeGroups);
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setAlpha(0.7);
    });
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
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
        this.renderTrayShapes();
      } else {
        // Snap back to tray
        // Recalculate slot position
        if (!shape) return; // Prevent error if shape is null
        const shapeWidth = shape.pattern[0].length;
        const shapeHeight = shape.pattern.length;
        const slot = slotPositions[gameObject.shapeIdx] || { x: this.trayOrigin.x + gameObject.shapeIdx * (this.cellSize * 4 + 48), width: shapeWidth * this.cellSize + 16, height: shapeHeight * this.cellSize + 16 };
        const slotX = slot.x;
        const slotY = this.trayOrigin.y;
        const offsetX = slotX + (slot.width - shapeWidth * this.cellSize) / 2;
        const offsetY = slotY + (slot.height - shapeHeight * this.cellSize) / 2;
        gameObject.x = offsetX;
        gameObject.y = offsetY;
      }
    });
  // No extra closing brace here; all subsequent methods should be inside the class
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
  onPointerMove(pointer) {
    if (this.dragData) {
      const { blocks, offsetX, offsetY } = this.dragData;
      // Move all blocks together
      blocks.forEach((block, idx) => {
        block.x = pointer.x - offsetX + (block.x - this.dragData.startPos[idx].x);
        block.y = pointer.y - offsetY + (block.y - this.dragData.startPos[idx].y);
      });
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
    this.redrawGridBlocks();
    this.checkAndClearLines();
    // After placing, check for game over
    if (!this.anyMovePossible()) {
      this.showGameOverOverlay();
    }
  }

  // Draw placed blocks on grid
  redrawGridBlocks() {
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
          block.lineStyle(3, 0xffffff, 0.25);
          block.strokeRect(x + 2, y + 2, this.cellSize - 6, this.cellSize - 6);
          block.lineStyle(6, 0x222222, 0.15);
          block.strokeRect(x + 6, y + 6, this.cellSize - 14, this.cellSize - 14);
          this.gridBlocks.push(block);
        }
      }
    }
  }

  // Check and clear filled rows/columns
  checkAndClearLines() {
    let cleared = false;
    // Rows
    for (let r = 0; r < this.gridSize; r++) {
      if (this.gridState[r].every(cell => cell)) {
        for (let c = 0; c < this.gridSize; c++) this.gridState[r][c] = 0;
        cleared = true;
        this.scoreText.setText('Score: ' + (this.getScore() + 10));
      }
    }
    // Columns
    for (let c = 0; c < this.gridSize; c++) {
      let full = true;
      for (let r = 0; r < this.gridSize; r++) {
        if (!this.gridState[r][c]) full = false;
      }
      if (full) {
        for (let r = 0; r < this.gridSize; r++) this.gridState[r][c] = 0;
        cleared = true;
        this.scoreText.setText('Score: ' + (this.getScore() + 10));
      }
    }
    if (cleared) this.redrawGridBlocks();
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
        this.renderTrayShapes();
          if (!shape) return; // Prevent error if shape is null
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
