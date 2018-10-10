import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  VertexColors,
} from 'three';
import Mesher from '../mesher';

class Actor extends Mesh {
  constructor({ _id, fps, texture }) {
    super(
      new BufferGeometry(),
      new MeshBasicMaterial({
        vertexColors: VertexColors,
      })
    );

    this.fps = fps;
    this.frame = 0;
    this.lastTick = 0;
    this.visible = false;

    this.load(texture || _id);
  }

  load(texture) {
    Mesher.mesh(texture)
      .then(({
        position,
        color,
        index,
        frames,
      }) => {
        this.frames = frames;
        this.frame = Math.min(this.frame, frames.length - 1);
        const frame = frames[this.frame];
        if (this.geometry) this.geometry.dispose();
        const geometry = new BufferGeometry();
        geometry.setDrawRange(frame.start, frame.count);
        geometry.setIndex(new BufferAttribute(index, 1));
        geometry.addAttribute('position', new BufferAttribute(position, 3));
        geometry.addAttribute('color', new BufferAttribute(color, 3));
        this.geometry = geometry;
        this.visible = true;
      });
  }

  onBeforeRender({ animationTime }) {
    const {
      fps,
      frames,
      lastTick,
    } = this;
    if (frames.length > 1 && frames && animationTime - lastTick >= (1 / fps)) {
      this.lastTick = animationTime;
      this.frame = (this.frame + 1) % frames.length;
      const frame = frames[this.frame];
      this.geometry.setDrawRange(frame.start, frame.count);
    }
  }
}

export default Actor;
