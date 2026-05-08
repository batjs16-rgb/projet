module.exports = {
    name: 'help',
    category: 'Info',
    description: 'Show command help',
    execute(api, event, { args, commands, prefix }) {
        const cmdName = (args[1] || '').toLowerCase();
        if (cmdName && commands[cmdName]) {
            const cmd = commands[cmdName];
            return api.sendMessage(
                `╭───〔 📘 HELP 〕───⬣\n` +
                `│ 📂 *Category*: ${cmd.category}\n` +
                `│ 📘 *Description*: ${cmd.description}\n` +
                `│ 🧾 *Usage*: ${prefix}${cmd.name}${cmd.aliases ? ` (aliases: ${cmd.aliases.join(', ')})` : ''}\n` +
                `│ 👤 *Author*: Josi_hack\n` +
                `╰──────────────⬣`,
                event.threadID
            );
        }

        const categories = {};
        for (const [, cmd] of Object.entries(commands)) {
            if (!categories[cmd.category]) categories[cmd.category] = [];
            if (!categories[cmd.category].includes(cmd.name)) categories[cmd.category].push(cmd.name);
        }

        let msg = `📜 *Command List*\n\n`;
        for (const [cat, cmds] of Object.entries(categories)) {
            msg += `*${cat}*\n`;
            msg += cmds.map(c => `✿ ${c}`).join('   ');
            msg += `\n\n`;
        }
        msg += `💡 Type *${prefix}help <command>* for details\n`;
        msg += `📊 Total: ${Object.keys(commands).length} commands`;

        api.sendMessage(msg, event.threadID);
    }
};
