import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

export function createUI(world) {
  const gui = new GUI();

  gui.add(world.size, 'width', 8, 128, 1).name('width');
  gui.add(world.size, 'height', 8, 128, 1).name('height');
  gui.add(world, 'generate');

  const terrainFolder = gui.addFolder('Terrain');
  terrainFolder.add(world.params, 'seed', 0, 1000).name('seed');
  terrainFolder.add(world.params.terrain, 'scale', 10, 100).name('scale');
  terrainFolder.add(world.params.terrain, 'magnitude', 0, 1).name('magnitude');
  terrainFolder.add(world.params.terrain, 'offset', 0, 1).name('offset');

  gui.onChange(() => {
    world.generate();
  });
}
