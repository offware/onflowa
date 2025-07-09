// ✅ CORRECTED IMPORT: This executes the Tone.js script and ensures
// the global 'Tone' object is correctly set up with all its methods.
import 'tone';
import { state } from './state.js';

// Define and export sound players so other modules can access them
export let choiceClickSound, startSound;
let scrollSound, ambientSound;

/**
 * Initializes all audio components. This function is called once after the
 * first user interaction with the page.
 */
export function initAudio() {
    // This function will now work correctly because 'Tone' is defined.
    ambientSound = new Tone.Player({
        url: 'assets/audio/ambience.mp3',
        loop: true,
        volume: -12,
    }).toDestination();

    scrollSound = new Tone.Player({
        url: 'assets/audio/scroll.mp3',
        volume: -10
    }).toDestination();
    
    choiceClickSound = new Tone.Player({
        url: 'assets/audio/choice-click.mp3',
        volume: -5
    }).toDestination();
    
    // Wait for all audio files to be loaded before starting playback.
    Tone.loaded().then(() => {
        ambientSound.start();
        console.log("Audio Initialized and ambient sound started.");
    });
    
    state.audioStarted = true;
}

/**
 * Plays the scroll sound effect.
 */
export function playScrollSound() {
    if (state.audioStarted && scrollSound.loaded) {
        scrollSound.start();
    }
}

/**
 * Toggles the master mute for all audio and updates the sound icon.
 */
export function toggleSound() {
    if (!state.audioStarted) return;
    
    Tone.Master.mute = !Tone.Master.mute;
    
    const soundText = document.getElementById('sound-text');
    const soundIcon = document.getElementById('sound-icon');

    if (soundText && soundIcon) {
        if (Tone.Master.mute) {
            soundText.innerHTML = `<i id="sound-icon" class="fa-solid fa-volume-xmark"></i> Sound: OFF`;
        } else {
            soundText.innerHTML = `<i id="sound-icon" class="fa-solid fa-volume-high"></i> Sound: ON`;
        }
    }
}
