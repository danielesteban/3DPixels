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
      <div class="renderer">
        <Renderer
          :mesh="mesh"
          class="renderer"
        />
      </div>
      <router-link
        :style="{ backgroundColor: $options.filters.hexColor(mesh.bg) }"
        :to="{ name: 'editor', params: { id: mesh._id } }"
        class="meta"
      >
        <span class="title">
          {{ mesh.title }}
        </span>
        <span class="creator">
          by {{ mesh.creator.name }}
        </span>
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .listing {
    display: flex;
    flex-wrap: wrap;
    padding: 1.5rem;
    justify-content: center;
    align-items: flex-start;
    margin: 0 auto;
    max-width: 1648px;
  }
  .mesh {
    margin: 1.5rem;
    border: 2px solid #222;
    width: 350px;
    .meta {
      display: flex;
      align-items: center;
      color: inherit;
      text-decoration: none;
      overflow: hidden;
      .title, .creator {
        white-space: nowrap;
      }
      .title {
        flex-grow: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding-left: 0.75rem;
      }
      .creator {
        font-size: 0.75em;
        padding: 0 0.75rem 0 0.5rem;
      }
    }
  }
</style>
