module.exports = {
    name: 'notification',
    aliases: ['noti'],
    category: 'Owner',
    description: 'Send notification to all groups',
    execute(api, event, { args, ownerID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        const msg = args.slice(1).join(' ');
        if (!msg) return api.sendMessage('❌ Usage: notification <message>', event.threadID);
        api.getThreadList(100, null, ['INBOX'], (err, threads) => {
            if (err) return api.sendMessage('❌ Failed.', event.threadID);
            const groups = threads.filter(t => t.isGroup);
            let count = 0;
            groups.forEach(g => {
                api.sendMessage(`📢 *NOTIFICATION*\n\n${msg}\n\n— Bot Admin`, g.threadID);
                count++;
            });
            api.sendMessage(`✅ Sent to ${count} group(s).`, event.threadID);
        });
    }
};
