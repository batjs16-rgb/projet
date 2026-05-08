const { randomInt } = require('../utils/format');

const activeGames = {};

module.exports = {
    name: 'dhbc',
    category: 'Game',
    description: 'Dead Hits Bulls Cows number guessing game',
    execute(api, event, { args }) {
        const tid = event.threadID;
        const uid = event.senderID;
        const guess = args[1];

        if (activeGames[tid] && guess && guess.length === 4 && !isNaN(guess)) {
            const game = activeGames[tid];
            game.attempts++;
            let bulls = 0, cows = 0;
            const secret = game.number.split('');
            const guessArr = guess.split('');

            for (let i = 0; i < 4; i++) {
                if (guessArr[i] === secret[i]) bulls++;
                else if (secret.includes(guessArr[i])) cows++;
            }

            if (bulls === 4) {
                delete activeGames[tid];
                return api.sendMessage(`🎉 *Correct!* The number was *${game.number}*!\n📊 Attempts: ${game.attempts}`, tid);
            }

            if (game.attempts >= 10) {
                delete activeGames[tid];
                return api.sendMessage(`❌ *Game Over!* The number was *${game.number}*`, tid);
            }

            return api.sendMessage(`🎯 ${guess} → 🐂 Bulls: ${bulls} | 🐄 Cows: ${cows} (Attempt ${game.attempts}/10)`, tid);
        }

        const digits = [];
        while (digits.length < 4) {
            const d = randomInt(0, 9);
            if (!digits.includes(d)) digits.push(d);
        }
        activeGames[tid] = { number: digits.join(''), attempts: 0 };

        api.sendMessage(
            `╭───〔 🐂 DHBC 〕───⬣\n` +
            `│ Guess the 4-digit number!\n` +
            `│ 🐂 Bull = right digit, right place\n` +
            `│ 🐄 Cow = right digit, wrong place\n` +
            `│ You have 10 attempts!\n` +
            `╰──────────────⬣\n\n💡 Type: dhbc <4-digit number>`,
            tid
        );
    }
};
