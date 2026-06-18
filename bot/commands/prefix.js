module.exports = {
    name: 'prefix',
    category: 'Info',
    description: 'Show current prefix',
    execute(api, event, { prefix }) {
        api.sendMessage(`🔧 *Current prefix*: ${prefix}`, event.threadID);
    }
};
