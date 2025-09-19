// Main menu scene for BlockQuest
import { GAME_MODES, DIFFICULTY, UI } from '../core/constants.js';
import { storage } from '../core/storage.js';
import { themeManager } from '../core/themes.js';
import { audioManager } from '../core/audio.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.selectedDifficulty = storage.getDifficulty();
        this.selectedTheme = storage.getTheme();
        this.menuElements = {};
        this.animationTweens = [];
    }

    preload() {
        // Load audio assets
        audioManager.preloadAssets(this);
        
        // Load logo if available
        this.load.image('logo', 'assets/logo.png');
    }

    create() {
        // Initialize audio
        audioManager.initializeSounds(this);
        
        // Apply current theme
        const colors = themeManager.getPhaserColors();
        this.cameras.main.setBackgroundColor(colors.background);
        
        // Create UI elements
        this.createTitle();
        this.createMainMenu();
        this.createSettingsPanel();
        this.createStatisticsPanel();
        this.createPowerUpShop();
        
        // Set up input handlers
        this.setupInputHandlers();
        
        // Start title animation
        this.startTitleAnimation();
    }

    /**
     * Create animated title
     */
    createTitle() {
        const centerX = this.cameras.main.centerX;
        const colors = themeManager.getPhaserColors();
        
        // Logo if available
        if (this.textures.exists('logo')) {
            this.menuElements.logo = this.add.image(centerX, 80, 'logo');
            this.menuElements.logo.setScale(0.5);
        }
        
        // Title text
        this.menuElements.title = this.add.text(centerX, 140, 'BLOCKQUEST', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().primary,
            fontStyle: 'bold'
        });
        this.menuElements.title.setOrigin(0.5);
        
        // Subtitle
        this.menuElements.subtitle = this.add.text(centerX, 170, 'Modern Puzzle Challenge', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().textSecondary
        });
        this.menuElements.subtitle.setOrigin(0.5);
    }

    /**
     * Create main menu buttons
     */
    createMainMenu() {
        const centerX = this.cameras.main.centerX;
        const startY = 220;
        const buttonHeight = 45;
        const buttonSpacing = 10;
        
        // Game mode buttons (2 columns on mobile)
        const modes = [
            { key: GAME_MODES.NORMAL, label: '🎮 Normal Mode', desc: 'Classic gameplay' },
            { key: GAME_MODES.DAILY, label: '📅 Daily Challenge', desc: 'New puzzle each day' },
            { key: GAME_MODES.ENDLESS, label: '♾️ Endless Mode', desc: 'Score-based power-ups' },
            { key: GAME_MODES.ADVENTURE, label: '🗺️ Adventure', desc: 'Story campaign' },
            { key: GAME_MODES.PUZZLE, label: '🧩 Puzzle Packs', desc: 'Handcrafted challenges' },
            { key: 'shop', label: '🛒 Power-up Shop', desc: 'Buy abilities' }
        ];

        this.menuElements.modeButtons = [];
        
        modes.forEach((mode, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            const x = centerX + (col === 0 ? -95 : 95);
            const y = startY + row * (buttonHeight + buttonSpacing);
            
            const button = this.createMenuButton(x, y, 180, buttonHeight - 5, mode.label, () => {
                this.selectGameMode(mode.key);
            });
            
            // Add description text
            const desc = this.add.text(x, y + 15, mode.desc, {
                fontSize: '10px',
                fontFamily: 'Arial, sans-serif',
                color: themeManager.getCurrentTheme().textSecondary
            });
            desc.setOrigin(0.5);
            
            this.menuElements.modeButtons.push({ button, desc });
        });

        // Settings and stats buttons
        const bottomY = startY + Math.ceil(modes.length / 2) * (buttonHeight + buttonSpacing) + 20;
        
        this.menuElements.settingsButton = this.createMenuButton(
            centerX - 95, bottomY, 85, 35, '⚙️ Settings', () => this.showSettings()
        );
        
        this.menuElements.statsButton = this.createMenuButton(
            centerX + 95, bottomY, 85, 35, '📊 Stats', () => this.showStatistics()
        );

        // Difficulty toggle
        this.createDifficultyToggle(centerX, bottomY + 50);
        
        // Theme selector
        this.createThemeSelector(centerX, bottomY + 85);
    }

    /**
     * Create difficulty toggle
     */
    createDifficultyToggle(x, y) {
        const difficultyText = this.add.text(x, y - 15, 'Difficulty:', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().text
        });
        difficultyText.setOrigin(0.5);

        this.menuElements.difficultyButton = this.createMenuButton(
            x, y, 120, 30, 
            this.selectedDifficulty === DIFFICULTY.EASY ? '😊 Easy' : '😈 Hard',
            () => this.toggleDifficulty()
        );
    }

    /**
     * Create theme selector
     */
    createThemeSelector(x, y) {
        const themeText = this.add.text(x, y - 15, 'Theme:', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().text
        });
        themeText.setOrigin(0.5);

        const themes = themeManager.getAllThemes();
        const currentIndex = themes.indexOf(this.selectedTheme);
        const currentTheme = themeManager.getTheme(this.selectedTheme);

        this.menuElements.themeButton = this.createMenuButton(
            x, y, 120, 30,
            `🎨 ${currentTheme.name}`,
            () => this.cycleTheme()
        );
    }

    /**
     * Create settings panel
     */
    createSettingsPanel() {
        // Initially hidden
        this.menuElements.settingsPanel = this.add.container(0, 0);
        this.menuElements.settingsPanel.setVisible(false);
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Background
        const bg = this.add.rectangle(centerX, centerY, 300, 200, 0x000000, 0.8);
        this.menuElements.settingsPanel.add(bg);
        
        // Title
        const title = this.add.text(centerX, centerY - 80, 'Settings', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().text,
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.menuElements.settingsPanel.add(title);
        
        // Audio toggle
        const audioEnabled = audioManager.isEnabled();
        this.menuElements.audioButton = this.createMenuButton(
            centerX, centerY - 30, 150, 35,
            audioEnabled ? '🔊 Sound On' : '🔇 Sound Off',
            () => this.toggleAudio()
        );
        this.menuElements.settingsPanel.add(this.menuElements.audioButton);
        
        // Reset data button
        this.menuElements.resetButton = this.createMenuButton(
            centerX, centerY + 10, 150, 35,
            '🗑️ Reset Data',
            () => this.confirmResetData()
        );
        this.menuElements.settingsPanel.add(this.menuElements.resetButton);
        
        // Close button
        this.menuElements.closeSettingsButton = this.createMenuButton(
            centerX, centerY + 60, 100, 30,
            'Close',
            () => this.hideSettings()
        );
        this.menuElements.settingsPanel.add(this.menuElements.closeSettingsButton);
    }

    /**
     * Create statistics panel
     */
    createStatisticsPanel() {
        // Initially hidden
        this.menuElements.statsPanel = this.add.container(0, 0);
        this.menuElements.statsPanel.setVisible(false);
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Background
        const bg = this.add.rectangle(centerX, centerY, 320, 300, 0x000000, 0.8);
        this.menuElements.statsPanel.add(bg);
        
        // Title
        const title = this.add.text(centerX, centerY - 130, 'Statistics', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().text,
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.menuElements.statsPanel.add(title);
        
        // Stats content will be updated dynamically
        this.updateStatisticsContent();
        
        // Close button
        this.menuElements.closeStatsButton = this.createMenuButton(
            centerX, centerY + 120, 100, 30,
            'Close',
            () => this.hideStatistics()
        );
        this.menuElements.statsPanel.add(this.menuElements.closeStatsButton);
    }

    /**
     * Create power-up shop panel
     */
    createPowerUpShop() {
        // Initially hidden
        this.menuElements.shopPanel = this.add.container(0, 0);
        this.menuElements.shopPanel.setVisible(false);
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Background
        const bg = this.add.rectangle(centerX, centerY, 340, 360, 0x000000, 0.8);
        this.menuElements.shopPanel.add(bg);
        
        // Title
        const title = this.add.text(centerX, centerY - 160, 'Power-up Shop', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().text,
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.menuElements.shopPanel.add(title);
        
        // Coins display
        const coins = storage.getCoins();
        this.menuElements.coinsDisplay = this.add.text(centerX, centerY - 130, `💰 ${coins} coins`, {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().accent
        });
        this.menuElements.coinsDisplay.setOrigin(0.5);
        this.menuElements.shopPanel.add(this.menuElements.coinsDisplay);
        
        // Power-up items will be created dynamically
        this.updateShopContent();
        
        // Close button
        this.menuElements.closeShopButton = this.createMenuButton(
            centerX, centerY + 150, 100, 30,
            'Close',
            () => this.hideShop()
        );
        this.menuElements.shopPanel.add(this.menuElements.closeShopButton);
    }

    /**
     * Create a styled menu button
     */
    createMenuButton(x, y, width, height, text, callback) {
        const theme = themeManager.getCurrentTheme();
        
        // Button background
        const button = this.add.rectangle(x, y, width, height, parseInt(theme.ui.buttonBackground.replace('#', ''), 16));
        button.setStrokeStyle(2, parseInt(theme.ui.borderColor.replace('#', ''), 16));
        button.setInteractive({ useHandCursor: true });
        
        // Button text
        const buttonText = this.add.text(x, y, text, {
            fontSize: height > 35 ? '14px' : '12px',
            fontFamily: 'Arial, sans-serif',
            color: theme.text
        });
        buttonText.setOrigin(0.5);
        
        // Hover effects
        button.on('pointerover', () => {
            button.setFillStyle(parseInt(theme.ui.buttonHover.replace('#', ''), 16));
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                ease: 'Power2'
            });
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(parseInt(theme.ui.buttonBackground.replace('#', ''), 16));
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Power2'
            });
        });
        
        button.on('pointerdown', () => {
            button.setFillStyle(parseInt(theme.ui.buttonActive.replace('#', ''), 16));
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                ease: 'Power2',
                onComplete: callback
            });
        });
        
        return this.add.container(0, 0, [button, buttonText]);
    }

    /**
     * Start title animation
     */
    startTitleAnimation() {
        if (this.menuElements.title) {
            // Color cycling animation
            this.titleColorTween = this.tweens.addCounter({
                from: 0,
                to: 360,
                duration: 3000,
                repeat: -1,
                onUpdate: (tween) => {
                    const hue = tween.getValue();
                    const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.8, 1);
                    const hexColor = Phaser.Display.Color.RGBToString(color.r, color.g, color.b, 255, '0x');
                    this.menuElements.title.setColor(hexColor);
                }
            });
        }
    }

    /**
     * Set up input handlers
     */
    setupInputHandlers() {
        // Keyboard shortcuts
        this.input.keyboard.on('keydown-ESC', () => {
            this.hideAllPanels();
        });
        
        this.input.keyboard.on('keydown-S', () => {
            this.showSettings();
        });
        
        this.input.keyboard.on('keydown-T', () => {
            this.cycleTheme();
        });
    }

    /**
     * Toggle difficulty
     */
    toggleDifficulty() {
        this.selectedDifficulty = this.selectedDifficulty === DIFFICULTY.EASY ? DIFFICULTY.HARD : DIFFICULTY.EASY;
        storage.setDifficulty(this.selectedDifficulty);
        
        // Update button text
        const newText = this.selectedDifficulty === DIFFICULTY.EASY ? '😊 Easy' : '😈 Hard';
        this.menuElements.difficultyButton.list[1].setText(newText);
    }

    /**
     * Cycle through themes
     */
    cycleTheme() {
        const themes = themeManager.getAllThemes();
        const currentIndex = themes.indexOf(this.selectedTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        this.selectedTheme = nextTheme;
        themeManager.setTheme(nextTheme);
        storage.setTheme(nextTheme);
        
        // Update theme button
        const themeName = themeManager.getTheme(nextTheme).name;
        this.menuElements.themeButton.list[1].setText(`🎨 ${themeName}`);
        
        // Update scene colors
        this.updateTheme();
    }

    /**
     * Select game mode
     */
    selectGameMode(mode) {
        if (mode === 'shop') {
            this.showShop();
            return;
        }
        
        // Start the selected game mode
        this.scene.start('GameScene', {
            mode: mode,
            difficulty: this.selectedDifficulty
        });
    }

    /**
     * Show/hide panels
     */
    showSettings() {
        this.hideAllPanels();
        this.menuElements.settingsPanel.setVisible(true);
    }

    hideSettings() {
        this.menuElements.settingsPanel.setVisible(false);
    }

    showStatistics() {
        this.hideAllPanels();
        this.updateStatisticsContent();
        this.menuElements.statsPanel.setVisible(true);
    }

    hideStatistics() {
        this.menuElements.statsPanel.setVisible(false);
    }

    showShop() {
        this.hideAllPanels();
        this.updateShopContent();
        this.menuElements.shopPanel.setVisible(true);
    }

    hideShop() {
        this.menuElements.shopPanel.setVisible(false);
    }

    hideAllPanels() {
        if (this.menuElements.settingsPanel) this.menuElements.settingsPanel.setVisible(false);
        if (this.menuElements.statsPanel) this.menuElements.statsPanel.setVisible(false);
        if (this.menuElements.shopPanel) this.menuElements.shopPanel.setVisible(false);
    }

    /**
     * Toggle audio
     */
    toggleAudio() {
        const enabled = audioManager.toggle();
        const text = enabled ? '🔊 Sound On' : '🔇 Sound Off';
        this.menuElements.audioButton.list[1].setText(text);
    }

    /**
     * Update statistics content
     */
    updateStatisticsContent() {
        if (!this.menuElements.statsPanel) return;
        
        const stats = storage.getStatistics();
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Remove old stats text
        this.menuElements.statsPanel.list = this.menuElements.statsPanel.list.filter(item => {
            if (item.statsText) {
                item.destroy();
                return false;
            }
            return true;
        });
        
        // Add new stats
        const statsData = [
            `Games Played: ${stats.totalGames}`,
            `Lines Cleared: ${stats.linesCleared}`,
            `High Score: ${stats.highScore}`,
            `Endless Games: ${stats.endlessGames}`,
            `Puzzles Solved: ${stats.puzzlesSolved}`
        ];
        
        statsData.forEach((stat, index) => {
            const text = this.add.text(centerX, centerY - 80 + (index * 25), stat, {
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                color: themeManager.getCurrentTheme().text
            });
            text.setOrigin(0.5);
            text.statsText = true;
            this.menuElements.statsPanel.add(text);
        });
    }

    /**
     * Update shop content
     */
    updateShopContent() {
        // This would be implemented to show available power-ups for purchase
        // For now, just update coins display
        if (this.menuElements.coinsDisplay) {
            const coins = storage.getCoins();
            this.menuElements.coinsDisplay.setText(`💰 ${coins} coins`);
        }
    }

    /**
     * Confirm reset data
     */
    confirmResetData() {
        // Simple confirmation - in a full implementation, you'd want a proper dialog
        if (confirm('Are you sure you want to reset all game data? This cannot be undone.')) {
            storage.resetAllData();
            location.reload();
        }
    }

    /**
     * Update theme colors
     */
    updateTheme() {
        const colors = themeManager.getPhaserColors();
        this.cameras.main.setBackgroundColor(colors.background);
        
        // Update all UI elements with new theme colors
        // This is a simplified version - full implementation would update all elements
        if (this.menuElements.title) {
            this.menuElements.title.setColor(themeManager.getCurrentTheme().primary);
        }
        if (this.menuElements.subtitle) {
            this.menuElements.subtitle.setColor(themeManager.getCurrentTheme().textSecondary);
        }
    }

    /**
     * Clean up
     */
    destroy() {
        // Stop animations
        if (this.titleColorTween) {
            this.titleColorTween.stop();
        }
        
        this.animationTweens.forEach(tween => tween.stop());
        this.animationTweens = [];
    }
}