const https = require('https');

function queryAI(prompt) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ prompt });
        const options = {
            hostname: 'api.simsimi.vn',
            path: '/v1/simbot',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.message || json.data || 'No response.');
                } catch {
                    resolve(data || 'No response.');
                }
            });
        });
        req.on('error', () => resolve('AI service unavailable. Try again later.'));
        req.write(postData);
        req.end();
    });
}

module.exports = {
    name: 'ai',
    category: 'Ai',
    description: 'Chat with AI',
    execute(api, event, { args }) {
        const question = args.slice(1).join(' ');
        if (!question) return api.sendMessage('❌ Usage: ai <question>', event.threadID);

        api.sendMessage('🤖 Thinking...', event.threadID, () => {
            queryAI(question).then(answer => {
                api.sendMessage(
                    `╭───〔 🤖 AI 〕───⬣\n` +
                    `│ ${answer}\n` +
                    `╰──────────────⬣`,
                    event.threadID
                );
            });
        });
    }
};
