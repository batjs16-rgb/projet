const { getAllUsers } = require('../utils/storage');

module.exports = {
    name: 'user',
    category: 'Owner',
    description: 'View bot user statistics',
    execute(api, event, { ownerID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        const bankUsers = Object.keys(getAllUsers('bank')).length;
        const petUsers = Object.keys(getAllUsers('pets')).length;
        const magicUsers = Object.keys(getAllUsers('magic')).length;
        const rankUsers = Object.keys(getAllUsers('rank')).length;
        api.sendMessage(
            `╭───〔 👥 USER STATS 〕───⬣\n` +
            `│ 🏦 Bank users: ${bankUsers}\n` +
            `│ 🐾 Pet owners: ${petUsers}\n` +
            `│ 🪄 Wizards: ${magicUsers}\n` +
            `│ 📊 Ranked: ${rankUsers}\n` +
            `╰──────────────⬣`,
            event.threadID
        );
    }
};
