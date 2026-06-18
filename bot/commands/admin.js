module.exports = {
    name: 'admin',
    category: 'Box chat',
    description: 'Promote user to group admin',
    execute(api, event, { args, ownerID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        const targetID = mentions[0];
        if (!targetID) return api.sendMessage('❌ Usage: admin @user', event.threadID);
        api.changeAdminStatus(event.threadID, targetID, true, (err) => {
            if (err) return api.sendMessage('❌ Failed. Bot may not be admin.', event.threadID);
            api.sendMessage(`✅ User promoted to admin!`, event.threadID);
        });
    }
};
