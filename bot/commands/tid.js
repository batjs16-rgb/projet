module.exports = {
    name: 'tid',
    category: 'Info',
    description: 'Get thread/group ID',
    execute(api, event) {
        api.sendMessage(`🆔 *Thread ID*: ${event.threadID}`, event.threadID);
    }
};
