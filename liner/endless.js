// Endless Mode logic (modular)
export let endlessActive = false;
export function enableEndlessMode() { endlessActive = true; }
export function disableEndlessMode() { endlessActive = false; }
export function isEndlessMode() { return endlessActive; }
// Penalty logic, marathon stats, etc. to be added.
