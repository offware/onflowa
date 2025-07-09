import 'tone';
import { state } from './state.js';
import { camera, renderer, scene } from './sceneSetup.js';
// ✅ UPDATED: Removed 'startSound' as it's not in the provided audioManager
import { initAudio, playScrollSound, toggleSound, choiceClickSound } from './audioManager.js';
import { hubObjects } from './contentManager.js';
import { animateScrambleText } from './textAnimator.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function setupHoverScramble(triggerElement, targetTextElement, soundToPlay) {
    let stopAnimation = null;

    triggerElement.addEventListener('mouseenter', () => {
        if (state.audioStarted && choiceClickSound) {
            choiceClickSound.start();
        }
        if (targetTextElement) {
            // Stop any previous animation before starting a new one.
            if (stopAnimation) stopAnimation();
            // Start the new animation and store its stop function.
            stopAnimation = animateScrambleText(targetTextElement, targetTextElement.innerText);
        }
    });

    triggerElement.addEventListener('mouseleave', () => {
        // If an animation is running, stop it.
        if (stopAnimation) {
            stopAnimation();
            stopAnimation = null;
        }
        // This ensures the text always resets to the correct current state.
        if (targetTextElement) {
            const isMuted = Tone.Master.mute;
            targetTextElement.innerHTML = isMuted 
                ? `<i id="sound-icon" class="fa-solid fa-volume-xmark"></i> Sound: OFF` 
                : `<i id="sound-icon" class="fa-solid fa-volume-high"></i> Sound: ON`;
        }
    });
}

function animateScrambleText3D(sprite, final_text, duration = 500) {
    const { canvas, context, fontsize, fontface } = sprite.userData;
    const chars = '!<>-_\\/[]{}—=+*^?#';
    let frame = 0;
    const frame_rate = 25;
    const num_frames = duration / frame_rate;

    if (sprite.userData.scrambleInterval) {
        clearInterval(sprite.userData.scrambleInterval);
    }

    sprite.userData.scrambleInterval = setInterval(() => {
        let scrambled_text = '';
        for (let i = 0; i < final_text.length; i++) {
            const progress = frame / num_frames;
            const reveal_progress = i / (final_text.length - 1);

            if (progress >= reveal_progress || [' ', '[', ']'].includes(final_text[i])) {
                scrambled_text += final_text[i];
            } else {
                scrambled_text += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillText(scrambled_text, fontsize / 2, fontsize);
        sprite.material.map.needsUpdate = true;

        frame++;
        if (frame >= num_frames) {
            clearInterval(sprite.userData.scrambleInterval);
        }
    }, frame_rate);
}

function onHubChoiceClick(selectedObject) {
    if (state.isAnimating || state.activePath === selectedObject.name.replace('hub-choice-', '')) return;

    const choice = selectedObject.name.replace('hub-choice-', '');
    state.activePath = choice;
    
    // This correctly uses the imported choiceClickSound
    if (state.audioStarted && choiceClickSound) choiceClickSound.start();
    
    hubObjects.choices.forEach(choiceSprite => {
        const originalText = `[ ${choiceSprite.name.replace('hub-choice-','').toUpperCase()} ]`;
        choiceSprite.material.opacity = 0.4;
        if (choiceSprite !== selectedObject) {
             if (choiceSprite.userData.scrambleInterval) {
                clearInterval(choiceSprite.userData.scrambleInterval);
                choiceSprite.userData.scrambleInterval = null;
            }
            const { canvas, context, fontsize, fontface } = choiceSprite.userData;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillText(originalText, fontsize / 2, fontsize);
            choiceSprite.material.map.needsUpdate = true;
        }
    });

    selectedObject.material.opacity = 1.0;
    animateScrambleText3D(selectedObject, `[ ${choice.toUpperCase()} ]`);

    if (hubObjects.prompt) hubObjects.prompt.visible = true;
}

function onSceneClick(event) {
    if (!state.atHub) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(hubObjects.choices);
    if (intersects.length > 0) {
        onHubChoiceClick(intersects[0].object);
    }
}

function onScroll(event) {
    if (state.isAnimating || !state.activePath) return;

    const scrollDown = event.deltaY > 0;
    if (scrollDown && state.atHub) {
        state.targetScrollProgress = 1;
        state.isAnimating = true;
        state.atHub = false;
        playScrollSound();
    } else if (!scrollDown && !state.atHub) {
        state.targetScrollProgress = 0;
        state.isAnimating = true;
        state.atHub = true;
        playScrollSound();
    }
}

function onMouseMove(event) { state.mouseX = (event.clientX / window.innerWidth) * 2 - 1; state.mouseY = -(event.clientY / window.innerHeight) * 2 + 1; }
function onResize() { if(camera && renderer) { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); } }

// This function handles the first click on the overlay
function onStartClick() {
    if (!state.audioStarted) {
        // This now simply initializes the audio context and all sounds
        Tone.start().then(initAudio);
    }
    const overlay = document.getElementById('start-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.pointerEvents = 'none';
        }, 500);
    }
}

export function setupEventListeners() {
    window.addEventListener('click', onSceneClick);
    window.addEventListener('resize', onResize);
    window.addEventListener('wheel', onScroll);
    window.addEventListener('mousemove', onMouseMove);
    
    window.addEventListener('DOMContentLoaded', () => {
        const soundToggle = document.getElementById('sound-toggle-container');
        if (soundToggle) {
            const soundTextElement = document.getElementById('sound-text');
            soundToggle.addEventListener('click', toggleSound);
            
            // ✅ Use the new, robust hover function
            setupHoverScramble(soundToggle, soundTextElement, choiceClickSound);
        }

        const startOverlay = document.getElementById('start-overlay');
        if (startOverlay) {
            startOverlay.addEventListener('click', onStartClick, { once: true });
        }
    });
}