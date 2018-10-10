<script>
import { mapState } from 'vuex';
import Listing from '../components/listing';
import Pagination from '../components/pagination';

export default {
  name: 'Home',
  components: { Listing, Pagination },
  computed: {
    ...mapState('home', [
      'meshes',
      'pages',
    ]),
    page() {
      const { page } = this.$route.params;
      return parseInt(page || 0, 10);
    },
  },
  mounted() {
    this.fetch(this.page);
  },
  beforeDestroy() {
    this.reset();
  },
  beforeRouteUpdate(to, from, next) {
    const { page } = to.params;
    this.reset();
    this.fetch(parseInt(page || 0, 10));
    next();
  },
  methods: {
    fetch(page) {
      this.$store.dispatch('home/fetch', page);
    },
    reset() {
      this.$store.dispatch('home/reset');
    },
  },
};
</script>

<template>
  <div class="home">
    <Listing :meshes="meshes" />
    <Pagination
      :page="page"
      :pages="pages"
      route="home"
    />
  </div>
</template>

<style lang="scss" scoped>
  .home {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
