const { getUser, setUser } = require('../utils/storage');
const { randomInt, randomChoice, formatMoney } = require('../utils/format');

const CLASSES = {
    warrior: { name: 'Warrior', emoji: '⚔️', hp: 120, atk: 18, def: 15 },
    mage: { name: 'Mage', emoji: '🧙', hp: 80, atk: 25, def: 8 },
    archer: { name: 'Archer', emoji: '🏹', hp: 90, atk: 22, def: 10 },
    tank: { name: 'Tank', emoji: '🛡️', hp: 150, atk: 12, def: 22 },
    assassin: { name: 'Assassin', emoji: '🗡️', hp: 70, atk: 30, def: 5 },
};

module.exports = {
    name: 'clash',
    category: 'Game',
    description: 'Class-based battle game',
    execute(api, event, { args }) {
        const uid = event.senderID;
        const sub = (args[1] || '').toLowerCase();
        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        const targetID = mentions[0];

        if (sub === 'class') {
            let msg = `╭───〔 ⚔️ CLASH CLASSES 〕───⬣\n`;
            for (const [k, c] of Object.entries(CLASSES)) {
                msg += `│ ${c.emoji} *${c.name}* — HP:${c.hp} ATK:${c.atk} DEF:${c.def}\n`;
            }
            msg += `╰──────────────⬣\n💡 clash pick <class>`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'pick') {
            const cls = (args[2] || '').toLowerCase();
            if (!CLASSES[cls]) return api.sendMessage('❌ Unknown class! Use: clash class', event.threadID);
            let u = getUser('clash', uid) || {};
            u.class = cls;
            u.wins = u.wins || 0;
            u.losses = u.losses || 0;
            setUser('clash', uid, u);
            return api.sendMessage(`${CLASSES[cls].emoji} You are now a *${CLASSES[cls].name}*!`, event.threadID);
        }

        if (!targetID) return api.sendMessage('❌ Usage: clash @user — or clash class/pick', event.threadID);
        if (targetID === uid) return api.sendMessage('❌ Can\'t clash yourself!', event.threadID);

        let myData = getUser('clash', uid) || { class: 'warrior', wins: 0, losses: 0 };
        let enData = getUser('clash', targetID) || { class: 'warrior', wins: 0, losses: 0 };
        const myClass = CLASSES[myData.class] || CLASSES.warrior;
        const enClass = CLASSES[enData.class] || CLASSES.warrior;

        let myHp = myClass.hp, enHp = enClass.hp;
        let log = `╭───〔 ⚔️ CLASH 〕───⬣\n│ ${myClass.emoji} ${myClass.name} vs ${enClass.emoji} ${enClass.name}\n╰──────────────⬣\n\n`;

        for (let r = 1; r <= 6 && myHp > 0 && enHp > 0; r++) {
            const myDmg = Math.max(1, myClass.atk + randomInt(-5, 5) - Math.floor(enClass.def / 3));
            const enDmg = Math.max(1, enClass.atk + randomInt(-5, 5) - Math.floor(myClass.def / 3));
            enHp -= myDmg;
            myHp -= enDmg;
            log += `⚔️ R${r}: ${myClass.emoji} ${myDmg} dmg → ${enClass.emoji} | ${enClass.emoji} ${enDmg} dmg → ${myClass.emoji}\n`;
        }

        const won = myHp > enHp;
        if (won) { myData.wins++; enData.losses++; }
        else { myData.losses++; enData.wins++; }
        setUser('clash', uid, myData);
        setUser('clash', targetID, enData);

        const reward = randomInt(200, 600);
        if (won) {
            let bank = getUser('bank', uid) || { wallet: 1000 };
            bank.wallet = (bank.wallet || 0) + reward;
            setUser('bank', uid, bank);
        }

        log += `\n${won ? `🏆 *YOU WIN!* +${formatMoney(reward)}` : '💀 *YOU LOST!*'}`;
        api.sendMessage(log, event.threadID);
    }
};
