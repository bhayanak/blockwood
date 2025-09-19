// Main game entry point
import { GAME_CONFIG } from './core/constants.js';
import { storage } from './core/storage.js';
import { audioManager } from './core/audio.js';
import { themeManager } from './core/themes.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { PuzzleScene } from './scenes/PuzzleScene.js';
import { AdventureScene } from './scenes/AdventureScene.js';

/**
 * BlockQuest Game Class
 */
class BlockQuestGame {
    constructor() {
        this.game = null;
        this.initialized = false;
        this.currentTheme = storage.getTheme();
    }

    /**
     * Initialize the game
     */
    init() {
        // Initialize theme system
        themeManager.init(this.currentTheme);
        
        // Configure Phaser game
        const config = {
            ...GAME_CONFIG,
            scene: [
                MenuScene,
                GameScene,
                PuzzleScene,
                AdventureScene
            ],
            callbacks: {
                postBoot: () => {
                    this.onGameReady();
                }
            }
        };

        // Create Phaser game instance
        this.game = new Phaser.Game(config);
        this.initialized = true;

        // Handle resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        console.log('BlockQuest initialized');
    }

    /**
     * Called when game is ready
     */
    onGameReady() {
        // Hide loading screen
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }

        // Start with menu scene
        this.game.scene.start('MenuScene');
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (this.game && this.game.scale) {
            this.game.scale.resize(window.innerWidth, window.innerHeight);
        }
    }

    /**
     * Handle visibility change (pause/resume)
     */
    handleVisibilityChange() {
        if (!this.game) return;

        if (document.visibilityState === 'hidden') {
            // Pause game when tab is hidden
            this.game.scene.pause();
            audioManager.stopAll();
        } else {
            // Resume when tab becomes visible
            this.game.scene.resume();
        }
    }

    /**
     * Change theme
     */
    changeTheme(themeName) {
        if (themeManager.setTheme(themeName)) {
            storage.setTheme(themeName);
            this.currentTheme = themeName;
            
            // Notify all scenes about theme change
            this.game.scene.getScenes(true).forEach(scene => {
                if (scene.updateTheme) {
                    scene.updateTheme();
                }
            });
            
            return true;
        }
        return false;
    }

    /**
     * Toggle audio
     */
    toggleAudio() {
        return audioManager.toggle();
    }

    /**
     * Get game statistics
     */
    getStatistics() {
        return storage.getStatistics();
    }

    /**
     * Reset all game data
     */
    resetAllData() {
        const success = storage.resetAllData();
        if (success) {
            // Restart the game
            location.reload();
        }
        return success;
    }

    /**
     * Start specific game mode
     */
    startGameMode(mode, difficulty = 'easy') {
        const sceneConfig = {
            mode,
            difficulty
        };

        switch (mode) {
            case 'normal':
            case 'daily':
            case 'endless':
                this.game.scene.start('GameScene', sceneConfig);
                break;
            case 'puzzle':
                this.game.scene.start('PuzzleScene', sceneConfig);
                break;
            case 'adventure':
                this.game.scene.start('AdventureScene', sceneConfig);
                break;
            default:
                console.warn('Unknown game mode:', mode);
                break;
        }
    }

    /**
     * Return to main menu
     */
    returnToMenu() {
        this.game.scene.start('MenuScene');
    }

    /**
     * Get current game instance
     */
    getGame() {
        return this.game;
    }

    /**
     * Check if game is initialized
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Destroy game instance
     */
    destroy() {
        if (this.game) {
            this.game.destroy(true);
            this.game = null;
            this.initialized = false;
        }
    }
}

// Create global game instance
const blockQuest = new BlockQuestGame();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        blockQuest.init();
    });
} else {
    blockQuest.init();
}

// Export for global access
window.BlockQuest = blockQuest;

// Development helpers
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.gameDebug = {
        storage,
        audioManager,
        themeManager,
        resetData: () => blockQuest.resetAllData(),
        getStats: () => blockQuest.getStatistics(),
        changeTheme: (theme) => blockQuest.changeTheme(theme)
    };
    console.log('Debug tools available on window.gameDebug');
}

export default blockQuest;