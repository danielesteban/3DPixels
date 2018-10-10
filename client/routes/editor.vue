<script>
import moment from 'moment';
import { Color } from 'three';
import { mapState } from 'vuex';
import Sprite from '../components/sprite';
import Renderer from '../components/renderer';

const auxColor = new Color();
export default {
  name: 'Editor',
  components: { Sprite, Renderer },
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
      <small>
        by
        <router-link
          v-if="mesh.creator"
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
        <div>
          <span>&nbsp;&nbsp;Brush:</span>
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
        </div>
        <div>
          <button
            :class="{ active: tool === 'pick' }"
            @click="setTool('pick')"
          >
            Pick
          </button>
          <input
            :value="color"
            type="color"
            @change="setColor"
          >
        </div>
      </div>
      <div>
        <div>
          <input
            :value="mesh.bg | hexColor"
            type="color"
            @change="setBackground"
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
      <div>
        <div>
          <span>&nbsp;&nbsp;FPS:</span>
          <input
            :value="mesh.fps"
            type="number"
            min="1"
            @change="setFps"
          >
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
    margin: 0 auto 1rem;
    font-size: 0.75em;
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
    font-size: 1.25em;
    > div {
      display: flex;
      justify-content: space-between;
      width: 50%;
      &:first-child {
        border-right: 1px solid #111;
      }
      &:last-child {
        border-left: 1px solid #111;
      }
      > div {
        display: flex;
        align-items: center;
      }
    }
    button, input {
      margin: 0 0.1rem;
      padding: 0 1.5rem;
      font-family: inherit;
      font-size: inherit;
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
      width: 5rem;
      padding: 0 0.75rem;
      &[type=color] {
        padding: 0;
        cursor: pointer;
      }
      &[type=number] {
        width: 3.25rem;
        border-left: 0;
        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      }
    }
    > div > div:first-child {
      button, input {
        &:first-child {
          border-left: 0;
        }
      }
    }
    > div > div:last-child {
      button, input {
        &:last-child {
          border-right: 0;
        }
      }
    }
  }
</style>
