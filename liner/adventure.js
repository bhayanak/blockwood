// adventure.js - Modular story/adventure mode for Blockwood
// Chapters, map, unlocks, progress tracking

export const ADVENTURE_CHAPTERS = [
  { id: 0, name: 'Forest Start', unlocked: true, completed: false, unlocks: ['theme_forest'] },
  { id: 1, name: 'Crystal Lake', unlocked: false, completed: false, unlocks: ['theme_crystal'] },
  { id: 2, name: 'Mountain Pass', unlocked: false, completed: false, unlocks: ['theme_mountain'] },
  // Add more chapters as needed
];

// Progress tracking
let adventureProgress = {
  completedChapters: [],
  unlockedChapters: [0],
};

export function getAdventureProgress() {
  return { ...adventureProgress };
}

export function completeChapter(chapterId) {
  if (!adventureProgress.completedChapters.includes(chapterId)) {
    adventureProgress.completedChapters.push(chapterId);
    unlockNextChapter(chapterId);
  }
}

export function unlockNextChapter(currentId) {
  const nextId = currentId + 1;
  if (ADVENTURE_CHAPTERS[nextId]) {
    ADVENTURE_CHAPTERS[nextId].unlocked = true;
    if (!adventureProgress.unlockedChapters.includes(nextId)) {
      adventureProgress.unlockedChapters.push(nextId);
    }
  }
}

export function isChapterUnlocked(chapterId) {
  return adventureProgress.unlockedChapters.includes(chapterId);
}

export function isChapterCompleted(chapterId) {
  return adventureProgress.completedChapters.includes(chapterId);
}

// API for saving/loading progress (stub)
export function saveAdventureProgress() {
  // Integrate with persistent storage
}

export function loadAdventureProgress() {
  // Integrate with persistent storage
}
