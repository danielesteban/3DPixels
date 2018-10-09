<script>
import {
  Color,
} from 'three';
import Touches from 'touches';

const SIZE = 64;
const auxColor = new Color();

export default {
  name: 'Sprite',
  props: {
    background: {
      type: Number,
      required: true,
    },
    cloning: {
      type: Boolean,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    frame: {
      type: Number,
      required: true,
    },
    texture: {
      type: ArrayBuffer,
      required: true,
    },
    tool: {
      type: String,
      required: true,
    },
  },
  watch: {
    background() {
      this.render();
    },
    frame() {
      this.render();
      delete this.state.lastPixel;
    },
    tool() {
      delete this.state.lastPixel;
    },
  },
  mounted() {
    const { $refs: { canvas } } = this;
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('resize', this.onResize, false);
    this.onResize();
    this.load();
    this.touches = Touches(window, { filtered: true, target: canvas })
      .on('start', this.onPointerDown)
      .on('move', this.onPointerMove)
      .on('end', this.onPointerUp);
    this.$parent.$on('addFrame', this.addFrame);
    this.$parent.$on('removeFrame', this.removeFrame);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    this.touches.disable();
    this.$parent.$off('addFrame', this.addFrame);
    this.$parent.$off('removeFrame', this.removeFrame);
  },
  methods: {
    addFrame() {
      const {
        cloning,
        frame,
        state,
      } = this;
      const { width, height } = state;
      state.width = width + SIZE;
      state.ctx.putImageData(
        state.pixels,
        0, 0,
        0, 0,
        (frame + 1) * SIZE, height
      );
      state.ctx.putImageData(
        state.pixels,
        SIZE, 0,
        (frame + (cloning ? 0 : 1)) * SIZE, 0,
        width - ((frame + (cloning ? 0 : 1)) * SIZE), height
      );
      state.pixels = state.ctx.getImageData(0, 0, state.width, state.height);
      state.toBuffer().then((buffer) => {
        this.$emit('texture', buffer);
        this.$emit('frames', {
          current: frame + 1,
          total: Math.floor(state.width / SIZE),
        });
      });
    },
    removeFrame() {
      const {
        frame,
        state,
      } = this;
      const { width, height } = state;
      state.width = width - SIZE;
      state.ctx.putImageData(state.pixels, 0, 0, 0, 0, frame * SIZE, height);
      state.ctx.putImageData(
        state.pixels,
        -SIZE, 0,
        (frame + 1) * SIZE, 0,
        width - ((frame + 1) * SIZE), height
      );
      state.pixels = state.ctx.getImageData(0, 0, state.width, state.height);
      state.toBuffer().then((buffer) => {
        this.$emit('texture', buffer);
        this.$emit('frames', {
          current: Math.max(frame - 1, 0),
          total: Math.floor(state.width / SIZE),
        });
      });
      this.render();
    },
    load() {
      const img = new Image();
      img.onload = () => {
        const state = document.createElement('canvas');
        state.width = img.width;
        state.height = img.height;
        state.ctx = state.getContext('2d');
        state.ctx.drawImage(img, 0, 0);
        state.pixels = state.ctx.getImageData(0, 0, state.width, state.height);
        state.toBuffer = () => (
          new Promise(resolve => (
            state.toBlob((blob) => {
              const reader = new FileReader();
              reader.addEventListener('loadend', () => {
                resolve(reader.result);
              });
              reader.readAsArrayBuffer(blob);
            }, 'image/png')
          ))
        );
        this.state = state;
        this.$emit('frames', {
          current: 0,
          total: Math.floor(state.width / SIZE),
        });
        this.render();
      };
      const blob = new Blob([this.texture], { type: 'image/png' });
      img.src = URL.createObjectURL(blob);
    },
    onPointerDown(e, pos) {
      const { $refs: { canvas } } = this;
      if (
        e.target === canvas
        || e.target.parentNode === canvas
      ) {
        this.drawing = true;
        this.onPointerMove(e, pos);
      }
    },
    onPointerMove(e, [x, y]) {
      const {
        $refs: { canvas },
        color,
        frame,
        state,
        tool,
      } = this;
      if (
        !this.drawing
        || x < 0
        || y < 0
        || x >= canvas.width
        || y >= canvas.height
      ) {
        return;
      }
      x = Math.floor(x * SIZE / canvas.width);
      y = Math.floor(y * SIZE / canvas.width);
      const i = ((y * state.width) + (frame * SIZE) + x) * 4;
      if (state.lastPixel === i) {
        return;
      }
      state.lastPixel = i;
      const { pixels: { data: pixels } } = state;
      switch (tool) {
        case 'pick':
          if (pixels[i + 3] >= 0X80) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            auxColor.r = r / 0xFF;
            auxColor.g = g / 0xFF;
            auxColor.b = b / 0xFF;
            this.$emit('color', `#${auxColor.getHexString()}`);
          }
          return;
        case 'erase':
          pixels[i] = 0;
          pixels[i + 1] = 0;
          pixels[i + 2] = 0;
          pixels[i + 3] = 0;
          break;
        default:
          auxColor.set(color);
          {
            const avg = (auxColor.r + auxColor.g + auxColor.b) / 3;
            const entropy = avg * 0.05;
            auxColor.r += (Math.random() * 2 - 1) * entropy;
            auxColor.g += (Math.random() * 2 - 1) * entropy;
            auxColor.b += (Math.random() * 2 - 1) * entropy;
          }
          pixels[i] = auxColor.r * 0xFF;
          pixels[i + 1] = auxColor.g * 0xFF;
          pixels[i + 2] = auxColor.b * 0xFF;
          pixels[i + 3] = 0xFF;
          break;
      }
      state.ctx.putImageData(state.pixels, 0, 0);
      state.toBuffer().then(buffer => this.$emit('texture', buffer));
      this.render();
    },
    onPointerUp() {
      this.drawing = false;
    },
    onResize() {
      const { $refs: { canvas } } = this;
      const { width } = canvas.parentNode.getBoundingClientRect();
      canvas.width = width;
      canvas.height = width;
      this.render();
    },
    render() {
      if (!this.state) return;
      const {
        background,
        $refs: { canvas },
        frame,
        state,
      } = this;
      canvas.width = canvas.width;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      auxColor.set(background);
      auxColor.offsetHSL(0, 0, -0.1);
      ctx.fillStyle = `#${auxColor.getHexString()}`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const scale = canvas.width / SIZE;
      ctx.scale(scale, scale);
      ctx.drawImage(state, frame * SIZE, 0, SIZE, SIZE, 0, 0, SIZE, SIZE);
      ctx.beginPath();
      for (let x = 0; x <= SIZE; x += 1) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, SIZE);
      }
      for (let y = 0; y <= SIZE; y += 1) {
        ctx.moveTo(0, y);
        ctx.lineTo(SIZE, y);
      }
      ctx.lineWidth = 0.1;
      ctx.strokeStyle = 'rgba(0, 0, 0, .1)';
      ctx.stroke();
    },
  },
};
</script>

<template>
  <canvas ref="canvas" />
</template>
