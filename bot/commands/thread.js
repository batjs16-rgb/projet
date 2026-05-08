module.exports = {
    name: 'thread',
    category: 'Owner',
    description: 'Manage bot threads/groups',
    execute(api, event, { args, ownerID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        api.getThreadList(20, null, ['INBOX'], (err, threads) => {
            if (err) return api.sendMessage('❌ Failed to get threads.', event.threadID);
            const groups = threads.filter(t => t.isGroup);
            let msg = `╭───〔 📋 BOT THREADS 〕───⬣\n`;
            groups.slice(0, 10).forEach(g => {
                msg += `│ 💬 *${g.name || 'Unnamed'}* (${g.threadID})\n│   Members: ${g.participantIDs?.length || '?'}\n`;
            });
            msg += `╰──────────────⬣\n📊 Total groups: ${groups.length}`;
            api.sendMessage(msg, event.threadID);
        });
    }
};
