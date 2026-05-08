module.exports = {
    name: 'spy',
    category: 'Info',
    description: 'Get info about a user by ID or mention',
    execute(api, event, { args }) {
        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        const targetID = mentions[0] || args[1];
        if (!targetID) return api.sendMessage('❌ Usage: spy @user or spy <userID>', event.threadID);
        api.getUserInfo([targetID], (err, data) => {
            if (err || !data[targetID]) return api.sendMessage('❌ User not found.', event.threadID);
            const u = data[targetID];
            api.sendMessage(
                `╭───〔 🔍 SPY 〕───⬣\n` +
                `│ 🆔 *ID*: ${targetID}\n` +
                `│ 📛 *Name*: ${u.name || 'N/A'}\n` +
                `│ 👤 *Gender*: ${u.gender === 1 ? 'Female' : u.gender === 2 ? 'Male' : 'Other'}\n` +
                `│ ✅ *Verified*: ${u.isVerified ? 'Yes' : 'No'}\n` +
                `│ 🌐 *Profile*: facebook.com/${targetID}\n` +
                `╰──────────────⬣`,
                event.threadID
            );
        });
    }
};
