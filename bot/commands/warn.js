const { getUser, setUser } = require('../utils/storage');

module.exports = {
    name: 'warn',
    category: 'Box chat',
    description: 'Warn a user',
    execute(api, event, { args, ownerID }) {
        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        const targetID = mentions[0];
        if (!targetID) return api.sendMessage('❌ Usage: warn @user [reason]', event.threadID);
        const reason = args.slice(2).join(' ') || 'No reason given';
        const warns = getUser('warns', targetID) || { count: 0, reasons: [] };
        warns.count++;
        warns.reasons.push({ reason, time: Date.now(), by: event.senderID });
        setUser('warns', targetID, warns);
        let msg = `⚠️ *Warning #${warns.count}*\n📝 Reason: ${reason}`;
        if (warns.count >= 3) msg += `\n\n🔨 3 warnings reached! Consider kicking.`;
        api.sendMessage(msg, event.threadID);
    }
};
