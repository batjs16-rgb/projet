const os = require('os');

module.exports = {
    name: 'host',
    aliases: ['sysinfo'],
    category: 'System',
    description: 'Show server info',
    execute(api, event, { botStartTime }) {
        const platform = os.platform();
        const arch = os.arch();
        const cpus = os.cpus();
        const cpuModel = cpus[0]?.model || 'Unknown';
        const cpuCores = cpus.length;
        const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
        const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);
        const nodeVersion = process.version;
        const s = Math.floor((Date.now() - botStartTime) / 1000);
        const uptime = `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
        const now = new Date().toLocaleString('en-US');

        api.sendMessage(
            `╭───〔 🖥️ JOSIHACK HOST 〕───⬣\n` +
            `│ 🌐 *Platform*      : ${platform} (${arch})\n` +
            `│ ⚙️ *CPU*           : ${cpuModel} (${cpuCores} cores)\n` +
            `│ 💾 *Memory*        : ${freeMem} GB free / ${totalMem} GB total\n` +
            `│ 🔧 *Node.js*       : ${nodeVersion}\n` +
            `│ ⏳ *Uptime*        : ${uptime}\n` +
            `│ 🕒 *Time*          : ${now}\n` +
            `╰────────────────────────────⬣`,
            event.threadID
        );
    }
};
