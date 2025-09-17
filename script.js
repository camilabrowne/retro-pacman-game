class PacmanGame {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.gameOverElement = document.getElementById('game-over');
        this.gameOverText = document.getElementById('game-over-text');
        this.restartBtn = document.getElementById('restart-btn');

        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;

        // Game board layout (1 = wall, 0 = pellet, 2 = power pellet, 3 = empty)
        this.board = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
            [1,2,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,2,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1],
            [1,1,1,1,1,0,1,1,3,1,3,1,1,0,1,1,1,1,1],
            [3,3,3,3,1,0,1,3,3,3,3,3,1,0,1,3,3,3,3],
            [1,1,1,1,1,0,1,3,1,1,1,3,1,0,1,1,1,1,1],
            [3,3,3,3,3,0,3,3,1,3,1,3,3,0,3,3,3,3,3],
            [1,1,1,1,1,0,1,3,1,3,1,3,1,0,1,1,1,1,1],
            [3,3,3,3,1,0,1,3,3,3,3,3,1,0,1,3,3,3,3],
            [1,1,1,1,1,0,1,1,3,1,3,1,1,0,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1],
            [1,2,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,2,1],
            [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
            [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        this.pacman = { x: 9, y: 15, direction: 'right' };
        this.ghosts = [
            { x: 9, y: 9, direction: 'up', color: 'red', scared: false, scaredTimer: 0 },
            { x: 8, y: 10, direction: 'left', color: 'pink', scared: false, scaredTimer: 0 },
            { x: 10, y: 10, direction: 'right', color: 'cyan', scared: false, scaredTimer: 0 },
            { x: 9, y: 10, direction: 'down', color: 'orange', scared: false, scaredTimer: 0 }
        ];

        this.totalPellets = 0;
        this.pelletsEaten = 0;
        this.gameLoopId = null;

        this.initGame();
    }

    initGame() {
        this.createBoard();
        this.countPellets();
        this.updateScore();
        this.updateLives();
        this.setupEventListeners();
        this.startGame();
    }

    createBoard() {
        this.gameBoard.innerHTML = '';
        for (let y = 0; y < this.board.length; y++) {
            for (let x = 0; x < this.board[y].length; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${x}-${y}`;

                if (this.board[y][x] === 1) {
                    cell.classList.add('wall');
                } else if (this.board[y][x] === 0) {
                    cell.classList.add('path', 'pellet');
                } else if (this.board[y][x] === 2) {
                    cell.classList.add('path', 'power-pellet');
                } else {
                    cell.classList.add('path');
                }

                this.gameBoard.appendChild(cell);
            }
        }
        this.renderEntities();
    }

    countPellets() {
        this.totalPellets = 0;
        for (let y = 0; y < this.board.length; y++) {
            for (let x = 0; x < this.board[y].length; x++) {
                if (this.board[y][x] === 0 || this.board[y][x] === 2) {
                    this.totalPellets++;
                }
            }
        }
    }

    renderEntities() {
        // Clear previous entities
        document.querySelectorAll('.pacman, .ghost, .ghost-red, .ghost-pink, .ghost-cyan, .ghost-orange, .ghost-scared').forEach(el => {
            el.classList.remove('pacman', 'ghost', 'ghost-red', 'ghost-pink', 'ghost-cyan', 'ghost-orange', 'ghost-scared');
        });

        // Render Pacman
        const pacmanCell = document.getElementById(`cell-${this.pacman.x}-${this.pacman.y}`);
        if (pacmanCell) {
            pacmanCell.classList.add('pacman');
        }

        // Render Ghosts
        this.ghosts.forEach(ghost => {
            const ghostCell = document.getElementById(`cell-${ghost.x}-${ghost.y}`);
            if (ghostCell) {
                if (ghost.scared && ghost.scaredTimer > 0) {
                    ghostCell.classList.add('ghost', 'ghost-scared');
                } else {
                    ghostCell.classList.add('ghost', `ghost-${ghost.color}`);
                }
            }
        });
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;

            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.pacman.direction = 'up';
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.pacman.direction = 'down';
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.pacman.direction = 'left';
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.pacman.direction = 'right';
                    break;
            }
        });

        this.restartBtn.addEventListener('click', () => {
            this.resetGame();
        });
    }

    startGame() {
        this.gameRunning = true;
        this.gameLoop();
    }

    gameLoop() {
        if (!this.gameRunning) return;

        this.movePacman();
        this.moveGhosts();
        this.checkCollisions();
        this.updateScaredTimers();
        this.renderEntities();

        if (this.pelletsEaten >= this.totalPellets) {
            this.winGame();
            return;
        }

        this.gameLoopId = setTimeout(() => this.gameLoop(), 200);
    }

    movePacman() {
        let newX = this.pacman.x;
        let newY = this.pacman.y;

        switch(this.pacman.direction) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }

        // Handle tunnel effect (left-right edges)
        if (newX < 0) newX = this.board[0].length - 1;
        if (newX >= this.board[0].length) newX = 0;

        // Check boundaries and walls
        if (newY >= 0 && newY < this.board.length && this.board[newY][newX] !== 1) {
            this.pacman.x = newX;
            this.pacman.y = newY;

            // Eat pellets
            if (this.board[newY][newX] === 0) {
                this.board[newY][newX] = 3;
                this.score += 10;
                this.pelletsEaten++;
                this.updateScore();

                // Remove pellet from display
                const cell = document.getElementById(`cell-${newX}-${newY}`);
                cell.classList.remove('pellet');
            } else if (this.board[newY][newX] === 2) {
                this.board[newY][newX] = 3;
                this.score += 50;
                this.pelletsEaten++;
                this.updateScore();

                // Power pellet - scare ghosts
                this.ghosts.forEach(ghost => {
                    ghost.scared = true;
                    ghost.scaredTimer = 100; // 20 seconds at 200ms intervals
                });

                // Remove power pellet from display
                const cell = document.getElementById(`cell-${newX}-${newY}`);
                cell.classList.remove('power-pellet');
            }
        }
    }

    moveGhosts() {
        this.ghosts.forEach(ghost => {
            let possibleMoves = this.getPossibleMoves(ghost.x, ghost.y);

            // Remove opposite direction to prevent immediate reversal
            const oppositeDirection = this.getOppositeDirection(ghost.direction);
            possibleMoves = possibleMoves.filter(dir => dir !== oppositeDirection);

            if (possibleMoves.length === 0) {
                possibleMoves = this.getPossibleMoves(ghost.x, ghost.y);
            }

            // Simple AI: if scared, move away from Pacman, otherwise move towards Pacman
            let bestMove;
            if (ghost.scared && ghost.scaredTimer > 0) {
                bestMove = this.getRandomMove(possibleMoves);
            } else {
                bestMove = this.getBestMoveTowardsPacman(ghost, possibleMoves);
            }

            ghost.direction = bestMove;
            const newPos = this.getNewPosition(ghost.x, ghost.y, bestMove);
            ghost.x = newPos.x;
            ghost.y = newPos.y;
        });
    }

    getPossibleMoves(x, y) {
        const moves = [];
        const directions = ['up', 'down', 'left', 'right'];

        directions.forEach(direction => {
            const newPos = this.getNewPosition(x, y, direction);
            if (this.isValidPosition(newPos.x, newPos.y)) {
                moves.push(direction);
            }
        });

        return moves;
    }

    getNewPosition(x, y, direction) {
        let newX = x, newY = y;

        switch(direction) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }

        // Handle tunnel effect
        if (newX < 0) newX = this.board[0].length - 1;
        if (newX >= this.board[0].length) newX = 0;

        return { x: newX, y: newY };
    }

    isValidPosition(x, y) {
        return y >= 0 && y < this.board.length && this.board[y][x] !== 1;
    }

    getOppositeDirection(direction) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        return opposites[direction];
    }

    getRandomMove(moves) {
        return moves[Math.floor(Math.random() * moves.length)];
    }

    getBestMoveTowardsPacman(ghost, possibleMoves) {
        let bestMove = possibleMoves[0];
        let shortestDistance = Infinity;

        possibleMoves.forEach(move => {
            const newPos = this.getNewPosition(ghost.x, ghost.y, move);
            const distance = Math.abs(newPos.x - this.pacman.x) + Math.abs(newPos.y - this.pacman.y);

            if (distance < shortestDistance) {
                shortestDistance = distance;
                bestMove = move;
            }
        });

        return bestMove;
    }

    checkCollisions() {
        this.ghosts.forEach((ghost, index) => {
            if (ghost.x === this.pacman.x && ghost.y === this.pacman.y) {
                if (ghost.scared && ghost.scaredTimer > 0) {
                    // Eat ghost
                    this.score += 200;
                    this.updateScore();
                    ghost.scared = false;
                    ghost.scaredTimer = 0;
                    // Reset ghost to center
                    ghost.x = 9;
                    ghost.y = 9;
                } else {
                    // Pacman dies
                    this.lives--;
                    this.updateLives();
                    this.resetPositions();

                    if (this.lives <= 0) {
                        this.gameOver();
                        return;
                    }
                }
            }
        });
    }

    updateScaredTimers() {
        this.ghosts.forEach(ghost => {
            if (ghost.scared && ghost.scaredTimer > 0) {
                ghost.scaredTimer--;
                if (ghost.scaredTimer <= 0) {
                    ghost.scared = false;
                }
            }
        });
    }

    resetPositions() {
        this.pacman.x = 9;
        this.pacman.y = 15;
        this.pacman.direction = 'right';

        this.ghosts[0] = { x: 9, y: 9, direction: 'up', color: 'red', scared: false, scaredTimer: 0 };
        this.ghosts[1] = { x: 8, y: 10, direction: 'left', color: 'pink', scared: false, scaredTimer: 0 };
        this.ghosts[2] = { x: 10, y: 10, direction: 'right', color: 'cyan', scared: false, scaredTimer: 0 };
        this.ghosts[3] = { x: 9, y: 10, direction: 'down', color: 'orange', scared: false, scaredTimer: 0 };
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    updateLives() {
        this.livesElement.textContent = this.lives;
    }

    gameOver() {
        this.gameRunning = false;
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
        }
        this.gameOverText.textContent = 'Game Over!';
        this.gameOverElement.style.display = 'block';
    }

    winGame() {
        this.gameRunning = false;
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
        }
        this.gameOverText.textContent = 'You Win!';
        this.gameOverElement.style.display = 'block';
    }

    resetGame() {
        this.gameRunning = false;
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
        }

        this.score = 0;
        this.lives = 3;
        this.pelletsEaten = 0;

        // Reset board
        this.board = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
            [1,2,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,2,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1],
            [1,1,1,1,1,0,1,1,3,1,3,1,1,0,1,1,1,1,1],
            [3,3,3,3,1,0,1,3,3,3,3,3,1,0,1,3,3,3,3],
            [1,1,1,1,1,0,1,3,1,1,1,3,1,0,1,1,1,1,1],
            [3,3,3,3,3,0,3,3,1,3,1,3,3,0,3,3,3,3,3],
            [1,1,1,1,1,0,1,3,1,3,1,3,1,0,1,1,1,1,1],
            [3,3,3,3,1,0,1,3,3,3,3,3,1,0,1,3,3,3,3],
            [1,1,1,1,1,0,1,1,3,1,3,1,1,0,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1],
            [1,2,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,2,1],
            [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
            [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        this.resetPositions();
        this.gameOverElement.style.display = 'none';
        this.createBoard();
        this.countPellets();
        this.updateScore();
        this.updateLives();
        this.startGame();
    }
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new PacmanGame();
});