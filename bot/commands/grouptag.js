module.exports = {
    name: 'grouptag',
    aliases: ['tag'],
    category: 'Box chat',
    description: 'Tag all group members with a message',
    execute(api, event, { args }) {
        const msg = args.slice(1).join(' ') || '📢 Attention everyone!';
        api.getThreadInfo(event.threadID, (err, info) => {
            if (err) return api.sendMessage('❌ Failed to get group info.', event.threadID);
            const ids = info.participantIDs || [];
            const mentions = ids.map(id => ({ tag: '@everyone', id }));
            api.sendMessage({
                body: `📢 *GROUP TAG*\n\n${msg}\n\n` + ids.map(() => '@everyone').join(' '),
                mentions: mentions.map((m, i) => ({ ...m, fromIndex: msg.length + 18 + i * 10 })),
            }, event.threadID);
        });
    }
};
