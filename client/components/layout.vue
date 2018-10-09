<script>
import Auth from './auth';
import Header from './header';

export default {
  name: 'Layout',
  components: { Auth, Header },
};
</script>

<template>
  <div>
    <Header />
    <router-view />
    <Auth />
  </div>
</template>

<style lang="scss">
  @font-face {
    font-family: 'Print Char 21';
    src: url(../fonts/printchar21.ttf);
  }

  *, *:after, *:before {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: linear-gradient(#555, #333, #555);
    background-attachment: fixed;
    color: #eee;
    text-shadow: rgba(0, 0, 0, .4) 1px 2px;
    font-family: 'Print Char 21';
    font-size: 0.75rem;
    line-height: 1.75rem;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    user-select: none;
    cursor: default;
  }

  canvas {
    vertical-align: middle;
  }

  ::-webkit-scrollbar {
    width: 1rem;
  }
  ::-webkit-scrollbar-track {
    background: rgba(#000, .5);
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(72, 155, 43, .25);
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(72, 155, 43, .5);
  }
</style>
