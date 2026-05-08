const { getUser, setUser } = require('../utils/storage');

module.exports = {
    name: 'rules',
    category: 'Box chat',
    description: 'Set/view group rules',
    execute(api, event, { args }) {
        const tid = event.threadID;
        const groups = getUser('groups', tid) || {};

        if (args[1] === 'set') {
            const rulesText = args.slice(2).join(' ');
            if (!rulesText) return api.sendMessage('❌ Usage: rules set <rules text>', tid);
            groups.rules = rulesText;
            setUser('groups', tid, groups);
            return api.sendMessage(`✅ Rules updated!`, tid);
        }

        if (!groups.rules) return api.sendMessage('📋 No rules set. Use: rules set <text>', tid);
        api.sendMessage(
            `╭───〔 📋 GROUP RULES 〕───⬣\n` +
            `│ ${groups.rules}\n` +
            `╰──────────────⬣`,
            tid
        );
    }
};
