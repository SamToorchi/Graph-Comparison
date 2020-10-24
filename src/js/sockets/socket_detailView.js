// Make Conncetion
// CLIENT!!!!
// var socket = io.connect("http://localhost:4000");
//let socket = io.connect("http://169.254.37.46:4000");
console.log("ich bin DetailView");
//var infoUserName = document.getElementById("infoUserName");
//EMIT Events
socket.emit("register", {
    handle: 'detailView'
});


/*Received private messages*/
socket.on('UserNameForDetail', function (data) {
    console.log("something recieved");

    infoUser1Name.innerHTML = data.y_UserinfoName;
    infoUser1Followers.innerHTML = data.y_followers;
    infoUser1Friends.innerHTML = data.y_friends;
    infoUser1Likes.innerHTML = data.y_likes;
    infoUser1Tweets.innerHTML = data.y_statuses;
    infoUser1Picture.src = data.y_image;
    infoUser1Picture.onerror = () => {
        infoUser1Picture.src = "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png";
    };

    infoUser2Name.innerHTML = data.x_UserinfoName;
    infoUser2Followers.innerHTML = data.x_followers;
    infoUser2Friends.innerHTML = data.x_friends;
    infoUser2Likes.innerHTML = data.x_likes;
    infoUser2Tweets.innerHTML = data.x_statuses;
    infoUser2Picture.src = data.x_image;
    infoUser2Picture.onerror = () => {
        infoUser2Picture.src = "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png";
    };
});

/*Received private messages*/
socket.on('single_y_detail', function (data) {

    infoUser1Name.innerHTML = data.y_UserinfoName;
    infoUser1Followers.innerHTML = data.y_followers;
    infoUser1Friends.innerHTML = data.y_friends;
    infoUser1Likes.innerHTML = data.y_likes;
    infoUser1Tweets.innerHTML = data.y_statuses;
    infoUser1Picture.src = data.y_image;
    infoUser1Picture.onerror = () => {
        infoUser1Picture.src = "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png";
    };
});

/*Received private messages*/
socket.on('single_x_detail', function (data) {
    infoUser2Name.innerHTML = data.x_UserinfoName;
    infoUser2Followers.innerHTML = data.x_followers;
    infoUser2Friends.innerHTML = data.x_friends;
    infoUser2Likes.innerHTML = data.x_likes;
    infoUser2Tweets.innerHTML = data.x_statuses;
    infoUser2Picture.src = data.x_image;
    infoUser2Picture.onerror = () => {
        infoUser2Picture.src = "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png";
    };
});
