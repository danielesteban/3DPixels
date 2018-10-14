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
    title() {
      return __TITLE__;
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
          {{ title }}
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
            <router-link :to="{ name: 'profile', params: { id: profile._id } }">
              Your profile
            </router-link>
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
    display: flex;
    justify-content: center;
    background: #222;
    border-bottom: 2px solid #111;
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
      margin: 0;
      padding: 0 1.5rem;
      border: 0;
      outline: 0;
      cursor: pointer;
      text-decoration: none;
      background-color: transparent;
      transition: background-color ease-out .15s;
      will-change: background-color;
      border-left: 2px solid #111;
      &:last-child {
        border-right: 2px solid #111;
      }
      &:hover {
        background-color: #333;
      }
    }
  }
  .dropdown {
    position: relative;
    height: 100%;
    .toggle {
      display: flex;
      min-width: 120px;
      height: 100%;
      padding: 0 1.5rem;
      justify-content: space-between;
      align-items: center;
      transition: background-color ease-out .15s;
      will-change: background-color;
      border-left: 2px solid #111;
      > i {
        display: block;
        margin-left: 1rem;
        font-style: normal;
        transform: translate(-50%, 0) rotate(90deg);
        transition: transform ease-out .15s;
        will-change: transform;
      }
    }
    &:last-child .toggle {
      border-right: 2px solid #111;
    }
    .content {
      position: absolute;
      top: 100%;
      right: 0;
      width: 100%;
      display: flex;
      flex-direction: column;
      background: #222;
      max-height: 0;
      transition: max-height ease-out .15s;
      will-change: max-height;
      overflow: hidden;
      border: 2px solid #111;
      border-top: 0;
      > a {
        padding: 0.5rem 1rem;
        color: inherit;
        text-decoration: none;
        outline: 0;
        cursor: pointer;
        border-top: 2px solid #111;
        transition: background-color ease-out .15s;
        will-change: background-color;
        &:hover {
          background-color: #333;
        }
      }
    }
    &:hover {
      .toggle {
        background-color: #333;
        > i {
          transform: translate(-50%, 0) rotate(-90deg);
        }
      }
      .content {
        max-height: 6rem;
      }
    }
  }
</style>
