<script>
import moment from 'moment';
import { Color } from 'three';
import { mapState } from 'vuex';
import Frames from '../components/frames';
import Sprite from '../components/sprite';
import Renderer from '../components/renderer';

const auxColor = new Color();
export default {
  name: 'Editor',
  components: { Frames, Sprite, Renderer },
  filters: {
    fromNow(time) {
      return moment(time).fromNow();
    },
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
      'brush',
      'color',
      'frame',
      'frames',
      'hasChanged',
      'isEditingTitle',
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
    window.addEventListener('keydown', this.onKeyDown, false);
    const { id } = this.$route.params;
    if (!id) {
      this.create();
      return;
    }
    this.fetch(id);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    this.reset();
  },
  beforeRouteUpdate(to, from, next) {
    const { id } = to.params;
    this.reset();
    if (!id) this.create();
    else this.fetch(id);
    next();
  },
  methods: {
    create() {
      this.$store.dispatch('editor/create');
    },
    fetch(id) {
      this.$store.dispatch('editor/fetch', id);
    },
    fullscreen() {
      this.$emit('fullscreen');
    },
    editTitle() {
      if (!this.isCreator) return;
      this.$store.dispatch('editor/editTitle');
      this.$nextTick(() => {
        const { titleInput } = this.$refs;
        titleInput.select();
        titleInput.focus();
      });
    },
    onColor(color) {
      this.$store.dispatch('editor/setColor', color);
      this.setTool('paint');
    },
    onFrames(frames) {
      this.$store.dispatch('editor/setFrames', frames);
    },
    onKeyDown({ keyCode, repeat, target }) {
      if (repeat || target.tagName === 'INPUT') return;
      const { frame, frames } = this;
      switch (keyCode) {
        case 37:
        case 38:
          if (frame > 0) this.stepFrame(-1);
          break;
        case 39:
        case 40:
          if (frame < frames - 1) this.stepFrame(1);
          break;
        case 49:
          this.setTool('paint');
          break;
        case 50:
          this.setTool('erase');
          break;
        case 51:
          this.setTool('pick');
          break;
        default:
          break;
      }
    },
    onTexture(texture) {
      this.$store.dispatch('editor/setTexture', texture);
    },
    onTitleInputKeydown({ keyCode, repeat, target }) {
      if (keyCode === 13 && !repeat) {
        this.setTitle({ target });
      }
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
    addFrame(clone) {
      this.$emit('addFrame', clone);
    },
    removeFrame() {
      this.$emit('removeFrame');
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
    setBrush({ target: { value } }) {
      this.$store.dispatch(
        'editor/setBrush',
        Math.min(Math.max(parseInt(value, 10), 1), 10)
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
    v-if="mesh.texture"
    class="editor"
  >
    <div class="title">
      <input
        v-if="isEditingTitle"
        ref="titleInput"
        :value="mesh.title"
        maxlength="25"
        type="text"
        @keydown="onTitleInputKeydown"
        @blur="setTitle"
      >
      <span
        v-else
        @click="editTitle()"
      >
        {{ mesh.title }}
      </span>
      <small v-if="mesh.creator">
        by
        <router-link
          :to="{ name: 'profile', params: { id: mesh.creator._id } }"
        >
          {{ mesh.creator.name }}
        </router-link>
      </small>
    </div>
    <div class="meta">
      created {{ mesh.createdAt | fromNow }}
    </div>
    <div class="toolbar">
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
      <div>
        <label>FPS:</label>
        <input
          :value="mesh.fps"
          type="number"
          min="1"
          @change="setFps"
        >
      </div>
      <div>
        <button
          :class="{ warning: hasChanged }"
          :disabled="mesh._id && isCreator && !hasChanged"
          @click="save()"
        >
          <span v-if="isCreator">
            Save
          </span>
          <span v-else>
            Save as copy
          </span>
        </button>
      </div>
    </div>
    <div class="wrapper">
      <div>
        <Sprite
          :background="mesh.bg"
          :brush="brush"
          :color="color"
          :frame="frame"
          :texture="mesh.texture"
          :tool="tool"
          @color="onColor"
          @frames="onFrames"
          @texture="onTexture"
        />
      </div>
      <div class="frames">
        <Frames
          :background="mesh.bg"
          :current="frame"
          :texture="mesh.texture"
        />
      </div>
      <Renderer
        :mesh="mesh"
      />
    </div>
    <div class="toolbar">
      <div>
        <input
          :value="color"
          type="color"
          @change="setColor"
        >
        <input
          :value="mesh.bg | hexColor"
          type="color"
          @change="setBackground"
        >
        <label>Brush:</label>
        <input
          :value="brush"
          type="number"
          min="1"
          max="10"
          @change="setBrush"
        >
      </div>
      <div>
        <button
          @click="addFrame()"
        >
          &plus;
        </button>
        <button
          @click="addFrame(true)"
        >
          Clone
        </button>
        <button
          :disabled="frames <= 1"
          @click="removeFrame()"
        >
          &times;
        </button>
      </div>
      <div>
        <button
          @click="fullscreen"
        >
          Fullscreen
        </button>
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
    width: 100%;
    padding: 0 2rem;
  }
  .title {
    font-size: 2.5em;
    margin: 2rem auto 1rem;
    > input {
      width: 500px;
      margin: 0;
      padding: 0 1.5rem;
      font-family: inherit;
      color: inherit;
      font-size: inherit;
      height: 50px;
      background-color: #222;
      border: 2px solid #111;
      outline: 0;
    }
    > small {
      font-size: 0.75em;
      > a {
        color: inherit;
        text-decoration: none;
        outline: 0;
      }
    }
  }
  .meta {
    margin: 0 auto 1.5rem;
    font-size: 0.75em;
  }
  .wrapper, .toolbar {
    max-width: 1400px;
    width: 100%;
  }
  .wrapper {
    display: flex;
    border-left: 2px solid #111;
    border-right: 2px solid #111;
    > div {
      width: calc(50% - 100px);
      &.frames {
        position: relative;
        width: 200px;
      }
    }
  }
  .toolbar {
    display: flex;
    background: #222;
    font-size: 1.25em;
    border-top: 2px solid #111;
    border-bottom: 2px solid #111;
    > div {
      display: flex;
      align-items: center;
      width: (100% / 3);
      &:nth-child(2) {
        justify-content: center;
      }
      &:nth-child(3) {
        justify-content: flex-end;
      }
    }
    button, input, label {
      margin: 0;
      padding: 0 1.5rem;
      font-family: inherit;
      font-size: inherit;
      height: 50px;
      background-color: #222;
      color: inherit;
      border: 0;
      outline: 0;
      border-left: 2px solid #111;
      &:last-child {
        border-right: 2px solid #111;
      }
    }
    button {
      cursor: pointer;
      transition: background-color ease-out .15s, opacity ease-out .15s;
      will-change: background-color, opacity;
      &.active, &:hover {
        background-color: #333;
      }
      &.warning {
        background-color: #822;
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
      &[type=color] {
        width: 5rem;
        padding: 0 0.25rem;
        cursor: pointer;
      }
      &[type=number] {
        width: 6rem;
        border-left: 0;
        &::-webkit-inner-spin-button {
          opacity: 1;
        }
      }
    }
    label {
      display: flex;
      align-items: center;
      padding-right: 0;
    }
  }
</style>
