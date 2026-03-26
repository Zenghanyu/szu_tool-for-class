/**
 * 极简俄罗斯方块 - 2.0
 * 增加了难度选择、暂停功能及明亮风视觉效果
 */

const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextPiece');
const nextCtx = nextCanvas.getContext('2d');

// UI 元素
const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');
const levelElement = document.getElementById('level');
const overlay = document.getElementById('overlay');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const pauseScreen = document.getElementById('pauseScreen');
const finalScoreText = document.getElementById('finalScoreText');
const difficultySelect = document.getElementById('difficulty');

// 按钮
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');

// 游戏配置
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const NEXT_SIZE = 22;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
nextCanvas.width = 4 * NEXT_SIZE;
nextCanvas.height = 4 * NEXT_SIZE;

// 现代风配色 (马卡龙色系)
const COLORS = [
    null,
    '#60a5fa', // I - 天蓝
    '#f472b6', // T - 浅粉
    '#4ade80', // S - 嫩绿
    '#f87171', // Z - 珊瑚红
    '#fbbf24', // O - 暖黄
    '#fb923c', // L - 橙
    '#818cf8'  // J - 靛蓝
];

const SHAPES = [
    null,
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], // I
    [[0,2,0], [2,2,2], [0,0,0]],               // T
    [[0,3,3], [3,3,0], [0,0,0]],               // S
    [[4,4,0], [0,4,4], [0,0,0]],               // Z
    [[5,5], [5,5]],                           // O
    [[0,0,6], [6,6,6], [0,0,0]],               // L
    [[7,0,0], [7,7,7], [0,0,0]]                // J
];

let board = [];
let score = 0;
let lines = 0;
let level = 1;
let dropCounter = 0;
let dropInterval = 800;
let lastTime = 0;
let gameState = 'READY'; // READY, PLAYING, PAUSED, GAMEOVER

let player = {
    pos: {x: 0, y: 0},
    matrix: null,
    next: null
};

function createBoard() {
    return Array.from({length: ROWS}, () => Array(COLS).fill(0));
}

// 绘制单个方块
function drawBlock(ctx, x, y, colorIndex, size) {
    const color = COLORS[colorIndex];
    
    // 主体颜色
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x * size + 1, y * size + 1, size - 2, size - 2, 4);
    ctx.fill();
    
    // 亮部效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.roundRect(x * size + 3, y * size + 3, size - 6, (size - 6) / 2, 2);
    ctx.fill();
}

function draw() {
    // 清空背景
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制辅助网格 (极淡)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.02)';
    ctx.lineWidth = 1;
    for(let i=0; i<=COLS; i++) {
        ctx.beginPath(); ctx.moveTo(i * BLOCK_SIZE, 0); ctx.lineTo(i * BLOCK_SIZE, canvas.height); ctx.stroke();
    }
    for(let i=0; i<=ROWS; i++) {
        ctx.beginPath(); ctx.moveTo(0, i * BLOCK_SIZE); ctx.lineTo(canvas.width, i * BLOCK_SIZE); ctx.stroke();
    }

    drawMatrix(board, {x: 0, y: 0}, ctx, BLOCK_SIZE);
    drawMatrix(player.matrix, player.pos, ctx, BLOCK_SIZE);
}

function drawMatrix(matrix, offset, context, size) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(context, x + offset.x, y + offset.y, value, size);
            }
        });
    });
}

function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    const matrix = player.next;
    const offsetX = (4 - matrix[0].length) / 2;
    const offsetY = (4 - matrix.length) / 2;
    drawMatrix(matrix, {x: offsetX, y: offsetY}, nextCtx, NEXT_SIZE);
}

function collide(board, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(board, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

function playerDrop() {
    player.pos.y++;
    if (collide(board, player)) {
        player.pos.y--;
        merge(board, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(board, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(board, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function playerReset() {
    if (!player.next) {
        player.next = SHAPES[Math.floor(Math.random() * (SHAPES.length - 1)) + 1];
    }
    player.matrix = player.next;
    player.next = SHAPES[Math.floor(Math.random() * (SHAPES.length - 1)) + 1];
    player.pos.y = 0;
    player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);
    
    drawNext();

    if (collide(board, player)) {
        endGame();
    }
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = ROWS - 1; y >= 0; --y) {
        for (let x = 0; x < COLS; ++x) {
            if (board[y][x] === 0) continue outer;
        }
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        ++y;

        score += rowCount * 10;
        rowCount *= 2;
        lines++;
        
        if (lines % 10 === 0) {
            level++;
            dropInterval *= 0.9; // 随等级提升加快速度
        }
    }
}

function updateScore() {
    scoreElement.innerText = score;
    linesElement.innerText = lines;
    levelElement.innerText = level;
}

function endGame() {
    gameState = 'GAMEOVER';
    finalScoreText.innerText = `最终得分: ${score}`;
    gameOverScreen.classList.remove('hidden');
    startScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    overlay.classList.remove('hidden');
}

function togglePause() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        pauseScreen.classList.remove('hidden');
        overlay.classList.remove('hidden');
        pauseBtn.innerText = '继续 (P)';
    } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        pauseScreen.classList.add('hidden');
        overlay.classList.add('hidden');
        pauseBtn.innerText = '暂停 (P)';
        lastTime = performance.now();
        update();
    }
}

function update(time = 0) {
    if (gameState !== 'PLAYING') return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function startGame() {
    board = createBoard();
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = parseInt(difficultySelect.value);
    gameState = 'PLAYING';
    
    overlay.classList.add('hidden');
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    
    updateScore();
    playerReset();
    lastTime = performance.now();
    update();
}

// 监听器
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
resumeBtn.addEventListener('click', togglePause);
pauseBtn.addEventListener('click', togglePause);

document.addEventListener('keydown', event => {
    if (gameState === 'PLAYING') {
        if (event.keyCode === 37) playerMove(-1);
        else if (event.keyCode === 39) playerMove(1);
        else if (event.keyCode === 40) playerDrop();
        else if (event.keyCode === 38) playerRotate(1);
        else if (event.keyCode === 32) { // Space
            while (!collide(board, player)) player.pos.y++;
            player.pos.y--;
            merge(board, player);
            playerReset();
            arenaSweep();
            updateScore();
            dropCounter = 0;
        }
        else if (event.keyCode === 80) togglePause(); // P
    } else if (gameState === 'PAUSED' && event.keyCode === 80) {
        togglePause();
    }
});

// 初始化显示
draw();
