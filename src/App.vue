<template>
  <div :class="['app', theme]">
    <header>
      <h1>数独游戏</h1>
      <ThemeSwitcher :theme="theme" @changeTheme="changeTheme" />
      <div class="user-bar">
        <span v-if="user">欢迎，{{ user }}</span>
        <button v-if="!user" @click="showLogin = true">登录/注册</button>
        <button v-if="user" @click="logout">登出</button>
      </div>
    </header>
    <main>
      <SudokuGame :user="user" @finishGame="onFinishGame" />
      <RankBoard :user="user" :difficulty="difficulty" />
    </main>
    <LoginModal v-if="showLogin" @login="onLogin" @close="showLogin = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ThemeSwitcher from './components/ThemeSwitcher.vue';
import SudokuGame from './components/SudokuGame.vue';
import RankBoard from './components/RankBoard.vue';
import LoginModal from './components/LoginModal.vue';

const theme = ref('warm'); // warm/cool/dark
const user = ref(localStorage.getItem('username') || '');
const showLogin = ref(false);
const difficulty = ref('easy');

function changeTheme(newTheme) {
  theme.value = newTheme;
}
function onLogin(username) {
  user.value = username;
  localStorage.setItem('username', username);
  showLogin.value = false;
}
function logout() {
  user.value = '';
  localStorage.removeItem('username');
}
function onFinishGame({ difficulty: diff }) {
  difficulty.value = diff;
}
</script>

<style>
.app {
  min-height: 100vh;
  transition: background 0.3s;
}
.app.warm { background: #fff7e6; color: #7c4a00; }
.app.cool { background: #e6f7ff; color: #005c7c; }
.app.dark { background: #232323; color: #eee; }
header { display: flex; flex-direction: column; align-items: center; margin-bottom: 1rem; }
.user-bar { margin-top: 0.5rem; }
button { margin-left: 0.5rem; }
</style> 