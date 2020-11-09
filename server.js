var express = require("express");
var  app = express();
var server = require("http").createServer(app);
var io = require('socket.io')(server);
var { v4 : uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');

app.set("view engine","ejs");
app.use(express.static('public'));

app.get("/",(req,res) =>{
    res.render("home");
})
app.get("/makeRoom",(req,res) =>{
    res.redirect(`/${uuidv4()}`);
})
app.get("/:room", (req,res) =>{
    res.render("index",{ROOM_ID : req.params.room});
})

rooms = {};

io.on("connection", (socket) =>{
    socket.on("join-room", (ROOM_ID,id,name) =>{
        socket.join(ROOM_ID);
        if(!rooms[ROOM_ID])   rooms[ROOM_ID] = [];
        rooms[ROOM_ID].push(id);
        socket.to(ROOM_ID).broadcast.emit("connect-newUser",id);
        socket.on("disconnect", () =>{
            socket.to(ROOM_ID).broadcast.emit("remove-him", id);
        })
        socket.on("message", txt => {
            io.to(ROOM_ID).emit("message", txt,name);
        })
    })
})

server.listen(3000,(err) =>{
    if(err){
        console.log("something went wrong");
    }
    else
        console.log("The server is running");
})

var peerServer = ExpressPeerServer(server, {
    debug : true
});
app.use("/peerjs", peerServer);