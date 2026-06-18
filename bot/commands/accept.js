module.exports = {
    name: 'accept',
    aliases: ['pending'],
    category: 'Utility',
    description: 'Accept pending group requests',
    execute(api, event, { args, ownerID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        api.getThreadList(100, null, ['PENDING'], (err, threads) => {
            if (err) return api.sendMessage('❌ Failed to get pending threads.', event.threadID);
            if (!threads.length) return api.sendMessage('📋 No pending requests.', event.threadID);
            let count = 0;
            threads.forEach(t => {
                api.sendMessage('✅ Request accepted!', t.threadID);
                count++;
            });
            api.sendMessage(`✅ Accepted ${count} pending request(s).`, event.threadID);
        });
    }
};
