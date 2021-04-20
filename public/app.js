
jQuery(function($){    
    'use strict';
    var hintKosten = 10;
    var miniKosten = 3;
    var foutKosten = 20;
    var skipKosten = 100;
    var goedOpbrengst = 150;
    var gameOpbrengst = 200;
    var timesPerSecond = 5; // how many times to fire the event per second
    var wait = false;
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
            IO.socket.on('playerPressedStart', IO.playerPressedStart);
            IO.socket.on('someonePressedHint', IO.someonePressedHint);
            IO.socket.on('someonePressedSkip', IO.someonePressedSkip);
            IO.socket.on('someoneGotItWrong', IO.someoneGotItWrong);
            IO.socket.on('playerUpKnop', IO.playerUpKnop);
            IO.socket.on('startGame', IO.startGame);
            IO.socket.on('klikGameClicked', IO.klikGameClicked);
            IO.socket.on('tussenscores', IO.tussenscores);
            IO.socket.on('someoneMovedStukje', IO.someoneMovedStukje);

            IO.socket.on('countdown', IO.countdown);
            IO.socket.on('finished', IO.finished);
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
        tussenscores: function (data) {
            console.log(data);
            var scorelijst = data.split("|---|");
            for (var j = 0; j < scorelijst.length; j++) {
              scorelijst[j] = scorelijst[j].split("|");
            }
      
            $(".tussenscores").show(400);
           
            
              $(".tussenscorestitel").html("Tussenstand voor " + App.bedrijf);
              var highinhoud =
                "<table><tr><td>#</td><td>Code</td><td>Score</td><td>Tijdverschil</td></tr>";
            
            var nummer = 0;
            $.each(scorelijst, function (index, lijst) {
              nummer++;
              //console.log(lijst[3]);
              var detijd = lijst[4];
      
              //console.log(secondsTimeSpanToHMS(detijd));
              if (nummer != scorelijst.length) {
                if (lijst[4] != undefined) {
                  highinhoud +=
                    '<tr data-tijd="' +
                    detijd +
                    '" starttijd="' +
                    lijst[2] +
                    '"><td>' +
                    nummer +
                    "</td><td>" +
                    lijst[1] +
                    "</td><td>" +
                    detijd +
                    "</td><td></td></tr>";
                }
              }
            });
            highinhoud += "</table>";
            $(".tussenscorescontent").html(highinhoud);
            var $table = $("table");
      
            var rows = $table.find("tr").get();
            rows.sort(function (a, b) {
              var keyA = parseInt($(a).attr("data-tijd"));
              var keyB = parseInt($(b).attr("data-tijd"));
              if (keyA < keyB) return 1;
              if (keyA > keyB) return -1;
              return 0;
            });
            $.each(rows, function (index, row) {
              $table.children("tbody").append(row);
            });
            $("table")
              .find("tr")
              .each(function (i) {
                if (i > 0) {
                  $(this).find("td:first-of-type").html(i);
                }
              });
            $("table")
              .find("tr")
              .each(function (i) {
                if (App.gameId == $(this).find("td:nth-of-type(2)").html()) {
                  $(this).addClass("actief");
                }
              });
            var onzetijd = $(".actief").attr("starttijd");
      
            $("table")
                .find("tr")
                .each(function (i) {
                    if (i > 0) {
                        var huntijd =
                            (parseInt(Date.parse($(".actief").attr("starttijd"))) -
                                parseInt(Date.parse($(this).attr("starttijd")))) /
                            1000;
                        if (
                            $(this).attr("starttijd") &&
                            String(Math.round(parseInt(huntijd) / 60)).toLowerCase() != "nan"
                        ) {
                            $(this)
                                .find("td:last-of-type")
                                .html(Math.round(parseInt(huntijd) / 60) + "min");
                        } else {
                            $(this).find("td:last-of-type").html("niet gestart");
                        }
                    }
                });
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
              //game6
              $(".game6container").html("");
              for (var i = 0; i < App.numberOfPlayers; i++){
                App.stukjesX[i]=Math.random()*200;
                App.stukjesY[i]=Math.random()*200;
                $(".game6container").append("<div class='stukje stukje"+(i)+"' stukjenr="+(i)+">"+(i+1)+"</div>");
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
                    $('.game2container').addClass('targetContainer');
                }
            //game3
            for (var x = 0; x < 10; x++){
                for (var y = 0; y < 10; y++) {
                    $('.game3container .maze').append("<div class='"+(App.maze[x][y]==1?'muur':'open')+"'></div>");
                }

            }
            $('.game3container .mazeplayer').css('left', App.game3position[0] * 30 + "px").css('top', App.game3position[1] * 30 + "px");
            var knopPlayer = 0;
            var richting = ['up', 'down', 'right', 'left'];
            for (var t = 0; t < 4; t++) {
                if(App.playerNumber==knopPlayer){
                    $('.game3container').append("<div class='mazeknop' richting='"+richting[t]+"'>"+richting[t]+"</div>");
                }
                knopPlayer++;
                if (knopPlayer >= App.numberOfPlayers) {
                    knopPlayer = 0;
                }
            }
               //game5
               for (var x = 0; x < 10; x++){
                for (var y = 0; y < 10; y++) {
                    $('.game5container .maze').append("<div class='"+(App.maze1[x][y]==1?'muur':'open')+"'></div>");
                }

            }
            $('.game5container .mazeplayer').css('left', App.game5position[0] * 30 + "px").css('top', App.game5position[1] * 30 + "px");
            var knopPlayer = 0;
            var richting = ['up', 'down', 'right', 'left'];
            for (var t = 0; t < 4; t++) {
                if(App.playerNumber==knopPlayer){
                    $('.game5container').append("<div class='mazeknop' richting='"+richting[t]+"'></div>");
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
            $('.extraknoppen').show();
            $('.tijdScore').show();
            App.startVraag();
          //  $('#gameArea').html($('.game1').html());
          },
          playerPressedKnop : function(data) {
            App.Player.someonePressedKnop(data);
            console.log('playerPressedKnop',data);
        },
        countdown: function (data) {
            console.log('tijd: ' + data);
            $('.tijdScore .tijd').html(data);
            $('.tijdScore .score').html(App.score);
        },
        finished: function (data) {
            confetti();
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
                App.Player.updateStatus(data);
                    IO.socket.emit('playerPressedAntwoordDoorvoeren', data);
            }
        },
        newPlayerPosition: function (data) {
            if (App.vragenJSON[App.vraagnummer].Vraag == "game5") {
                App.game5position = data.newPosition;
                $('#gameArea .mazeplayer').css('left', App.game5position[0] * 30 + "px").css('top', App.game5position[1] * 30 + "px");

            } else {
                App.game3position = data.newPosition;
                $('#gameArea .mazeplayer').css('left', App.game3position[0] * 30 + "px").css('top', App.game3position[1] * 30 + "px");

            }
            
        },
      
        playerPressedStart : function(data) {
           // App.Player.playerPressedStart(data);
            console.log('playerPressedStart',data);
        },
        someonePressedAntwoordDoorvoeren: function (data) {
            App.Player.someonePressedAntwoordDoorvoeren(data);
           console.log('someonePressedAntwoordDoorvoeren',data);
        },
        someoneMovedStukje: function (data) {
            App.Player.someoneMovedStukje(data);
           console.log('someoneMovedStukje',data);
        },
        someonePressedHint: function (data) {
            App.Player.someonePressedHint(data);
           console.log('someonePressedHint',data);
        },
        someonePressedSkip: function (data) {
            App.Player.someonePressedSkip(data);
           console.log('someonePressedSkip',data);
        },
        someoneGotItWrong: function (data) {
            console.log('someoneGotItWrong',data);

            App.Player.someoneGotItWrong(data);
        },
        playerUpKnop : function(data) {
            App.Player.someoneUpKnop(data);
            console.log('someoneUpKnop',data);
        },
        error : function(data) {
        }

    };

    var App = {
        score:0,
        huidigeMuziek: '',
        huidigeVideo:'',
        game4final:0,
        game4opacity: 0,
        stukjesX: [1000,0,0,0,0,0,0,0,0,0,0,0,0],
        stukjesY:[1000,0,0,0,0,0,0,0,0,0,0,0,0],
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
            maze1: [
                [1,1,1,1,1,1,1,1,1,1],
                [1,0,0,0,1,0,0,0,0,1],
                [1,1,1,0,1,0,1,1,0,1],
                [1,0,0,0,1,0,1,0,0,1],
                [1,0,1,1,1,0,1,0,1,1],
                [1,0,0,0,0,0,1,0,0,1],
                [1,1,1,1,1,1,1,1,0,1],
                [0,0,0,1,0,0,0,1,0,1],
                [1,1,0,0,0,1,0,0,0,1],
                [1,1,1,1,1,1,1,1,1,1]],
            game3position:[1,8],
            game5position:[1,1],
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
            App.$doc.on('click', '#hintButton',App.Player.onPlayerHintClick);
            App.$doc.on('click', '#skipButton',App.Player.onPlayerSkipClick);
            App.$doc.on('mousedown touchstart', '.knop',App.Player.onKnopClick);
            App.$doc.on('mouseup touchend', '.knop',App.Player.onKnopUp);
            App.$doc.on('click', '.antwoordDoorvoeren',App.Player.onAntwoordDoorvoeren);
            App.$doc.on('click', '.mazeknop',App.Player.onMazeClick);
            App.$doc.on('click', '.groteKnop',App.Player.onGroteClick);
            App.$doc.on('click', '.groteKnopContainer',App.Player.onGroteContainerClick);
            App.$doc.on('click', '.targetContainer', App.Player.onMisClick);

            App.$doc.on('mousemove', '.game6container', App.Player.onMouseMove);
           
        },
        startVraag: function () {
            if (!App.vragenJSON[App.vraagnummer]) {
                confetti();
                return;
            }
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
                             App.bedrijf = wat[4];
                             if (wat[3] == 'aangemaakt') {
                                 $('#playerWaitingMessage').html('1 Speler aanwezig. Druk op start als alle spelers er zijn.');
                                 var data = {
                                     gameId: ($('#inputGameId').val()),
                                     playerName: $('#inputPlayerName').val() || 'NoName'
                                 };
                               
                                 console.log(data)
                                 IO.socket.emit('playerJoinGame', data);
                                 App.gameId = data.gameId;
                                 App.totalTime = wat[7];
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
                     playerName: $('#inputPlayerName').val() || 'NoName',
                    totalTime:App.totalTime
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
                                  gameId: App.gameId,
                                  sessieId: App.sessieId,
                                  totalTime:App.totalTime
                              };
                               
                            console.log(data)
                             //IO.socket.emit('playerJoinGame', data);
                             //App.mySocketId = data.mySocketId;

                             IO.socket.emit('playerPressedStart', data);

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
            onPlayerHintClick: function () {
                console.log('Player clicked "hint"');
                 var data = {
                     gameId: (App.gameId),
                     uitkomst:"hint"

                 };
                 App.Player.updateStatus(data);

               IO.socket.emit('playerPressedHint', data);
            },
            onPlayerSkipClick: function () {
                console.log('Player clicked "skip"');
                 var data = {
                     gameId: (App.gameId),
                     vraagAntwoord: "SKIPPED",
                     uitkomst:"fout"
                 };
                App.Player.updateStatus(data);
               IO.socket.emit('playerPressedSkip', data);
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
                            uitkomst: "goed",
                            nummer:App.vraagnummer,
                        };
                          
                    } else {
                        
                        //fout!
                        var data = {
                            gameId: App.gameId,
                            vraagAntwoord: $('#gameArea #vraagAntwoord').val(),
                            uitkomst: "fout",
                            nummer:App.vraagnummer,
                        };
                    }
                    console.log(data);
                    App.Player.updateStatus(data);

                    IO.socket.emit('playerPressedAntwoordDoorvoeren', data);

                            }

              
            },
           
            onMazeClick: function () {
                if (App.vragenJSON[App.vraagnummer].Vraag == "game5") {
                    console.log('Player clicked "maze" ' + $(this).attr('richting'));
                    if (App.maze1[App.game5position[1] - ($(this).attr('richting') == 'up' ? 1 : 0) + ($(this).attr('richting') == 'down' ? 1 : 0)][App.game5position[0] - ($(this).attr('richting') == 'left' ? 1 : 0) + ($(this).attr('richting') == 'right' ? 1 : 0)] == 0) {
                        //kan bewegen
                        var data = {
                            gameId: App.gameId,
                            newPosition: [App.game5position[0] - ($(this).attr('richting') == 'left' ? 1 : 0) + ($(this).attr('richting') == 'right' ? 1 : 0), App.game5position[1] - ($(this).attr('richting') == 'up' ? 1 : 0) + ($(this).attr('richting') == 'down' ? 1 : 0)]
                        }
                        console.log(data)
                        if (data.newPosition[0] == 0 && data.newPosition[1] == 7) {
                            data.uitkomst = "goed";
                            App.Player.updateStatus(data);

                            IO.socket.emit('playerPressedAntwoordDoorvoeren', data);

                        } else {
                            IO.socket.emit('newPlayerPosition', data);

                        }
                    } else {
                        //muur!
                        var data = {
                            gameId: App.gameId,
                        }
                        IO.socket.emit('playerGotItWrong', data);

                        console.log('muur!');
                    }
                
                } else {
                    console.log('Player clicked "maze" ' + $(this).attr('richting'));
                    if (App.maze[App.game3position[1] - ($(this).attr('richting') == 'up' ? 1 : 0) + ($(this).attr('richting') == 'down' ? 1 : 0)][App.game3position[0] - ($(this).attr('richting') == 'left' ? 1 : 0) + ($(this).attr('richting') == 'right' ? 1 : 0)] == 0) {
                        //kan bewegen
                        var data = {
                            gameId: App.gameId,
                            newPosition: [App.game3position[0] - ($(this).attr('richting') == 'left' ? 1 : 0) + ($(this).attr('richting') == 'right' ? 1 : 0), App.game3position[1] - ($(this).attr('richting') == 'up' ? 1 : 0) + ($(this).attr('richting') == 'down' ? 1 : 0)]
                        }
                        console.log(data)
                        if (data.newPosition[0] == 9 && data.newPosition[1] == 2) {
                            data.uitkomst = "goed";
                            App.Player.updateStatus(data);

                            IO.socket.emit('playerPressedAntwoordDoorvoeren', data);

                        } else {
                            IO.socket.emit('newPlayerPosition', data);

                        }
                    } else {
                        //muur!
                        var data = {
                            gameId: App.gameId,
                        }
                        IO.socket.emit('playerGotItWrong', data);

                        console.log('muur!');
                    }
                
              
                }
            

            },
            onMouseMove: function (event) {
                if (!wait) {
                    // fire the event
                    var data = {
                        gameId: App.gameId,
                        player:App.playerNumber,
                        x: event.pageX,
                    y:event.pageY
                    
}
                    IO.socket.emit('stukjeMoved', data);
 
                    // stop any further events
                    wait = true;
                    // after a fraction of a second, allow events again
                    setTimeout(function () {
                        wait = false;
                    }, 1000 / timesPerSecond);
                } 
                $("#gameArea .stukje" + App.playerNumber).css("left", event.pageX + "px").css("top", event.pageY + "px");

            },
            someoneMovedStukje: function (data) {
               
                console.log('we moved', data.player);
                App.stukjesX[data.player] = data.x;
                App.stukjesY[data.player] = data.y;
                var allesgoed = true;

                for (var j = 0; j < App.numberOfPlayers; j++) {
                    if (App.playerNumber == 0) {
                        if (Math.abs(App.stukjesX[0] - App.stukjesX[j]) < 5 && Math.abs(App.stukjesY[0] - (App.stukjesY[j]-(j*100))) < 5){
                            
                        } else {
                            allesgoed = false;
                        }
                        
                    }
                    if (j!= App.playerNumber) {
                        $('#gameArea .stukje' + j).css("left", App.stukjesX[j]).css("top", App.stukjesY[j]);
                    }
                }
                if (allesgoed && App.playerNumber == 0) {
                    var data = {
                        gameId: App.gameId,
                        klik: App.playerNumber
                    }
              
                
                        data.uitkomst = "goed";
                       

                        IO.socket.emit('playerPressedAntwoordDoorvoeren', data);
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
                        data.uitkomst = "goed";
                       
                        App.Player.updateStatus(data);

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
            onGroteContainerClick: function () {
                var data = {
                    gameId: App.gameId,
                }
                console.log('wrond');
                IO.socket.emit('playerGotItWrong', data);

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
            onMisClick: function () {
                    var data = {
                        gameId: App.gameId,
                    }
                    IO.socket.emit('playerGotItWrong', data);
    
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
                            App.Player.updateStatus(data);

                            IO.socket.emit('playerPressedAntwoordDoorvoeren', data);
                        }
                     }, 2000);
                }
            },
            someoneGotItWrong: function (data) {

                App.score -= miniKosten;
                $('.score').html(App.score);
            },
            someonePressedHint: function (data) {
                App.score -= hintKosten;
                App.Player.updateStatus(data);

                alertData(App.vragenJSON[App.vraagnummer].Hint);
            },
            someonePressedSkip: function (data) {
                App.score -= skipKosten;
                App.Player.updateStatus(data);

                alertData(App.vragenJSON[App.vraagnummer].Antwoord.split("|")[0]);

                App.vraagnummer++;
                App.startVraag();

            },

            someoneUpKnop: function (data) {
                
                $('.knop' + data.knopNr).removeClass('knopactief');
            },
            someonePressedAntwoordDoorvoeren: function (data) {
                if (data.uitkomst == 'goed') {
                    if (App.vragenJSON[App.vraagnummer].Soort == 'game') {
                        App.score += gameOpbrengst;
                    } else {
                        App.score += goedOpbrengst;
                    }
                    App.vraagnummer++;
                    App.startVraag();

                } else {
                    App.score -= foutKosten;

                }
                App.Player.updateStatus(data);

                alertData(data.uitkomst);

                console.log(data)
           //     IO.socket.emit('playerPressedAntwoordDoorvoeren', data);
            },
            updateStatus: function (data) {
                $.ajax({
                    method: "POST",
            
                     data: {id:App.sessieId,status:App.vraagnummer+":"+data.uitkomst+(data.uitkomst=="fout"?"("+data.vraagAntwoord+")":""),straftijd:App.score},
                    url: 'https://remoteteambuilding.nl/updatesessie.php',
                     success: function (dat) {
                         console.log(dat);
 
                        //   console.log(App.vragenJSON)
                    }, error: function (er) {
                        console.log("wat",er)
                    }
                 })
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
