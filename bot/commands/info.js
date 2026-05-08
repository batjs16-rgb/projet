module.exports = {
    name: 'info',
    category: 'Info',
    description: 'Show bot information',
    execute(api, event, { botID, botStartTime, prefix }) {
        const s = Math.floor((Date.now() - botStartTime) / 1000);
        const uptime = `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
        api.sendMessage(
            `╭───〔 🤖 JOSIHACK BOT 〕───⬣\n` +
            `│ ߷ *Status*     ➜ Online ✅\n` +
            `│ ߷ *Mode*       ➜ Messenger\n` +
            `│ ߷ *Prefix*     ➜ ${prefix}\n` +
            `│ ߷ *Bot ID*     ➜ ${botID}\n` +
            `│ ߷ *Uptime*     ➜ ${uptime}\n` +
            `│ ߷ *Version*    ➜ 7.0.0\n` +
            `│ ߷ *Author*     ➜ Josi_hack\n` +
            `╰──────────────⬣\n\n` +
            `> (c) ${new Date().getFullYear()} JosiHack Bot`,
            event.threadID
        );
    }
};
