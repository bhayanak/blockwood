// Core game constants and configuration
export const GAME_CONFIG = {
    width: 400,
    height: 600,
    backgroundColor: '#000000',
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
    START_X: 50,
    START_Y: 120,
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
    CLEAR_ROW: 'CLEAR_ROW',
    SWAP_TRAY: 'SWAP_TRAY',
    EXTRA_UNDO: 'EXTRA_UNDO'
};

// Power-up costs (coins for normal mode, score for endless)
export const POWER_UP_COSTS = {
    NORMAL: {
        [POWER_UPS.CLEAR_ROW]: 50,
        [POWER_UPS.SWAP_TRAY]: 30,
        [POWER_UPS.EXTRA_UNDO]: 40
    },
    ENDLESS: {
        [POWER_UPS.CLEAR_ROW]: 500,
        [POWER_UPS.SWAP_TRAY]: 300,
        [POWER_UPS.EXTRA_UNDO]: 400
    }
};

// Scoring system
export const SCORING = {
    BASE_LINE_SCORE: 100,
    DIFFICULTY_MULTIPLIERS: {
        [DIFFICULTY.EASY]: 1.0,
        [DIFFICULTY.HARD]: 1.5
    },
    COINS_PER_SCORE: 0.1, // 1 coin per 10 points
    COMBO_MULTIPLIER: 1.2
};

// Adventure mode chapters
export const ADVENTURE_CHAPTERS = {
    FOREST_START: {
        name: 'Forest Start',
        theme: 'forest',
        unlocked: true,
        puzzles: 5
    },
    CRYSTAL_LAKE: {
        name: 'Crystal Lake',
        theme: 'space',
        unlocked: false,
        puzzles: 5
    },
    MOUNTAIN_PASS: {
        name: 'Mountain Pass',
        theme: 'neon',
        unlocked: false,
        puzzles: 5
    }
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
    START_Y: 480,
    SHAPE_SPACING: 120,
    START_X: 50
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
        [POWER_UPS.EXTRA_UNDO]: 0
    },
    statistics: {
        totalGames: 0,
        linesCleared: 0,
        highScore: 0,
        endlessGames: 0,
        puzzlesSolved: 0,
        lastPlayed: null
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