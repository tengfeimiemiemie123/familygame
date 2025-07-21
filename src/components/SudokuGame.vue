<template>
  <div class="sudoku-game">
    <div class="difficulty-bar">
      <label>难度：</label>
      <select v-model="difficulty" @change="resetGame">
        <option value="easy">简单</option>
        <option value="medium">中等</option>
        <option value="hard">高级</option>
        <option value="expert">超难</option>
      </select>
      <button @click="resetGame">新游戏</button>
    </div>
    <div class="board">
      <table>
        <tr v-for="(row, i) in board" :key="i">
          <td v-for="(cell, j) in row" :key="j">
            <input
              v-model="userBoard[i][j]"
              :readonly="!!initBoard[i][j]"
              maxlength="1"
              @input="onInput(i, j)"
            />
          </td>
        </tr>
      </table>
    </div>
    <div class="game-btns">
      <button @click="checkResult">提交答案</button>
      <span v-if="msg" :style="{color: msgColor}">{{ msg }}</span>
      <span v-if="timeStr">用时：{{ timeStr }}</span>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue';
const props = defineProps({ user: String });
const emit = defineEmits(['finishGame']);

const difficulty = ref('easy');
const board = ref([]); // 正确答案
const initBoard = ref([]); // 初始题面
const userBoard = ref([]); // 用户填写
const msg = ref('');
const msgColor = ref('red');
const timer = ref(null);
const time = ref(0);
const timeStr = ref('');

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
function startTimer() {
  time.value = 0;
  timeStr.value = '00:00';
  if (timer.value) clearInterval(timer.value);
  timer.value = setInterval(() => {
    time.value++;
    timeStr.value = formatTime(time.value);
  }, 1000);
}
function stopTimer() {
  if (timer.value) clearInterval(timer.value);
}

function generateSudoku(diff) {
  // 这里只用简单的生成器，实际可接入更复杂算法
  // 9x9 全填满，然后挖空
  const full = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
  ];
  // 挖空数量
  const holes = { easy: 30, medium: 40, hard: 50, expert: 60 }[diff];
  let puzzle = JSON.parse(JSON.stringify(full));
  let count = 0;
  while (count < holes) {
    const i = Math.floor(Math.random()*9);
    const j = Math.floor(Math.random()*9);
    if (puzzle[i][j] !== '') {
      puzzle[i][j] = '';
      count++;
    }
  }
  return { puzzle, solution: full };
}

function resetGame() {
  const { puzzle, solution } = generateSudoku(difficulty.value);
  board.value = solution;
  initBoard.value = puzzle;
  userBoard.value = puzzle.map(row => row.slice());
  msg.value = '';
  startTimer();
}
function onInput(i, j) {
  let val = userBoard.value[i][j];
  if (!/^[1-9]$/.test(val)) userBoard.value[i][j] = '';
}
function checkResult() {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (String(userBoard.value[i][j]) !== String(board.value[i][j])) {
        msg.value = '答案不正确，请继续努力！';
        msgColor.value = 'red';
        return;
      }
    }
  }
  stopTimer();
  msg.value = '恭喜通关！';
  msgColor.value = 'green';
  emit('finishGame', { difficulty: difficulty.value, time: time.value });
}

onMounted(resetGame);
watch(difficulty, resetGame);
</script>
<style scoped>
.sudoku-game { margin: 2rem auto; max-width: 420px; background: rgba(255,255,255,0.9); border-radius: 8px; padding: 1rem; }
.difficulty-bar { margin-bottom: 1rem; }
.board { margin: 1rem 0; }
table { border-collapse: collapse; }
td { border: 1px solid #bbb; width: 36px; height: 36px; text-align: center; }
input { width: 34px; height: 34px; text-align: center; font-size: 18px; border: none; background: none; }
input[readonly] { background: #eee; color: #888; }
.game-btns { margin-top: 1rem; }
</style> 