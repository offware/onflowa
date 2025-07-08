import { state } from './state.js';

export let clickSound;
let scrollSound, ambientSound;

export function initAudio() {
    ambientSound = new Tone.Player({
        url: 'assets/audio/ambient.mp3', // Make sure you have this file
        autostart: true,
        volume: 15,
    }).toDestination();

    scrollSound = new Tone.Player({
        url: 'assets/audio/scroll.mp3', // Make sure you have this file
        volume: -70
    }).toDestination();
    
    clickSound = new Tone.MembraneSynth({
        pitchDecay: 0.01,
        octaves: 3,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.4, attackCurve: 'exponential' },
        volume: -10
    }).toDestination();
    
    state.audioStarted = true;
}

export function playScrollSound() {
    if (state.audioStarted) scrollSound.start();
}

export function toggleSound() {
    if (!state.audioStarted) return;
    
    clickSound.triggerAttackRelease('C3', '8n');
    Tone.Master.mute = !Tone.Master.mute;
    document.getElementById('sound-toggle').innerText = Tone.Master.mute ? '🔇' : '🔊';
}