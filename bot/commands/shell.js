const { execSync } = require('child_process');

module.exports = {
    name: 'shell',
    category: 'Owner',
    description: 'Execute shell command',
    execute(api, event, { args, ownerID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        const cmd = args.slice(1).join(' ');
        if (!cmd) return api.sendMessage('❌ Usage: shell <command>', event.threadID);
        try {
            const output = execSync(cmd, { encoding: 'utf8', timeout: 10000 }).slice(0, 2000);
            api.sendMessage(`💻 *Output:*\n${output || '(empty)'}`, event.threadID);
        } catch (err) {
            api.sendMessage(`❌ *Error:*\n${(err.stderr || err.message).slice(0, 1000)}`, event.threadID);
        }
    }
};
