
/**
 * Power-Ups and Coin System for TimberTiles
 * ----------------------------------------
 * - All power-up keys are uppercase: 'CLEAR_ROW', 'SWAP_TRAY', 'EXTRA_UNDO'
 * - Inventory and coins are persisted in localStorage
 *   - Coins: 'timbertiles_coins' (integer)
 *   - Power-Ups: 'timbertiles_powerups' (object)
 * - All exported functions require uppercase keys for power-up types
 * - Debug tools in mainmenu.js and game.js allow testing coin/power-up addition
 * - No legacy lowercase key migration remains; all keys are validated
 * - Use getInventory() for a snapshot of current power-up counts
 * - Use getCoins(), addCoins(), spendCoins() for coin management
 * - Use addPowerup(), usePowerup(), buyPowerup() for power-up management
 */

export const POWERUP_TYPES = {
  CLEAR_ROW: 'CLEAR ROW',
  SWAP_TRAY: 'SWAP TRAY',
  EXTRA_UNDO: 'EXTRA UNDO',
  // Add more types as needed
};

let powerupInventory = {
  CLEAR_ROW: 0,
  SWAP_TRAY: 0,
  EXTRA_UNDO: 0
};

function loadPowerupInventory() {
  try {
    var val = localStorage.getItem('timbertiles_powerups');
    let inv = val ? JSON.parse(val) : {
      CLEAR_ROW: 0,
      SWAP_TRAY: 0,
      EXTRA_UNDO: 0
    };
    // Remove any unexpected keys
    Object.keys(inv).forEach(k => {
      if (!['CLEAR_ROW', 'SWAP_TRAY', 'EXTRA_UNDO'].includes(k)) {
        delete inv[k];
      }
    });
    return inv;
  } catch (e) {
    return {
      CLEAR_ROW: 0,
      SWAP_TRAY: 0,
      EXTRA_UNDO: 0
    };
  }
}

function savePowerupInventory(inv) {
  // Remove any unexpected keys before saving
  Object.keys(inv).forEach(k => {
    if (!['CLEAR_ROW', 'SWAP_TRAY', 'EXTRA_UNDO'].includes(k)) {
      delete inv[k];
    }
  });
  localStorage.setItem('timbertiles_powerups', JSON.stringify(inv));
}

// On load, always sync from localStorage
// Migration logic removed; all keys are now uppercase and validated on load/save.
powerupInventory = loadPowerupInventory();

function loadCoins() {
  try {
    const val = localStorage.getItem('timbertiles_coins');
    return val ? parseInt(val, 10) : 0;
  } catch (e) { return 0; }
}

function saveCoins(val) {
  localStorage.setItem('timbertiles_coins', String(val));
}

export function getCoins() {
  return loadCoins();
}

export function addCoins(amount = 1) {
  const coins = loadCoins() + amount;
  saveCoins(coins);
}

export function spendCoins(amount = 1) {
  const coins = loadCoins();
  if (coins >= amount) {
    saveCoins(coins - amount);
    return true;
  }
  return false;
}

// Only accepts uppercase keys: 'CLEAR_ROW', 'SWAP_TRAY', 'EXTRA_UNDO'
export function getPowerupCount(type) {
  if (!['CLEAR_ROW', 'SWAP_TRAY', 'EXTRA_UNDO'].includes(type)) {
    throw new Error('Invalid powerup type: must be uppercase');
  }
  powerupInventory = loadPowerupInventory();
  return powerupInventory[type] || 0;
}

// Only accepts uppercase keys: 'CLEAR_ROW', 'SWAP_TRAY', 'EXTRA_UNDO'
export function addPowerup(type, count = 1) {
  if (!['CLEAR_ROW', 'SWAP_TRAY', 'EXTRA_UNDO'].includes(type)) {
    throw new Error('Invalid powerup type: must be uppercase');
  }
  powerupInventory = loadPowerupInventory();
  powerupInventory[type] = (powerupInventory[type] || 0) + count;
  savePowerupInventory(powerupInventory);
}

// Only accepts uppercase keys: 'CLEAR_ROW', 'SWAP_TRAY', 'EXTRA_UNDO'
export function usePowerup(type) {
  if (!['CLEAR_ROW', 'SWAP_TRAY', 'EXTRA_UNDO'].includes(type)) {
    throw new Error('Invalid powerup type: must be uppercase');
  }
  powerupInventory = loadPowerupInventory();
  if (powerupInventory[type] > 0) {
    powerupInventory[type]--;
    savePowerupInventory(powerupInventory);
    return true;
  }
  return false;
}

// Only accepts uppercase keys: 'CLEAR_ROW', 'SWAP_TRAY', 'EXTRA_UNDO'
export function earnPowerup(type, source = 'score') {
  addPowerup(type, 1);
}

// Only accepts uppercase keys: 'CLEAR_ROW', 'SWAP_TRAY', 'EXTRA_UNDO'
export function buyPowerup(type, cost = 5) {
  if (!['CLEAR_ROW', 'SWAP_TRAY', 'EXTRA_UNDO'].includes(type)) {
    throw new Error('Invalid powerup type: must be uppercase');
  }
  if (spendCoins(cost)) {
    addPowerup(type, 1);
    return true;
  }
  return false;
}

export function resetPowerups() {
  powerupInventory = {
    CLEAR_ROW: 0,
    SWAP_TRAY: 0,
    EXTRA_UNDO: 0
  };
  savePowerupInventory(powerupInventory);
  saveCoins(0);
}

export function getInventory() {
  powerupInventory = loadPowerupInventory();
  // Return a shallow copy
  return Object.assign({}, powerupInventory);
}
