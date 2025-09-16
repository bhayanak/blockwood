// grid.js
// Grid logic module for TimberTiles
// Usage: import { Grid } from './grid.js';

export class Grid {
  constructor(gridSize = 10) {
    this.gridSize = gridSize;
    this.state = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  }

  reset() {
    this.state = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
  }

  placeShape(shape, gridRow, gridCol) {
    const pattern = shape.pattern;
    let placedBlocks = [];
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[0].length; c++) {
        if (pattern[r][c]) {
          const gr = gridRow + r;
          const gc = gridCol + c;
          placedBlocks.push({ r: gr, c: gc, prev: this.state[gr][gc] });
          this.state[gr][gc] = shape.color;
        }
      }
    }
    return placedBlocks;
  }

  canPlaceShape(shape, gridRow, gridCol) {
    const pattern = shape.pattern;
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[0].length; c++) {
        if (pattern[r][c]) {
          const gr = gridRow + r;
          const gc = gridCol + c;
          if (
            gr < 0 || gr >= this.gridSize ||
            gc < 0 || gc >= this.gridSize ||
            this.state[gr][gc]
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  checkAndClearLines() {
    let linesCleared = 0;
    let clearedRows = [];
    let clearedCols = [];
    // Rows
    for (let r = 0; r < this.gridSize; r++) {
      if (this.state[r].every(cell => cell)) {
        clearedRows.push(r);
        linesCleared++;
      }
    }
    // Columns
    for (let c = 0; c < this.gridSize; c++) {
      let full = true;
      for (let r = 0; r < this.gridSize; r++) {
        if (!this.state[r][c]) full = false;
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
        clearedBlocks.push({ r, c, prev: this.state[r][c] });
        this.state[r][c] = 0;
      }
    }
    for (let c of clearedCols) {
      for (let r = 0; r < this.gridSize; r++) {
        if (!clearedBlocks.some(b => b.r === r && b.c === c)) {
          clearedBlocks.push({ r, c, prev: this.state[r][c] });
          this.state[r][c] = 0;
        }
      }
    }
    return { linesCleared, clearedBlocks, clearedRows, clearedCols };
  }

  getScore() {
    let score = 0;
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        if (this.state[r][c]) score++;
      }
    }
    return score;
  }
}

// Usage notes:
// - Instantiate with: const grid = new Grid(10);
// - Use grid.placeShape(shape, row, col) to place a shape
// - Use grid.canPlaceShape(shape, row, col) to check placement
// - Use grid.checkAndClearLines() to clear filled lines and get cleared blocks
// - Use grid.getScore() to get current score
