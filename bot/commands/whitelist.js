const { getUser, setUser } = require('../utils/storage');

module.exports = {
    name: 'whitelist',
    category: 'Owner',
    description: 'Manage whitelisted users',
    execute(api, event, { args, ownerID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        const wl = getUser('system', 'whitelist') || { list: [] };
        const sub = (args[1] || '').toLowerCase();
        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        const targetID = mentions[0] || args[2];

        if (sub === 'add' && targetID) {
            if (wl.list.includes(targetID)) return api.sendMessage('❌ Already whitelisted!', event.threadID);
            wl.list.push(targetID);
            setUser('system', 'whitelist', wl);
            return api.sendMessage(`✅ User whitelisted!`, event.threadID);
        }
        if (sub === 'remove' && targetID) {
            wl.list = wl.list.filter(id => id !== targetID);
            setUser('system', 'whitelist', wl);
            return api.sendMessage(`✅ User removed from whitelist!`, event.threadID);
        }

        let msg = `╭───〔 📋 WHITELIST 〕───⬣\n`;
        if (!wl.list.length) msg += `│ No users whitelisted\n`;
        else wl.list.forEach(id => { msg += `│ 👤 ${id}\n`; });
        msg += `╰──────────────⬣\n💡 whitelist add/remove @user`;
        api.sendMessage(msg, event.threadID);
    }
};
