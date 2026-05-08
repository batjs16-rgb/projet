const { getUser, setUser } = require('../utils/storage');
const { randomInt, formatMoney } = require('../utils/format');

module.exports = {
    name: 'battle',
    category: 'Game',
    description: 'Quick battle against another user',
    execute(api, event, { args }) {
        const uid = event.senderID;
        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        const targetID = mentions[0];
        if (!targetID) return api.sendMessage('❌ Usage: battle @user', event.threadID);
        if (targetID === uid) return api.sendMessage('❌ Can\'t battle yourself!', event.threadID);

        const myAtk = randomInt(10, 50);
        const myDef = randomInt(5, 30);
        const enAtk = randomInt(10, 50);
        const enDef = randomInt(5, 30);

        let myHp = 100, enHp = 100;
        let log = `╭───〔 ⚔️ BATTLE 〕───⬣\n`;

        for (let r = 1; r <= 5 && myHp > 0 && enHp > 0; r++) {
            const myDmg = Math.max(1, myAtk - Math.floor(enDef / 2) + randomInt(-5, 5));
            const enDmg = Math.max(1, enAtk - Math.floor(myDef / 2) + randomInt(-5, 5));
            enHp -= myDmg;
            myHp -= enDmg;
            log += `│ R${r}: You deal ${myDmg} | Enemy deals ${enDmg}\n`;
        }

        const won = myHp > enHp;
        const reward = randomInt(100, 500);
        let bank = getUser('bank', uid) || { wallet: 1000 };
        if (won) {
            bank.wallet = (bank.wallet || 0) + reward;
            setUser('bank', uid, bank);
        }

        log += `╰──────────────⬣\n\n`;
        log += won
            ? `🏆 *YOU WIN!*\n💰 +${formatMoney(reward)}`
            : `💀 *YOU LOST!*`;

        api.sendMessage(log, event.threadID);
    }
};
