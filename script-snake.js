/**
 * GPA 蛇 - 吃到 A+，避开挂科
 */

(function() {
    const canvas = document.getElementById('snakeBoard');
    const ctx = canvas.getContext('2d');
    const scoreE = document.getElementById('snakeScore');
    const overlay = document.getElementById('snakeOverlay');
    const startScreen = document.getElementById('snakeStartScreen');
    const gameOverScreen = document.getElementById('snakeGameOverScreen');
    const startBtn = document.getElementById('snakeStartBtn');
    const restartBtn = document.getElementById('snakeRestartBtn');

    const GRID = 15;
    canvas.width = 300; canvas.height = 300;

    let snake = [{x: 5, y: 5}];
    let food = {x: 10, y: 10};
    let trap = {x: 15, y: 15};
    let dx = 1, dy = 0;
    let score = 0;
    let gameState = 'READY';
    let timerId = null;

    // 划动控制
    let touchStartX = 0, touchStartY = 0;

    window.initSnake = function() {
        score = 0; scoreE.innerText = '0.0';
        snake = [{x: 5, y: 5}];
        dx = 1; dy = 0;
        placeFood(); placeTrap();
        overlay.classList.remove('hidden'); startScreen.classList.remove('hidden'); gameOverScreen.classList.add('hidden');
        draw();
    };

    window.stopSnake = function() {
        gameState = 'STOPPED'; clearInterval(timerId);
    };

    function placeFood() {
        food = {
            x: Math.floor(Math.random() * (canvas.width / GRID)),
            y: Math.floor(Math.random() * (canvas.height / GRID))
        };
    }

    function placeTrap() {
        trap = {
            x: Math.floor(Math.random() * (canvas.width / GRID)),
            y: Math.floor(Math.random() * (canvas.height / GRID))
        };
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 蛇身 (深大蓝)
        ctx.fillStyle = '#3b82f6';
        snake.forEach(p => {
            ctx.beginPath(); ctx.roundRect(p.x * GRID, p.y * GRID, GRID-2, GRID-2, 3); ctx.fill();
        });

        // A+ (金黄色)
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 12px sans-serif';
        ctx.fillText('A+', food.x * GRID, food.y * GRID + 12);

        // 挂科 (红色)
        ctx.fillStyle = '#f87171';
        ctx.fillText('F', trap.x * GRID + 4, trap.y * GRID + 12);
    }

    function move() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        
        // 墙壁检测
        if (head.x < 0 || head.x >= canvas.width / GRID || head.y < 0 || head.y >= canvas.height / GRID) return endGame();
        // 撞自己检测
        if (snake.some(p => p.x === head.x && p.y === head.y)) return endGame();
        // 挂科检测
        if (head.x === trap.x && head.y === trap.y) return endGame();

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score += 0.5; scoreE.innerText = score.toFixed(1);
            placeFood(); placeTrap();
        } else {
            snake.pop();
        }
        draw();
    }

    function endGame() {
        gameState = 'GAMEOVER'; clearInterval(timerId);
        gameOverScreen.classList.remove('hidden'); overlay.classList.remove('hidden');
    }

    function changeDir(nx, ny) {
        if (nx === -dx || ny === -dy) return;
        dx = nx; dy = ny;
    }

    window.handleSnakeKey = (e) => {
        if (e.keyCode === 37) changeDir(-1, 0);
        else if (e.keyCode === 38) changeDir(0, -1);
        else if (e.keyCode === 39) changeDir(1, 0);
        else if (e.keyCode === 40) changeDir(0, 1);
    };

    // 划动控制
    document.addEventListener('touchstart', (e) => {
        if (window.currentGame !== 'snake') return;
        touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY;
    }, {passive: false});

    document.addEventListener('touchend', (e) => {
        if (window.currentGame !== 'snake' || gameState !== 'PLAYING') return;
        const adx = e.changedTouches[0].clientX - touchStartX;
        const ady = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(adx) > Math.abs(ady)) {
            if (Math.abs(adx) > 30) changeDir(adx > 0 ? 1 : -1, 0);
        } else {
            if (Math.abs(ady) > 30) changeDir(0, ady > 0 ? 1 : -1);
        }
    });

    startBtn.addEventListener('click', () => { gameState = 'PLAYING'; overlay.classList.add('hidden'); timerId = setInterval(move, 150); });
    restartBtn.addEventListener('click', () => { initSnake(); gameState = 'PLAYING'; overlay.classList.add('hidden'); timerId = setInterval(move, 150); });

})();
