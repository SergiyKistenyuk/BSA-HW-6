module.exports = function (io) {
    io.on('connection', function (socket) {
        const userService = require('./services/user');
        const messageService = require('./services/message');
        const typingUserService = require('./services/typingUser');

        let user = null;

        socket.on('client-login', function (userObj) {
            userService.addUser(userObj, (err, data) => {
                if (err) {
                    console.log(err.name + ': ' + err.message);
                    socket.emit('server-error-message', (err.name + ': ' + err.message));
                } else {
                    user = data;

                    socket.emit('server-init-messages-list', messageService.getAllMessages());
                    socket.emit('server-typing', typingUserService.getAllTypingUsers());
                    io.emit('server-get-users-list', userService.getAllUsers());

                    setTimeout(() => {
                        io.emit('server-get-users-list', userService.getAllUsers());
                    }, 60000);
                }
            });
        });

        socket.on('client-new-message', function (messageStr) {
            const message = {message: messageStr, sender: user};
            messageService.addMessage(message, (err, data) => {
                if (err) {
                    console.log(err.name + ': ' + err.message);
                    socket.emit('server-error-message', (err.name + ': ' + err.message));
                } else {
                    io.emit('server-new-message', messageService.getAllMessages());
                }
            });
        });

        socket.on('client-start-typing', function () {
            typingUserService.addTypingUser(user, (data) => {
                io.emit('server-typing', data);
            });
        });

        socket.on('client-finish-typing', function () {
            typingUserService.removeTypingUser(user, (data) => {
                io.emit('server-typing', data);
            });
        });

        socket.on('disconnect', function () {
            typingUserService.removeTypingUser(user, (data) => {
                io.emit('server-typing', data);
            });

            userService.disconnectUser(user, (err, data) => {
                io.emit('server-get-users-list', userService.getAllUsers());
                io.emit('server-user-disconnected', data);
            });
        });
    });
}