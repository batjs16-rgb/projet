const os = require('os');

module.exports = {
    name: 'sysinfo',
    category: 'Info',
    description: 'Show system information',
    execute(api, event) {
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const usedMem = (totalMem - freeMem).toFixed(2);
        const cpus = os.cpus();
        api.sendMessage(
            `╭───〔 💻 SYSTEM INFO 〕───⬣\n` +
            `│ 🖥️ *Platform*: ${os.platform()} ${os.arch()}\n` +
            `│ 💾 *RAM*: ${usedMem}/${totalMem} GB\n` +
            `│ 🔧 *CPU*: ${cpus[0]?.model || 'N/A'}\n` +
            `│ 📊 *Cores*: ${cpus.length}\n` +
            `│ 📦 *Node.js*: ${process.version}\n` +
            `│ ⏱️ *OS Uptime*: ${Math.floor(os.uptime() / 3600)}h\n` +
            `│ 🏠 *Hostname*: ${os.hostname()}\n` +
            `╰──────────────⬣`,
            event.threadID
        );
    }
};
