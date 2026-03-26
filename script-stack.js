/**
 * 文山叠叠乐 - 建设深大科技楼
 */

(function() {
    const canvas = document.getElementById('stackBoard');
    const ctx = canvas.getContext('2d');
    const scoreE = document.getElementById('stackScore');
    const overlay = document.getElementById('stackOverlay');
    const startBtn = document.getElementById('stackStartBtn');

    canvas.width = 300; canvas.height = 450;

    let score = 0;
    let gameState = 'READY';
    let blocks = [];
    let currentBlock = null;
    let speed = 2;
    let direction = 1;

    window.initStack = function() {
        score = 0; scoreE.innerText = score;
        blocks = [{ x: 50, y: 400, width: 200, height: 30 }];
        currentBlock = { x: 0, y: 370, width: 200, height: 30 };
        speed = 2;
        overlay.classList.remove('hidden');
        draw();
    };

    window.stopStack = function() { gameState = 'STOPPED'; };

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制已落下的楼层
        ctx.fillStyle = '#9D1D22';
        blocks.forEach((b, i) => {
            ctx.globalAlpha = 1 - (blocks.length - i) * 0.1;
            ctx.fillRect(b.x, b.y, b.width, b.height);
        });
        ctx.globalAlpha = 1;

        // 绘制正在移动的楼层
        if (gameState === 'PLAYING') {
            ctx.fillStyle = '#f87171';
            ctx.fillRect(currentBlock.x, currentBlock.y, currentBlock.width, currentBlock.height);
        }
    }

    function update() {
        if (gameState !== 'PLAYING') return;

        currentBlock.x += speed * direction;
        if (currentBlock.x + currentBlock.width > canvas.width || currentBlock.x < 0) {
            direction *= -1;
        }

        draw();
        requestAnimationFrame(update);
    }

    function placeBlock() {
        if (gameState !== 'PLAYING') return;

        const lastBlock = blocks[blocks.length - 1];
        const overlapX = Math.max(currentBlock.x, lastBlock.x);
        const overlapWidth = Math.min(currentBlock.x + currentBlock.width, lastBlock.x + lastBlock.width) - overlapX;

        if (overlapWidth <= 0) {
            endGame();
        } else {
            // 放置成功
            blocks.push({ x: overlapX, y: currentBlock.y, width: overlapWidth, height: 30 });
            score++;
            scoreE.innerText = score;

            // 提升难度
            speed += 0.2;
            
            // 视角上移 (只保留最近10层)
            if (blocks.length > 8) {
                blocks.forEach(b => b.y += 30);
            } else {
                currentBlock.y -= 30;
            }

            // 下一个块
            currentBlock = { x: 0, y: blocks[blocks.length-1].y - 30, width: overlapWidth, height: 30 };
            direction = Math.random() > 0.5 ? 1 : -1;
        }
    }

    function endGame() {
        gameState = 'GAMEOVER';
        overlay.classList.remove('hidden');
    }

    startBtn.addEventListener('click', () => {
        gameState = 'PLAYING';
        overlay.classList.add('hidden');
        update();
    });

    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); placeBlock(); });
    canvas.addEventListener('mousedown', (e) => { e.preventDefault(); placeBlock(); });

})();
