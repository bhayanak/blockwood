// Main game scene for Normal, Daily, and Endless modes
import { GAME_MODES, DIFFICULTY, GRID, TRAY, UI } from '../core/constants.js';
import { storage } from '../core/storage.js';
import { themeManager } from '../core/themes.js';
import { audioManager } from '../core/audio.js';
import { GameGrid } from '../systems/grid.js';
import { ShapeGenerator } from '../systems/shapes.js';
import { ScoringManager } from '../systems/scoring.js';
import { PowerUpManager } from '../systems/powerups.js';
import { hasValidMoves, getTodaysSeed } from '../core/utils.js';

export class GameScene extends Phaser.Scene {
    constructor(config = { key: 'GameScene' }) {
        super(config);
        this.gameMode = GAME_MODES.NORMAL;
        this.difficulty = DIFFICULTY.EASY;
        this.gameGrid = null;
        this.shapeGenerator = null;
        this.scoringManager = null;
        this.powerUpManager = null;
        this.trayShapes = [];
        this.gameState = 'playing'; // playing, paused, gameover
        this.ui = {};
        this.draggedShape = null;
        this.gameStartTime = 0;
    }

    init(data) {
        this.gameMode = data.mode || GAME_MODES.NORMAL;
        this.difficulty = data.difficulty || DIFFICULTY.EASY;
        this.gameStartTime = Date.now();
    }

    preload() {
        // Audio assets are already loaded in MenuScene
    }

    create() {
        // Initialize systems
        this.initializeSystems();
        
        // Create UI
        this.createUI();
        
        // Create game grid
        this.gameGrid = new GameGrid(this);
        
        // Generate initial shapes
        this.generateTrayShapes();
        
        // Set up input handlers
        this.setupInputHandlers();
        
        // Apply theme
        this.updateTheme();
        
        console.log(`Started ${this.gameMode} mode with ${this.difficulty} difficulty`);
    }

    /**
     * Initialize game systems
     */
    initializeSystems() {
        // Initialize shape generator
        if (this.gameMode === GAME_MODES.DAILY) {
            const seed = getTodaysSeed();
            this.shapeGenerator = new ShapeGenerator(this.difficulty, true, seed);
        } else {
            this.shapeGenerator = new ShapeGenerator(this.difficulty, false);
        }

        // Initialize scoring manager
        this.scoringManager = new ScoringManager(this.gameMode, this.difficulty);

        // Initialize power-up manager
        this.powerUpManager = new PowerUpManager(this.gameMode);
        this.powerUpManager.registerCallbacks({
            onClearRow: (rowIndex) => this.clearRow(rowIndex),
            onSwapTray: () => this.swapTray(),
            onExtraUndo: () => this.performUndo(),
            onClearRowActivated: () => this.activateClearRowMode(),
            onPowerUpCancelled: () => this.deactivatePowerUpMode()
        });
    }

    /**
     * Create user interface
     */
    createUI() {
        const colors = themeManager.getPhaserColors();
        
        // Header section (2 rows)
        this.createHeader();
        
        // Power-up buttons
        this.createPowerUpButtons();
        
        // Back button
        this.ui.backButton = this.createButton(20, 20, 60, 30, '← Menu', () => {
            this.returnToMenu();
        });

        // Pause button
        this.ui.pauseButton = this.createButton(350, 20, 40, 30, '⏸️', () => {
            this.togglePause();
        });
    }

    /**
     * Create header with game info
     */
    createHeader() {
        const theme = themeManager.getCurrentTheme();
        const headerY = 60;
        
        // Row 1: Score, High Score, Coins, Audio
        this.ui.scoreText = this.add.text(20, headerY, 'Score: 0', {
            fontSize: '14px', fontFamily: 'Arial', color: theme.text
        });
        
        const highScore = storage.getHighScore(this.gameMode, this.difficulty);
        this.ui.highScoreText = this.add.text(120, headerY, `Best: ${highScore}`, {
            fontSize: '12px', fontFamily: 'Arial', color: theme.textSecondary
        });
        
        this.ui.coinsText = this.add.text(220, headerY, `💰 ${storage.getCoins()}`, {
            fontSize: '12px', fontFamily: 'Arial', color: theme.accent
        });
        
        this.ui.audioButton = this.createButton(350, headerY - 5, 40, 20, 
            audioManager.isEnabled() ? '🔊' : '🔇', () => this.toggleAudio());

        // Row 2: Mode, Theme, Difficulty
        this.ui.modeText = this.add.text(20, headerY + 25, `Mode: ${this.gameMode}`, {
            fontSize: '11px', fontFamily: 'Arial', color: theme.textSecondary
        });
        
        this.ui.themeText = this.add.text(120, headerY + 25, `Theme: ${theme.name}`, {
            fontSize: '11px', fontFamily: 'Arial', color: theme.textSecondary
        });
        
        this.ui.difficultyText = this.add.text(220, headerY + 25, `${this.difficulty}`, {
            fontSize: '11px', fontFamily: 'Arial', color: theme.textSecondary
        });
    }

    /**
     * Create power-up buttons
     */
    createPowerUpButtons() {
        const startX = 50;
        const y = 400;
        const buttonWidth = 90;
        const spacing = 100;
        
        this.ui.powerUpButtons = [];
        
        // Clear Row button
        const clearRowButton = this.createPowerUpButton(
            startX, y, buttonWidth, 35, '🧹 Clear Row', 'CLEAR_ROW'
        );
        this.ui.powerUpButtons.push(clearRowButton);
        
        // Swap Tray button
        const swapTrayButton = this.createPowerUpButton(
            startX + spacing, y, buttonWidth, 35, '🔄 Swap', 'SWAP_TRAY'
        );
        this.ui.powerUpButtons.push(swapTrayButton);
        
        // Extra Undo button
        const undoButton = this.createPowerUpButton(
            startX + spacing * 2, y, buttonWidth, 35, '↶ Undo', 'EXTRA_UNDO'
        );
        this.ui.powerUpButtons.push(undoButton);
        
        this.updatePowerUpButtons();
    }

    /**
     * Create a power-up button
     */
    createPowerUpButton(x, y, width, height, text, powerUpType) {
        const theme = themeManager.getCurrentTheme();
        
        const container = this.add.container(x, y);
        
        const button = this.add.rectangle(0, 0, width, height, 
            parseInt(theme.ui.buttonBackground.replace('#', ''), 16));
        button.setStrokeStyle(2, parseInt(theme.ui.borderColor.replace('#', ''), 16));
        button.setInteractive({ useHandCursor: true });
        
        const buttonText = this.add.text(0, -8, text, {
            fontSize: '11px', fontFamily: 'Arial', color: theme.text
        }).setOrigin(0.5);
        
        const countText = this.add.text(0, 8, '0', {
            fontSize: '10px', fontFamily: 'Arial', color: theme.textSecondary
        }).setOrigin(0.5);
        
        container.add([button, buttonText, countText]);
        
        button.on('pointerdown', () => {
            this.usePowerUp(powerUpType);
        });
        
        container.powerUpType = powerUpType;
        container.button = button;
        container.text = buttonText;
        container.count = countText;
        
        return container;
    }

    /**
     * Generate shapes for the tray
     */
    generateTrayShapes() {
        this.trayShapes = this.shapeGenerator.generateShapes(TRAY.SHAPES_COUNT);
        this.renderTrayShapes();
    }

    /**
     * Render shapes in the tray
     */
    renderTrayShapes() {
        // Clear existing tray graphics
        if (this.ui.trayGraphics) {
            this.ui.trayGraphics.forEach(graphic => graphic.destroy());
        }
        
        this.ui.trayGraphics = [];
        const colors = themeManager.getPhaserColors();
        
        this.trayShapes.forEach((shape, index) => {
            if (!shape) return;
            
            const trayX = TRAY.START_X + index * TRAY.SHAPE_SPACING;
            const trayY = TRAY.START_Y;
            
            const shapeGraphic = this.add.graphics();
            const blockColor = colors.blockColors[(shape.color - 1) % colors.blockColors.length];
            
            shapeGraphic.fillStyle(blockColor);
            shapeGraphic.lineStyle(2, blockColor, 0.8);
            
            // Draw shape blocks
            for (let y = 0; y < shape.height; y++) {
                for (let x = 0; x < shape.width; x++) {
                    if (shape.pattern[y][x] === 1) {
                        const blockX = trayX + x * (GRID.CELL_SIZE + 2);
                        const blockY = trayY + y * (GRID.CELL_SIZE + 2);
                        
                        shapeGraphic.fillRect(blockX, blockY, GRID.CELL_SIZE, GRID.CELL_SIZE);
                        shapeGraphic.strokeRect(blockX, blockY, GRID.CELL_SIZE, GRID.CELL_SIZE);
                    }
                }
            }
            
            // Make interactive
            const bounds = new Phaser.Geom.Rectangle(
                trayX, trayY, 
                shape.width * (GRID.CELL_SIZE + 2), 
                shape.height * (GRID.CELL_SIZE + 2)
            );
            
            shapeGraphic.setInteractive(bounds, Phaser.Geom.Rectangle.Contains);
            shapeGraphic.shapeIndex = index;
            shapeGraphic.shape = shape;
            
            this.setupShapeDragAndDrop(shapeGraphic);
            
            this.ui.trayGraphics.push(shapeGraphic);
        });
    }

    /**
     * Set up drag and drop for shapes
     */
    setupShapeDragAndDrop(shapeGraphic) {
        shapeGraphic.on('pointerdown', (pointer, localX, localY, event) => {
            if (this.gameState !== 'playing') return;
            
            this.draggedShape = shapeGraphic;
            shapeGraphic.setDepth(100);
            
            // Create drag preview
            this.startDragPreview(shapeGraphic, pointer);
        });

        this.input.on('pointermove', (pointer) => {
            if (this.draggedShape === shapeGraphic && this.gameState === 'playing') {
                this.updateDragPreview(pointer);
            }
        });

        this.input.on('pointerup', (pointer) => {
            if (this.draggedShape === shapeGraphic && this.gameState === 'playing') {
                this.endDragPreview(pointer);
            }
        });
    }

    /**
     * Start drag preview
     */
    startDragPreview(shapeGraphic, pointer) {
        const gridPos = this.gameGrid.pixelToGrid(pointer.x, pointer.y);
        this.gameGrid.showPlacementHighlight(shapeGraphic.shape, gridPos.x, gridPos.y,
            this.gameGrid.canPlaceShape(shapeGraphic.shape, gridPos.x, gridPos.y));
    }

    /**
     * Update drag preview
     */
    updateDragPreview(pointer) {
        if (!this.draggedShape) return;
        
        const gridPos = this.gameGrid.pixelToGrid(pointer.x, pointer.y);
        const canPlace = this.gameGrid.canPlaceShape(this.draggedShape.shape, gridPos.x, gridPos.y);
        
        this.gameGrid.showPlacementHighlight(this.draggedShape.shape, gridPos.x, gridPos.y, canPlace);
    }

    /**
     * End drag preview and attempt placement
     */
    endDragPreview(pointer) {
        if (!this.draggedShape) return;
        
        const gridPos = this.gameGrid.pixelToGrid(pointer.x, pointer.y);
        const shape = this.draggedShape.shape;
        const shapeIndex = this.draggedShape.shapeIndex;
        
        if (this.gameGrid.canPlaceShape(shape, gridPos.x, gridPos.y)) {
            // Place shape
            this.gameGrid.placeShape(shape, gridPos.x, gridPos.y);
            
            // Remove from tray
            this.trayShapes[shapeIndex] = null;
            this.draggedShape.destroy();
            
            // Play sound
            audioManager.playPlace();
            
            // Check for completed lines
            this.checkCompletedLines();
            
            // Check if tray is empty
            if (this.trayShapes.every(s => s === null)) {
                this.generateTrayShapes();
            }
            
            // Check for game over
            this.checkGameOver();
        }
        
        this.gameGrid.hidePlacementHighlight();
        this.draggedShape.setDepth(1);
        this.draggedShape = null;
    }

    /**
     * Check for completed lines and process them
     */
    checkCompletedLines() {
        const { rows, cols } = this.gameGrid.findCompletedLines();
        
        if (rows.length > 0 || cols.length > 0) {
            // Calculate score
            const result = this.scoringManager.processCompletedLines(rows, cols);
            
            // Award coins
            this.scoringManager.awardCoins(result.coins);
            
            // Clear lines with animation
            this.gameGrid.clearCompletedLines(rows, cols);
            
            // Update UI
            this.updateUI();
            
            // Show score popup
            this.showScorePopup(result.score, result.combo);
        } else {
            // Reset combo if no lines cleared
            this.scoringManager.resetCombo();
        }
    }

    /**
     * Check for game over condition
     */
    checkGameOver() {
        const validShapes = this.trayShapes.filter(s => s !== null);
        
        if (!hasValidMoves(this.gameGrid.grid, validShapes)) {
            this.gameOver();
        }
    }

    /**
     * Handle game over
     */
    gameOver() {
        this.gameState = 'gameover';
        
        // Play game over sound
        audioManager.playGameOver();
        
        // Save high score
        const isNewHigh = this.scoringManager.saveHighScore();
        
        // Show game over screen
        this.showGameOverScreen(isNewHigh);
        
        console.log('Game Over!');
    }

    /**
     * Show game over screen
     */
    showGameOverScreen(isNewHighScore) {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const theme = themeManager.getCurrentTheme();
        
        // Background overlay
        const overlay = this.add.rectangle(centerX, centerY, 400, 600, 0x000000, 0.8);
        
        // Game Over text
        const gameOverText = this.add.text(centerX, centerY - 100, 'GAME OVER', {
            fontSize: '24px', fontFamily: 'Arial', color: theme.primary, fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Score display
        const score = this.scoringManager.getCurrentScore();
        const scoreText = this.add.text(centerX, centerY - 50, `Final Score: ${score.toLocaleString()}`, {
            fontSize: '18px', fontFamily: 'Arial', color: theme.text
        }).setOrigin(0.5);
        
        // High score indicator
        if (isNewHighScore) {
            const newHighText = this.add.text(centerX, centerY - 20, '🎉 NEW HIGH SCORE! 🎉', {
                fontSize: '16px', fontFamily: 'Arial', color: theme.accent, fontStyle: 'bold'
            }).setOrigin(0.5);
        }
        
        // Statistics
        const stats = this.scoringManager.getStatistics();
        const statsText = this.add.text(centerX, centerY + 20, 
            `Lines Cleared: ${stats.totalLinesCleared}\nMax Combo: ${stats.maxCombo}`, {
            fontSize: '14px', fontFamily: 'Arial', color: theme.textSecondary, align: 'center'
        }).setOrigin(0.5);
        
        // Buttons
        const playAgainButton = this.createButton(centerX - 70, centerY + 80, 120, 40, 'Play Again', () => {
            this.scene.restart();
        });
        
        const menuButton = this.createButton(centerX + 70, centerY + 80, 120, 40, 'Main Menu', () => {
            this.returnToMenu();
        });
    }

    /**
     * Use a power-up
     */
    usePowerUp(powerUpType) {
        const result = this.powerUpManager.usePowerUp(powerUpType, this.scoringManager.getCurrentScore());
        
        if (result.success) {
            // Deduct score cost if in endless mode
            if (result.scoreCost && this.gameMode === GAME_MODES.ENDLESS) {
                // This would need to be handled by the scoring system
                console.log(`Power-up cost: ${result.scoreCost} score`);
            }
            
            this.updatePowerUpButtons();
            this.updateUI();
        } else {
            console.log('Power-up failed:', result.reason);
        }
    }

    /**
     * Clear a specific row (power-up callback)
     */
    clearRow(rowIndex) {
        const success = this.gameGrid.clearRow(rowIndex);
        return { success, blocksCleared: success ? 10 : 0 };
    }

    /**
     * Swap tray shapes (power-up callback)
     */
    swapTray() {
        this.generateTrayShapes();
        return true;
    }

    /**
     * Perform undo (power-up callback)
     */
    performUndo() {
        // This would require implementing game state history
        console.log('Undo not yet implemented');
        return false;
    }

    /**
     * Create a button
     */
    createButton(x, y, width, height, text, callback) {
        const theme = themeManager.getCurrentTheme();
        
        const button = this.add.rectangle(x, y, width, height, 
            parseInt(theme.ui.buttonBackground.replace('#', ''), 16));
        button.setStrokeStyle(1, parseInt(theme.ui.borderColor.replace('#', ''), 16));
        button.setInteractive({ useHandCursor: true });
        
        const buttonText = this.add.text(x, y, text, {
            fontSize: '12px', fontFamily: 'Arial', color: theme.text
        }).setOrigin(0.5);
        
        button.on('pointerdown', callback);
        
        return this.add.container(0, 0, [button, buttonText]);
    }

    /**
     * Update UI elements
     */
    updateUI() {
        const score = this.scoringManager.getCurrentScore();
        const coins = storage.getCoins();
        
        this.ui.scoreText.setText(`Score: ${score.toLocaleString()}`);
        this.ui.coinsText.setText(`💰 ${coins}`);
    }

    /**
     * Update power-up buttons
     */
    updatePowerUpButtons() {
        this.ui.powerUpButtons.forEach(button => {
            const count = this.powerUpManager.getPowerUpCount(button.powerUpType);
            button.count.setText(count.toString());
            
            // Update button availability
            const canUse = count > 0 || this.gameMode === GAME_MODES.ENDLESS;
            button.button.setAlpha(canUse ? 1 : 0.5);
        });
    }

    /**
     * Show score popup
     */
    showScorePopup(score, combo) {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY - 50;
        
        let text = `+${score.toLocaleString()}`;
        if (combo > 1) {
            text += ` (${combo}x combo!)`;
        }
        
        const popup = this.add.text(centerX, centerY, text, {
            fontSize: '16px', fontFamily: 'Arial', color: themeManager.getCurrentTheme().accent,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: popup,
            y: centerY - 50,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => popup.destroy()
        });
    }

    /**
     * Toggle pause
     */
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.ui.pauseButton.list[1].setText('▶️');
            this.scene.pause();
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.ui.pauseButton.list[1].setText('⏸️');
            this.scene.resume();
        }
    }

    /**
     * Toggle audio
     */
    toggleAudio() {
        const enabled = audioManager.toggle();
        this.ui.audioButton.list[1].setText(enabled ? '🔊' : '🔇');
    }

    /**
     * Return to main menu
     */
    returnToMenu() {
        this.scene.start('MenuScene');
    }

    /**
     * Setup input handlers
     */
    setupInputHandlers() {
        this.input.keyboard.on('keydown-ESC', () => {
            this.returnToMenu();
        });
        
        this.input.keyboard.on('keydown-SPACE', () => {
            this.togglePause();
        });
    }

    /**
     * Update theme
     */
    updateTheme() {
        const colors = themeManager.getPhaserColors();
        this.cameras.main.setBackgroundColor(colors.background);
        
        if (this.gameGrid) {
            this.gameGrid.updateTheme();
        }
        
        // Update UI colors would be implemented here
    }

    /**
     * Activate clear row mode
     */
    activateClearRowMode() {
        // Visual indication that clear row is active
        console.log('Clear row mode activated - click on a row');
    }

    /**
     * Deactivate power-up mode
     */
    deactivatePowerUpMode() {
        // Reset any visual indicators
        console.log('Power-up mode deactivated');
    }
}