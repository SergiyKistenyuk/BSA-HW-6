const UserDataError = require('./UserDataError');

const messages = [];
let lastMessageId = 1;

class Message {
    constructor(id, message, sender, date) {
        this.id = id;
        this.message = message;
        this.sender = sender;
        this.date = date;
    }

    static createMessage(messageObj) {
        if (Message.isValid(messageObj)) {
            if (messageObj.sender) {
                return new Message(Message.nextMessageId(), messageObj.message, messageObj.sender, new Date());
            } else {
                throw new UserDataError("Could not find sender.");
            }
        } else {
            throw new UserDataError("Message is empty.");
        }
    }

    static isValid(messageObj) {
        return (messageObj.message && (messageObj.message.trim() !== ''));
    }

    static nextMessageId() {
        return lastMessageId++;
    }
}

function appendMessage(message) {
    messages.push(message);
    if (messages.length > 100) {
        messages.shift();
    }
}

module.exports = {
    addMessage: (messageObj, callback) => {
        try {
            const message = Message.createMessage(messageObj);
            appendMessage(message);

            callback(null, message);
        } catch(e) {
            return callback(e);
        }
    },

    getAllMessages: () => {
        return messages;
    }
};
