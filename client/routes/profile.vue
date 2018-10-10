<script>
import moment from 'moment';
import { mapState } from 'vuex';
import Listing from '../components/listing';
import Pagination from '../components/pagination';

export default {
  name: 'Home',
  components: { Listing, Pagination },
  filters: {
    fromNow(time) {
      return moment(time).fromNow();
    },
  },
  computed: {
    ...mapState('profile', [
      'meshes',
      'meta',
      'pages',
    ]),
    page() {
      const { page } = this.$route.params;
      return parseInt(page || 0, 10);
    },
  },
  mounted() {
    const { id } = this.$route.params;
    this.fetch(id, this.page);
  },
  beforeDestroy() {
    this.reset();
  },
  beforeRouteUpdate(to, from, next) {
    const { id, page } = to.params;
    this.reset();
    this.fetch(id, parseInt(page || 0, 10));
    next();
  },
  methods: {
    fetch(id, page) {
      this.$store.dispatch('profile/fetch', { id, page });
    },
    reset() {
      this.$store.dispatch('profile/reset');
    },
  },
};
</script>

<template>
  <div class="profile">
    <div
      v-if="meta.name"
      class="meta"
    >
      <h1>{{ meta.name }}</h1>
      <p>joined {{ meta.createdAt | fromNow }}</p>
    </div>
    <Listing :meshes="meshes" />
    <Pagination
      :page="page"
      :pages="pages"
      :params="{ id: meta._id }"
      route="profile"
    />
  </div>
</template>

<style lang="scss" scoped>
  .profile {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .meta {
    text-align: center;
    > h1 {
      font-size: 2.5em;
      margin: 4.5rem auto 1.5rem;
    }
    > p {
      font-size: 0.75em;
      margin: 0;
    }
  }
</style>
