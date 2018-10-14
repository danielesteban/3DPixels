<script>
import Auth from './auth';
import Footer from './footer';
import Header from './header';

export default {
  name: 'Layout',
  components: { Auth, Footer, Header },
};
</script>

<template>
  <div>
    <Header />
    <div class="route">
      <router-view />
    </div>
    <Footer />
    <Auth />
  </div>
</template>

<style lang="scss" scoped>
  .route {
    display: flex;
    min-height: calc(100vh - 100px);
  }
</style>

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
    background: rgba(#fff, .25);
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(#fff, .5);
  }
</style>
