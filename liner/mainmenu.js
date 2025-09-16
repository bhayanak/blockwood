import { GameScene } from './game.js';
import { THEMES } from './const.js';
import { Modes } from './modes.js';
import { isEndlessMode, enableEndlessMode, disableEndlessMode } from './endless.js';
// mainmenu.js
// Glossy, animated main menu for Blockwood
// Handles logo, animations, options, puzzle, modes, difficulty, and Start button

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        // Load logo, animation assets, and effects
        this.load.image('logo', 'assets/logo.png');
        // ...load other assets as needed...
    }

    create() {
        // Use theme for all colors and backgrounds
        const theme = THEMES[GameScene.activeThemeIdx];
        // Modern font stack
        const fontFamily = 'Poppins, Montserrat, Arial, sans-serif';
        // Hidden cheat code: Ctrl+Shift+C adds 10 coins
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
                import('./powerups.js').then(mod => {
                    mod.addCoins(10);
                    if (window.CHEAT_NOTIFICATION) window.CHEAT_NOTIFICATION.remove();
                    const note = document.createElement('div');
                    note.textContent = '+10 coins!';
                    note.style.position = 'fixed';
                    note.style.bottom = '32px';
                    note.style.right = '32px';
                    note.style.background = theme.button.background;
                    note.style.color = theme.button.color;
                    note.style.fontFamily = fontFamily;
                    note.style.fontSize = '20px';
                    note.style.padding = '10px 20px';
                    note.style.borderRadius = '8px';
                    note.style.zIndex = 9999;
                    note.style.boxShadow = '0 2px 8px #0008';
                    note.style.opacity = '0.95';
                    note.id = 'cheat-note';
                    window.CHEAT_NOTIFICATION = note;
                    document.body.appendChild(note);
                    setTimeout(() => {
                        if (window.CHEAT_NOTIFICATION) {
                            window.CHEAT_NOTIFICATION.remove();
                            window.CHEAT_NOTIFICATION = null;
                        }
                    }, 1200);
                });
            }
        });
        // Responsive layout setup
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;
        const isMobile = width < 600 || height < 700;
        const centerX = width / 2;

        // Create stunning animated background
        const bgGradient = this.add.graphics();
        bgGradient.fillGradientStyle(
            parseInt(theme.background.replace('#', '0x')),
            parseInt(theme.background.replace('#', '0x')),
            0x1a1a2e,
            0x16213e,
            1
        );
        bgGradient.fillRect(0, 0, width, height);

        // Enhanced animated floating particles - more visible
        const particleColors = [0xffffff, 0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b];
        for (let i = 0; i < (isMobile ? 20 : 35); i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(3, 8),
                particleColors[Math.floor(Math.random() * particleColors.length)],
                0.6
            );

            // Floating upward animation
            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(200, 400),
                alpha: { from: 0.6, to: 0.1 },
                duration: Phaser.Math.Between(4000, 8000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000)
            });

            // Gentle horizontal drift
            this.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-50, 50),
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Smaller, better positioned logo
        const logoY = isMobile ? height * 0.12 : height * 0.15;
        const logoScale = isMobile ? 0.15 : 0.25;

        // Subtle glow behind logo
        const logoGlow = this.add.circle(centerX, logoY, isMobile ? 35 : 50,
            parseInt(theme.button.color.replace('#', '0x')), 0.15);
        this.tweens.add({
            targets: logoGlow,
            scaleX: { from: 1, to: 1.2 },
            scaleY: { from: 1, to: 1.2 },
            alpha: { from: 0.15, to: 0.25 },
            duration: 2000,
            yoyo: true,
            repeat: -1
        });

        this.logo = this.add.image(centerX, logoY, 'logo')
            .setScale(logoScale)
            .setOrigin(0.5, 0.5);

        // Add floating animation to logo
        this.tweens.add({
            targets: this.logo,
            y: { from: logoY, to: logoY - 8 },
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Enhanced responsive configuration for all screen sizes
        const isVerySmall = width < 450;
        const isWideScreen = width > 1200;
        const fontScale = isWideScreen ? Math.max(1.2, width * 0.0015) : 1;

        // Enhanced title with multiple glow layers and effects
        const titleY = isMobile ? height * 0.25 : height * 0.28;
        const titleFontSize = isMobile ? Math.round(width * 0.08) : (isWideScreen ? Math.round(42 * fontScale) : 42);

        // Background glow layers for depth
        const titleGlow1 = this.add.text(centerX, titleY, 'BlockQuest', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: titleFontSize,
            fontStyle: 'bold',
            fill: theme.button.color,
            alpha: 0.3
        }).setOrigin(0.5).setScale(1.1);

        const titleGlow2 = this.add.text(centerX, titleY, 'BlockQuest', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: titleFontSize,
            fontStyle: 'bold',
            fill: '#ffffff',
            alpha: 0.2
        }).setOrigin(0.5).setScale(1.05);

        // Main title with enhanced effects
        this.titleText = this.add.text(centerX, titleY, 'BlockQuest', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: titleFontSize,
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: theme.button.color,
            strokeThickness: 6,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 15,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);

        // Animate all title elements together
        [titleGlow1, titleGlow2, this.titleText].forEach(text => {
            this.tweens.add({
                targets: text,
                y: text.y - 3,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Enhanced title animation with scale and glow pulsing
        this.tweens.add({
            targets: this.titleText,
            scale: { from: 1, to: 1.08 },
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add color cycling to title stroke
        this.time.addEvent({
            delay: 3000,
            callback: () => {
                const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                this.titleText.setStroke(randomColor, 4);
            },
            loop: true
        });
        // Helper to get mode label
        const getModeLabel = () => {
            const mode = GameScene.GAME_MODE;
            if (mode === 'normal') return 'Normal';
            if (mode === 'daily') return 'Daily';
            if (mode === 'puzzle') return 'Puzzle';
            return mode.charAt(0).toUpperCase() + mode.slice(1);
        };
        // Enhanced responsive button configuration for all screen sizes
        const btnStartY = isMobile ? height * 0.38 : height * 0.42;
        const btnFontSize = isVerySmall ? Math.round(width * 0.03) : (isMobile ? Math.round(width * 0.035) : Math.round(18 * fontScale));
        const btnPadding = isMobile ? 8 : (isWideScreen ? 16 : 12);
        const btnWidth = isVerySmall ? width * 0.35 : (isMobile ? width * 0.4 : (isWideScreen ? Math.min(280, width * 0.2) : 180));
        const btnHeight = isVerySmall ? 32 : (isMobile ? 35 : (isWideScreen ? Math.round(42 * fontScale) : 42));

        // Create beautiful button style with gradients
        const createButton = (x, y, text, primaryColor, secondaryColor) => {
            // Button background with gradient
            const btnBg = this.add.graphics();
            btnBg.fillGradientStyle(
                parseInt(primaryColor.replace('#', '0x')),
                parseInt(secondaryColor.replace('#', '0x')),
                parseInt(primaryColor.replace('#', '0x')),
                parseInt(secondaryColor.replace('#', '0x'))
            );
            btnBg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 12);

            // Button glow effect
            const btnGlow = this.add.graphics();
            btnGlow.fillStyle(parseInt(primaryColor.replace('#', '0x')), 0.3);
            btnGlow.fillRoundedRect(x - btnWidth / 2 - 2, y - btnHeight / 2 - 2, btnWidth + 4, btnHeight + 4, 14);
            btnGlow.setVisible(false);

            // Button text
            const btnText = this.add.text(x, y, text, {
                fontFamily: 'Poppins, sans-serif',
                fontSize: btnFontSize,
                fontStyle: 'bold',
                color: '#ffffff',
                shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2 }
            }).setOrigin(0.5);

            // Make interactive
            const hitArea = this.add.rectangle(x, y, btnWidth, btnHeight, 0x000000, 0);
            hitArea.setInteractive({ useHandCursor: true });

            return { bg: btnBg, glow: btnGlow, text: btnText, hitArea };
        };

        // Button layout - 2x4 grid with responsive spacing
        const cols = isMobile ? 2 : 2;
        const rows = 4;

        // Ensure buttons fit within screen bounds with adequate padding
        const sidePadding = isVerySmall ? 10 : 20; // Less padding on very small screens
        const maxButtonWidth = btnWidth;
        const availableWidth = width - (sidePadding * 2);

        // Calculate spacing to center buttons properly
        let spacingX;
        if (isVerySmall) {
            // For very small screens, use minimal spacing and ensure centering
            const totalButtonWidth = maxButtonWidth * cols;
            const remainingSpace = availableWidth - totalButtonWidth;
            spacingX = Math.max(10, remainingSpace / (cols + 1)); // Min 10px gap
        } else {
            spacingX = isMobile ? width * 0.25 : (isWideScreen ? Math.min(320, width * 0.22) : 200);
        }

        const spacingY = isVerySmall ? height * 0.06 : (isMobile ? height * 0.08 : 55);

        // Calculate startX to center the button grid
        const totalGridWidth = (cols - 1) * spacingX + maxButtonWidth;
        const startX = (width - totalGridWidth) / 2 + maxButtonWidth / 2;

        // Button colors for visual variety
        const buttonColors = [
            { primary: '#FF6B9D', secondary: '#C44569' }, // Pink
            { primary: '#4ECDC4', secondary: '#26A69A' }, // Teal
            { primary: '#45B7D1', secondary: '#2980B9' }, // Blue
            { primary: '#96CEB4', secondary: '#6C7B7F' }, // Green
            { primary: '#FFEAA7', secondary: '#FDCB6E' }, // Yellow
            { primary: '#A29BFE', secondary: '#6C5CE7' }, // Purple
            { primary: '#FD79A8', secondary: '#E84393' }, // Magenta
            { primary: '#00CEC9', secondary: '#00B894' }  // Cyan
        ];

        // Create main menu buttons
        const buttons = [
            { text: 'Puzzle Packs', action: () => this.showPuzzlePackMenu() },
            { text: 'Adventure', action: () => this.showAdventureMenu() },
            { text: 'Stats', action: () => this.showStatsMenu() },
            { text: 'Power-Ups', action: () => this.showPowerUpsMenu() },
            { text: 'Mode: Normal', action: () => this.toggleMode() },
            { text: 'Difficulty: Easy', action: () => this.toggleDifficulty() },
            { text: 'Theme: Vibrant', action: () => this.nextTheme() },
            { text: 'Endless: Off', action: () => this.toggleEndless() }
        ];

        this.menuButtons = [];
        buttons.forEach((btn, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const x = startX + col * spacingX;
            const y = btnStartY + row * spacingY;
            const colorSet = buttonColors[index % buttonColors.length];

            const button = createButton(x, y, btn.text, colorSet.primary, colorSet.secondary);
            this.menuButtons.push({ ...button, action: btn.action, index });

            // Button animations
            button.hitArea.on('pointerover', () => {
                button.glow.setVisible(true);
                this.tweens.add({
                    targets: [button.bg, button.text],
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 150,
                    ease: 'Back.Out'
                });
            });

            button.hitArea.on('pointerout', () => {
                button.glow.setVisible(false);
                this.tweens.add({
                    targets: [button.bg, button.text],
                    scaleX: 1,
                    scaleY: 1,
                    duration: 150
                });
            });

            button.hitArea.on('pointerdown', () => {
                this.tweens.add({
                    targets: [button.bg, button.text],
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 100,
                    yoyo: true,
                    onComplete: btn.action
                });
            });

            // Entrance animation
            [button.bg, button.text].forEach(obj => {
                obj.setAlpha(0);
                obj.setScale(0.8);
                this.tweens.add({
                    targets: obj,
                    alpha: 1,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 600,
                    delay: index * 100,
                    ease: 'Back.Out'
                });
            });
        });
        // Beautiful START button closer to other buttons
        // Calculate position after the last row of buttons (4 rows total, 0-indexed so row 3)
        const lastRowY = btnStartY + 3 * spacingY;
        const startY = lastRowY + (isVerySmall ? 35 : (isMobile ? 45 : 55));
        const startBtnWidth = isVerySmall ? width * 0.5 : (isMobile ? width * 0.6 : (isWideScreen ? Math.min(320, width * 0.25) : 220));
        const startBtnHeight = isVerySmall ? 40 : (isMobile ? 45 : 55);

        // Start button background with animated gradient
        const startBg = this.add.graphics();
        startBg.fillGradientStyle(0xFF6B35, 0xF7931E, 0xFF6B35, 0xF7931E);
        startBg.fillRoundedRect(centerX - startBtnWidth / 2, startY - startBtnHeight / 2, startBtnWidth, startBtnHeight, 16);

        // Start button glow
        const startGlow = this.add.graphics();
        startGlow.fillStyle(0xFF6B35, 0.4);
        startGlow.fillRoundedRect(centerX - startBtnWidth / 2 - 3, startY - startBtnHeight / 2 - 3, startBtnWidth + 6, startBtnHeight + 6, 18);

        // Animated glow effect
        this.tweens.add({
            targets: startGlow,
            alpha: { from: 0.4, to: 0.7 },
            scaleX: { from: 1, to: 1.05 },
            scaleY: { from: 1, to: 1.05 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Start button text
        const startText = this.add.text(centerX, startY, 'START GAME', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: isMobile ? 20 : (isWideScreen ? Math.round(24 * fontScale) : 24),
            fontStyle: 'bold',
            color: '#ffffff',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4 }
        }).setOrigin(0.5);

        // Start button interaction
        const startHitArea = this.add.rectangle(centerX, startY, startBtnWidth, startBtnHeight, 0x000000, 0);
        startHitArea.setInteractive({ useHandCursor: true });

        startHitArea.on('pointerover', () => {
            this.tweens.add({
                targets: [startBg, startText],
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 200,
                ease: 'Back.Out'
            });
        });

        startHitArea.on('pointerout', () => {
            this.tweens.add({
                targets: [startBg, startText],
                scaleX: 1,
                scaleY: 1,
                duration: 200
            });
        });

        startHitArea.on('pointerdown', () => {
            this.tweens.add({
                targets: [startBg, startText],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: () => this.scene.start('GameScene')
            });
        });
        // Removed duplicate START button - only using the one in the grid
        // Fade-in effect for main elements (logo and title only - buttons have their own entrance animations)
        [this.logo, this.titleText].forEach(el => {
            if (el && el.setAlpha) {
                el.setAlpha(0);
                this.tweens.add({
                    targets: el,
                    alpha: { from: 0, to: 1 },
                    duration: 900,
                    delay: 200
                });
            }
        });
        // Add more glossy/animated effects as needed
    }

    showPowerUpsMenu() {
        const theme = THEMES[GameScene.activeThemeIdx || 0] || THEMES[0]; // Get theme with fallback
        import('./powerups.js').then(module => {
            const { POWERUP_TYPES, getInventory, getCoins, buyPowerup, usePowerup } = module;
            let inventory = getInventory ? getInventory() : {};
            let coins = getCoins ? getCoins() : 0;

            // Create themed overlay background
            const overlay = this.add.graphics();
            overlay.fillGradientStyle(
                parseInt(theme.background.replace('#', '0x')),
                parseInt(theme.background.replace('#', '0x')),
                0x1a1a2e,
                0x16213e
            );
            overlay.fillRoundedRect(210, 240, 480, 420, 15);
            overlay.setAlpha(0.95);

            // Disable main menu buttons while overlay is open
            this.disableMainMenuButtons();

            const title = this.add.text(450, 300, 'Power-Ups', {
                fontFamily: 'Poppins, sans-serif',
                fontSize: 36,
                fill: '#ffffff',
                fontStyle: 'bold',
                stroke: theme.button.color,
                strokeThickness: 3,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: theme.button.color,
                    blur: 10
                }
            }).setOrigin(0.5);
            // Coins display with gradient background
            const coinsBg = this.add.graphics();
            coinsBg.fillGradientStyle(0xffd700, 0xffd700, 0xffed4e, 0xffed4e);
            coinsBg.fillRoundedRect(450 - 80, 340 - 20, 160, 40, 10);

            const coinsText = this.add.text(450, 340, `Coins: ${coins}`, {
                fontFamily: 'Poppins, sans-serif',
                fontSize: 20,
                fill: '#000000',
                stroke: '#ffffff',
                strokeThickness: 1,
                fontStyle: 'bold'
            }).setOrigin(0.5);
            let y = 400;
            const powerupButtons = [];
            const buyButtons = [];
            const typeLabels = { CLEAR_ROW: 'Row', SWAP_TRAY: 'Swap', EXTRA_UNDO: 'Undo' };
            Object.keys(POWERUP_TYPES).forEach(type => {
                const count = inventory[type] || 0;
                const label = `${typeLabels[type] || POWERUP_TYPES[type]} (${count})`;

                // Create gradient button background for powerup
                const btnBg = this.add.graphics();
                const btnWidth = 180;
                const btnHeight = 40;
                const primaryColor = count > 0 ? parseInt(theme.button.color.replace('#', '0x')) : 0x444444;
                const secondaryColor = count > 0 ? parseInt(theme.button.color.replace('#', '0x')) : 0x666666;

                btnBg.fillGradientStyle(primaryColor, primaryColor, secondaryColor, secondaryColor);
                btnBg.fillRoundedRect(300 - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 12);
                btnBg.setAlpha(count > 0 ? 1.0 : 0.5);

                const btn = this.add.text(300, y, label, {
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 20,
                    fill: count > 0 ? '#ffffff' : '#cccccc',
                    stroke: '#000000',
                    strokeThickness: 2,
                    fontStyle: 'bold'
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                if (count === 0) {
                    btn.setAlpha(0.7);
                    btn.disableInteractive();
                } else {
                    btn.setAlpha(1);
                    btn.on('pointerdown', () => {
                        if (usePowerup(type)) {
                            inventory = getInventory();
                            const newCount = inventory[type] || 0;
                            btn.setText(`${typeLabels[type] || POWERUP_TYPES[type]} (${newCount})`);
                            if (newCount === 0) {
                                btn.setAlpha(0.7);
                                btnBg.setAlpha(0.5);
                                btn.disableInteractive();
                            }
                        }
                    });
                }
                powerupButtons.push({ btn, bg: btnBg });

                // Create gradient button background for buy button
                const buyBtnBg = this.add.graphics();
                const buyBtnWidth = 100;
                const buyBtnHeight = 35;

                buyBtnBg.fillGradientStyle(0x22aa22, 0x22aa22, 0x44cc44, 0x44cc44);
                buyBtnBg.fillRoundedRect(500 - buyBtnWidth / 2, y - buyBtnHeight / 2, buyBtnWidth, buyBtnHeight, 10);

                const buyBtn = this.add.text(500, y, 'Buy (5)', {
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 18,
                    fill: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 2,
                    fontStyle: 'bold'
                }).setOrigin(0.5).setInteractive();
                buyBtn.on('pointerdown', () => {
                    if (buyPowerup(type, 5)) {
                        inventory = getInventory();
                        coins = getCoins();
                        btn.setText(`${typeLabels[type] || POWERUP_TYPES[type]} (${inventory[type] || 0})`);
                        coinsText.setText(`Coins: ${coins}`);
                        btn.setAlpha(inventory[type] > 0 ? 1 : 0.7);
                        btnBg.setAlpha(inventory[type] > 0 ? 1.0 : 0.5);
                        if (inventory[type] > 0) btn.setInteractive({ useHandCursor: true });
                        else btn.disableInteractive();
                    } else {
                        // Flash red for failed purchase
                        buyBtnBg.clear();
                        buyBtnBg.fillGradientStyle(0xaa2222, 0xaa2222, 0xcc4444, 0xcc4444);
                        buyBtnBg.fillRoundedRect(500 - buyBtnWidth / 2, y - buyBtnHeight / 2, buyBtnWidth, buyBtnHeight, 10);
                        this.time.delayedCall(400, () => {
                            buyBtnBg.clear();
                            buyBtnBg.fillGradientStyle(0x22aa22, 0x22aa22, 0x44cc44, 0x44cc44);
                            buyBtnBg.fillRoundedRect(500 - buyBtnWidth / 2, y - buyBtnHeight / 2, buyBtnWidth, buyBtnHeight, 10);
                        });
                    }
                });
                buyButtons.push({ btn: buyBtn, bg: buyBtnBg });
                y += 56;
            });
            // Add close button
            const closeBtn = this.add.text(450, 580, 'Close', {
                fontFamily: 'Poppins, sans-serif',
                fontSize: 24,
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
                backgroundColor: theme.button.color,
                padding: { left: 24, right: 24, top: 12, bottom: 12 }
            }).setOrigin(0.5).setInteractive();
            closeBtn.on('pointerdown', () => {
                overlay.destroy();
                title.destroy();
                coinsBg.destroy();
                coinsText.destroy();
                powerupButtons.forEach(t => {
                    if (t.btn) t.btn.destroy();
                    if (t.bg) t.bg.destroy();
                });
                buyButtons.forEach(b => {
                    if (b.btn) b.btn.destroy();
                    if (b.bg) b.bg.destroy();
                });
                closeBtn.destroy();
                // Re-enable main menu buttons
                this.enableMainMenuButtons();
            });
            this.children.bringToTop(overlay);
            this.children.bringToTop(title);
            this.children.bringToTop(coinsBg);
            this.children.bringToTop(coinsText);
            powerupButtons.forEach(t => {
                this.children.bringToTop(t.bg);
                this.children.bringToTop(t.btn);
            });
            buyButtons.forEach(b => {
                this.children.bringToTop(b.bg);
                this.children.bringToTop(b.btn);
            });
            this.children.bringToTop(closeBtn);
        });
    }

    showAdventureMenu() {
        const theme = THEMES[GameScene.activeThemeIdx || 0] || THEMES[0]; // Get theme with fallback
        import('./adventure.js').then(module => {
            const { ADVENTURE_CHAPTERS, getAdventureProgress, isChapterUnlocked, isChapterCompleted } = module;
            const progress = getAdventureProgress ? getAdventureProgress() : {};

            // Create themed overlay background
            const overlay = this.add.graphics();
            overlay.fillGradientStyle(
                parseInt(theme.background.replace('#', '0x')),
                parseInt(theme.background.replace('#', '0x')),
                0x1a1a2e,
                0x16213e
            );
            overlay.fillRoundedRect(190, 240, 520, 420, 15);
            overlay.setAlpha(0.95);

            // Disable main menu buttons while overlay is open
            this.disableMainMenuButtons();

            const title = this.add.text(450, 260, 'Adventure Mode', {
                fontFamily: 'Poppins, sans-serif',
                fontSize: 36,
                fill: '#ffffff',
                fontStyle: 'bold',
                stroke: theme.button.color,
                strokeThickness: 3,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: theme.button.color,
                    blur: 10
                }
            }).setOrigin(0.5);
            let y = 320;
            const chapterTexts = [];
            ADVENTURE_CHAPTERS.forEach((chapter, idx) => {
                const unlocked = isChapterUnlocked ? isChapterUnlocked(idx) : false;
                const completed = isChapterCompleted ? isChapterCompleted(idx) : false;
                let label = `${chapter.name}`;
                if (!unlocked) label += ' 🔒';
                else if (completed) label += ' ✅';

                // Create gradient button background
                const btnBg = this.add.graphics();
                const btnWidth = 400;
                const btnHeight = 35;

                let primaryColor, secondaryColor;
                if (completed) {
                    primaryColor = 0x22aa22;
                    secondaryColor = 0x44cc44;
                } else if (unlocked) {
                    primaryColor = parseInt(theme.button.color.replace('#', '0x'));
                    secondaryColor = parseInt(theme.button.color.replace('#', '0x'));
                } else {
                    primaryColor = 0x666666;
                    secondaryColor = 0x888888;
                }

                btnBg.fillGradientStyle(primaryColor, primaryColor, secondaryColor, secondaryColor);
                btnBg.fillRoundedRect(450 - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 12);
                btnBg.setAlpha(unlocked ? 1.0 : 0.7);

                const txt = this.add.text(450, y, label, {
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 20,
                    fill: unlocked ? '#ffffff' : '#cccccc',
                    stroke: '#000000',
                    strokeThickness: 2,
                    fontStyle: 'bold'
                }).setOrigin(0.5).setInteractive();

                if (unlocked) {
                    txt.on('pointerdown', () => {
                        // Start adventure chapter
                        this.scene.start('GameScene', {
                            mode: 'adventure',
                            chapterIdx: idx
                        });
                    });
                }

                chapterTexts.push({ btn: txt, bg: btnBg });
                y += 45;
            });
            // Progress text
            const progressText = this.add.text(450, 560, `Progress: ${progress.completedChapters ? progress.completedChapters.length : 0}/${ADVENTURE_CHAPTERS.length} chapters completed`, {
                fontFamily: 'Poppins, sans-serif',
                fontSize: 20,
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
                backgroundColor: theme.button.color,
                padding: { left: 18, right: 18, top: 6, bottom: 6 }
            }).setOrigin(0.5);
            // Add close button
            const closeBtn = this.add.text(450, 600, 'Close', {
                fontFamily: 'Poppins, sans-serif',
                fontSize: 24,
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
                backgroundColor: theme.button.color,
                padding: { left: 24, right: 24, top: 12, bottom: 12 }
            }).setOrigin(0.5).setInteractive();
            closeBtn.on('pointerdown', () => {
                overlay.destroy();
                title.destroy();
                chapterTexts.forEach(t => {
                    if (t.btn) t.btn.destroy();
                    if (t.bg) t.bg.destroy();
                });
                progressText.destroy();
                closeBtn.destroy();
                // Re-enable main menu buttons
                this.enableMainMenuButtons();
            });
            this.children.bringToTop(overlay);
            this.children.bringToTop(title);
            chapterTexts.forEach(t => {
                this.children.bringToTop(t.bg);
                this.children.bringToTop(t.btn);
            });
            this.children.bringToTop(progressText);
            this.children.bringToTop(closeBtn);
        });
    }

    // Helper methods for button actions
    toggleMode() {
        GameScene.GAME_MODE = Modes.getNextMode(GameScene.GAME_MODE);
        const modeButton = this.menuButtons.find(btn => btn.index === 4);
        if (modeButton) {
            const modeLabel = this.getModeLabel();
            modeButton.text.setText(`Mode: ${modeLabel}`);
        }
    }

    toggleDifficulty() {
        GameScene.DIFFICULTY = GameScene.DIFFICULTY === 'easy' ? 'difficult' : 'easy';
        const diffButton = this.menuButtons.find(btn => btn.index === 5);
        if (diffButton) {
            const diffLabel = GameScene.DIFFICULTY === 'easy' ? 'Easy' : 'Difficult';
            diffButton.text.setText(`Difficulty: ${diffLabel}`);
        }
    }

    nextTheme() {
        GameScene.activeThemeIdx = (GameScene.activeThemeIdx + 1) % THEMES.length;
        const themeButton = this.menuButtons.find(btn => btn.index === 6);
        if (themeButton) {
            themeButton.text.setText(`Theme: ${THEMES[GameScene.activeThemeIdx].name}`);
        }
        // Refresh menu to apply new theme
        this.scene.restart();
    }

    toggleEndless() {
        if (isEndlessMode()) {
            disableEndlessMode();
        } else {
            enableEndlessMode();
        }
        const endlessButton = this.menuButtons.find(btn => btn.index === 7);
        if (endlessButton) {
            endlessButton.text.setText(`Endless: ${isEndlessMode() ? 'On' : 'Off'}`);
        }
    }

    getModeLabel() {
        const mode = GameScene.GAME_MODE;
        if (mode === 'normal') return 'Normal';
        if (mode === 'daily') return 'Daily';
        if (mode === 'puzzle') return 'Puzzle';
        return mode.charAt(0).toUpperCase() + mode.slice(1);
    }

    disableMainMenuButtons() {
        if (this.menuButtons) {
            this.menuButtons.forEach(menuBtn => {
                menuBtn.hitArea.disableInteractive();
                menuBtn.bg.setAlpha(0.5);
                menuBtn.text.setAlpha(0.5);
            });
        }
    }

    enableMainMenuButtons() {
        if (this.menuButtons) {
            this.menuButtons.forEach(menuBtn => {
                menuBtn.hitArea.setInteractive({ useHandCursor: true });
                menuBtn.bg.setAlpha(1);
                menuBtn.text.setAlpha(1);
            });
        }
    }

    showPuzzlePackMenu() {
        const theme = THEMES[GameScene.activeThemeIdx || 0] || THEMES[0]; // Get theme with fallback
        import('./puzzles.js').then(module => {
            const packs = module.PUZZLE_PACKS;
            const completed = module.loadCompletedPuzzles();
            const resetCompleted = module.saveCompletedPuzzles;
            // Selection state
            let selectedPackIdx = null;
            let selectedPuzzleId = null;
            // Overlay elements
            const overlay = this.add.graphics();
            overlay.fillGradientStyle(
                parseInt(theme.background.replace('#', '0x')),
                parseInt(theme.background.replace('#', '0x')),
                0x1a1a2e,
                0x16213e
            );
            overlay.fillRoundedRect(150, 200, 600, 500, 15);
            overlay.setAlpha(0.95);

            // Disable main menu buttons while overlay is open
            this.disableMainMenuButtons();

            const title = this.add.text(450, 220, 'Puzzle Packs', {
                fontFamily: 'Poppins, sans-serif',
                fontSize: 38,
                fill: '#ffffff',
                fontStyle: 'bold',
                stroke: theme.button.color,
                strokeThickness: 3,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: theme.button.color,
                    blur: 10
                }
            }).setOrigin(0.5);
            // Pack buttons with main menu styling
            const packButtons = [];
            const centerX = 450;
            packs.forEach((pack, idx) => {
                const y = 300 + idx * 55;
                const done = pack.puzzles.filter(pid => completed.includes(pid)).length;
                const total = pack.puzzles.length;
                let label = `${pack.name} (${done}/${total})`;
                let locked = !pack.unlocked;
                if (locked) label += ' 🔒';
                else if (done === total) label += ' ✅';

                // Create gradient button background
                const btnBg = this.add.graphics();
                const btnWidth = 300;
                const btnHeight = 45;
                const isSelected = selectedPackIdx === idx;

                btnBg.fillGradientStyle(
                    parseInt(theme.button.color.replace('#', '0x')),
                    parseInt(theme.button.color.replace('#', '0x')),
                    isSelected ? 0xffffff : parseInt(theme.button.color.replace('#', '0x')),
                    isSelected ? 0xffffff : parseInt(theme.button.color.replace('#', '0x'))
                );
                btnBg.fillRoundedRect(centerX - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 12);
                btnBg.setAlpha(locked ? 0.7 : 1.0); // Make buttons fully visible

                const btn = this.add.text(centerX, y, label, {
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 20,
                    fill: locked ? '#888888' : '#ffffff',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 2
                }).setOrigin(0.5).setInteractive();
                if (!locked) {
                    btn.on('pointerdown', () => {
                        // Update selection state
                        selectedPackIdx = idx;
                        selectedPuzzleId = null;
                        // Update pack button appearances
                        packButtons.forEach((pb, pbIdx) => {
                            const isNowSelected = pbIdx === idx;
                            pb.bg.clear();
                            pb.bg.fillGradientStyle(
                                parseInt(theme.button.color.replace('#', '0x')),
                                parseInt(theme.button.color.replace('#', '0x')),
                                isNowSelected ? 0xffffff : parseInt(theme.button.color.replace('#', '0x')),
                                isNowSelected ? 0xffffff : parseInt(theme.button.color.replace('#', '0x'))
                            );
                            pb.bg.fillRoundedRect(centerX - btnWidth / 2, 300 + pbIdx * 55 - btnHeight / 2, btnWidth, btnHeight, 12);
                        });
                        // Update puzzle list
                        updatePuzzleList();
                    });
                }
                packButtons.push({ btn, bg: btnBg });
                this.children.bringToTop(btn);
            });
            // Puzzle list elements with main menu styling
            let puzzleButtons = [];
            const updatePuzzleList = () => {
                // Remove old puzzle buttons
                puzzleButtons.forEach(pb => {
                    pb.btn.destroy();
                    pb.bg.destroy();
                });
                puzzleButtons = [];
                if (selectedPackIdx === null) return;
                const pack = packs[selectedPackIdx];

                // Show puzzle list on the right side
                const puzzleStartX = 600;
                pack.puzzles.forEach((pid, pidx) => {
                    const py = 320 + pidx * 45;
                    const isDone = completed.includes(pid);
                    const pLabel = `Puzzle ${pidx + 1}` + (isDone ? ' ✅' : '');
                    const isSelected = selectedPuzzleId === pid;

                    // Create gradient button background for puzzles
                    const pBtnBg = this.add.graphics();
                    const pBtnWidth = 200;
                    const pBtnHeight = 35;

                    pBtnBg.fillGradientStyle(
                        isDone ? 0x22aa22 : parseInt(theme.button.color.replace('#', '0x')),
                        isDone ? 0x22aa22 : parseInt(theme.button.color.replace('#', '0x')),
                        isSelected ? 0xffffff : (isDone ? 0x22aa22 : parseInt(theme.button.color.replace('#', '0x'))),
                        isSelected ? 0xffffff : (isDone ? 0x22aa22 : parseInt(theme.button.color.replace('#', '0x')))
                    );
                    pBtnBg.fillRoundedRect(puzzleStartX - pBtnWidth / 2, py - pBtnHeight / 2, pBtnWidth, pBtnHeight, 8);
                    pBtnBg.setAlpha(isSelected ? 1 : 0.9);

                    const pBtn = this.add.text(puzzleStartX, py, pLabel, {
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: 18,
                        fill: '#ffffff',
                        fontStyle: 'bold',
                        stroke: '#000000',
                        strokeThickness: 1
                    }).setOrigin(0.5).setInteractive();
                    // Make all puzzles clickable (both completed and uncompleted)
                    pBtn.on('pointerdown', () => {
                        selectedPuzzleId = pid;
                        updatePuzzleList(); // Refresh puzzle list with new selection
                    });
                    puzzleButtons.push({ btn: pBtn, bg: pBtnBg });
                    this.children.bringToTop(pBtnBg);
                    this.children.bringToTop(pBtn);
                });
            };

            // Initialize puzzle list if a pack is already selected
            updatePuzzleList();

            // Start Game button with main menu styling
            const startBtnBg = this.add.graphics();
            startBtnBg.fillGradientStyle(0x22aa22, 0x22aa22, 0x44cc44, 0x44cc44);
            startBtnBg.fillRoundedRect(450 - 120, 650 - 25, 240, 50, 12);
            startBtnBg.setAlpha(0.7);

            const startBtn = this.add.text(450, 650, 'Start Game', {
                fontFamily: 'Poppins, sans-serif',
                fontSize: 24,
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
                fontStyle: 'bold'
            }).setOrigin(0.5).setInteractive();
            startBtn.on('pointerdown', () => {
                if (selectedPackIdx !== null && selectedPuzzleId !== null) {
                    this.scene.start('GameScene', {
                        mode: 'puzzle',
                        packIdx: selectedPackIdx,
                        puzzleId: selectedPuzzleId
                    });
                    // Clean up overlay
                    overlay.destroy();
                    title.destroy();
                    packButtons.forEach(b => {
                        if (b.btn) b.btn.destroy();
                        if (b.bg) b.bg.destroy();
                    });
                    puzzleButtons.forEach(pb => {
                        if (pb.btn) pb.btn.destroy();
                        if (pb.bg) pb.bg.destroy();
                    });
                    startBtn.destroy();
                    startBtnBg.destroy();
                    resetBtn.destroy();
                    resetBtnBg.destroy();
                    closeBtn.destroy();
                    closeBtnBg.destroy();
                    // Re-enable main menu buttons
                    this.enableMainMenuButtons();
                }
            });
            // Enable/disable start button based on selection
            this.time.addEvent({
                delay: 200,
                loop: true,
                callback: () => {
                    if (selectedPackIdx !== null && selectedPuzzleId !== null) {
                        startBtn.setAlpha(1);
                        startBtnBg.setAlpha(1);
                    } else {
                        startBtn.setAlpha(0.7);
                        startBtnBg.setAlpha(0.7);
                    }
                }
            });
            // Reset Progress button with main menu styling
            const resetBtnBg = this.add.graphics();
            resetBtnBg.fillGradientStyle(0xcc2222, 0xcc2222, 0xff4444, 0xff4444);
            resetBtnBg.fillRoundedRect(220 - 80, 700 - 22, 160, 44, 10);

            const resetBtn = this.add.text(220, 700, 'Reset Progress', {
                fontFamily: 'Poppins, sans-serif',
                fontSize: 18,
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
                fontStyle: 'bold'
            }).setOrigin(0.5).setInteractive();
            resetBtn.on('pointerdown', () => {
                resetCompleted([]);
                overlay.destroy();
                title.destroy();
                packButtons.forEach(b => {
                    if (b.btn) b.btn.destroy();
                    if (b.bg) b.bg.destroy();
                });
                puzzleButtons.forEach(pb => {
                    if (pb.btn) pb.btn.destroy();
                    if (pb.bg) pb.bg.destroy();
                });
                startBtn.destroy();
                startBtnBg.destroy();
                resetBtn.destroy();
                resetBtnBg.destroy();
                closeBtn.destroy();
                closeBtnBg.destroy();
                // Re-enable main menu buttons temporarily (showPuzzlePackMenu will disable them again)
                this.enableMainMenuButtons();
                this.showPuzzlePackMenu();
            });
            // Close button with main menu styling
            const closeBtnBg = this.add.graphics();
            closeBtnBg.fillGradientStyle(
                parseInt(theme.button.color.replace('#', '0x')),
                parseInt(theme.button.color.replace('#', '0x')),
                parseInt(theme.button.color.replace('#', '0x')),
                parseInt(theme.button.color.replace('#', '0x'))
            );
            closeBtnBg.fillRoundedRect(700 - 60, 700 - 22, 120, 44, 10);

            const closeBtn = this.add.text(700, 700, 'Close', {
                fontFamily: 'Poppins, sans-serif',
                fontSize: 20,
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
                fontStyle: 'bold'
            }).setOrigin(0.5).setInteractive();
            closeBtn.on('pointerdown', () => {
                overlay.destroy();
                title.destroy();
                packButtons.forEach(b => {
                    b.btn.destroy();
                    b.bg.destroy();
                });
                puzzleButtons.forEach(pb => {
                    pb.btn.destroy();
                    pb.bg.destroy();
                });
                startBtn.destroy();
                startBtnBg.destroy();
                resetBtn.destroy();
                resetBtnBg.destroy();
                closeBtn.destroy();
                closeBtnBg.destroy();
                // Re-enable main menu buttons
                this.enableMainMenuButtons();
            });
            this.children.bringToTop(overlay);
            this.children.bringToTop(title);
            packButtons.forEach(b => {
                this.children.bringToTop(b.bg);
                this.children.bringToTop(b.btn);
            });
            puzzleButtons.forEach(pb => {
                this.children.bringToTop(pb.bg);
                this.children.bringToTop(pb.btn);
            });
            this.children.bringToTop(startBtnBg);
            this.children.bringToTop(startBtn);
            this.children.bringToTop(resetBtnBg);
            this.children.bringToTop(resetBtn);
            this.children.bringToTop(closeBtnBg);
            this.children.bringToTop(closeBtn);
        });
    }

    showStatsMenu() {
        const theme = THEMES[GameScene.activeThemeIdx || 0] || THEMES[0]; // Get theme with fallback
        // Use ES module import for stats and coins
        Promise.all([
            import('./stats.js'),
            import('./powerups.js')
        ]).then(([statsModule, powerupsModule]) => {
            const stats = statsModule.loadStats();
            const coins = powerupsModule.getCoins ? powerupsModule.getCoins() : 0;
            // Create themed overlay background
            const overlay = this.add.graphics();
            overlay.fillGradientStyle(
                parseInt(theme.background.replace('#', '0x')),
                parseInt(theme.background.replace('#', '0x')),
                0x1a1a2e,
                0x16213e
            );
            overlay.fillRoundedRect(240, 250, 420, 400, 15);
            overlay.setAlpha(0.95);

            // Disable main menu buttons while overlay is open
            this.disableMainMenuButtons();

            const title = this.add.text(450, 300, 'Statistics', {
                fontFamily: 'Poppins, sans-serif',
                fontSize: 36,
                fill: '#ffffff',
                fontStyle: 'bold',
                stroke: theme.button.color,
                strokeThickness: 3,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: theme.button.color,
                    blur: 10
                }
            }).setOrigin(0.5);
            // Improved stats logic (from game scene)
            let statTextStr = `Best Score (Easy): ${stats.bestScoreEasy || 0}\nBest Score (Difficult): ${stats.bestScoreDifficult || 0}\nBest Score (Endless): ${stats.bestScoreEndless || 0}\nTotal Games: ${stats.totalGames || 0}\nTotal Endless Games: ${stats.totalEndlessGames || 0}\nTotal Lines Cleared: ${stats.totalLines || 0}\nPuzzles Solved: ${stats.puzzlesSolved || 0}\nLongest Streak: ${stats.longestStreak || 0}\nCurrent Streak: ${stats.currentStreak || 0}\nCoins: ${coins}`;
            const statText = this.add.text(450, 400, statTextStr, {
                fontFamily: 'Poppins, sans-serif',
                fontSize: 22,
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
                backgroundColor: theme.button.color,
                padding: { left: 18, right: 18, top: 8, bottom: 8 },
                align: 'center'
            }).setOrigin(0.5);
            // Add close button
            const closeBtn = this.add.text(450, 520, 'Close', {
                fontFamily: 'Poppins, sans-serif',
                fontSize: 24,
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
                backgroundColor: theme.button.color,
                padding: { left: 24, right: 24, top: 12, bottom: 12 }
            }).setOrigin(0.5).setInteractive();
            closeBtn.on('pointerdown', () => {
                overlay.destroy();
                title.destroy();
                statText.destroy();
                closeBtn.destroy();
                // Re-enable main menu buttons
                this.enableMainMenuButtons();
            });
            this.children.bringToTop(overlay);
            this.children.bringToTop(title);
            this.children.bringToTop(statText);
            this.children.bringToTop(closeBtn);
        });
    }
}
