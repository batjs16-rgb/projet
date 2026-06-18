module.exports = {
    name: 'say',
    category: 'Ai',
    description: 'Make the bot say something',
    execute(api, event, { args }) {
        const text = args.slice(1).join(' ');
        if (!text) return api.sendMessage('❌ Usage: say <text>', event.threadID);
        api.sendMessage(text, event.threadID);
    }
};
