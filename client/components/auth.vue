<script>
import { mapState } from 'vuex';

export default {
  name: 'Auth',
  data() {
    return {
      isSignup: false,
    };
  },
  computed: {
    ...mapState('user', [
      'isShowingAuth',
    ]),
  },
  watch: {
    isShowingAuth() {
      if (this.isShowingAuth) {
        this.focus();
      }
    },
  },
  methods: {
    hide() {
      this.$store.dispatch('user/hideAuth');
    },
    focus() {
      this.$nextTick(() => {
        this.$refs[this.isSignup ? 'nameInput' : 'emailInput'].focus();
      });
    },
    submit({ target }) {
      const { isSignup } = this;
      const name = target.name && target.name.value;
      const email = target.email.value;
      const password = target.password.value;
      const confirmPassword = target.confirmPassword && target.confirmPassword.value;
      if (isSignup) {
        if (!name || !email || !password) return;
        if (password !== confirmPassword) return;
        this.$store.dispatch('user/signup', { name, email, password });
      } else {
        if (!email || !password) return;
        this.$store.dispatch('user/signin', { email, password });
      }
    },
    swap() {
      this.isSignup = !this.isSignup;
      this.focus();
    },
  },
};
</script>

<template>
  <div
    v-if="isShowingAuth"
    class="auth"
    @click="hide"
  >
    <form
      @click.stop
      @submit.prevent="submit"
    >
      <div
        v-if="isSignup"
        class="field"
      >
        <label>
          Display Name
          <span>
            (Public)
          </span>
        </label>
        <input
          ref="nameInput"
          name="name"
          maxlength="25"
          type="text"
          required
        >
      </div>
      <div class="field">
        <label>
          Email
          <span v-if="isSignup">
            (Private)
          </span>
        </label>
        <input
          ref="emailInput"
          name="email"
          type="email"
          autofocus
          required
        >
      </div>
      <div class="field">
        <label>Password</label>
        <input
          name="password"
          type="password"
          required
        >
      </div>
      <div
        v-if="isSignup"
        class="field"
      >
        <label>Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          required
        >
      </div>
      <div class="submit">
        <button type="submit">
          <span v-if="isSignup">Sign-Up</span>
          <span v-else>Sign-In</span>
        </button>
      </div>
      <div class="alternative">
        <a @click="swap">
          <span v-if="isSignup">I already have an account</span>
          <span v-else>Create an account</span>
        </a>
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
  .auth {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, .5);
    > form {
      background: #333;
      padding: 2rem;
      border: 2px solid #222;
    }
  }
  .field {
    > label {
      display: block;
      > span {
        color: #999;
      }
    }
    > input {
      font-size: 1.5em;
      font-family: inherit;
      color: inherit;
      margin: 0 0 0.25rem;
      padding: 0 1.5rem;
      height: 50px;
      background: transparent;
      border: 2px solid #222;
      outline: 0;
    }
  }
  .submit, .alternative {
    text-align: center;
  }
  .submit {
    margin: 1rem 0;
    > button {
      font-size: 1.5em;
      font-family: inherit;
      color: inherit;
      padding: 0 1.5rem;
      height: 60px;
      background-color: #222;
      border: 2px solid #111;
      outline: 0;
      cursor: pointer;
      transition: background-color ease-out .15s;
      will-change: background-color;
      &:hover {
        background-color: #1a1a1a;
      }
      &[disabled] {
        opacity: .75;
        cursor: default;
      }
    }
  }
  .alternative {
    border-top: 1px solid #222;
    margin: 2rem 0 0;
    padding: 2rem 0 0;
    text-align: center;
    > a {
      color: #bbb;
      text-decoration: none;
      cursor: pointer;
      &:hover {
        color: #fff;
      }
    }
  }
</style>
