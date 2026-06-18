module.exports = {
    name: 'ping',
    category: 'System',
    description: 'Check bot latency',
    execute(api, event) {
        const start = Date.now();
        api.sendMessage('🏓 Pinging...', event.threadID, () => {
            const latency = Date.now() - start;
            api.sendMessage(`🏓 *Pong!*\n\n📡 Latency: *${latency}ms*`, event.threadID);
        });
    }
};
