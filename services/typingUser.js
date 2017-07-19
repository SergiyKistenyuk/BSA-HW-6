const typingUsers = {};

module.exports = {
    addTypingUser: (user, callback) => {
        if (user && !typingUsers[user.id]) {
            typingUsers[user.id] = user;
            callback(typingUsers);
        }
    },

    removeTypingUser:(user, callback) => {
        if (user && typingUsers[user.id]) {
            delete typingUsers[user.id];
            callback(typingUsers);
        }
    },

    getAllTypingUsers: () => {
        return typingUsers;
    }
};