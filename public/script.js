
var videoGrid = document.querySelector(".video-grid");
var myVideo = document.createElement("video");
myVideo.muted = true;

var socket = io();
var MyVideostream;
var myId;
var peers = {};
var name;

navigator.mediaDevices.getUserMedia({
    audio : true,
    video : true
}).then(stream => {
    //Creating a peer for us when the video and audio is available
    const peer = new Peer(undefined,{
        host: 'localhost',
        port: 3000,
        path: '/peerjs'
    });

    //fired when our peer connection is established with the server
    peer.on("open", id =>{
        console.log("My peer id is + " + id);
        name = prompt("Enter your name");
        socket.emit("join-room", ROOM_ID,id,name);
        myId =  id;
    })

    //adding my video to the html document
    MyVideostream = stream;
    myVideo.classList.add("myself");
    var div = document.createElement("div");
    div.classList.add("max");
    div.append(myVideo)
    addVideoStream(div,myVideo, MyVideostream);

    //event fired when a new user has joined the room with the other person's id
    socket.on("connect-newUser", (id) =>{
        console.log("connect to " + id + " and his name is " + name);

        //calling him to send his videoData and passing our videoData along with our name
        var call = peer.call(id, stream, { metadata: { callerId: myId } });
        toggleScreen();

        //creating a video element to recieve his data
        var video = document.createElement("video");
        var div = document.createElement("div");
        div.classList.add("max");
        div.append(video)

        // event fired when the user has answerd the call with his videoData
        call.on("stream", userStream =>{
            console.log("got the user stream", userStream);
            addVideoStream(div,video, userStream);
        })
        //event fired when other user disconnects
        call.on("close", () =>{
            console.log("Closing that users video");
            video.parentElement.remove();
            changeMax();
        })

        //saving his call
        peers[id] = call;
        console.log("caller " + id + " saved");
        console.log(peers[id]);
    })

    //fires when I join to a already existed room with older participants calling us for our videoData
    peer.on("call", (call) =>{

        //answering the call with our videoData and also recieving their video
        console.log("someone is calling");
        call.answer(MyVideostream);
        toggleScreen();
        //creating a video for each caller to store thier videoData
        var video = document.createElement("video");
        var div = document.createElement("div");
        div.classList.add("max");
        div.append(video)

        //fired when the callers videoData is recieved
        call.on("stream", userStream =>{
            console.log("got that someone stream", userStream)
            addVideoStream(div,video, userStream);
        })

        //event fired when caller disconnects
        call.on("close", () =>{
            console.log("Closing that users video");
            video.parentElement.remove();
            changeMax();
        })


        //saving the callers call
        peers[call.metadata.callerId] = call;
        console.log("caller " + call.metadata.callerId + " saved");
        console.log(peers[call.metadata.callerId]);
    })

    //fires when a user disconnets from the room
    socket.on("remove-him", id =>{
        console.log("trying to close caller " + id);

        //fires a "close" event to that particular call
        peers[id].close();
    })
})

//function used to append the video to our html doc
function addVideoStream(div,video, stream){
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    })
    videoGrid.append(div);
}

//function to mute our audio
function mute(){
    if(MyVideostream.getAudioTracks()[0].enabled){
        MyVideostream.getAudioTracks()[0].enabled = false;
    }
    else{
        MyVideostream.getAudioTracks()[0].enabled = true;
    }
    changeMutebtn();
}
function changeMutebtn(){
    var text = '<i class="icon fas fa-microphone-slash" aria-hidden="true"></i>';
    var btn = document.querySelector(".mute");
    console.log(btn.innerHTML);
    if(btn.innerHTML !== text){
        btn.innerHTML = text;
        btn.style.background = "rgb(255, 28, 28)";
    }
    else{
        btn.innerHTML = '<i class="icon fas fa-microphone-alt "></i>';
        btn.style.background = "rgb(31, 168, 168)";
    }
}

   
//function to stop our video
function stopVideo(){
    if( MyVideostream.getVideoTracks()[0].enabled ){
        MyVideostream.getVideoTracks()[0].enabled = false;
    }
    else{
        MyVideostream.getVideoTracks()[0].enabled = true;
    }
    changeVideobtn();
}
function changeVideobtn(){
    var text = '<i class="icon fas fa-video-slash" aria-hidden="true"></i>';
    var btn = document.querySelector(".vid");
    console.log(btn.innerHTML);
    if(btn.innerHTML !== text){
        btn.innerHTML = text;
        btn.style.background = "rgb(255, 28, 28)";
    }
    else{
        btn.innerHTML = '<i class="icon fas fa-video "></i>';
        btn.style.background = "rgb(31, 168, 168)";
    }
}


// code to send messages
var inp = document.querySelector("#msg-inp");

inp.onkeypress = function(e){
    if(e.code === "Enter" && inp.value.length > 0){
        socket.emit("message", inp.value);
        inp.value = "";
    }
}
socket.on("message", (txt, user_name) =>{
    var chat = document.querySelector(".chat");

    var li = document.createElement("li");
    var outer_div = document.createElement("div"); outer_div.classList.add("outer_div");
    var name_div = document.createElement("div");  name_div.classList.add("name_div");
    var text_div = document.createElement("div");  text_div.classList.add("text_div");

    if(name === user_name){ 
        name_div.textContent = "You";
        li.classList.add("chat-me");
    }
    else{                  
        name_div.textContent = user_name;
        li.classList.add("chat-others");
    }
    outer_div.append(name_div);

    text_div.textContent = txt;
    outer_div.append(text_div);

    li.append(outer_div);
    chat.append(li)
})
//to toggle chat screen
var msg_icon = document.querySelector(".msg_icon");
var cross    = document.querySelector(".cross");

msg_icon.onclick = toggleChat;
cross.onclick    = toggleChat;

function toggleChat(){
    console.log("Function worked");
    var chat_screen = document.querySelector(".chat-div");
    chat_screen.classList.toggle("hide");
}

//to toggle max screens
function toggleScreen(){
    var div = document.querySelector(".max");
    div.classList.add("min");
    div.classList.remove("max");
}

//to change max when removed
function changeMax(){
    var div = document.querySelector(".max")
    if(!div){
        var divs = document.querySelectorAll(".min");
        divs[divs.length-1].classList.remove("min");
        divs[divs.length-1].classList.add("max");
    }
}



