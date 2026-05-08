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

// Toutes les options doivent être passées au login pour que le listener MQTT
// s'abonne correctement aux topics de messages et d'événements.
login({ appState }, {
    listenEvents: true,
    selfListen: false,
    updatePresence: true,
    autoMarkRead: true,
    online: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
}, (err, api) => {
    if (err) {
        console.error('[ERROR] Connexion échouée:', err);
        return;
    }

    console.log('[INFO] ✅ Connecté !');
    const botID = api.getCurrentUserID();
    console.log('[INFO] Bot ID:', botID);

    console.log('[INFO] Lancement de l\'écoute MQTT...');

    // Fonction d'écoute avec reconnexion automatique
    function startListening() {
        api.listenMqtt((err, event) => {
            if (err) {
                console.error('[ERROR] Erreur d\'écoute:', err);
                console.log('[INFO] Tentative de reconnexion dans 5 secondes...');
                setTimeout(startListening, 5000);
                return;
            }

            // LOG DE TOUT ÉVÉNEMENT (Sauf présence)
            if (event.type !== 'presence') {
                console.log(`\n[EVENT] Type: ${event.type} | De: ${event.senderID} | Thread: ${event.threadID}`);
            }

            if (event.type === 'message' || event.type === 'message_reply') {
                const sender = event.senderID;
                const body = (event.body || '').trim();

                console.log(`[MSG] Contenu: "${body}"`);

                // Ignorer les messages du bot lui-même
                if (sender === botID) return;

                if (!body.startsWith(prefix)) return;

                const args = body.slice(prefix.length).trim().split(/\s+/);
                const cmd = args[0].toLowerCase();

                console.log(`[CMD] "${cmd}" par ${sender}`);

                if (cmd === 'ping') {
                    api.sendMessage('🏓 Pong !', event.threadID);
                } else if (cmd === 'menu') {
                    api.sendMessage(`╭──⟪ ᴊᴏsɪʜᴀᴄᴋ ⟫──╮\n├ ᴘʀéғɪxᴇ: ${prefix}\n╰─────────────╯\n\nCommandes: ping, menu, uid`, event.threadID);
                } else if (cmd === 'uid') {
                    api.sendMessage(`🆔 ID: ${sender}`, event.threadID);
                } else {
                    api.sendMessage(`❌ Inconnu: ${prefix}${cmd}`, event.threadID);
                }
            }
        });
    }

    startListening();
});
