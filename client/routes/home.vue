<script>
import { mapState } from 'vuex';
import Listing from '../components/listing';

export default {
  name: 'Home',
  components: { Listing },
  computed: {
    ...mapState('home', [
      'results',
    ]),
  },
  mounted() {
    this.$store.dispatch('home/fetch');
  },
  beforeDestroy() {
    this.$store.dispatch('home/reset');
  },
};
</script>

<template>
  <Listing :meshes="results" />
</template>
