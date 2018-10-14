<script>
import {
  Color,
} from 'three';

const auxColor = new Color();
const SIZE = __SIZE__;

export default {
  name: 'Frames',
  props: {
    background: {
      type: Number,
      required: true,
    },
    current: {
      type: Number,
      required: true,
    },
    texture: {
      type: ArrayBuffer,
      required: true,
    },
  },
  data() {
    return {
      frames: [],
    };
  },
  computed: {
    backgroundStyle() {
      auxColor.set(this.background);
      auxColor.offsetHSL(0, 0, -0.1);
      return { backgroundColor: `#${auxColor.getHexString()}` };
    },
  },
  watch: {
    texture() {
      this.load();
    },
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      const img = new Image();
      const renderer = document.createElement('canvas');
      const ctx = renderer.getContext('2d');
      img.onload = () => {
        this.frames = [...Array(Math.floor(img.width / SIZE))].map((v, frame) => {
          renderer.width = SIZE;
          renderer.height = SIZE;
          ctx.drawImage(img, frame * SIZE, 0, SIZE, SIZE, 0, 0, SIZE, SIZE);
          return renderer.toDataURL('image/png');
        });
      };
      const blob = new Blob([this.texture], { type: 'image/png' });
      img.src = URL.createObjectURL(blob);
    },
    setFrame(index) {
      this.$store.dispatch('editor/setFrame', index);
    },
  },
};
</script>

<template>
  <div class="frames">
    <img
      v-for="(frame, index) in frames"
      :key="`${index}:${frame}`"
      :class="{ active: current === index }"
      :src="frame"
      :style="backgroundStyle"
      @click="setFrame(index)"
      @mousedown.prevent
    >
  </div>
</template>

<style lang="scss" scoped>
  .frames {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    padding: 1rem 0 1rem 1rem;
    overflow-y: scroll;
    img {
      width: 100%;
      vertical-align: middle;
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
      image-rendering: pixelated;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity ease-out .15s;
      will-change: opacity;
      &.active {
        opacity: 1;
        cursor: default;
      }
    }
  }
</style>
