// score.js
let currentScore = 0;
export function updateScore(matches) {
  // Each cleared line/block gives 10 points
  if (matches && matches.length) {
    currentScore += matches.length * 10;
  }
  return currentScore;
}
