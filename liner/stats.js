// --- Statistics & History Module ---
export const DEFAULT_STATS = {
  bestScoreEasy: 0,
  bestScoreDifficult: 0,
  bestScoreEndless: 0,
  totalGames: 0,
  totalEndlessGames: 0,
  totalLines: 0,
  puzzlesSolved: 0,
  longestStreak: 0,
  currentStreak: 0,
  lastPlayed: null
};

export function loadStats() {
  try {
    const stats = JSON.parse(localStorage.getItem('timbertiles_stats'));
    return stats ? { ...DEFAULT_STATS, ...stats } : { ...DEFAULT_STATS };
  } catch (e) { return { ...DEFAULT_STATS }; }
}

export function saveStats(stats) {
  localStorage.setItem('timbertiles_stats', JSON.stringify(stats));
}
