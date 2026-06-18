const { randomInt, formatMoney } = require('../utils/format');
const { getUser, setUser } = require('../utils/storage');

const activeGames = {};

module.exports = {
    name: 'guessnumber',
    category: 'Game',
    description: 'Guess the number game',
    execute(api, event, { args }) {
        const tid = event.threadID;
        const uid = event.senderID;
        const guess = parseInt(args[1]);

        if (activeGames[tid] && guess) {
            const game = activeGames[tid];
            game.attempts++;

            if (guess === game.number) {
                const reward = Math.max(100, 500 - game.attempts * 50);
                let u = getUser('bank', uid) || { wallet: 1000 };
                u.wallet = (u.wallet || 0) + reward;
                setUser('bank', uid, u);
                delete activeGames[tid];
                return api.sendMessage(`🎉 *Correct!* The number was *${game.number}*!\n📊 Attempts: ${game.attempts}\n💰 +${formatMoney(reward)}`, tid);
            }

            const hint = guess < game.number ? '⬆️ Higher!' : '⬇️ Lower!';
            if (game.attempts >= 7) {
                delete activeGames[tid];
                return api.sendMessage(`❌ *Game Over!* The number was *${game.number}*\n📊 Too many attempts!`, tid);
            }
            return api.sendMessage(`${hint} (Attempt ${game.attempts}/7)`, tid);
        }

        const number = randomInt(1, 100);
        activeGames[tid] = { number, attempts: 0, player: uid };
        api.sendMessage(
            `╭───〔 🔢 GUESS THE NUMBER 〕───⬣\n` +
            `│ I picked a number between 1-100\n` +
            `│ You have 7 attempts!\n` +
            `╰──────────────⬣\n\n💡 Type: guessnumber <number>`,
            tid
        );
    }
};
