module.exports = {
    name: 'myinfo',
    aliases: ['mi2'],
    category: 'Info',
    description: 'Show your user info',
    execute(api, event) {
        const uid = event.senderID;
        api.getUserInfo([uid], (err, data) => {
            if (err || !data[uid]) return api.sendMessage(`🆔 *Your ID*: ${uid}`, event.threadID);
            const u = data[uid];
            api.sendMessage(
                `╭───〔 👤 MY INFO 〕───⬣\n` +
                `│ 🆔 *ID*: ${uid}\n` +
                `│ 📛 *Name*: ${u.name || 'N/A'}\n` +
                `│ 👤 *Gender*: ${u.gender === 1 ? 'Female' : u.gender === 2 ? 'Male' : 'Other'}\n` +
                `│ 🌐 *Profile*: facebook.com/${uid}\n` +
                `│ ✅ *Verified*: ${u.isVerified ? 'Yes' : 'No'}\n` +
                `╰──────────────⬣`,
                event.threadID
            );
        });
    }
};
