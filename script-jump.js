/**
 * 荔枝跳跳 - 深大版 Flappy Bird
 */

(function() {
    const canvas = document.getElementById('jumpBoard');
    const ctx = canvas.getContext('2d');
    const scoreE = document.getElementById('jumpScore');
    const overlay = document.getElementById('jumpOverlay');
    const startScreen = document.getElementById('jumpStartScreen');
    const gameOverScreen = document.getElementById('jumpGameOverScreen');
    const startBtn = document.getElementById('jumpStartBtn');
    const restartBtn = document.getElementById('jumpRestartBtn');

    canvas.width = 300; canvas.height = 450;

    let bird = { x: 50, y: 150, velocity: 0, gravity: 0.5, jump: -7, radius: 12 };
    let pipes = [];
    let score = 0;
    let gameState = 'READY';
    let animationId = null;

    window.initJump = function() {
        score = 0; scoreE.innerText = score;
        bird.y = 150; bird.velocity = 0;
        pipes = [];
        overlay.classList.remove('hidden'); startScreen.classList.remove('hidden'); gameOverScreen.classList.add('hidden');
        draw();
    };

    window.stopJump = function() {
        gameState = 'STOPPED'; cancelAnimationFrame(animationId);
    };

    function createPipe() {
        const gap = 120;
        const minHeight = 50;
        const h = Math.random() * (canvas.height - gap - 2 * minHeight) + minHeight;
        pipes.push({ x: canvas.width, top: h, bottom: canvas.height - h - gap, width: 40 });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制荔枝
        ctx.fillStyle = '#9D1D22';
        ctx.beginPath(); ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI*2); ctx.fill();
        // 荔枝蒂
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(bird.x - 2, bird.y - bird.radius - 2, 4, 6);

        // 绘制管道
        ctx.fillStyle = '#64748b';
        pipes.forEach(p => {
            ctx.fillRect(p.x, 0, p.width, p.top);
            ctx.fillRect(p.x, canvas.height - p.bottom, p.width, p.bottom);
        });
    }

    function update() {
        if (gameState !== 'PLAYING') return;

        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        // 管道移动
        if (pipes.length === 0 || pipes[pipes.length-1].x < canvas.width - 150) createPipe();
        
        pipes.forEach(p => {
            p.x -= 2.5;
            // 碰撞检测
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + p.width) {
                if (bird.y - bird.radius < p.top || bird.y + bird.radius > canvas.height - p.bottom) endGame();
            }
            // 计分
            if (!p.scored && p.x + p.width < bird.x) {
                score++; scoreE.innerText = score; p.scored = true;
            }
        });

        pipes = pipes.filter(p => p.x + p.width > 0);

        if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) endGame();

        draw();
        animationId = requestAnimationFrame(update);
    }

    function endGame() {
        gameState = 'GAMEOVER';
        gameOverScreen.classList.remove('hidden'); overlay.classList.remove('hidden');
    }

    function handleJump() {
        if (gameState === 'PLAYING') bird.velocity = bird.jump;
    }

    startBtn.addEventListener('click', () => { gameState = 'PLAYING'; overlay.classList.add('hidden'); update(); });
    restartBtn.addEventListener('click', () => { initJump(); gameState = 'PLAYING'; overlay.classList.add('hidden'); update(); });
    
    // 全局点击跳转
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleJump(); });
    canvas.addEventListener('mousedown', (e) => { e.preventDefault(); handleJump(); });

})();
