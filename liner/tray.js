// Import shape patterns and themes from const.js only
import { SHAPE_PATTERNS_EASY, SHAPE_PATTERNS_DIFFICULT, THEMES } from './const.js';

// Helper to get current theme (assumes game.js sets current theme index)
function getActiveTheme() {
  // Use window.THEME_IDX if available, else default to first theme
  const idx = typeof window.THEME_IDX === 'number' ? window.THEME_IDX : 0;
  return THEMES[idx] || THEMES[0];
}
// Standalone named export for getRandomShape for use in game.js
export function getRandomShape() {
  // Use global DIFFICULTY set by game.js
  const difficulty = window.DIFFICULTY === 'difficult' ? 'difficult' : 'easy';
  const patterns = difficulty === 'easy' ? SHAPE_PATTERNS_EASY : SHAPE_PATTERNS_DIFFICULT;
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const theme = getActiveTheme();
  const blockColors = Array.isArray(theme.blockColors) && theme.blockColors.length > 0 ? theme.blockColors : [0x888888];
  const color = blockColors[Math.floor(Math.random() * blockColors.length)];
  return { pattern, color };
}
// tray.js
// Tray logic module for TimberTiles
// Responsibilities: tray state, tray shape generation, tray refill, tray rendering


// Usage: import { Tray } from './tray.js';
// Tray manages trayShapes, slot positions, rendering, drag, and refill
export class Tray {
  constructor(scene, options) {
    this.scene = scene;
    this.gridSize = options.gridSize || 10;
    this.cellSize = options.cellSize || 60;
    this.trayOrigin = options.trayOrigin || { x: 120, y: 780 };
    this.trayShapes = [getRandomShape(), getRandomShape(), getRandomShape()];
    this.traySlotPositions = [];
    this.trayBlocks = [];
    this.trayBlockMap = [];
    this.trayShapeGroups = [];
    this.setupDragHandlers();
  }


  refillTrayIfNeeded() {
    if (this.trayShapes.every(s => s === null)) {
      this.trayShapes = [getRandomShape(), getRandomShape(), getRandomShape()];
    }
    this.renderTrayShapes();
    // After refill, check if any move is possible
    if (!this.scene.anyMovePossible()) {
      this.scene.showGameOverOverlay();
    }
  }

  drawTray() {
    // Always create 3 slot positions (left, middle, right)
    this.traySlotPositions = [];
    let trayY = this.trayOrigin.y;
    let trayX = this.trayOrigin.x;

    // Use smaller spacing and sizes for mobile
    const width = this.scene.sys.game.config.width;
    const isMobile = width < 600;
    const trayCellSize = isMobile ? Math.max(30, this.cellSize * 0.6) : Math.max(40, this.cellSize * 0.7);
    const spacing = isMobile ? 20 : 32;

    for (let i = 0; i < 3; i++) {
      // Use default size for empty slots, or actual shape size if present
      let shape = this.trayShapes[i];
      let shapeWidth = shape && shape.pattern ? shape.pattern[0].length : 2;
      let shapeHeight = shape && shape.pattern ? shape.pattern.length : 2;
      let slotWidth = shapeWidth * trayCellSize + 12;
      let slotHeight = shapeHeight * trayCellSize + 12;
      this.traySlotPositions.push({
        x: trayX + i * (trayCellSize * 4 + spacing),
        width: slotWidth,
        height: slotHeight
      });
    }
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
      // Use smaller cell size for tray shapes (especially on mobile)
      const width = this.scene.sys.game.config.width;
      const isMobile = width < 600;
      const trayCellSize = isMobile ? Math.max(30, this.cellSize * 0.6) : Math.max(40, this.cellSize * 0.7);

      // Center shape in slot
      const offsetX = slotX + (slot.width - shapeWidth * trayCellSize) / 2;
      const offsetY = slotY + (slot.height - shapeHeight * trayCellSize) / 2;
      const group = this.scene.add.container(offsetX, offsetY);
      let shapeBlocks = [];
      for (let r = 0; r < shapeHeight; r++) {
        for (let c = 0; c < shapeWidth; c++) {
          if (pattern[r][c]) {
            const x = c * trayCellSize;
            const y = r * trayCellSize;
            const block = this.scene.add.graphics();
            block.fillStyle(color, 1);
            block.fillRect(x, y, trayCellSize - 4, trayCellSize - 4);
            block.lineStyle(2, 0xffffff, 0.25);
            block.strokeRect(x, y, trayCellSize - 4, trayCellSize - 4);
            block.lineStyle(3, 0x222222, 0.15);
            block.strokeRect(x + 2, y + 2, trayCellSize - 8, trayCellSize - 8);
            block.alpha = 0;
            group.add(block);
            shapeBlocks.push(block);
            this.trayBlocks.push(block);
            // Animate fade in for new tray blocks
            this.scene.tweens.add({
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
      this.scene.input.setDraggable(group, true);
      group.shapeIdx = i;
      this.trayShapeGroups.push(group);
      this.trayBlockMap.push({ shapeIdx: i, blocks: shapeBlocks, group });
    }
    // Ensure drag handlers are set up for new tray shapes
    this.setupDragHandlers();
    // Always bring highlight to top after tray shapes are rendered
    if (this.scene.placementHighlight) {
      this.scene.children.bringToTop(this.scene.placementHighlight);
      this.scene.placementHighlight.clear();
    }
  }

  setupDragHandlers() {
    // Remove previous drag event listeners to avoid duplicates
    this.scene.input.off('dragstart');
    this.scene.input.off('drag');
    this.scene.input.off('dragend');
    // Always bring highlight to top before drag events
    if (this.scene.placementHighlight) {
      this.scene.children.bringToTop(this.scene.placementHighlight);
      this.scene.placementHighlight.clear();
    }
    // Offset for mobile UX: show shape above finger
    this.scene.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setAlpha(0.7);
      // Store offset so shape is above pointer
      const shapeHeight = gameObject.height || 0;
      gameObject._dragOffsetY = shapeHeight / 2 + 24; // 24px extra for finger size
    });
    this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      // Offset shape above pointer
      const offsetY = gameObject._dragOffsetY || 0;
      gameObject.x = dragX;
      gameObject.y = dragY - offsetY;
      // Placement highlight logic
      const shape = this.trayShapes[gameObject.shapeIdx];
      if (!shape) {
        if (this.scene.placementHighlight) this.scene.placementHighlight.clear();
        return;
      }
      // Calculate grid position under pointer
      const gridX = Math.floor((gameObject.x - this.scene.gridOrigin.x) / this.cellSize);
      const gridY = Math.floor((gameObject.y - this.scene.gridOrigin.y) / this.cellSize);
      if (this.scene.canPlaceShapeAt(shape, gridY, gridX)) {
        this.scene.drawPlacementHighlight(shape, gridY, gridX);
      } else {
        if (this.scene.placementHighlight) this.scene.placementHighlight.clear();
      }
    });
    this.scene.input.on('dragend', (pointer, gameObject) => {
      gameObject.setAlpha(1);
      // Try to place shape on grid
      const gridX = Math.floor((gameObject.x - this.scene.gridOrigin.x) / this.cellSize);
      const gridY = Math.floor((gameObject.y - this.scene.gridOrigin.y) / this.cellSize);
      const shape = this.trayShapes[gameObject.shapeIdx];
      if (shape && this.scene.canPlaceShapeAt(shape, gridY, gridX)) {
        this.scene.placeShapeAt(shape, gridY, gridX);
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
      if (this.scene.placementHighlight) this.scene.placementHighlight.clear();
    });
  }
}
