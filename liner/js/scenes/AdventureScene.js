// Adventure mode scene - placeholder implementation
import { GameScene } from './GameScene.js';
import { ADVENTURE_CHAPTERS } from '../core/constants.js';
import { themeManager } from '../core/themes.js';
import { storage } from '../core/storage.js';

export class AdventureScene extends GameScene {
    constructor() {
        super({ key: 'AdventureScene' });
        this.currentChapter = null;
        this.chapterProgress = 0;
    }

    init(data) {
        super.init(data);
        this.currentChapter = data.chapter || 'FOREST_START';
        this.chapterProgress = data.progress || 0;
    }

    create() {
        super.create();
        
        // Apply chapter theme
        this.applyChapterTheme();
        
        // Override UI for adventure-specific elements
        this.createAdventureUI();
    }

    createAdventureUI() {
        const theme = themeManager.getCurrentTheme();
        const chapter = ADVENTURE_CHAPTERS[this.currentChapter];
        
        this.ui.chapterTitle = this.add.text(200, 30, chapter?.name || 'Adventure Mode', {
            fontSize: '16px', fontFamily: 'Arial', color: theme.text, fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.ui.progressText = this.add.text(200, 50, `Progress: ${this.chapterProgress}/${chapter?.puzzles || 5}`, {
            fontSize: '12px', fontFamily: 'Arial', color: theme.textSecondary
        }).setOrigin(0.5);
    }

    applyChapterTheme() {
        const chapter = ADVENTURE_CHAPTERS[this.currentChapter];
        if (chapter && chapter.theme) {
            themeManager.setTheme(chapter.theme);
            this.updateTheme();
        }
    }

    completeChapter() {
        // Mark chapter as completed and unlock next chapter
        storage.completeChapter(this.currentChapter);
        
        // Show chapter completion screen
        this.showChapterComplete();
    }

    showChapterComplete() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        const completionText = this.add.text(centerX, centerY, 'Chapter Complete!', {
            fontSize: '24px', fontFamily: 'Arial', 
            color: themeManager.getCurrentTheme().primary, fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Continue to next chapter or return to menu
        this.time.delayedCall(2000, () => {
            this.returnToMenu();
        });
    }
}