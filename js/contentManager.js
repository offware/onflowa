import * as THREE from 'three';
import { state } from './state.js';
import { scene, camera } from './sceneSetup.js';

export const paths = {};
export const hubObjects = {
    choices: [],
    logo: null,
    prompt: null
};
export let hubGroup;

export const hubPosition = new THREE.Vector3(0, 10, 100);
export const cameraStartPos = new THREE.Vector3(0, 10, 180);

// This utility creates our 3D text sprites
function makeTextSprite(message, opts = {}) {
    const fontface = opts.fontface || 'Montserrat';
    const fontsize = opts.fontsize || 48;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `Bold ${fontsize}px ${fontface}`;
    
    const textWidth = context.measureText(message).width;
    canvas.width = textWidth + fontsize;
    canvas.height = fontsize * 1.5;

    context.font = `Bold ${fontsize}px ${fontface}`;
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.fillText(message, fontsize / 2, fontsize);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    sprite.scale.set(canvas.width / 15, canvas.height / 15, 1.0);
    
    // Store canvas and context for animation
    sprite.userData = { canvas, context, fontsize, fontface };

    return sprite;
}

// --- 3D Hub Creation ---
function create3DHub() {
    // ✅ Create the group
    hubGroup = new THREE.Group();
    hubGroup.position.copy(hubPosition);
    scene.add(hubGroup);

    // 1. Create the Logo Plane
    const logoTexture = new THREE.TextureLoader().load('assets/images/logo.svg');
    const logoMaterial = new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true, depthTest: false });
    const logoGeometry = new THREE.PlaneGeometry(80, 20); 
    const logoPlane = new THREE.Mesh(logoGeometry, logoMaterial);
    // Position is now local to the group (0,0,0)
    hubGroup.add(logoPlane);

    // 2. Create the 3D Text Choices
    const choiceData = {
        projects:     new THREE.Vector3(0, 30, 0),
        team:         new THREE.Vector3(-70, 0, 0),
        evolution:    new THREE.Vector3(70, 0, 0),
        collaborations: new THREE.Vector3(0, -30, 0)
    };

    for (const [name, pos] of Object.entries(choiceData)) {
        const textSprite = makeTextSprite(`[ ${name.toUpperCase()} ]`);
        textSprite.position.copy(pos);
        textSprite.name = `hub-choice-${name}`;
        hubGroup.add(textSprite); // ✅ Add to group
        hubObjects.choices.push(textSprite);
    }
    
    // 3. Create the Checkmark
    hubObjects.checkmark = makeTextSprite('✓');
    hubObjects.checkmark.visible = false;
    hubGroup.add(hubObjects.checkmark); // ✅ Add to group

    hubObjects.prompt = makeTextSprite('[ Scroll to Explore ]', { fontsize: 32 });
    hubObjects.prompt.position.y = -15;
    hubObjects.prompt.visible = false;
    hubGroup.add(hubObjects.prompt);
}

// --- Main Content & Path Creation ---
export function createAllContent() {
    create3DHub();
    
    const pathData = {
        projects: {
            cameraPoints: [ cameraStartPos, new THREE.Vector3(0, 10, -200) ],
            lookAtPoints: [ hubPosition, new THREE.Vector3(0, 10, -250) ]
        },
        team: {
            cameraPoints: [ cameraStartPos, new THREE.Vector3(-250, 10, 150) ],
            lookAtPoints: [ hubPosition, new THREE.Vector3(-250, 10, 100) ]
        },
        evolution: {
            cameraPoints: [ cameraStartPos, new THREE.Vector3(250, 10, 150) ],
            lookAtPoints: [ hubPosition, new THREE.Vector3(250, 10, 100) ]
        },
        collaborations: {
            cameraPoints: [ cameraStartPos, new THREE.Vector3(0, 10, 300) ],
            lookAtPoints: [ hubPosition, new THREE.Vector3(0, 10, 350) ]
        }
    };

    for (const pathName in pathData) {
        paths[pathName] = {
            cameraCurve: new THREE.CatmullRomCurve3(pathData[pathName].cameraPoints),
            lookAtCurve: new THREE.CatmullRomCurve3(pathData[pathName].lookAtPoints)
        };
    }

    camera.position.copy(cameraStartPos);
    camera.lookAt(hubPosition);
}
