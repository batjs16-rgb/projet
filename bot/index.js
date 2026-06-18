console.log('[START] Starting JosiHack Bot v7.0...');

const login = require('@dongdev/fca-unofficial');
const fs = require('fs');
const os = require('os');
const { loadCommands } = require('./commands/loader');
const { getUser, setUser } = require('./utils/storage');

console.log('[INFO] Loading appstate.json...');
let appState;
try {
    appState = JSON.parse(fs.readFileSync('./appstate.json', 'utf8'));
    console.log('[INFO] appstate.json loaded.');
} catch (e) {
    console.error('[ERROR] appstate error:', e.message);
    process.exit(1);
}

const prefix = '?';
const ownerID = '100076386702229';
const botStartTime = Date.now();

const { commands, aliases } = loadCommands();

function getUptime() {
    const s = Math.floor((Date.now() - botStartTime) / 1000);
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
}

function buildMenu(arg) {
    const now = new Date();
    const year = now.getFullYear();
    const date = now.toLocaleDateString('en-US');
    const time = now.toLocaleTimeString('en-US');

    const categories = {};
    for (const [, cmd] of Object.entries(commands)) {
        if (!categories[cmd.category]) categories[cmd.category] = [];
        if (!categories[cmd.category].includes(cmd.name)) categories[cmd.category].push(cmd.name);
    }

    const catList = Object.keys(categories);
    const catNum = parseInt(arg);

    if (catNum >= 1 && catNum <= catList.length) {
        const catName = catList[catNum - 1];
        const cmds = categories[catName];
        let msg = `╭──⟪ ${catName.toUpperCase()} ⟫──╮\n`;
        cmds.forEach(c => { msg += `├ ✿ ${prefix}${c}\n`; });
        msg += `╰────────────────────╯\n\n> (c) ${year} JosiHack Bot`;
        return msg;
    }

    let msg =
        `╭──⟪ ᴊᴏsɪʜᴀᴄᴋ ʙᴏᴛ ⟫──╮\n` +
        `├ ߷ ᴘʀᴇꜰɪx     : ${prefix}\n` +
        `├ ߷ ᴏᴡɴᴇʀ      : ᴊᴏsɪ-ʜᴀᴄᴋ\n` +
        `├ ߷ ᴜᴘᴛɪᴍᴇ     : ${getUptime()}\n` +
        `├ ߷ ᴅᴀᴛᴇ       : ${date}\n` +
        `├ ߷ ᴛɪᴍᴇ       : ${time}\n` +
        `├ ߷ ᴠᴇʀsɪᴏɴ    : 7.0.0\n` +
        `├ ߷ ᴄᴏᴍᴍᴀɴᴅs   : ${Object.keys(commands).length}\n` +
        `╰──────────────────╯\n\n` +
        `╭───⟪ ᴄᴀᴛᴇɢᴏʀɪᴇs ⟫───╮\n`;

    catList.forEach((cat, i) => {
        msg += `├ ߷ ${i + 1} • ${cat} (${categories[cat].length})\n`;
    });

    msg += `╰───────────────────╯\n\n`;
    msg += `💡 *${prefix}menu <number>* to see commands\n\n`;
    msg += `> (c) ${year} JosiHack Bot`;
    return msg;
}

console.log('[INFO] Connecting...');

login({ appState }, {
    listenEvents: true,
    selfListen: false,
    selfListenEvent: true,
    updatePresence: false,
    autoMarkRead: false,
    autoReconnect: true,
    online: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
}, (err, api) => {
    if (err) {
        console.error('[ERROR] Login failed:', JSON.stringify(err, null, 2));
        return;
    }

    const botID = api.getCurrentUserID();

    console.log(
        `╭───〔 🤖 JOSIHACK BOT v7.0 〕───⬣\n` +
        `│ Status  : Online\n` +
        `│ Mode    : Messenger (Groups only)\n` +
        `│ Prefix  : ${prefix}\n` +
        `│ Bot ID  : ${botID}\n` +
        `│ Commands: ${Object.keys(commands).length}\n` +
        `╰──────────────⬣`
    );

    api.setOptions({
        listenEvents: true,
        selfListen: false,
        selfListenEvent: true,
        updatePresence: false,
        autoMarkRead: false,
        autoReconnect: true,
        online: true
    });

    const origSend = api.sendMessage.bind(api);
    api.sendMessage = function(msg, threadID, cb) {
        console.log(`[SEND] Sending to ${threadID} (${typeof msg === 'string' ? msg.slice(0, 50) : 'object'}...)`);
        return origSend(msg, threadID, (err, info) => {
            if (err) console.error('[SEND-ERROR]', JSON.stringify(err));
            else console.log('[SEND-OK] Message sent');
            if (cb) cb(err, info);
        });
    };

    console.log('[INFO] Starting MQTT listener...');
    console.log('[INFO] IMPORTANT: Bot only works in GROUPS (Messenger E2EE blocks private messages).');

    api.listenMqtt((listenErr, event) => {
        if (listenErr) {
            console.error('[ERROR] Listener error:', JSON.stringify(listenErr, null, 2));
            return;
        }

        if (event.type !== 'presence') {
            console.log(`[EVENT] Type: ${event.type} | From: ${event.senderID || 'N/A'} | Thread: ${event.threadID || 'N/A'}`);
        }

        if ((event.type === 'message' || event.type === 'message_reply') && event.senderID) {
            let act = getUser('activity', event.senderID) || { messages: 0, commands: 0, firstSeen: Date.now() };
            act.messages = (act.messages || 0) + 1;
            setUser('activity', event.senderID, act);

            let r = getUser('rank', event.senderID) || { xp: 0, level: 1, messages: 0 };
            r.messages = (r.messages || 0) + 1;
            r.xp = (r.xp || 0) + 1;
            const xpNeeded = r.level * 100;
            while (r.xp >= xpNeeded) { r.xp -= xpNeeded; r.level++; }
            setUser('rank', event.senderID, r);
        }

        if (event.type === 'message' || event.type === 'message_reply') {
            const sender = event.senderID;
            const body = (event.body || '').trim();

            if (sender === botID) return;

            const tid = event.threadID;
            const groupData = getUser('groups', tid);
            if (groupData && groupData.badwordsEnabled && groupData.badwords) {
                const lower = body.toLowerCase();
                const found = groupData.badwords.find(w => lower.includes(w));
                if (found) {
                    api.unsendMessage(event.messageID);
                    api.sendMessage(`⚠️ Message removed — contains banned word.`, tid);
                    return;
                }
            }

            if (event.mentions) {
                for (const [id] of Object.entries(event.mentions)) {
                    const busyData = getUser('busy', id);
                    if (busyData) {
                        api.sendMessage(`⏳ This user is busy: "${busyData.reason}"`, tid);
                    }
                }
            }

            const bans = getUser('system', 'bans');
            if (bans && bans.list && bans.list.includes(sender)) return;

            if (!body.startsWith(prefix)) return;

            const fullArgs = body.slice(prefix.length).trim().split(/\s+/);
            const cmdName = fullArgs[0].toLowerCase();

            console.log(`[CMD] "${cmdName}" by ${sender}`);

            if (cmdName === 'menu') {
                return api.sendMessage(buildMenu(fullArgs[1] || ''), tid, (e) => {
                    if (e) console.error('[ERROR] Send failed:', e);
                });
            }

            const resolvedName = aliases[cmdName] || cmdName;
            const cmd = commands[resolvedName];

            if (!cmd) {
                return api.sendMessage(
                    `❌ Unknown command: ${prefix}${cmdName}\n💡 Type *${prefix}menu* to see all commands.`,
                    tid
                );
            }

            try {
                cmd.execute(api, event, {
                    args: fullArgs,
                    prefix,
                    ownerID,
                    botID,
                    botStartTime,
                    commands,
                });
            } catch (execErr) {
                console.error(`[ERROR] Command "${cmdName}" error:`, execErr);
                api.sendMessage(`❌ Error executing command: ${execErr.message}`, tid);
            }
        }
    });
});
