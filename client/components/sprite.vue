<script>
import {
  Color,
} from 'three';
import Touches from 'touches';

const SIZE = 32;
const auxColor = new Color();

export default {
  name: 'Sprite',
  props: {
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
    frame() {
      this.render();
      delete this.lastPixel;
    },
    tool() {
      delete this.lastPixel;
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
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    this.touches.disable();
  },
  methods: {
    load() {
      const img = new Image();
      img.onload = () => {
        const image = document.createElement('canvas');
        image.width = img.width;
        image.height = img.height;
        image.ctx = image.getContext('2d');
        image.ctx.drawImage(img, 0, 0);
        image.pixels = image.ctx.getImageData(0, 0, image.width, image.height);
        this.image = image;
        this.$emit('frames', Math.floor(image.width / SIZE));
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
        image,
        lastPixel,
        tool,
      } = this;
      if (this.drawing) {
        if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
          return;
        }
        x = Math.floor(x * SIZE / canvas.width);
        y = Math.floor(y * SIZE / canvas.width);
        const i = ((y * image.width) + (frame * SIZE) + x) * 4;
        if (lastPixel === i) {
          return;
        }
        this.lastPixel = i;
        const { pixels: { data: pixels } } = image;
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
            pixels[i] = auxColor.r * 0xFF;
            pixels[i + 1] = auxColor.g * 0xFF;
            pixels[i + 2] = auxColor.b * 0xFF;
            pixels[i + 3] = 0xFF;
            break;
        }
        image.ctx.putImageData(image.pixels, 0, 0);
        image.toBlob((blob) => {
          const reader = new FileReader();
          reader.addEventListener('loadend', () => {
            this.$emit('texture', reader.result);
          });
          reader.readAsArrayBuffer(blob);
        }, 'image/png');
        this.render();
      }
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
      if (!this.image) return;
      const { $refs: { canvas }, frame, image } = this;
      canvas.width = canvas.width;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const scale = canvas.width / SIZE;
      ctx.scale(scale, scale);
      ctx.drawImage(image, frame * SIZE, 0, SIZE, SIZE, 0, 0, SIZE, SIZE);
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
