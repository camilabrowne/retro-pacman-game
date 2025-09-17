// 4-Player Asymmetric Pacman Game: 1 Pacman vs 3 Ghost Players
class AsymmetricPacmanGame {
    constructor() {
        this.isMultiplayer = false;
        this.isHost = false;
        this.playerId = this.generatePlayerId();
        this.roomCode = null;
        this.peers = new Map();
        this.players = new Map();
        this.maxPlayers = 4;

        // Player roles
        this.roles = {
            PACMAN: 'pacman',
            GHOST_RED: 'ghost-red',
            GHOST_PINK: 'ghost-pink',
            GHOST_CYAN: 'ghost-cyan'
        };

        // Game elements
        this.gameBoard = document.getElementById('game-board');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.gameOverElement = document.getElementById('game-over');
        this.gameOverText = document.getElementById('game-over-text');
        this.restartBtn = document.getElementById('restart-btn');

        // Multiplayer elements
        this.multiplayerLobby = document.getElementById('multiplayer-lobby');
        this.gameUI = document.getElementById('game-ui');
        this.roomCodeElement = document.getElementById('room-code');
        this.playersContainer = document.getElementById('players-container');
        this.playersStatus = document.getElementById('players-status');

        // Game state
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.gameWinner = null;

        // Game board layout
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

        this.totalPellets = 0;
        this.pelletsEaten = 0;
        this.gameLoopId = null;
        this.powerPelletTimer = 0;

        // Initialize the game
        this.initGame();
    }

    generatePlayerId() {
        return Math.random().toString(36).substr(2, 8);
    }

    generateRoomCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    initGame() {
        this.setupEventListeners();
        this.showLobby();
    }

    showLobby() {
        this.multiplayerLobby.style.display = 'block';
        this.gameUI.style.display = 'none';
    }

    showGame() {
        this.multiplayerLobby.style.display = 'none';
        this.gameUI.style.display = 'block';

        if (this.isMultiplayer) {
            document.getElementById('room-info').style.display = 'block';
            document.getElementById('current-room').textContent = this.roomCode;
        }
    }

    setupEventListeners() {
        // Lobby buttons
        document.getElementById('single-player-btn').addEventListener('click', () => {
            this.startSinglePlayer();
        });

        document.getElementById('create-room-btn').addEventListener('click', () => {
            this.showCreateRoom();
        });

        document.getElementById('join-room-btn').addEventListener('click', () => {
            this.showJoinRoom();
        });

        document.getElementById('copy-room-btn').addEventListener('click', () => {
            this.copyRoomCode();
        });

        document.getElementById('connect-room-btn').addEventListener('click', () => {
            const roomCode = document.getElementById('room-code-input').value;
            this.joinRoom(roomCode);
        });

        document.getElementById('start-multiplayer-btn').addEventListener('click', () => {
            this.startMultiplayerGame();
        });

        document.getElementById('back-to-lobby-btn').addEventListener('click', () => {
            this.backToLobby();
        });

        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.backToLobby();
        });

        // Game controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;

            let newDirection = null;
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    newDirection = 'up';
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    newDirection = 'down';
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    newDirection = 'left';
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    newDirection = 'right';
                    break;
            }

            if (newDirection) {
                if (this.isMultiplayer) {
                    const player = this.players.get(this.playerId);
                    if (player) {
                        player.direction = newDirection;
                        this.broadcastPlayerUpdate();
                    }
                } else {
                    this.pacman.direction = newDirection;
                }
            }
        });

        this.restartBtn.addEventListener('click', () => {
            this.resetGame();
        });
    }

    showCreateRoom() {
        document.getElementById('room-controls').style.display = 'block';
        document.getElementById('room-code-section').style.display = 'block';
        document.getElementById('join-room-section').style.display = 'none';

        this.roomCode = this.generateRoomCode();
        this.roomCodeElement.textContent = this.roomCode;
        this.isHost = true;
        this.isMultiplayer = true;

        // Add host as first player
        this.addPlayer(this.playerId, 'Host (You)', null);
        this.updatePlayersList();
        this.updateStartButton();
    }

    showJoinRoom() {
        document.getElementById('room-controls').style.display = 'block';
        document.getElementById('room-code-section').style.display = 'none';
        document.getElementById('join-room-section').style.display = 'block';
        document.getElementById('start-multiplayer-btn').style.display = 'none';
    }

    async copyRoomCode() {
        try {
            await navigator.clipboard.writeText(this.roomCode);
            const btn = document.getElementById('copy-room-btn');
            const originalText = btn.textContent;
            btn.textContent = 'COPIED!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 1000);
        } catch (err) {
            console.error('Failed to copy room code:', err);
        }
    }

    backToLobby() {
        // Clean up connections
        this.peers.forEach(peer => peer.close());
        this.peers.clear();
        this.players.clear();

        // Reset state
        this.isMultiplayer = false;
        this.isHost = false;
        this.roomCode = null;
        this.gameRunning = false;
        this.gameWinner = null;

        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
        }

        // Hide all room controls
        document.getElementById('room-controls').style.display = 'none';
        document.getElementById('connection-status').style.display = 'none';

        this.showLobby();
    }

    startSinglePlayer() {
        this.isMultiplayer = false;
        this.setupSinglePlayerGame();
        this.showGame();
        this.startGame();
    }

    setupSinglePlayerGame() {
        this.pacman = { x: 9, y: 15, direction: 'right' };
        // Traditional AI ghosts for single player
        this.ghosts = [
            { x: 9, y: 9, direction: 'up', color: 'red', scared: false, scaredTimer: 0 },
            { x: 8, y: 10, direction: 'left', color: 'pink', scared: false, scaredTimer: 0 },
            { x: 10, y: 10, direction: 'right', color: 'cyan', scared: false, scaredTimer: 0 }
        ];

        this.createBoard();
        this.countPellets();
        this.updateScore();
        this.updateLives();
    }

    async joinRoom(roomCode) {
        if (!roomCode || roomCode.length !== 6) {
            alert('Please enter a valid 6-digit room code');
            return;
        }

        this.roomCode = roomCode;
        this.isHost = false;
        this.isMultiplayer = true;

        document.getElementById('connection-status').style.display = 'block';
        document.getElementById('connection-text').textContent = 'Connecting to room...';

        // Simulate joining by creating mock players
        setTimeout(() => {
            this.addPlayer('host123', 'Host', null);
            this.addPlayer('player2', 'Player 2', null);
            this.addPlayer(this.playerId, 'You', null);
            this.updatePlayersList();
            this.updateStartButton();
            document.getElementById('connection-status').style.display = 'none';
            document.getElementById('room-controls').style.display = 'block';
        }, 2000);
    }

    addPlayer(playerId, name, role) {
        const player = {
            id: playerId,
            name: name,
            role: role,
            x: 9,
            y: 15,
            direction: 'right',
            score: 0,
            lives: 3,
            scared: false,
            scaredTimer: 0
        };

        this.players.set(playerId, player);
    }

    assignRoles() {
        const playerIds = Array.from(this.players.keys());
        const roles = [this.roles.PACMAN, this.roles.GHOST_RED, this.roles.GHOST_PINK, this.roles.GHOST_CYAN];

        // Shuffle roles randomly
        for (let i = roles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [roles[i], roles[j]] = [roles[j], roles[i]];
        }

        // Assign roles to players
        playerIds.forEach((playerId, index) => {
            const player = this.players.get(playerId);
            player.role = roles[index];

            // Set starting positions based on role
            if (player.role === this.roles.PACMAN) {
                player.x = 9;
                player.y = 15;
                player.lives = 3;
            } else {
                // Ghost starting positions
                const ghostPositions = [
                    { x: 9, y: 9 },   // Center
                    { x: 8, y: 10 },  // Left
                    { x: 10, y: 10 }  // Right
                ];
                const ghostIndex = index - 1; // Since first role is Pacman
                if (ghostPositions[ghostIndex]) {
                    player.x = ghostPositions[ghostIndex].x;
                    player.y = ghostPositions[ghostIndex].y;
                }
                player.lives = 1; // Ghosts have 1 life
            }
        });
    }

    updatePlayersList() {
        const container = this.playersContainer;
        container.innerHTML = '';

        this.players.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';

            let roleText = player.role ? player.role.replace('-', ' ').toUpperCase() : 'Waiting...';
            let roleColor = '#ffffff';

            if (player.role === this.roles.PACMAN) {
                roleColor = '#ffff00';
            } else if (player.role && player.role.includes('ghost')) {
                const colorMap = {
                    'ghost-red': '#ff0000',
                    'ghost-pink': '#ffb6c1',
                    'ghost-cyan': '#00ffff'
                };
                roleColor = colorMap[player.role] || '#ffffff';
            }

            playerItem.style.borderLeftColor = roleColor;

            playerItem.innerHTML = `
                <div>
                    <span class="player-name">${player.name}</span>
                    <div style="font-size: 0.4em; color: ${roleColor};">${roleText}</div>
                </div>
                <div class="player-color" style="background-color: ${roleColor}"></div>
            `;

            container.appendChild(playerItem);
        });
    }

    updateStartButton() {
        const startBtn = document.getElementById('start-multiplayer-btn');
        if (this.players.size === this.maxPlayers) {
            startBtn.style.display = 'block';
            startBtn.textContent = 'Start Game';
        } else {
            startBtn.style.display = 'block';
            startBtn.textContent = `Waiting for players (${this.players.size}/${this.maxPlayers})`;
            startBtn.disabled = true;
        }

        // Enable button when we have 4 players
        startBtn.disabled = this.players.size !== this.maxPlayers;
    }

    updatePlayersStatus() {
        const container = this.playersStatus;
        container.innerHTML = '';

        this.players.forEach(player => {
            const statusItem = document.createElement('div');
            statusItem.className = 'player-status';

            let roleColor = '#ffffff';
            if (player.role === this.roles.PACMAN) {
                roleColor = '#ffff00';
            } else if (player.role && player.role.includes('ghost')) {
                const colorMap = {
                    'ghost-red': '#ff0000',
                    'ghost-pink': '#ffb6c1',
                    'ghost-cyan': '#00ffff'
                };
                roleColor = colorMap[player.role] || '#ffffff';
            }

            statusItem.style.borderColor = roleColor;

            const roleIcon = player.role === this.roles.PACMAN ? '🟡' : '👻';
            statusItem.innerHTML = `
                <div class="player-status-color" style="background-color: ${roleColor}"></div>
                <span class="player-status-name">${roleIcon} ${player.name}: ${player.score}</span>
            `;

            container.appendChild(statusItem);
        });
    }

    startMultiplayerGame() {
        if (this.players.size !== this.maxPlayers) {
            alert(`Need exactly ${this.maxPlayers} players to start`);
            return;
        }

        this.assignRoles();
        this.setupMultiplayerGame();
        this.showGame();
        this.startGame();
    }

    setupMultiplayerGame() {
        this.createBoard();
        this.countPellets();
        this.updateScore();
        this.updateLives();
        this.updatePlayersStatus();
    }

    broadcastPlayerUpdate() {
        const player = this.players.get(this.playerId);
        const update = {
            type: 'playerUpdate',
            playerId: this.playerId,
            player: player
        };

        // In a real implementation, broadcast to all peers
        // For now, just update locally
        this.updatePlayersStatus();
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
        document.querySelectorAll('.pacman, .ghost, .ghost-red, .ghost-pink, .ghost-cyan, .ghost-orange, .ghost-scared, .facing-up, .facing-down, .facing-left, .facing-right').forEach(el => {
            el.classList.remove('pacman', 'ghost', 'ghost-red', 'ghost-pink', 'ghost-cyan', 'ghost-orange', 'ghost-scared', 'facing-up', 'facing-down', 'facing-left', 'facing-right');
        });

        if (this.isMultiplayer) {
            // Render all players
            this.players.forEach(player => {
                const playerCell = document.getElementById(`cell-${player.x}-${player.y}`);
                if (playerCell) {
                    if (player.role === this.roles.PACMAN) {
                        playerCell.classList.add('pacman', `facing-${player.direction}`);
                    } else if (player.role && player.role.includes('ghost')) {
                        const ghostClass = player.scared && player.scaredTimer > 0 ? 'ghost-scared' : player.role;
                        playerCell.classList.add('ghost', ghostClass);
                    }
                }
            });
        } else {
            // Render single player Pacman
            const pacmanCell = document.getElementById(`cell-${this.pacman.x}-${this.pacman.y}`);
            if (pacmanCell) {
                pacmanCell.classList.add('pacman', `facing-${this.pacman.direction}`);
            }

            // Render AI ghosts
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
    }

    startGame() {
        this.gameRunning = true;
        this.gameLoop();
    }

    gameLoop() {
        if (!this.gameRunning) return;

        if (this.isMultiplayer) {
            this.moveMultiplayerEntities();
        } else {
            this.movePacman();
            this.moveGhosts();
        }

        this.checkCollisions();
        this.updateScaredTimers();
        this.renderEntities();

        // Check win conditions
        if (this.isMultiplayer) {
            this.checkMultiplayerWinConditions();
        } else if (this.pelletsEaten >= this.totalPellets) {
            this.winGame();
            return;
        }

        this.gameLoopId = setTimeout(() => this.gameLoop(), 300); // Slower speed: 300ms instead of 200ms
    }

    moveMultiplayerEntities() {
        this.players.forEach(player => {
            if (player.role === this.roles.PACMAN) {
                this.moveMultiplayerPacman(player);
            } else if (player.role && player.role.includes('ghost')) {
                this.moveMultiplayerGhost(player);
            }
        });
    }

    moveMultiplayerPacman(pacmanPlayer) {
        let newX = pacmanPlayer.x;
        let newY = pacmanPlayer.y;

        switch(pacmanPlayer.direction) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }

        // Handle tunnel effect
        if (newX < 0) newX = this.board[0].length - 1;
        if (newX >= this.board[0].length) newX = 0;

        // Check boundaries and walls
        if (newY >= 0 && newY < this.board.length && this.board[newY][newX] !== 1) {
            pacmanPlayer.x = newX;
            pacmanPlayer.y = newY;

            // Handle pellet collection
            if (this.board[newY][newX] === 0) {
                this.board[newY][newX] = 3;
                pacmanPlayer.score += 10;
                this.pelletsEaten++;

                const cell = document.getElementById(`cell-${newX}-${newY}`);
                cell.classList.remove('pellet');
            } else if (this.board[newY][newX] === 2) {
                this.board[newY][newX] = 3;
                pacmanPlayer.score += 50;
                this.pelletsEaten++;
                this.powerPelletTimer = 100; // 30 seconds at 300ms intervals

                // Scare all ghost players
                this.players.forEach(player => {
                    if (player.role && player.role.includes('ghost')) {
                        player.scared = true;
                        player.scaredTimer = this.powerPelletTimer;
                    }
                });

                const cell = document.getElementById(`cell-${newX}-${newY}`);
                cell.classList.remove('power-pellet');
            }
        }

        this.updatePlayersStatus();
        this.updateScore();
    }

    moveMultiplayerGhost(ghostPlayer) {
        let newX = ghostPlayer.x;
        let newY = ghostPlayer.y;

        switch(ghostPlayer.direction) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }

        // Handle tunnel effect
        if (newX < 0) newX = this.board[0].length - 1;
        if (newX >= this.board[0].length) newX = 0;

        // Check boundaries and walls
        if (newY >= 0 && newY < this.board.length && this.board[newY][newX] !== 1) {
            ghostPlayer.x = newX;
            ghostPlayer.y = newY;
        }
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

        // Handle tunnel effect
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
                    ghost.scaredTimer = 100;
                });

                const cell = document.getElementById(`cell-${newX}-${newY}`);
                cell.classList.remove('power-pellet');
            }
        }
    }

    moveGhosts() {
        this.ghosts.forEach(ghost => {
            let possibleMoves = this.getPossibleMoves(ghost.x, ghost.y);
            const oppositeDirection = this.getOppositeDirection(ghost.direction);
            possibleMoves = possibleMoves.filter(dir => dir !== oppositeDirection);

            if (possibleMoves.length === 0) {
                possibleMoves = this.getPossibleMoves(ghost.x, ghost.y);
            }

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
        if (this.isMultiplayer) {
            const pacmanPlayer = Array.from(this.players.values()).find(p => p.role === this.roles.PACMAN);
            if (!pacmanPlayer) return;

            this.players.forEach(player => {
                if (player.role && player.role.includes('ghost') &&
                    player.x === pacmanPlayer.x && player.y === pacmanPlayer.y) {

                    if (player.scared && player.scaredTimer > 0) {
                        // Pacman eats ghost
                        pacmanPlayer.score += 200;
                        player.scared = false;
                        player.scaredTimer = 0;
                        // Reset ghost to starting position
                        const ghostPositions = [
                            { x: 9, y: 9 },
                            { x: 8, y: 10 },
                            { x: 10, y: 10 }
                        ];
                        const ghostIndex = player.role === this.roles.GHOST_RED ? 0 :
                                          player.role === this.roles.GHOST_PINK ? 1 : 2;
                        if (ghostPositions[ghostIndex]) {
                            player.x = ghostPositions[ghostIndex].x;
                            player.y = ghostPositions[ghostIndex].y;
                        }
                    } else {
                        // Ghost catches Pacman
                        this.gameWinner = 'ghosts';
                        this.gameOver();
                        return;
                    }
                }
            });
        } else {
            // Single player collision check
            this.ghosts.forEach(ghost => {
                if (ghost.x === this.pacman.x && ghost.y === this.pacman.y) {
                    if (ghost.scared && ghost.scaredTimer > 0) {
                        this.score += 200;
                        this.updateScore();
                        ghost.scared = false;
                        ghost.scaredTimer = 0;
                        ghost.x = 9;
                        ghost.y = 9;
                    } else {
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
    }

    updateScaredTimers() {
        if (this.powerPelletTimer > 0) {
            this.powerPelletTimer--;
        }

        if (this.isMultiplayer) {
            this.players.forEach(player => {
                if (player.scared && player.scaredTimer > 0) {
                    player.scaredTimer--;
                    if (player.scaredTimer <= 0) {
                        player.scared = false;
                    }
                }
            });
        } else {
            this.ghosts.forEach(ghost => {
                if (ghost.scared && ghost.scaredTimer > 0) {
                    ghost.scaredTimer--;
                    if (ghost.scaredTimer <= 0) {
                        ghost.scared = false;
                    }
                }
            });
        }
    }

    checkMultiplayerWinConditions() {
        // Pacman wins by collecting all pellets
        if (this.pelletsEaten >= this.totalPellets) {
            this.gameWinner = 'pacman';
            this.winGame();
        }
    }

    resetPositions() {
        this.pacman.x = 9;
        this.pacman.y = 15;
        this.pacman.direction = 'right';

        if (this.ghosts) {
            this.ghosts[0] = { x: 9, y: 9, direction: 'up', color: 'red', scared: false, scaredTimer: 0 };
            this.ghosts[1] = { x: 8, y: 10, direction: 'left', color: 'pink', scared: false, scaredTimer: 0 };
            this.ghosts[2] = { x: 10, y: 10, direction: 'right', color: 'cyan', scared: false, scaredTimer: 0 };
        }
    }

    updateScore() {
        if (this.isMultiplayer) {
            const pacmanPlayer = Array.from(this.players.values()).find(p => p.role === this.roles.PACMAN);
            this.scoreElement.textContent = pacmanPlayer ? pacmanPlayer.score : 0;
        } else {
            this.scoreElement.textContent = this.score;
        }
    }

    updateLives() {
        if (this.isMultiplayer) {
            const pacmanPlayer = Array.from(this.players.values()).find(p => p.role === this.roles.PACMAN);
            this.livesElement.textContent = pacmanPlayer ? pacmanPlayer.lives : 0;
        } else {
            this.livesElement.textContent = this.lives;
        }
    }

    gameOver() {
        this.gameRunning = false;
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
        }

        if (this.isMultiplayer) {
            if (this.gameWinner === 'ghosts') {
                this.gameOverText.textContent = 'Ghosts Win!';
            } else {
                this.gameOverText.textContent = 'Game Over!';
            }
        } else {
            this.gameOverText.textContent = 'Game Over!';
        }

        this.gameOverElement.style.display = 'block';
    }

    winGame() {
        this.gameRunning = false;
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
        }

        if (this.isMultiplayer && this.gameWinner === 'pacman') {
            this.gameOverText.textContent = 'Pacman Wins!';
        } else {
            this.gameOverText.textContent = 'You Win!';
        }

        this.gameOverElement.style.display = 'block';
    }

    resetGame() {
        this.gameRunning = false;
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
        }

        this.gameWinner = null;
        this.powerPelletTimer = 0;

        if (this.isMultiplayer) {
            this.setupMultiplayerGame();
        } else {
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
            this.createBoard();
            this.countPellets();
            this.updateScore();
            this.updateLives();
        }

        this.gameOverElement.style.display = 'none';
        this.startGame();
    }
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new AsymmetricPacmanGame();
});