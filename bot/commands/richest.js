const { getAllUsers } = require('../utils/storage');
const { formatMoney } = require('../utils/format');

module.exports = {
    name: 'richest',
    category: 'Info',
    description: 'Show richest users',
    execute(api, event) {
        const all = getAllUsers('bank');
        const leaders = Object.entries(all)
            .map(([id, v]) => ({ id, total: (v.wallet || 0) + (v.bank || 0) + (v.vault || 0) }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        if (!leaders.length) return api.sendMessage('📊 No players yet!', event.threadID);

        const medals = ['🥇', '🥈', '🥉'];
        let msg = `╭───〔 💰 RICHEST USERS 〕───⬣\n`;
        leaders.forEach((l, i) => {
            msg += `│ ${medals[i] || `${i + 1}.`} ${formatMoney(l.total)}\n`;
        });
        msg += `╰──────────────⬣`;
        api.sendMessage(msg, event.threadID);
    }
};
