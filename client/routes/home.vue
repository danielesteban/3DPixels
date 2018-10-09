<script>
import {
  Color,
} from 'three';
import { mapState } from 'vuex';
import Renderer from '../components/renderer';

const auxColor = new Color();
export default {
  name: 'Home',
  components: { Renderer },
  filters: {
    hexColor(int) {
      auxColor.set(int);
      return `#${auxColor.getHexString()}`;
    },
  },
  computed: {
    ...mapState('home', [
      'results',
    ]),
  },
  mounted() {
    this.fetch();
  },
  beforeDestroy() {
    this.reset();
  },
  methods: {
    fetch() {
      this.$store.dispatch('home/fetch');
    },
    reset() {
      this.$store.dispatch('home/reset');
    },
  },
};
</script>

<template>
  <div class="listing">
    <div
      v-for="mesh in results"
      :key="mesh._id"
      class="mesh"
    >
      <Renderer
        :mesh="mesh"
        class="renderer"
      />
      <div
        :style="{ backgroundColor: $options.filters.hexColor(mesh.bg) }"
        class="meta"
      >
        <span>
          {{ mesh.title }}
          <small>
            by {{ mesh.creator.name }}
          </small>
        </span>
        <router-link :to="{ name: 'editor', params: { id: mesh._id } }">
          edit
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .listing {
    display: flex;
    flex-wrap: wrap;
    padding: 1.5rem;
    justify-content: center;
    margin: 0 auto;
    max-width: 1920px;
  }
  .mesh {
    margin: 1.5rem;
    border: 2px solid #222;
    width: 350px;
    .meta {
      display: flex;
      justify-content: space-between;
      border-top: 2px solid #222;
      > span {
        padding-left: 0.75rem;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        > small {
          font-size: 0.75em;
        }
      }
      > a {
        background: rgba(0, 0, 0, .4);
        padding: 0 0.75rem;
        color: inherit;
        text-decoration: none;
        text-transform: uppercase;
        opacity: 0;
        transition: opacity ease-out .2s;
        will-change: opacity;
      }
    }
    &:hover .meta > a {
      opacity: 1;
    }
  }
</style>
