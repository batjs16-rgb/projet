module.exports = {
    name: 'setname',
    category: 'Box chat',
    description: 'Change group name',
    execute(api, event, { args }) {
        const name = args.slice(1).join(' ');
        if (!name) return api.sendMessage('❌ Usage: setname <new name>', event.threadID);
        api.setTitle(name, event.threadID, (err) => {
            if (err) return api.sendMessage('❌ Failed. Bot may not be admin.', event.threadID);
            api.sendMessage(`✅ Group name changed to: *${name}*`, event.threadID);
        });
    }
};
