// Core game constants and configuration
export const GAME_CONFIG = {
    width: 400,
    height: 620,
    backgroundColor: '#1a1a2e', // Deep purple instead of black
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 320,
            height: 480
        },
        max: {
            width: 600,
            height: 900
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

// Grid configuration
export const GRID = {
    ROWS: 10,
    COLS: 10,
    CELL_SIZE: 30,
    MARGIN: 5,
    START_X: 25, // Centered: (400 - 300) / 2 = 50, perfectly centered
    START_Y: 45,  // Moved up more to create better spacing
    HIGHLIGHT_COLOR: 0x00ff00,
    INVALID_COLOR: 0xff0000
};

// Game modes
export const GAME_MODES = {
    NORMAL: 'normal',
    DAILY: 'daily',
    PUZZLE: 'puzzle',
    ADVENTURE: 'adventure',
    ENDLESS: 'endless'
};

// Difficulty levels
export const DIFFICULTY = {
    EASY: 'easy',
    HARD: 'hard'
};

// Power-up types
export const POWER_UPS = {
    // Basic Power-ups
    CLEAR_ROW: 'CLEAR_ROW',
    SWAP_TRAY: 'SWAP_TRAY',
    EXTRA_UNDO: 'EXTRA_UNDO',

    // Advanced Power-ups
    TIME_SLOW: 'TIME_SLOW',
    BLOCK_PREVIEW: 'BLOCK_PREVIEW',
    LINE_BLAST: 'LINE_BLAST',
    COLOR_MATCH: 'COLOR_MATCH',
    PERFECT_FIT: 'PERFECT_FIT',
    SECOND_CHANCE: 'SECOND_CHANCE'
};

// Power-up costs (coins for normal mode, score for endless)
export const POWER_UP_COSTS = {
    NORMAL: {
        'CLEAR_ROW': 50,
        'SWAP_TRAY': 30,
        'EXTRA_UNDO': 40,
        'TIME_SLOW': 75,
        'BLOCK_PREVIEW': 60,
        'LINE_BLAST': 80,
        'COLOR_MATCH': 45,
        'PERFECT_FIT': 90,
        'SECOND_CHANCE': 100
    },
    ENDLESS: {
        'CLEAR_ROW': 500,
        'SWAP_TRAY': 300,
        'EXTRA_UNDO': 400,
        'TIME_SLOW': 750,
        'BLOCK_PREVIEW': 600,
        'LINE_BLAST': 800,
        'COLOR_MATCH': 450,
        'PERFECT_FIT': 900,
        'SECOND_CHANCE': 1000
    }
};

// Power-up metadata for shop display
export const POWER_UP_INFO = {
    'CLEAR_ROW': {
        name: 'Line Blast',
        icon: '💥',
        description: 'Clear any row or column instantly',
        category: 'utility',
        rarity: 'common'
    },
    'SWAP_TRAY': {
        name: 'Shape Shuffle',
        icon: '🔄',
        description: 'Get a new set of shapes in your tray',
        category: 'utility',
        rarity: 'common'
    },
    'EXTRA_UNDO': {
        name: 'Rewind',
        icon: '⏪',
        description: 'Undo your last move (one-time use)',
        category: 'utility',
        rarity: 'common'
    },
    'TIME_SLOW': {
        name: 'Time Warp',
        icon: '⏰',
        description: 'Slow down time for 30 seconds',
        category: 'temporal',
        rarity: 'rare'
    },
    'BLOCK_PREVIEW': {
        name: 'Future Sight',
        icon: '🔮',
        description: 'See the next 3 shapes coming',
        category: 'information',
        rarity: 'uncommon'
    },
    'LINE_BLAST': {
        name: 'Precision Strike',
        icon: '🎯',
        description: 'Clear any specific line you choose',
        category: 'utility',
        rarity: 'rare'
    },
    'COLOR_MATCH': {
        name: 'Color Radar',
        icon: '🌈',
        description: 'Highlight all matching colored blocks',
        category: 'information',
        rarity: 'common'
    },
    'PERFECT_FIT': {
        name: 'Smart Placement',
        icon: '🧠',
        description: 'Show optimal placement suggestions',
        category: 'assistance',
        rarity: 'epic'
    },
    'SECOND_CHANCE': {
        name: 'Phoenix Revival',
        icon: '🔥',
        description: 'Continue after game over (one-time use)',
        category: 'survival',
        rarity: 'legendary'
    }
};

// Scoring system
export const SCORING = {
    BASE_LINE_SCORE: 100,
    DIFFICULTY_MULTIPLIERS: {
        'easy': 1.0,
        'hard': 1.5
    },
    COINS_PER_SCORE: 0.1, // 1 coin per 10 points
    COMBO_MULTIPLIER: 1.2
};

// Adventure mode chapters
export const ADVENTURE_CHAPTERS = {
    FOREST_START: {
        id: 'FOREST_START',
        name: 'Forest Start',
        theme: 'forest',
        unlocked: true,
        description: 'Begin your journey in the mystical forest where ancient blocks await...',
        story: 'Long ago, a mysterious forest grew blocks of incredible power. Your quest begins here.',
        objectives: [
            { type: 'score', target: 500, description: 'Score 500 points' },
            { type: 'lines', target: 3, description: 'Clear 3 lines' },
            { type: 'moves', target: 20, description: 'Complete in 20 moves or less' }
        ],
        rewards: { coins: 50, stars: 3 },
        difficulty: 'EASY',
        specialRules: { timeLimit: null, limitedMoves: 20 }
    },
    CRYSTAL_LAKE: {
        id: 'CRYSTAL_LAKE',
        name: 'Crystal Lake',
        theme: 'space',
        unlocked: false,
        description: 'The crystal waters reveal patterns of cosmic significance...',
        story: 'The lake reflects not just your image, but the very essence of puzzle mastery.',
        objectives: [
            { type: 'score', target: 2500, description: 'Score 2,500 points' },
            { type: 'combo', target: 3, description: 'Achieve a 3x combo' },
            { type: 'powerups', target: 2, description: 'Use 2 power-ups' }
        ],
        rewards: { coins: 75, stars: 3 },
        difficulty: 'MEDIUM',
        specialRules: { timeLimit: 300, limitedMoves: null }
    },
    MOUNTAIN_PASS: {
        id: 'MOUNTAIN_PASS',
        name: 'Mountain Pass',
        theme: 'neon',
        unlocked: false,
        description: 'Electric storms create the most challenging patterns known...',
        story: 'At the peak, only masters of the block arts can navigate the neon lightning.',
        objectives: [
            { type: 'score', target: 5000, description: 'Score 5,000 points' },
            { type: 'lines', target: 10, description: 'Clear 10 lines' },
            { type: 'perfect', target: 1, description: 'Complete without misplaced blocks' }
        ],
        rewards: { coins: 100, stars: 3 },
        difficulty: 'HARD',
        specialRules: { timeLimit: 240, limitedMoves: 20 }
    },
    DESERT_RUINS: {
        id: 'DESERT_RUINS',
        name: 'Desert Ruins',
        theme: 'pastel',
        unlocked: false,
        description: 'Ancient civilizations left puzzle secrets buried in the sand...',
        story: 'Hieroglyphs speak of block masters who could reshape reality itself.',
        objectives: [
            { type: 'score', target: 7500, description: 'Score 7,500 points' },
            { type: 'efficiency', target: 80, description: 'Achieve 80% placement efficiency' },
            { type: 'chain', target: 5, description: 'Create a 5-move chain reaction' }
        ],
        rewards: { coins: 125, stars: 3 },
        difficulty: 'HARD',
        specialRules: { timeLimit: null, limitedMoves: 25, sandstorm: true }
    },
    NEON_CITY: {
        id: 'NEON_CITY',
        name: 'Neon City',
        theme: 'neon',
        unlocked: false,
        description: 'The future city pulses with digital block energy...',
        story: 'In the city of tomorrow, blocks flow like data streams through neon veins.',
        objectives: [
            { type: 'score', target: 10000, description: 'Score 10,000 points' },
            { type: 'speed', target: 60, description: 'Complete in under 60 seconds' },
            { type: 'powerups', target: 5, description: 'Use 5 different power-ups' }
        ],
        rewards: { coins: 150, stars: 3 },
        difficulty: 'EXPERT',
        specialRules: { timeLimit: 120, cyber_mode: true }
    },
    FINAL_SUMMIT: {
        id: 'FINAL_SUMMIT',
        name: 'Final Summit',
        theme: 'colorblind',
        unlocked: false,
        description: 'The ultimate challenge awaits at the peak of block mastery...',
        story: 'Here, all elements combine in the final test of a true Block Quest master.',
        objectives: [
            { type: 'score', target: 15000, description: 'Score 15,000 points' },
            { type: 'perfection', target: 100, description: 'Achieve 100% accuracy' },
            { type: 'mastery', target: 1, description: 'Complete the ultimate challenge' }
        ],
        rewards: { coins: 200, stars: 3, title: 'Block Master' },
        difficulty: 'LEGENDARY',
        specialRules: { timeLimit: 180, limitedMoves: 30, ultimate_mode: true }
    }
};

// Puzzle packs and challenges
export const PUZZLE_PACKS = {
    BEGINNER: {
        id: 'BEGINNER',
        name: 'First Steps',
        description: 'Learn the basics of puzzle solving',
        theme: 'vibrant',
        unlocked: true,
        puzzles: [
            {
                id: 'B001',
                name: 'Simple Start',
                description: 'Clear your first line',
                difficulty: 1,
                targetMoves: 3,
                targetScore: 100,
                initialGrid: [
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1]
                ],
                availableShapes: ['I_1', 'O'],
                objectives: [
                    { type: 'lines', target: 1, description: 'Clear 1 line' }
                ],
                hints: ['Place the line piece to complete the bottom row'],
                starRequirements: { moves: [3, 2, 1] }
            },
            {
                id: 'B002',
                name: 'Double Trouble',
                description: 'Clear two lines at once',
                difficulty: 1,
                targetMoves: 5,
                targetScore: 300,
                initialGrid: [
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
                    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1]
                ],
                availableShapes: ['I_2'],
                objectives: [
                    { type: 'lines', target: 2, description: 'Clear 2 lines' },
                    { type: 'combo', target: 1, description: 'Get a combo' }
                ],
                hints: ['The vertical 2-block piece fits perfectly in the gap'],
                starRequirements: { moves: [5, 3, 2] }
            },
            {
                id: 'B003',
                name: 'Corner Pocket',
                description: 'Fill the corner space',
                difficulty: 2,
                targetMoves: 4,
                targetScore: 200,
                initialGrid: [
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1, 1, 0, 1]
                ],
                availableShapes: ['L_CORNER', 'I_2'],
                objectives: [
                    { type: 'lines', target: 1, description: 'Clear at least 1 line' },
                    { type: 'fill', target: [7, 8, 8, 9], description: 'Fill the corner completely' }
                ],
                hints: ['Use the L-piece to fill the corner shape'],
                starRequirements: { moves: [4, 3, 2] }
            }
        ]
    },
    INTERMEDIATE: {
        id: 'INTERMEDIATE',
        name: 'Building Skills',
        description: 'More complex pattern challenges',
        theme: 'forest',
        unlocked: false,
        puzzles: [
            {
                id: 'I001',
                name: 'Cascade Effect',
                description: 'Create a chain reaction',
                difficulty: 3,
                targetMoves: 6,
                targetScore: 800,
                initialGrid: [
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
                    [1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
                    [1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
                    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
                    [1, 1, 1, 0, 0, 0, 0, 0, 1, 1]
                ],
                availableShapes: ['L_2', 'T', 'Z_1'],
                objectives: [
                    { type: 'lines', target: 3, description: 'Clear 3+ lines' },
                    { type: 'chain', target: 1, description: 'Create a chain reaction' }
                ],
                hints: ['Fill the diagonal pattern to trigger multiple clears'],
                starRequirements: { moves: [6, 4, 3] }
            },
            {
                id: 'I002',
                name: 'Perfect Fit',
                description: 'Use every piece exactly',
                difficulty: 4,
                targetMoves: 8,
                targetScore: 1000,
                initialGrid: [
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
                    [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
                    [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                ],
                availableShapes: ['O', 'O', 'O', 'I_2', 'I_2'],
                objectives: [
                    { type: 'complete', target: 1, description: 'Use all pieces' },
                    { type: 'efficiency', target: 100, description: '100% placement efficiency' }
                ],
                hints: ['Each 2x2 square fits perfectly in the gaps'],
                starRequirements: { moves: [8, 6, 5] }
            }
        ]
    },
    ADVANCED: {
        id: 'ADVANCED',
        name: 'Master Class',
        description: 'Expert-level puzzle challenges',
        theme: 'neon',
        unlocked: false,
        puzzles: [
            {
                id: 'A001',
                name: 'The Gauntlet',
                description: 'Multiple objectives, limited moves',
                difficulty: 5,
                targetMoves: 10,
                targetScore: 2000,
                initialGrid: [
                    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                ],
                availableShapes: ['I_1', 'I_1', 'I_1', 'I_1', 'I_1', 'O', 'O', 'L_1', 'T', 'Z_1'],
                objectives: [
                    { type: 'lines', target: 5, description: 'Clear 5 lines' },
                    { type: 'columns', target: 5, description: 'Clear 5 columns' },
                    { type: 'score', target: 2000, description: 'Score 2000 points' }
                ],
                hints: ['Focus on completing both rows and columns', 'Use single blocks to fill the checkerboard pattern'],
                starRequirements: { moves: [10, 8, 6] }
            }
        ]
    },
    EXPERT: {
        id: 'EXPERT',
        name: 'Legendary',
        description: 'The ultimate puzzle challenges',
        theme: 'space',
        unlocked: false,
        puzzles: [
            {
                id: 'E001',
                name: 'Minimal Moves',
                description: 'Maximum result, minimum effort',
                difficulty: 6,
                targetMoves: 3,
                targetScore: 1500,
                initialGrid: [
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                    [1, 1, 1, 1, 1, 1, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 0, 0, 0, 0, 1]
                ],
                availableShapes: ['T', 'L_2', 'Z_1'],
                objectives: [
                    { type: 'lines', target: 4, description: 'Clear 4 lines' },
                    { type: 'moves', target: 3, description: 'Use exactly 3 moves' },
                    { type: 'perfect', target: 1, description: 'No wasted placements' }
                ],
                hints: ['Think about how each piece can trigger cascading line clears'],
                starRequirements: { moves: [3, 3, 3], bonus: 'perfect_execution' }
            }
        ]
    }
};

// Default puzzle progress structure
export const DEFAULT_PUZZLE_PROGRESS = {
    currentPack: 'BEGINNER',
    packs: {
        BEGINNER: { unlocked: true, completed: 0, total: 3 },
        INTERMEDIATE: { unlocked: false, completed: 0, total: 2 },
        ADVANCED: { unlocked: false, completed: 0, total: 1 },
        EXPERT: { unlocked: false, completed: 0, total: 1 }
    },
    puzzles: {}
};

// Audio settings
export const AUDIO = {
    MASTER_VOLUME: 0.7,
    SFX_VOLUME: 0.8,
    DEFAULT_ENABLED: true
};

// UI Layout constants
export const UI = {
    HEADER_HEIGHT: 80,
    TRAY_HEIGHT: 120,
    BUTTON_HEIGHT: 40,
    MARGIN: 5,
    FONT_SIZES: {
        SMALL: '14px',
        MEDIUM: '16px',
        LARGE: '20px',
        TITLE: '24px'
    },
    COLORS: {
        PRIMARY: '#4CAF50',
        SECONDARY: '#2196F3',
        ACCENT: '#FF9800',
        TEXT: '#FFFFFF',
        BACKGROUND: '#000000'
    }
};

// Shape tray configuration
export const TRAY = {
    SHAPES_COUNT: 3,
    START_Y: 410,  // Moved up to follow grid positioning
    SHAPE_SPACING: 105, // Good spacing to prevent overlap
    START_X: 50 // Keep centered with grid
};

// Animation constants
export const ANIMATIONS = {
    SHAPE_PLACE_DURATION: 200,
    LINE_CLEAR_DURATION: 300,
    TRAY_REFILL_DURATION: 400,
    FADE_DURATION: 250
};

// Storage keys for localStorage
export const STORAGE_KEYS = {
    SETTINGS: 'blockquest_settings',
    PROGRESS: 'blockquest_progress',
    STATISTICS: 'blockquest_statistics',
    POWER_UPS: 'blockquest_powerups',
    HIGH_SCORES: 'blockquest_highscores'
};

// Default game state
export const DEFAULT_GAME_STATE = {
    currentMode: GAME_MODES.NORMAL,
    difficulty: DIFFICULTY.EASY,
    theme: 'vibrant',
    audioEnabled: true,
    coins: 0,
    powerUps: {
        [POWER_UPS.CLEAR_ROW]: 0,
        [POWER_UPS.SWAP_TRAY]: 0,
        [POWER_UPS.EXTRA_UNDO]: 0,
        [POWER_UPS.TIME_SLOW]: 0,
        [POWER_UPS.BLOCK_PREVIEW]: 0,
        [POWER_UPS.LINE_BLAST]: 0,
        [POWER_UPS.COLOR_MATCH]: 0,
        [POWER_UPS.PERFECT_FIT]: 0,
        [POWER_UPS.SECOND_CHANCE]: 0
    },
    statistics: {
        // Basic Game Statistics
        totalGames: 0,
        linesCleared: 0,
        highScore: 0,
        endlessGames: 0,
        puzzlesSolved: 0,
        lastPlayed: null,

        // Detailed Session Tracking
        totalPlayTime: 0, // Total time played in milliseconds
        averageSessionTime: 0,
        longestSession: 0,
        shortestSession: 0,
        sessionsThisWeek: 0,
        sessionsThisMonth: 0,

        // Block and Shape Statistics
        totalBlocksPlaced: 0,
        totalShapesUsed: 0,
        averageBlocksPerGame: 0,
        mostUsedShape: null,
        leastUsedShape: null,
        shapeUsageCount: {}, // Track usage of each shape type

        // Performance Metrics
        perfectClears: 0, // Games completed without line gaps
        combosAchieved: 0,
        maxComboChain: 0,
        averageScore: 0,
        totalScore: 0,
        bestScoreStreak: 0,
        currentScoreStreak: 0,

        // Advanced Pattern Analysis
        favoritePlayingTime: null, // Time of day most active
        gameplayEfficiency: 0, // Blocks placed per minute
        decisionSpeed: 0, // Average time between moves
        accuracyRate: 0, // Successful vs unsuccessful placements

        // Achievement Milestones
        firstGameCompleted: null,
        hundredthGameCompleted: null,
        thousandthBlockPlaced: null,
        personalRecords: {
            fastestCompletion: null,
            highestSingleScore: 0,
            mostLinesInOneGame: 0,
            longestComboChain: 0
        },

        // Mode-Specific Statistics
        modeStats: {
            normal: { gamesPlayed: 0, averageScore: 0, bestScore: 0, totalTime: 0 },
            endless: { gamesPlayed: 0, averageScore: 0, bestScore: 0, totalTime: 0 },
            daily: { gamesPlayed: 0, averageScore: 0, bestScore: 0, streakDays: 0 },
            adventure: { chaptersCompleted: 0, totalStars: 0, averageStars: 0 },
            puzzle: { packsCompleted: 0, totalSolved: 0, averageTime: 0 }
        },

        // Weekly/Monthly Progress Tracking
        weeklyProgress: {
            gamesPlayed: 0,
            linesCleared: 0,
            timeSpent: 0,
            bestScore: 0,
            weekStart: null
        },
        monthlyProgress: {
            gamesPlayed: 0,
            linesCleared: 0,
            timeSpent: 0,
            bestScore: 0,
            monthStart: null
        },

        // Difficulty and Challenge Statistics
        difficultyPreference: 'normal',
        challengesCompleted: 0,
        powerUpsUsed: 0,
        coinsEarned: 0,
        coinsSpent: 0
    },
    progress: {
        adventure: {
            [ADVENTURE_CHAPTERS.FOREST_START.name]: { completed: false, unlocked: true },
            [ADVENTURE_CHAPTERS.CRYSTAL_LAKE.name]: { completed: false, unlocked: false },
            [ADVENTURE_CHAPTERS.MOUNTAIN_PASS.name]: { completed: false, unlocked: false }
        },
        puzzles: {}
    }
};