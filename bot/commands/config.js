module.exports = {
    name: 'config',
    category: 'Owner',
    description: 'View/change bot config',
    execute(api, event, { args, ownerID, prefix, botID }) {
        if (event.senderID !== ownerID) return api.sendMessage('🚫 Owner only!', event.threadID);
        api.sendMessage(
            `╭───〔 ⚙️ CONFIG 〕───⬣\n` +
            `│ 🔧 *Prefix*: ${prefix}\n` +
            `│ 🤖 *Bot ID*: ${botID}\n` +
            `│ 👑 *Owner*: ${ownerID}\n` +
            `│ 📦 *Version*: 7.0.0\n` +
            `│ 🌐 *Platform*: Messenger\n` +
            `╰──────────────⬣`,
            event.threadID
        );
    }
};
