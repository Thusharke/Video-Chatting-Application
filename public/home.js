var join = document.querySelector(".join");

join.onclick = joinRoom;

function joinRoom(){
    var link = prompt("Enter the room link");
    var name = prompt("Enter you name");
    window.location = link;
}

function showBody(){
    var body = document.querySelector("body");
    body.style.display = "block";
}