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
    document.getElementById('score').textContent = 'Score: ' + score;
    document.getElementById('high-score').textContent = 'High Score: ' + highScore;
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
            // Show placed blocks in a different color
            if (gridManager.grid[row][col]) {
                cell.style.background = '#bfa06a';
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
                const shape = trayShapes[shapeIdx];
                if (!shape) return;
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
                                    gridManager.grid[gr][gc] = 1;
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
                        if (gridManager.grid[r].every(cell => cell === 1)) {
                            clearedRows.push(r);
                        }
                    }
                    // Check columns
                    for (let c = 0; c < gridSize; c++) {
                        let full = true;
                        for (let r = 0; r < gridSize; r++) {
                            if (gridManager.grid[r][c] !== 1) {
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
    if (!trayShapes.some(shape => shape)) return; // No shapes left, not game over
    for (let idx = 0; idx < trayShapes.length; idx++) {
        const shape = trayShapes[idx];
        if (!shape) continue;
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

document.getElementById('sound-toggle').addEventListener('click', () => {
	soundEnabled = !soundEnabled;
	document.getElementById('sound-toggle').textContent = soundEnabled ? '🔊' : '🔇';
});

function playSound(name) {
	if (soundEnabled && sounds[name]) {
		sounds[name].currentTime = 0;
		sounds[name].play();
	}
}

// --- Animation Helpers ---
function animateCell(row, col, type) {
	// Add a CSS class for animation, then remove it after animation ends
	const selector = `.grid-cell[data-row="${row}"][data-col="${col}"]`;
	const cell = document.querySelector(selector);
	if (cell) {
		cell.classList.add(type === 'placed' ? 'cell-placed' : 'cell-cleared');
		setTimeout(() => {
			cell.classList.remove(type === 'placed' ? 'cell-placed' : 'cell-cleared');
		}, 400);
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
    trayShapes.forEach((shape, idx) => {
        if (!shape) return; // Skip used shapes
        anyShape = true;
        const shapeDiv = document.createElement('div');
        shapeDiv.className = 'block-shape';
        shapeDiv.draggable = true;
        shapeDiv.dataset.shapeIdx = idx;
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
                block.style.background = cellVal ? '#bfa06a' : 'transparent';
                block.className = 'grid-cell';
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
    initGame();
    loadTheme();
    createThemeSwitcher();
});
