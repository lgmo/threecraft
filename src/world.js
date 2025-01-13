import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { RNG } from './rng';
import { blocks, idToBlock } from './blocks';


const GEOMETRY = new THREE.BoxGeometry(1, 1, 1);
const MATERIAL = new THREE.MeshLambertMaterial();

export class World extends THREE.Group {
  /**
    * @type {{
    *   id: number,
    *   instanceId: number
    * }[][][]}
    */
  data = [];

  params = {
    seed: 0,
    terrain: {
      scale: 30,
      magnitude: 0.5,
      offset: 0.2,
    }
  };

  constructor(size = { width: 64, height: 32}, ) {
    super();
    this.size = size;
  }

  /**
    * Generate the world data and meshes
    */
  generate() {
    this.generateTerrain();
    this.generateMeshes();
  }

  
  /**
    * Initializing the world terrain data 
    */
  initializeTerrain() {
    this.data = [];
    for (let x = 0; x < this.size.width; x++) {
      let slice = [];
      for (let y = 0; y < this.size.height; y++) {
        let row = [];
        for (let z = 0; z < this.size.width; z++) {
          row.push({
            id: blocks.empty.id,
            instanceId: null,
          })
        }
        slice.push(row);
      }
      this.data.push(slice);
    }
  }

  /**
    * Initializing the world terrain data 
    */
  generateTerrain() {
    this.initializeTerrain();
    const rng = new RNG(this.params.seed);
    const simplex = new SimplexNoise(rng);

    for (let x = 0; x < this.size.width; x++) {
      for (let z = 0; z < this.size.width; z++) {
        const value = simplex.noise(
          x / this.params.terrain.scale,
          z / this.params.terrain.scale,
        );

        const scaledNoise = this.params.terrain.offset +
          this.params.terrain.magnitude * value;

        let height = Math.floor(this.size.height * scaledNoise);
        height = Math.max(0, Math.min(height, this.size.height - 1));
        for (let y = 0; y < this.size.height; y++) {
          if (y < height) {
            this.setBlockId(x, y, z, blocks.dirt.id);
          } else if  (y === height) {
            this.setBlockId(x, y, z, blocks.grass.id);
          } else {
            this.setBlockId(x, y, z, blocks.empty.id);
          }
        }
      }
    }
  }

  /**
    * Generate 3D representation of the world from world data
    */
  generateMeshes() {
    this.clear();

    const meshCount = this.size.width * this.size.height * this.size.width;
    const mesh = new THREE.InstancedMesh(GEOMETRY, MATERIAL, meshCount);
    mesh.count = 0;

    const matrix = new THREE.Matrix4();
    for (let x = 0; x < this.size.width; x++) {
      for (let y = 0; y < this.size.height; y++) {
        for (let z = 0; z < this.size.width; z++) {
          const blockId = this.getBlock(x, y, z).id;
          const instanceId = mesh.count;

          if (blockId !== 0 && !this.isBlockObscured(x, y, z)) {
            matrix.setPosition(x + 0.5, y + 0.5, z + 0.5);
            mesh.setMatrixAt(instanceId, matrix);
            mesh.setColorAt(instanceId, new THREE.Color(idToBlock[blockId].color));
            this.setBlockInstanceId(x, y, z, instanceId);
            mesh.count++;
          }
        }
      }
    }

    this.add(mesh);
  }

  /**
    * Gets the block data at (x, y, z)
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @returns {{id: number, instanceId: number}}
    */
  getBlock(x, y, z) {
    if (this.inBounds(x, y, z)) {
      return this.data[x][y][z];
    }
    return null;
  }


  /**
    * Sets id for the block at (x, y, z)
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @param {number} id
    */
  setBlockId(x, y, z, id) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].id = id;
    }
  }

  /**
    * Sets instance id for the block at (x, y, z)
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @param {number} instanceId
    */
  setBlockInstanceId(x, y, z, instanceId) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].instanceId = instanceId;
    }
  }

  /**
    * Checks if the  (x, y, z) coordinates are within bounds
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @returns {boolean}
    */
  inBounds(x, y, z) {
    const condition = x >= 0 && x < this.size.width &&
                      y >= 0 && y < this.size.height &&
                      z >= 0 && z < this.size.width
    if (condition) {
      return true;
    }
    return false;
  }

  /**
    * Checks if the block at coordinates (x, y, z) is visible
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @returns {boolean}
    */
  isBlockObscured(x, y, z) {
    const up = this.getBlock(x, y + 1, z)?.id ?? blocks.empty.id;
    const down = this.getBlock(x, y - 1, z)?.id ?? blocks.empty.id;
    const left = this.getBlock(x - 1, y, z)?.id ?? blocks.empty.id;
    const right = this.getBlock(x + 1, y, z)?.id ?? blocks.empty.id;
    const front = this.getBlock(x, y, z + 1)?.id ?? blocks.empty.id;
    const back = this.getBlock(x, y, z - 1)?.id ?? blocks.empty.id;

    const emptyId = blocks.empty.id
    const condition = up === emptyId || down === emptyId || 
                      left === emptyId || right === emptyId || 
                      front === emptyId || back === emptyId;

    if (condition) {
      return false
    }

    return true;
  }

}
