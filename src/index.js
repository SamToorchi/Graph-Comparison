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
            y_UserinfoName = data.y_UserinfoName,
            y_followers = data.y_followers,
            y_friends = data.y_friends,
            y_likes = data.y_likes,
            y_statuses = data.y_statuses,
            y_image = data.y_image,
            x_UserinfoName = data.x_UserinfoName,
            x_followers = data.x_followers,
            x_friends = data.x_friends,
            x_likes = data.x_likes,
            x_statuses = data.x_statuses,
            x_image = data.x_image;

        console.log('to: ', to);
        if(connectedUsers.hasOwnProperty(to)){
            connectedUsers[to].emit('UserNameForDetail', {
                username: socket.username,
                y_UserinfoName: y_UserinfoName,
                y_followers : y_followers,
                y_friends: y_friends,
                y_likes: y_likes,
                y_statuses: y_statuses,
                y_image: y_image,
                x_UserinfoName: x_UserinfoName,
                x_followers : x_followers,
                x_friends: x_friends,
                x_likes: x_likes,
                x_statuses: x_statuses,
                x_image: x_image
            });
        }
    });

    /* Massage transformation */
    socket.on('id_transform', function(data){
        var to_to = data.to,
            x_id = data.x_id,
            y_id = data.y_id;

        console.log('to: ', to_to);
        if(connectedUsers.hasOwnProperty(to_to)){
            connectedUsers[to_to].emit('UserID', {
                y_id: y_id,
                x_id: x_id
            });
        }
    });

    socket.on('single_y', function(data){
        var to = data.to,
            y_UserinfoName = data.y_UserinfoName,
            y_followers = data.y_followers,
            y_friends = data.y_friends,
            y_likes = data.y_likes,
            y_statuses = data.y_statuses,
            y_image = data.y_image;

        console.log('to: ', to);
        if(connectedUsers.hasOwnProperty(to)){
            connectedUsers[to].emit('single_y_detail', {
                username: socket.username,
                y_UserinfoName: y_UserinfoName,
                y_followers : y_followers,
                y_friends: y_friends,
                y_likes: y_likes,
                y_statuses: y_statuses,
                y_image: y_image
            });
        }
    });

    socket.on('single_x', function(data){
        var to = data.to,
            x_UserinfoName = data.x_UserinfoName,
            x_followers = data.x_followers,
            x_friends = data.x_friends,
            x_likes = data.x_likes,
            x_statuses = data.x_statuses,
            x_image = data.x_image;

        console.log('to: ', to);
        if(connectedUsers.hasOwnProperty(to)){
            connectedUsers[to].emit('single_x_detail', {
                username: socket.username,
                x_UserinfoName: x_UserinfoName,
                x_followers : x_followers,
                x_friends: x_friends,
                x_likes: x_likes,
                x_statuses: x_statuses,
                x_image: x_image
            });
        }
    });

    socket.on('single_y_id_transform', function(data){
        var to_to = data.to,
            y_id = data.y_id;

        console.log('to: ', to_to);
        if(connectedUsers.hasOwnProperty(to_to)){
            connectedUsers[to_to].emit('single_y_UserID', {
                y_id: y_id
            });
        }
    });

    socket.on('single_x_id_transform', function(data){
        var to_to = data.to,
            x_id = data.x_id;

        console.log('to: ', to_to);
        if(connectedUsers.hasOwnProperty(to_to)){
            connectedUsers[to_to].emit('single_x_UserID', {
                x_id: x_id
            });
        }
    });
});
