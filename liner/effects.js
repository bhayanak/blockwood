// effects.js
// Visual effects module for TimberTiles
// Responsibilities: glow, burst, highlight, animations

export const Effects = {
  showGlowEffect(scene, x, y, color, size, duration = 400) {
    const glow = scene.add.graphics();
    glow.fillStyle(color, 0.4);
    glow.fillCircle(x, y, size);
    scene.tweens.add({
      targets: glow,
      alpha: 0,
      duration,
      onComplete: () => glow.destroy()
    });
  },
  showParticleBurst(scene, x, y, color, count = 8, size = 7, duration = 400) {
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      const dx = Math.cos(angle) * (size * 3 + Math.random() * 12);
      const dy = Math.sin(angle) * (size * 3 + Math.random() * 12);
      const particle = scene.add.graphics();
      particle.fillStyle(color, 0.7);
      particle.fillCircle(x, y, size);
      scene.tweens.add({
        targets: particle,
        x: x + dx,
        y: y + dy,
        alpha: 0,
        duration,
        onComplete: () => particle.destroy()
      });
    }
  }
};
// Usage: import { Effects } from './effects.js';
// Methods:
//   Effects.showGlowEffect(scene, x, y, color, size, duration)
//   Effects.showParticleBurst(scene, x, y, color, count, size, duration)
