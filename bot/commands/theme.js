module.exports = {
    name: 'theme',
    category: 'Box chat',
    description: 'Change group color/emoji theme',
    execute(api, event, { args }) {
        const sub = (args[1] || '').toLowerCase();
        if (sub === 'color') {
            const color = args[2];
            if (!color) return api.sendMessage('❌ Usage: theme color <hex>\nExample: theme color #FF0000', event.threadID);
            api.changeThreadColor(color, event.threadID, (err) => {
                if (err) return api.sendMessage('❌ Failed to change color.', event.threadID);
                api.sendMessage(`✅ Color changed to *${color}*!`, event.threadID);
            });
            return;
        }
        if (sub === 'emoji') {
            const emoji = args[2];
            if (!emoji) return api.sendMessage('❌ Usage: theme emoji <emoji>', event.threadID);
            api.changeThreadEmoji(emoji, event.threadID, (err) => {
                if (err) return api.sendMessage('❌ Failed to change emoji.', event.threadID);
                api.sendMessage(`✅ Emoji changed to ${emoji}!`, event.threadID);
            });
            return;
        }
        api.sendMessage('🎨 *THEME*\n\n• theme color <hex> — Change group color\n• theme emoji <emoji> — Change group emoji', event.threadID);
    }
};
