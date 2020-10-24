// Make Conncetion
// CLIENT!!!!
var socket = io.connect("http://localhost:4000");

//Query DOM (Zugriff auf DOM)
//var message = document.getElementById('message'),
    //handle = document.getElementById('handle'),
    //btn_register = document.getElementById('register'),
    //btn_send = document.getElementById('send')
//output = document.getElementById('output'),
   // to = document.getElementById('to');

//EMIT Events
socket.emit("register", {
    handle: 'adjacency_matrix'
})

function send_message(message){
    socket.emit("private_chat", {
        to: 'show_name',
        message: message
    });
}

/*
btn_send.addEventListener('click', function(){
    socket.emit("private_chat", {
        to: to.value,
        message: message.value
    });
});
*/


/*Received private messages*/
socket.on('private_chat',function(data){
    var username = data.username;
    var message = data.message;

    output.innerHTML += '<p><strong>' + data.username + ': </strong>' + data.message + '</p>';
});

