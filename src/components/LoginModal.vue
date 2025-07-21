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
      <div class="msg" v-if="msg" :class="{ error: isError }">{{ msg }}</div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
const emit = defineEmits(['login', 'close']);
const username = ref('');
const password = ref('');
const msg = ref('');
const isError = ref(false);
const API_BASE = import.meta.env.VITE_API_BASE;

async function submit(type) {
  msg.value = '';
  isError.value = false;
  
  if (!username.value || !password.value) {
    msg.value = '请输入用户名和密码';
    isError.value = true;
    return;
  }

  try {
    console.log(`发送${type}请求...`);
    const res = await fetch(`${API_BASE}/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: username.value, 
        password: password.value 
      })
    });

    console.log('收到响应:', res.status);
    const data = await res.json();
    console.log('响应数据:', data);

    if (data.code === 0) {
      if (type === 'login') {
        emit('login', username.value);
        msg.value = '登录成功！';
        isError.value = false;
      } else {
        msg.value = '注册成功，请登录';
        isError.value = false;
      }
    } else {
      msg.value = data.msg || '操作失败';
      isError.value = true;
      console.error('操作失败:', data);
    }
  } catch (e) {
    console.error('请求错误:', e);
    msg.value = '服务器错误，请稍后重试';
    isError.value = true;
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
button { margin-right: 0.5rem; padding: 0.5rem 1rem; }
.msg { margin-top: 0.5rem; text-align: center; }
.msg.error { color: #d32f2f; }
</style> 