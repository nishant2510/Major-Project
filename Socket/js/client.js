// const  io = require('socket.io-client')
// const socket=io('http://localhost:8000');

const socket = io('http://localhost:8000');

console.log(socket.connected)

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".containerx");
var audio = new Audio('ring.mp3');

const append = (message , position)=>{
    const messageElement = document.createElement('div');
    messageElement.innerText=message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    if(position=='left')
    {   
        console.log("playedddddddddddddddd!!!")
        audio.play();
    }
}


form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const message = messageInput.value;
    console.log(message);
    append(`You : ${message}`,'right');
    socket.emit('send',message);
    messageInput.value = '';

});


const username = prompt("Enter Your Name to join");
if(username!=null)
socket.emit('new-user-joined', username);

socket.on('user-joined',name=>{
    append(`${name} joined the chat`,'center');
})

socket.on('receive',data=>{
    append(`${data.name} : ${data.message}`,'left');
})

socket.on('left',name=>{
    append(`${name} left the chat!`,'center');
})