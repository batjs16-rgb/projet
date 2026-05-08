console.log('[START] Démarrage du script...');

const login = require('@dongdev/fca-unofficial');
const fs = require('fs');

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

    console.log('[INFO] Connecté !');
    const botID = api.getCurrentUserID();
    console.log('[INFO] Bot ID:', botID);

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

            console.log(`[MSG] De: ${sender} | Contenu: "${body}"`);

            if (sender === botID) return;

            if (!body.startsWith(prefix)) return;

            const args = body.slice(prefix.length).trim().split(/\s+/);
            const cmd = args[0].toLowerCase();

            console.log(`[CMD] "${cmd}" par ${sender}`);

            if (cmd === 'ping') {
                api.sendMessage('🏓 Pong !', event.threadID, (sendErr) => {
                    if (sendErr) console.error('[ERROR] Envoi échoué:', sendErr);
                    else console.log('[OK] Pong envoyé !');
                });
            } else if (cmd === 'menu') {
                api.sendMessage(
                    `╭──⟪ ᴊᴏsɪʜᴀᴄᴋ ⟫──╮\n├ ᴘʀéғɪxᴇ: ${prefix}\n╰─────────────╯\n\nCommandes: ping, menu, uid`,
                    event.threadID,
                    (sendErr) => {
                        if (sendErr) console.error('[ERROR] Envoi échoué:', sendErr);
                        else console.log('[OK] Menu envoyé !');
                    }
                );
            } else if (cmd === 'uid') {
                api.sendMessage(`🆔 ID: ${sender}`, event.threadID, (sendErr) => {
                    if (sendErr) console.error('[ERROR] Envoi échoué:', sendErr);
                    else console.log('[OK] UID envoyé !');
                });
            } else {
                api.sendMessage(`❌ Inconnu: ${prefix}${cmd}`, event.threadID, (sendErr) => {
                    if (sendErr) console.error('[ERROR] Envoi échoué:', sendErr);
                });
            }
        }
    });
});
