const https = require('https');

module.exports = {
    name: 'lyrics',
    category: 'Ai',
    description: 'Search for song lyrics',
    execute(api, event, { args }) {
        const query = args.slice(1).join(' ');
        if (!query) return api.sendMessage('❌ Usage: lyrics <song name>', event.threadID);

        const url = `https://api.popcat.xyz/lyrics?song=${encodeURIComponent(query)}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!json.title) return api.sendMessage('❌ Song not found.', event.threadID);
                    const lyrics = (json.lyrics || 'No lyrics available.').slice(0, 3500);
                    api.sendMessage(
                        `╭───〔 🎵 LYRICS 〕───⬣\n` +
                        `│ 🎤 *${json.title}*\n` +
                        `│ 👤 *${json.artist}*\n` +
                        `╰──────────────⬣\n\n${lyrics}`,
                        event.threadID
                    );
                } catch {
                    api.sendMessage('❌ Failed to find lyrics.', event.threadID);
                }
            });
        }).on('error', () => api.sendMessage('❌ API error.', event.threadID));
    }
};
