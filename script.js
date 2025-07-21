// 数独主逻辑 + 用户系统

// ========== 数独主逻辑 ==========
class SudokuGame {
    constructor() {
        this.grid = [];
        this.solution = [];
        this.initialGrid = [];
        this.selectedCell = null;
        this.timer = 0;
        this.timerInterval = null;
        this.difficulty = 'easy';
        this.forceDifficultyNumbers = true;
        this.initializeGame();
        this.setupEventListeners();
        this.startTimer();
    }
    initializeGame() {
        this.createGrid();
        this.generateSudoku();
        this.renderGrid();
    }
    createGrid() {
        const gridContainer = document.getElementById('sudoku-grid');
        gridContainer.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('input');
                cell.type = 'text';
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.maxLength = 1;
                cell.inputMode = 'numeric';
                cell.addEventListener('click', () => this.selectCell(cell));
                cell.addEventListener('input', (e) => this.handleCellInput(e));
                cell.addEventListener('keydown', (e) => this.handleKeyDown(e));
                gridContainer.appendChild(cell);
            }
        }
    }
    generateSudoku() {
        this.solution = this.generateSolution();
        const cellsToKeep = 81 - this.getCellsToRemove();
        this.grid = this.solution.map(row => [...row]);
        const positions = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                positions.push([i, j]);
            }
        }
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        for (let i = 0; i < positions.length; i++) {
            const [row, col] = positions[i];
            if (i >= cellsToKeep) {
                this.grid[row][col] = 0;
            }
        }
        this.initialGrid = this.grid.map(row => [...row]);
    }
    generateSolution() {
        const baseGrid = [
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
        return this.transformGrid(baseGrid);
    }
    transformGrid(grid) {
        const newGrid = grid.map(row => [...row]);
        for (let block = 0; block < 3; block++) {
            const startRow = block * 3;
            for (let i = 0; i < 10; i++) {
                const row1 = startRow + Math.floor(Math.random() * 3);
                const row2 = startRow + Math.floor(Math.random() * 3);
                if (row1 !== row2) {
                    [newGrid[row1], newGrid[row2]] = [newGrid[row2], newGrid[row1]];
                }
            }
        }
        for (let block = 0; block < 3; block++) {
            const startCol = block * 3;
            for (let i = 0; i < 10; i++) {
                const col1 = startCol + Math.floor(Math.random() * 3);
                const col2 = startCol + Math.floor(Math.random() * 3);
                if (col1 !== col2) {
                    for (let row = 0; row < 9; row++) {
                        [newGrid[row][col1], newGrid[row][col2]] = [newGrid[row][col2], newGrid[row][col1]];
                    }
                }
            }
        }
        for (let i = 0; i < 5; i++) {
            const num1 = Math.floor(Math.random() * 9) + 1;
            const num2 = Math.floor(Math.random() * 9) + 1;
            if (num1 !== num2) {
                for (let row = 0; row < 9; row++) {
                    for (let col = 0; col < 9; col++) {
                        if (newGrid[row][col] === num1) {
                            newGrid[row][col] = num2;
                        } else if (newGrid[row][col] === num2) {
                            newGrid[row][col] = num1;
                        }
                    }
                }
            }
        }
        return newGrid;
    }
    getCellsToRemove() {
        const customNumbers = document.getElementById('custom-numbers');
        if (this.forceDifficultyNumbers || customNumbers.style.display === 'none') {
            let givenNumber;
            switch (this.difficulty) {
                case 'easy': givenNumber = 41; break;
                case 'medium': givenNumber = 31; break;
                case 'hard': givenNumber = 21; break;
                default: givenNumber = 41;
            }
            return 81 - givenNumber;
        } else {
            const customNumber = parseInt(document.getElementById('custom-number').value);
            const validNumber = Math.max(17, Math.min(81, customNumber));
            return 81 - validNumber;
        }
    }
    renderGrid() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = this.grid[row][col];
            cell.value = value === 0 ? '' : value;
            cell.classList.remove('initial', 'error', 'selected', 'highlight', 'completed', 'thick-right', 'thick-bottom');
            if ((col + 1) % 3 === 0 && col !== 8) cell.classList.add('thick-right');
            if ((row + 1) % 3 === 0 && row !== 8) cell.classList.add('thick-bottom');
            if ((col + 1) % 3 === 0 && col !== 8 && (row + 1) % 3 === 0 && row !== 8) cell.classList.add('thick-right', 'thick-bottom');
            if (this.initialGrid[row][col] !== 0) {
                cell.classList.add('initial');
                cell.readOnly = true;
            } else {
                cell.readOnly = false;
            }
        });
    }
    selectCell(cell) {
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }
        this.selectedCell = cell;
        cell.classList.add('selected');
        cell.focus();
        this.highlightRelatedCells(cell);
    }
    highlightRelatedCells(cell) {
        const cells = document.querySelectorAll('.cell');
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cells.forEach(c => c.classList.remove('highlight'));
        cells.forEach(c => {
            const cRow = parseInt(c.dataset.row);
            const cCol = parseInt(c.dataset.col);
            if (cRow === row || cCol === col || (Math.floor(cRow / 3) === Math.floor(row / 3) && Math.floor(cCol / 3) === Math.floor(col / 3))) {
                if (c !== cell) {
                    c.classList.add('highlight');
                }
            }
        });
    }
    handleCellInput(event) {
        const cell = event.target;
        const value = event.target.value;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        if (value && !/^[1-9]$/.test(value)) {
            cell.value = '';
            return;
        }
        this.grid[row][col] = value === '' ? 0 : parseInt(value);
        this.checkCellError(cell);
        if (this.isGameComplete()) {
            this.stopTimer();
            const time = this.timer;
            const difficulty = this.difficulty;
            if (!currentUser) {
                pendingRecord = [time, difficulty];
                showUserModal('请先登录/注册，成绩将自动上传');
            } else {
                uploadRecordAndShowRank(time, difficulty);
            }
            this.showSuccessAnimation();
        }
    }
    handleKeyDown(event) {
        const cell = event.target;
        const key = event.key;
        if (key === 'Backspace' || key === 'Delete') {
            cell.value = '';
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            this.grid[row][col] = 0;
            this.checkCellError(cell);
        }
    }
    checkCellError(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const value = this.grid[row][col];
        if (value === 0) {
            cell.classList.remove('error');
            return;
        }
        let hasError = false;
        for (let j = 0; j < 9; j++) {
            if (j !== col && this.grid[row][j] === value) {
                hasError = true;
                break;
            }
        }
        if (!hasError) {
            for (let i = 0; i < 9; i++) {
                if (i !== row && this.grid[i][col] === value) {
                    hasError = true;
                    break;
                }
            }
        }
        if (!hasError) {
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if ((boxRow + i !== row || boxCol + j !== col) && this.grid[boxRow + i][boxCol + j] === value) {
                        hasError = true;
                        break;
                    }
                }
                if (hasError) break;
            }
        }
        cell.classList.toggle('error', hasError);
    }
    isGameComplete() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        return this.isValidSolution();
    }
    isValidSolution() {
        for (let i = 0; i < 9; i++) {
            const row = new Set();
            for (let j = 0; j < 9; j++) {
                row.add(this.grid[i][j]);
            }
            if (row.size !== 9) return false;
        }
        for (let j = 0; j < 9; j++) {
            const col = new Set();
            for (let i = 0; i < 9; i++) {
                col.add(this.grid[i][j]);
            }
            if (col.size !== 9) return false;
        }
        for (let boxRow = 0; boxRow < 9; boxRow += 3) {
            for (let boxCol = 0; boxCol < 9; boxCol += 3) {
                const box = new Set();
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        box.add(this.grid[boxRow + i][boxCol + j]);
                    }
                }
                if (box.size !== 9) return false;
            }
        }
        return true;
    }
    setupEventListeners() {
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.selectedCell && !this.selectedCell.readOnly) {
                    const number = btn.dataset.number;
                    if (number === '0') {
                        this.selectedCell.value = '';
                        const row = parseInt(this.selectedCell.dataset.row);
                        const col = parseInt(this.selectedCell.dataset.col);
                        this.grid[row][col] = 0;
                    } else {
                        this.selectedCell.value = number;
                        const row = parseInt(this.selectedCell.dataset.row);
                        const col = parseInt(this.selectedCell.dataset.col);
                        this.grid[row][col] = parseInt(number);
                    }
                    this.checkCellError(this.selectedCell);
                    if (this.isGameComplete()) {
                        this.stopTimer();
                        const time = this.timer;
                        const difficulty = this.difficulty;
                        if (!currentUser) {
                            pendingRecord = [time, difficulty];
                            showUserModal('请先登录/注册，成绩将自动上传');
                        } else {
                            uploadRecordAndShowRank(time, difficulty);
                        }
                        this.showSuccessAnimation();
                    }
                }
            });
        });
        document.getElementById('new-game').addEventListener('click', () => {
            this.newGame();
        });
        document.getElementById('check-solution').addEventListener('click', () => {
            this.checkSolution();
        });
        document.getElementById('solve-puzzle').addEventListener('click', () => {
            this.solvePuzzle();
        });
        document.getElementById('hint').addEventListener('click', () => {
            this.giveHint();
        });
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.forceDifficultyNumbers = true;
            this.newGame();
        });
        document.getElementById('custom-number').addEventListener('change', () => {
            if (document.getElementById('custom-numbers').style.display !== 'none') {
                this.forceDifficultyNumbers = false;
                this.newGame();
            }
        });
        document.getElementById('custom-number').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value < 17) {
                e.target.value = 17;
            } else if (value > 81) {
                e.target.value = 81;
            }
        });
        let keySequence = '';
        document.addEventListener('keydown', (e) => {
            keySequence += e.key;
            if (keySequence.length > 3) {
                keySequence = keySequence.slice(-3);
            }
            if (keySequence === '211') {
                const customNumbers = document.getElementById('custom-numbers');
                if (customNumbers.style.display === 'none') {
                    customNumbers.style.display = 'flex';
                } else {
                    customNumbers.style.display = 'none';
                }
                keySequence = '';
            }
        });
    }
    newGame() {
        this.selectedCell = null;
        this.difficulty = 'easy';
        document.getElementById('difficulty').value = 'easy';
        this.generateSudoku();
        this.renderGrid();
        this.resetTimer();
        this.hideMessage();
    }
    checkSolution() {
        if (this.isGameComplete()) {
            if (this.isValidSolution()) {
                this.showMessage('解答正确！恭喜你完成了数独！', 'success');
                this.stopTimer();
            } else {
                this.showMessage('解答有误，请检查你的答案。', 'error');
            }
        } else {
            this.showMessage('请先完成数独再检查答案。', 'info');
        }
    }
    solvePuzzle() {
        this.grid = this.solution.map(row => [...row]);
        this.renderGrid();
        this.showMessage('已显示完整解答。', 'info');
        this.stopTimer();
    }
    giveHint() {
        if (!this.selectedCell || this.selectedCell.readOnly) {
            this.showMessage('请先选择一个空白格子。', 'info');
            return;
        }
        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        const correctValue = this.solution[row][col];
        this.selectedCell.value = correctValue;
        this.grid[row][col] = correctValue;
        this.selectedCell.classList.remove('error');
        this.showMessage(`提示：这个位置应该是 ${correctValue}`, 'info');
    }
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    resetTimer() {
        this.stopTimer();
        this.timer = 0;
        this.updateTimerDisplay();
        this.startTimer();
    }
    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        document.getElementById('timer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
    }
    hideMessage() {
        const messageEl = document.getElementById('message');
        messageEl.className = 'message';
    }
    showSuccessAnimation() {
        this.createConfetti();
        const modal = document.getElementById('success-modal');
        const timeEl = document.getElementById('completion-time');
        const difficultyEl = document.getElementById('completion-difficulty');
        timeEl.textContent = document.getElementById('timer').textContent;
        const difficultyText = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难'
        };
        difficultyEl.textContent = difficultyText[this.difficulty] || '简单';
        modal.classList.add('show');
        document.getElementById('new-game-success').addEventListener('click', () => {
            this.hideSuccessAnimation();
            this.newGame();
        });
        document.getElementById('close-success').addEventListener('click', () => {
            this.hideSuccessAnimation();
        });
    }
    hideSuccessAnimation() {
        const modal = document.getElementById('success-modal');
        modal.classList.remove('show');
    }
    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 2 + 's';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                document.body.appendChild(confetti);
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 5000);
            }, i * 100);
        }
    }
}

// ========== 用户系统与排行榜弹窗（保留你现有的代码） ==========
// 用户系统相关变量
let currentUser = localStorage.getItem('sudoku_user') || '';
let pendingRecord = null;

function updateUserInfoUI() {
  const label = document.getElementById('user-info-label');
  const btn = document.getElementById('user-login-btn');
  if (currentUser) {
    label.textContent = `当前用户：${currentUser}`;
    btn.textContent = '登出';
  } else {
    label.textContent = '未登录';
    btn.textContent = '登录';
  }
}

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

// 绑定弹窗按钮和用户按钮
window.addEventListener('DOMContentLoaded', () => {
  updateUserInfoUI();
  document.getElementById('login-btn').onclick = async function() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    try {
      await apiLogin(username, password);
      currentUser = username;
      localStorage.setItem('sudoku_user', username);
      updateUserInfoUI();
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
      updateUserInfoUI();
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
  document.getElementById('rank-btn').onclick = async function() {
    // 随时查看排行榜
    const rank = await apiRank();
    renderRankList(rank, currentUser);
    showRankModal();
  };
  document.getElementById('user-login-btn').onclick = function() {
    if (currentUser) {
      // 登出
      currentUser = '';
      localStorage.removeItem('sudoku_user');
      updateUserInfoUI();
    } else {
      // 手动登录
      showUserModal();
    }
  };
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

// 重新初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
    // ...（保留你现有的弹窗按钮绑定等）...
}); 