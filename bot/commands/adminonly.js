const { getUser, setUser } = require('../utils/storage');

module.exports = {
    name: 'adminonly',
    category: 'Owner',
    description: 'Toggle admin-only mode',
    execute(api, event, { ownerID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        const sys = getUser('system', 'settings') || {};
        sys.adminOnly = !sys.adminOnly;
        setUser('system', 'settings', sys);
        api.sendMessage(`🔧 Admin-only mode: *${sys.adminOnly ? 'ON' : 'OFF'}*`, event.threadID);
    }
};
