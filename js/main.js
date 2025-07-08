import { setupScene } from './sceneSetup.js';
import { createAllContent } from './contentManager.js';
import { startAnimationLoop } from './animationLoop.js';
import { setupEventListeners } from './eventListeners.js';

// Initialize the entire application
function init() {
    setupScene();
    createAllContent();
    setupEventListeners();
    startAnimationLoop();
}

init();