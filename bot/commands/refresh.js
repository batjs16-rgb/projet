module.exports = {
    name: 'refresh',
    category: 'Box chat',
    description: 'Refresh group info cache',
    execute(api, event) {
        api.getThreadInfo(event.threadID, (err, info) => {
            if (err) return api.sendMessage('❌ Failed to refresh.', event.threadID);
            api.sendMessage(`✅ Group info refreshed!\n📛 ${info.threadName || 'N/A'}\n👥 ${(info.participantIDs || []).length} members`, event.threadID);
        });
    }
};
