/**
 * 眼力深大 - 找茬色块
 */

(function() {
    const grid = document.getElementById('colorGrid');
    const timeE = document.getElementById('colorTime');
    const scoreText = document.getElementById('colorFinalScore');
    const overlay = document.getElementById('colorOverlay');
    const startScreen = document.getElementById('colorStartScreen');
    const gameOverScreen = document.getElementById('colorGameOverScreen');
    const startBtn = document.getElementById('colorStartBtn');
    const restartBtn = document.getElementById('colorRestartBtn');

    let score = 0;
    let timeLeft = 30;
    let level = 2; // n x n
    let timerId = null;
    let gameState = 'READY';

    window.initColor = function() {
        score = 0; timeLeft = 30; level = 2;
        timeE.innerText = timeLeft;
        grid.innerHTML = '';
        overlay.classList.remove('hidden'); startScreen.classList.remove('hidden'); gameOverScreen.classList.add('hidden');
    };

    window.stopColor = function() {
        gameState = 'STOPPED'; clearInterval(timerId);
    };

    function generateRound() {
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${level}, 1fr)`;
        
        const baseH = Math.floor(Math.random() * 360);
        const baseS = 60 + Math.random() * 20;
        const baseL = 40 + Math.random() * 20;
        
        const diff = Math.max(2, 15 - Math.floor(score / 5)); // 难度随得分增加
        const diffL = baseL > 50 ? baseL - diff : baseL + diff;
        
        const correctIdx = Math.floor(Math.random() * (level * level));
        
        for (let i = 0; i < level * level; i++) {
            const block = document.createElement('div');
            block.className = 'color-block';
            block.style.backgroundColor = `hsl(${baseH}, ${baseS}%, ${i === correctIdx ? diffL : baseL}%)`;
            
            block.onclick = () => {
                if (gameState !== 'PLAYING') return;
                if (i === correctIdx) {
                    score++;
                    if (score % 3 === 0 && level < 8) level++;
                    generateRound();
                } else {
                    timeLeft = Math.max(0, timeLeft - 2); // 点错扣时间
                }
            };
            grid.appendChild(block);
        }
    }

    function startTimer() {
        timerId = setInterval(() => {
            timeLeft--;
            timeE.innerText = timeLeft;
            if (timeLeft <= 0) endGame();
        }, 1000);
    }

    function endGame() {
        gameState = 'GAMEOVER';
        clearInterval(timerId);
        scoreText.innerText = `得分: ${score}`;
        gameOverScreen.classList.remove('hidden'); overlay.classList.remove('hidden');
    }

    startBtn.addEventListener('click', () => { 
        gameState = 'PLAYING'; overlay.classList.add('hidden'); 
        generateRound(); startTimer(); 
    });
    
    restartBtn.addEventListener('click', () => { 
        initColor(); gameState = 'PLAYING'; overlay.classList.add('hidden'); 
        generateRound(); startTimer(); 
    });

})();
