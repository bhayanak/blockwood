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
        // Puzzle Packs button
        this.puzzlePacksButton = this.add.text(200, 600, 'Puzzle Packs', {
            fontSize: 28,
            color: '#fff',
            backgroundColor: '#444',
            padding: { left: 18, right: 18, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive();
        this.puzzlePacksButton.on('pointerdown', () => {
            this.showPuzzlePackMenu();
        });

        // Stats button
        this.statsButton = this.add.text(700, 600, 'Stats', {
            fontSize: 28,
            color: '#fff',
            backgroundColor: '#444',
            padding: { left: 18, right: 18, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive();
        this.statsButton.on('pointerdown', () => {
            this.showStatsMenu();
        });

        // Power-Ups button
        this.powerUpsButton = this.add.text(200, 700, 'Power-Ups', {
            fontSize: 28,
            color: '#fff',
            backgroundColor: '#444',
            padding: { left: 18, right: 18, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive();
        this.powerUpsButton.on('pointerdown', () => {
            this.showPowerUpsMenu();
        });

        // Adventure button
        this.adventureButton = this.add.text(700, 700, 'Adventure', {
            fontSize: 28,
            color: '#fff',
            backgroundColor: '#444',
            padding: { left: 18, right: 18, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive();
        this.adventureButton.on('pointerdown', () => {
            this.showAdventureMenu();
        });

        // Fade-in effect for new buttons
        [this.puzzlePacksButton, this.statsButton, this.powerUpsButton, this.adventureButton].forEach(el => {
            el.setAlpha(0);
            this.tweens.add({
                targets: el,
                alpha: { from: 0, to: 1 },
                duration: 900,
                delay: 200
            });
        });

        // Glossy animated background
        this.cameras.main.setBackgroundColor('#222');
        // Example: animated particles (Phaser 3.60+)
        this.add.particles({
            key: 'logo',
            x: 450,
            y: 200,
            speed: { min: -100, max: 100 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 1200,
            frequency: 80
        });
        // Animated glow effect behind logo
        const glow = this.add.graphics();
        glow.fillStyle(0x00ffff, 0.25);
        glow.fillCircle(450, 200, 120);
        this.tweens.add({
            targets: glow,
            alpha: { from: 0.25, to: 0.6 },
            duration: 1200,
            yoyo: true,
            repeat: -1
        });
        // Logo
        this.logo = this.add.image(450, 200, 'logo').setScale(1.2).setAlpha(0.95);
        // Animated title text
        this.titleText = this.add.text(450, 320, 'Blockwood', {
            fontFamily: 'Arial', fontSize: 64, color: '#fff', fontStyle: 'bold', shadow: { offsetX: 4, offsetY: 4, color: '#0ff', blur: 12, stroke: true }
        }).setOrigin(0.5);
        this.tweens.add({
            targets: this.titleText,
            scale: { from: 1, to: 1.08 },
            duration: 900,
            yoyo: true,
            repeat: -1
        });
        // Options: Mode, Difficulty, Theme, Endless Mode
        // Helper to get mode label
        const getModeLabel = () => {
            const mode = GameScene.GAME_MODE;
            if (mode === 'normal') return 'Normal';
            if (mode === 'daily') return 'Daily';
            if (mode === 'puzzle') return 'Puzzle';
            return mode.charAt(0).toUpperCase() + mode.slice(1);
        };
        // Mode selector
        this.modeButton = this.add.text(300, 420, 'Mode: ' + getModeLabel(), { fontSize: 28, color: '#fff', backgroundColor: '#444', padding: { left: 18, right: 18, top: 8, bottom: 8 } }).setOrigin(0.5).setInteractive();
        this.modeButton.on('pointerdown', () => {
            GameScene.GAME_MODE = Modes.getNextMode(GameScene.GAME_MODE);
            this.modeButton.setText('Mode: ' + getModeLabel());
        });
        // Difficulty selector
        this.difficultyButton = this.add.text(600, 420, 'Difficulty: ' + (GameScene.DIFFICULTY === 'easy' ? 'Easy' : 'Difficult'), { fontSize: 28, color: '#fff', backgroundColor: '#444', padding: { left: 18, right: 18, top: 8, bottom: 8 } }).setOrigin(0.5).setInteractive();
        this.difficultyButton.on('pointerdown', () => {
            GameScene.DIFFICULTY = GameScene.DIFFICULTY === 'easy' ? 'difficult' : 'easy';
            this.difficultyButton.setText('Difficulty: ' + (GameScene.DIFFICULTY === 'easy' ? 'Easy' : 'Difficult'));
        });
        // Theme selector
        this.themeButton = this.add.text(300, 500, 'Theme: ' + THEMES[GameScene.activeThemeIdx].name, { fontSize: 28, color: '#fff', backgroundColor: '#444', padding: { left: 18, right: 18, top: 8, bottom: 8 } }).setOrigin(0.5).setInteractive();
        this.themeButton.on('pointerdown', () => {
            GameScene.activeThemeIdx = (GameScene.activeThemeIdx + 1) % THEMES.length;
            this.themeButton.setText('Theme: ' + THEMES[GameScene.activeThemeIdx].name);
        });
        // Endless Mode toggle
        this.endlessButton = this.add.text(600, 500, 'Endless Mode: ' + (isEndlessMode() ? 'On' : 'Off'), { fontSize: 28, color: '#fff', backgroundColor: '#444', padding: { left: 18, right: 18, top: 8, bottom: 8 } }).setOrigin(0.5).setInteractive();
        this.endlessButton.on('pointerdown', () => {
            if (isEndlessMode()) { disableEndlessMode(); } else { enableEndlessMode(); }
            this.endlessButton.setText('Endless Mode: ' + (isEndlessMode() ? 'On' : 'Off'));
        });
        // Start button
        this.startButton = this.add.text(450, 650, 'Start', { fontSize: 40, color: '#0ff', backgroundColor: '#111', fontStyle: 'bold', padding: { left: 32, right: 32, top: 16, bottom: 16 }, shadow: { offsetX: 2, offsetY: 2, color: '#fff', blur: 8, stroke: true } }).setOrigin(0.5).setInteractive();
        this.startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        this.tweens.add({
            targets: this.startButton,
            alpha: { from: 1, to: 0.7 },
            duration: 700,
            yoyo: true,
            repeat: -1
        });
        // Fade-in effect for all menu elements
        [this.logo, this.titleText, this.modeButton, this.difficultyButton, this.themeButton, this.endlessButton, this.startButton].forEach(el => {
            el.setAlpha(0);
            this.tweens.add({
                targets: el,
                alpha: { from: 0, to: 1 },
                duration: 900,
                delay: 200
            });
        });
        // Add more glossy/animated effects as needed
    }

    showPowerUpsMenu() {
        import('./powerups.js').then(module => {
            const { POWERUP_TYPES, getInventory, getCoins, buyPowerup } = module;
            const inventory = getInventory ? getInventory() : {};
            let coins = getCoins ? getCoins() : 0;
            const overlay = this.add.rectangle(450, 450, 480, 420, 0x222222, 0.85).setOrigin(0.5);
            const title = this.add.text(450, 300, 'Power-Ups', { fontFamily: 'Arial', fontSize: 36, color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
            const coinsText = this.add.text(450, 340, `Coins: ${coins}`, { fontSize: 24, color: '#ffd700', backgroundColor: '#333', padding: { left: 18, right: 18, top: 8, bottom: 8 } }).setOrigin(0.5);
            let y = 380;
            const powerupTexts = [];
            const buyButtons = [];
            Object.keys(POWERUP_TYPES).forEach(type => {
                const label = `${POWERUP_TYPES[type]}: ${inventory[type] || 0}`;
                const txt = this.add.text(350, y, label, { fontSize: 22, color: '#fff', backgroundColor: '#333', padding: { left: 14, right: 14, top: 6, bottom: 6 } }).setOrigin(0.5);
                powerupTexts.push(txt);
                // Buy button
                const buyBtn = this.add.text(550, y, 'Buy (5)', { fontSize: 20, color: '#fff', backgroundColor: '#0a0', padding: { left: 12, right: 12, top: 4, bottom: 4 } }).setOrigin(0.5).setInteractive();
                buyBtn.on('pointerdown', () => {
                    if (buyPowerup(type, 5)) {
                        // Update inventory and coins
                        const newInventory = getInventory();
                        coins = getCoins();
                        txt.setText(`${POWERUP_TYPES[type]}: ${newInventory[type] || 0}`);
                        coinsText.setText(`Coins: ${coins}`);
                    } else {
                        buyBtn.setBackgroundColor('#a00');
                        this.time.delayedCall(400, () => buyBtn.setBackgroundColor('#0a0'));
                    }
                });
                buyButtons.push(buyBtn);
                y += 40;
            });
            // Add close button
            const closeBtn = this.add.text(450, 580, 'Close', { fontSize: 24, color: '#fff', backgroundColor: '#222', padding: { left: 24, right: 24, top: 12, bottom: 12 } }).setOrigin(0.5).setInteractive();
            closeBtn.on('pointerdown', () => {
                overlay.destroy();
                title.destroy();
                coinsText.destroy();
                powerupTexts.forEach(t => t.destroy());
                buyButtons.forEach(b => b.destroy());
                closeBtn.destroy();
            });
            this.children.bringToTop(overlay);
            this.children.bringToTop(title);
            this.children.bringToTop(coinsText);
            powerupTexts.forEach(t => this.children.bringToTop(t));
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
            let statTextStr = `Best Score: ${stats.bestScore || 0}\nTotal Games: ${stats.totalGames || 0}\nTotal Lines Cleared: ${stats.totalLines || 0}\nPuzzles Solved: ${stats.puzzlesSolved || 0}\nLongest Streak: ${stats.longestStreak || 0}\nCurrent Streak: ${stats.currentStreak || 0}\nCoins: ${coins}`;
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
