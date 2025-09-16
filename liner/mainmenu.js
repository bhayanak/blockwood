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

        // Animated floating particles
        for (let i = 0; i < (isMobile ? 15 : 25); i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(2, 6),
                parseInt(theme.button.color.replace('#', '0x')),
                0.3
            );

            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(100, 300),
                alpha: { from: 0.3, to: 0 },
                duration: Phaser.Math.Between(3000, 6000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000)
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

        // Enhanced title with gradient effect and better visibility
        const titleY = isMobile ? height * 0.25 : height * 0.28;
        const titleFontSize = isMobile ? Math.round(width * 0.08) : 42;

        // Create title with enhanced stroke and gradient effect
        this.titleText = this.add.text(centerX, titleY, 'BlockQuest', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: titleFontSize,
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: theme.button.color,
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: theme.button.color,
                blur: 20,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);

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
        // Beautiful button configuration
        const btnStartY = isMobile ? height * 0.38 : height * 0.42;
        const btnFontSize = isMobile ? Math.round(width * 0.035) : 18;
        const btnPadding = isMobile ? 8 : 12;
        const btnWidth = isMobile ? width * 0.4 : 180;
        const btnHeight = isMobile ? 35 : 42;

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

        // Button layout - 2x4 grid for better mobile experience
        const cols = isMobile ? 2 : 2;
        const rows = 4;
        const spacingX = isMobile ? width * 0.25 : 200;
        const spacingY = isMobile ? height * 0.08 : 55;
        const startX = centerX - (cols - 1) * spacingX / 2;

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
        // Beautiful START button at the bottom
        const startY = isMobile ? height * 0.85 : height * 0.82;
        const startBtnWidth = isMobile ? width * 0.6 : 220;
        const startBtnHeight = isMobile ? 45 : 55;

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
            fontSize: isMobile ? 20 : 24,
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
        import('./powerups.js').then(module => {
            const { POWERUP_TYPES, getInventory, getCoins, buyPowerup, usePowerup } = module;
            let inventory = getInventory ? getInventory() : {};
            let coins = getCoins ? getCoins() : 0;
            const overlay = this.add.rectangle(450, 450, 480, 420, 0x222222, 0.85).setOrigin(0.5);
            const title = this.add.text(450, 300, 'Power-Ups', { fontFamily: 'Arial', fontSize: 36, color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
            const coinsText = this.add.text(450, 340, `Coins: ${coins}`, { fontSize: 24, color: '#ffd700', backgroundColor: '#333', padding: { left: 18, right: 18, top: 8, bottom: 8 } }).setOrigin(0.5);
            let y = 400;
            const powerupButtons = [];
            const buyButtons = [];
            const typeLabels = { CLEAR_ROW: 'Row', SWAP_TRAY: 'Swap', EXTRA_UNDO: 'Undo' };
            Object.keys(POWERUP_TYPES).forEach(type => {
                const count = inventory[type] || 0;
                const label = `${typeLabels[type] || POWERUP_TYPES[type]} (${count})`;
                const btn = this.add.text(300, y, label, {
                    fontSize: 26,
                    color: count > 0 ? '#fff' : '#888',
                    backgroundColor: count > 0 ? '#0af' : '#333',
                    padding: { left: 18, right: 18, top: 8, bottom: 8 }
                }).setOrigin(0.5);
                btn.setInteractive({ useHandCursor: true });
                if (count === 0) {
                    btn.setAlpha(0.5);
                    btn.disableInteractive();
                } else {
                    btn.setAlpha(1);
                    btn.on('pointerdown', () => {
                        if (usePowerup(type)) {
                            inventory = getInventory();
                            const newCount = inventory[type] || 0;
                            btn.setText(`${typeLabels[type] || POWERUP_TYPES[type]} (${newCount})`);
                            if (newCount === 0) {
                                btn.setAlpha(0.5);
                                btn.disableInteractive();
                            }
                        }
                    });
                }
                powerupButtons.push(btn);
                // Buy button
                const buyBtn = this.add.text(500, y, 'Buy (5)', {
                    fontSize: 20,
                    color: '#fff',
                    backgroundColor: '#0a0',
                    padding: { left: 12, right: 12, top: 4, bottom: 4 }
                }).setOrigin(0.5).setInteractive();
                buyBtn.on('pointerdown', () => {
                    if (buyPowerup(type, 5)) {
                        inventory = getInventory();
                        coins = getCoins();
                        btn.setText(`${typeLabels[type] || POWERUP_TYPES[type]} (${inventory[type] || 0})`);
                        coinsText.setText(`Coins: ${coins}`);
                        btn.setAlpha(inventory[type] > 0 ? 1 : 0.5);
                        if (inventory[type] > 0) btn.setInteractive({ useHandCursor: true });
                        else btn.disableInteractive();
                    } else {
                        buyBtn.setBackgroundColor('#a00');
                        this.time.delayedCall(400, () => buyBtn.setBackgroundColor('#0a0'));
                    }
                });
                buyButtons.push(buyBtn);
                y += 56;
            });
            // Add close button
            const closeBtn = this.add.text(450, 580, 'Close', { fontSize: 24, color: '#fff', backgroundColor: '#222', padding: { left: 24, right: 24, top: 12, bottom: 12 } }).setOrigin(0.5).setInteractive();
            closeBtn.on('pointerdown', () => {
                overlay.destroy();
                title.destroy();
                coinsText.destroy();
                powerupButtons.forEach(t => t.destroy());
                buyButtons.forEach(b => b.destroy());
                closeBtn.destroy();
            });
            this.children.bringToTop(overlay);
            this.children.bringToTop(title);
            this.children.bringToTop(coinsText);
            powerupButtons.forEach(t => this.children.bringToTop(t));
            buyButtons.forEach(b => this.children.bringToTop(b));
            this.children.bringToTop(closeBtn);
        });
    }

    showAdventureMenu() {
        import('./adventure.js').then(module => {
            const { ADVENTURE_CHAPTERS, getAdventureProgress, isChapterUnlocked, isChapterCompleted } = module;
            const progress = getAdventureProgress ? getAdventureProgress() : {};
            const overlay = this.add.rectangle(450, 450, 520, 420, 0x222222, 0.85).setOrigin(0.5);
            const title = this.add.text(450, 260, 'Adventure Mode', { fontFamily: 'Arial', fontSize: 36, color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
            let y = 320;
            const chapterTexts = [];
            ADVENTURE_CHAPTERS.forEach((chapter, idx) => {
                const unlocked = isChapterUnlocked ? isChapterUnlocked(idx) : false;
                const completed = isChapterCompleted ? isChapterCompleted(idx) : false;
                let label = `${chapter.name} ${unlocked ? '[Unlocked]' : '[Locked]'}${completed ? ' [Completed]' : ''}`;
                const color = completed ? '#0f0' : (unlocked ? '#0ff' : '#888');
                const txt = this.add.text(450, y, label, { fontSize: 24, color, backgroundColor: '#333', padding: { left: 18, right: 18, top: 8, bottom: 8 } }).setOrigin(0.5);
                chapterTexts.push(txt);
                y += 38;
            });
            // Progress text
            const progressText = this.add.text(450, 560, `Progress: ${progress.completedChapters ? progress.completedChapters.length : 0}/${ADVENTURE_CHAPTERS.length} chapters completed`, { fontSize: 20, color: '#fff', backgroundColor: '#222', padding: { left: 18, right: 18, top: 6, bottom: 6 } }).setOrigin(0.5);
            // Add close button
            const closeBtn = this.add.text(450, 600, 'Close', { fontSize: 24, color: '#fff', backgroundColor: '#222', padding: { left: 24, right: 24, top: 12, bottom: 12 } }).setOrigin(0.5).setInteractive();
            closeBtn.on('pointerdown', () => {
                overlay.destroy();
                title.destroy();
                chapterTexts.forEach(t => t.destroy());
                progressText.destroy();
                closeBtn.destroy();
            });
            this.children.bringToTop(overlay);
            this.children.bringToTop(title);
            chapterTexts.forEach(t => this.children.bringToTop(t));
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

    showPuzzlePackMenu() {
        import('./puzzles.js').then(module => {
            const packs = module.PUZZLE_PACKS;
            const completed = module.loadCompletedPuzzles();
            const resetCompleted = module.saveCompletedPuzzles;
            // Selection state
            let selectedPackIdx = null;
            let selectedPuzzleId = null;
            // Overlay elements
            const overlay = this.add.rectangle(450, 450, 600, 500, 0x222222, 0.65).setOrigin(0.5);
            const title = this.add.text(450, 220, 'Puzzle Packs', { fontFamily: 'Arial', fontSize: 38, color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
            // Pack buttons
            const packButtons = [];
            packs.forEach((pack, idx) => {
                const y = 280 + idx * 44;
                const done = pack.puzzles.filter(pid => completed.includes(pid)).length;
                const total = pack.puzzles.length;
                let label = `${pack.name} (${done}/${total})`;
                let color = '#fff';
                let locked = !pack.unlocked;
                if (locked) {
                    label += ' [Locked]';
                    color = '#888';
                } else if (done === total) {
                    label += ' [Completed]';
                    color = '#0f0';
                }
                const btn = this.add.text(220, y, label, {
                    fontSize: 24,
                    color,
                    backgroundColor: selectedPackIdx === idx ? '#0ff' : '#333',
                    padding: { left: 18, right: 18, top: 6, bottom: 6 }
                }).setOrigin(0.5).setInteractive();
                if (!locked) {
                    btn.on('pointerdown', () => {
                        // Update selection state
                        selectedPackIdx = idx;
                        selectedPuzzleId = null;
                        // Update pack button highlights
                        packButtons.forEach((b, bidx) => b.setBackgroundColor(selectedPackIdx === bidx ? '#0ff' : '#333'));
                        // Update puzzle list
                        updatePuzzleList();
                    });
                }
                packButtons.push(btn);
                this.children.bringToTop(btn);
            });
            // Puzzle list elements
            let puzzleButtons = [];
            const updatePuzzleList = () => {
                // Remove old puzzle buttons
                puzzleButtons.forEach(pb => pb.destroy());
                puzzleButtons = [];
                if (selectedPackIdx === null) return;
                const pack = packs[selectedPackIdx];
                pack.puzzles.forEach((pid, pidx) => {
                    const py = 280 + pidx * 36;
                    const isDone = completed.includes(pid);
                    const pLabel = `Puzzle ${pidx + 1}` + (isDone ? ' [Completed]' : '');
                    const pColor = isDone ? '#0f0' : '#fff';
                    const bgColor = selectedPuzzleId === pid ? '#0ff' : '#222';
                    const pBtn = this.add.text(450, py, pLabel, {
                        fontSize: 22,
                        color: pColor,
                        backgroundColor: bgColor,
                        padding: { left: 14, right: 14, top: 4, bottom: 4 }
                    }).setOrigin(0.5).setInteractive();
                    if (!isDone) {
                        pBtn.on('pointerdown', () => {
                            selectedPuzzleId = pid;
                            puzzleButtons.forEach((b, bidx) => b.setBackgroundColor(pack.puzzles[bidx] === selectedPuzzleId ? '#0ff' : '#222'));
                        });
                    }
                    puzzleButtons.push(pBtn);
                    this.children.bringToTop(pBtn);
                });
            };
            // Start Game button
            const startBtn = this.add.text(450, 650, 'Start Game', {
                fontSize: 28,
                color: '#fff',
                backgroundColor: '#0a0',
                fontStyle: 'bold',
                padding: { left: 32, right: 32, top: 12, bottom: 12 }
            }).setOrigin(0.5).setInteractive();
            startBtn.setAlpha(0.7);
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
                    packButtons.forEach(b => b.destroy());
                    puzzleButtons.forEach(pb => pb.destroy());
                    startBtn.destroy();
                    resetBtn.destroy();
                    closeBtn.destroy();
                }
            });
            // Enable/disable start button based on selection
            this.time.addEvent({
                delay: 200,
                loop: true,
                callback: () => {
                    if (selectedPackIdx !== null && selectedPuzzleId !== null) {
                        startBtn.setAlpha(1);
                    } else {
                        startBtn.setAlpha(0.7);
                    }
                }
            });
            // Reset Progress button
            const resetBtn = this.add.text(220, 700, 'Reset Progress', {
                fontSize: 22,
                color: '#fff',
                backgroundColor: '#a00',
                fontStyle: 'bold',
                padding: { left: 18, right: 18, top: 10, bottom: 10 }
            }).setOrigin(0.5).setInteractive();
            resetBtn.on('pointerdown', () => {
                resetCompleted([]);
                overlay.destroy();
                title.destroy();
                packButtons.forEach(b => b.destroy());
                puzzleButtons.forEach(pb => pb.destroy());
                startBtn.destroy();
                resetBtn.destroy();
                closeBtn.destroy();
                this.showPuzzlePackMenu();
            });
            // Close button
            const closeBtn = this.add.text(700, 700, 'Close', {
                fontSize: 22,
                color: '#fff',
                backgroundColor: '#222',
                fontStyle: 'bold',
                padding: { left: 24, right: 24, top: 10, bottom: 10 }
            }).setOrigin(0.5).setInteractive();
            closeBtn.on('pointerdown', () => {
                overlay.destroy();
                title.destroy();
                packButtons.forEach(b => b.destroy());
                puzzleButtons.forEach(pb => pb.destroy());
                startBtn.destroy();
                resetBtn.destroy();
                closeBtn.destroy();
            });
            this.children.bringToTop(overlay);
            this.children.bringToTop(title);
            packButtons.forEach(b => this.children.bringToTop(b));
            puzzleButtons.forEach(pb => this.children.bringToTop(pb));
            this.children.bringToTop(startBtn);
            this.children.bringToTop(resetBtn);
            this.children.bringToTop(closeBtn);
        });
    }

    showStatsMenu() {
        // Use ES module import for stats and coins
        Promise.all([
            import('./stats.js'),
            import('./powerups.js')
        ]).then(([statsModule, powerupsModule]) => {
            const stats = statsModule.loadStats();
            const coins = powerupsModule.getCoins ? powerupsModule.getCoins() : 0;
            const overlay = this.add.rectangle(450, 450, 420, 400, 0x222222, 0.85).setOrigin(0.5);
            const title = this.add.text(450, 300, 'Statistics', { fontFamily: 'Arial', fontSize: 36, color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
            // Improved stats logic (from game scene)
            let statTextStr = `Best Score (Easy): ${stats.bestScoreEasy || 0}\nBest Score (Difficult): ${stats.bestScoreDifficult || 0}\nTotal Games: ${stats.totalGames || 0}\nTotal Lines Cleared: ${stats.totalLines || 0}\nPuzzles Solved: ${stats.puzzlesSolved || 0}\nLongest Streak: ${stats.longestStreak || 0}\nCurrent Streak: ${stats.currentStreak || 0}\nCoins: ${coins}`;
            const statText = this.add.text(450, 400, statTextStr, {
                fontSize: 22,
                color: '#fff',
                backgroundColor: '#333',
                padding: { left: 18, right: 18, top: 8, bottom: 8 },
                align: 'center'
            }).setOrigin(0.5);
            // Add close button
            const closeBtn = this.add.text(450, 520, 'Close', { fontSize: 24, color: '#fff', backgroundColor: '#222', padding: { left: 24, right: 24, top: 12, bottom: 12 } }).setOrigin(0.5).setInteractive();
            closeBtn.on('pointerdown', () => {
                overlay.destroy();
                title.destroy();
                statText.destroy();
                closeBtn.destroy();
            });
            this.children.bringToTop(overlay);
            this.children.bringToTop(title);
            this.children.bringToTop(statText);
            this.children.bringToTop(closeBtn);
        });
    }
}
