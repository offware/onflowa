import { state } from './state.js';
import { camera, renderer } from './sceneSetup.js';
import { placementPathPoints } from './contentManager.js';
import { playScrollSound, toggleSound, initAudio } from './audioManager.js';
import { toggleTheme } from './themeManager.js';

function onScroll(event) {
    if (state.isAnimating) return;
    playScrollSound();
    
    const scrollDown = event.deltaY > 0;
    if (scrollDown && state.currentSceneIndex < placementPathPoints.length - 1) {
        state.currentSceneIndex++;
        state.isAnimating = true;
    } else if (!scrollDown && state.currentSceneIndex > 0) {
        state.currentSceneIndex--;
        state.isAnimating = true;
    }
    state.targetScrollProgress = state.currentSceneIndex / (placementPathPoints.length - 1);
}

function onMouseMove(event) {
    state.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    state.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

// In the onResize function
function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function onStartClick() {
    if (!state.audioStarted) {
        Tone.start().then(initAudio);
    }
    const overlay = document.getElementById('start-overlay');
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
}

export function setupEventListeners() {
    window.addEventListener('resize', onResize);
    window.addEventListener('wheel', onScroll);
    window.addEventListener('mousemove', onMouseMove);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('sound-toggle').addEventListener('click', toggleSound);
    document.getElementById('start-overlay').addEventListener('click', onStartClick, { once: true });
}