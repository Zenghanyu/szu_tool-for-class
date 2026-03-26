/**
 * 深大百宝箱 - 核心管理 (8合1版)
 */

const mainHub = document.getElementById('mainHub');
const gameContainers = {
    tetris: document.getElementById('tetrisContainer'),
    '2048': document.getElementById('two048Container'),
    jump: document.getElementById('jumpContainer'),
    snake: document.getElementById('snakeContainer'),
    color: document.getElementById('colorContainer'),
    stack: document.getElementById('stackContainer'),
    bus: document.getElementById('busContainer'),
    match: document.getElementById('matchContainer')
};

window.currentGame = null;

function switchGame(gameId) {
    mainHub.classList.add('hidden');
    Object.values(gameContainers).forEach(c => c.classList.add('hidden'));
    gameContainers[gameId].classList.remove('hidden');
    window.currentGame = gameId;

    if (gameId === 'tetris') initTetris();
    else if (gameId === '2048') init2048();
    else if (gameId === 'jump') initJump();
    else if (gameId === 'snake') initSnake();
    else if (gameId === 'color') initColor();
    else if (gameId === 'stack') initStack();
    else if (gameId === 'bus') initBus();
    else if (gameId === 'match') initMatch();
}

function goBack() {
    stopTetris(); stop2048(); stopJump(); stopSnake();
    stopColor(); stopStack(); stopBus(); stopMatch();
    
    Object.values(gameContainers).forEach(c => c.classList.add('hidden'));
    mainHub.classList.remove('hidden');
    window.currentGame = null;
}

document.addEventListener('keydown', (e) => {
    if (!window.currentGame) return;
    if (window.currentGame === 'tetris') handleTetrisKey(e);
    else if (window.currentGame === '2048') handle2048Key(e);
    else if (window.currentGame === 'snake') handleSnakeKey(e);
});
