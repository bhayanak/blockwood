// shapes.js
// Returns a random block shape with color information
export function generateShape() {
  // Define a set of classic block shapes with unique colors
  const shapeConfigs = [
    // Single block
    {
      pattern: [[1]],
      color: '#FF6B6B', // Coral red
      name: 'dot'
    },
    // 2x1
    {
      pattern: [[1, 1]],
      color: '#4ECDC4', // Turquoise
      name: 'domino-h'
    },
    // 1x2
    {
      pattern: [[1], [1]],
      color: '#45B7D1', // Sky blue
      name: 'domino-v'
    },
    // 3x1
    {
      pattern: [[1, 1, 1]],
      color: '#96CEB4', // Mint green
      name: 'line-h'
    },
    // 1x3
    {
      pattern: [[1], [1], [1]],
      color: '#FECA57', // Golden yellow
      name: 'line-v'
    },
    // 2x2 square
    {
      pattern: [[1, 1], [1, 1]],
      color: '#FF9FF3', // Pink
      name: 'square-2'
    },
    // 3x3 square
    {
      pattern: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
      color: '#54A0FF', // Bright blue
      name: 'square-3'
    },
    // L shape
    {
      pattern: [[1, 0], [1, 0], [1, 1]],
      color: '#5F27CD', // Purple
      name: 'L-shape'
    },
    // Reverse L
    {
      pattern: [[0, 1], [0, 1], [1, 1]],
      color: '#00D2D3', // Cyan
      name: 'L-reverse'
    },
    // T shape
    {
      pattern: [[1, 1, 1], [0, 1, 0]],
      color: '#FF9F43', // Orange
      name: 'T-shape'
    },
    // S shape
    {
      pattern: [[0, 1, 1], [1, 1, 0]],
      color: '#EE5A6F', // Rose
      name: 'S-shape'
    },
    // Z shape
    {
      pattern: [[1, 1, 0], [0, 1, 1]],
      color: '#0ABDE3', // Light blue
      name: 'Z-shape'
    },
    // 4x1
    {
      pattern: [[1, 1, 1, 1]],
      color: '#10AC84', // Emerald
      name: 'line-4h'
    },
    // 1x4
    {
      pattern: [[1], [1], [1], [1]],
      color: '#F79F1F', // Amber
      name: 'line-4v'
    },
    // 5x1
    {
      pattern: [[1, 1, 1, 1, 1]],
      color: '#A3CB38', // Lime
      name: 'line-5h'
    },
    // 1x5
    {
      pattern: [[1], [1], [1], [1], [1]],
      color: '#C44569', // Deep rose
      name: 'line-5v'
    },
  ];

  // Pick a random shape
  const idx = Math.floor(Math.random() * shapeConfigs.length);
  const config = shapeConfigs[idx];

  return {
    pattern: config.pattern,
    color: config.color,
    name: config.name
  };
}
