const os = require('os');

module.exports = {
    name: 'status',
    category: 'Info',
    description: 'Show bot status overview',
    execute(api, event, { botStartTime, commands }) {
        const s = Math.floor((Date.now() - botStartTime) / 1000);
        const uptime = `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
        const mem = process.memoryUsage();
        const totalCmds = commands ? Object.keys(commands).length : 0;
        api.sendMessage(
            `╭───〔 📊 BOT STATUS 〕───⬣\n` +
            `│ 🟢 *Status*: Online\n` +
            `│ ⏱️ *Uptime*: ${uptime}\n` +
            `│ 💾 *RAM Used*: ${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB\n` +
            `│ 📦 *Commands*: ${totalCmds}\n` +
            `│ 🌐 *Platform*: ${os.platform()}\n` +
            `│ 📦 *Node*: ${process.version}\n` +
            `╰──────────────⬣`,
            event.threadID
        );
    }
};
