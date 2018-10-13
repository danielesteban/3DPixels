<script>
import Renderer from './renderer';

export default {
  name: 'Pagination',
  components: { Renderer },
  props: {
    page: {
      type: Number,
      default() {
        return 0;
      },
    },
    pages: {
      type: Number,
      required: true,
    },
    params: {
      type: Object,
      default() {
        return {};
      },
    },
    route: {
      type: String,
      required: true,
    },
  },
  methods: {
    getRoute(page) {
      return {
        name: this.route,
        params: { ...this.params, page },
      };
    },
  },
};
</script>

<template>
  <div
    v-if="pages > 1"
    class="pagination"
  >
    <router-link
      v-if="page > 0"
      :to="getRoute(page - 1)"
    >
      &lt;
    </router-link>
    <a
      v-else
      class="disabled"
    >
      &lt;
    </a>
    <span>
      {{ page + 1 }}/{{ pages }}
    </span>
    <router-link
      v-if="page < pages - 1"
      :to="getRoute(page + 1)"
    >
      &gt;
    </router-link>
    <a
      v-else
      class="disabled"
    >
      &gt;
    </a>
  </div>
</template>

<style lang="scss" scoped>
  .pagination {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
    > a, > span {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 50px;
      padding: 0 1rem;
      margin: 0 0.5rem;
      color: inherit;
      text-decoration: none;
      outline: 0;
      cursor: default;
      background-color: #222;
      border: 2px solid #111;
    }
    > a {
      cursor: pointer;
      transition: background-color ease-out .15s, opacity ease-out .15s;
      will-change: background-color, opacity;
      &.active, &:hover {
        background-color: #333;
      }
      &.disabled {
        opacity: .5;
        cursor: default;
        &:hover {
          background-color: #222;
        }
      }
    }
  }
</style>
