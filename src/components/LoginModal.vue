<template>
  <div class="modal-bg">
    <div class="modal">
      <h2>登录/注册</h2>
      <input v-model="username" placeholder="用户名" />
      <input v-model="password" type="password" placeholder="密码" />
      <div class="btns">
        <button @click="submit('login')">登录</button>
        <button @click="submit('register')">注册</button>
        <button @click="$emit('close')">取消</button>
      </div>
      <div class="msg" v-if="msg">{{ msg }}</div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
const emit = defineEmits(['login', 'close']);
const username = ref('');
const password = ref('');
const msg = ref('');

async function submit(type) {
  msg.value = '';
  if (!username.value || !password.value) {
    msg.value = '请输入用户名和密码';
    return;
  }
  try {
    const res = await fetch(`/api/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    });
    const data = await res.json();
    if (data.code === 0) {
      if (type === 'login') emit('login', username.value);
      else msg.value = '注册成功，请登录';
    } else {
      msg.value = data.msg || '操作失败';
    }
  } catch (e) {
    msg.value = '服务器错误';
  }
}
</script>
<style scoped>
.modal-bg {
  position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff; border-radius: 8px; padding: 2rem; min-width: 300px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
input { display: block; width: 100%; margin: 1rem 0 0.5rem 0; padding: 0.5rem; }
.btns { margin-top: 1rem; }
button { margin-right: 0.5rem; }
.msg { color: #d32f2f; margin-top: 0.5rem; }
</style> 