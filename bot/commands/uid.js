module.exports = {
    name: 'uid',
    category: 'Info',
    description: 'Get your Facebook ID',
    execute(api, event) {
        const targetID = event.type === 'message_reply' && event.messageReply
            ? event.messageReply.senderID
            : event.senderID;
        api.sendMessage(`🆔 *ID*: ${targetID}`, event.threadID);
    }
};
