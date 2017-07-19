const express = require('express');
const app = express();
const http = require('http').Server(app);

const path = require('path');
const staticPath = path.normalize(__dirname + '/public');

const io = require('socket.io')(http);
const chat = require("./modules/chat")(io);

app.use(express.static(staticPath));

http.listen(3000, function(){
    console.log('listening on *:3000');
});
