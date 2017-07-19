const router = require('express').Router();
const userService = require('./../../services/user');
const messageService = require('./../../services/message');

router.post('/', (req, res) => {
    userService.addUser(req.body, (err, data) => {
        if (!err){
            //res.data = data;
            // send data - user lists, messages list
            res.json({
                user: data,
                users: userService.getAllUsers(),
                messages: messageService.getAllMessages()
            });
        } else {
            console.log(err.name + ': ' + err.message);
            res.status(400).send(err.name + ': ' + err.message);
            res.end();
        }
    });
});

router.get('/', (req, res) => {
    res.json( userService.getAllUsers() );
});

router.get('/withallmessages', (req, res) => {
    res.json({
        users: userService.getAllUsers(),
        messages: messageService.getAllMessages()
    });
});

module.exports = router;