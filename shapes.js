// shapes.js
// Returns a random block shape as a 2D array (1 = filled, 0 = empty)
export function generateShape() {
  // Define a set of classic block shapes (like Tetris and Woodoku)
  const shapes = [
    // Single block
    [[1]],
    // 2x1
    [[1,1]],
    // 1x2
    [[1],[1]],
    // 3x1
    [[1,1,1]],
    // 1x3
    [[1],[1],[1]],
    // 2x2 square
    [[1,1],[1,1]],
    // 3x3 square
    [[1,1,1],[1,1,1],[1,1,1]],
    // L shape
    [[1,0],[1,0],[1,1]],
    // Reverse L
    [[0,1],[0,1],[1,1]],
    // T shape
    [[1,1,1],[0,1,0]],
    // S shape
    [[0,1,1],[1,1,0]],
    // Z shape
    [[1,1,0],[0,1,1]],
    // 4x1
    [[1,1,1,1]],
    // 1x4
    [[1],[1],[1],[1]],
    // 5x1
    [[1,1,1,1,1]],
    // 1x5
    [[1],[1],[1],[1],[1]],
  ];
  // Pick a random shape
  const idx = Math.floor(Math.random() * shapes.length);
  return shapes[idx];
}
