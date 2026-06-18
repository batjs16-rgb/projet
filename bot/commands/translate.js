const https = require('https');

function translateText(text, targetLang) {
    return new Promise((resolve, reject) => {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.responseData?.translatedText || 'Translation failed.');
                } catch {
                    reject('Failed to parse response.');
                }
            });
        }).on('error', reject);
    });
}

module.exports = {
    name: 'translate',
    aliases: ['tr'],
    category: 'Utility',
    description: 'Translate text (free API)',
    execute(api, event, { args }) {
        const lang = args[1] || 'en';
        const text = args.slice(2).join(' ');
        if (!text) {
            if (event.type === 'message_reply' && event.messageReply?.body) {
                return translateText(event.messageReply.body, lang).then(result => {
                    api.sendMessage(`🌐 *Translation* (→ ${lang}):\n\n${result}`, event.threadID);
                }).catch(() => api.sendMessage('❌ Translation failed.', event.threadID));
            }
            return api.sendMessage('❌ Usage: translate <lang> <text>\nExample: translate fr Hello world', event.threadID);
        }
        translateText(text, lang).then(result => {
            api.sendMessage(`🌐 *Translation* (→ ${lang}):\n\n${result}`, event.threadID);
        }).catch(() => api.sendMessage('❌ Translation failed.', event.threadID));
    }
};
