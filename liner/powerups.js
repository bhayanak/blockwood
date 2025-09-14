
export const POWERUP_TYPES = {
  CLEAR_ROW: 'clear_row',
  SWAP_TRAY: 'swap_tray',
  EXTRA_UNDO: 'extra_undo',
  // Add more types as needed
};

let powerupInventory = {
  [POWERUP_TYPES.CLEAR_ROW]: 0,
  [POWERUP_TYPES.SWAP_TRAY]: 0,
  [POWERUP_TYPES.EXTRA_UNDO]: 0,
};

function loadCoins() {
  try {
    const val = localStorage.getItem('blockwood_coins');
    return val ? parseInt(val, 10) : 0;
  } catch (e) { return 0; }
}

function saveCoins(val) {
  localStorage.setItem('blockwood_coins', String(val));
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

export function getPowerupCount(type) {
  return powerupInventory[type] || 0;
}

export function addPowerup(type, count = 1) {
  powerupInventory[type] = (powerupInventory[type] || 0) + count;
}

export function usePowerup(type) {
  if (getPowerupCount(type) > 0) {
    powerupInventory[type]--;
    return true;
  }
  return false;
}

export function earnPowerup(type, source = 'score') {
  addPowerup(type, 1);
}

export function buyPowerup(type, cost = 5) {
  if (spendCoins(cost)) {
    addPowerup(type, 1);
    return true;
  }
  return false;
}

export function resetPowerups() {
  Object.keys(powerupInventory).forEach(type => powerupInventory[type] = 0);
  saveCoins(0);
}

export function getInventory() {
  return { ...powerupInventory };
}
