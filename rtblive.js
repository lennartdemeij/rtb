var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var io;
var gameSocket;

exports.initGame = function (sio, socket) {
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', { message: "You are connected!" });
    gameSocket.on('playerJoinGame', playerJoinGame);
    gameSocket.on('playerPressedKnop', playerPressedKnop);
    gameSocket.on('playerPressedTarget', playerPressedTarget);
    gameSocket.on('newPlayerPosition', newPlayerPosition);
    gameSocket.on('playerPressedAntwoordDoorvoeren', playerPressedAntwoordDoorvoeren);
    gameSocket.on('playerPressedStart', playerPressedStart);
    gameSocket.on('playersPressedStart', playersPressedStart);
    gameSocket.on('playerPressedHint', playerPressedHint);
    gameSocket.on('playerPressedSkip', playerPressedSkip);
    gameSocket.on('playerUpKnop', playerUpKnop);
    gameSocket.on('playerGotItWrong', playerGotItWrong);
    gameSocket.on('klikGame', klikGame);
    gameSocket.on('stukjeMoved', stukjeMoved);
    gameSocket.on('puzzelgoed', puzzelgoed);
    gameSocket.on('reconnect', reconnect);
};
function reconnect(data) {
    sock.join(data.gameId);
}

function playerJoinGame(data) {
    console.log('Player ' + data.playerName + 'attempting to join game: ' + data.gameId );
    var sock = this;
    var room = io.sockets.adapter.rooms.get(data.gameId);
    if (room == undefined) {
        data.host = true;
    } else {
        data.host = false;
    }
    data.mySocketId = sock.id;
    sock.join(data.gameId);
    data.numberOfPlayers = io.sockets.adapter.rooms.get(data.gameId).size;
    console.log('alle clients', [...io.sockets.adapter.rooms.get(data.gameId)]);
    data.room = [...io.sockets.adapter.rooms.get(data.gameId)];
        console.log('Player ' + data.playerName + ' joining game: ' + data.gameId );
    io.sockets.in(data.gameId).emit('playerJoinedRoom', data);
          if(io.sockets.adapter.rooms.get(data.gameId).size>1){
        console.log('begin spel');
        io.sockets.in(data.gameId).emit('showStartButton', data);
          } else {
              io.sockets.adapter.rooms.get(data.gameId).playersReady = 0;
    }
    console.log('socket',io.sockets.adapter.rooms.get(data.gameId).size)
}
function playerPressedKnop(data) {
    io.sockets.in(data.gameId).emit('playerPressedKnop', data);
    console.log('press')
}
function playerPressedTarget(data) {
    io.sockets.in(data.gameId).emit('playerPressedTarget', data);
    console.log('playerPressedTarget')
}
function newPlayerPosition(data) {
    io.sockets.in(data.gameId).emit('newPlayerPosition', data);
    console.log('newPlayerPosition')
}
function playerPressedAntwoordDoorvoeren(data) {
    io.sockets.in(data.gameId).emit('someonePressedAntwoordDoorvoeren', data);
    console.log('someonePressedAntwoordDoorvoeren')
}
function stukjeMoved(data) {
    io.sockets.in(data.gameId).emit('someoneMovedStukje', data);
    console.log('someoneMovedStukje')
}
function puzzelgoed(data) {
    io.sockets.in(data.gameId).emit('puzzelgoed', data);
    console.log('puzzelgoed')
}
function playerPressedStart(data) {
        io.sockets.adapter.rooms.get(data.gameId).playersReady++;
    
    data.playersReady = io.sockets.adapter.rooms.get(data.gameId).playersReady;
    io.sockets.in(data.gameId).emit('someonePressedStart', data);

}
function playersPressedStart(data) {
    //  io.sockets.in(data.gameId).emit('playerPressedKnop', data);
      console.log('press')
      data.targetPlayer=Math.floor(Math.random() * io.sockets.adapter.rooms.get(data.gameId).size);
    io.sockets.in(data.gameId).emit('startGame', data);
    var counter = 0;
    var seconds = data.totalTime;
    var remaining;
    var interval = setInterval(function () {
        remaining = seconds - Math.ceil(counter / 1000);
        io.sockets.in(data.gameId).emit('countdown', remaining);
        if (counter >= data.totalTime*1000) {
            io.sockets.in(data.gameId).emit('finished');
        } else {
            counter += 1000;
        }
        if (counter % 20000 == 0) {
            var xhr = new XMLHttpRequest();
            xhr.open('post', 'https://remoteteambuilding.nl/tussenscore.php');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(encodeURIComponent('code') + "=" + encodeURIComponent(data.sessieId));
            xhr.onload = function () {
                io.sockets.in(data.gameId).emit('tussenscores', xhr.responseText);
            }
        }
        if (!io.sockets.adapter.rooms.get(data.gameId)){
            clearInterval(interval);

        }
        console.log('timer '+remaining);
    }, 1000);


}
function playerGotItWrong(data) {
    console.log('wrongpress')
    io.sockets.in(data.gameId).emit('someoneGotItWrong', data);
}
function playerPressedHint(data) {
    console.log('press')
    io.sockets.in(data.gameId).emit('someonePressedHint', data);
}
function playerPressedSkip(data) {
    console.log('press')
    io.sockets.in(data.gameId).emit('someonePressedSkip', data);
}
function playerUpKnop(data) {
    io.sockets.in(data.gameId).emit('playerUpKnop', data);
    console.log('release')

}
function klikGame(data) {
    io.sockets.in(data.gameId).emit('klikGameClicked', data);
    console.log('klikGame')

}

