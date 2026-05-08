console.log('[START] Démarrage du script...');

const login = require('@dongdev/fca-unofficial');
const fs = require('fs');
const os = require('os');

console.log('[INFO] Chargement de appstate.json...');
let appState;
try {
    appState = JSON.parse(fs.readFileSync('./appstate.json', 'utf8'));
    console.log('[INFO] appstate.json chargé.');
} catch (e) {
    console.error('[ERROR] Erreur appstate:', e.message);
    process.exit(1);
}

const prefix = '?';
const ownerID = '100076386702229';
const botStartTime = Date.now();

function getUptime() {
    const s = Math.floor((Date.now() - botStartTime) / 1000);
    return `${Math.floor(s / 3600)}ʜ ${Math.floor((s % 3600) / 60)}ᴍ ${s % 60}s`;
}

console.log('[INFO] Connexion en cours...');

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
        console.error('[ERROR] Connexion échouée:', JSON.stringify(err, null, 2));
        return;
    }

    const botID = api.getCurrentUserID();

    const welcomeMsg =
        `╭───〔 🤖 *JOSIHACK BOT* 〕───⬣\n` +
        `│ ߷ *Etat*       ➜ Connecté ✅\n` +
        `│ ߷ *Mode*       ➜ Messenger\n` +
        `│ ߷ *Préfixe*    ➜ ${prefix}\n` +
        `│ ߷ *Bot ID*     ➜ ${botID}\n` +
        `╰──────────────⬣`;
    console.log(welcomeMsg);

    api.setOptions({
        listenEvents: true,
        selfListen: false,
        selfListenEvent: true,
        updatePresence: false,
        autoMarkRead: false,
        autoReconnect: true,
        online: true
    });

    console.log('[INFO] Lancement de l\'écoute MQTT...');
    console.log('[INFO] IMPORTANT: Le bot ne fonctionne que dans les GROUPES.');
    console.log('[INFO] Les messages privés (1-on-1) sont chiffrés E2EE par Messenger et ne sont pas supportés par FCA.');

    const categories = {
        '1': { name: 'sʏsᴛèᴍᴇ', cmds: [
            `├ ߷ ${prefix}ping  ➜ ʟᴀᴛᴇɴᴄᴇ ʙᴏᴛ`,
            `├ ߷ ${prefix}host  ➜ ɪɴғᴏs sᴇʀᴠᴇᴜʀ`,
            `├ ߷ ${prefix}uid   ➜ ᴛᴏɴ ɪᴅ ғᴀᴄᴇʙᴏᴏᴋ`,
        ]},
        '2': { name: 'ɢʀᴏᴜᴘᴇ', cmds: [
            `├ ߷ ${prefix}tagall ➜ ᴍᴇɴᴛɪᴏɴɴᴇʀ ᴛᴏᴜs`,
        ]},
        '3': { name: 'ᴜᴛɪʟɪᴛᴀɪʀᴇs', cmds: [
            `├ ߷ ${prefix}info  ➜ ɪɴғᴏs ᴅᴜ ʙᴏᴛ`,
        ]},
    };

    function buildMenu(arg) {
        const now = new Date();
        const year = now.getFullYear();
        const date = now.toLocaleDateString('fr-FR');
        const heure = now.toLocaleTimeString('fr-FR');

        if (arg && categories[arg]) {
            const cat = categories[arg];
            return `╭──⟪ ${cat.name} ⟫──╮\n${cat.cmds.join('\n')}\n╰────────────────────╯\n\n> ©️ ${year} ᴊᴏsɪʜᴀᴄᴋ ʙᴏᴛ`;
        }

        return (
            `╭──⟪ ᴊᴏsɪʜᴀᴄᴋ ʙᴏᴛ ⟫──╮\n` +
            `├ ߷ ᴘʀéғɪxᴇ    : ${prefix}\n` +
            `├ ߷ ᴏᴡɴᴇʀ      : ᴊᴏsɪ-ʜᴀᴄᴋ\n` +
            `├ ߷ ᴜᴘᴛɪᴍᴇ     : ${getUptime()}\n` +
            `├ ߷ ᴅᴀᴛᴇ       : ${date}\n` +
            `├ ߷ ʜᴇᴜʀᴇ      : ${heure}\n` +
            `├ ߷ ᴠᴇʀsɪᴏɴ    : 2.0.0\n` +
            `╰──────────────────╯\n\n` +
            `╭───⟪ ᴄᴀᴛéɢᴏʀɪᴇs ⟫───╮\n` +
            `├ ߷ 1 • sʏsᴛèᴍᴇ\n` +
            `├ ߷ 2 • ɢʀᴏᴜᴘᴇ\n` +
            `├ ߷ 3 • ᴜᴛɪʟɪᴛᴀɪʀᴇs\n` +
            `╰───────────────────╯\n\n` +
            `💡 *${prefix}menu <numéro>* ᴘᴏᴜʀ ᴠᴏɪʀ ʟᴇs ᴄᴏᴍᴍᴀɴᴅᴇs\n\n` +
            `> ©️ ${year} ᴊᴏsɪʜᴀᴄᴋ ʙᴏᴛ`
        );
    }

    function buildHostInfo() {
        const platform = os.platform();
        const arch = os.arch();
        const cpus = os.cpus();
        const cpuModel = cpus[0]?.model || 'Unknown';
        const cpuCores = cpus.length;
        const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
        const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);
        const nodeVersion = process.version;
        const now = new Date().toLocaleString('fr-FR');

        return (
            `╭───〔 🖥️ JOSIHACK HOST 〕───⬣\n` +
            `│ 🌐 *Platform*      : ${platform} (${arch})\n` +
            `│ ⚙️ *CPU*           : ${cpuModel} (${cpuCores} cores)\n` +
            `│ 💾 *Memory*        : ${freeMem} GB free / ${totalMem} GB total\n` +
            `│ 🔧 *Node.js*       : ${nodeVersion}\n` +
            `│ ⏳ *Uptime*        : ${getUptime()}\n` +
            `│ 🕒 *Heure*         : ${now}\n` +
            `╰────────────────────────────⬣`
        );
    }

    api.listenMqtt((listenErr, event) => {
        if (listenErr) {
            console.error('[ERROR] Erreur listener:', JSON.stringify(listenErr, null, 2));
            return;
        }

        if (event.type !== 'presence') {
            console.log(`[EVENT] Type: ${event.type} | De: ${event.senderID || 'N/A'} | Thread: ${event.threadID || 'N/A'}`);
        }

        if (event.type === 'message' || event.type === 'message_reply') {
            const sender = event.senderID;
            const body = (event.body || '').trim();

            if (sender === botID) return;
            if (!body.startsWith(prefix)) return;

            const fullArgs = body.slice(prefix.length).trim().split(/\s+/);
            const cmd = fullArgs[0].toLowerCase();
            const arg = fullArgs[1] || '';

            console.log(`[CMD] "${cmd}" par ${sender}`);

            if (cmd === 'ping') {
                const start = Date.now();
                api.sendMessage('🏓 Pinging...', event.threadID, (sendErr, msgInfo) => {
                    if (sendErr) return console.error('[ERROR] Envoi échoué:', sendErr);
                    const latency = Date.now() - start;
                    api.sendMessage(`🏓 *Pong !*\n\n📡 Latence : *${latency}ms*`, event.threadID, (e) => {
                        if (e) console.error('[ERROR] Envoi échoué:', e);
                        else console.log(`[OK] Pong envoyé ! (${latency}ms)`);
                    });
                });

            } else if (cmd === 'menu') {
                api.sendMessage(buildMenu(arg), event.threadID, (sendErr) => {
                    if (sendErr) console.error('[ERROR] Envoi échoué:', sendErr);
                    else console.log('[OK] Menu envoyé !');
                });

            } else if (cmd === 'uid') {
                const targetID = event.type === 'message_reply' && event.messageReply
                    ? event.messageReply.senderID
                    : sender;
                api.sendMessage(`🆔 *ID* : ${targetID}`, event.threadID, (sendErr) => {
                    if (sendErr) console.error('[ERROR] Envoi échoué:', sendErr);
                    else console.log('[OK] UID envoyé !');
                });

            } else if (cmd === 'host') {
                api.sendMessage(buildHostInfo(), event.threadID, (sendErr) => {
                    if (sendErr) console.error('[ERROR] Envoi échoué:', sendErr);
                    else console.log('[OK] Host info envoyé !');
                });

            } else if (cmd === 'tagall') {
                if (!event.isGroup) {
                    api.sendMessage('🚫 Cette commande fonctionne uniquement dans les groupes.', event.threadID);
                    return;
                }
                api.getThreadInfo(event.threadID, (infoErr, info) => {
                    if (infoErr) {
                        api.sendMessage('❌ Erreur lors de la récupération des infos du groupe.', event.threadID);
                        return;
                    }
                    const participants = info.participantIDs || [];
                    const userText = fullArgs.slice(1).join(' ') || 'Aucun';
                    const tagList = participants.map(id => `│ 👤 @${id}`).join('\n');
                    const mentions = participants.map(id => ({ tag: `@${id}`, id: id }));
                    const tagMsg =
                        `╭───────◇\n` +
                        `│ 🤖 *JOSIHACK BOT - TAGALL* 🤖\n` +
                        `╰───────◇\n\n` +
                        `👥 *Groupe* : ${info.threadName || 'N/A'}\n` +
                        `👨‍👩‍👧‍👦 *Membres* : ${participants.length}\n\n` +
                        `🗒️ *Note* : ${userText}\n\n` +
                        `╭───〔 LISTE 〕───⬣\n` +
                        `${tagList}\n` +
                        `╰──────────────⬣\n\n` +
                        `> PRODUCED BY JOSIHACK BOT BOY`;
                    api.sendMessage({ body: tagMsg, mentions: mentions }, event.threadID, (sendErr) => {
                        if (sendErr) console.error('[ERROR] Envoi échoué:', sendErr);
                        else console.log('[OK] Tagall envoyé !');
                    });
                });

            } else if (cmd === 'info') {
                const infoMsg =
                    `╭───〔 🤖 JOSIHACK BOT 〕───⬣\n` +
                    `│ ߷ *Etat*       ➜ Connecté ✅\n` +
                    `│ ߷ *Mode*       ➜ Messenger\n` +
                    `│ ߷ *Préfixe*    ➜ ${prefix}\n` +
                    `│ ߷ *Bot ID*     ➜ ${botID}\n` +
                    `│ ߷ *Uptime*     ➜ ${getUptime()}\n` +
                    `│ ߷ *Version*    ➜ 2.0.0\n` +
                    `╰──────────────⬣\n\n` +
                    `> ©️ ${new Date().getFullYear()} ᴊᴏsɪʜᴀᴄᴋ ʙᴏᴛ`;
                api.sendMessage(infoMsg, event.threadID, (sendErr) => {
                    if (sendErr) console.error('[ERROR] Envoi échoué:', sendErr);
                    else console.log('[OK] Info envoyé !');
                });

            } else {
                api.sendMessage(`❌ Commande inconnue: ${prefix}${cmd}\n💡 Tape *${prefix}menu* pour voir les commandes.`, event.threadID, (sendErr) => {
                    if (sendErr) console.error('[ERROR] Envoi échoué:', sendErr);
                });
            }
        }
    });
});
