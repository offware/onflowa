import { state } from './state.js';
import { scene, camera, renderer, cameraGroup, particles } from './sceneSetup.js';
import { updateThemeTransition } from './themeManager.js';
import { lookAtCurve, cameraCurve, placementPathPoints } from './contentManager.js';

const clock = new THREE.Clock();
const animationSpeed = 2.5;

function animate() {
    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime(); // ✅ ADD THIS LINE

    requestAnimationFrame(animate);

    if (particles) {
        // --- Wind and Flutter Animation for Each Leaf ---

        const windSpeed = 8; // How fast the wind blows horizontally
        const flutterStrength = 2.5; // How much the leaves wobble
        const worldBounds = 500; // Half the width of your particle spread

        const positions = particles.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            // 1. Main wind movement from left to right
            positions[i] += windSpeed * deltaTime;

            // 2. Add a subtle flutter effect on Y and Z axes
            positions[i + 1] += Math.sin(elapsedTime + positions[i] * 0.1) * flutterStrength * deltaTime;
            positions[i + 2] += Math.cos(elapsedTime + positions[i] * 0.1) * flutterStrength * deltaTime;

            // 3. If a leaf goes off the right side, loop it back to the left
            if (positions[i] > worldBounds) {
                positions[i] = -worldBounds;
            }
        }

        // This is crucial to tell Three.js to update the particle positions
        particles.geometry.attributes.position.needsUpdate = true;
    }

    

    updateThemeTransition();

    if (state.isAnimating) {
        state.scrollProgress = THREE.MathUtils.lerp(state.scrollProgress, state.targetScrollProgress, deltaTime * animationSpeed);
        if (Math.abs(state.scrollProgress - state.targetScrollProgress) < 0.0001) {
            state.scrollProgress = state.targetScrollProgress;
            state.isAnimating = false;
        }
    }

    const interpolationFactor = Math.min(1.0, deltaTime * animationSpeed);
    cameraGroup.position.lerp(cameraCurve.getPointAt(state.scrollProgress), interpolationFactor);
    const lookAtPoint = lookAtCurve.getPointAt(state.scrollProgress);
    const matrix = new THREE.Matrix4().lookAt(cameraGroup.position, lookAtPoint, camera.up);
    cameraGroup.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(matrix), interpolationFactor);
    
    // Mouse parallax effect
    camera.rotation.x += ((-state.mouseY * 0.2) - camera.rotation.x) * 0.05;
    camera.rotation.y += ((-state.mouseX * 0.2) - camera.rotation.y) * 0.05;
    
    renderer.render(scene, camera);
}

export function startAnimationLoop() {
    animate();
}