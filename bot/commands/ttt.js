const activeTTT = {};

function renderBoard(board) {
    return board.map((row, r) =>
        row.map((cell, c) => {
            if (cell === 'X') return '❌';
            if (cell === 'O') return '⭕';
            return `${r * 3 + c + 1}️⃣`;
        }).join('│')
    ).join('\n─┼─┼─\n');
}

function checkWin(board, mark) {
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === mark && board[i][1] === mark && board[i][2] === mark) return true;
        if (board[0][i] === mark && board[1][i] === mark && board[2][i] === mark) return true;
    }
    if (board[0][0] === mark && board[1][1] === mark && board[2][2] === mark) return true;
    if (board[0][2] === mark && board[1][1] === mark && board[2][0] === mark) return true;
    return false;
}

function isFull(board) {
    return board.every(row => row.every(cell => cell !== ''));
}

module.exports = {
    name: 'ttt',
    category: 'Game',
    description: 'Tic-Tac-Toe game',
    execute(api, event, { args }) {
        const uid = event.senderID;
        const tid = event.threadID;

        if (args[1] === 'end' && activeTTT[tid]) {
            delete activeTTT[tid];
            return api.sendMessage('🎮 Game ended.', tid);
        }

        const move = parseInt(args[1]);
        if (activeTTT[tid] && move >= 1 && move <= 9) {
            const game = activeTTT[tid];
            if (uid !== game.players[game.turn]) {
                return api.sendMessage('❌ Not your turn!', tid);
            }
            const r = Math.floor((move - 1) / 3);
            const c = (move - 1) % 3;
            if (game.board[r][c] !== '') return api.sendMessage('❌ Spot taken!', tid);

            const mark = game.turn === 0 ? 'X' : 'O';
            game.board[r][c] = mark;

            if (checkWin(game.board, mark)) {
                const display = renderBoard(game.board);
                delete activeTTT[tid];
                return api.sendMessage(`🎮 *TIC-TAC-TOE*\n\n${display}\n\n🏆 ${mark === 'X' ? '❌' : '⭕'} *WINS!*`, tid);
            }
            if (isFull(game.board)) {
                const display = renderBoard(game.board);
                delete activeTTT[tid];
                return api.sendMessage(`🎮 *TIC-TAC-TOE*\n\n${display}\n\n🤝 *DRAW!*`, tid);
            }

            game.turn = 1 - game.turn;
            const display = renderBoard(game.board);
            return api.sendMessage(`🎮 *TIC-TAC-TOE*\n\n${display}\n\n${game.turn === 0 ? '❌' : '⭕'}'s turn — type: ttt <1-9>`, tid);
        }

        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        const opponent = mentions[0];
        if (!opponent) return api.sendMessage('❌ Usage: ttt @user — to start, or ttt <1-9> to play', tid);
        if (opponent === uid) return api.sendMessage('❌ Can\'t play against yourself!', tid);

        activeTTT[tid] = {
            players: [uid, opponent],
            board: [['', '', ''], ['', '', ''], ['', '', '']],
            turn: 0,
        };

        const display = renderBoard(activeTTT[tid].board);
        api.sendMessage(`🎮 *TIC-TAC-TOE*\n\n${display}\n\n❌'s turn — type: ttt <1-9>`, tid);
    }
};
