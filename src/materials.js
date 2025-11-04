import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export const Materials = {
  Asphalt_Basic: new THREE.MeshBasicMaterial({ color: 0x333333 }),
  Asphalt_Lambert: new THREE.MeshLambertMaterial({ color: 0x333333 }),
  Asphalt_Standard: new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.9,
    metalness: 0.1,
  }),
  Asphalt_Wet_Physical: new THREE.MeshPhysicalMaterial({
    color: 0x333333,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
  }),
};
