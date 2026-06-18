module.exports = {
    name: 'unsend',
    category: 'Box chat',
    description: 'Unsend a bot message (reply to it)',
    execute(api, event) {
        if (event.type !== 'message_reply' || !event.messageReply) {
            return api.sendMessage('❌ Reply to a bot message to unsend it.', event.threadID);
        }
        api.unsendMessage(event.messageReply.messageID, (err) => {
            if (err) return api.sendMessage('❌ Cannot unsend. It may not be a bot message.', event.threadID);
        });
    }
};
