const { getUser, setUser } = require('../utils/storage');
const { randomInt, formatMoney } = require('../utils/format');

module.exports = {
    name: 'duel',
    category: 'Game',
    description: 'Duel with bet against another user',
    execute(api, event, { args }) {
        const uid = event.senderID;
        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        const targetID = mentions[0];
        const bet = parseInt(args[2]) || parseInt(args[1]) || 100;

        if (!targetID) return api.sendMessage('❌ Usage: duel @user <bet>', event.threadID);
        if (targetID === uid) return api.sendMessage('❌ Can\'t duel yourself!', event.threadID);

        let myBank = getUser('bank', uid) || { wallet: 1000 };
        let enBank = getUser('bank', targetID) || { wallet: 1000 };

        if ((myBank.wallet || 0) < bet) return api.sendMessage(`❌ You need ${formatMoney(bet)}!`, event.threadID);

        const myRoll = randomInt(1, 100);
        const enRoll = randomInt(1, 100);
        const won = myRoll > enRoll;
        const draw = myRoll === enRoll;

        if (won) {
            myBank.wallet = (myBank.wallet || 0) + bet;
            enBank.wallet = Math.max(0, (enBank.wallet || 0) - bet);
        } else if (!draw) {
            myBank.wallet = Math.max(0, (myBank.wallet || 0) - bet);
            enBank.wallet = (enBank.wallet || 0) + bet;
        }

        setUser('bank', uid, myBank);
        setUser('bank', targetID, enBank);

        const result = draw
            ? `🤝 *DRAW!* Both rolled ${myRoll}`
            : won
                ? `🏆 *YOU WIN!* +${formatMoney(bet)}`
                : `💀 *YOU LOST!* -${formatMoney(bet)}`;

        api.sendMessage(
            `╭───〔 ⚔️ DUEL 〕───⬣\n` +
            `│ 🎲 You rolled: *${myRoll}*\n` +
            `│ 🎲 Opponent rolled: *${enRoll}*\n` +
            `│ 💰 Bet: ${formatMoney(bet)}\n` +
            `╰──────────────⬣\n\n${result}`,
            event.threadID
        );
    }
};
