// sound.js
// Sound logic module for TimberTiles
// Responsibilities: sound loading, playback, mute/unmute


// Usage: import { Sound } from './sound.js';
// Methods:
//   Sound.preload(scene)
//   Sound.create(scene) -> { sfxPlace, sfxClear, sfxGameOver }
//   Sound.play(sfxObj, type: 'sfxPlace'|'sfxClear'|'sfxGameOver')
//   Sound.muteAll(scene, mute=true)
export const Sound = {
  preload(scene) {
    scene.load.audio('place', 'assets/place.wav');
    scene.load.audio('clear', 'assets/clear.wav');
    scene.load.audio('gameover', 'assets/gameover.wav');
  },
  create(scene) {
    return {
      sfxPlace: scene.sound.add('place'),
      sfxClear: scene.sound.add('clear'),
      sfxGameOver: scene.sound.add('gameover'),
    };
  },
  play(sfxObj, type) {
    if (sfxObj && sfxObj[type]) {
      sfxObj[type].play();
    }
  },
  muteAll(scene, mute=true) {
    scene.sound.mute = mute;
  }
};
