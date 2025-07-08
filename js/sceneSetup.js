import { state } from './state.js';
import { themes } from './themeManager.js';

// Export core components so other modules can use them
export let scene, camera, renderer, cameraGroup, hemiLight, directionalLight, gridHelper, particles;



export function setupScene() {
    // --- CORE 3D SETUP ---
    scene = new THREE.Scene();
    scene.background = themes.dark.bgColor.clone();
    scene.fog = new THREE.Fog(themes.dark.bgColor.getHex(), 150, 450);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    cameraGroup = new THREE.Group();
    cameraGroup.add(camera);
    scene.add(cameraGroup);

    // --- LIGHTING ---
    hemiLight = new THREE.HemisphereLight(themes.dark.hemiSky, themes.dark.hemiGround, 0.9);
    hemiLight.position.set(0, 100, 0);
    scene.add(hemiLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(-150, 150, 150);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    scene.add(directionalLight);

    // --- FLOOR & GRID ---
    createGrid();
    createParticles();


    const shadowFloorGeometry = new THREE.PlaneGeometry(2000, 2000);
    const shadowFloorMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
    const shadowFloor = new THREE.Mesh(shadowFloorGeometry, shadowFloorMaterial);
    shadowFloor.rotation.x = -Math.PI / 2;
    shadowFloor.position.y = state.floorLevel;
    shadowFloor.receiveShadow = true;
    scene.add(shadowFloor);
}

export function createGrid() {
    if (gridHelper) {
        gridHelper.geometry.dispose();
        gridHelper.material.dispose();
        scene.remove(gridHelper);
    }
    const color = state.isDarkMode ? themes.dark.gridColor : themes.light.gridColor;
    gridHelper = new THREE.GridHelper(2300, 35, color, color);
    gridHelper.position.y = state.floorLevel;
    scene.add(gridHelper);
}


export function createParticles() {
    const particleCount = 1000;
    const vertices = [];

    // Create a texture for the particles
    const particleTexture = new THREE.TextureLoader().load('../assets/images/leaf.png'); // You will need to create this small image file

    for (let i = 0; i < particleCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(1000); // Spread along X-axis
        const y = THREE.MathUtils.randFloat(state.floorLevel, 200); // Start from floor and go up
        const z = THREE.MathUtils.randFloat(-800, 200); // Spread along Z-axis (along the camera path)
        vertices.push(x, y, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        map: particleTexture,
        size: 5.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false, // Important for performance and appearance
        transparent: true,
        opacity: 0.7
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}
