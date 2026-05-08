const { getUser, setUser } = require('../utils/storage');

module.exports = {
    name: 'badwords',
    category: 'Box chat',
    description: 'Manage bad words filter',
    execute(api, event, { args, ownerID }) {
        const tid = event.threadID;
        const groups = getUser('groups', tid) || {};
        if (!groups.badwords) groups.badwords = [];
        const sub = (args[1] || '').toLowerCase();

        if (sub === 'add') {
            const word = args.slice(2).join(' ').toLowerCase();
            if (!word) return api.sendMessage('❌ Usage: badwords add <word>', tid);
            if (groups.badwords.includes(word)) return api.sendMessage('❌ Already in list!', tid);
            groups.badwords.push(word);
            setUser('groups', tid, groups);
            return api.sendMessage(`✅ Added "${word}" to bad words list.`, tid);
        }
        if (sub === 'remove') {
            const word = args.slice(2).join(' ').toLowerCase();
            groups.badwords = groups.badwords.filter(w => w !== word);
            setUser('groups', tid, groups);
            return api.sendMessage(`✅ Removed "${word}" from bad words list.`, tid);
        }
        if (sub === 'on') {
            groups.badwordsEnabled = true;
            setUser('groups', tid, groups);
            return api.sendMessage('✅ Bad words filter *ON*', tid);
        }
        if (sub === 'off') {
            groups.badwordsEnabled = false;
            setUser('groups', tid, groups);
            return api.sendMessage('✅ Bad words filter *OFF*', tid);
        }

        let msg = `╭───〔 🚫 BAD WORDS 〕───⬣\n`;
        msg += `│ Status: ${groups.badwordsEnabled ? '🟢 ON' : '🔴 OFF'}\n`;
        msg += `│ Words: ${groups.badwords.length ? groups.badwords.join(', ') : 'None'}\n`;
        msg += `╰──────────────⬣\n💡 badwords add/remove/on/off`;
        api.sendMessage(msg, tid);
    }
};
