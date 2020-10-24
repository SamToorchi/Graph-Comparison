// Make Conncetion
// CLIENT!!!!
// var socket = io.connect("http://localhost:4000");
// var socket = io.connect("http://169.254.209.41:4000");
console.log("ich bin Node Link");

//EMIT Events
socket.emit("register", {
    handle: 'node_link'
})

function sendInformationFromNodeToDetail(y_name, y_followers, y_friends, y_likes, y_statuses, y_image, x_name, x_followers, x_friends, x_likes, x_statuses, x_image){
    socket.emit("private_chat", {
        to: 'detailView',
        y_UserinfoName: y_name,
        y_followers: y_followers,
        y_friends: y_friends,
        y_likes: y_likes,
        y_statuses: y_statuses,
        y_image: y_image,
        x_UserinfoName: x_name,
        x_followers: x_followers,
        x_friends: x_friends,
        x_likes: x_likes,
        x_statuses: x_statuses,
        x_image: x_image
    });
}

function sendIdsFromNodeToIndex(x_id, y_id){
    socket.emit("id_transform", {
        to: 'indexHTML',
        x_id: x_id,
        y_id: y_id
    });
}

function send_Single_y_Node(y_name, y_followers, y_friends, y_likes, y_statuses, y_image) {
    socket.emit("single_y", {
        to: 'detailView',
        y_UserinfoName: y_name,
        y_followers: y_followers,
        y_friends: y_friends,
        y_likes: y_likes,
        y_statuses: y_statuses,
        y_image: y_image
    });
}

function send_Single_x_Node(x_name, x_followers, x_friends, x_likes, x_statuses, x_image){
    socket.emit("single_x", {
        to: 'detailView',
        x_UserinfoName: x_name,
        x_followers: x_followers,
        x_friends: x_friends,
        x_likes: x_likes,
        x_statuses: x_statuses,
        x_image: x_image
    });
}

function send_Single_y_id_Node(y_id){
    socket.emit("single_y_id_transform", {
        to: 'indexHTML',
        y_id: y_id
    });
}

function send_Single_x_id_Node(x_id){
    socket.emit("single_x_id_transform", {
        to: 'indexHTML',
        x_id: x_id
    });
}