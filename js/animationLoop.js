import * as THREE from 'three';
import { state } from './state.js';
import { scene, camera, renderer, cameraGroup, particles } from './sceneSetup.js';
import { paths, hubObjects, hubPosition, cameraStartPos } from './contentManager.js';

const clock = new THREE.Clock();

let updateHubSelectionCallback;
export function setHubUpdateCallback(callback) {
    updateHubSelectionCallback = callback;
}

function animate() {
    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    requestAnimationFrame(animate);

    if (state.isAnimating && state.activePath) {
        const activePathData = paths[state.activePath];
        if (activePathData) {
            state.scrollProgress = THREE.MathUtils.lerp(state.scrollProgress, state.targetScrollProgress, 0.02);
            cameraGroup.position.copy(activePathData.cameraCurve.getPointAt(state.scrollProgress));
            
            const lookAtPoint = activePathData.lookAtCurve.getPointAt(state.scrollProgress);
            const matrix = new THREE.Matrix4().lookAt(cameraGroup.position, lookAtPoint, camera.up);
            const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(matrix);
            cameraGroup.quaternion.slerp(targetQuaternion, 0.05);

            if (Math.abs(state.scrollProgress - state.targetScrollProgress) < 0.001) {
                state.scrollProgress = state.targetScrollProgress;
                state.isAnimating = false;

                if (state.atHub) {
                    cameraGroup.position.copy(cameraStartPos);
                    cameraGroup.lookAt(hubPosition);
                    camera.rotation.set(0, 0, 0);
                    
                    state.activePath = null;
                    if (updateHubSelectionCallback) {
                        updateHubSelectionCallback(null);
                    }
                }
            }
        } else {
            state.isAnimating = false;
        }
    }

    if (state.atHub && !state.isAnimating) {
        cameraGroup.quaternion.slerp(new THREE.Quaternion().setFromEuler(
            new THREE.Euler(0, Math.sin(elapsedTime * 0.1) * 0.05, 0)
        ), 0.05);
    }

        camera.rotation.x += ((-state.mouseY * 0.05) - camera.rotation.x) * 0.05;
        camera.rotation.y += ((-state.mouseX * 0.05) - camera.rotation.y) * 0.05;
        camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, 0, 0.1);
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, 0, 0.1);


    if (particles) {
        const windSpeed = 8;
        const flutterStrength = 2.5;
        const worldBounds = 500;
        const positions = particles.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += windSpeed * deltaTime;
            positions[i + 1] += Math.sin(elapsedTime + positions[i] * 0.1) * flutterStrength * deltaTime;
            positions[i + 2] += Math.cos(elapsedTime + positions[i] * 0.1) * flutterStrength * deltaTime;

            if (positions[i] > worldBounds) {
                positions[i] = -worldBounds;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

export function startAnimationLoop() {
    animate();
}
