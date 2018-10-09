<script>
export default {
  name: 'Footer',
  computed: {
    year() {
      return (new Date()).getFullYear();
    },
  },
};
</script>

<template>
  <div class="footer">
    3DPixels &middot;&nbsp;
    <a
      href="https://dani.gatunes.com"
      rel="noopener noreferrer"
      target="_blank"
    >
      dani@gatunes
    </a>
    &nbsp;&copy; {{ year }}
  </div>
</template>

<style lang="scss" scoped>
  .footer {
    display: flex;
    justify-content: center;
    font-size: 0.75em;
    margin-bottom: 1rem;
    color: #ccc;
    > a {
      color: inherit;
      text-decoration: none;
    }
  }
</style>
