const UserDataError = require('./UserDataError');

const Statuses = {
    'new': 'new',
    'online': 'online',
    'offline': 'offline'
};
const users = [];
let lastUserId = 1;

class User {
    constructor(id, name, nickname, date, status) {
        this.id = id;
        this.name = name;
        this.nickname = nickname;
        this.date = date;
        this.status = status;
    }

    static createUser(userObj) {
        if (User.isValid(userObj)) {
            return new User(User.nextUserId(), userObj.name.trim(), userObj.nickname.trim(), new Date(), Statuses['new']);
        } else {
            throw new UserDataError("Could not find user name or user nickname.");
        }
    }

    static isValid(userObj) {
        return (userObj.name && userObj.nickname
                && (userObj.name.trim() !== '') && (userObj.nickname.trim() !== ''));
    }

    static nextUserId() {
        return lastUserId++;
    }

    setOnline() {
        if (this.status === 'new') {
            this.status = 'online';
        }
    }

    setNew() {
        if (this.status === 'offline') {
            this.status = 'new';
        }
    }

    setOffline() {
        this.status = 'offline';
    }

    validateUserOnRelogin(userObj) {
        if (this.name !== userObj.name.trim()) {
            throw new UserDataError("User with same nickname already exist.");
        }
    }
}

function getUserIndexById(id) {
    const err = null;
    if (typeof id === 'undefined') {
        err = new Error('id is undefined');
    }
    let index = -1;
    const user = users.find((el, ind) => {
        if (el.id === id) {
            index = ind;
            return true;
        }
    });
    return index;
}

function getUserIndexByNickname(userNickname) {
    let index = -1;
    const user = users.find((el, ind) => {
        if (el.nickname === userNickname) {
            index = ind;
            return true;
        }
    });
    return index;
}

module.exports = {
    addUser: (userObj, callback) => {
        try {
            let index = getUserIndexByNickname(userObj.nickname.trim());
            let user = null;

            if (index < 0){
                user = User.createUser(userObj);
                users.push(user);
            } else {
                user = users[index];
                user.validateUserOnRelogin(userObj);
                user.setNew();
            }

            setTimeout(() => {
                user.setOnline();
            }, 59000);

            callback(null, user);
        } catch(e) {
            return callback(e);
        }
    },

    getAllUsers: () => {
        return users;
    },

    disconnectUser: (user, callback) => {
        if (user){
            let index = getUserIndexById(user.id);

            if (index > -1) {
                users[index].setOffline();
                callback(null, user);
            }
        }
    }
};
