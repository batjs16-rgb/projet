const { getUser, setUser } = require('../utils/storage');

module.exports = {
    name: 'unban',
    category: 'Box chat',
    description: 'Unban a user from the bot',
    execute(api, event, { args, ownerID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        const targetID = mentions[0] || args[1];
        if (!targetID) return api.sendMessage('❌ Usage: unban @user', event.threadID);
        const bans = getUser('system', 'bans') || { list: [] };
        bans.list = bans.list.filter(id => id !== targetID);
        setUser('system', 'bans', bans);
        api.sendMessage(`✅ User unbanned!`, event.threadID);
    }
};
