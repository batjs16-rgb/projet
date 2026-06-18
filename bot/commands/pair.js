const { randomInt } = require('../utils/format');

module.exports = {
    name: 'pair',
    aliases: ['pair2', 'pairdp'],
    category: 'Media',
    description: 'Pair two random group members',
    execute(api, event) {
        api.getThreadInfo(event.threadID, (err, info) => {
            if (err) return api.sendMessage('❌ Failed to get group info.', event.threadID);
            const ids = (info.participantIDs || []).filter(id => id !== event.senderID);
            if (ids.length < 2) return api.sendMessage('❌ Need at least 3 members!', event.threadID);
            const i1 = Math.floor(Math.random() * ids.length);
            let i2 = Math.floor(Math.random() * ids.length);
            while (i2 === i1) i2 = Math.floor(Math.random() * ids.length);
            const id1 = ids[i1], id2 = ids[i2];
            const percent = randomInt(10, 100);
            let hearts = '';
            if (percent >= 80) hearts = '💕💕💕💕💕';
            else if (percent >= 60) hearts = '💕💕💕💕';
            else if (percent >= 40) hearts = '💕💕💕';
            else if (percent >= 20) hearts = '💕💕';
            else hearts = '💔';

            api.getUserInfo([id1, id2], (err2, data) => {
                const n1 = data?.[id1]?.name || id1;
                const n2 = data?.[id2]?.name || id2;
                api.sendMessage(
                    `╭───〔 💗 PAIR 〕───⬣\n` +
                    `│ 👤 ${n1}\n` +
                    `│ ❤️ × ❤️\n` +
                    `│ 👤 ${n2}\n` +
                    `│\n` +
                    `│ ${hearts}\n` +
                    `│ Love: ${percent}%\n` +
                    `╰──────────────⬣`,
                    event.threadID
                );
            });
        });
    }
};
