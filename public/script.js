const Statuses = {
    'new': 'just appeared',
    'online': 'online',
    'offline': 'offline'
};

const socket = io();
let itputMessage = document.getElementById('message'),
	userslist = document.getElementById("users-list"),
	typingUsers = document.getElementById("typingUsers"),
	userName = document.getElementById('user-name'),
	user = null;


/* Login */

document.getElementById('login-btn').addEventListener('click', function (e) {
    user = {
    	name: document.getElementById("inputName").value.trim(),
    	nickname: document.getElementById("inputNickname").value.trim()
    };

    socket.emit('client-login', user);
    userName.innerHTML = user.name;
    userName.nextElementSibling.nextElementSibling.innerHTML = user.nickname;

    e.preventDefault();
    return false;
});

socket.on('server-init-messages-list', function(messages){
	if (user) {
        messages.forEach(renderMessageItem);

        document.getElementById("overlay").style.display = 'none';
        document.getElementById("signup-container").style.display = 'none';
    }
});


/* New message */

document.getElementById('message-block').addEventListener('submit', function (e) {
	if (itputMessage.value.trim() !== '') {
        socket.emit('client-new-message', itputMessage.value);
        socket.emit('client-finish-typing');
        itputMessage.value = '';
    }
    e.preventDefault();
    return false;
});

itputMessage.addEventListener('input', function (e) {
	if (itputMessage.value !== '') {
		socket.emit('client-start-typing');
    } else {
        socket.emit('client-finish-typing');
	}
});


/* Update users list */

socket.on('server-get-users-list', function(users){
    if (user) {
        for (; userslist.children.length > 1;) {
            userslist.removeChild(userslist.children[1]);
        }

        users.forEach(renderUserItem);
    }
});

function renderUserItem(user) {
    let element = document.querySelector('#user-template').cloneNode(true);
    element.removeAttribute('id');

    element.querySelector('.user-name').innerHTML = user.name;
    element.querySelector('.user-nickname').innerHTML = user.nickname;
    let statusElement = element.querySelector('.user-status');
    statusElement.innerHTML = Statuses[user.status];
    statusElement.className = statusElement.className + ' ' + user.status;

    userslist.appendChild(element);
}


/* Update messages */

socket.on('server-new-message', function(messages){
    if (user) {
        let chatContent = document.getElementById("chat-content");

        for (; chatContent.children.length > 1;) {
            chatContent.removeChild(chatContent.children[1]);
        }

        messages.forEach(renderMessageItem);
    }
});

function renderMessageItem(messageObj) {
    let element = document.querySelector('#message-row-template').cloneNode(true);
    element.removeAttribute('id');
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };

    element.querySelector('.user-name').innerHTML = messageObj.sender.name;
    element.querySelector('.user-nickname').innerHTML = messageObj.sender.nickname;
    element.querySelector('.created').innerHTML = new Date(messageObj.date).toLocaleString([], options);
    element.querySelector('.message-body').innerHTML = messageObj.message;

    if (messageObj.message.indexOf(`@${user.nickname}`) != -1) {
        element.className = element.className + ' directMessage';
    }

    document.getElementById("chat-content").appendChild(element);
}


/* User is typing */

socket.on('server-typing', function(typingUsersObj){
    if (user) {
        renderTypingUsers(typingUsersObj);
    }
});

function renderTypingUsers(typingUsersObj) {
    let nicknames = [];
    for (key in typingUsersObj) {
    	if (typingUsersObj[key].nickname !== user.nickname) {
            nicknames.push(typingUsersObj[key].nickname);
        }
    }

    if (nicknames.length > 0) {
        const isAre = (nicknames.length === 1) ? ' is ' : ' are ';
        typingUsers.innerHTML = nicknames.join(', ') + isAre + 'typing ...';
    } else {
        typingUsers.innerHTML = '';
	}
}


/* User disconnected */

window.addEventListener("beforeunload", function (event) {
    socket.disconnect();
});

socket.on('server-user-disconnected', function(disconnectedUser){
    if (user) {
        userExit(disconnectedUser);
    }
});

function userExit(disconnectedUser) {
    let el = document.createElement('div');
    el.className = "disconnectedUser";
    el.innerHTML = `User ${disconnectedUser.name} (${disconnectedUser.nickname}) disconnected`;

    let chatContainer = document.getElementById('chat-container');
    chatContainer.appendChild(el);

    setTimeout(() => {
        chatContainer.removeChild(el);
    }, 5000);
}


/* Common error handler */

socket.on('errorMsg', function(error){
    alert(error);
});
