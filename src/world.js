import * THREE from 'three';


const GEOMETRY = new THREE.BoxGeometry(1, 1, 1);
const MATERIAL = new THREE.MeshLambertMaterial({color: 0x00d000});

export class World extends THREE.Group {
  constructor(size = 32) {
    super();
    this.size = size;
  }

  generate() {
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        const block = new THREE.Mesh(GEOMETRY, MATERIAL);
        block.position.set(x, 0, z);
        this.add(block);
    }
    }
  }
}
