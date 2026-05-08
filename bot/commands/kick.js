module.exports = {
    name: 'kick',
    category: 'Box chat',
    description: 'Kick a user from the group',
    execute(api, event, { args, ownerID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        const targetID = mentions[0];
        if (!targetID) return api.sendMessage('❌ Usage: kick @user', event.threadID);
        api.removeUserFromGroup(targetID, event.threadID, (err) => {
            if (err) return api.sendMessage('❌ Failed to kick. Bot may not be admin.', event.threadID);
            api.sendMessage(`✅ Kicked user from group.`, event.threadID);
        });
    }
};
