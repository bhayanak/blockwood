import Phaser from 'phaser';
import { GameScene } from './gameScene.js';

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 700,
  backgroundColor: '#222',
  parent: 'game-container',
  scene: [GameScene]
};

new Phaser.Game(config);
