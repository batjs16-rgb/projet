const https = require('https');

module.exports = {
    name: 'sing',
    category: 'Media',
    description: 'Search for song lyrics and info',
    execute(api, event, { args }) {
        const query = args.slice(1).join(' ');
        if (!query) return api.sendMessage('❌ Usage: sing <song name>', event.threadID);

        const url = `https://api.popcat.xyz/lyrics?song=${encodeURIComponent(query)}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!json.title) return api.sendMessage('❌ Song not found.', event.threadID);
                    const lyrics = (json.lyrics || 'No lyrics available.').slice(0, 3000);
                    api.sendMessage(
                        `╭───〔 🎵 SONG 〕───⬣\n` +
                        `│ 🎤 *${json.title}*\n` +
                        `│ 👤 *${json.artist}*\n` +
                        `╰──────────────⬣\n\n${lyrics}`,
                        event.threadID
                    );
                } catch {
                    api.sendMessage('❌ Failed to find song.', event.threadID);
                }
            });
        }).on('error', () => api.sendMessage('❌ API error.', event.threadID));
    }
};
