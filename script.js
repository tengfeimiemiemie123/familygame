// 用户系统相关变量
let currentUser = localStorage.getItem('sudoku_user') || '';
let pendingRecord = null;

// 弹窗控制
function showUserModal(msg = '') {
  document.getElementById('user-modal').style.display = 'flex';
  document.getElementById('user-modal-msg').textContent = msg;
}
function hideUserModal() {
  document.getElementById('user-modal').style.display = 'none';
}
function showRankModal() {
  document.getElementById('rank-modal').style.display = 'flex';
}
function hideRankModal() {
  document.getElementById('rank-modal').style.display = 'none';
}

// 登录注册逻辑
async function apiRegister(username, password) {
  const res = await fetch('https://familygame.onrender.com/api/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error((await res.json()).msg);
  return true;
}
async function apiLogin(username, password) {
  const res = await fetch('https://familygame.onrender.com/api/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error((await res.json()).msg);
  return true;
}
async function apiRecord(username, time, difficulty) {
  const res = await fetch('https://familygame.onrender.com/api/record', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, time, difficulty })
  });
  if (!res.ok) throw new Error((await res.json()).msg);
  return true;
}
async function apiRank() {
  const res = await fetch('https://familygame.onrender.com/api/rank');
  return await res.json();
}

// 绑定弹窗按钮
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-btn').onclick = async function() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    try {
      await apiLogin(username, password);
      currentUser = username;
      localStorage.setItem('sudoku_user', username);
      hideUserModal();
      if (pendingRecord) {
        await uploadRecordAndShowRank(...pendingRecord);
        pendingRecord = null;
      }
    } catch(e) {
      document.getElementById('user-modal-msg').textContent = e.message;
    }
  };
  document.getElementById('register-btn').onclick = async function() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    try {
      await apiRegister(username, password);
      currentUser = username;
      localStorage.setItem('sudoku_user', username);
      hideUserModal();
      if (pendingRecord) {
        await uploadRecordAndShowRank(...pendingRecord);
        pendingRecord = null;
      }
    } catch(e) {
      document.getElementById('user-modal-msg').textContent = e.message;
    }
  };
  document.getElementById('close-rank').onclick = hideRankModal;
});

// 上传成绩并展示排行榜
async function uploadRecordAndShowRank(time, difficulty) {
  if (!currentUser) return;
  await apiRecord(currentUser, time, difficulty);
  const rank = await apiRank();
  renderRankList(rank, currentUser);
  showRankModal();
}
function renderRankList(rank, user) {
  let html = '<table><tr><th>排名</th><th>用户名</th><th>用时(秒)</th><th>难度</th></tr>';
  rank.forEach((r, i) => {
    html += `<tr${r.username===user?' style=\"color:#3182ce;font-weight:700;\"':''}><td>${i+1}</td><td>${r.username}</td><td>${r.time}</td><td>${r.difficulty}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('rank-list').innerHTML = html;
} 