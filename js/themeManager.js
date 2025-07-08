// js/themeManager.js

import { state } from './state.js';
// --- FIXED: 'gridHelper' has been removed from this import line ---
import { scene, hemiLight } from './sceneSetup.js';
import { updateAllTextColors } from './contentManager.js';
import { easeInOutCubic } from './utils.js';
import { clickSound } from './audioManager.js';

export const themes = {
    dark: {
        bgColor: new THREE.Color(0x0c0c0c),
        // gridColor is no longer used but we can keep the theme definition
        gridColor: new THREE.Color(0x181818), 
        hemiSky: new THREE.Color(0xffffff),
        hemiGround: new THREE.Color(0x000000),
    },
    light: {
        bgColor: new THREE.Color(0xebebeb),
        gridColor: new THREE.Color(0xF0F0F0),
        hemiSky: new THREE.Color(0x000000),
        hemiGround: new THREE.Color(0xffffff),
    }
};

export function toggleTheme() {
    if(state.audioStarted) clickSound.triggerAttackRelease('C3', '8n');
    if (state.isThemeTransitioning) return;

    state.isThemeTransitioning = true;
    state.themeTransitionProgress = 0;
    
    const sourceTheme = state.isDarkMode ? themes.dark : themes.light;
    const targetTheme = state.isDarkMode ? themes.light : themes.dark;
    
    state.sourceThemeColors.bgColor = sourceTheme.bgColor.clone();
    state.sourceThemeColors.hemiSky = sourceTheme.hemiSky.clone();
    state.sourceThemeColors.hemiGround = sourceTheme.hemiGround.clone();

    state.targetThemeColors.bgColor = targetTheme.bgColor;
    state.targetThemeColors.hemiSky = targetTheme.hemiSky;
    state.targetThemeColors.hemiGround = targetTheme.hemiGround;
    
    state.isDarkMode = !state.isDarkMode;
    document.body.classList.toggle('light-mode', !state.isDarkMode);
    document.getElementById('theme-toggle').innerText = state.isDarkMode ? '🌙' : '☀️';
    updateAllTextColors();
}

export function updateThemeTransition() {
    if (!state.isThemeTransitioning) return;

    const deltaTime = 0.016; 
    state.themeTransitionProgress += deltaTime * 1.2;
    const easeProgress = easeInOutCubic(Math.min(state.themeTransitionProgress, 1.0));

    scene.background.lerpColors(state.sourceThemeColors.bgColor, state.targetThemeColors.bgColor, easeProgress);
    scene.fog.color.lerpColors(state.sourceThemeColors.bgColor, state.targetThemeColors.bgColor, easeProgress);
    hemiLight.color.lerpColors(state.sourceThemeColors.hemiSky, state.targetThemeColors.hemiSky, easeProgress);
    hemiLight.groundColor.lerpColors(state.sourceThemeColors.hemiGround, state.targetThemeColors.hemiGround, easeProgress);
    
    if (state.themeTransitionProgress >= 1) {
        state.isThemeTransitioning = false;
        state.themeTransitionProgress = 0;
        // --- FIXED: The line trying to set the gridHelper color has been deleted ---
    }
}