/**
 * 美食消消乐 - 深大食堂版
 */

(function() {
    const gridE = document.getElementById('matchGrid');
    const scoreE = document.getElementById('matchScore');
    const overlay = document.getElementById('matchOverlay');
    const startBtn = document.getElementById('matchStartBtn');

    const SIZE = 8;
    const FOODS = ['🍱', '🍗', '🍜', '🍤', '🍚', '🍔'];
    let grid = [];
    let score = 0;
    let selectedCell = null;
    let gameState = 'READY';

    window.initMatch = function() {
        score = 0; scoreE.innerText = score;
        gameState = 'READY';
        createGrid();
        overlay.classList.remove('hidden');
    };

    window.stopMatch = function() { gameState = 'STOPPED'; };

    function createGrid() {
        grid = [];
        gridE.innerHTML = '';
        for (let r = 0; r < SIZE; r++) {
            grid[r] = [];
            for (let c = 0; c < SIZE; c++) {
                let type;
                do { type = FOODS[Math.floor(Math.random() * FOODS.length)]; } 
                while (checkInitialMatch(r, c, type));
                
                grid[r][c] = type;
                const item = document.createElement('div');
                item.className = 'match-item';
                item.innerText = type;
                item.dataset.r = r;
                item.dataset.c = c;
                item.onclick = () => handleCellClick(r, c, item);
                gridE.appendChild(item);
            }
        }
    }

    function checkInitialMatch(r, c, type) {
        if (c >= 2 && grid[r][c-1] === type && grid[r][c-2] === type) return true;
        if (r >= 2 && grid[r-1][c] === type && grid[r-2][c] === type) return true;
        return false;
    }

    function handleCellClick(r, c, el) {
        if (gameState !== 'PLAYING') return;

        if (!selectedCell) {
            selectedCell = { r, c, el };
            el.classList.add('selected');
        } else {
            const dr = Math.abs(r - selectedCell.r);
            const dc = Math.abs(c - selectedCell.c);
            
            if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
                swap(r, c, selectedCell.r, selectedCell.c);
                if (!checkMatches()) {
                    // 换回来
                    setTimeout(() => swap(r, c, selectedCell.r, selectedCell.c), 300);
                }
            }
            
            selectedCell.el.classList.remove('selected');
            selectedCell = null;
        }
    }

    function swap(r1, c1, r2, c2) {
        const temp = grid[r1][c1];
        grid[r1][c1] = grid[r2][c2];
        grid[r2][c2] = temp;
        renderGrid();
    }

    function renderGrid() {
        const items = gridE.querySelectorAll('.match-item');
        grid.forEach((row, r) => {
            row.forEach((type, c) => {
                items[r * SIZE + c].innerText = type;
            });
        });
    }

    function checkMatches() {
        let matched = false;
        let toRemove = new Set();

        // 横向
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE - 2; c++) {
                if (grid[r][c] && grid[r][c] === grid[r][c+1] && grid[r][c] === grid[r][c+2]) {
                    toRemove.add(`${r},${c}`); toRemove.add(`${r},${c+1}`); toRemove.add(`${r},${c+2}`);
                    matched = true;
                }
            }
        }
        // 纵向
        for (let c = 0; c < SIZE; c++) {
            for (let r = 0; r < SIZE - 2; r++) {
                if (grid[r][c] && grid[r][c] === grid[r+1][c] && grid[r][c] === grid[r+2][c]) {
                    toRemove.add(`${r},${c}`); toRemove.add(`${r+1},${c}`); toRemove.add(`${r+2},${c}`);
                    matched = true;
                }
            }
        }

        if (matched) {
            score += toRemove.size * 10;
            scoreE.innerText = score;
            toRemove.forEach(pos => {
                const [r, c] = pos.split(',').map(Number);
                grid[r][c] = null;
            });
            setTimeout(fillGrid, 300);
        }
        return matched;
    }

    function fillGrid() {
        for (let c = 0; c < SIZE; c++) {
            let emptySpaces = 0;
            for (let r = SIZE - 1; r >= 0; r--) {
                if (grid[r][c] === null) emptySpaces++;
                else if (emptySpaces > 0) {
                    grid[r + emptySpaces][c] = grid[r][c];
                    grid[r][c] = null;
                }
            }
            for (let r = 0; r < emptySpaces; r++) {
                grid[r][c] = FOODS[Math.floor(Math.random() * FOODS.length)];
            }
        }
        renderGrid();
        setTimeout(checkMatches, 300);
    }

    startBtn.addEventListener('click', () => {
        gameState = 'PLAYING';
        overlay.classList.add('hidden');
    });

})();
