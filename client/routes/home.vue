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
        <div class="title">
          {{ mesh.title }}
        </div>
        <div class="creator">
          by {{ mesh.creator.name }}
        </div>
        <div class="edit">
          <router-link :to="{ name: 'editor', params: { id: mesh._id } }">
            Edit
          </router-link>
        </div>
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
      align-items: center;
      overflow: hidden;
      .title, .creator, .edit {
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
      .edit {
        display: flex;
        width: 0;
        transition: width ease-out .15s;
        will-change: width;
        > a {
          background: rgba(0, 0, 0, .3);
          padding: 0 0.75rem;
          color: inherit;
          text-decoration: none;
        }
      }
    }
    &:hover .meta .edit {
      width: 66px;
    }
  }
</style>
