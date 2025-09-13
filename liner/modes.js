// modes.js
// Game mode logic module for Blockwood
// Responsibilities: mode switching, daily/puzzle logic, difficulty management


// Usage: import { Modes } from './modes.js';
// Methods:
//   Modes.getNextMode(current: string) -> string
//   Modes.getNextDifficulty(current: string) -> string
//   Modes.getDailySeed() -> string
//   Modes.seededRandom(seed: string) -> () => number
export const Modes = {
  GAME_MODES: ['normal', 'daily', 'puzzle'],
  DIFFICULTIES: ['easy', 'difficult'],
  getNextMode(current) {
    const idx = this.GAME_MODES.indexOf(current);
    return this.GAME_MODES[(idx + 1) % this.GAME_MODES.length];
  },
  getNextDifficulty(current) {
    const idx = this.DIFFICULTIES.indexOf(current);
    return this.DIFFICULTIES[(idx + 1) % this.DIFFICULTIES.length];
  },
  getDailySeed() {
    const today = new Date();
    return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  },
  seededRandom(seed) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return () => {
      h ^= h >>> 13;
      h ^= h << 7;
      h ^= h >>> 17;
      return (h >>> 0) / 4294967295;
    };
  },
  // Add more mode/difficulty helpers as needed
};
