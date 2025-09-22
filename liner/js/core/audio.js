// Audio manager for sound effects
import { AUDIO } from './constants.js';
import { storage } from './storage.js';

class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = storage.isAudioEnabled();
        this.masterVolume = storage.get('masterVolume', AUDIO.MASTER_VOLUME);
        this.sfxVolume = storage.get('sfxVolume', AUDIO.SFX_VOLUME);
        this.initialized = false;
    }

    /**
     * Initialize audio system with Phaser scene
     */
    init(scene) {
        this.scene = scene;
        this.loadSounds();
        this.initialized = true;
    }

    /**
     * Load all sound files
     */
    loadSounds() {
        if (!this.scene) return;

        // Preload sound files
        this.scene.load.audio('place', 'assets/place.wav');
        this.scene.load.audio('clear', 'assets/clear.wav');
        this.scene.load.audio('gameover', 'assets/gameover.wav');
    }

    /**
     * Create sound objects after loading
     */
    createSounds() {
        if (!this.scene || !this.initialized) return;

        this.sounds = {
            place: this.scene.sound.add('place', { volume: this.sfxVolume * this.masterVolume }),
            clear: this.scene.sound.add('clear', { volume: this.sfxVolume * this.masterVolume }),
            gameover: this.scene.sound.add('gameover', { volume: this.sfxVolume * this.masterVolume })
        };
    }

    /**
     * Play a sound effect
     */
    playSound(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;

        try {
            this.sounds[soundName].play();
        } catch (e) {
            console.warn(`Failed to play sound: ${soundName}`, e);
        }
    }

    /**
     * Play place sound
     */
    playPlace() {
        this.playSound('place');
    }

    /**
     * Play clear sound
     */
    playClear() {
        this.playSound('clear');
    }

    /**
     * Play game over sound
     */
    playGameOver() {
        this.playSound('gameover');
    }

    /**
     * Toggle audio on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        storage.setAudioEnabled(this.enabled);
        
        if (!this.enabled) {
            this.stopAll();
        }
        
        return this.enabled;
    }

    /**
     * Enable audio
     */
    enable() {
        this.enabled = true;
        storage.setAudioEnabled(true);
    }

    /**
     * Disable audio
     */
    disable() {
        this.enabled = false;
        storage.setAudioEnabled(false);
        this.stopAll();
    }

    /**
     * Stop all sounds
     */
    stopAll() {
        Object.values(this.sounds).forEach(sound => {
            if (sound.isPlaying) {
                sound.stop();
            }
        });
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    /**
     * Set SFX volume
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    /**
     * Update volume for all sounds
     */
    updateAllVolumes() {
        const finalVolume = this.masterVolume * this.sfxVolume;
        Object.values(this.sounds).forEach(sound => {
            sound.setVolume(finalVolume);
        });
    }

    /**
     * Check if audio is enabled
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Get current volumes
     */
    getVolumes() {
        return {
            master: this.masterVolume,
            sfx: this.sfxVolume,
            final: this.masterVolume * this.sfxVolume
        };
    }

    /**
     * Preload audio assets (call this in scene preload)
     */
    preloadAssets(scene) {
        // Check if assets are already loaded to avoid duplicates
        if (!scene.cache.audio.exists('place')) {
            scene.load.audio('place', 'assets/place.wav');
        }
        if (!scene.cache.audio.exists('clear')) {
            scene.load.audio('clear', 'assets/clear.wav');
        }
        if (!scene.cache.audio.exists('gameover')) {
            scene.load.audio('gameover', 'assets/gameover.wav');
        }
    }

    /**
     * Initialize sounds after assets are loaded (call this in scene create)
     */
    initializeSounds(scene) {
        this.scene = scene;
        this.createSounds();
    }
}

// Create and export singleton instance
export const audioManager = new AudioManager();