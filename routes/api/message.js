const route = require('express').Router();
const messageService = require('../../services/message');

route.post('/', (req, res) => {
    // Expects {message, senderObject: {name, nickname}}
    messageService.addMessage(req.body, (err, data) => {
        if (!err){
            res.json( messageService.getAllMessages() );
        } else {
            res.status(400).send(err.name + ': ' + err.message);
            res.end();
        }
    });
});

route.get('/', (req, res) => {
    res.data = messageService.getAllMessages();
    res.json(res.data);
});

module.exports = route;