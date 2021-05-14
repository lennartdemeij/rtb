var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "lennartdemeij@gmail.com",
    pass: "wx705qasdf",
  },
});

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var io;
var gameSocket;
function mailme(functienaam, err) {
  var mailOptions = {
    from: "lennartdemeij@gmail.com",
    to: "lennartdemeij@gmail.com",
    subject: "SERVER KAPOT",
    text: functienaam + "\n\n" + err,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
exports.initGame = function (sio, socket) {
  io = sio;
  gameSocket = socket;
  gameSocket.emit("connected", { message: "You are connected!" });
  gameSocket.on("playerJoinGame", playerJoinGame);
  gameSocket.on("playerPressedKnop", playerPressedKnop);
  gameSocket.on("playerPressedTarget", playerPressedTarget);
  gameSocket.on("newPlayerPosition", newPlayerPosition);
  gameSocket.on(
    "playerPressedAntwoordDoorvoeren",
    playerPressedAntwoordDoorvoeren
  );
  gameSocket.on("playerPressedStart", playerPressedStart);
  gameSocket.on("playersPressedStart", playersPressedStart);
  gameSocket.on("playerPressedHint", playerPressedHint);
  gameSocket.on("playerPressedSkip", playerPressedSkip);
  gameSocket.on("playerUpKnop", playerUpKnop);
  gameSocket.on("playerGotItWrong", playerGotItWrong);
  gameSocket.on("klikGame", klikGame);
  gameSocket.on("stukjeMoved", stukjeMoved);
  gameSocket.on("puzzelgoed", puzzelgoed);
  gameSocket.on("reconnect", reconnect);
};
function reconnect(data) {
  try {
    var sock = this;
    sock.join(data.gameId);
  } catch (err) {
    mailme("reconnect", err);
  }
}

function playerJoinGame(data) {
    try {
        console.log(
      "Player " + data.playerName + "attempting to join game: " + data.gameId
    );
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
    console.log("alle clients", [...io.sockets.adapter.rooms.get(data.gameId)]);
    data.room = [...io.sockets.adapter.rooms.get(data.gameId)];
    console.log("Player " + data.playerName + " joining game: " + data.gameId);
    io.sockets.in(data.gameId).emit("playerJoinedRoom", data);
    if (io.sockets.adapter.rooms.get(data.gameId).size > 1) {
      console.log("begin spel");
      io.sockets.in(data.gameId).emit("showStartButton", data);
    } else {
      io.sockets.adapter.rooms.get(data.gameId).playersReady = 0;
    }
    console.log("socket", io.sockets.adapter.rooms.get(data.gameId).size);
  } catch (err) {
    mailme("playerJoinGame", err);
  }
}
function playerPressedKnop(data) {
  try {
    io.sockets.in(data.gameId).emit("playerPressedKnop", data);
    console.log("press");
  } catch (err) {
    mailme("playerPressedKnop", err);
  }
}
function playerPressedTarget(data) {
  try {
    io.sockets.in(data.gameId).emit("playerPressedTarget", data);
    console.log("playerPressedTarget");
  } catch (err) {
    mailme("playerPressedTarget", err);
  }
}
function newPlayerPosition(data) {
  try {
    io.sockets.in(data.gameId).emit("newPlayerPosition", data);
    console.log("newPlayerPosition");
  } catch (err) {
    mailme("newPlayerPosition", err);
  }
}
function playerPressedAntwoordDoorvoeren(data) {
  try {
    io.sockets.in(data.gameId).emit("someonePressedAntwoordDoorvoeren", data);
    console.log("someonePressedAntwoordDoorvoeren");
    if (data.uitkomst == "goed") {
      io.sockets.adapter.rooms.get(data.gameId).vraagnummer = data.nummer + 1;
    }
  } catch (err) {
    mailme("playerPressedAntwoordDoorvoeren", err);
  }
}
function stukjeMoved(data) {
  try {
    io.sockets.in(data.gameId).emit("someoneMovedStukje", data);
    console.log("someoneMovedStukje");
  } catch (err) {
    mailme("stukjeMoved", err);
  }
}
function puzzelgoed(data) {
  try {
    io.sockets.in(data.gameId).emit("puzzelgoed", data);
    console.log("puzzelgoed");
  } catch (err) {
    mailme("puzzelgoed", err);
  }
}
function playerPressedStart(data) {
  try {
    io.sockets.adapter.rooms.get(data.gameId).playersReady++;

    data.playersReady = io.sockets.adapter.rooms.get(data.gameId).playersReady;
    io.sockets.in(data.gameId).emit("someonePressedStart", data);
    io.sockets.adapter.rooms.get(data.gameId).vraagnummer = -1;
  } catch (err) {
    mailme("playerPressedStart", err);
  }
}
function playersPressedStart(data) {
  try {
    //  io.sockets.in(data.gameId).emit('playerPressedKnop', data);
    if (io.sockets.adapter.rooms.get(data.gameId).vraagnummer == -1) {
      console.log("press");
      io.sockets.adapter.rooms.get(data.gameId).vraagnummer = 0;

      data.targetPlayer = Math.floor(
        Math.random() * io.sockets.adapter.rooms.get(data.gameId).size
      );
      io.sockets.in(data.gameId).emit("startGame", data);
      var counter = 0;
      var seconds = data.totalTime;
      var remaining;
        var interval = setInterval(function () {
            try {
                if (!io.sockets.adapter.rooms.get(data.gameId)) {
                    clearInterval(interval);
                    return;
                }
                remaining = seconds - Math.ceil(counter / 1000);
                io.sockets.in(data.gameId).emit("countdown", remaining);
                if (counter >= data.totalTime * 1000) {
                    io.sockets.in(data.gameId).emit("finished");
                } else {
                    counter += 1000;
                }
                if (counter % 5000 == 0) {
                    io.sockets
                        .in(data.gameId)
                        .emit(
                            "huidigevraag",
                            io.sockets.adapter.rooms.get(data.gameId)?.vraagnummer
                        );
                }
                if (counter % 20000 == 0) {
                    var xhr = new XMLHttpRequest();
                    xhr.open("post", "https://remoteteambuilding.nl/tussenscore.php");
                    xhr.setRequestHeader(
                        "Content-Type",
                        "application/x-www-form-urlencoded"
                    );
                    xhr.send(
                        encodeURIComponent("code") + "=" + encodeURIComponent(data.sessieId)
                    );
                    xhr.onload = function () {
                        io.sockets.in(data.gameId).emit("tussenscores", xhr.responseText);
                    };
                }
                if (!io.sockets.adapter.rooms.get(data.gameId)) {
                    clearInterval(interval);
                }
                //  console.log('timer '+remaining);
            } catch (err) {
                mailme("interval", err);

            }
      }, 1000);
    }
  } catch (err) {
    mailme("playersPressedStart", err);
  }
}
function playerGotItWrong(data) {
  try {
    console.log("wrongpress");
    io.sockets.in(data.gameId).emit("someoneGotItWrong", data);
  } catch (err) {
    mailme("playerGotItWrong", err);
  }
}
function playerPressedHint(data) {
  try {
    console.log("press");
    io.sockets.in(data.gameId).emit("someonePressedHint", data);
  } catch (err) {
    mailme("playerPressedHint", err);
  }
}
function playerPressedSkip(data) {
  try {
    console.log("press");
    io.sockets.in(data.gameId).emit("someonePressedSkip", data);
    io.sockets.adapter.rooms.get(data.gameId).vraagnummer = data.nummer + 1;
  } catch (err) {
    mailme("playerPressedSkip", err);
  }
}
function playerUpKnop(data) {
  try {
    io.sockets.in(data.gameId).emit("playerUpKnop", data);
    console.log("release");
  } catch (err) {
    mailme("playerUpKnop", err);
  }
}
function klikGame(data) {
  try {
    io.sockets.in(data.gameId).emit("klikGameClicked", data);
    console.log("klikGame");
  } catch (err) {
    mailme("klikGame", err);
  }
}
