// Main menu scene for BlockQuest
import { GAME_MODES, DIFFICULTY, UI, POWER_UPS, POWER_UP_INFO, POWER_UP_COSTS } from '../core/constants.js';
import { storage } from '../core/storage.js';
import { themeManager } from '../core/themes.js';
import { audioManager } from '../core/audio.js';
import { analyticsManager } from '../core/analytics.js';
import { DailyChallenge, isDailyCompleted, getTodaysDateString } from '../systems/DailyChallenge.js';

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
        
        // Logo is already loaded in LoadingScene
        // this.load.image('logo', 'assets/logo.png');
    }

    create() {
        // Initialize analytics session
        analyticsManager.startSession();

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
            
            let buttonLabel = mode.label;
            let descText = mode.desc;

            // Special handling for daily challenge
            if (mode.key === GAME_MODES.DAILY) {
                const isCompleted = isDailyCompleted();
                if (isCompleted) {
                    buttonLabel = '📅 Daily Challenge ✅';
                    descText = 'Completed today!';
                } else {
                    descText = getTodaysDateString().split(',')[0]; // Just the day
                }
            }

            const button = this.createMenuButton(x, y, 180, buttonHeight - 5, buttonLabel, () => {
                this.selectGameMode(mode.key);
            });
            
            // Add description text
            const desc = this.add.text(x, y + 15, descText, {
                fontSize: '10px',
                fontFamily: 'Arial, sans-serif',
                color: mode.key === GAME_MODES.DAILY && isDailyCompleted() ?
                    '#4CAF50' : themeManager.getCurrentTheme().textSecondary
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
     * Create comprehensive settings panel
     */
    createSettingsPanel() {
        // Initially hidden
        this.menuElements.settingsPanel = this.add.container(0, 0);
        this.menuElements.settingsPanel.setVisible(false);
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Background - larger for comprehensive settings
        const bg = this.add.rectangle(centerX, centerY, 500, 600, 0x000000, 0.9);
        this.menuElements.settingsPanel.add(bg);
        
        // Main title
        const title = this.add.text(centerX, centerY - 270, 'Settings', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().text,
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.menuElements.settingsPanel.add(title);

        // Settings content container for scrolling
        this.menuElements.settingsContent = this.add.container(0, 0);
        this.menuElements.settingsPanel.add(this.menuElements.settingsContent);

        this.createThemeSettings(centerX, centerY - 220);
        this.createAudioSettings(centerX, centerY - 80);
        this.createGameplaySettings(centerX, centerY + 40);
        this.createAccessibilitySettings(centerX, centerY + 120);
        this.createAccountSettings(centerX, centerY + 200);

        // Close button
        this.menuElements.closeSettingsButton = this.createMenuButton(
            centerX, centerY + 270, 100, 30,
            'Close',
            () => this.hideSettings()
        );
        this.menuElements.settingsPanel.add(this.menuElements.closeSettingsButton);
    }

    /**
     * Create theme selection section
     */
    createThemeSettings(centerX, startY) {
        // Section title
        const themeTitle = this.add.text(centerX, startY, 'Theme Selection', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().accent,
            fontStyle: 'bold'
        });
        themeTitle.setOrigin(0.5);
        this.menuElements.settingsContent.add(themeTitle);

        // Theme buttons grid (2x3)
        const themes = ['vibrant', 'forest', 'neon', 'pastel', 'space', 'colorblindFriendly'];
        const themeNames = ['Vibrant', 'Forest', 'Neon', 'Pastel', 'Space', 'Colorblind'];
        const currentTheme = themeManager.getCurrentThemeName();

        this.menuElements.themeButtons = [];

        for (let i = 0; i < themes.length; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = centerX - 120 + col * 120;
            const y = startY + 30 + row * 50;

            const isSelected = themes[i] === currentTheme;
            const buttonColor = isSelected ? 0x444444 : 0x222222;

            const themeButton = this.createMenuButton(
                x, y, 110, 40,
                themeNames[i],
                () => this.selectTheme(themes[i])
            );

            // Add selection indicator
            if (isSelected) {
                const indicator = this.add.text(x + 45, y, '✓', {
                    fontSize: '14px',
                    color: themeManager.getCurrentTheme().accent
                });
                indicator.setOrigin(0.5);
                this.menuElements.settingsContent.add(indicator);
            }

            this.menuElements.themeButtons.push(themeButton);
            this.menuElements.settingsContent.add(themeButton);
        }
    }

    /**
     * Create audio control section
     */
    createAudioSettings(centerX, startY) {
        // Section title
        const audioTitle = this.add.text(centerX, startY, 'Audio Controls', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().accent,
            fontStyle: 'bold'
        });
        audioTitle.setOrigin(0.5);
        this.menuElements.settingsContent.add(audioTitle);

        // Audio toggle
        const audioEnabled = audioManager.isEnabled();
        this.menuElements.audioToggle = this.createMenuButton(
            centerX - 100, startY + 30, 120, 35,
            audioEnabled ? '🔊 Audio On' : '🔇 Audio Off',
            () => this.toggleAudio()
        );
        this.menuElements.settingsContent.add(this.menuElements.audioToggle);

        // Master volume slider
        const masterVol = Math.round(audioManager.masterVolume * 100);
        this.menuElements.masterVolumeText = this.add.text(centerX + 80, startY + 15, `Master: ${masterVol}%`, {
            fontSize: '14px',
            color: themeManager.getCurrentTheme().text
        });
        this.menuElements.masterVolumeText.setOrigin(0.5);
        this.menuElements.settingsContent.add(this.menuElements.masterVolumeText);

        // Volume controls
        this.menuElements.masterVolumeDown = this.createMenuButton(
            centerX + 20, startY + 30, 30, 25, '-',
            () => this.adjustMasterVolume(-0.1)
        );
        this.menuElements.masterVolumeUp = this.createMenuButton(
            centerX + 140, startY + 30, 30, 25, '+',
            () => this.adjustMasterVolume(0.1)
        );
        this.menuElements.settingsContent.add(this.menuElements.masterVolumeDown);
        this.menuElements.settingsContent.add(this.menuElements.masterVolumeUp);

        // SFX volume
        const sfxVol = Math.round(audioManager.sfxVolume * 100);
        this.menuElements.sfxVolumeText = this.add.text(centerX + 80, startY + 55, `SFX: ${sfxVol}%`, {
            fontSize: '14px',
            color: themeManager.getCurrentTheme().text
        });
        this.menuElements.sfxVolumeText.setOrigin(0.5);
        this.menuElements.settingsContent.add(this.menuElements.sfxVolumeText);

        this.menuElements.sfxVolumeDown = this.createMenuButton(
            centerX + 20, startY + 70, 30, 25, '-',
            () => this.adjustSFXVolume(-0.1)
        );
        this.menuElements.sfxVolumeUp = this.createMenuButton(
            centerX + 140, startY + 70, 30, 25, '+',
            () => this.adjustSFXVolume(0.1)
        );
        this.menuElements.settingsContent.add(this.menuElements.sfxVolumeDown);
        this.menuElements.settingsContent.add(this.menuElements.sfxVolumeUp);
    }

    /**
     * Create gameplay settings section
     */
    createGameplaySettings(centerX, startY) {
        // Section title
        const gameplayTitle = this.add.text(centerX, startY, 'Gameplay Settings', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().accent,
            fontStyle: 'bold'
        });
        gameplayTitle.setOrigin(0.5);
        this.menuElements.settingsContent.add(gameplayTitle);

        // Auto-save toggle
        const autoSave = storage.get('autoSave', true);
        this.menuElements.autoSaveToggle = this.createMenuButton(
            centerX - 80, startY + 30, 140, 30,
            autoSave ? '� Auto-save: On' : '💾 Auto-save: Off',
            () => this.toggleAutoSave()
        );
        this.menuElements.settingsContent.add(this.menuElements.autoSaveToggle);

        // Difficulty preference
        const difficulty = storage.get('difficulty', 'normal');
        this.menuElements.difficultyButton = this.createMenuButton(
            centerX + 80, startY + 30, 140, 30,
            `⚡ Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
            () => this.cycleDifficulty()
        );
        this.menuElements.settingsContent.add(this.menuElements.difficultyButton);
    }

    /**
     * Create accessibility settings section
     */
    createAccessibilitySettings(centerX, startY) {
        // Section title
        const accessTitle = this.add.text(centerX, startY, 'Accessibility', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().accent,
            fontStyle: 'bold'
        });
        accessTitle.setOrigin(0.5);
        this.menuElements.settingsContent.add(accessTitle);

        // Font size
        const fontSize = storage.get('fontSize', 'normal');
        this.menuElements.fontSizeButton = this.createMenuButton(
            centerX - 80, startY + 30, 140, 30,
            `🔤 Font: ${fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}`,
            () => this.cycleFontSize()
        );
        this.menuElements.settingsContent.add(this.menuElements.fontSizeButton);

        // High contrast
        const highContrast = storage.get('highContrast', false);
        this.menuElements.contrastToggle = this.createMenuButton(
            centerX + 80, startY + 30, 140, 30,
            highContrast ? '🌓 Contrast: High' : '🌓 Contrast: Normal',
            () => this.toggleHighContrast()
        );
        this.menuElements.settingsContent.add(this.menuElements.contrastToggle);
    }

    /**
     * Create account management section
     */
    createAccountSettings(centerX, startY) {
        // Section title
        const accountTitle = this.add.text(centerX, startY, 'Account Management', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().accent,
            fontStyle: 'bold'
        });
        accountTitle.setOrigin(0.5);
        this.menuElements.settingsContent.add(accountTitle);

        // Export data button
        this.menuElements.exportButton = this.createMenuButton(
            centerX - 80, startY + 30, 140, 30,
            '📤 Export Data',
            () => this.exportGameData()
        );
        this.menuElements.settingsContent.add(this.menuElements.exportButton);

        // Import data button
        this.menuElements.importButton = this.createMenuButton(
            centerX + 80, startY + 30, 140, 30,
            '📥 Import Data',
            () => this.importGameData()
        );
        this.menuElements.settingsContent.add(this.menuElements.importButton);

        // Reset data button
        this.menuElements.resetButton = this.createMenuButton(
            centerX, startY + 70, 140, 30,
            '🗑️ Reset All Data',
            () => this.confirmResetData()
        );
        this.menuElements.settingsContent.add(this.menuElements.resetButton);
    }

    /**
     * Create comprehensive statistics panel
     */
    createStatisticsPanel() {
        // Initially hidden
        this.menuElements.statsPanel = this.add.container(0, 0);
        this.menuElements.statsPanel.setVisible(false);
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Background - larger for comprehensive stats
        const bg = this.add.rectangle(centerX, centerY, 600, 700, 0x000000, 0.9);
        this.menuElements.statsPanel.add(bg);
        
        // Main title
        const title = this.add.text(centerX, centerY - 320, 'Game Statistics & Analytics', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().text,
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.menuElements.statsPanel.add(title);

        // Create tabs for different stat categories
        this.createStatisticsTabs(centerX, centerY - 280);

        // Stats content container
        this.menuElements.statsContent = this.add.container(0, 0);
        this.menuElements.statsPanel.add(this.menuElements.statsContent);

        // Default to overview tab
        this.currentStatsTab = 'overview';
        this.updateStatisticsContent();
        
        // Close button
        this.menuElements.closeStatsButton = this.createMenuButton(
            centerX, centerY + 320, 100, 30,
            'Close',
            () => this.hideStatistics()
        );
        this.menuElements.statsPanel.add(this.menuElements.closeStatsButton);
    }

    /**
     * Create statistics tabs
     */
    createStatisticsTabs(centerX, y) {
        const tabs = [
            { key: 'overview', label: '📊 Overview' },
            { key: 'performance', label: '🎯 Performance' },
            { key: 'patterns', label: '📈 Patterns' },
            { key: 'records', label: '🏆 Records' },
            { key: 'modes', label: '🎮 Modes' }
        ];

        this.menuElements.statsTabs = [];

        tabs.forEach((tab, index) => {
            const x = centerX - 240 + index * 120;
            const isSelected = this.currentStatsTab === tab.key;

            const tabButton = this.createMenuButton(
                x, y, 110, 30,
                tab.label,
                () => this.selectStatsTab(tab.key)
            );

            // Highlight selected tab
            if (isSelected) {
                const highlight = this.add.rectangle(x, y - 15, 110, 2, parseInt(themeManager.getCurrentTheme().accent.replace('#', ''), 16));
                this.menuElements.statsPanel.add(highlight);
            }

            this.menuElements.statsTabs.push(tabButton);
            this.menuElements.statsPanel.add(tabButton);
        });
    }

    /**
     * Select statistics tab
     */
    selectStatsTab(tabKey) {
        this.currentStatsTab = tabKey;
        this.updateStatisticsContent();

        // Refresh the tabs to show new selection
        this.refreshStatisticsTabs();
    }

    /**
     * Refresh statistics tabs to show current selection
     */
    refreshStatisticsTabs() {
        // Remove old tabs and create new ones
        if (this.menuElements.statsTabs) {
            this.menuElements.statsTabs.forEach(tab => tab.destroy());
        }

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.createStatisticsTabs(centerX, centerY - 280);
    }

    /**
     * Create comprehensive power-up shop panel
     */
    createPowerUpShop() {
        // Initially hidden
        this.menuElements.shopPanel = this.add.container(0, 0);
        this.menuElements.shopPanel.setVisible(false);
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Background - larger for comprehensive shop
        const bg = this.add.rectangle(centerX, centerY, 650, 750, 0x000000, 0.95);
        this.menuElements.shopPanel.add(bg);
        
        // Title
        const title = this.add.text(centerX, centerY - 350, 'Power-up Shop', {
            fontSize: '26px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().text,
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.menuElements.shopPanel.add(title);
        
        // Coins display with enhanced styling
        const coins = storage.getCoins();
        this.menuElements.coinsBg = this.add.rectangle(centerX, centerY - 310, 200, 40, parseInt(themeManager.getCurrentTheme().ui.buttonBackground.replace('#', ''), 16));
        this.menuElements.shopPanel.add(this.menuElements.coinsBg);

        this.menuElements.coinsDisplay = this.add.text(centerX, centerY - 310, `💰 ${coins} coins`, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().accent,
            fontStyle: 'bold'
        });
        this.menuElements.coinsDisplay.setOrigin(0.5);
        this.menuElements.shopPanel.add(this.menuElements.coinsDisplay);

        // Create category tabs
        this.createShopTabs(centerX, centerY - 260);

        // Shop content container
        this.menuElements.shopContent = this.add.container(0, 0);
        this.menuElements.shopPanel.add(this.menuElements.shopContent);

        // Initialize with first category
        this.currentShopCategory = 'all';
        this.updateShopContent();
        
        // Close button
        this.menuElements.closeShopButton = this.createMenuButton(
            centerX, centerY + 350, 100, 35,
            'Close',
            () => this.hideShop()
        );
        this.menuElements.shopPanel.add(this.menuElements.closeShopButton);
    }

    /**
     * Create shop category tabs
     */
    createShopTabs(centerX, y) {
        const tabs = [
            { key: 'all', label: '🛒 All', color: '#666666' },
            { key: 'utility', label: '🔧 Utility', color: '#4ECDC4' },
            { key: 'temporal', label: '⏰ Time', color: '#FF6B6B' },
            { key: 'information', label: '📊 Info', color: '#45B7D1' },
            { key: 'assistance', label: '🧠 Smart', color: '#96CEB4' },
            { key: 'survival', label: '🔥 Survival', color: '#DDA0DD' }
        ];

        this.menuElements.shopTabs = [];

        tabs.forEach((tab, index) => {
            const x = centerX - 275 + index * 95;
            const isSelected = this.currentShopCategory === tab.key;

            const tabButton = this.createMenuButton(
                x, y, 90, 30,
                tab.label,
                () => this.selectShopCategory(tab.key)
            );

            // Highlight selected tab
            if (isSelected) {
                const highlight = this.add.rectangle(x, y - 18, 90, 3, parseInt(tab.color.replace('#', ''), 16));
                this.menuElements.shopPanel.add(highlight);
            }

            this.menuElements.shopTabs.push(tabButton);
            this.menuElements.shopPanel.add(tabButton);
        });
    }

    /**
     * Select shop category
     */
    selectShopCategory(category) {
        this.currentShopCategory = category;
        this.updateShopContent();
        this.refreshShopTabs();
    }

    /**
     * Refresh shop tabs to show current selection
     */
    refreshShopTabs() {
        if (this.menuElements.shopTabs) {
            this.menuElements.shopTabs.forEach(tab => tab.destroy());
        }

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.createShopTabs(centerX, centerY - 260);
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

        // Prevent replaying daily challenge if already completed
        if (mode === GAME_MODES.DAILY && isDailyCompleted()) {
            this.showModalPopup('Daily Challenge Completed', 'You have already completed today\'s Daily Challenge! Come back tomorrow for a new puzzle.');
            return;
        }

        // Route to the correct scene based on mode
        switch (mode) {
            case 'adventure':
                this.scene.start('AdventureScene');
                break;
            case 'puzzle':
                this.scene.start('PuzzleScene');
                break;
            case 'normal':
            case 'daily':
            case 'endless':
            default:
                this.scene.start('GameScene', {
                    mode: mode,
                    difficulty: this.selectedDifficulty
                });
                break;
        }
    }
    /**
     * Show a modal popup with a message
     * @param {string} title - Popup title
     * @param {string} message - Popup message
     */
    showModalPopup(title, message) {
        // Remove any existing modal
        if (this.menuElements.modalPopup) {
            this.menuElements.modalPopup.bg.destroy();
            this.menuElements.modalPopup.panel.destroy();
            this.menuElements.modalPopup.titleText.destroy();
            this.menuElements.modalPopup.messageText.destroy();
            this.menuElements.modalPopup.okButton.destroy();
        }

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const theme = themeManager.getCurrentTheme();

        // Background overlay
        const bg = this.add.rectangle(centerX, centerY, 420, 700, 0x000000, 0.7).setDepth(1000);
        // Modal panel
        const panel = this.add.rectangle(centerX, centerY, 320, 180, 0x22232a, 1).setStrokeStyle(2, theme.primary).setDepth(1001);
        // Title
        const titleText = this.add.text(centerX, centerY - 55, title, {
            fontSize: '20px', fontFamily: 'Arial', color: theme.primary, fontStyle: 'bold', align: 'center'
        }).setOrigin(0.5).setDepth(1002);
        // Message
        const messageText = this.add.text(centerX, centerY - 10, message, {
            fontSize: '14px', fontFamily: 'Arial', color: theme.text, wordWrap: { width: 260 }
        }).setOrigin(0.5).setDepth(1002);
        // OK button
        const okButton = this.createMenuButton(centerX, centerY + 45, 120, 36, 'OK', () => {
            bg.destroy();
            panel.destroy();
            titleText.destroy();
            messageText.destroy();
            okButton.destroy();
            this.menuElements.modalPopup = null;
        });
        okButton.setDepth(1002);

        this.menuElements.modalPopup = { bg, panel, titleText, messageText, okButton };
    }

    /**
     * Show/hide panels
     */
    showSettings() {
        this.hideAllPanels();
        this.menuElements.settingsPanel.setVisible(true);
    }

    // --- Modal popup method inserted here ---

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
        const text = enabled ? '🔊 Audio On' : '🔇 Audio Off';
        this.menuElements.audioToggle.list[1].setText(text);
    }

    /**
     * Select theme
     */
    selectTheme(themeName) {
        themeManager.setTheme(themeName);
        // Refresh the settings panel to show updated selection
        this.refreshSettingsPanel();
    }

    /**
     * Adjust master volume
     */
    adjustMasterVolume(delta) {
        const newVolume = Math.max(0, Math.min(1, audioManager.masterVolume + delta));
        audioManager.setMasterVolume(newVolume);
        const percentage = Math.round(newVolume * 100);
        this.menuElements.masterVolumeText.setText(`Master: ${percentage}%`);
        storage.set('masterVolume', newVolume);
    }

    /**
     * Adjust SFX volume
     */
    adjustSFXVolume(delta) {
        const newVolume = Math.max(0, Math.min(1, audioManager.sfxVolume + delta));
        audioManager.setSFXVolume(newVolume);
        const percentage = Math.round(newVolume * 100);
        this.menuElements.sfxVolumeText.setText(`SFX: ${percentage}%`);
        storage.set('sfxVolume', newVolume);
    }

    /**
     * Toggle auto-save
     */
    toggleAutoSave() {
        const current = storage.get('autoSave', true);
        const newValue = !current;
        storage.set('autoSave', newValue);
        const text = newValue ? '💾 Auto-save: On' : '� Auto-save: Off';
        this.menuElements.autoSaveToggle.list[1].setText(text);
    }

    /**
     * Cycle through difficulty levels
     */
    cycleDifficulty() {
        const difficulties = ['easy', 'normal', 'hard'];
        const current = storage.get('difficulty', 'normal');
        const currentIndex = difficulties.indexOf(current);
        const nextIndex = (currentIndex + 1) % difficulties.length;
        const newDifficulty = difficulties[nextIndex];

        storage.set('difficulty', newDifficulty);
        const text = `⚡ Difficulty: ${newDifficulty.charAt(0).toUpperCase() + newDifficulty.slice(1)}`;
        this.menuElements.difficultyButton.list[1].setText(text);
    }

    /**
     * Cycle through font sizes
     */
    cycleFontSize() {
        const sizes = ['small', 'normal', 'large'];
        const current = storage.get('fontSize', 'normal');
        const currentIndex = sizes.indexOf(current);
        const nextIndex = (currentIndex + 1) % sizes.length;
        const newSize = sizes[nextIndex];

        storage.set('fontSize', newSize);
        const text = `🔤 Font: ${newSize.charAt(0).toUpperCase() + newSize.slice(1)}`;
        this.menuElements.fontSizeButton.list[1].setText(text);

        // Apply font size change immediately
        this.applyFontSize(newSize);
    }

    /**
     * Toggle high contrast mode
     */
    toggleHighContrast() {
        const current = storage.get('highContrast', false);
        const newValue = !current;
        storage.set('highContrast', newValue);
        const text = newValue ? '🌓 Contrast: High' : '🌓 Contrast: Normal';
        this.menuElements.contrastToggle.list[1].setText(text);

        // Apply contrast change immediately
        this.applyHighContrast(newValue);
    }

    /**
     * Export game data
     */
    exportGameData() {
        try {
            const gameData = {
                statistics: storage.getStatistics(),
                settings: {
                    theme: themeManager.getCurrentThemeName(),
                    audioEnabled: audioManager.isEnabled(),
                    masterVolume: audioManager.masterVolume,
                    sfxVolume: audioManager.sfxVolume,
                    autoSave: storage.get('autoSave', true),
                    difficulty: storage.get('difficulty', 'normal'),
                    fontSize: storage.get('fontSize', 'normal'),
                    highContrast: storage.get('highContrast', false)
                },
                gameState: {
                    coins: storage.getCoins(),
                    unlockedThemes: storage.get('unlockedThemes', ['vibrant']),
                    purchasedPowerUps: storage.get('purchasedPowerUps', {})
                },
                exportDate: new Date().toISOString()
            };

            const dataStr = JSON.stringify(gameData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `blockquest-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.showNotification('Game data exported successfully!', 'success');
        } catch (error) {
            console.error('Failed to export data:', error);
            this.showNotification('Failed to export data', 'error');
        }
    }

    /**
     * Import game data
     */
    importGameData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const gameData = JSON.parse(e.target.result);

                    // Validate data structure
                    if (!gameData.statistics || !gameData.settings || !gameData.gameState) {
                        throw new Error('Invalid data format');
                    }

                    // Import statistics
                    Object.keys(gameData.statistics).forEach(key => {
                        storage.set(key, gameData.statistics[key]);
                    });

                    // Import settings
                    if (gameData.settings.theme) {
                        themeManager.setTheme(gameData.settings.theme);
                    }
                    if (typeof gameData.settings.audioEnabled === 'boolean') {
                        if (gameData.settings.audioEnabled) {
                            audioManager.enable();
                        } else {
                            audioManager.disable();
                        }
                    }
                    if (typeof gameData.settings.masterVolume === 'number') {
                        audioManager.setMasterVolume(gameData.settings.masterVolume);
                        storage.set('masterVolume', gameData.settings.masterVolume);
                    }
                    if (typeof gameData.settings.sfxVolume === 'number') {
                        audioManager.setSFXVolume(gameData.settings.sfxVolume);
                        storage.set('sfxVolume', gameData.settings.sfxVolume);
                    }

                    Object.keys(gameData.settings).forEach(key => {
                        if (['autoSave', 'difficulty', 'fontSize', 'highContrast'].includes(key)) {
                            storage.set(key, gameData.settings[key]);
                        }
                    });

                    // Import game state
                    if (typeof gameData.gameState.coins === 'number') {
                        storage.setCoins(gameData.gameState.coins);
                    }
                    if (Array.isArray(gameData.gameState.unlockedThemes)) {
                        storage.set('unlockedThemes', gameData.gameState.unlockedThemes);
                    }
                    if (gameData.gameState.purchasedPowerUps) {
                        storage.set('purchasedPowerUps', gameData.gameState.purchasedPowerUps);
                    }

                    this.showNotification('Game data imported successfully!', 'success');
                    this.refreshSettingsPanel();

                } catch (error) {
                    console.error('Failed to import data:', error);
                    this.showNotification('Failed to import data - invalid format', 'error');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    /**
     * Refresh settings panel with current values
     */
    refreshSettingsPanel() {
        if (!this.menuElements.settingsPanel || !this.menuElements.settingsPanel.visible) return;

        // Hide and recreate the settings panel
        this.hideSettings();
        this.createSettingsPanel();
        this.showSettings();
    }

    /**
     * Apply font size setting
     */
    applyFontSize(size) {
        const multipliers = { small: 0.8, normal: 1.0, large: 1.2 };
        const multiplier = multipliers[size] || 1.0;

        // Apply to all text elements in the scene
        this.children.list.forEach(child => {
            if (child.type === 'Text') {
                const originalSize = parseInt(child.style.fontSize);
                child.setFontSize(Math.round(originalSize * multiplier));
            }
        });
    }

    /**
     * Apply high contrast setting
     */
    applyHighContrast(enabled) {
        if (enabled) {
            // Force high contrast theme temporarily
            const highContrastTheme = {
                background: '#000000',
                text: '#FFFFFF',
                primary: '#FFFFFF',
                secondary: '#FFFF00',
                accent: '#00FF00'
            };

            // Apply high contrast colors to UI elements
            this.children.list.forEach(child => {
                if (child.type === 'Text') {
                    child.setColor(highContrastTheme.text);
                }
            });
        } else {
            // Restore original theme colors
            const theme = themeManager.getCurrentTheme();
            this.children.list.forEach(child => {
                if (child.type === 'Text') {
                    child.setColor(theme.text);
                }
            });
        }
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        const colors = {
            success: '#00AA00',
            error: '#AA0000',
            info: '#0066AA'
        };

        const notification = this.add.container(centerX, centerY - 200);

        const bg = this.add.rectangle(0, 0, 300, 50, 0x000000, 0.9);
        const border = this.add.rectangle(0, 0, 302, 52, parseInt(colors[type].replace('#', ''), 16), 0.8);
        border.setStrokeStyle(2, parseInt(colors[type].replace('#', ''), 16));

        const text = this.add.text(0, 0, message, {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: colors[type],
            align: 'center',
            wordWrap: { width: 280 }
        });
        text.setOrigin(0.5);

        notification.add([border, bg, text]);

        // Auto-hide after 3 seconds
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: notification,
                alpha: 0,
                duration: 500,
                onComplete: () => notification.destroy()
            });
        });
    }

    /**
     * Update statistics content
     */
    updateStatisticsContent() {
        if (!this.menuElements.statsPanel || !this.menuElements.statsContent) return;

        // Clear existing content
        this.menuElements.statsContent.removeAll(true);
        
        const centerX = this.cameras.main.centerX;
        const stats = storage.getStatistics();

        switch (this.currentStatsTab) {
            case 'overview':
                this.createOverviewStats(centerX, stats);
                break;
            case 'performance':
                this.createPerformanceStats(centerX, stats);
                break;
            case 'patterns':
                this.createPatternStats(centerX, stats);
                break;
            case 'records':
                this.createRecordStats(centerX, stats);
                break;
            case 'modes':
                this.createModeStats(centerX, stats);
                break;
        }
    }

    /**
     * Create overview statistics display
     */
    createOverviewStats(centerX, stats) {
        const startY = -240;
        let currentY = startY;

        // Game Overview Section
        this.addStatsSection('🎮 Game Overview', centerX, currentY);
        currentY += 40;

        const overviewData = [
            `Total Games Played: ${stats.totalGames || 0}`,
            `Total Play Time: ${this.formatDuration(stats.totalPlayTime || 0)}`,
            `Average Session: ${this.formatDuration(stats.averageSessionTime || 0)}`,
            `High Score: ${stats.highScore || 0}`,
            `Total Score: ${stats.totalScore || 0}`,
            `Lines Cleared: ${stats.linesCleared || 0}`
        ];

        overviewData.forEach((text, index) => {
            this.addStatsText(text, centerX, currentY + (index * 25));
        });
        currentY += overviewData.length * 25 + 20;

        // Recent Activity Section
        this.addStatsSection('📅 Recent Activity', centerX, currentY);
        currentY += 40;

        const recentData = [
            `This Week: ${stats.weeklyProgress?.gamesPlayed || 0} games`,
            `This Month: ${stats.monthlyProgress?.gamesPlayed || 0} games`,
            `Last Played: ${stats.lastPlayed ? new Date(stats.lastPlayed).toLocaleDateString() : 'Never'}`,
            `Current Streak: ${stats.currentScoreStreak || 0} games`
        ];

        recentData.forEach((text, index) => {
            this.addStatsText(text, centerX, currentY + (index * 25));
        });
    }

    /**
     * Create performance statistics display
     */
    createPerformanceStats(centerX, stats) {
        const startY = -240;
        let currentY = startY;

        // Performance Metrics Section
        this.addStatsSection('🎯 Performance Metrics', centerX, currentY);
        currentY += 40;

        const avgScore = Math.round(stats.averageScore || 0);
        const efficiency = Math.round((stats.gameplayEfficiency || 0) * 100) / 100;
        const decisionTime = this.formatDuration(stats.decisionSpeed || 0);

        const performanceData = [
            `Average Score: ${avgScore}`,
            `Gameplay Efficiency: ${efficiency} blocks/min`,
            `Average Decision Time: ${decisionTime}`,
            `Perfect Clears: ${stats.perfectClears || 0}`,
            `Total Combos: ${stats.combosAchieved || 0}`,
            `Max Combo Chain: ${stats.maxComboChain || 0}`
        ];

        performanceData.forEach((text, index) => {
            this.addStatsText(text, centerX, currentY + (index * 25));
        });
        currentY += performanceData.length * 25 + 20;

        // Block Placement Stats
        this.addStatsSection('🧩 Block Statistics', centerX, currentY);
        currentY += 40;

        const blockData = [
            `Total Blocks Placed: ${stats.totalBlocksPlaced || 0}`,
            `Total Shapes Used: ${stats.totalShapesUsed || 0}`,
            `Average Blocks/Game: ${Math.round(stats.averageBlocksPerGame || 0)}`,
            `Most Used Shape: ${stats.mostUsedShape || 'None'}`,
            `Least Used Shape: ${stats.leastUsedShape || 'None'}`
        ];

        blockData.forEach((text, index) => {
            this.addStatsText(text, centerX, currentY + (index * 25));
        });
    }

    /**
     * Create pattern analysis display
     */
    createPatternStats(centerX, stats) {
        const startY = -240;
        let currentY = startY;

        // Playing Patterns Section
        this.addStatsSection('📈 Playing Patterns', centerX, currentY);
        currentY += 40;

        const patternData = [
            `Difficulty Preference: ${(stats.difficultyPreference || 'normal').charAt(0).toUpperCase() + (stats.difficultyPreference || 'normal').slice(1)}`,
            `Favorite Playing Time: ${stats.favoritePlayingTime || 'Not determined'}`,
            `Power-ups Used: ${stats.powerUpsUsed || 0}`,
            `Coins Earned: ${stats.coinsEarned || 0}`,
            `Coins Spent: ${stats.coinsSpent || 0}`
        ];

        patternData.forEach((text, index) => {
            this.addStatsText(text, centerX, currentY + (index * 25));
        });
        currentY += patternData.length * 25 + 20;

        // Shape Usage Analysis
        this.addStatsSection('🔍 Shape Usage Analysis', centerX, currentY);
        currentY += 40;

        const shapeUsage = stats.shapeUsageCount || {};
        const shapeEntries = Object.entries(shapeUsage).sort((a, b) => b[1] - a[1]);
        
        if (shapeEntries.length > 0) {
            shapeEntries.slice(0, 5).forEach(([shape, count], index) => {
                this.addStatsText(`${shape}: ${count} times`, centerX, currentY + (index * 25));
            });
        } else {
            this.addStatsText('No shape data available yet', centerX, currentY);
        }
    }

    /**
     * Create personal records display
     */
    createRecordStats(centerX, stats) {
        const startY = -240;
        let currentY = startY;

        // Personal Records Section
        this.addStatsSection('🏆 Personal Records', centerX, currentY);
        currentY += 40;

        const records = stats.personalRecords || {};
        const recordData = [
            `Highest Single Score: ${records.highestSingleScore || 0}`,
            `Most Lines in One Game: ${records.mostLinesInOneGame || 0}`,
            `Longest Combo Chain: ${records.longestComboChain || 0}`,
            `Fastest Completion: ${records.fastestCompletion ? this.formatDuration(records.fastestCompletion) : 'N/A'}`,
            `Best Score Streak: ${stats.bestScoreStreak || 0} games`
        ];

        recordData.forEach((text, index) => {
            this.addStatsText(text, centerX, currentY + (index * 25));
        });
        currentY += recordData.length * 25 + 20;

        // Milestones Section
        this.addStatsSection('🎖️ Achievement Milestones', centerX, currentY);
        currentY += 40;

        const milestoneData = [
            `First Game: ${stats.firstGameCompleted ? new Date(stats.firstGameCompleted).toLocaleDateString() : 'Not yet'}`,
            `100th Game: ${stats.hundredthGameCompleted ? new Date(stats.hundredthGameCompleted).toLocaleDateString() : 'Not yet'}`,
            `1000th Block: ${stats.thousandthBlockPlaced ? new Date(stats.thousandthBlockPlaced).toLocaleDateString() : 'Not yet'}`,
            `Challenges Completed: ${stats.challengesCompleted || 0}`
        ];

        milestoneData.forEach((text, index) => {
            this.addStatsText(text, centerX, currentY + (index * 25));
        });
    }

    /**
     * Create mode-specific statistics display
     */
    createModeStats(centerX, stats) {
        const startY = -240;
        let currentY = startY;

        const modeStats = stats.modeStats || {};
        const modes = [
            { key: 'normal', name: '🎮 Normal Mode' },
            { key: 'endless', name: '♾️ Endless Mode' },
            { key: 'daily', name: '📅 Daily Challenge' },
            { key: 'adventure', name: '🗺️ Adventure Mode' },
            { key: 'puzzle', name: '🧩 Puzzle Mode' }
        ];

        modes.forEach((mode, modeIndex) => {
            const modeData = modeStats[mode.key] || { gamesPlayed: 0, averageScore: 0, bestScore: 0, totalTime: 0 };

            this.addStatsSection(mode.name, centerX, currentY);
            currentY += 40;

            const modeInfo = [
                `Games Played: ${modeData.gamesPlayed}`,
                `Average Score: ${Math.round(modeData.averageScore)}`,
                `Best Score: ${modeData.bestScore}`,
                `Total Time: ${this.formatDuration(modeData.totalTime)}`
            ];

            modeInfo.forEach((text, index) => {
                this.addStatsText(text, centerX, currentY + (index * 20));
            });

            currentY += modeInfo.length * 20 + 30;
        });
    }

    /**
     * Add a statistics section header
     */
    addStatsSection(title, x, y) {
        const text = this.add.text(x, y, title, {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().accent,
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        this.menuElements.statsContent.add(text);
    }

    /**
     * Add a statistics text line
     */
    addStatsText(content, x, y) {
        const text = this.add.text(x, y, content, {
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().text
        });
        text.setOrigin(0.5);
        this.menuElements.statsContent.add(text);
    }

    /**
     * Format duration in milliseconds to readable string
     */
    formatDuration(ms) {
        if (!ms || ms === 0) return '0m';

        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Update shop content based on selected category
     */
    updateShopContent() {
        if (!this.menuElements.shopContent) return;

        // Clear existing content
        this.menuElements.shopContent.removeAll(true);

        // Update coins display
        if (this.menuElements.coinsDisplay) {
            const coins = storage.getCoins();
            this.menuElements.coinsDisplay.setText(`💰 ${coins} coins`);
        }

        const centerX = this.cameras.main.centerX;
        const startY = -200;

        // Get filtered power-ups based on category
        const powerUps = this.getFilteredPowerUps();

        // Create power-up items
        this.createPowerUpItems(powerUps, centerX, startY);
    }

    /**
     * Get power-ups filtered by current category
     */
    getFilteredPowerUps() {
        const allPowerUps = Object.values(POWER_UPS);

        if (this.currentShopCategory === 'all') {
            return allPowerUps;
        }

        return allPowerUps.filter(powerUpType => {
            const info = POWER_UP_INFO[powerUpType];
            return info && info.category === this.currentShopCategory;
        });
    }

    /**
     * Create power-up item displays
     */
    createPowerUpItems(powerUps, centerX, startY) {
        const coins = storage.getCoins();
        const ownedPowerUps = storage.getPowerUps();

        powerUps.forEach((powerUpType, index) => {
            const info = POWER_UP_INFO[powerUpType];
            const cost = POWER_UP_COSTS.NORMAL[powerUpType];
            const owned = ownedPowerUps[powerUpType] || 0;

            const row = Math.floor(index / 2);
            const col = index % 2;
            const x = centerX + (col === 0 ? -160 : 160);
            const y = startY + row * 120;

            this.createPowerUpCard(powerUpType, info, cost, owned, coins, x, y);
        });
    }

    /**
     * Create individual power-up card
     */
    createPowerUpCard(powerUpType, info, cost, owned, playerCoins, x, y) {
        // Card background with rarity color
        const rarityColors = {
            common: '#4A4A4A',
            uncommon: '#2E7D32',
            rare: '#1565C0',
            epic: '#7B1FA2',
            legendary: '#E65100'
        };

        const cardBg = this.add.rectangle(x, y, 280, 100, parseInt(rarityColors[info.rarity].replace('#', ''), 16), 0.3);
        const cardBorder = this.add.rectangle(x, y, 282, 102, parseInt(rarityColors[info.rarity].replace('#', ''), 16));
        cardBorder.setStrokeStyle(2, parseInt(rarityColors[info.rarity].replace('#', ''), 16));

        this.menuElements.shopContent.add([cardBorder, cardBg]);

        // Power-up icon and name
        const iconText = this.add.text(x - 120, y - 20, info.icon, {
            fontSize: '24px'
        });
        iconText.setOrigin(0.5);

        const nameText = this.add.text(x - 80, y - 25, info.name, {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().text,
            fontStyle: 'bold'
        });
        nameText.setOrigin(0, 0.5);

        // Description
        const descText = this.add.text(x - 80, y - 5, info.description, {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().textSecondary,
            wordWrap: { width: 150 }
        });
        descText.setOrigin(0, 0.5);

        // Owned count
        const ownedText = this.add.text(x - 80, y + 25, `Owned: ${owned}`, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: themeManager.getCurrentTheme().accent
        });
        ownedText.setOrigin(0, 0.5);

        // Purchase section
        const canAfford = playerCoins >= cost;
        const buyButton = this.createMenuButton(
            x + 80, y - 10, 80, 30,
            `Buy: ${cost}💰`,
            canAfford ? () => this.purchasePowerUp(powerUpType) : null
        );

        if (!canAfford) {
            buyButton.setAlpha(0.5);
        }

        // Buy 5 button for bulk purchase
        const bulkCost = cost * 5;
        const canAffordBulk = playerCoins >= bulkCost;
        const bulkButton = this.createMenuButton(
            x + 80, y + 20, 80, 25,
            `x5: ${bulkCost}💰`,
            canAffordBulk ? () => this.purchasePowerUpBulk(powerUpType, 5) : null
        );
        bulkButton.list[1].setFontSize('10px'); // Smaller text for bulk button

        if (!canAffordBulk) {
            bulkButton.setAlpha(0.5);
        }

        this.menuElements.shopContent.add([
            iconText, nameText, descText, ownedText, buyButton, bulkButton
        ]);
    }

    /**
     * Purchase a single power-up
     */
    purchasePowerUp(powerUpType) {
        const cost = POWER_UP_COSTS.NORMAL[powerUpType];
        const coins = storage.getCoins();

        if (coins >= cost) {
            // Deduct coins
            storage.setCoins(coins - cost);

            // Add power-up
            storage.addPowerUp(powerUpType, 1);

            // Track analytics
            analyticsManager.trackCoinsEarned(-cost, 'power_up_purchase');

            // Show purchase confirmation
            this.showPurchaseConfirmation(powerUpType, 1);

            // Update shop display
            this.updateShopContent();
        }
    }

    /**
     * Purchase multiple power-ups
     */
    purchasePowerUpBulk(powerUpType, quantity) {
        const unitCost = POWER_UP_COSTS.NORMAL[powerUpType];
        const totalCost = unitCost * quantity;
        const coins = storage.getCoins();

        if (coins >= totalCost) {
            // Deduct coins
            storage.setCoins(coins - totalCost);

            // Add power-ups
            storage.addPowerUp(powerUpType, quantity);

            // Track analytics
            analyticsManager.trackCoinsEarned(-totalCost, 'bulk_power_up_purchase');

            // Show purchase confirmation
            this.showPurchaseConfirmation(powerUpType, quantity);

            // Update shop display
            this.updateShopContent();
        }
    }

    /**
     * Show purchase confirmation popup
     */
    showPurchaseConfirmation(powerUpType, quantity) {
        const info = POWER_UP_INFO[powerUpType];

        const message = quantity === 1
            ? `Purchased ${info.icon} ${info.name}!`
            : `Purchased ${quantity}x ${info.icon} ${info.name}!`;

        this.showNotification(message, 'success');
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