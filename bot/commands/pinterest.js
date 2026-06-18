const https = require('https');

module.exports = {
    name: 'pinterest',
    aliases: ['pin'],
    category: 'Media',
    description: 'Search Pinterest images',
    execute(api, event, { args }) {
        const query = args.slice(1).join(' ');
        if (!query) return api.sendMessage('❌ Usage: pinterest <search query>', event.threadID);

        const url = `https://api.popcat.xyz/pinterest?q=${encodeURIComponent(query)}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const images = json.data || json;
                    if (!images || !images.length) return api.sendMessage('❌ No results found.', event.threadID);
                    const img = images[Math.floor(Math.random() * Math.min(images.length, 10))];
                    const imgUrl = typeof img === 'string' ? img : img.url || img.link;
                    if (!imgUrl) return api.sendMessage('❌ No image found.', event.threadID);

                    const stream = https.get(imgUrl, (imgRes) => {
                        api.sendMessage({
                            body: `📌 *Pinterest* — "${query}"`,
                            attachment: imgRes,
                        }, event.threadID);
                    });
                    stream.on('error', () => api.sendMessage(`📌 *Pinterest*\n🔗 ${imgUrl}`, event.threadID));
                } catch {
                    api.sendMessage('❌ Failed to search Pinterest.', event.threadID);
                }
            });
        }).on('error', () => api.sendMessage('❌ API error.', event.threadID));
    }
};
