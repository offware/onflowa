import * as THREE from 'three';
import { state } from './state.js';

export let scene, camera, renderer, cameraGroup, hemiLight, directionalLight, particles;

export function setupScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 150, 450);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    cameraGroup = new THREE.Group();
    cameraGroup.add(camera);
    scene.add(cameraGroup);

    hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.9);
    hemiLight.position.set(0, 100, 0);
    scene.add(hemiLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(-150, 150, 150);
    scene.add(directionalLight);

    createGrid();
    createParticles();
}

function createGrid() {
    const gridHelper = new THREE.GridHelper(2300, 35, 0x181818, 0x181818);
    gridHelper.position.y = -20; // Assuming floorLevel from old state
    scene.add(gridHelper);
}

function createParticles() {
    const particleCount = 1000;
    const vertices = [];
    const particleTexture = new THREE.TextureLoader().load('assets/images/leaf.png');

    for (let i = 0; i < particleCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(1000);
        const y = THREE.MathUtils.randFloat(-20, 200);
        const z = THREE.MathUtils.randFloat(-800, 200);
        vertices.push(x, y, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        map: particleTexture,
        size: 5.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.7
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}
