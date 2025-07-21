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
    <div v-if="showTestBtn" style="text-align:center;margin:1rem 0;">
      <button @click="testSudoku">测试（只留一个空位）</button>
    </div>
    <main>
      <SudokuGame :user="user" @finishGame="onFinishGame" ref="sudokuRef" @trySubmit="onTrySubmit" />
      <RankBoard :user="user" :difficulty="difficulty" ref="rankRef" />
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
const sudokuRef = ref();
const rankRef = ref();
const tryCount = ref(0);
const showTestBtn = ref(false);

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
async function onFinishGame({ difficulty: diff, time }) {
  difficulty.value = diff;
  // 自动提交成绩
  if (user.value) {
    try {
      await fetch('/api/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.value, difficulty: diff, time })
      });
      // 刷新排行榜
      if (rankRef.value && rankRef.value.fetchRanks) rankRef.value.fetchRanks();
    } catch {}
  }
}
function testSudoku() {
  if (sudokuRef.value && sudokuRef.value.setTestBoard) {
    sudokuRef.value.setTestBoard();
  }
}
function onTrySubmit() {
  tryCount.value++;
  if (tryCount.value >= 5) showTestBtn.value = true;
}
</script>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  transition: background 0.3s;
}
header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}
.user-bar { margin-top: 0.5rem; }
main {
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.sudoku-game, .rank-board {
  margin: 2rem auto;
}
button { margin-left: 0.5rem; }
.app.warm { background: #fff7e6; color: #7c4a00; }
.app.cool { background: #e6f7ff; color: #005c7c; }
.app.dark { background: #232323; color: #eee; }
</style> 