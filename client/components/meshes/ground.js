import {
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
} from 'three';

class Ground extends Mesh {
  constructor() {
    const geometry = new PlaneBufferGeometry(1, 1);
    geometry.rotateX(Math.PI * -0.5);
    geometry.translate(0, -0.001, 0);
    super(
      geometry,
      new MeshBasicMaterial()
    );
    this.scale.set(512, 1, 512);
  }
}

export default Ground;
