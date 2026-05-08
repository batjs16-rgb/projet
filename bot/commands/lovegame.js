const { randomInt } = require('../utils/format');

module.exports = {
    name: 'lovegame',
    category: 'Game',
    description: 'Love compatibility test',
    execute(api, event, { args }) {
        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        const targetID = mentions[0];
        if (!targetID) return api.sendMessage('❌ Usage: lovegame @user', event.threadID);

        const percent = randomInt(0, 100);
        let hearts = '';
        if (percent >= 80) hearts = '💕💕💕💕💕';
        else if (percent >= 60) hearts = '💕💕💕💕';
        else if (percent >= 40) hearts = '💕💕💕';
        else if (percent >= 20) hearts = '💕💕';
        else hearts = '💔';

        let message = '';
        if (percent >= 90) message = 'Soulmates! 💍';
        else if (percent >= 70) message = 'Perfect match! 😍';
        else if (percent >= 50) message = 'Good vibes! 😊';
        else if (percent >= 30) message = 'Maybe friends? 🤔';
        else message = 'Not meant to be... 😢';

        api.sendMessage(
            `╭───〔 💗 LOVE GAME 〕───⬣\n` +
            `│ ${hearts}\n` +
            `│ *Love Score*: ${percent}%\n` +
            `│ ${message}\n` +
            `╰──────────────⬣`,
            event.threadID
        );
    }
};
