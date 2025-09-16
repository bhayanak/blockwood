// input.js
// Input handling module for TimberTiles
// Responsibilities: pointer, drag, swipe, undo/redo gestures


// Usage: import { Input } from './input.js';
// Methods:
//   Input.setupSwipeUndoRedo(scene, undoCallback, redoCallback)
export const Input = {
  setupSwipeUndoRedo(scene, undoCallback, redoCallback) {
    let lastPointerDown = null;
    scene.input.on('pointerdown', (pointer) => {
      lastPointerDown = { x: pointer.x, y: pointer.y, time: Date.now() };
    });
    scene.input.on('pointerup', (pointer) => {
      if (!lastPointerDown) return;
      const dx = pointer.x - lastPointerDown.x;
      const dy = pointer.y - lastPointerDown.y;
      const dt = Date.now() - lastPointerDown.time;
      if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) && dt < 500) {
        if (dx < 0) undoCallback();
        else redoCallback();
      }
      lastPointerDown = null;
    });
  },
  // Add more pointer/drag helpers as needed
};

export function setup(scene) {
  // Example: wire up swipe undo/redo using scene's undoMove and redoMove if available
  if (typeof scene.undoMove === 'function' && typeof scene.redoMove === 'function') {
    Input.setupSwipeUndoRedo(scene, () => scene.undoMove(), () => scene.redoMove());
  }
  // Add more pointer/drag setup as needed
}

// Also allow Input.setup for legacy usage
Input.setup = setup;
