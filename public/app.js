
jQuery(function($){    
    'use strict';
    var IO = {

        init: function () {
            IO.socket = io.connect();
            IO.bindEvents();
        },

        bindEvents: function () {
            IO.socket.on('connected', IO.onConnected);
            // IO.socket.on('newGameCreated', IO.onNewGameCreated );
            IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom);
            IO.socket.on('showStartButton', IO.showStartButton);
            IO.socket.on('playerPressedKnop', IO.playerPressedKnop);
            IO.socket.on('playerPressedTarget', IO.playerPressedTarget);
            IO.socket.on('newPlayerPosition', IO.newPlayerPosition);
            IO.socket.on('someonePressedAntwoordDoorvoeren', IO.someonePressedAntwoordDoorvoeren);
            IO.socket.on('playerPressedAntwoordDoorvoeren', IO.playerPressedAntwoordDoorvoeren);
            IO.socket.on('playerPressedStart', IO.playerPressedStart);
            IO.socket.on('playerUpKnop', IO.playerUpKnop);
            IO.socket.on('startGame', IO.startGame);
            IO.socket.on('klikGameClicked', IO.klikGameClicked);
        },

        onConnected: function () {
            App.mySocketId = IO.socket.id;
            console.log(App.mySocketId );
        },
        playerJoinedRoom: function (data) {
            console.log('hooi', data);
            App.numberOfPlayers = data.numberOfPlayers;
            console.log('room', data.room)
            
            App.players = data.room;
            $('#playerWaitingMessage').html(data.numberOfPlayers+' Spelers aanwezig. Druk op start als alle spelers er zijn.');
        },
        showStartButton: function (data) {
            $('#startButton').show();
        },
        startGame: function (data) {
          
            App.targetPlayer = data.targetPlayer;
            console.log('targetPlayer', App.targetPlayer);
            if (App.targetPlayer != App.numberOfPlayers - 1) {
                App.mazePlayer = App.targetPlayer + 1;
                
            } else {
                App.mazePlayer = 0;
            }
            App.playerNumber = App.players.indexOf(App.mySocketId);
            if (App.playerNumber > 0) {
                var k = setInterval(function () {
                  //  console.log(App.game4opacity);
                    if (App.game4opacity > 0) {
                        App.game4opacity = App.game4opacity - 0.2;
                    }
                    if (App.playerNumber == App.numberOfPlayers - 1 && App.game4opacity<0.4) {
                        App.game4final=0;
                    }
                    
                    $("#gameArea .groteKnop").css("opacity", App.game4opacity);
                }, 1000);
            }
            //alert(App.playerNumber,App.mySocketId);
            //game1
            $(".knopContainer").html("");
            for (var i = 0; i < App.numberOfPlayers; i++){
                $(".knopContainer").append("<div class='knop knop"+(i+1)+"' knopnr="+(i+1)+"></div>");
            }
            //game2
            if (App.targetPlayer != App.playerNumber) {
                var aantalHintGevers = App.numberOfPlayers - 1;
                var hintGeverNumber = App.targetPlayer < App.playerNumber ? App.playerNumber - 1:App.playerNumber;
                $('.point').addClass(hintGeverNumber >= Math.floor(aantalHintGevers / 2) ? "vertiPoint" : "horiPoint");
                if (hintGeverNumber == aantalHintGevers-1 ||hintGeverNumber == 0) {
                    $('.point').each(function () { $(this).html($(this).attr('pointnr'));});
                }
                } else {
                $('.point').addClass('targetPoint');
            }
            //game3
            for (var x = 0; x < 10; x++){
                for (var y = 0; y < 10; y++) {
                    $('.game3container .maze').append("<div class='"+(App.maze[x][y]==1?'muur':'open')+"'></div>");
                }

            }
            $('.mazeplayer').css('left', App.game3position[0] * 30 + "px").css('top', App.game3position[1] * 30 + "px");
            var knopPlayer = 0;
            var richting = ['up', 'down', 'right', 'left'];
            for (var t = 0; t < 4; t++) {
                if(App.playerNumber==knopPlayer){
                    $('.game3container').append("<div class='mazeknop' richting='"+richting[t]+"'></div>");
                }
                knopPlayer++;
                if (knopPlayer >= App.numberOfPlayers) {
                    knopPlayer = 0;
                }
            }
            //game4
            if (App.playerNumber == 0) {
                App.game4opacity = 1;
            } else {
                App.game4opacity = 0;
            }
            App.startVraag();
          //  $('#gameArea').html($('.game1').html());
          },
          playerPressedKnop : function(data) {
            App.Player.someonePressedKnop(data);
            console.log('playerPressedKnop',data);
        },
        klikGameClicked: function (data) {
            if (data.klik == App.playerNumber - 1) {
                App.game4opacity = 1;

              }
          },
        playerPressedTarget : function(data) {
            $('#gameArea .point:first-of-type').remove();
            if (App.targetPlayer == App.playerNumber && $('#gameArea .point').length < 1 && !App.game2finished) {
                App.game2finished = true;
                var data = {
                    gameId: App.gameId,
                    vraagAntwoord: "Game completed",
                    uitkomst: "goed"
                };
                
                    IO.socket.emit('playerPressedAntwoordDoorvoeren', data);
            }
        },
        newPlayerPosition: function (data) {
            App.game3position = data.newPosition;
            $('#gameArea .mazeplayer').css('left', App.game3position[0] * 30 + "px").css('top', App.game3position[1] * 30 + "px");

            
        },
      
        playerPressedStart : function(data) {
           // App.Player.playerPressedStart(data);
            console.log('playerPressedStart',data);
        },
        someonePressedAntwoordDoorvoeren: function (data) {
            App.Player.someonePressedAntwoordDoorvoeren(data);
           console.log('someonePressedAntwoordDoorvoeren',data);
        },
        playerUpKnop : function(data) {
            App.Player.someoneUpKnop(data);
            console.log('someoneUpKnop',data);
        },
        error : function(data) {
        }

    };

    var App = {

        huidigeMuziek: '',
        huidigeVideo:'',
        game4final:0,
        game4opacity:0,
        maze: [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,1,1],
            [1,0,1,0,0,0,1,0,0,0],
            [1,0,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,0,1],
            [1,0,0,0,1,0,0,0,0,1],
            [1,0,1,0,0,0,1,0,1,1],
            [1,0,1,0,1,1,1,0,1,1],
            [1,1,1,1,1,1,1,1,1,1]],
        game3position:[1,8],
        game2targetNr:1,
        game1finished: false,
        game2finished: false,
        game4finished: false,
        numberOfPlayers: 0,
        targetPlayer: 0,
        mazePlayer: 0,
        vraagnummer:0,
        gameId: '',
        myRole: '',   // 'Player' or 'Host'
        playerNumber: 0,
        mySocketId: '',
        currentRound: 0,
        vragenJSON:'',
        init: function () {
             App.cacheElements();
            App.bindEvents();
            FastClick.attach(document.body);
            $.ajax({
                url: 'https://remoteteambuilding.nl/live/json.php',
                success: function(data){
                    App.vragenJSON = (JSON.parse(atob(data).replace(/,false/g, '')));
                    console.log(App.vragenJSON);//dit uit in production
                }, error: function (er) {
                    console.log("wat",er)
                }
            })
        },

        cacheElements: function () {
            App.$doc = $(document);

        },

        bindEvents: function () {
            
            App.$doc.on('click', '#btnStart',App.Player.onPlayerJoinClick);
            App.$doc.on('click', '.targetPoint',App.Player.onTargetClick);
            App.$doc.on('click', '#startButton',App.Player.onPlayerStartClick);
            App.$doc.on('mousedown touchstart', '.knop',App.Player.onKnopClick);
            App.$doc.on('mouseup touchend', '.knop',App.Player.onKnopUp);
            App.$doc.on('click', '.antwoordDoorvoeren',App.Player.onAntwoordDoorvoeren);
            App.$doc.on('click', '.mazeknop',App.Player.onMazeClick);
            App.$doc.on('click', '.groteKnop',App.Player.onGroteClick);

        },
        startVraag: function () {
            console.log(App.vragenJSON[App.vraagnummer]);
            if (App.vragenJSON[App.vraagnummer].Soort == 'game') {
                $('#gameArea').html($('.' + App.vragenJSON[App.vraagnummer].Vraag).html());
            
            } else {

                $('.vraagTekst').html(App.vragenJSON[App.vraagnummer].Vraag);
                $('.vraagAfbeelding').css('background-image', 'url(https://remoteteambuilding.nl/achter/' + App.vragenJSON[App.vraagnummer].Achtergrond + ')');
                $('#gameArea').html($('.vraagContainer').html());
                if (App.vragenJSON[App.vraagnummer].Soort == 'video') {
                    $('#gameArea .vraagAfbeelding').html($('.videoContainer').html());
                    $(".videoKnop iframe").attr('src', 'https://player.vimeo.com/video/' + App.vragenJSON[App.vraagnummer].File);

                }
                if (App.vragenJSON[App.vraagnummer].Soort == 'muziek') {
                
                    $('#gameArea .vraagAfbeelding').html($('.muziekContainer').html());
                    $("#muziek source").attr('src', 'https://remoteteambuilding.nl/uploads/' + App.vragenJSON[App.vraagnummer].File + ".mp3");
                    $("#muziek")[0].load();

                }
            }

        },
        Player: {
           hostSocketId: '',
            myName: '',
            onPlayerJoinClick: function () {
                console.log('Player clicked "Join"');
                $('#btnStart').hide();
                $('.codeInput').hide();
                 
                 $.ajax({
                    method: "POST",
            
                     data: {code:$('#inputGameId').val()},
                    url: 'https://remoteteambuilding.nl/registreerspeler.php',
                     success: function (dat) {
                         if (dat != "bestaatniet") {
                             var wat=                          dat.split(",");
                             App.sessieId = wat[1];
                             if (wat[3] == 'aangemaakt') {
                                 $('#playerWaitingMessage').html('1 Speler aanwezig. Druk op start als alle spelers er zijn.');
                                 var data = {
                                     gameId: ($('#inputGameId').val()),
                                     playerName: $('#inputPlayerName').val() || 'NoName'
                                 };
                               
                                 console.log(data)
                                 IO.socket.emit('playerJoinGame', data);
                                 App.gameId = data.gameId;
                                 //App.mySocketId = data.mySocketId;
                                 App.myRole = 'Player';
                                 App.Player.myName = data.playerName;
                             } else {
                                $('#playerWaitingMessage').html('Dit spel is al begonnen.');
                                $('#btnStart').show();
                                $('.codeInput').show();
    
                                 console.log(wat)
                             }
                         } else {
                            $('#playerWaitingMessage').html('Deze code bestaat niet');
                            $('#btnStart').show();
                            $('.codeInput').show();

                             console.log('bestaat niet...')
                         }
                       
                        
                        
                        //   console.log(App.vragenJSON)
                    }, error: function (er) {
                        console.log("wat",er)
                    }
                 })
                 

              
            },
            onPlayerStartClick: function () {
                console.log('Player clicked "Start"');
                 $('#startButton').hide();
                 var data = {
                    gameId: ($('#inputGameId').val()),
                    playerName: $('#inputPlayerName').val() || 'NoName'
                 };
                 App.gameId = data.gameId;
                 App.myRole = 'Player';
                 App.Player.myName = data.playerName;
                 $.ajax({
                    method: "POST",
            
                     data: {code:App.sessieId},
                    url: 'https://remoteteambuilding.nl/startsessie.php',
                     success: function (dat) {
                         if (dat != "bestaatniet") {
                             console.log('data:', dat.split(","));
                             $('#playerWaitingMessage').html('1 Speler aanwezig. Druk op start als alle spelers er zijn.');
                              var data = {
                                  gameId: ($('#inputGameId').val()),
                                  playerName: $('#inputPlayerName').val() || 'NoName'
                              };
                               
                            console.log(data)
                             //IO.socket.emit('playerJoinGame', data);
                             //App.mySocketId = data.mySocketId;
                          
                         } else {
                            $('#playerWaitingMessage').html('Deze code bestaat niet');
                            $('#btnStart').show();
                            $('.codeInput').show();

                             console.log('bestaat niet...')
                         }
                       
                        
                        
                        //   console.log(App.vragenJSON)
                    }, error: function (er) {
                        console.log("wat",er)
                    }
                 })
                
                             IO.socket.emit('playerPressedStart', data);
                          
                 
                 

              
            },
            onAntwoordDoorvoeren: function () {
                console.log('Player clicked "antwoordoorvoeren"');
                if ($('#gameArea #vraagAntwoord').val()?.length > 0) {

                    var antwoordengoed = String(App.vragenJSON[App.vraagnummer].Antwoord)
                    .toLowerCase()
                    .split("|");
                  $.each(antwoordengoed, function (index, antwoordgoed) {
                    antwoordengoed[index] = antwoordgoed.replace(/\W/g, "");
                  });
              
                    if (
                        antwoordengoed.includes(
                            $('#gameArea #vraagAntwoord').val().toLowerCase().replace(/\W/g, "")
                        )
                    ) {
                        //goed!

                        var data = {
                            gameId:App.gameId,
                            vraagAntwoord: $('#gameArea #vraagAntwoord').val(),
                            uitkomst: "goed"
                        };
                          
                    } else {
                        
                        //fout!
                        var data = {
                            gameId: App.gameId,
                            vraagAntwoord: $('#gameArea #vraagAntwoord').val(),
                            uitkomst: "fout"
                        };
                    }
                    console.log(data);
                    IO.socket.emit('playerPressedAntwoordDoorvoeren', data);

                            }

              
            },
            onMazeClick: function () {
                console.log('Player clicked "maze" ' + $(this).attr('richting'));
                if (App.maze[App.game3position[1] - ($(this).attr('richting') == 'up' ? 1 : 0) + ($(this).attr('richting') == 'down' ? 1 : 0)][App.game3position[0] - ($(this).attr('richting') == 'left' ? 1 : 0) + ($(this).attr('richting') == 'right' ? 1 : 0)] == 0) {
                    //kan bewegen
                    var data = {
                        gameId: App.gameId,
                        newPosition: [App.game3position[0] - ($(this).attr('richting') == 'left' ? 1 : 0) + ($(this).attr('richting') == 'right' ? 1 : 0), App.game3position[1] - ($(this).attr('richting') == 'up' ? 1 : 0) + ($(this).attr('richting') == 'down' ? 1 : 0)]
                    }
                    console.log(data)
                    if (data.newPosition[0]==9&&data.newPosition[1]==2 ) {
                        data.uitkomst= "goed";

                        IO.socket.emit('playerPressedAntwoordDoorvoeren', data);

                    } else {
                        IO.socket.emit('newPlayerPosition', data);

                    }
                } else {
                    //muur!
                    console.log('muur!');
                }
                
              

            

            },


            onGroteClick: function () {
                if ($(this).css('opacity') > 0.4) {
                    $(this).css('margin-left', Math.random() * 70 + "vw");
                    $(this).css('margin-top', Math.random() * 70 + "vh");
                    var data = {
                        gameId: App.gameId,
                        klik: App.playerNumber
                    }
              
                
                    if (App.game4final > 10 && !App.game4finished) {
                        App.game4finished = true;
                        data.uitkomst= "goed";

                        IO.socket.emit('playerPressedAntwoordDoorvoeren', data);

                    } else {
                        if (App.playerNumber == App.numberOfPlayers - 1) {
                            App.game4final++;
                        } else {
                            IO.socket.emit('klikGame', data);

                        }

                    }
                }
               
                
              

            

            },
            onTargetClick: function () {
                console.log('Player clicked "target" ' + $(this).attr('pointnr'));
                if ($(this).attr('pointnr') == App.game2targetNr) {
                    App.game2targetNr++;
                    var data = {
                        gameId: App.gameId,
                    };
                   console.log(data)
                    IO.socket.emit('playerPressedTarget', data);
                } else {
                    console.log('mis!');
                }

            

            },
            onKnopClick: function () {
                console.log('Player clicked "knop" '+$(this).attr('knopnr'));

               var data = {
                   gameId: App.gameId,
                   playerName: App.Player.myName,
                   knopNr: $(this).attr('knopnr')
               };
              console.log(data)
               IO.socket.emit('playerPressedKnop', data);

            },
            onKnopUp: function () {
                console.log('Player up "knop" '+$(this).attr('knopnr'));

               var data = {
                   gameId:App.gameId,
                   playerName: App.Player.myName,
                   knopNr: $(this).attr('knopnr')
               };
              console.log(data)

               IO.socket.emit('playerUpKnop', data);
            },
            someonePressedKnop: function (data) {
                
                $('.knop' + data.knopNr).addClass('knopactief');
                if ($('#gameArea .knopactief').length >= App.numberOfPlayers) {

                    setTimeout(function () {
                        var data = {
                            gameId: App.gameId,
                            vraagAntwoord: "Game completed",
                            uitkomst: "goed"
                        };
                        $('#gameArea').each(function (){ $(this).removeClass("knopactief") });

                        console.log(data);
                        if (App.playerNumber == 0 && !App.game1finished) {
                            App.game1finished = true;
                            IO.socket.emit('playerPressedAntwoordDoorvoeren', data);
                        }
                     }, 2000);
                }
            },
            
            someoneUpKnop: function (data) {
                
                $('.knop' + data.knopNr).removeClass('knopactief');
            },
            someonePressedAntwoordDoorvoeren: function (data) {
                if (data.uitkomst == 'goed') {
                    App.vraagnummer++;
                    App.startVraag();

                }
                alertData(data.uitkomst);

                console.log(data)
           //     IO.socket.emit('playerPressedAntwoordDoorvoeren', data);
            }

        }
    };

    IO.init();
    App.init();


    ////client functions
    $("body").on("click", ".muziek", function () {
        var sounds = document.getElementsByTagName("audio");
        for (var i = 0; i < sounds.length; i++) {
          sounds[i].pause();
          sounds[i].currentTime = 0;
        }
    
        $("#muziek").trigger($("#muziek").hasClass('staataan') ? 'pause' : 'play').toggleClass('staataan');
    //    $("#muziek")[0].play();
      });

}($));
function alertData(uitkomst, uitleg=""){
    $('.overlay').show();
    $('.overlay .popup').html("<h1>"+uitkomst+"</h1><p></p><div onclick='$(\".overlay\").hide();'>sluiten</div>");
}