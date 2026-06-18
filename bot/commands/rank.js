const { getUser, setUser, getAllUsers } = require('../utils/storage');
const { formatMoney, progressBar } = require('../utils/format');

module.exports = {
    name: 'rank',
    category: 'Info',
    description: 'Show your level and rank',
    execute(api, event) {
        const uid = event.senderID;
        let u = getUser('rank', uid) || { xp: 0, level: 1, messages: 0 };
        u.messages = (u.messages || 0) + 1;
        u.xp = (u.xp || 0) + 5;
        const xpNeeded = u.level * 100;
        while (u.xp >= xpNeeded) {
            u.xp -= xpNeeded;
            u.level++;
        }
        setUser('rank', uid, u);

        const all = getAllUsers('rank');
        const sorted = Object.entries(all)
            .sort(([, a], [, b]) => (b.level || 1) - (a.level || 1) || (b.xp || 0) - (a.xp || 0));
        const position = sorted.findIndex(([id]) => id === uid) + 1;

        api.sendMessage(
            `╭───〔 📊 RANK 〕───⬣\n` +
            `│ ⭐ *Level*: ${u.level}\n` +
            `│ ✨ *XP*: ${u.xp}/${u.level * 100} ${progressBar(u.xp, u.level * 100)}\n` +
            `│ 💬 *Messages*: ${u.messages}\n` +
            `│ 🏆 *Rank*: #${position}\n` +
            `╰──────────────⬣`,
            event.threadID
        );
    }
};
