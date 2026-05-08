const { getUser, setUser } = require('../utils/storage');
const { formatMoney, randomInt, cooldownCheck, formatTime } = require('../utils/format');

module.exports = {
    name: 'daily',
    category: 'Game',
    description: 'Claim daily rewards',
    execute(api, event) {
        const uid = event.senderID;
        let u = getUser('bank', uid) || { wallet: 1000, cooldowns: {}, dailyStreak: 0, lastDaily: 0 };
        if (!u.cooldowns) u.cooldowns = {};
        const cd = cooldownCheck(u.cooldowns.dailyCmd, 24 * 60 * 60 * 1000);
        if (!cd.ready) return api.sendMessage(`⏳ Daily cooldown: ${formatTime(cd.remaining)}`, event.threadID);
        u.cooldowns.dailyCmd = Date.now();
        const streak = (u.dailyStreak || 0) + 1;
        u.dailyStreak = streak;
        const base = randomInt(500, 1500);
        const bonus = streak * 100;
        const reward = base + bonus;
        u.wallet = (u.wallet || 0) + reward;
        setUser('bank', uid, u);
        api.sendMessage(
            `🎁 *Daily Reward!*\n\n` +
            `💰 +${formatMoney(reward)}\n` +
            `🔥 Streak: ${streak} days (+${formatMoney(bonus)} bonus)\n\n` +
            `💵 Wallet: ${formatMoney(u.wallet)}`,
            event.threadID
        );
    }
};
