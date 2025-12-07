import * as THREE from 'three'; // Résolu via l'import map défini dans index.html
import { OrbitControls } from './lib/OrbitControls.js'; // Le chemin vers votre fichier local OrbitControls.js

// --- Chapitre 1: Créer votre première scène 3D avec ThreeJS ---

// 1. Scène (Scene)
const scene = new THREE.Scene();

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

// Texture procédurale pour dalles pavées (CanvasTexture)
function makePaverTexture({ tileW = 64, tileH = 36, grout = 4, hue = 0, sat = 0, light = 50 } = {}) {
    // Motif minimal périodique: 2 colonnes x 2 rangées avec décalage d'une demi-brique
    const w = 2 * tileW + grout;
    const h = 2 * tileH + grout;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Couleurs (version plus foncée)
    const groutColor = '#4c4c4c'; // joint foncé
    const stones = ['#6a6a6a', '#5e5e5e', '#707070', '#646464'];

    // Fond = joint pour que les bords répétés restent cohérents
    ctx.fillStyle = groutColor;
    ctx.fillRect(0, 0, w, h);

    // Fonction utilitaire: dessiner un pavé avec légère variation de teinte
    const drawStone = (x, y, tw, th) => {
        const pad = 1.5; // léger chanfrein visuel
        ctx.fillStyle = stones[Math.floor(Math.random() * stones.length)];
        ctx.fillRect(x + pad, y + pad, tw - 2 * pad, th - 2 * pad);
        // Ombre légère pour relief
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + pad + 0.5, y + pad + 0.5, tw - 2 * pad - 1, th - 2 * pad - 1);
    };

    // Rangée 0 (non décalée)
    for (let col = 0; col < 2; col++) {
        const x = col * (tileW + grout);
        const y = 0;
        drawStone(x, y, tileW, tileH);
    }
    // Rangée 1 (décalée d'une demi-brique). On couvre un peu à gauche et à droite pour la répétition
    const y1 = tileH + grout;
    for (let col = -1; col <= 2; col++) {
        const x = col * (tileW + grout) + Math.floor((tileW + grout) / 2);
        if (x + tileW < 0 || x > w) continue; // clip simple
        drawStone(x, y1, tileW, tileH);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
}

// Matériau du sol pavé
const groundTexture = makePaverTexture({ tileW: 56, tileH: 32, grout: 4 });
groundTexture.repeat.set(6, 6); // répéter sur le plan (60x60)
const groundMaterial = new THREE.MeshStandardMaterial({
    map: groundTexture,
    color: 0x555555, // assombrit la texture (multiplicatif)
    roughness: 0.95,
    metalness: 0.0
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

// Texture procédurale pour briques du bâtiment (CanvasTexture)
function makeBrickTexture() {
    const brickW = 80;  // Largeur d'une brique
    const brickH = 40;  // Hauteur d'une brique
    const mortarSize = 4; // Épaisseur du joint
    
    // Motif: 2 briques en largeur, 2 en hauteur (avec décalage)
    const w = 2 * brickW + mortarSize;
    const h = 2 * brickH + 2 * mortarSize;
    
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    // Couleur du mortier (joints clairs)
    ctx.fillStyle = '#c9c9c9';
    ctx.fillRect(0, 0, w, h);
    
    // Différentes teintes de briques rouges/orangées
    const brickColors = [
        '#a0533a',
        '#8d4630',
        '#9a5038',
        '#874228',
        '#925541'
    ];
    
    // Fonction pour dessiner une brique avec variations
    const drawBrick = (x, y, width, height) => {
        const margin = 2; // Marge pour le joint
        
        // Choisir une couleur de brique aléatoire
        ctx.fillStyle = brickColors[Math.floor(Math.random() * brickColors.length)];
        ctx.fillRect(x + margin, y + margin, width - margin, height - margin);
        
        // Ajouter des variations de texture (taches plus sombres)
        for (let i = 0; i < 8; i++) {
            const px = x + margin + Math.random() * (width - margin);
            const py = y + margin + Math.random() * (height - margin);
            const size = 2 + Math.random() * 4;
            ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + Math.random() * 0.15})`;
            ctx.fillRect(px, py, size, size);
        }
        
        // Ajouter un léger ombrage en bas pour effet 3D
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x + margin, y + height - margin - 3, width - margin, 2);
        
        // Ajouter un léger reflet en haut
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(x + margin, y + margin, width - margin, 2);
    };
    
    // Première rangée (non décalée)
    drawBrick(0, 0, brickW, brickH);
    drawBrick(brickW + mortarSize, 0, brickW, brickH);
    
    // Deuxième rangée (décalée d'une demi-brique)
    const offsetX = (brickW + mortarSize) / 2;
    const y2 = brickH + mortarSize;
    
    // Brique partielle à gauche
    drawBrick(-offsetX, y2, brickW, brickH);
    // Brique complète au centre
    drawBrick(brickW + mortarSize - offsetX, y2, brickW, brickH);
    // Brique partielle à droite
    drawBrick(2 * (brickW + mortarSize) - offsetX, y2, brickW, brickH);
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
}

// Matériau pour le bâtiment avec texture de briques
const brickTexture = makeBrickTexture();
brickTexture.repeat.set(10, 8); // Répéter la texture sur le bâtiment
const buildingMaterial = new THREE.MeshStandardMaterial({
    map: brickTexture,
    roughness: 0.85,
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

// Texture procédurale pour le ciel avec nuages (CanvasTexture)
function makeSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Créer un gradient de ciel (bleu clair en bas, plus foncé en haut)
    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    gradient.addColorStop(0, '#87CEEB');  // Bleu ciel clair (horizon)
    gradient.addColorStop(0.5, '#87CEEB'); // Bleu ciel
    gradient.addColorStop(1, '#6BA3D4');  // Bleu plus foncé (zénith)
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Fonction pour dessiner un nuage duveteux
    const drawCloud = (x, y, scale) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        // Base du nuage avec plusieurs cercles
        const circles = [
            { x: 0, y: 0, r: 40 },
            { x: 30, y: -5, r: 50 },
            { x: 60, y: 0, r: 45 },
            { x: 90, y: 5, r: 40 },
            { x: 25, y: 15, r: 35 },
            { x: 65, y: 18, r: 38 }
        ];
        
        // Ombre légère du nuage
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#000000';
        circles.forEach(circle => {
            ctx.beginPath();
            ctx.arc(circle.x + 5, circle.y + 45, circle.r, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Nuage principal (blanc)
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#ffffff';
        circles.forEach(circle => {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y + 40, circle.r, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Reflets brillants sur le nuage
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#ffffff';
        circles.forEach(circle => {
            ctx.beginPath();
            ctx.arc(circle.x - 10, circle.y + 30, circle.r * 0.4, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    };
    
    // Dessiner plusieurs nuages à différentes positions et tailles
    const clouds = [
        { x: 100, y: 150, scale: 1.2 },
        { x: 400, y: 100, scale: 0.9 },
        { x: 700, y: 180, scale: 1.1 },
        { x: 200, y: 400, scale: 0.8 },
        { x: 600, y: 350, scale: 1.0 },
        { x: 850, y: 250, scale: 0.85 },
        { x: 50, y: 600, scale: 0.95 },
        { x: 500, y: 650, scale: 1.15 },
        { x: 900, y: 700, scale: 0.9 },
        { x: 300, y: 850, scale: 1.05 }
    ];
    
    clouds.forEach(cloud => {
        drawCloud(cloud.x, cloud.y, cloud.scale);
    });
    
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
}

// Créer une skybox (grande sphère englobant la scène)
const skyTexture = makeSkyTexture();
const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({
    map: skyTexture,
    side: THREE.BackSide  // Afficher la texture à l'intérieur de la sphère
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);


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