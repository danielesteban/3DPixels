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
      this.setTool('paint');
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
    save() {
      this.$store.dispatch(!this.isAuth ? (
        'user/showAuth'
      ) : (
        'editor/save'
      ));
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
    setTool(tool) {
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
    <div class="toolbar">
      <div>
        <div>
          <button
            :class="{ active: tool === 'paint' }"
            @click="setTool('paint')"
          >
            Paint
          </button>
          <button
            :class="{ active: tool === 'erase' }"
            @click="setTool('erase')"
          >
            Erase
          </button>
          <button
            :class="{ active: tool === 'pick' }"
            @click="setTool('pick')"
          >
            Pick
          </button>
        </div>
        <input
          :value="color"
          type="color"
          @change="setColor"
        >
      </div>
      <div>
        <input
          :value="mesh.bg | hexColor"
          type="color"
          @change="setBackground"
        >
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
    <div class="wrapper">
      <div>
        <Sprite
          v-if="mesh.texture"
          :background="mesh.bg | hexColor"
          :color="color"
          :frame="frame"
          :texture="mesh.texture"
          :tool="tool"
          @color="onColor"
          @frames="onFrames"
          @texture="onTexture"
        />
      </div>
      <div>
        <Renderer
          v-if="mesh.texture"
          :mesh="mesh"
        />
      </div>
    </div>
    <div class="toolbar">
      <div>
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
      <div class="single">
        <input
          :value="mesh.fps"
          type="number"
          min="1"
          @change="setFps"
        >
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
  .toolbar {
    display: flex;
    width: 100%;
    background: #222;
    > div {
      display: flex;
      justify-content: space-between;
      width: 50%;
      > div {
        display: flex;
      }
      &.single {
        justify-content: center;
      }
    }
    &.bottom > div {
      width: 25%;
    }
    .end {
      justify-self: flex-end;
    }
    button, input {
      margin: 0 0.25rem;
      padding: 0 1.5rem;
      font-size: 1.5em;
      font-family: inherit;
      height: 50px;
      background-color: #222;
      color: inherit;
      border: 2px solid #111;
      outline: 0;
      &:first-child {
        margin-left: 0;
      }
      &:last-child {
        margin-right: 0;
      }
    }
    button {
      cursor: pointer;
      transition: background-color ease-out .15s, opacity ease-out .15s;
      will-change: background-color, opacity;
      &.active, &:hover {
        background-color: #111;
      }
      &[disabled] {
        opacity: .5;
        cursor: default;
        &:hover {
          background-color: #222;
        }
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
