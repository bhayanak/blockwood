/**
 * Enhanced Statistics Scene with Achievements and Comprehensive Records
 */
import { achievementSystem, ACHIEVEMENTS, TIER_COLORS } from '../systems/AchievementSystem.js';
import { themeManager } from '../core/themes.js';

export default class StatsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StatsScene' });
        this.currentTab = 'achievements'; // achievements, records
        this.scrollOffset = 0;
        this.maxScroll = 0;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.centerX = width / 2;
        this.centerY = height / 2;

        // Create background
        this.createBackground();
        
        // Create header
        this.createHeader();
        
        // Create tab system
        this.createTabSystem();
        
        // Create content area
        this.createContentArea();
        
        // Create navigation
        this.createNavigation();
        
        // Show initial content
        this.showAchievements();
        
        // Setup scrolling
        this.setupScrolling();
    }

    createBackground() {
        const theme = themeManager.getCurrentTheme();
        
        // Themed gradient background
        const bg = this.add.rectangle(
            this.centerX, 
            this.centerY, 
            this.cameras.main.width, 
            this.cameras.main.height, 
            parseInt(theme.ui.inputBackground.replace('#', ''), 16)
        );
        bg.setAlpha(0.95);
        
        // Background pattern with theme colors
        for (let i = 0; i < 20; i++) {
            const star = this.add.text(
                Math.random() * this.cameras.main.width,
                Math.random() * this.cameras.main.height,
                '✨',
                { 
                    fontSize: '12px',
                    color: theme.accent
                }
            );
            star.setAlpha(0.3);
        }
    }

    createHeader() {
        const theme = themeManager.getCurrentTheme();
        
        // Main title with theme colors
        this.headerTitle = this.add.text(this.centerX, 60, '📊 STATISTICS & ACHIEVEMENTS', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: theme.accent,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtitle
        this.headerSubtitle = this.add.text(this.centerX, 90, 'Track your progress and unlock rewards', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: theme.textSecondary
        }).setOrigin(0.5);
    }

    createTabSystem() {
        const tabY = 130;
        const tabWidth = 160; // Reduced from 200 to prevent clipping
        
        // Achievements tab
        this.achievementsTab = this.createTab('🏆 Achievements', this.centerX - 90, tabY, tabWidth, 'achievements');
        
        // Records tab
        this.recordsTab = this.createTab('📈 Records', this.centerX + 90, tabY, tabWidth, 'records');
        
        // Update tab appearance
        this.updateTabAppearance();
    }

    createTab(text, x, y, width, tabId) {
        const theme = themeManager.getCurrentTheme();
        const tab = this.add.container(x, y);
        
        // Tab background with theme
        const bg = this.add.rectangle(0, 0, width, 40, parseInt(theme.ui.buttonBackground.replace('#', ''), 16), 0.8);
        bg.setStrokeStyle(2, parseInt(theme.ui.borderColor.replace('#', ''), 16));
        
        // Tab text with theme
        const label = this.add.text(0, 0, text, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: theme.text
        }).setOrigin(0.5);
        
        tab.add([bg, label]);
        tab.setSize(width, 40);
        tab.setInteractive();
        
        tab.on('pointerdown', () => {
            this.currentTab = tabId;
            this.updateTabAppearance();
            this.showContent();
        });
        
        tab.on('pointerover', () => {
            if (this.currentTab !== tabId) {
                bg.setFillStyle(parseInt(theme.ui.buttonHover.replace('#', ''), 16));
            }
        });
        
        tab.on('pointerout', () => {
            if (this.currentTab !== tabId) {
                bg.setFillStyle(parseInt(theme.ui.buttonBackground.replace('#', ''), 16));
            }
        });
        
        // Store references
        tab.bg = bg;
        tab.label = label;
        tab.tabId = tabId;
        
        return tab;
    }

    updateTabAppearance() {
        const theme = themeManager.getCurrentTheme();
        
        // Update achievements tab
        if (this.currentTab === 'achievements') {
            this.achievementsTab.bg.setFillStyle(parseInt(theme.primary.replace('#', ''), 16));
            this.achievementsTab.bg.setStrokeStyle(2, parseInt(theme.accent.replace('#', ''), 16));
            this.achievementsTab.label.setColor(theme.text);
        } else {
            this.achievementsTab.bg.setFillStyle(parseInt(theme.ui.buttonBackground.replace('#', ''), 16));
            this.achievementsTab.bg.setStrokeStyle(2, parseInt(theme.ui.borderColor.replace('#', ''), 16));
            this.achievementsTab.label.setColor(theme.textSecondary);
        }
        
        // Update records tab
        if (this.currentTab === 'records') {
            this.recordsTab.bg.setFillStyle(parseInt(theme.secondary.replace('#', ''), 16));
            this.recordsTab.bg.setStrokeStyle(2, parseInt(theme.accent.replace('#', ''), 16));
            this.recordsTab.label.setColor(theme.text);
        } else {
            this.recordsTab.bg.setFillStyle(parseInt(theme.ui.buttonBackground.replace('#', ''), 16));
            this.recordsTab.bg.setStrokeStyle(2, parseInt(theme.ui.borderColor.replace('#', ''), 16));
            this.recordsTab.label.setColor(theme.textSecondary);
        }
    }

    createContentArea() {
        // Content container for scrolling
        this.contentContainer = this.add.container(0, 0);
        
        // Create mask for scrolling area - wider margins to prevent clipping
        const maskRect = this.add.rectangle(this.centerX, this.centerY + 50, this.cameras.main.width - 80, this.cameras.main.height - 300, 0x000000);
        maskRect.setVisible(false);
        this.contentMask = maskRect.createGeometryMask();
        this.contentContainer.setMask(this.contentMask);
    }

    createNavigation() {
        const theme = themeManager.getCurrentTheme();
        
        // Back button with theme - positioned to avoid title overlap
        const backButton = this.add.text(50, 30, '← Back', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: theme.accent,
            backgroundColor: theme.ui.buttonBackground,
            padding: { x: 15, y: 8 }
        }).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        backButton.on('pointerover', () => {
            backButton.setScale(1.1);
        });

        backButton.on('pointerout', () => {
            backButton.setScale(1.0);
        });

        // Scroll indicators with theme
        this.scrollUpIndicator = this.add.text(this.cameras.main.width - 30, 200, '▲', {
            fontSize: '20px',
            color: theme.textSecondary
        }).setOrigin(0.5).setAlpha(0);

        this.scrollDownIndicator = this.add.text(this.cameras.main.width - 30, this.cameras.main.height - 120, '▼', {
            fontSize: '20px',
            color: theme.textSecondary
        }).setOrigin(0.5).setAlpha(0);
    }

    showContent() {
        // Clear existing content
        this.clearContent();
        
        if (this.currentTab === 'achievements') {
            this.showAchievements();
        } else {
            this.showRecords();
        }
        
        this.scrollOffset = 0;
        this.updateScrollIndicators();
    }

    clearContent() {
        this.contentContainer.removeAll(true);
    }

    showAchievements() {
        const achievements = achievementSystem.getAchievementDisplayData();
        const startY = 200;
        const achievementHeight = 120;
        
        achievements.forEach((achievement, index) => {
            const y = startY + (index * achievementHeight);
            this.createAchievementCard(achievement, y);
        });
        
        this.maxScroll = Math.max(0, (achievements.length * achievementHeight) - (this.cameras.main.height - 350));
    }

    createAchievementCard(achievement, y) {
        const cardContainer = this.add.container(this.centerX, y);
        
        // Card background - wider margins to prevent clipping
        const cardBg = this.add.rectangle(0, 0, this.cameras.main.width - 100, 100, 0x1a1a2e, 0.9);
        cardBg.setStrokeStyle(2, achievement.currentTier ? TIER_COLORS[achievement.currentTier.level] : TIER_COLORS.locked);
        
        // Achievement icon
        const iconSize = achievement.currentTier ? 40 : 30;
        const iconColor = achievement.currentTier ? '#FFFFFF' : '#666666';
        const icon = this.add.text(-200, -20, achievement.currentTier ? achievement.currentTier.icon : '🔒', {
            fontSize: `${iconSize}px`,
            color: iconColor
        }).setOrigin(0.5);
        
        // Achievement name and tier
        const tierName = achievement.currentTier ? achievement.currentTier.name : 'Locked';
        const name = this.add.text(-150, -25, `${achievement.name}`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: achievement.currentTier ? TIER_COLORS[achievement.currentTier.level] : TIER_COLORS.locked,
            fontStyle: 'bold'
        });
        
        const tier = this.add.text(-150, -5, tierName, {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#CCCCCC'
        });
        
        // Description
        const description = this.add.text(-150, 15, achievement.description, {
            fontSize: '10px',
            fontFamily: 'Arial',
            color: '#AAAAAA',
            wordWrap: { width: 250 }
        });
        
        // Progress bar
        let progressPercent = 0;
        let progressText = '';
        
        if (achievement.nextTier) {
            progressPercent = Math.min(1, achievement.progress / achievement.nextTier.requirement);
            progressText = `${achievement.progress.toLocaleString()} / ${achievement.nextTier.requirement.toLocaleString()}`;
        } else if (achievement.isCompleted) {
            progressPercent = 1;
            progressText = 'COMPLETED';
        }
        
        // Progress bar background
        const progressBg = this.add.rectangle(80, 10, 150, 8, 0x333333);
        
        // Progress bar fill
        const progressFill = this.add.rectangle(80 - 75 + (75 * progressPercent), 10, 150 * progressPercent, 8, 
            achievement.currentTier ? TIER_COLORS[achievement.currentTier.level] : TIER_COLORS.bronze);
        
        // Progress text
        const progressTextObj = this.add.text(80, 25, progressText, {
            fontSize: '10px',
            fontFamily: 'Arial',
            color: '#CCCCCC'
        }).setOrigin(0.5);
        
        // Next tier info
        if (achievement.nextTier && !achievement.isCompleted) {
            const nextTierText = this.add.text(80, -15, `Next: ${achievement.nextTier.name}`, {
                fontSize: '10px',
                fontFamily: 'Arial',
                color: TIER_COLORS[achievement.nextTier.level]
            }).setOrigin(0.5);
            
            const rewardText = this.add.text(80, -5, `Reward: ${achievement.nextTier.reward} coins`, {
                fontSize: '9px',
                fontFamily: 'Arial',
                color: '#FFD700'
            }).setOrigin(0.5);
            
            cardContainer.add([nextTierText, rewardText]);
        }
        
        // Total rewards earned
        if (achievement.totalRewards > 0) {
            const totalRewards = this.add.text(200, -20, `💰 ${achievement.totalRewards}`, {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#FFD700'
            }).setOrigin(0.5);
            cardContainer.add(totalRewards);
        }
        
        cardContainer.add([cardBg, icon, name, tier, description, progressBg, progressFill, progressTextObj]);
        this.contentContainer.add(cardContainer);
        
        // Hover effect
        cardContainer.setInteractive(new Phaser.Geom.Rectangle(-cardBg.width/2, -cardBg.height/2, cardBg.width, cardBg.height), Phaser.Geom.Rectangle.Contains);
        
        cardContainer.on('pointerover', () => {
            cardBg.setStrokeStyle(3, achievement.currentTier ? TIER_COLORS[achievement.currentTier.level] : TIER_COLORS.locked);
            cardContainer.setScale(1.02);
        });
        
        cardContainer.on('pointerout', () => {
            cardBg.setStrokeStyle(2, achievement.currentTier ? TIER_COLORS[achievement.currentTier.level] : TIER_COLORS.locked);
            cardContainer.setScale(1.0);
        });
    }

    showRecords() {
        const records = achievementSystem.getRecordsDisplayData();
        const startY = 200;
        let currentY = startY;
        
        // Show each category
        Object.keys(records).forEach((category, categoryIndex) => {
            currentY = this.createRecordsCategory(category, records[category], currentY);
            currentY += 30; // Space between categories
        });
        
        this.maxScroll = Math.max(0, currentY - startY - (this.cameras.main.height - 350));
    }

    createRecordsCategory(categoryName, categoryData, startY) {
        const categoryContainer = this.add.container(this.centerX, startY);
        
        // Category header - wider margins to prevent clipping
        const headerBg = this.add.rectangle(0, 0, this.cameras.main.width - 100, 40, 0x2a2a4a, 0.9);
        headerBg.setStrokeStyle(2, 0x4CAF50);
        
        const categoryIcons = {
            overall: '🌟',
            normal: '🎯',
            endless: '♾️',
            daily: '📅'
        };
        
        const headerText = this.add.text(0, 0, `${categoryIcons[categoryName] || '📊'} ${categoryName.toUpperCase()} RECORDS`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        categoryContainer.add([headerBg, headerText]);
        this.contentContainer.add(categoryContainer);
        
        let currentY = startY + 50;
        
        // Create records in two columns - responsive layout
        const records = Object.entries(categoryData);
        const recordsPerColumn = Math.ceil(records.length / 2);
        const maxColumnWidth = Math.min(280, (this.cameras.main.width - 120) / 2); // Responsive column width
        const columnSpacing = Math.min(150, (this.cameras.main.width - 200) / 4); // Responsive spacing
        
        records.forEach(([key, value], index) => {
            const isLeftColumn = index < recordsPerColumn;
            const columnX = isLeftColumn ? this.centerX - columnSpacing : this.centerX + columnSpacing;
            const rowY = currentY + ((index % recordsPerColumn) * 25);
            
            const recordContainer = this.add.container(columnX, rowY);
            
            // Record background - responsive width
            const recordBg = this.add.rectangle(0, 0, maxColumnWidth, 20, 0x1a1a2e, 0.7);
            
            // Record label - responsive positioning
            const label = this.add.text(-maxColumnWidth/2 + 10, 0, key, {
                fontSize: '11px',
                fontFamily: 'Arial',
                color: '#CCCCCC'
            }).setOrigin(0, 0.5);
            
            // Record value - responsive positioning
            const valueText = this.add.text(maxColumnWidth/2 - 10, 0, value, {
                fontSize: '11px',
                fontFamily: 'Arial',
                color: '#FFFFFF',
                fontStyle: 'bold'
            }).setOrigin(1, 0.5);
            
            recordContainer.add([recordBg, label, valueText]);
            this.contentContainer.add(recordContainer);
        });
        
        return currentY + (recordsPerColumn * 25) + 20;
    }

    setupScrolling() {
        // Mouse wheel scrolling
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            this.scroll(deltaY > 0 ? 50 : -50);
        });
        
        // Touch scrolling (basic implementation)
        let startY = 0;
        let isDragging = false;
        
        this.input.on('pointerdown', (pointer) => {
            if (pointer.y > 180 && pointer.y < this.cameras.main.height - 100) {
                startY = pointer.y;
                isDragging = true;
            }
        });
        
        this.input.on('pointermove', (pointer) => {
            if (isDragging) {
                const deltaY = startY - pointer.y;
                this.scroll(deltaY * 2);
                startY = pointer.y;
            }
        });
        
        this.input.on('pointerup', () => {
            isDragging = false;
        });
    }

    scroll(amount) {
        this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset + amount, 0, this.maxScroll);
        this.contentContainer.y = -this.scrollOffset;
        this.updateScrollIndicators();
    }

    updateScrollIndicators() {
        // Show/hide scroll indicators
        this.scrollUpIndicator.setAlpha(this.scrollOffset > 0 ? 1 : 0);
        this.scrollDownIndicator.setAlpha(this.scrollOffset < this.maxScroll ? 1 : 0);
    }
}