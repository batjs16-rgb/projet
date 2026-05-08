const { getUser, setUser } = require('../utils/storage');

module.exports = {
    name: 'busy',
    category: 'Box chat',
    description: 'Set/remove busy status',
    execute(api, event, { args }) {
        const uid = event.senderID;
        let u = getUser('busy', uid);

        if (u) {
            setUser('busy', uid, null);
            return api.sendMessage('✅ Busy mode *OFF*', event.threadID);
        }

        const reason = args.slice(1).join(' ') || 'Busy';
        setUser('busy', uid, { reason, since: Date.now() });
        api.sendMessage(`✅ Busy mode *ON*\n📝 Reason: ${reason}\n\nYou will be auto-replied when mentioned.`, event.threadID);
    }
};
