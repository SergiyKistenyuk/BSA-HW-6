let request = obj => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(obj.method || "GET", obj.url);
        if (obj.headers) {
            Object.keys(obj.headers).forEach(key => {
                xhr.setRequestHeader(key, obj.headers[key]);
            });
        }
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send(obj.body);
    });
};

let itputMessage = document.getElementById('message'),
	userslist = document.getElementById("users-list"),
	userName = document.getElementById('user-name'),
	user = null,
    lastData = null;


/* Login */

document.getElementById('login-btn').addEventListener('click', function (e) {
    const data = {
        name: document.getElementById("inputName").value.trim(),
        nickname: document.getElementById("inputNickname").value.trim()
    };

    request({
        method: "POST",
        url: "/api/user/",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
        .then(
            response => init(response),
            error => alert(`Rejected: ${error}`)
        ).catch(error => {
            console.log(error);
            alert(`Rejected: ${error}`);
    });
    e.preventDefault();
    return false;
});

function init(response){
    try {
        const data = JSON.parse(response);
        user = data.user;
        userName.innerHTML = user.name;
        userName.nextElementSibling.nextElementSibling.innerHTML = user.nickname;

        data.messages.forEach(renderMessageItem);
        data.users.forEach(renderUserItem);

        document.getElementById("overlay").style.display = 'none';
        document.getElementById("signup-container").style.display = 'none';

        setInterval(function() {
            reloadData();
        }, 1000);
    } catch (e) {
        alert(e.name + ': ' + e.message);
    }
}


/* New message */

document.getElementById('message-block').addEventListener('submit', function (e) {
    const data = {
        message: itputMessage.value,
        sender: user
    };

    request({
        method: "POST",
        url: "/api/message/",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
        .then(
            response => messagePosted(response),
            error => alert(`Rejected: ${error}`)
        ).catch(error => {
        console.log(error);
        alert(`Rejected: ${error}`);
    });
    itputMessage.value = '';

    e.preventDefault();
    return false;
});

function messagePosted(response) {
    try {
        const data = JSON.parse(response);
        let chatContent = document.getElementById("chat-content");

        for (; chatContent.children.length > 1;) {
            chatContent.removeChild(chatContent.children[1]);
        }
        data.forEach(renderMessageItem);
    } catch (e) {
        alert(e.name + ': ' + e.message);
    }
}


function reloadData() {
    request({
        method: "GET",
        url: "/api/user/withallmessages"
    })
        .then(
            response => dataLoaded(response),
            error => console.log(`Rejected: ${error}`)
        ).catch(error => {
            console.log(error);
    });
}

function dataLoaded(response){
    try {
        if (lastData != response) {
            const data = JSON.parse(response);
            lastData = response;

            let chatContent = document.getElementById("chat-content");
            for (; chatContent.children.length > 1;) {
                chatContent.removeChild(chatContent.children[1]);
            }
            data.messages.forEach(renderMessageItem);

            for (; userslist.children.length > 1;) {
                userslist.removeChild(userslist.children[1]);
            }
            data.users.forEach(renderUserItem);
        }
    } catch (e) {
        console.log(e.name + ': ' + e.message);
    }
}


/* Update users list */

function renderUserItem(user) {
    let element = document.querySelector('#user-template').cloneNode(true);
    element.removeAttribute('id');

    element.querySelector('.user-name').innerHTML = user.name;
    element.querySelector('.user-nickname').innerHTML = user.nickname;

    userslist.appendChild(element);
}


/* Update messages */

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
