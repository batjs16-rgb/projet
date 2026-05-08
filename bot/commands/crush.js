const { randomInt, randomChoice } = require('../utils/format');

module.exports = {
    name: 'crush',
    category: 'Media',
    description: 'Generate a random crush message',
    execute(api, event, { args }) {
        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        const target = mentions[0] ? `@${Object.values(event.mentions)[0]}` : (args.slice(1).join(' ') || 'Someone');
        const messages = [
            `💕 ${target} makes my heart skip a beat!`,
            `🥰 Every time I see ${target}, I smile!`,
            `💘 ${target} is the reason I believe in love!`,
            `😍 Can't stop thinking about ${target}!`,
            `💗 ${target} has the most beautiful soul!`,
            `🌹 If I had a flower for every time I thought of ${target}, I'd have a garden!`,
            `✨ ${target} lights up every room they enter!`,
            `💝 My heart belongs to ${target}!`,
            `🦋 I get butterflies when ${target} is around!`,
            `💞 ${target} is simply amazing!`,
        ];
        const percent = randomInt(50, 100);
        api.sendMessage(
            `╭───〔 💘 CRUSH 〕───⬣\n` +
            `│ ${randomChoice(messages)}\n` +
            `│ 💕 Love Level: ${percent}%\n` +
            `╰──────────────⬣`,
            event.threadID
        );
    }
};
