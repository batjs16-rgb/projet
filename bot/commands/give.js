const { getUser, setUser } = require('../utils/storage');
const { formatMoney } = require('../utils/format');

module.exports = {
    name: 'give',
    category: 'Game',
    description: 'Give money to another user',
    execute(api, event, { args }) {
        const uid = event.senderID;
        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        const targetID = mentions[0];
        const amount = parseInt(args[2]) || parseInt(args[1]) || 0;

        if (!targetID || amount <= 0) return api.sendMessage('❌ Usage: give @user <amount>', event.threadID);
        if (targetID === uid) return api.sendMessage('❌ Can\'t give to yourself!', event.threadID);

        let sender = getUser('bank', uid) || { wallet: 1000 };
        if ((sender.wallet || 0) < amount) return api.sendMessage(`❌ Not enough! Wallet: ${formatMoney(sender.wallet || 0)}`, event.threadID);

        let receiver = getUser('bank', targetID) || { wallet: 1000 };
        sender.wallet -= amount;
        receiver.wallet = (receiver.wallet || 0) + amount;
        setUser('bank', uid, sender);
        setUser('bank', targetID, receiver);

        api.sendMessage(`💸 Gave ${formatMoney(amount)} to @${targetID}!\n💵 Your wallet: ${formatMoney(sender.wallet)}`, event.threadID);
    }
};
