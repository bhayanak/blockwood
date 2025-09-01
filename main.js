// import { canPlaceShape } from './validate.js'; (removed duplicate)

import { canPlaceShape } from './validate.js';
import { generateShape } from './shapes.js';

const gridContainer = document.getElementById('grid');
const trayContainer = document.getElementById('block-tray');
const gridSize = 9;
let gridManager = { grid: Array.from({ length: gridSize }, () => Array(gridSize).fill(0)) };
let trayShapes = [];

// Modal for game over (will be set on DOMContentLoaded)
let modal, finalScore, restartBtn;

let score = 0;
let highScore = 0;

function updateScorePanel() {
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');

    scoreElement.textContent = 'Score: ' + score;
    highScoreElement.textContent = 'High Score: ' + highScore;

    // Add animation to score when it changes
    scoreElement.classList.add('score-animate');
    setTimeout(() => {
        scoreElement.classList.remove('score-animate');
    }, 600);

    if (score === highScore && score > 0) {
        highScoreElement.classList.add('score-animate');
        setTimeout(() => {
            highScoreElement.classList.remove('score-animate');
        }, 600);
    }
}

function loadHighScore() {
    const stored = localStorage.getItem('blockwood-highscore');
    highScore = stored ? parseInt(stored, 10) : 0;
}

function saveHighScore() {
    localStorage.setItem('blockwood-highscore', highScore);
}

function renderGrid() {
    gridContainer.innerHTML = '';
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            // Show placed blocks with their original colors
            const cellData = gridManager.grid[row][col];
            if (cellData && cellData.filled) {
                cell.style.background = `linear-gradient(135deg, ${cellData.color} 0%, ${cellData.color}dd 100%)`;
                cell.style.borderColor = cellData.color;
                cell.classList.add('filled-cell');
            }
            // Drag-over and drop events
            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                cell.classList.add('grid-cell-hover');
            });
            cell.addEventListener('dragleave', () => {
                cell.classList.remove('grid-cell-hover');
            });
            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                cell.classList.remove('grid-cell-hover');
                const shapeIdx = e.dataTransfer.getData('shapeIdx');
                if (shapeIdx === undefined) return;
                const shapeConfig = trayShapes[shapeIdx];
                if (!shapeConfig) return;
                const shape = shapeConfig.pattern;
                const shapeColor = shapeConfig.color;
                // Validate placement
                if (canPlaceShape(gridManager.grid, shape, { row, col })) {
                    playSound('place');
                    // Score: +1 for each block placed
                    let placedCount = 0;
                    for (let r = 0; r < shape.length; r++) {
                        for (let c = 0; c < shape[r].length; c++) {
                            if (shape[r][c]) {
                                const gr = row + r;
                                const gc = col + c;
                                if (gr < gridSize && gc < gridSize) {
                                    gridManager.grid[gr][gc] = {
                                        filled: true,
                                        color: shapeColor
                                    };
                                    placedCount++;
                                }
                            }
                        }
                    }
                    score += placedCount;
                    if (score > highScore) {
                        highScore = score;
                        saveHighScore();
                    }
                    updateScorePanel();
                    // --- Clear full rows and columns ---
                    let clearedRows = [];
                    let clearedCols = [];
                    // Check rows
                    for (let r = 0; r < gridSize; r++) {
                        if (gridManager.grid[r].every(cell => cell && cell.filled)) {
                            clearedRows.push(r);
                        }
                    }
                    // Check columns
                    for (let c = 0; c < gridSize; c++) {
                        let full = true;
                        for (let r = 0; r < gridSize; r++) {
                            if (!gridManager.grid[r][c] || !gridManager.grid[r][c].filled) {
                                full = false;
                                break;
                            }
                        }
                        if (full) clearedCols.push(c);
                    }
                    let clearedCount = clearedRows.length + clearedCols.length;
                    if (clearedCount > 0) {
                        playSound('clear');
                        // Score: +10 per row/col cleared
                        score += clearedCount * 10;
                        if (score > highScore) {
                            highScore = score;
                            saveHighScore();
                        }
                        updateScorePanel();
                        // Animate, then clear after a delay
                        clearedRows.forEach(r => {
                            for (let c = 0; c < gridSize; c++) {
                                animateCell(r, c, 'cleared');
                            }
                        });
                        clearedCols.forEach(c => {
                            for (let r = 0; r < gridSize; r++) {
                                animateCell(r, c, 'cleared');
                            }
                        });
                        setTimeout(() => {
                            clearedRows.forEach(r => {
                                for (let c = 0; c < gridSize; c++) {
                                    gridManager.grid[r][c] = 0;
                                }
                            });
                            clearedCols.forEach(c => {
                                for (let r = 0; r < gridSize; r++) {
                                    gridManager.grid[r][c] = 0;
                                }
                            });
                            trayShapes[shapeIdx] = null;
                            if (trayShapes.every(s => !s)) {
                                generateTrayShapes();
                            }
                            renderGrid();
                            renderTray();
                            setTimeout(() => {
                                if (trayShapes.some(s => s)) checkGameOver();
                            }, 0);
                        }, 600); // 600ms for animation
                    } else {
                        trayShapes[shapeIdx] = null;
                        if (trayShapes.every(s => !s)) {
                            generateTrayShapes();
                        }
                        renderGrid();
                        renderTray();
                        setTimeout(() => {
                            if (trayShapes.some(s => s)) checkGameOver();
                        }, 0);
                    }
                } else {
                    cell.classList.add('grid-cell-error');
                    setTimeout(() => { cell.classList.remove('grid-cell-error'); }, 300);
                }
            });
            gridContainer.appendChild(cell);
        }
    }
    // Do not check game over after every render; only after move or new shapes
}

// Check if any tray shape can be placed on the grid
function checkGameOver() {
    if (!trayShapes.some(shapeConfig => shapeConfig)) return; // No shapes left, not game over
    for (let idx = 0; idx < trayShapes.length; idx++) {
        const shapeConfig = trayShapes[idx];
        if (!shapeConfig) continue;
        const shape = shapeConfig.pattern;
        const shapeRows = shape.length;
        const shapeCols = shape[0].length;
        for (let row = 0; row <= gridSize - shapeRows; row++) {
            for (let col = 0; col <= gridSize - shapeCols; col++) {
                if (canPlaceShape(gridManager.grid, shape, { row, col })) {
                    return; // At least one move is possible
                }
            }
        }
    }
    // If we get here, no moves are possible
    showGameOver();
}

function showGameOver() {
    if (modal && finalScore) {
        finalScore.textContent = 'Game Over! No more moves. Final Score: ' + score;
        modal.style.display = 'block';
        playSound('gameover');
    }
}

function hideGameOver() {
    if (modal) modal.style.display = 'none';
}
// --- Sound Effects (Stubs) ---
const sounds = {
    place: new Audio('place.wav'), // Placeholder path
    clear: new Audio('clear.wav'),
    gameover: new Audio('gameover.wav'),
};
let soundEnabled = true;

function updateSoundButton() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;
    btn.textContent = soundEnabled ? '🔊' : '🔇';
}

function loadSoundSetting() {
    const stored = localStorage.getItem('blockwood-sound');
    soundEnabled = stored === null ? true : stored === 'true';
    updateSoundButton();
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('blockwood-sound', soundEnabled);
    updateSoundButton();
}

function playSound(name) {
    if (!soundEnabled) return;
    if (sounds[name]) {
        sounds[name].currentTime = 0;
        sounds[name].play();
    }
}

// Unlock all sounds on first user gesture (mobile fix)
let soundsUnlocked = false;
function unlockSounds() {
    if (soundsUnlocked) return;
    Object.values(sounds).forEach(audio => {
        try {
            const prevVolume = audio.volume;
            audio.muted = true;
            audio.volume = 0;
            audio.play().catch(() => { });
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false;
            audio.volume = prevVolume;
        } catch (e) { }
    });
    soundsUnlocked = true;
}
window.addEventListener('touchstart', unlockSounds, { once: true });
window.addEventListener('mousedown', unlockSounds, { once: true });


// --- Animation Helpers ---
function animateCell(row, col, type) {
	// Add a CSS class for animation, then remove it after animation ends
	const selector = `.grid-cell[data-row="${row}"][data-col="${col}"]`;
	const cell = document.querySelector(selector);
	if (cell) {
		cell.classList.add(type === 'placed' ? 'cell-placed' : 'cell-cleared');

        // Add particle effect for cleared cells
        if (type === 'cleared') {
            createParticleExplosion(cell);
        }

		setTimeout(() => {
			cell.classList.remove(type === 'placed' ? 'cell-placed' : 'cell-cleared');
        }, 800);
    }
}

function createParticleExplosion(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create multiple particles
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.position = 'fixed';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';

        // Random colors
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        // Random direction
        const angle = (i / 8) * Math.PI * 2;
        const velocity = 50 + Math.random() * 30;
        const deltaX = Math.cos(angle) * velocity;
        const deltaY = Math.sin(angle) * velocity;

        particle.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0)`;
        particle.style.opacity = '0';
        particle.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        document.body.appendChild(particle);

        // Trigger animation
        requestAnimationFrame(() => {
            particle.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1)`;
            particle.style.opacity = '1';

            setTimeout(() => {
                particle.style.opacity = '0';
                particle.style.transform = `translate(${deltaX * 1.5}px, ${deltaY * 1.5}px) scale(0)`;

                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 800);
            }, 200);
        });
	}
}

function animateMatches(matches) {
	matches.forEach(match => {
		if (match.type === 'row') {
			for (let c = 0; c < gridSize; c++) {
				animateCell(match.index, c, 'cleared');
			}
		} else if (match.type === 'col') {
			for (let r = 0; r < gridSize; r++) {
				animateCell(r, match.index, 'cleared');
			}
		} else if (match.type === 'block') {
			const br = Math.floor(match.index / 3) * 3;
			const bc = (match.index % 3) * 3;
			for (let r = br; r < br + 3; r++) {
				for (let c = bc; c < bc + 3; c++) {
					animateCell(r, c, 'cleared');
				}
			}
		}
	});
}


function renderTray() {
    trayContainer.innerHTML = '';
    let anyShape = false;
    trayShapes.forEach((shapeConfig, idx) => {
        if (!shapeConfig) return; // Skip used shapes
        anyShape = true;
        const shape = shapeConfig.pattern;
        const shapeColor = shapeConfig.color;
        const shapeDiv = document.createElement('div');
        shapeDiv.className = 'block-shape';
        shapeDiv.draggable = true;
        shapeDiv.dataset.shapeIdx = idx;
        shapeDiv.style.setProperty('--shape-index', idx);
        shapeDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('shapeIdx', idx);
            e.dataTransfer.effectAllowed = 'move';
        });
        // Touch support for mobile
        let touchMoveHandler, touchEndHandler;
        shapeDiv.addEventListener('touchstart', function(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const ghost = shapeDiv.cloneNode(true);
            ghost.style.position = 'fixed';
            ghost.style.left = (touch.clientX - 20) + 'px';
            ghost.style.top = (touch.clientY - 20) + 'px';
            ghost.style.opacity = '0.7';
            ghost.style.pointerEvents = 'none';
            ghost.style.zIndex = '9999';
            ghost.id = 'drag-ghost';
            document.body.appendChild(ghost);
            let lastTarget = null;
            touchMoveHandler = function(ev) {
                const t = ev.touches[0];
                ghost.style.left = (t.clientX - 20) + 'px';
                ghost.style.top = (t.clientY - 20) + 'px';
                // Highlight grid cell under finger
                const el = document.elementFromPoint(t.clientX, t.clientY);
                if (el && el.classList.contains('grid-cell')) {
                    if (lastTarget && lastTarget !== el) lastTarget.classList.remove('grid-cell-hover');
                    el.classList.add('grid-cell-hover');
                    lastTarget = el;
                } else if (lastTarget) {
                    lastTarget.classList.remove('grid-cell-hover');
                    lastTarget = null;
                }
            };
            touchEndHandler = function(ev) {
                if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
                if (lastTarget) {
                    lastTarget.classList.remove('grid-cell-hover');
                    // Simulate drop
                    const row = parseInt(lastTarget.dataset.row);
                    const col = parseInt(lastTarget.dataset.col);
                    // Simulate drop event
                    const dropEvent = new Event('drop', { bubbles: true });
                    dropEvent.dataTransfer = {
                        getData: () => idx
                    };
                    lastTarget.dispatchEvent(dropEvent);
                }
                document.removeEventListener('touchmove', touchMoveHandler);
                document.removeEventListener('touchend', touchEndHandler);
            };
            document.addEventListener('touchmove', touchMoveHandler, { passive: false });
            document.addEventListener('touchend', touchEndHandler, { passive: false });
        }, { passive: false });
        // Find tightest bounding box for shape
        let minR = shape.length, maxR = -1, minC = shape[0].length, maxC = -1;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    if (r < minR) minR = r;
                    if (r > maxR) maxR = r;
                    if (c < minC) minC = c;
                    if (c > maxC) maxC = c;
                }
            }
        }
        // If no filled cells, fallback to 0,0
        if (minR > maxR || minC > maxC) {
            minR = 0; maxR = shape.length - 1;
            minC = 0; maxC = shape[0].length - 1;
        }
        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                const cellVal = shape[r][c] || 0;
                const block = document.createElement('div');
                block.style.width = '20px';
                block.style.height = '20px';
                block.style.display = 'inline-block';
                block.style.margin = '1px';
                if (cellVal) {
                    block.style.background = `linear-gradient(135deg, ${shapeColor} 0%, ${shapeColor}dd 100%)`;
                    block.style.borderColor = shapeColor;
                    block.classList.add('tray-block-filled');
                    block.style.setProperty('--block-index', (r - minR) * (maxC - minC + 1) + (c - minC));
                } else {
                    block.style.background = 'transparent';
                }
                block.className = 'grid-cell tray-block';
                shapeDiv.appendChild(block);
            }
            if (r < maxR) {
                shapeDiv.appendChild(document.createElement('br'));
            }
        }
        trayContainer.appendChild(shapeDiv);
    });
    if (!anyShape) {
        trayContainer.innerHTML = '<div style="color:#888; font-size:1.1em;">No shapes available</div>';
    }
}

function generateTrayShapes() {
	trayShapes = [generateShape(), generateShape(), generateShape()];
	setTimeout(() => {
		if (trayShapes.some(s => s)) checkGameOver();
	}, 0);
}

function initGame() {
    hideGameOver();
    gridManager.grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    trayShapes = [];
    score = 0;
    loadHighScore();
    updateScorePanel();
    renderGrid();
    generateTrayShapes();
    renderTray();
}

// Theme support
const THEMES = ['wood', 'neon', 'pastel'];
let currentTheme = 'wood';

function applyTheme(theme) {
    document.body.classList.remove(...THEMES);
    document.body.classList.add(theme);
    currentTheme = theme;
    localStorage.setItem('blockwood-theme', theme);
}

function loadTheme() {
    const stored = localStorage.getItem('blockwood-theme');
    if (stored && THEMES.includes(stored)) {
        applyTheme(stored);
    } else {
        applyTheme('wood');
    }
}

function createThemeSwitcher() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    function updateBtn() {
        btn.textContent = 'Theme: ' + currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
    }
    btn.onclick = () => {
        let idx = THEMES.indexOf(currentTheme);
        idx = (idx + 1) % THEMES.length;
        applyTheme(THEMES[idx]);
        updateBtn();
    };
    updateBtn();
}

window.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('game-over-modal');
    finalScore = document.getElementById('final-score');
    restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.onclick = () => {
            hideGameOver();
            trayShapes = [];
            gridManager.grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
            score = 0;
            loadHighScore();
            updateScorePanel();
            renderGrid();
            generateTrayShapes();
            renderTray();
        };
    }
    // Sound toggle button
    const soundBtn = document.getElementById('sound-toggle');
    if (soundBtn) {
        soundBtn.onclick = toggleSound;
    }
    loadSoundSetting();
    initGame();
    loadTheme();
    createThemeSwitcher();
});
