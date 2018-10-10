<script>
import moment from 'moment';
import { mapState } from 'vuex';
import Listing from '../components/listing';

export default {
  name: 'Home',
  components: { Listing },
  filters: {
    fromNow(time) {
      return moment(time).fromNow();
    },
  },
  computed: {
    ...mapState('profile', [
      'meshes',
      'meta',
    ]),
  },
  mounted() {
    const { id } = this.$route.params;
    this.$store.dispatch('profile/fetch', id);
  },
  beforeDestroy() {
    this.$store.dispatch('home/reset');
  },
};
</script>

<template>
  <div class="profile">
    <div class="meta">
      <h1>{{ meta.name }}</h1>
      <p>joined {{ meta.createdAt | fromNow }}</p>
    </div>
    <Listing :meshes="meshes" />
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
