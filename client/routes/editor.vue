<script>
import {
  Color,
} from 'three';
import { mapState } from 'vuex';
import Sprite from '../components/sprite';
import Renderer from '../components/renderer';

const auxColor = new Color();
export default {
  name: 'Editor',
  components: { Sprite, Renderer },
  filters: {
    hexColor(int) {
      auxColor.set(int);
      return `#${auxColor.getHexString()}`;
    },
    intColor(hex) {
      auxColor.set(hex);
      return auxColor.getHex();
    },
  },
  computed: {
    ...mapState('editor', [
      'color',
      'frame',
      'frames',
      'mesh',
      'tool',
    ]),
    ...mapState('user', [
      'isAuth',
      'profile',
    ]),
    isCreator() {
      return (
        !this.mesh._id
        || (
          this.isAuth
          && this.mesh.creator
          && this.mesh.creator._id === this.profile._id
        )
      );
    },
  },
  watch: {
    'mesh._id': function watchID() {
      const { mesh: { _id: id } } = this;
      if (id) {
        this.$router.replace({ name: 'editor', params: { id } });
      }
    },
  },
  mounted() {
    const { id } = this.$route.params;
    if (!id) {
      this.create();
      return;
    }
    this.fetch(id);
  },
  beforeDestroy() {
    this.reset();
  },
  methods: {
    create() {
      this.$store.dispatch('editor/create');
    },
    fetch(id) {
      this.$store.dispatch('editor/fetch', id);
    },
    onColor(color) {
      this.$store.dispatch('editor/setColor', color);
    },
    onFrames(frames) {
      this.$store.dispatch('editor/setFrames', frames);
    },
    onTexture(texture) {
      this.$store.dispatch('editor/setTexture', texture);
    },
    reset() {
      this.$store.dispatch('editor/reset');
    },
    addFrame() {

    },
    removeFrame() {

    },
    stepFrame(inc) {
      this.$store.dispatch('editor/stepFrame', inc);
    },
    setBackground({ target: { value } }) {
      this.$store.dispatch(
        'editor/setBackground',
        this.$options.filters.intColor(value)
      );
    },
    setColor({ target: { value } }) {
      this.onColor(value);
    },
    setFps({ target: { value } }) {
      this.$store.dispatch(
        'editor/setFPS',
        Math.max(parseInt(value, 10), 1)
      );
    },
    setTitle({ target: { value } }) {
      this.$store.dispatch('editor/setTitle', value);
    },
    save() {
      this.$store.dispatch(!this.isAuth ? (
        'user/showAuth'
      ) : (
        'editor/save'
      ));
    },
    swapTool() {
      let tool;
      switch (this.tool) {
        case 'paint':
          tool = 'erase';
          break;
        case 'erase':
          tool = 'pick';
          break;
        default:
          tool = 'paint';
          break;
      }
      this.$store.dispatch('editor/setTool', tool);
    },
  },
};
</script>

<template>
  <div
    v-if="mesh"
    class="editor"
  >
    <div class="title">
      {{ mesh.title }}
      <small v-if="mesh.creator">
        by {{ mesh.creator.name }}
      </small>
    </div>
    <div class="wrapper">
      <div>
        <Sprite
          v-if="mesh.texture"
          :color="color"
          :frame="frame"
          :texture="mesh.texture"
          :tool="tool"
          @color="onColor"
          @frames="onFrames"
          @texture="onTexture"
        />
        <div class="controls">
          <div>
            <input
              :value="color"
              type="color"
              @change="setColor"
            >
            <button
              @click="swapTool()"
            >
              {{ tool }}
            </button>
          </div>
          <div>
            <button
              :disabled="frame <= 0"
              @click="stepFrame(-1)"
            >
              &nbsp;&laquo;&nbsp;
            </button>
            <button
              :disabled="frame >= frames - 1"
              @click="stepFrame(1)"
            >
              &nbsp;&raquo;&nbsp;
            </button>
          </div>
          <div>
            <button
              @click="addFrame()"
            >
              &plus;
            </button>
            <button
              :disabled="frames <= 1"
              @click="removeFrame()"
            >
              &times;
            </button>
          </div>
        </div>
      </div>
      <div>
        <Renderer
          v-if="mesh.texture"
          :mesh="mesh"
        />
        <div class="controls">
          <div>
            <input
              :value="mesh.bg | hexColor"
              type="color"
              @change="setBackground"
            >
            <input
              :value="mesh.fps"
              type="number"
              min="1"
              @change="setFps"
            >
          </div>
          <div>
            <button
              @click="save()"
            >
              <span v-if="isCreator">
                Save
              </span>
              <span v-else>
                Save copy
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .editor {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 100px);
    padding: 0 2rem;
  }
  .title {
    font-size: 2.5em;
    margin: 2rem auto;
  }
  .wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 1280px;
    > div {
      width: 50%;
    }
  }
  .controls {
    padding: 1rem 0 2rem;
    justify-content: space-between;
    &, > div {
      display: flex;
    }
    button, input {
      margin: 0 0.25rem;
      padding: 0 1.5rem;
      font-size: 1.5em;
      font-family: inherit;
      height: 50px;
      background: #222;
      color: inherit;
      border: 2px solid #111;
      outline: 0;
    }
    button {
      cursor: pointer;
      text-transform: capitalize;
      &[disabled] {
        opacity: .75;
        cursor: default;
      }
    }
    input {
      width: 5rem;
      padding: 0 0.75rem;
      &[type=color] {
        padding: 0;
        cursor: pointer;
      }
    }
  }
</style>
