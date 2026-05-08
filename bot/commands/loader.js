const fs = require('fs');
const path = require('path');

function loadCommands() {
    const commands = {};
    const aliases = {};
    const dir = __dirname;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'loader.js');

    for (const file of files) {
        try {
            const cmd = require(path.join(dir, file));
            if (cmd.name && cmd.execute) {
                commands[cmd.name] = cmd;
                if (cmd.aliases) {
                    for (const alias of cmd.aliases) {
                        aliases[alias] = cmd.name;
                    }
                }
            }
        } catch (err) {
            console.error(`[LOADER] Failed to load ${file}: ${err.message}`);
        }
    }

    console.log(`[LOADER] Loaded ${Object.keys(commands).length} commands`);
    return { commands, aliases };
}

module.exports = { loadCommands };
