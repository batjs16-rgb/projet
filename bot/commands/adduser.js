module.exports = {
    name: 'adduser',
    category: 'Box chat',
    description: 'Add a user to the group',
    execute(api, event, { args }) {
        const userID = args[1];
        if (!userID) return api.sendMessage('❌ Usage: adduser <userID>', event.threadID);
        api.addUserToGroup(userID, event.threadID, (err) => {
            if (err) return api.sendMessage('❌ Failed to add user. Check the ID or bot permissions.', event.threadID);
            api.sendMessage(`✅ User added to group!`, event.threadID);
        });
    }
};
