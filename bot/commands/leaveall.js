module.exports = {
    name: 'leaveall',
    category: 'Owner',
    description: 'Leave all groups except current',
    execute(api, event, { ownerID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        api.getThreadList(100, null, ['INBOX'], (err, threads) => {
            if (err) return api.sendMessage('❌ Failed.', event.threadID);
            const groups = threads.filter(t => t.isGroup && t.threadID !== event.threadID);
            let count = 0;
            groups.forEach(g => {
                api.removeUserFromGroup(api.getCurrentUserID(), g.threadID);
                count++;
            });
            api.sendMessage(`✅ Left ${count} group(s). Staying in this one.`, event.threadID);
        });
    }
};
