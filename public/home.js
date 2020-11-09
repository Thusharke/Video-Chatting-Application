var join = document.querySelector(".join");

join.onclick = joinRoom;

function joinRoom(){
    var link = prompt("Enter the room link");
    window.location = link;
}
