const { getUser, setUser } = require('../utils/storage');
const { formatMoney, randomChoice, randomInt } = require('../utils/format');

module.exports = {
    name: 'slot',
    category: 'Game',
    description: 'Slot machine game',
    execute(api, event, { args }) {
        const uid = event.senderID;
        let u = getUser('bank', uid) || { wallet: 1000 };
        const bet = parseInt(args[1]) || 100;
        if (bet <= 0) return api.sendMessage('❌ Usage: slot <amount>', event.threadID);
        if (bet > u.wallet) return api.sendMessage(`❌ Not enough! Wallet: ${formatMoney(u.wallet)}`, event.threadID);

        const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '🔔', '⭐'];
        const s = [randomChoice(symbols), randomChoice(symbols), randomChoice(symbols)];
        let multiplier = 0;
        if (s[0] === s[1] && s[1] === s[2]) {
            multiplier = s[0] === '💎' ? 10 : s[0] === '7️⃣' ? 7 : s[0] === '⭐' ? 5 : 3;
        } else if (s[0] === s[1] || s[1] === s[2] || s[0] === s[2]) {
            multiplier = 1.5;
        }
        const winnings = Math.floor(bet * multiplier);
        u.wallet += winnings - bet;
        setUser('bank', uid, u);

        const result = winnings > 0
            ? `🎉 *WIN!* +${formatMoney(winnings)} (${multiplier}x)`
            : `💀 *LOST!* -${formatMoney(bet)}`;

        api.sendMessage(
            `🎰 *SLOT MACHINE*\n\n` +
            `╔═══╦═══╦═══╗\n` +
            `║ ${s[0]} ║ ${s[1]} ║ ${s[2]} ║\n` +
            `╚═══╩═══╩═══╝\n\n` +
            `${result}\n💵 Wallet: ${formatMoney(u.wallet)}`,
            event.threadID
        );
    }
};
