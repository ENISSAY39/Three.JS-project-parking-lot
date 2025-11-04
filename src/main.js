import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'https://unpkg.com/lil-gui@0.20.0/dist/lil-gui.esm.min.js';

import { addLights } from './lighting.js';
import { Materials } from './materials.js';
import { createParking } from './parking.js';
import { handleResize } from './utils.js';

// --- scène ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd6ea);
scene.fog = new THREE.Fog(0xbfd6ea, 80, 220);

// --- rendu ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// --- caméra ---
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 60, 100);

// --- contrôles ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// --- GUI ---   // <-- déplacé ici avant utilisation
const gui = new GUI({ container: document.getElementById('ui') });

// --- lumières ---
addLights(scene);

// --- sol + parking ---
const { ground, parking } = createParking(scene, Materials.Asphalt_Standard);

// --- AGRANDIR LES PLACES DE PARKING ---
parking.scale.set(1.8, 1, 1.8);
parking.position.y += 0.01;

// expose un slider dans la GUI pour régler la taille des places
const params = { spotScale: 1.8 };
gui.add(params, 'spotScale', 0.5, 3, 0.01).name('Scale places').onChange(v => {
  parking.scale.set(v, 1, v);
});

// GUI material selector
gui.add({ Material: 'Asphalt_Standard' }, 'Material', Object.keys(Materials)).onChange(name => {
  ground.material = Materials[name];
});

// --- resize ---
handleResize(camera, renderer);

// --- animation ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();