import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export function addLights(scene) {
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444455, 0.6);
  const ambient = new THREE.AmbientLight(0xffffff, 0.15);
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(50, 80, -40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(hemi, ambient, sun);
}