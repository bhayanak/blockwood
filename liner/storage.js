// storage.js
// Persistent storage module for Blockwood
// Responsibilities: high score, settings, localStorage management


// Usage: import { Storage } from './storage.js';
// Methods:
//   Storage.getHighScore() -> number
//   Storage.setHighScore(score: number)
//   Storage.getSetting(key: string, defaultValue: any) -> any
//   Storage.setSetting(key: string, value: any)
//   Storage.clearAll()
export const Storage = {
  getHighScore() {
    return parseInt(localStorage.getItem('blockwood_highscore') || '0');
  },
  setHighScore(score) {
    localStorage.setItem('blockwood_highscore', score);
  },
  getSetting(key, defaultValue) {
    const value = localStorage.getItem('blockwood_' + key);
    return value !== null ? JSON.parse(value) : defaultValue;
  },
  setSetting(key, value) {
    localStorage.setItem('blockwood_' + key, JSON.stringify(value));
  },
  clearAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith('blockwood_'))
      .forEach(k => localStorage.removeItem(k));
  }
};
