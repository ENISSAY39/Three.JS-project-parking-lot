import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export function createParking(scene, material) {
  // sol
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), material);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // groupe parking
  const parking = new THREE.Group();
  scene.add(parking);

  const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const placeW = 2.4, placeL = 5, spacingX = 3.2, spacingZ = 6;
  const rows = 4, cols = 10, startZ = -10;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = -((cols - 1) / 2) * spacingX + c * spacingX;
      const z = startZ + r * spacingZ;

      const left = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, placeL), lineMat);
      left.position.set(x - placeW / 2, 0.02, z);
      parking.add(left);

      const right = left.clone();
      right.position.x = x + placeW / 2;
      parking.add(right);

      const front = new THREE.Mesh(new THREE.BoxGeometry(placeW, 0.02, 0.06), lineMat);
      front.position.set(x, 0.02, z - placeL / 2);
      parking.add(front);
    }
  }
  return { ground, parking };
}
