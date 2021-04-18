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
    gameSocket.on('playerUpKnop', playerUpKnop);
    gameSocket.on('klikGame', klikGame);
};
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
function playerPressedStart(data) {
  //  io.sockets.in(data.gameId).emit('playerPressedKnop', data);
    console.log('press')
    data.targetPlayer=Math.floor(Math.random() * io.sockets.adapter.rooms.get(data.gameId).size);
    io.sockets.in(data.gameId).emit('startGame', data);
}
function playerUpKnop(data) {
    io.sockets.in(data.gameId).emit('playerUpKnop', data);
    console.log('release')

}
function klikGame(data) {
    io.sockets.in(data.gameId).emit('klikGameClicked', data);
    console.log('klikGame')

}

