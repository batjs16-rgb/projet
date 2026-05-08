module.exports = {
    name: 'restart',
    category: 'Owner',
    description: 'Restart the bot',
    execute(api, event, { ownerID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        api.sendMessage('🔄 Restarting bot...', event.threadID, () => {
            process.exit(0);
        });
    }
};
