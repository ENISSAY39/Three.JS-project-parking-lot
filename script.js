import * as THREE from 'three'; // Résolu via l'import map défini dans index.html
import { OrbitControls } from './lib/OrbitControls.js'; // Le chemin vers votre fichier local OrbitControls.js

// --- Chapitre 1: Créer votre première scène 3D avec ThreeJS ---

// 1. Scène (Scene)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcce0ff); // Un fond bleu clair pour simuler le ciel

// 2. Caméra (Camera)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20); // Position initiale de la caméra

// 3. Rendu (Renderer)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Activer les cartes d'ombres
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Type d'ombre pour un rendu plus doux
document.body.appendChild(renderer.domElement);

// 4. Contrôles (OrbitControls)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Pour un mouvement de caméra plus fluide
controls.dampingFactor = 0.25;
controls.maxPolarAngle = Math.PI / 2 - 0.1; // Empêche la caméra de passer sous le sol
// Cible provisoire (mise à jour après création de l'abri)
controls.target.set(0, 0.5, -5);
camera.lookAt(controls.target);


// --- Chapitre 3: Travailler avec des sources de lumière dans ThreeJS ---

// Lumière ambiante : éclaire uniformément toute la scène
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Lumière directionnelle : simule la lumière du soleil
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(10, 25, 15); // Position de la lumière
directionalLight.castShadow = true; // Cette lumière projette des ombres
scene.add(directionalLight);

// Configuration des ombres pour la DirectionalLight
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -25;
directionalLight.shadow.camera.right = 25;
directionalLight.shadow.camera.top = 25;
directionalLight.shadow.camera.bottom = -25;

// Optionnel: Aides visuelles pour la lumière directionnelle et sa caméra d'ombres (pour le débogage)
// const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(lightHelper);
// const shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(shadowCameraHelper);


// --- Chapitre 4: Travailler avec ThreeJS materials ---

// Matériau pour l'asphalte (sol du parking)
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333, // Gris foncé
    roughness: 0.8,   // Très rugueux
    metalness: 0.0    // Non métallique
});

// Matériau pour les marquages au sol (blanc)
const lineMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff, // Blanc pur
    roughness: 0.2,
    metalness: 0.0
});

// Matériau pour les piliers et le toit (gris clair)
const structureMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc, // Gris clair
    roughness: 0.5,
    metalness: 0.1
});

// Matériau pour le bâtiment (blanc cassé)
const buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0, // Blanc cassé
    roughness: 0.7,
    metalness: 0.0
});

// Matériau pour les arbres (troncs)
const treeTrunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513, // Marron
    roughness: 0.9,
    metalness: 0.0
});

// Matériau pour les arbres (feuillage)
const treeFoliageMaterial = new THREE.MeshStandardMaterial({
    color: 0x228B22, // Vert forêt
    roughness: 0.8,
    metalness: 0.0
});

// Matériau pour les bordures de trottoir (jaune/noir)
const curbYellowMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
const curbBlackMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });


// --- Construction de la scène du parking ---

// Sol du parking
const groundGeometry = new THREE.PlaneGeometry(60, 60);
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Orienter le plan pour qu'il soit horizontal
ground.receiveShadow = true; // Le sol peut recevoir des ombres
ground.position.y = 0;
scene.add(ground);

// Bâtiment principal (derrière le parking)
const buildingGeometry = new THREE.BoxGeometry(20, 30, 30);
const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
building.position.set(-18, 10, -7);
building.receiveShadow = true;
building.castShadow = true; // Pour projeter des ombres sur d'autres éléments
scene.add(building);

// Abri de parking (toit et piliers)
// Taille réduite: longueur (Z) 26, largeur (X) 8 pour couvrir une seule colonne
const roofGeometry = new THREE.BoxGeometry(26, 0.3, 8);
const roof = new THREE.Mesh(roofGeometry, structureMaterial);
// On pivote l'abri de 90° pour que sa longueur (25) soit parallèle à la ligne d'arbres (axe Z)
roof.rotation.y = Math.PI / 2;
// On l'approche des arbres (x≈18) mais on laisse un petit espace (~2.5 unités)
// Décale l'ensemble abri + voitures vers la gauche (éloigné des arbres à droite)
const roofCenter = { x: -2, y: 4.5, z: -5 };
roof.position.set(roofCenter.x, roofCenter.y, roofCenter.z);
roof.castShadow = true;
roof.receiveShadow = true;
scene.add(roof);

// Après création de l'abri, on vise son centre
controls.target.set(roofCenter.x, 0.5, roofCenter.z);
camera.lookAt(controls.target);

// Piliers de l'abri
const pillarGeometry = new THREE.BoxGeometry(0.8, 4.5, 0.8);
const pillar1 = new THREE.Mesh(pillarGeometry, structureMaterial);
// Avec l'abri tourné: largeur sur X = 8 (±4), longueur sur Z = 26 (±13)
// On place les piliers avec un léger retrait des bords
const halfW = 8 / 2, halfL = 26 / 2;
const insetX = 1.0, insetZ = 2.0;
const px = halfW - insetX;     // ≈ 3.0
const pz = halfL - insetZ;     // ≈ 11.0
pillar1.position.set(roofCenter.x - px, 2.25, roofCenter.z - pz);
pillar1.castShadow = true;
pillar1.receiveShadow = true;
scene.add(pillar1);

const pillar2 = pillar1.clone();
pillar2.position.set(roofCenter.x + px, 2.25, roofCenter.z - pz);
scene.add(pillar2);

const pillar3 = pillar1.clone();
pillar3.position.set(roofCenter.x - px, 2.25, roofCenter.z + pz);
scene.add(pillar3);

const pillar4 = pillar1.clone();
pillar4.position.set(roofCenter.x + px, 2.25, roofCenter.z + pz);
scene.add(pillar4);


// Paramètres de sortie (exit), dos d'âne et marquages
const EXIT_Z = -12;       // léger décalage plus à gauche de la sortie
const EXIT_GAP_Z = 3.5;   // demi-largeur de l'ouverture dans la bordure/arbres

// Marquages au sol (place de parking). orientation: 'z' (longueur sur Z) ou 'x' (longueur sur X)
const createSpotMarkings = (cx, cz, spotW = 2.6, spotL = 5.2, lineT = 0.08, orientation = 'z') => {
    if (orientation === 'z') {
        // Longueur sur Z
        const sideGeom = new THREE.BoxGeometry(lineT, 0.05, spotL);
        const backGeom = new THREE.BoxGeometry(spotW, 0.05, lineT);

        const left = new THREE.Mesh(sideGeom, lineMaterial);
        left.position.set(cx - spotW / 2, 0.026, cz);
        scene.add(left);

        const right = new THREE.Mesh(sideGeom, lineMaterial);
        right.position.set(cx + spotW / 2, 0.026, cz);
        scene.add(right);

        const back = new THREE.Mesh(backGeom, lineMaterial);
        back.position.set(cx, 0.026, cz - spotL / 2);
        scene.add(back);
        return;
    }

    // Longueur sur X
    const sideGeomX = new THREE.BoxGeometry(spotL, 0.05, lineT);
    const backGeomX = new THREE.BoxGeometry(lineT, 0.05, spotW);

    const near = new THREE.Mesh(sideGeomX, lineMaterial);
    near.position.set(cx, 0.026, cz - spotW / 2);
    scene.add(near);

    const far = new THREE.Mesh(sideGeomX, lineMaterial);
    far.position.set(cx, 0.026, cz + spotW / 2);
    scene.add(far);

    const backX = new THREE.Mesh(backGeomX, lineMaterial);
    backX.position.set(cx - spotL / 2, 0.026, cz);
    scene.add(backX);
};


// Création de bordures de trottoir avec alternance jaune/noir
const createCurbSection = (x, z, length, isYellow) => {
    const curbGeometry = new THREE.BoxGeometry(isYellow ? 0.5 : 0.5, 0.3, length);
    const curb = new THREE.Mesh(curbGeometry, isYellow ? curbYellowMaterial : curbBlackMaterial);
    curb.position.set(x, 0.15, z);
    curb.castShadow = true;
    curb.receiveShadow = true;
    scene.add(curb);
    return curb;
};

// Bordure le long du côté droit
let currentZ = -29.5;
while (currentZ < 30) {
    // Laisse une ouverture au niveau de la sortie
    if (Math.abs(currentZ - EXIT_Z) > EXIT_GAP_Z) {
        createCurbSection(20, currentZ, 2.5, Math.random() > 0.5); // Alternance aléatoire
    }
    currentZ += 2.5;
}

// Bordure le long du bâtiment (simplifié)
createCurbSection(-29.5, -20, 10, true);
createCurbSection(-29.5, -10, 10, false);
createCurbSection(-29.5, 0, 10, true);
createCurbSection(-29.5, 10, 10, false);

// Dos d'âne (speed bump) semi-cylindrique (demi-cercle extrudé)
function createSpeedBump(x, z, radius = 0.35, lengthZ = 10) {
    const shape = new THREE.Shape();
    // Profil demi-cercle orienté vers le HAUT (part de -r,0 → arc au-dessus → +r,0)
    shape.moveTo(-radius, 0);
    shape.absarc(0, 0, radius, Math.PI, 0, true); // clockwise: passe par la partie haute (y>0)
    shape.lineTo(-radius, 0); // ferme la base plate

    const bumpGeo = new THREE.ExtrudeGeometry(shape, {
        depth: lengthZ,
        bevelEnabled: false,
        curveSegments: 24
    });
    // Centrer en Z (l'extrusion part vers +Z)
    bumpGeo.translate(0, 0, -lengthZ / 2);

    const bumpMat = new THREE.MeshStandardMaterial({ color: 0xf2c744, roughness: 0.6, metalness: 0.0 });
    const bump = new THREE.Mesh(bumpGeo, bumpMat);
    // Poser au sol: la base du profil est à y=0 → on le pose juste au-dessus pour éviter le z-fighting
    bump.position.set(x, 0.001, z);
    bump.castShadow = true;
    bump.receiveShadow = true;
    scene.add(bump);
    return bump;
}

// place le dos d'âne au centre de la voie, légèrement à gauche de la bordure
createSpeedBump(16, EXIT_Z, 0.35, 10);


// Voitures simplifiées
const createSimpleCar = (x, z, color, rotationY = 0) => {
    const carGroup = new THREE.Group();

    const bodyGeometry = new THREE.BoxGeometry(1.8, 0.8, 4);
    const carBodyMaterial = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, metalness: 0.1 });
    const carBody = new THREE.Mesh(bodyGeometry, carBodyMaterial);
    carBody.position.y = 0.4;
    carBody.castShadow = true;
    carBody.receiveShadow = true;
    carGroup.add(carBody);

    const cabinGeometry = new THREE.BoxGeometry(1.6, 0.7, 2);
    const carCabin = new THREE.Mesh(cabinGeometry, carBodyMaterial);
    carCabin.position.set(0, 1.1, 0);
    carCabin.castShadow = true;
    carCabin.receiveShadow = true;
    carGroup.add(carCabin);

    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.0 });

    const addWheel = (px, py, pz) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(px, py, pz);
        wheel.castShadow = true;
        wheel.receiveShadow = true;
        carGroup.add(wheel);
    };

    addWheel(0.8, 0.4, 1.5);
    addWheel(-0.8, 0.4, 1.5);
    addWheel(0.8, 0.4, -1.5);
    addWheel(-0.8, 0.4, -1.5);

    carGroup.position.set(x, 0, z);
    carGroup.rotation.y = rotationY;
    scene.add(carGroup);
    return carGroup;
};

// 5 places sous l'abri en 1 seule rangée (X) x 5 colonnes (Z),
// voitures orientées vers les arbres (axe +X), donc en longueur sur X
const carColors = [0x666666, 0x882222, 0x444488, 0x228822, 0xd2a44b];
const spotWidth = 2.6;   // largeur sur X (épaisseur de place)
const spotLength = 5.2;  // longueur sur X (direction du véhicule)

// Offsets RELATIFS au centre de l'abri
const localX = [0];                         // 1 seule rangée, centrée
const localZ = [-10, -5, 0, 5, 10];         // 5 colonnes le long de la longueur (±14)

localX.forEach((lx, r) => {
    localZ.forEach((lz, c) => {
        const cx = roofCenter.x + lx;
        const cz = roofCenter.z + lz;
        // Marquage orienté en longueur sur X (voiture face aux arbres à droite)
        createSpotMarkings(cx, cz, spotWidth, spotLength, 0.08, 'x');
        const color = carColors[(r * localZ.length + c) % carColors.length];
        createSimpleCar(cx, cz, color, Math.PI / 2); // orientation +X (vers les arbres)
    });
});


// Arbres (simplifiés)
const createSimpleTree = (x, z, height = 5) => {
    const treeGroup = new THREE.Group();

    // Troncs
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, height, 8);
    const trunk = new THREE.Mesh(trunkGeometry, treeTrunkMaterial);
    trunk.position.y = height / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // Feuillage
    const foliageGeometry = new THREE.IcosahedronGeometry(2 + Math.random(), 0); // Forme aléatoire
    const foliage = new THREE.Mesh(foliageGeometry, treeFoliageMaterial);
    foliage.position.y = height + 1.5;
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    treeGroup.add(foliage);

    treeGroup.position.set(x, 0, z);
    scene.add(treeGroup);
};

// Quelques arbres le long du parking
[-20, -10, 0, 10, 20].forEach(z => {
    // Retire l'arbre dans la zone de sortie
    if (Math.abs(z - EXIT_Z) > EXIT_GAP_Z) {
        createSimpleTree(18, z);
    }
});

createSimpleTree(10, -28);
createSimpleTree(0, -28);
createSimpleTree(-10, -28);

// Panneau EXIT près de l'ouverture
function createExitSign(x, z) {
    // Poteau
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 2.2, 12),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    pole.position.set(x, 1.1, z);
    pole.castShadow = true;
    pole.receiveShadow = true;

    // Panneau rectangulaire avec texture canvas "EXIT"
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2e7d32'; // vert
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    const signMat = new THREE.MeshBasicMaterial({ map: tex, transparent: false, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.4), signMat);
    sign.position.set(x, 2.0, z);
    // Oriente le panneau le long de la voie (pas face aux voitures)
    sign.rotation.y = 0; // normal vers +Z

    const group = new THREE.Group();
    group.add(pole);
    group.add(sign);
    scene.add(group);
    return group;
}

// Place le panneau à côté du dos d'âne mais décalé en Z pour ne pas être en face des voitures
// Proche bordure (x≈18.8), en amont de l'ouverture
const EXIT_SIGN_POS = { x: 10, z: EXIT_Z - 7 };
createExitSign(EXIT_SIGN_POS.x, EXIT_SIGN_POS.z);


// --- Fonction d'animation et de rendu ---
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Important pour les contrôles de caméra avec damping
    renderer.render(scene, camera);
}
animate();


// --- Gestion du redimensionnement de la fenêtre ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});