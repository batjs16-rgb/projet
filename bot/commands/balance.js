const { getUser } = require('../utils/storage');
const { formatMoney } = require('../utils/format');

module.exports = {
    name: 'balance',
    aliases: ['bal'],
    category: 'Info',
    description: 'Quick balance check',
    execute(api, event) {
        const uid = event.senderID;
        const u = getUser('bank', uid) || { wallet: 1000, bank: 0, vault: 0 };
        const total = (u.wallet || 0) + (u.bank || 0) + (u.vault || 0);
        api.sendMessage(
            `💵 *Wallet*: ${formatMoney(u.wallet || 0)}\n` +
            `🏦 *Bank*: ${formatMoney(u.bank || 0)}\n` +
            `🔐 *Vault*: ${formatMoney(u.vault || 0)}\n` +
            `📊 *Total*: ${formatMoney(total)}`,
            event.threadID
        );
    }
};
