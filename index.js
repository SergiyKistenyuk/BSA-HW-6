const express = require('express');
const app = express();
const http = require('http').Server(app);

const path = require('path');
const bodyParser = require('body-parser');

const io = require('socket.io')(http);
const chat = require("./modules/chat-socket")(io);

const staticPath = path.normalize(__dirname + '/public');

app.use(express.static(staticPath, {index: 'chatsocket.html'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const routes = require('./routes/api/routes')(app);

http.listen(3000, function(){
    console.log('listening on *:3000');
});
