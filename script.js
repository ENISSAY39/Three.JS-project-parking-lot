import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';

// 1. Scène (Scene)
// C'est le conteneur où tous vos objets, lumières et caméras vivent.
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcce0ff); // Un fond bleu clair pour simuler le ciel

// 2. Caméra (Camera)
// C'est le point de vue de votre scène. On utilise souvent la PerspectiveCamera.
// Paramètres : champ de vision (FOV), ratio d'aspect, plan de coupe proche, plan de coupe lointain.
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20); // Une position un peu plus élevée pour voir le parking

// 3. Rendu (Renderer)
// C'est ce qui prend la scène et la caméra et la rend sur un élément <canvas>.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Activer les cartes d'ombres pour les lumières futures
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Type d'ombre
document.body.appendChild(renderer.domElement);

// 4. Contrôles (OrbitControls)
// Permet à l'utilisateur de naviguer dans la scène avec la souris.
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.maxPolarAngle = Math.PI / 2 - 0.1; // Empêche la caméra de passer sous le sol

// 5. Géométrie (Geometry)
// Définit la forme d'un objet 3D (ex: BoxGeometry, PlaneGeometry, SphereGeometry).
const groundGeometry = new THREE.PlaneGeometry(50, 50);

// 6. Matériau (Material)
// Définit l'apparence d'un objet (couleur, texture, brillance, etc.).
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x505050 }); // On passe à un StandardMaterial pour les ombres
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true; // Le sol peut recevoir des ombres
scene.add(ground);

// Ajout d'un cube comme repère temporaire
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.y = 0.5; // Pour qu'il repose sur le sol
box.castShadow = true; // Le cube peut projeter des ombres
scene.add(box);

// 7. Maillage (Mesh)
// C'est un objet 3D complet, composé d'une géométrie et d'un matériau.
// (Le `ground` et le `box` sont des Mesh)

// 8. Fonction d'animation
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// 9. Gestion du redimensionnement
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});