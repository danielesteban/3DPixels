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
          if (frame > 0) this.stepFrame(-1);
          break;
        case 39:
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
    v-if="mesh"
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
        <div>
          &nbsp;Brush:&nbsp;
          <input
            :value="brush"
            type="number"
            min="1"
            max="10"
            @change="setBrush"
          >
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
          :class="{ warning: hasChanged }"
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
          v-if="mesh.texture"
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
            @click="addFrame(true)"
          >
            Clone
          </button>
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
        <div>
          FPS:&nbsp;
          <input
            :value="mesh.fps"
            type="number"
            min="1"
            @change="setFps"
          >
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
    width: 100%;
    padding: 0 2rem;
  }
  .title {
    font-size: 2.5em;
    margin: 2rem auto 2.5rem;
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
    }
  }
  .wrapper, .toolbar {
    max-width: 1280px;
  }
  .wrapper {
    display: flex;
    align-items: center;
    width: 100%;
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
        align-items: center;
      }
      &.single {
        justify-content: flex-end;
      }
    }
    &.bottom > div {
      width: 25%;
    }
    button, input {
      margin: 0 0.1rem;
      padding: 0 1.5rem;
      font-size: 1.5em;
      font-family: inherit;
      height: 50px;
      background-color: #222;
      color: inherit;
      border: 2px solid #111;
      border-top: 0;
      border-bottom: 0;
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
      width: 5rem;
      padding: 0 0.75rem;
      &[type=color] {
        padding: 0;
        cursor: pointer;
      }
    }
  }
</style>
