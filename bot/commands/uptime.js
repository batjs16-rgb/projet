const { getUptime } = require('../utils/format');

module.exports = {
    name: 'uptime',
    aliases: ['up'],
    category: 'Info',
    description: 'Show bot uptime',
    execute(api, event, { botStartTime }) {
        const s = Math.floor((Date.now() - botStartTime) / 1000);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        api.sendMessage(
            `⏱️ *Bot Uptime*\n\n` +
            `${h}h ${m}m ${sec}s`,
            event.threadID
        );
    }
};
