// Adventure mode scene - Full chapter progression system
import { GameScene } from './GameScene.js';
import { ADVENTURE_CHAPTERS, UI } from '../core/constants.js';
import { themeManager } from '../core/themes.js';
import { storage } from '../core/storage.js';
import { audioManager } from '../core/audio.js';

export class AdventureScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AdventureScene' });
        this.currentChapter = null;
        this.chapterProgress = 0;
        this.showingChapterSelect = true;
        this.gameActive = false;
        this.objectives = {};
        this.gameStats = {
            score: 0,
            lines: 0,
            moves: 0,
            combos: 0,
            powerupsUsed: 0,
            startTime: 0,
            misplacements: 0
        };
    }

    init(data) {
        this.currentChapter = data.chapter || null;
        this.showingChapterSelect = !this.currentChapter;
        this.gameActive = false;

        // Load adventure progress
        this.adventureProgress = storage.get('adventure_progress') || this.getDefaultProgress();
    }

    create() {
        this.colors = themeManager.getPhaserColors();
        this.cameras.main.setBackgroundColor(this.colors.background);

        if (this.showingChapterSelect) {
            this.createChapterSelection();
        } else {
            this.startChapter();
        }
    }

    createChapterSelection() {
        // Title
        this.add.text(this.scale.width / 2, 60, 'Adventure Mode', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(this.scale.width / 2, 90, 'Choose Your Chapter', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#cccccc'
        }).setOrigin(0.5);

        // Back button
        const backButton = this.add.rectangle(40, 40, 60, 30, 0x444444)
            .setInteractive()
            .on('pointerdown', () => {
                audioManager.playPlace();
                this.scene.start('MenuScene');
            });

        this.add.text(40, 40, 'Back', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Chapter buttons
        let yPos = 140;
        Object.values(ADVENTURE_CHAPTERS).forEach((chapter, index) => {
            this.createChapterButton(chapter, yPos + (index * 80));
        });
    }

    createChapterButton(chapter, yPos) {
        const progress = this.adventureProgress[chapter.id] || { completed: false, unlocked: false, stars: 0 };
        const isUnlocked = chapter.id === 'FOREST_START' || progress.unlocked;

        // Button background
        const buttonColor = isUnlocked ? 0x2a4a3a : 0x2a2a2a;
        const button = this.add.rectangle(this.scale.width / 2, yPos, 350, 70, buttonColor)
            .setStrokeStyle(2, isUnlocked ? 0x4a7a5a : 0x4a4a4a);

        if (isUnlocked) {
            button.setInteractive()
                .on('pointerdown', () => {
                    audioManager.playPlace();
                    this.currentChapter = chapter.id;
                    this.showingChapterSelect = false;
                    this.scene.restart({ chapter: chapter.id });
                });
        }

        // Chapter name
        this.add.text(this.scale.width / 2 - 160, yPos - 15, chapter.name, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: isUnlocked ? '#ffffff' : '#666666',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Description
        this.add.text(this.scale.width / 2 - 160, yPos + 5, chapter.description, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: isUnlocked ? '#cccccc' : '#555555',
            wordWrap: { width: 250 }
        }).setOrigin(0, 0.5);

        // Stars and status
        if (isUnlocked) {
            const stars = progress.stars || 0;
            const maxStars = 3;

            for (let i = 0; i < maxStars; i++) {
                const starColor = i < stars ? '#FFD700' : '#444444';
                this.add.text(this.scale.width / 2 + 120 + (i * 20), yPos - 20, '★', {
                    fontSize: '16px',
                    color: starColor
                });
            }

            if (progress.completed) {
                this.add.text(this.scale.width / 2 + 120, yPos + 10, 'Completed', {
                    fontSize: '12px',
                    color: '#4a7a5a',
                    fontStyle: 'bold'
                });
            }
        } else {
            this.add.text(this.scale.width / 2 + 120, yPos, 'Locked', {
                fontSize: '14px',
                color: '#666666',
                fontStyle: 'italic'
            });
        }
    }

    startChapter() {
        const chapter = ADVENTURE_CHAPTERS[this.currentChapter];
        if (!chapter) return;

        // Set theme
        themeManager.setTheme(chapter.theme);
        this.colors = themeManager.getPhaserColors();
        this.cameras.main.setBackgroundColor(this.colors.background);

        // Initialize game stats
        this.gameStats = {
            score: 0,
            lines: 0,
            moves: 0,
            combos: 0,
            powerupsUsed: 0,
            startTime: Date.now(),
            misplacements: 0
        };

        // Create story display first
        this.createStoryDisplay(chapter);
    }

    createStoryDisplay(chapter) {
        // Semi-transparent overlay
        const overlay = this.add.rectangle(this.scale.width / 2, this.scale.height / 2,
            this.scale.width, this.scale.height, 0x000000, 0.8);

        // Story panel
        const panelWidth = Math.min(360, this.scale.width - 40);
        const panelHeight = 400;
        const panel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2,
            panelWidth, panelHeight, 0x1a1a1a)
            .setStrokeStyle(2, this.colors.primary);

        // Chapter title
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 170, chapter.name, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Story text
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 120, chapter.story, {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#cccccc',
            align: 'center',
            wordWrap: { width: panelWidth - 40 }
        }).setOrigin(0.5);

        // Objectives title
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 40, 'Objectives:', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Objectives list
        chapter.objectives.forEach((objective, index) => {
            this.add.text(this.scale.width / 2, this.scale.height / 2 - 10 + (index * 25),
                `• ${objective.description}`, {
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                color: '#cccccc'
            }).setOrigin(0.5);
        });

        // Start button
        const startButton = this.add.rectangle(this.scale.width / 2, this.scale.height / 2 + 120,
            120, 40, this.colors.primary)
            .setInteractive()
            .on('pointerdown', () => {
                audioManager.playPlace();
                overlay.destroy();
                panel.destroy();
                this.destroyStoryElements();
                this.createGameplayUI();
            });

        this.add.text(this.scale.width / 2, this.scale.height / 2 + 120, 'Start Quest', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Store story elements for cleanup
        this.storyElements = [overlay, panel, startButton];
    }

    destroyStoryElements() {
        if (this.storyElements) {
            this.storyElements.forEach(element => {
                if (element && element.destroy) element.destroy();
            });
            this.storyElements = [];
        }
    }

    createGameplayUI() {
        // Initialize game components like GameScene
        this.gameActive = true;

        // Import and initialize game systems
        this.initializeGameSystems();

        // Create UI elements
        this.createHUD();
        this.createObjectiveTracker();
    }

    async initializeGameSystems() {
        // Import game systems
        const { GameGrid } = await import('../systems/grid.js');
        const { ScoringManager } = await import('../systems/scoring.js');
        const { PowerUpManager } = await import('../systems/powerups.js');
        const { ShapeGenerator } = await import('../systems/shapes.js');

        // Initialize systems
        this.gameGrid = new GameGrid(this);
        this.scoringManager = new ScoringManager(this);
        this.powerupManager = new PowerUpManager(this);
        this.shapeGenerator = new ShapeGenerator();

        // Create game elements
        this.gameGrid.create();
        this.createShapeTray();
        
        // Setup keyboard controls
        this.setupInputHandlers();
    }

    createHUD() {
        const chapter = ADVENTURE_CHAPTERS[this.currentChapter];
        
        // Chapter name
        this.add.text(this.scale.width / 2, 30, chapter.name, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Score
        this.scoreText = this.add.text(20, 60, 'Score: 0', {
            fontSize: '16px',
            color: '#ffffff'
        });

        // Timer (if chapter has time limit)
        if (chapter.specialRules?.timeLimit) {
            this.timeRemaining = chapter.specialRules.timeLimit;
            this.timerText = this.add.text(this.scale.width - 20, 60, `Time: ${this.timeRemaining}`, {
                fontSize: '16px',
                color: '#ffffff'
            }).setOrigin(1, 0);

            this.time.addEvent({
                delay: 1000,
                callback: this.updateTimer,
                callbackScope: this,
                loop: true
            });
        }

        // Moves counter (if chapter has move limit)
        if (chapter.specialRules?.limitedMoves) {
            this.movesRemaining = chapter.specialRules.limitedMoves;
            this.movesText = this.add.text(this.scale.width / 2, 60, `Moves: ${this.movesRemaining}`, {
                fontSize: '16px',
                color: '#ffffff'
            }).setOrigin(0.5, 0);
        }

        // Back button
        const backButton = this.add.rectangle(40, 30, 60, 25, 0x444444)
            .setInteractive()
            .on('pointerdown', () => {
                audioManager.playPlace();
                this.scene.start('AdventureScene');
            });

        this.add.text(40, 30, 'Back', {
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // TEST BUTTON - comprehensive coordinate test
        const testButton = this.add.rectangle(120, 30, 80, 25, 0x446644)
            .setInteractive()
            .on('pointerdown', () => {
                this.testCoordinateSystem();
            });
        
        this.add.text(120, 30, 'TEST', {
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    createObjectiveTracker() {
        const chapter = ADVENTURE_CHAPTERS[this.currentChapter];
        const startY = 90;

        this.objectiveTexts = [];
        chapter.objectives.forEach((objective, index) => {
            const text = this.add.text(20, startY + (index * 20),
                `○ ${objective.description}`, {
                fontSize: '12px',
                color: '#888888'
            });
            this.objectiveTexts.push(text);
        });
    }

    createShapeTray() {
        // Create 3 shapes for the tray
        this.trayShapes = [];
        for (let i = 0; i < 3; i++) {
            this.generateNewShape(i);
        }
    }

    generateNewShape(index) {
        const shape = this.shapeGenerator.generateRandomShape();
        const x = 80 + (index * 100);
        const y = this.scale.height - 80;

        // Create shape visual representation using Container instead of Group
        const shapeGroup = this.add.container(x, y);

        // Calculate shape bounds for proper centering
        const shapeWidth = shape.pattern[0].length * 20;
        const shapeHeight = shape.pattern.length * 20;
        const offsetX = -shapeWidth / 2;
        const offsetY = -shapeHeight / 2;

        shape.pattern.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell) {
                    const block = this.add.rectangle(
                        offsetX + colIndex * 20 + 10, // +10 to center the 18px block in 20px cell
                        offsetY + rowIndex * 20 + 10,
                        18, 18,
                        this.colors.blockColors[shape.color]
                    ).setStrokeStyle(1, 0x333333);
                    shapeGroup.add(block);
                }
            });
        });

        // Make draggable
        shapeGroup.setInteractive(
            new Phaser.Geom.Rectangle(-40, -40, 80, 80),
            Phaser.Geom.Rectangle.Contains
        );

        this.input.setDraggable(shapeGroup);

        shapeGroup.on('drag', (pointer, dragX, dragY) => {
            shapeGroup.x = dragX;
            shapeGroup.y = dragY;

            // Use raw pointer coordinates like GameScene does
            this.gameGrid.showPlacementPreview(shape, pointer.x, pointer.y);
        });

        shapeGroup.on('dragend', (pointer) => {
            // Use raw pointer coordinates like GameScene does
            if (this.gameGrid.tryPlaceShape(shape, pointer.x, pointer.y)) {
                this.onShapePlaced(shape, index);
                shapeGroup.destroy();
            } else {
                // Return to original position
                shapeGroup.x = x;
                shapeGroup.y = y;
                this.gameStats.misplacements++;
            }
            this.gameGrid.hidePlacementPreview();
        });

        this.trayShapes[index] = { group: shapeGroup, shape: shape };
    }

    onShapePlaced(shape, trayIndex) {
        this.gameStats.moves++;

    // Update moves counter
        const chapter = ADVENTURE_CHAPTERS[this.currentChapter];
        if (chapter.specialRules?.limitedMoves) {
            this.movesRemaining--;
            this.movesText.setText(`Moves: ${this.movesRemaining}`);

            if (this.movesRemaining <= 0) {
                this.checkGameEnd();
                return;
            }
        }

        // Check for line clears
        const clearedLines = this.gameGrid.checkAndClearLines();
        if (clearedLines.length > 0) {
            this.onLinesCleared(clearedLines);
        }

        // Generate new shape
        this.generateNewShape(trayIndex);

        // Check objectives
        this.checkObjectives();

        // Check if game should end
        if (!this.canPlaceAnyShape()) {
            this.checkGameEnd();
        }
    }

    onLinesCleared(lines) {
        this.gameStats.lines += lines.length;
        const points = this.scoringManager.calculateScore(lines.length);
        this.gameStats.score += points;

        if (this.scoreText) {
            this.scoreText.setText(`Score: ${this.gameStats.score}`);
        }

        // Check for combos
        if (lines.length > 1) {
            this.gameStats.combos++;
        }

        audioManager.playClear();
        this.checkObjectives();
    }

    updateTimer() {
        this.timeRemaining--;
        if (this.timerText) {
            this.timerText.setText(`Time: ${this.timeRemaining}`);
        }

        if (this.timeRemaining <= 0) {
            this.checkGameEnd();
        }
    }

    checkObjectives() {
        const chapter = ADVENTURE_CHAPTERS[this.currentChapter];
        let completedObjectives = 0;

        chapter.objectives.forEach((objective, index) => {
            let completed = false;

            switch (objective.type) {
                case 'score':
                    completed = this.gameStats.score >= objective.target;
                    break;
                case 'lines':
                    completed = this.gameStats.lines >= objective.target;
                    break;
                case 'moves':
                    completed = this.gameStats.moves <= objective.target;
                    break;
                case 'combo':
                    completed = this.gameStats.combos >= objective.target;
                    break;
                case 'powerups':
                    completed = this.gameStats.powerupsUsed >= objective.target;
                    break;
                // Add more objective types as needed
            }

            if (completed && this.objectiveTexts[index]) {
                this.objectiveTexts[index].setText(`✓ ${objective.description}`);
                this.objectiveTexts[index].setColor('#4a7a5a');
                completedObjectives++;
            }
        });

        // Check if all objectives completed
        if (completedObjectives === chapter.objectives.length) {
            this.completeChapter();
        }
    }

    canPlaceAnyShape() {
        return this.trayShapes.some(trayShape =>
            trayShape && this.gameGrid.canPlaceShape(trayShape.shape)
        );
    }

    completeChapter() {
        const chapter = ADVENTURE_CHAPTERS[this.currentChapter];

        // Calculate stars based on performance
        const stars = this.calculateStars(chapter);

        // Update progress
        this.adventureProgress[chapter.id] = {
            completed: true,
            unlocked: true,
            stars: Math.max(stars, this.adventureProgress[chapter.id]?.stars || 0),
            bestScore: Math.max(this.gameStats.score, this.adventureProgress[chapter.id]?.bestScore || 0)
        };

        // Unlock next chapter
        this.unlockNextChapter(chapter.id);

        // Save progress
        storage.set('adventure_progress', this.adventureProgress);

        // Show completion screen
        this.showChapterComplete(chapter, stars);
    }

    calculateStars(chapter) {
        let stars = 1; // Base completion star

        // Bonus stars based on objectives and performance
        const objectivesCompleted = chapter.objectives.filter(obj => {
            switch (obj.type) {
                case 'score': return this.gameStats.score >= obj.target;
                case 'lines': return this.gameStats.lines >= obj.target;
                case 'moves': return this.gameStats.moves <= obj.target;
                default: return false;
            }
        }).length;

        if (objectivesCompleted >= 2) stars = 2;
        if (objectivesCompleted === chapter.objectives.length) stars = 3;

        return stars;
    }

    unlockNextChapter(currentChapterId) {
        const chapterIds = Object.keys(ADVENTURE_CHAPTERS);
        const currentIndex = chapterIds.indexOf(currentChapterId);

        if (currentIndex >= 0 && currentIndex < chapterIds.length - 1) {
            const nextChapterId = chapterIds[currentIndex + 1];
            if (!this.adventureProgress[nextChapterId]) {
                this.adventureProgress[nextChapterId] = { completed: false, unlocked: false, stars: 0 };
            }
            this.adventureProgress[nextChapterId].unlocked = true;
        }
    }

    showChapterComplete(chapter, stars) {
        // Create completion overlay
        const overlay = this.add.rectangle(this.scale.width / 2, this.scale.height / 2,
            this.scale.width, this.scale.height, 0x000000, 0.8);

        const panel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2,
            320, 300, 0x1a1a1a)
            .setStrokeStyle(2, this.colors.primary);

        // Success text
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'Chapter Complete!', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#4a7a5a',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 70, chapter.name, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Stars earned
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 30, 'Stars Earned:', {
            fontSize: '16px',
            color: '#cccccc'
        }).setOrigin(0.5);

        for (let i = 0; i < 3; i++) {
            const starColor = i < stars ? '#FFD700' : '#444444';
            this.add.text(this.scale.width / 2 - 30 + (i * 30), this.scale.height / 2, '★', {
                fontSize: '24px',
                color: starColor
            }).setOrigin(0.5);
        }

        // Score
        this.add.text(this.scale.width / 2, this.scale.height / 2 + 40, `Final Score: ${this.gameStats.score}`, {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Buttons
        const continueButton = this.add.rectangle(this.scale.width / 2 - 70, this.scale.height / 2 + 100,
            100, 35, this.colors.primary)
            .setInteractive()
            .on('pointerdown', () => {
                audioManager.playPlace();
                this.scene.start('AdventureScene');
            });

        this.add.text(this.scale.width / 2 - 70, this.scale.height / 2 + 100, 'Continue', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const menuButton = this.add.rectangle(this.scale.width / 2 + 70, this.scale.height / 2 + 100,
            100, 35, 0x666666)
            .setInteractive()
            .on('pointerdown', () => {
                audioManager.playPlace();
                this.scene.start('MenuScene');
            });

        this.add.text(this.scale.width / 2 + 70, this.scale.height / 2 + 100, 'Main Menu', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    checkGameEnd() {
        if (!this.gameActive) return;

        this.gameActive = false;
        
        // Show failure screen
        this.showGameOver();
    }

    showGameOver() {
        const overlay = this.add.rectangle(this.scale.width / 2, this.scale.height / 2,
            this.scale.width, this.scale.height, 0x000000, 0.8);

        const panel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2,
            300, 250, 0x1a1a1a)
            .setStrokeStyle(2, 0x7a4a4a);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 80, 'Quest Failed', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#7a4a4a',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 40, `Score: ${this.gameStats.score}`, {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Retry button
        const retryButton = this.add.rectangle(this.scale.width / 2 - 60, this.scale.height / 2 + 40,
            100, 35, this.colors.primary)
            .setInteractive()
            .on('pointerdown', () => {
                audioManager.playPlace();
                this.scene.restart({ chapter: this.currentChapter });
            });

        this.add.text(this.scale.width / 2 - 60, this.scale.height / 2 + 40, 'Retry', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const backButton = this.add.rectangle(this.scale.width / 2 + 60, this.scale.height / 2 + 40,
            100, 35, 0x666666)
            .setInteractive()
            .on('pointerdown', () => {
                audioManager.playPlace();
                this.scene.start('AdventureScene');
            });

        this.add.text(this.scale.width / 2 + 60, this.scale.height / 2 + 40, 'Back', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    getDefaultProgress() {
        const progress = {};
        Object.keys(ADVENTURE_CHAPTERS).forEach(chapterId => {
            progress[chapterId] = {
                completed: false,
                unlocked: chapterId === 'FOREST_START',
                stars: 0,
                bestScore: 0
            };
        });
        return progress;
    }

    /**
     * Setup input handlers
     */
    setupInputHandlers() {
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('AdventureScene'); // Return to adventure menu
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            // Pause functionality could be added here in the future
            console.log('Space pressed - pause functionality not yet implemented in Adventure mode');
        });
    }

    testCoordinateSystem() {
        console.log('=== COORDINATE SYSTEM TEST ===');

        // Import grid constants
        import('../core/constants.js').then(({ GRID }) => {
            import('../core/utils.js').then(({ pixelToGrid, gridToPixel }) => {

                // Test center grid position (5,5)
                const centerPixel = gridToPixel(5, 5);
                console.log(`Grid (5,5) -> Pixels (${centerPixel.x}, ${centerPixel.y})`);

                const backToGrid = pixelToGrid(centerPixel.x, centerPixel.y);
                console.log(`Pixels (${centerPixel.x}, ${centerPixel.y}) -> Grid (row=${backToGrid.row}, col=${backToGrid.col})`);

                // Test top-left (0,0)
                const topLeftPixel = gridToPixel(0, 0);
                console.log(`Grid (0,0) -> Pixels (${topLeftPixel.x}, ${topLeftPixel.y})`);

                // Test bottom-right (9,9)
                const bottomRightPixel = gridToPixel(9, 9);
                console.log(`Grid (9,9) -> Pixels (${bottomRightPixel.x}, ${bottomRightPixel.y})`);

                // Place test blocks
                if (this.gameGrid) {
                    console.log('Placing test blocks:');
                    console.log('- Red block at grid (0,0) - top-left');
                    this.gameGrid.grid[0][0] = 2; // Red

                    console.log('- Green block at grid (5,5) - center');
                    this.gameGrid.grid[5][5] = 3; // Green

                    console.log('- Blue block at grid (9,9) - bottom-right');
                    this.gameGrid.grid[9][9] = 4; // Blue

                    this.gameGrid.render();
                }

                console.log('=== TEST COMPLETE ===');
            });
        });
    }
}