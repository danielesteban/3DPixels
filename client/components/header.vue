<script>
import { mapState } from 'vuex';

export default {
  name: 'Header',
  computed: {
    ...mapState('user', [
      'isAuth',
      'profile',
    ]),
    isCreating() {
      return this.$route.name === 'editor' && !this.$route.params.id;
    },
  },
  methods: {
    signIn() {
      this.$store.dispatch('user/showAuth');
    },
    signOut() {
      this.$store.dispatch('user/signout');
    },
  },
};
</script>

<template>
  <div class="header">
    <div>
      <div class="nav">
        <router-link :to="{ name: 'home' }">
          3DPixels
        </router-link>
      </div>
      <div class="actions">
        <router-link
          v-if="!isCreating"
          :to="{ name: 'editor' }"
        >
          Create
        </router-link>
        <div
          v-if="isAuth"
          class="dropdown"
        >
          <div class="toggle">
            {{ profile.name }}
            <i>&gt;</i>
          </div>
          <div class="content">
            <a @click="signOut">Sign-Out</a>
          </div>
        </div>
        <button
          v-else
          @click="signIn"
        >
          Sign-In
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .header {
    background: #222;
    display: flex;
    justify-content: center;
    > div {
      max-width: 1600px;
      padding: 0 1.75rem;
      width: 100%;
      height: 50px;
      display: flex;
      justify-content: space-between;
      > div {
        display: flex;
        align-items: center;
      }
    }
  }
  .nav > a {
    display: flex;
    align-items: center;
    height: 100%;
    color: inherit;
    text-decoration: none;
    outline: 0;
  }
  .actions {
    > a, > button {
      font-family: inherit;
      font-size: inherit;
      color: inherit;
      display: flex;
      align-items: center;
      height: 100%;
      margin-left: 0.25rem;
      padding: 0 1.5rem;
      border: 0;
      outline: 0;
      cursor: pointer;
      text-decoration: none;
      background-color: #333;
      transition: background-color ease-out .15s;
      will-change: background-color;
      &:hover {
        background-color: #111;
      }
    }
  }
  .dropdown {
    position: relative;
    margin-left: 0.25rem;
    height: 100%;
    .toggle {
      display: flex;
      min-width: 120px;
      height: 100%;
      padding: 0 1.5rem;
      justify-content: space-between;
      align-items: center;
      background-color: #333;
      transition: background-color ease-out .15s;
      will-change: background-color;
      > i {
        display: block;
        margin-left: 1rem;
        font-style: normal;
        transform: translate(-50%, 0) rotate(90deg);
        will-change: transform;
      }
    }
    .content {
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      width: 100%;
      flex-direction: column;
      background: rgba(0, 0, 0, .75);
      > a {
        padding: 0.5rem 1rem;
        cursor: pointer;
      }
    }
    &:hover {
      .toggle {
        background-color: #111;
        > i {
          transform: translate(-50%, 0) rotate(-90deg);
        }
      }
      .content {
        display: flex;
      }
    }
  }
</style>
