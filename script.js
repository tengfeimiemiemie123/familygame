function showUserInfo() {
  const username = localStorage.getItem('username');
  const userInfo = document.getElementById('user-info');
  const formArea = document.getElementById('form-area');
  if (username) {
    userInfo.innerHTML = `<span>欢迎，${username}</span> <button id="logout-btn">退出登录</button>`;
    formArea.style.display = 'none';
    document.getElementById('logout-btn').onclick = () => {
      localStorage.removeItem('username');
      showUserInfo();
    };
  } else {
    userInfo.innerHTML = `<button id="login-btn">登录</button> <button id="register-btn">注册</button>`;
    document.getElementById('login-btn').onclick = () => showForm('login');
    document.getElementById('register-btn').onclick = () => showForm('register');
  }
}

function showForm(type) {
  const formArea = document.getElementById('form-area');
  const submitBtn = document.getElementById('submit-btn');
  const msg = document.getElementById('msg');
  formArea.style.display = '';
  msg.textContent = '';
  submitBtn.textContent = type === 'login' ? '登录' : '注册';
  submitBtn.onclick = async () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!username || !password) {
      msg.textContent = '请输入用户名和密码';
      return;
    }

    try {
      // 获取当前域名
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/api/${type}`;
      console.log('发送请求到:', url);
      console.log('请求数据:', { username, password: '***' });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      console.log('响应状态:', response.status);
      const data = await response.json();
      console.log('响应数据:', data);

      if (data.code === 0) {
        if (type === 'login') {
          localStorage.setItem('username', data.username || username);
          showUserInfo();
          formArea.style.display = 'none';
        } else {
          msg.textContent = '注册成功，请登录';
          setTimeout(() => {
            showForm('login');
          }, 1000);
        }
      } else {
        msg.textContent = data.msg || '操作失败';
      }
    } catch (error) {
      console.error('请求错误:', error);
      msg.textContent = '服务器错误，请稍后再试';
    }
  };
  
  document.getElementById('cancel-btn').onclick = () => {
    formArea.style.display = 'none';
  };
}

document.addEventListener('DOMContentLoaded', showUserInfo); 