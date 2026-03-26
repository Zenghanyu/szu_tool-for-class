/**
 * 校巴大冒险 - 校园跑酷
 */

(function() {
    const canvas = document.getElementById('busBoard');
    const ctx = canvas.getContext('2d');
    const scoreE = document.getElementById('busScore');
    const overlay = document.getElementById('busOverlay');
    const startBtn = document.getElementById('busStartBtn');

    canvas.width = 300; canvas.height = 450;

    let bus = { lane: 1, y: 350, width: 40, height: 70 };
    let obstacles = [];
    let score = 0;
    let speed = 5;
    let gameState = 'READY';
    let animationId = null;

    const LANES = [50, 150, 250];

    window.initBus = function() {
        score = 0; scoreE.innerText = score;
        bus.lane = 1; speed = 5;
        obstacles = [];
        overlay.classList.remove('hidden');
        draw();
    };

    window.stopBus = function() { gameState = 'STOPPED'; cancelAnimationFrame(animationId); };

    function createObstacle() {
        const lane = Math.floor(Math.random() * 3);
        const type = Math.random() > 0.5 ? '电单车' : '路障';
        obstacles.push({ lane, y: -100, width: 30, height: 30, type });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制车道
        ctx.strokeStyle = '#e2e8f0'; ctx.setLineDash([20, 20]);
        ctx.beginPath(); ctx.moveTo(100, 0); ctx.lineTo(100, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(200, 0); ctx.lineTo(200, canvas.height); ctx.stroke();
        ctx.setLineDash([]);

        // 绘制校巴 (深大蓝)
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath(); ctx.roundRect(LANES[bus.lane] - 20, bus.y, bus.width, bus.height, 5); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillText('🚌', LANES[bus.lane] - 10, bus.y + 40);

        // 绘制障碍
        obstacles.forEach(ob => {
            ctx.fillStyle = ob.type === '电单车' ? '#f87171' : '#fb923c';
            ctx.beginPath(); ctx.roundRect(LANES[ob.lane] - 15, ob.y, ob.width, ob.height, 5); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.fillText(ob.type === '电单车' ? '🛵' : '🚧', LANES[ob.lane] - 10, ob.y + 20);
        });
    }

    function update() {
        if (gameState !== 'PLAYING') return;

        score++; scoreE.innerText = Math.floor(score / 10);
        speed += 0.002;

        if (Math.random() < 0.02) createObstacle();

        obstacles.forEach((ob, idx) => {
            ob.y += speed;
            // 碰撞检测
            if (ob.lane === bus.lane && ob.y + ob.height > bus.y && ob.y < bus.y + bus.height) endGame();
        });

        obstacles = obstacles.filter(ob => ob.y < canvas.height);

        draw();
        animationId = requestAnimationFrame(update);
    }

    function endGame() {
        gameState = 'GAMEOVER';
        overlay.classList.remove('hidden');
    }

    // 划动控制
    let touchX = 0;
    canvas.addEventListener('touchstart', e => touchX = e.touches[0].clientX);
    canvas.addEventListener('touchend', e => {
        if (gameState !== 'PLAYING') return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (dx > 30 && bus.lane < 2) bus.lane++;
        if (dx < -30 && bus.lane > 0) bus.lane--;
    });

    startBtn.addEventListener('click', () => { gameState = 'PLAYING'; overlay.classList.add('hidden'); update(); });

})();
