import { cameraGroup } from './sceneSetup.js';
import { cameraStartPos, hubPosition } from './contentManager.js';

/**
 * Logs the initial state of the camera and hub positions to the console.
 * This helps verify the "home" state that the camera should return to.
 */
export function logInitialPositions() {
    console.log("--- INITIAL POSITION LOG ---");
    
    // Log the intended starting position of the camera group
    console.log("Target Start Position (cameraStartPos):", {
        x: cameraStartPos.x.toFixed(2),
        y: cameraStartPos.y.toFixed(2),
        z: cameraStartPos.z.toFixed(2)
    });

    // Log the actual position of the camera group right after initialization
    console.log("Actual Initial Camera Group Position:", {
        x: cameraGroup.position.x.toFixed(2),
        y: cameraGroup.position.y.toFixed(2),
        z: cameraGroup.position.z.toFixed(2)
    });

    // Log the position the camera should be looking at
    console.log("Target LookAt Position (hubPosition):", {
        x: hubPosition.x.toFixed(2),
        y: hubPosition.y.toFixed(2),
        z: hubPosition.z.toFixed(2)
    });

    console.log("----------------------------");
}
