const { getUser, setUser, getAllUsers } = require('../utils/storage');

module.exports = {
    name: 'activity',
    category: 'Info',
    description: 'Show user activity stats',
    execute(api, event) {
        const uid = event.senderID;
        let u = getUser('activity', uid) || { messages: 0, commands: 0, firstSeen: Date.now() };
        u.commands = (u.commands || 0) + 1;
        setUser('activity', uid, u);
        const days = Math.max(1, Math.floor((Date.now() - (u.firstSeen || Date.now())) / 86400000));
        api.sendMessage(
            `╭───〔 📊 ACTIVITY 〕───⬣\n` +
            `│ 💬 *Messages*: ${u.messages || 0}\n` +
            `│ 🤖 *Commands*: ${u.commands}\n` +
            `│ 📅 *Days Active*: ${days}\n` +
            `│ 📊 *Avg/Day*: ${((u.messages || 0) / days).toFixed(1)} msgs\n` +
            `╰──────────────⬣`,
            event.threadID
        );
    }
};
