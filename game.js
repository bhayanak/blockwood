// game.js
// Returns an array of matches: { type: 'row'|'col'|'block', index: number }
export function checkMatches(grid) {
  const size = grid.length;
  const matches = [];
  // Check rows
  for (let r = 0; r < size; r++) {
    if (grid[r].every(cell => cell)) {
      matches.push({ type: 'row', index: r });
    }
  }
  // Check columns
  for (let c = 0; c < size; c++) {
    let full = true;
    for (let r = 0; r < size; r++) {
      if (!grid[r][c]) { full = false; break; }
    }
    if (full) matches.push({ type: 'col', index: c });
  }
  // Check 3x3 blocks
  for (let br = 0; br < size; br += 3) {
    for (let bc = 0; bc < size; bc += 3) {
      let full = true;
      for (let r = br; r < br + 3; r++) {
        for (let c = bc; c < bc + 3; c++) {
          if (!grid[r][c]) { full = false; break; }
        }
        if (!full) break;
      }
      if (full) matches.push({ type: 'block', index: br/3*3 + bc/3 });
    }
  }
  return matches;
}

// Clears matched rows, columns, and blocks in the grid
export function clearMatches(grid, matches) {
  const size = grid.length;
  matches.forEach(match => {
    if (match.type === 'row') {
      for (let c = 0; c < size; c++) grid[match.index][c] = 0;
    } else if (match.type === 'col') {
      for (let r = 0; r < size; r++) grid[r][match.index] = 0;
    } else if (match.type === 'block') {
      const br = Math.floor(match.index / 3) * 3;
      const bc = (match.index % 3) * 3;
      for (let r = br; r < br + 3; r++) {
        for (let c = bc; c < bc + 3; c++) {
          grid[r][c] = 0;
        }
      }
    }
  });
}
