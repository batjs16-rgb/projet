const { getUser, setUser } = require('../utils/storage');

module.exports = {
    name: 'ban',
    category: 'Box chat',
    description: 'Ban a user from using the bot',
    execute(api, event, { args, ownerID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        const targetID = mentions[0] || args[1];
        if (!targetID) return api.sendMessage('❌ Usage: ban @user', event.threadID);
        const bans = getUser('system', 'bans') || { list: [] };
        if (bans.list.includes(targetID)) return api.sendMessage('❌ Already banned!', event.threadID);
        bans.list.push(targetID);
        setUser('system', 'bans', bans);
        api.sendMessage(`🔨 User banned from bot!`, event.threadID);
    }
};
