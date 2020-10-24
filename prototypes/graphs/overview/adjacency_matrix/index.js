//SERVER!!!!
var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(4000, function(){
    console.log('listening for requests on port 4000,');
});

// Static files <-- add relative location of index.html file
app.use(express.static('.'));

// Socket setup
var io = socket(server);

/*Craete an empty object to collect connected users*/
var connectedUsers = {};

io.on('connection', function(socket){
    console.log('made socket connection', socket.id);

    /*Register connected user*/
    socket.on('register',function(data){
        socket.username = data.handle;
        console.log('username: ', data.handle);
        connectedUsers[data.handle] = socket;
    });

    /* Massage transformation */
    socket.on('private_chat', function(data){
        var to = data.to,
            message = data.message;
        console.log('message: ', message);
        console.log('to: ', to);
        if(connectedUsers.hasOwnProperty(to)){
            connectedUsers[to].emit('private_chat', {
                username: socket.username,

                message: message
            });
        }
    })
});