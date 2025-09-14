// Track completed puzzles in localStorage
export function loadCompletedPuzzles() {
  try {
    const completed = JSON.parse(localStorage.getItem('blockwood_puzzles_completed'));
    return Array.isArray(completed) ? completed : [];
  } catch (e) { return []; }
}

export function saveCompletedPuzzles(completedArr) {
  localStorage.setItem('blockwood_puzzles_completed', JSON.stringify(completedArr));
}

export function markPuzzleCompleted(puzzleId) {
  const completed = loadCompletedPuzzles();
  if (!completed.includes(puzzleId)) {
    completed.push(puzzleId);
    saveCompletedPuzzles(completed);
  }
}
// --- Puzzle Packs & Progression Module ---

// Example puzzle packs structure
export const PUZZLE_PACKS = [
  {
    id: 1,
    name: 'Starter Pack',
    puzzles: [0, 1, 2], // puzzle indices
    unlocked: true
  },
  {
    id: 2,
    name: 'Challenge Pack',
    puzzles: [3, 4, 5],
    unlocked: false
  },
  {
    id: 3,
    name: 'Expert Pack',
    puzzles: [6, 7, 8],
    unlocked: false
  }
];

// Load unlocked packs from localStorage
export function loadUnlockedPacks() {
  try {
    const unlocked = JSON.parse(localStorage.getItem('blockwood_puzzle_unlocks'));
    if (!unlocked) return PUZZLE_PACKS.map(pack => pack.unlocked);
    return unlocked;
  } catch (e) { return PUZZLE_PACKS.map(pack => pack.unlocked); }
}

// Save unlocked packs to localStorage
export function saveUnlockedPacks(unlockedArr) {
  localStorage.setItem('blockwood_puzzle_unlocks', JSON.stringify(unlockedArr));
}

// Unlock next pack after completing all puzzles in current pack
export function unlockNextPack(currentPackIdx) {
  const unlocked = loadUnlockedPacks();
  if (currentPackIdx + 1 < PUZZLE_PACKS.length) {
    unlocked[currentPackIdx + 1] = true;
    saveUnlockedPacks(unlocked);
  }
}

// Get list of unlocked packs
export function getUnlockedPacks() {
  const unlocked = loadUnlockedPacks();
  return PUZZLE_PACKS.map((pack, idx) => ({ ...pack, unlocked: unlocked[idx] }));
}

// Check if all puzzles in a pack are completed
export function isPackCompleted(packIdx, completedPuzzles) {
  const pack = PUZZLE_PACKS[packIdx];
  return pack.puzzles.every(pid => completedPuzzles.includes(pid));
}

// Reset all puzzle progress (completed and unlocked)
export function resetPuzzleProgress() {
  // Reset completed puzzles
  saveCompletedPuzzles([]);
  // Reset unlocked packs (only first pack unlocked)
  const unlockedArr = PUZZLE_PACKS.map((pack, idx) => idx === 0);
  saveUnlockedPacks(unlockedArr);
}
