<script>
export default {
  name: 'Footer',
  computed: {
    title() {
      return __TITLE__;
    },
    year() {
      return (new Date()).getFullYear();
    },
  },
};
</script>

<template>
  <div class="footer">
    {{ title }}&nbsp;&middot;
    This site is&nbsp;
    <a
      href="https://github.com/danielesteban/3DPixels#readme"
      rel="noopener noreferrer"
      target="_blank"
    >
      free software
    </a>
    &nbsp;&middot;&nbsp;
    <a
      href="https://dani.gatunes.com"
      rel="noopener noreferrer"
      target="_blank"
    >
      dani@gatunes
    </a>
    &nbsp;&copy;&nbsp;{{ year }}
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
    }
  }
</style>
