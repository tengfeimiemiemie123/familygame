<template>
  <div class="rank-board">
    <div class="tabs">
      <button v-for="d in difficulties" :key="d.value" :class="{active: tab===d.value}" @click="tab=d.value">{{ d.label }}</button>
    </div>
    <table>
      <thead>
        <tr><th>用户名</th><th>耗时</th><th>日期</th></tr>
      </thead>
      <tbody>
        <tr v-for="item in ranks" :key="item._id">
          <td>{{ item.username }}</td>
          <td>{{ formatTime(item.time) }}</td>
          <td>{{ item.date }}</td>
        </tr>
        <tr v-if="ranks.length===0"><td colspan="3">暂无记录</td></tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue';
const props = defineProps({ user: String, difficulty: String });
const difficulties = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '高级' },
  { value: 'expert', label: '超难' }
];
const tab = ref('easy');
const ranks = ref([]);

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

async function fetchRanks() {
  ranks.value = [];
  try {
    const res = await fetch(`/api/rank?difficulty=${tab.value}`);
    const data = await res.json();
    if (data.code === 0) ranks.value = data.list;
  } catch {}
}

watch(tab, fetchRanks, { immediate: true });
onMounted(fetchRanks);
</script>
<style scoped>
.rank-board { margin: 2rem auto; max-width: 420px; background: rgba(255,255,255,0.9); border-radius: 8px; padding: 1rem; }
.tabs { margin-bottom: 1rem; }
.tabs button { margin-right: 0.5rem; padding: 0.3rem 1rem; border: none; border-radius: 4px; background: #eee; cursor: pointer; }
.tabs .active { background: #1976d2; color: #fff; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #bbb; padding: 0.3rem 0.5rem; text-align: center; }
</style> 