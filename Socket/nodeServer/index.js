//node server handling chat sockets
// const io = require('socket.io')(8000)

var express = require('express'),
    app = express(), 
    server = require('http').createServer(app),
    io = require('socket.io')(server, {
        cors: {
          origin: '*',
        }
      });
    path = require('path');
    server.listen(8000);


const users={};


//io.on will listen all connections established through sockets
//socket.io will listen individual connections 
io.on('connection',socket=>{
    socket.on('new-user-joined',name=>{
        console.log("user Joined",name);        //user-joined is custom event that is invoked from UI
        socket.broadcast.emit('user-joined',name);
        users[socket.id]=name;
    });


    socket.on('send',message=>{
        console.log("ctrl reached")
        socket.broadcast.emit('receive',{message:message,name:users[socket.id]})
    });

    socket.on('disconnect',message=>{
        console.log("::::::::::::::",users[socket.id]);
        if(users[socket.id])
        socket.broadcast.emit('left' , users[socket.id]);
        delete users[socket.id];
    })
})
