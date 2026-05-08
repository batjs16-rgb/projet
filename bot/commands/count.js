module.exports = {
    name: 'count',
    category: 'Box chat',
    description: 'Count group members',
    execute(api, event) {
        api.getThreadInfo(event.threadID, (err, info) => {
            if (err) return api.sendMessage('❌ Failed to get group info.', event.threadID);
            const total = (info.participantIDs || []).length;
            const admins = (info.adminIDs || []).length;
            api.sendMessage(
                `╭───〔 👥 GROUP COUNT 〕───⬣\n` +
                `│ 👥 *Members*: ${total}\n` +
                `│ 🛡️ *Admins*: ${admins}\n` +
                `│ 📝 *Name*: ${info.threadName || 'N/A'}\n` +
                `╰──────────────⬣`,
                event.threadID
            );
        });
    }
};
