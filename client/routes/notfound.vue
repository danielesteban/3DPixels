<script>
export default {
  name: 'NotFound',
};
</script>

<template>
  <div class="notfound">
    <h1>404 - Not found</h1>
    <router-link
      :to="{ name: 'home' }"
    >
      &laquo; Go to home
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
  .notfound {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    > a {
      color: inherit;
    }
  }
</style>
