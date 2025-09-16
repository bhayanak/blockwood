// Centralized constants for TimberTiles game
export const THEMES = [
  {
    name: 'Vibrant',
    blockColors: [0xff6b6b, 0x48e6e6, 0x6b8cff, 0x7fffd4, 0xffd86b, 0x9dff6b, 0xff6bff, 0x6bffb2],
    background: '#232946',
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
  }
];

export const PUZZLES = [
  {
    id: 0,
    grid: [
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

export const SHAPE_PATTERNS_EASY = [
  [[1, 1], [1, 1]],
  [[1, 1, 1, 1]],
  [[1, 0], [1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 0], [1, 0]],
  [[1], [1], [1]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 1], [1, 0, 0]],
  // Small L
  [[1, 1], [1, 0]],
  // Small reverse L
  [[1, 1], [0, 1]],
  // Small line (3)
  [[1, 1, 1]],
  // Small vertical line (3)
  [[1], [1], [1]],
  // Small line (2)
  [[1, 1]],
  // Small vertical line (2)
  [[1], [1]],
  // Small line (1)
  [[1]],
];

export const SHAPE_PATTERNS_DIFFICULT = [
  ...SHAPE_PATTERNS_EASY,
  [[1, 0], [1, 0], [1, 1]],
  [[1, 1, 1], [0, 1, 0]], // plus shape
  [[0, 1, 0], [1, 1, 1], [0, 1, 0]], // big plus
  [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
  // Big L
  [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
  // Big square
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  // Long line (5)
  [[1, 1, 1, 1, 1]],
  // Vertical line (4)
  [[1], [1], [1], [1]],
  // Vertical line (5)
  [[1], [1], [1], [1], [1]],
  // Big reverse L
  [[1, 1, 1], [0, 0, 1], [0, 0, 1]],
  // Big reverse L flipped
  [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
  // Big L flipped
  [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
  // Big L upside down
  [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
  // Big reverse L upside down
  [[1, 1, 1], [0, 0, 1], [0, 0, 1]],
  // Big C/up
  [[1, 0, 1], [1, 0, 1], [1, 1, 1]],
  // Big C/down
  [[1, 1, 1], [1, 0, 1], [1, 0, 1]],
  // Big C/left
  [[1, 1, 1], [1, 0, 1], [1, 1, 1]],
  // Big C/right
  [[1, 1, 1], [0, 1, 0], [1, 1, 1]],
  // Outline square
  [[1, 1, 1], [1, 0, 1], [1, 1, 1]],
  // small C/up
  [[1, 0, 1], [1, 1, 1]],
  // small C/down
  [[1, 1, 1], [1, 0, 1]],
  // small C/left
  [[1, 1], [1, 0], [1, 1]],
  // small C/right
  [[1, 1], [0, 1], [1, 1]],
  // Z up
  [[1, 0], [1, 1], [0, 1]],
  // Z down
  [[0, 1], [1, 1], [1, 0]],
];
