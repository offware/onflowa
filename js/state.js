import { themes } from './themeManager.js';

export const state = {
    audioStarted: false,
    isDarkMode: true,
    isThemeTransitioning: false,
    themeTransitionProgress: 0,
    sourceThemeColors: {},
    targetThemeColors: {},
    
    // Animation state
    mouseX: 0,
    mouseY: 0,
    scrollProgress: 0,
    currentSceneIndex: 0,
    isAnimating: false,
    targetScrollProgress: 0,
    
    // A reference to all text objects that need color updates
    allTextSprites: [],

    // App constants
    floorLevel: -20,
    imagePlaneHeight: 25,
};