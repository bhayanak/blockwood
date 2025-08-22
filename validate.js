// validate.js
export function canPlaceShape(grid, shape, position) {
  const { row, col } = position;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const gr = row + r;
        const gc = col + c;
        // Out of bounds
        if (gr < 0 || gr >= grid.length || gc < 0 || gc >= grid[0].length) return false;
        // Overlap
        if (grid[gr][gc]) return false;
      }
    }
  }
  return true;
}
