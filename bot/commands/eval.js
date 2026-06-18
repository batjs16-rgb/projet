module.exports = {
    name: 'eval',
    category: 'Owner',
    description: 'Evaluate JavaScript code',
    execute(api, event, { args, ownerID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        const code = args.slice(1).join(' ');
        if (!code) return api.sendMessage('❌ Usage: eval <code>', event.threadID);
        try {
            const result = eval(code);
            api.sendMessage(`📤 *Result:*\n${String(result).slice(0, 2000)}`, event.threadID);
        } catch (err) {
            api.sendMessage(`❌ *Error:*\n${err.message}`, event.threadID);
        }
    }
};
