module.exports = {
    name: 'tagall',
    aliases: ['tag', 'everyone'],
    category: 'Box chat',
    description: 'Mention all group members',
    execute(api, event, { args }) {
        if (!event.isGroup) {
            return api.sendMessage('🚫 This command only works in groups.', event.threadID);
        }
        api.getThreadInfo(event.threadID, (err, info) => {
            if (err) return api.sendMessage('❌ Failed to get group info.', event.threadID);
            const participants = info.participantIDs || [];
            const userText = args.slice(1).join(' ') || 'None';
            const tagList = participants.map(id => `│ 👤 @${id}`).join('\n');
            const mentions = participants.map(id => ({ tag: `@${id}`, id }));
            const msg =
                `╭───────◇\n` +
                `│ 🤖 *JOSIHACK BOT - TAGALL* 🤖\n` +
                `╰───────◇\n\n` +
                `👥 *Group*: ${info.threadName || 'N/A'}\n` +
                `👨‍👩‍👧‍👦 *Members*: ${participants.length}\n\n` +
                `🗒️ *Note*: ${userText}\n\n` +
                `╭───〔 LIST 〕───⬣\n` +
                `${tagList}\n` +
                `╰──────────────⬣\n\n` +
                `> PRODUCED BY JOSIHACK BOT`;
            api.sendMessage({ body: msg, mentions }, event.threadID);
        });
    }
};
