/**
 * 心跳 2048 逻辑 - 增加划动支持
 */

(function() {
    const gridContainer = document.getElementById('grid-2048');
    const scoreE = document.getElementById('two048Score');
    const scoreEM = document.getElementById('two048ScoreM');
    const bestE = document.getElementById('two048Best');
    const bestEM = document.getElementById('two048BestM');
    const timerBar = document.getElementById('timerBar');
    const overlay = document.getElementById('two048Overlay');
    const startScreen = document.getElementById('two048StartScreen');
    const gameOverScreen = document.getElementById('two048GameOverScreen');
    const startBtn = document.getElementById('two048StartBtn');
    const restartBtn = document.getElementById('two048RestartBtn');

    let grid = [], score = 0, bestScore = localStorage.getItem('2048-best') || 0, gameState = 'READY', timerId = null;

    // 划动控制变量
    let touchStartX = 0, touchStartY = 0;

    window.init2048 = function() {
        bestE.innerText = bestEM.innerText = bestScore;
        createGridUI();
        overlay.classList.remove('hidden'); startScreen.classList.remove('hidden'); gameOverScreen.classList.add('hidden');
    };

    window.stop2048 = function() {
        gameState = 'STOPPED'; clearTimeout(timerId); timerBar.classList.remove('timer-active');
    };

    function createGridUI() {
        gridContainer.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div'); cell.className = 'cell-2048'; gridContainer.appendChild(cell);
        }
    }

    function startGame() {
        grid = Array(16).fill(0); score = 0; gameState = 'PLAYING';
        overlay.classList.add('hidden'); updateScore(); addRandomTile(); addRandomTile(); render(); resetTimer();
    }

    function addRandomTile() {
        const emptyCells = grid.map((val, idx) => val === 0 ? idx : null).filter(val => val !== null);
        if (emptyCells.length > 0) grid[emptyCells[Math.floor(Math.random() * emptyCells.length)]] = Math.random() < 0.9 ? 2 : 4;
    }

    function render() {
        const cells = gridContainer.querySelectorAll('.cell-2048');
        grid.forEach((val, i) => {
            cells[i].innerText = val === 0 ? '' : val;
            cells[i].className = 'cell-2048' + (val ? ` tile-${val}` : '');
        });
    }

    function resetTimer() {
        clearTimeout(timerId); timerBar.classList.remove('timer-active');
        void timerBar.offsetWidth; timerBar.classList.add('timer-active');
        timerId = setTimeout(() => { if (gameState === 'PLAYING') endGame('时间到！'); }, 2000);
    }

    function move(direction) {
        if (gameState !== 'PLAYING') return;
        let moved = false; const newGrid = [...grid];

        const getLine = (i) => {
            if (direction === 'left') return [newGrid[i*4], newGrid[i*4+1], newGrid[i*4+2], newGrid[i*4+3]];
            if (direction === 'right') return [newGrid[i*4+3], newGrid[i*4+2], newGrid[i*4+1], newGrid[i*4]];
            if (direction === 'up') return [newGrid[i], newGrid[i+4], newGrid[i+8], newGrid[i+12]];
            if (direction === 'down') return [newGrid[i+12], newGrid[i+8], newGrid[i+4], newGrid[i]];
        };

        const setLine = (i, line) => {
            if (direction === 'left') [newGrid[i*4], newGrid[i*4+1], newGrid[i*4+2], newGrid[i*4+3]] = line;
            if (direction === 'right') [newGrid[i*4+3], newGrid[i*4+2], newGrid[i*4+1], newGrid[i*4]] = line;
            if (direction === 'up') [newGrid[i], newGrid[i+4], newGrid[i+8], newGrid[i+12]] = line;
            if (direction === 'down') [newGrid[i+12], newGrid[i+8], newGrid[i+4], newGrid[i]] = line;
        };

        for (let i = 0; i < 4; i++) {
            let line = getLine(i).filter(x => x !== 0);
            for (let j = 0; j < line.length - 1; j++) {
                if (line[j] === line[j+1]) { line[j] *= 2; score += line[j]; line.splice(j+1, 1); }
            }
            while (line.length < 4) line.push(0);
            if (JSON.stringify(getLine(i)) !== JSON.stringify(line)) moved = true;
            setLine(i, line);
        }

        if (moved) {
            grid = newGrid; addRandomTile(); render(); updateScore(); resetTimer();
            if (isGameOver()) endGame('棋盘已满！');
        }
    }

    function isGameOver() {
        if (grid.includes(0)) return false;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i*4+j] === grid[i*4+j+1]) return false;
                if (grid[j*4+i] === grid[(j+1)*4+i]) return false;
            }
        }
        return true;
    }

    function updateScore() {
        scoreE.innerText = scoreEM.innerText = score;
        if (score > bestScore) {
            bestScore = score; localStorage.setItem('2048-best', bestScore);
            bestE.innerText = bestEM.innerText = bestScore;
        }
    }

    function endGame(reason) {
        gameState = 'GAMEOVER'; clearTimeout(timerId); timerBar.classList.remove('timer-active');
        gameOverScreen.classList.remove('hidden'); overlay.classList.remove('hidden');
    }

    // 划动识别逻辑
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY;
    }, {passive: false});

    document.addEventListener('touchend', (e) => {
        if (gameState !== 'PLAYING' || window.currentGame !== '2048') return;
        
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const absX = Math.abs(dx), absY = Math.abs(dy);

        if (Math.max(absX, absY) > 30) { // 阈值
            if (absX > absY) move(dx > 0 ? 'right' : 'left');
            else move(dy > 0 ? 'down' : 'up');
        }
    }, {passive: false});

    window.handle2048Key = function(e) {
        if (gameState !== 'PLAYING') return;
        if (e.keyCode === 37) move('left'); else if (e.keyCode === 38) move('up');
        else if (e.keyCode === 39) move('right'); else if (e.keyCode === 40) move('down');
    };

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
})();
