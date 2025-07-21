class SudokuGame {
    constructor() {
        this.grid = [];
        this.solution = [];
        this.initialGrid = [];
        this.selectedCell = null;
        this.timer = 0;
        this.timerInterval = null;
        this.difficulty = 'easy';
        this.forceDifficultyNumbers = true; // 默认强制使用难度数字
        
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
        // 生成完整的数独解答
        this.solution = this.generateSolution();
        
        // 根据难度确定要保留的数字数量
        const cellsToKeep = 81 - this.getCellsToRemove();
        this.grid = this.solution.map(row => [...row]);
        
        // 创建所有位置的列表并随机打乱
        const positions = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                positions.push([i, j]);
            }
        }
        
        // 随机打乱位置
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        // 保留前cellsToKeep个位置的数字，其余设为0
        for (let i = 0; i < positions.length; i++) {
            const [row, col] = positions[i];
            if (i >= cellsToKeep) {
                this.grid[row][col] = 0;
            }
        }
        
        this.initialGrid = this.grid.map(row => [...row]);
        
        // 调试信息
        console.log('生成的数独:', this.grid);
        console.log('保留的数字数量:', cellsToKeep);
        console.log('难度:', this.difficulty);
    }

    generateSolution() {
        // 使用一个预制的有效数独作为基础
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
        
        // 随机变换这个基础数独
        return this.transformGrid(baseGrid);
    }

    transformGrid(grid) {
        const newGrid = grid.map(row => [...row]);
        
        // 随机交换行（在同一个3x3块内）
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
        
        // 随机交换列（在同一个3x3块内）
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
        
        // 随机交换数字
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

    solveSudoku(grid) {
        const emptyCell = this.findEmptyCell(grid);
        if (!emptyCell) return true;
        
        const [row, col] = emptyCell;
        
        for (let num = 1; num <= 9; num++) {
            if (this.isValid(grid, row, col, num)) {
                grid[row][col] = num;
                
                if (this.solveSudoku(grid)) {
                    return true;
                }
                
                grid[row][col] = 0;
            }
        }
        
        return false;
    }

    findEmptyCell(grid) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (grid[i][j] === 0) {
                    return [i, j];
                }
            }
        }
        return null;
    }

    isValid(grid, row, col, num) {
        // 检查行
        for (let j = 0; j < 9; j++) {
            if (grid[row][j] === num) return false;
        }
        
        // 检查列
        for (let i = 0; i < 9; i++) {
            if (grid[i][col] === num) return false;
        }
        
        // 检查3x3方块
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[boxRow + i][boxCol + j] === num) return false;
            }
        }
        
        return true;
    }

    getCellsToRemove() {
        // 检查是否显示自定义数字输入框
        const customNumbers = document.getElementById('custom-numbers');
        
        // 如果强制使用难度数字，或者自定义数字输入框隐藏，则使用难度对应的数字
        if (this.forceDifficultyNumbers || customNumbers.style.display === 'none') {
            // 根据难度确定数字数量
            let givenNumber;
            switch (this.difficulty) {
                case 'easy': givenNumber = 41; break;
                case 'medium': givenNumber = 31; break;
                case 'hard': givenNumber = 21; break;
                default: givenNumber = 41;
            }
            return 81 - givenNumber;
        } else {
            // 使用自定义数字
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
            
            // 3x3粗线
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
            
            if (cRow === row || cCol === col || 
                (Math.floor(cRow / 3) === Math.floor(row / 3) && 
                 Math.floor(cCol / 3) === Math.floor(col / 3))) {
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
        
        // 只允许数字1-9
        if (value && !/^[1-9]$/.test(value)) {
            cell.value = '';
            return;
        }
        
        // 更新游戏状态
        this.grid[row][col] = value === '' ? 0 : parseInt(value);
        
        // 检查错误
        this.checkCellError(cell);
        
        // 检查是否完成
        if (this.isGameComplete()) {
            this.stopTimer();
            // 用户系统集成
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
        
        // 检查是否有冲突
        let hasError = false;
        
        // 检查行
        for (let j = 0; j < 9; j++) {
            if (j !== col && this.grid[row][j] === value) {
                hasError = true;
                break;
            }
        }
        
        // 检查列
        if (!hasError) {
            for (let i = 0; i < 9; i++) {
                if (i !== row && this.grid[i][col] === value) {
                    hasError = true;
                    break;
                }
            }
        }
        
        // 检查3x3方块
        if (!hasError) {
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if ((boxRow + i !== row || boxCol + j !== col) && 
                        this.grid[boxRow + i][boxCol + j] === value) {
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
        
        // 验证解答是否正确
        return this.isValidSolution();
    }

    isValidSolution() {
        // 检查每行
        for (let i = 0; i < 9; i++) {
            const row = new Set();
            for (let j = 0; j < 9; j++) {
                row.add(this.grid[i][j]);
            }
            if (row.size !== 9) return false;
        }
        
        // 检查每列
        for (let j = 0; j < 9; j++) {
            const col = new Set();
            for (let i = 0; i < 9; i++) {
                col.add(this.grid[i][j]);
            }
            if (col.size !== 9) return false;
        }
        
        // 检查每个3x3方块
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
        // 数字按钮
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
                        // 用户系统集成
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

        // 游戏按钮
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

        // 难度选择
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            // 强制使用对应难度的数字数量，忽略自定义数字
            this.forceDifficultyNumbers = true;
            this.newGame();
        });

        // 自定义数字输入
        document.getElementById('custom-number').addEventListener('change', () => {
            // 只有在显示时才生效
            if (document.getElementById('custom-numbers').style.display !== 'none') {
                // 用户修改了自定义数字，取消强制使用难度数字
                this.forceDifficultyNumbers = false;
                this.newGame();
            }
        });

        // 自定义数字输入验证
        document.getElementById('custom-number').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value < 17) {
                e.target.value = 17;
            } else if (value > 81) {
                e.target.value = 81;
            }
        });

        // 测试者入口：按211显示/隐藏数字输入框
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
        // 重置为简单难度
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
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
        // 创建彩带效果
        this.createConfetti();
        
        // 显示成功弹窗
        const modal = document.getElementById('success-modal');
        const timeEl = document.getElementById('completion-time');
        const difficultyEl = document.getElementById('completion-difficulty');
        
        // 更新统计信息
        timeEl.textContent = document.getElementById('timer').textContent;
        
        const difficultyText = {
            'easy': '简单',
            'medium': '中等', 
            'hard': '困难'
        };
        difficultyEl.textContent = difficultyText[this.difficulty] || '简单';
        
        // 显示弹窗
        modal.classList.add('show');
        
        // 添加按钮事件监听
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
                
                // 动画结束后移除元素
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 5000);
            }, i * 100);
        }
    }
}

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
  const res = await fetch('http://localhost:3000/api/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error((await res.json()).msg);
  return true;
}
async function apiLogin(username, password) {
  const res = await fetch('http://localhost:3000/api/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error((await res.json()).msg);
  return true;
}
async function apiRecord(username, time, difficulty) {
  const res = await fetch('http://localhost:3000/api/record', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, time, difficulty })
  });
  if (!res.ok) throw new Error((await res.json()).msg);
  return true;
}
async function apiRank() {
  const res = await fetch('http://localhost:3000/api/rank');
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
    html += `<tr${r.username===user?' style="color:#3182ce;font-weight:700;"':''}><td>${i+1}</td><td>${r.username}</td><td>${r.time}</td><td>${r.difficulty}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('rank-list').innerHTML = html;
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
}); 