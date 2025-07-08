import { state } from './state.js';
import { scene } from './sceneSetup.js';

// We will define these inside the function to avoid the initialization error.
export let lookAtCurve, cameraCurve, placementPathPoints;

// --- CONTENT CREATION ---
function makeTextSprite(message, opts) {
    // ... (This function remains unchanged)
    const parameters = opts || {};
    const fontface = parameters.fontface || 'Montserrat';
    const fontsize = parameters.fontsize || 26;
    
    const canvas = document.createElement('canvas');
    const texture = new THREE.Texture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    const isSubtle = parameters.subtle || false;
    state.allTextSprites.push({ sprite, canvas, message, fontface, fontsize, isSubtle });
    
    updateTextColor(state.allTextSprites[state.allTextSprites.length - 1]);
    
    return sprite;
}

function updateTextColor(textObject) {
    // ... (This function remains unchanged)
    const { sprite, canvas, message, fontface, fontsize, isSubtle } = textObject;
    const context = canvas.getContext('2d');
    const lines = message.split('\n');
    const lineHeight = fontsize * 1.2;
    let maxWidth = 0;
    context.font = `Bold ${fontsize}px ${fontface}`;
    lines.forEach(line => {
        const metrics = context.measureText(line);
        if (metrics.width > maxWidth) maxWidth = metrics.width;
    });

    const padding = fontsize;
    canvas.width = maxWidth + (padding * 2);
    canvas.height = (lines.length * lineHeight) + (fontsize * 0.5);

    const color = isSubtle
        ? (state.isDarkMode ? `rgba(190, 190, 190, 1.0)`: `rgba(40, 40, 40, 1.0)`)
        : (state.isDarkMode ? `rgba(235, 235, 235, 1.0)`: `rgba(26, 26, 26, 1.0)`);
    
    context.font = `Bold ${fontsize}px ${fontface}`;
    context.fillStyle = color;
    context.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach((line, index) => {
        context.fillText(line, padding, fontsize + (index * lineHeight));
    });

    sprite.scale.set(canvas.width / 10, canvas.height / 10, 1.0);
    sprite.material.map.needsUpdate = true;
}

export function updateAllTextColors() {
    state.allTextSprites.forEach(updateTextColor);
}

function createImagePlane(imageUrl) {
    // ... (This function remains unchanged)
    const texture = new THREE.TextureLoader().load(imageUrl);
    const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true, opacity: 1, side: THREE.DoubleSide });
    const geometry = new THREE.PlaneGeometry(65, 60);
    const plane = new THREE.Mesh(geometry, material);
    plane.castShadow = true;
    return plane;
}

export function createAllContent() {
    // --- MOVED PATH DEFINITIONS HERE ---
    // Now we calculate these paths inside the function, when we know 'state' is ready.
    const projectContentCenterY = state.floorLevel + (state.imagePlaneHeight / 2) + 5;
    const visualPathPoints = [
        new THREE.Vector3(0, 10, 100),
        new THREE.Vector3(40, projectContentCenterY, -100),
        new THREE.Vector3(-40, projectContentCenterY, -280),
        new THREE.Vector3(50, projectContentCenterY, -460),
        new THREE.Vector3(0, 10, -620)
    ];

    placementPathPoints = [
        visualPathPoints[0],
        new THREE.Vector3(visualPathPoints[1].x, state.floorLevel, visualPathPoints[1].z),
        new THREE.Vector3(visualPathPoints[2].x, state.floorLevel, visualPathPoints[2].z),
        new THREE.Vector3(visualPathPoints[3].x, state.floorLevel, visualPathPoints[3].z),
        visualPathPoints[4],
    ];

    lookAtCurve = new THREE.CatmullRomCurve3(visualPathPoints);
    cameraCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 10, 170),
        ...visualPathPoints.map(p => new THREE.Vector3(p.x, p.y + 10, p.z + 70))
    ]);
    // --- END OF MOVED CODE ---

    const textGap = 1;
    
    // Welcome Content
    // ... (This part is unchanged)
    const welcomeGroup = new THREE.Group();
    const welcomeTitle = makeTextSprite("Onflow Architecture", { fontsize: 52 });
    const welcomeSubtitle = makeTextSprite("Scroll to explore", { fontsize: 28, subtle: true });
    welcomeTitle.position.y = (welcomeSubtitle.scale.y / 2) + (textGap / 2);
    welcomeSubtitle.position.y = -(welcomeTitle.scale.y / 2) - (textGap / 2);
    welcomeGroup.add(welcomeTitle, welcomeSubtitle);
    welcomeGroup.position.copy(placementPathPoints[0]);
    scene.add(welcomeGroup);
    
    // Project Data
    const projectData = [
         { 
            title: 'Project Alpha', 
            description: 'A contemporary residential tower that redefines\nurban living. Its design emphasizes natural light \nand open spaces, creating a sanctuary amidst\nthe city bustle.',
            imageUrl: 'https://placehold.co/650x600/333333/FFFFFF?text=Project+Alpha' 
        },
        { 
            title: 'The Oculus', 
            description: 'A landmark mixed-use commercial hub featuring \na dynamic,biomimetic facade. It integrates retail,\noffice, and public spaces to foster community\nand innovation.',
            imageUrl: 'https://placehold.co/650x600/444444/FFFFFF?text=The+Oculus'
        },
        { 
            title: 'Project Terra', 
            description: 'A sustainable community housing project built with \nlocally-sourced, eco-friendly materials. The design\nprioritizes energy efficiency and connection to nature.',
            imageUrl: 'https://placehold.co/650x600/555555/FFFFFF?text=Project+Terra'
        },
    ];
    
    // Project Content
    // ... (This part is unchanged)
    projectData.forEach((data, i) => {
        const projectGroup = new THREE.Group();
        const titleSprite = makeTextSprite(data.title, { fontsize: 44 });
        const descriptionSprite = makeTextSprite(data.description, { fontsize: 34, subtle: true });
        titleSprite.position.y = (descriptionSprite.scale.y / 2) + (textGap * 1.5);
        descriptionSprite.position.y = -(titleSprite.scale.y / 2);
        
        const textGroup = new THREE.Group();
        textGroup.add(titleSprite, descriptionSprite);
        textGroup.position.set(-50, state.imagePlaneHeight, 0);
        projectGroup.add(textGroup);
        
        const imagePlane = createImagePlane(data.imageUrl);
        const imageHeight = imagePlane.geometry.parameters.height;
        imagePlane.position.set(50, imageHeight / 2, 0);
        projectGroup.add(imagePlane);
        
        projectGroup.position.copy(placementPathPoints[i + 1]);
        scene.add(projectGroup);
    });
    
    // End Content
    // ... (This part is unchanged)
    const endGroup = new THREE.Group();
    const endTitle = makeTextSprite("Contact Us", { fontsize: 52 });
    const endSubtitle = makeTextSprite("info@onflow.com", { fontsize: 28, subtle: true });
    endTitle.position.y = (endSubtitle.scale.y / 2) + (textGap / 2);
    endSubtitle.position.y = -(endTitle.scale.y / 2) - (textGap / 2);
    endGroup.add(endTitle, endSubtitle);
    endGroup.position.copy(placementPathPoints[placementPathPoints.length - 1]);
    scene.add(endGroup);
}