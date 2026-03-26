/**
 * 俄罗斯方块逻辑 - 移动端适配版
 */

(function() {
    const canvas = document.getElementById('gameBoard');
    const ctx = canvas.getContext('2d');
    const nextCanvas = document.getElementById('nextPiece');
    const nextCtx = nextCanvas.getContext('2d');

    const scoreE = document.getElementById('tetrisScore');
    const scoreEM = document.getElementById('tetrisScoreM');
    const levelE = document.getElementById('tetrisLevel');
    const levelEM = document.getElementById('tetrisLevelM');
    
    const overlay = document.getElementById('tetrisOverlay');
    const startScreen = document.getElementById('tetrisStartScreen');
    const gameOverScreen = document.getElementById('tetrisGameOverScreen');
    const difficultySelect = document.getElementById('tetrisDifficulty');
    const startBtn = document.getElementById('tetrisStartBtn');
    const restartBtn = document.getElementById('tetrisRestartBtn');

    const COLS = 10, ROWS = 20, BLOCK_SIZE = 30;
    canvas.width = COLS * BLOCK_SIZE; canvas.height = ROWS * BLOCK_SIZE;

    const COLORS = [null, '#60a5fa', '#f472b6', '#4ade80', '#f87171', '#fbbf24', '#fb923c', '#818cf8'];
    const SHAPES = [null, [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], [[0,2,0], [2,2,2], [0,0,0]], [[0,3,3], [3,3,0], [0,0,0]], [[4,4,0], [0,4,4], [0,0,0]], [[5,5], [5,5]], [[0,0,6], [6,6,6], [0,0,0]], [[7,0,0], [7,7,7], [0,0,0]]];

    let board = [], score = 0, level = 1, dropCounter = 0, dropInterval = 800, lastTime = 0, gameState = 'READY', animationId = null;
    let player = { pos: {x: 0, y: 0}, matrix: null, next: null };

    window.initTetris = function() {
        board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
        score = 0; level = 1; gameState = 'READY';
        updateScore();
        overlay.classList.remove('hidden'); startScreen.classList.remove('hidden'); gameOverScreen.classList.add('hidden');
        draw();
    };

    window.stopTetris = function() { gameState = 'STOPPED'; if (animationId) cancelAnimationFrame(animationId); };

    function drawBlock(ctx, x, y, colorIndex) {
        ctx.fillStyle = COLORS[colorIndex];
        ctx.beginPath(); ctx.roundRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2, 4); ctx.fill();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMatrix(board, {x: 0, y: 0}, ctx);
        if (player.matrix) drawMatrix(player.matrix, player.pos, ctx);
    }

    function drawMatrix(matrix, offset, context) {
        matrix.forEach((row, y) => { row.forEach((value, x) => {
            if (value !== 0) drawBlock(context, x + offset.x, y + offset.y, value);
        });});
    }

    function collide(board, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) return true;
            }
        }
        return false;
    }

    function merge(board, player) {
        player.matrix.forEach((row, y) => { row.forEach((value, x) => {
            if (value !== 0) board[y + player.pos.y][x + player.pos.x] = value;
        });});
    }

    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
        if (dir > 0) matrix.forEach(row => row.reverse()); else matrix.reverse();
    }

    function playerDrop() {
        player.pos.y++;
        if (collide(board, player)) {
            player.pos.y--; merge(board, player); playerReset(); arenaSweep(); updateScore();
        }
        dropCounter = 0;
    }

    function playerMove(dir) { player.pos.x += dir; if (collide(board, player)) player.pos.x -= dir; }
    function playerRotate(dir) {
        const pos = player.pos.x; let offset = 1; rotate(player.matrix, dir);
        while (collide(board, player)) {
            player.pos.x += offset; offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) { rotate(player.matrix, -dir); player.pos.x = pos; return; }
        }
    }

    function playerReset() {
        player.matrix = player.next || SHAPES[Math.floor(Math.random() * (SHAPES.length - 1)) + 1];
        player.next = SHAPES[Math.floor(Math.random() * (SHAPES.length - 1)) + 1];
        player.pos.y = 0; player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);
        if (collide(board, player)) endGame();
    }

    function arenaSweep() {
        let rowCount = 1;
        outer: for (let y = ROWS - 1; y >= 0; --y) {
            for (let x = 0; x < COLS; ++x) if (board[y][x] === 0) continue outer;
            const row = board.splice(y, 1)[0].fill(0); board.unshift(row); ++y;
            score += rowCount * 10; rowCount *= 2;
            if (score % 100 === 0) { level++; dropInterval *= 0.9; }
        }
    }

    function updateScore() {
        scoreE.innerText = scoreEM.innerText = score;
        levelE.innerText = levelEM.innerText = level;
    }

    function endGame() {
        gameState = 'GAMEOVER'; gameOverScreen.classList.remove('hidden'); overlay.classList.remove('hidden');
    }

    function update(time = 0) {
        if (gameState !== 'PLAYING') return;
        const deltaTime = time - lastTime; lastTime = time;
        dropCounter += deltaTime; if (dropCounter > dropInterval) playerDrop();
        draw(); animationId = requestAnimationFrame(update);
    }

    function startGame() {
        board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
        score = 0; level = 1; dropInterval = parseInt(difficultySelect.value);
        gameState = 'PLAYING'; overlay.classList.add('hidden');
        updateScore(); playerReset(); lastTime = performance.now(); update();
    }

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    // 虚拟按键绑定
    document.getElementById('btn-left').addEventListener('touchstart', (e) => { e.preventDefault(); playerMove(-1); });
    document.getElementById('btn-right').addEventListener('touchstart', (e) => { e.preventDefault(); playerMove(1); });
    document.getElementById('btn-down').addEventListener('touchstart', (e) => { e.preventDefault(); playerDrop(); });
    document.getElementById('btn-rot').addEventListener('touchstart', (e) => { e.preventDefault(); playerRotate(1); });
    document.getElementById('btn-drop').addEventListener('touchstart', (e) => {
        e.preventDefault();
        while (!collide(board, player)) player.pos.y++;
        player.pos.y--; merge(board, player); playerReset(); arenaSweep(); updateScore(); dropCounter = 0;
    });

    window.handleTetrisKey = function(e) {
        if (gameState !== 'PLAYING') return;
        if (e.keyCode === 37) playerMove(-1);
        else if (e.keyCode === 39) playerMove(1);
        else if (e.keyCode === 40) playerDrop();
        else if (e.keyCode === 38) playerRotate(1);
        else if (e.keyCode === 32) {
            while (!collide(board, player)) player.pos.y++;
            player.pos.y--; merge(board, player); playerReset(); arenaSweep(); updateScore(); dropCounter = 0;
        }
    };
})();
