<template>
  <div class="theme-switcher">
    <label>主题：</label>
    <select :value="theme" @change="$emit('changeTheme', $event.target.value)">
      <option value="warm">暖色</option>
      <option value="cool">冷色</option>
      <option value="dark">黑暗</option>
    </select>
  </div>
</template>
<script setup>
const props = defineProps({ theme: String });
</script>
<style scoped>
.theme-switcher {
  margin-bottom: 1rem;
}
select {
  margin-left: 0.5rem;
  padding: 0.2rem 0.5rem;
}
</style> 