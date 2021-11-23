
jQuery(function($){    
    'use strict';
    var hintKosten = 30;
    var miniKosten = 3;
    var foutKosten = 10;
    var skipKosten = 100;
    var goedOpbrengst = 200;
    var gameOpbrengst = 200;
    var timesPerSecond = 5; // how many times to fire the event per second
    var wait = false;
    
    var IO = {

        init: function () {
            IO.socket = io.connect({
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax : 5000,
                reconnectionAttempts: Infinity
              });
         
            IO.bindEvents();
            
        },

        bindEvents: function () {
            IO.socket.on("disconnect", () => {
                console.log('VERBINDING VERBROKEN, FF NOG EEN KEER PROBEREN!');
                if (IO.socket) {
                    IO.socket.destroy();
                    delete IO.socket;
                    IO.socket = null;
                }
                IO.socket = io.connect({
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax : 5000,
                    reconnectionAttempts: Infinity
                });
                IO.bindEvents();
                var data = {
                    gameId: App.gameId,
                   
                };
                    IO.socket.emit('reconnect', data);

            });
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
            IO.socket.on('someonePressedStart', IO.someonePressedStart);
            IO.socket.on('someoneGotItWrong', IO.someoneGotItWrong);
            IO.socket.on('playerUpKnop', IO.playerUpKnop);
            IO.socket.on('startGame', IO.startGame);
            IO.socket.on('klikGameClicked', IO.klikGameClicked);
            IO.socket.on('tussenscores', IO.tussenscores);
            IO.socket.on('someoneMovedStukje', IO.someoneMovedStukje);
            IO.socket.on('puzzelgoed', IO.puzzelgoed);
            IO.socket.on('huidigevraag', IO.huidigevraag);

            IO.socket.on('countdown', IO.countdown);
            IO.socket.on('finished', IO.finished);
        },

        onConnected: function () {
            App.mySocketId = IO.socket.id;
            console.log(App.mySocketId);
        },
        playerJoinedRoom: function (data) {
            console.log('hooi', data);
            $("#join")[0].play();
            App.numberOfPlayers = data.numberOfPlayers;
            console.log('room', data.room)
            
            App.players = data.room;
            $(".players").html("");
            for (var p = 0; p < data.numberOfPlayers; p++) {
                $('.players').append("<img src='man.svg' style='height:100px; " + (p < App.playersReady ? "filter:invert(1);" : "") + "'>");
            }
            if (App.lang == 0 || App.lang == 3) {
                $('#playerWaitingMessage').html('Druk pas op start als iedereen er is.<BR><BR><em style="color:#fff">Zorg ervoor dat het aantal spelers hierboven<BR>hetzelfde is als het aantal spelers in je team!</em>');
                
            } else {
                $('#playerWaitingMessage').html('Press start when everyone is here.<BR><BR><em style="color:#fff">Make sure the number of players displayed<BR>above is the same as the number of people in your team!</em>');
            }
            },
        showStartButton: function (data) {
            $('.startButtonCont').show();
        },
        puzzelgoed: function (data) {
            App.puzzelgoed = true;

            $('.stukje').css("filter","grayscale(1)");
        },
        tussenscores: function (data) {
            console.log(data);
            var scorelijst = data.split("|---|");
            for (var j = 0; j < scorelijst.length; j++) {
                scorelijst[j] = scorelijst[j].split("|");
            }
      
            $(".tussenscores").show(400);
           
            
            $(".tussenscorestitel").html("<div class=ranking>Ranking</div>" + App.bedrijf);
            var highinhoud =
                "<table><tr><td>#</td><td>Code</td><td>Score</td><td>Time Diff</td></tr>";
            
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
                        App.score = parseInt($(this).find('td:nth-of-type(3)').html());
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
            if ( App.timeleft<1200 ) {
                $("table,.ranking").css('opacity', 0);
            }
        },
        startGame: function (data) {
            if (App.targetPlayer > -1) {
                console.log('al gestart!')
            } else {
                $("#start")[0].play();

                App.targetPlayer = data.targetPlayer;
                console.log('targetPlayer', App.targetPlayer);
                if (App.targetPlayer != App.numberOfPlayers - 1) {
                    App.mazePlayer = App.targetPlayer + 1;
                
                } else {
                    App.mazePlayer = 0;
                }
                App.playerNumber = App.players.indexOf(App.mySocketId);
                    var k = setInterval(function () {
                        $('.groteKnopContainer .progress').css("width", ((App.maxRabbit) / App.numberOfPlayers * 600) + "px");
                        if (Math.abs(App.switch) == 0) {
                            App.maxRabbit = 0;
                        }
                        App.switch = Math.abs(App.switch - 1);
                        //  console.log(App.game4opacity);
                        if (App.playerNumber > 0) {

                            if (App.game4opacity > 0) {
                                App.game4opacity = App.game4opacity - 0.2;
                            }
                            if (App.playerNumber == App.numberOfPlayers - 1 && App.game4opacity < 0.4) {
                                App.game4final = 0;
                            }
                            if (App.game7opacity > 0) {
                                App.game7opacity = App.game7opacity - 0.2;
                            }
                            if (App.playerNumber == App.numberOfPlayers - 1 && App.game7opacity < 0.4) {
                                App.game7final = 0;
                            }
                            if (App.vragenJSON[App.vraagnummer].Vraag == 'game7') {
                                $("#gameArea .groteKnop").css("opacity", App.game7opacity);

                            }
                            if (App.vragenJSON[App.vraagnummer].Vraag == 'game4') {
                                $("#gameArea .groteKnop").css("opacity", App.game4opacity);
                            }
                        }
                    }, 1000);
                    
                
               
                //alert(App.playerNumber,App.mySocketId);
                //game1
                // $(".knopContainer").html("");
                // for (var i = 0; i < App.numberOfPlayers; i++) {
                //     $(".knopContainer").append("<div class='knop knop" + (i + 1) + "' knopnr=" + (i + 1) + "></div>");
                // }
                //game6
           
                $(".game6container").html("");
                for (var i = 0; i < App.numberOfPlayers; i++) {
                    App.stukjesX[i] = Math.random() * 200;
                    App.stukjesY[i] = Math.random() * 200;
                    $(".game6container").append("<div class='stukje stukje" + (i) + "' stukjenr=" + (i) + " style='background-size:100%;background-position:0px -" + ((425 / App.numberOfPlayers) * i) + "px; width:490px; height:" + (425 / App.numberOfPlayers / 0.7) + "px;'></div>");
                }

                  //game8
           
                  $(".game8container").html("");
                  for (var i = 0; i < App.numberOfPlayers; i++) {
                      App.stukjesX[i] = Math.random() * 200;
                      App.stukjesY[i] = Math.random() * 200;
                      $(".game8container").append("<div class='stukje stukje" + (i) + "' stukjenr=" + (i) + " style='background-size:100%;background-position:0px -" + ((425 / App.numberOfPlayers) * i) + "px; width:490px; height:" + (425 / App.numberOfPlayers / 0.7) + "px;'></div>");
                  }
                //game2
                if (App.targetPlayer != App.playerNumber) {
                    var aantalHintGevers = App.numberOfPlayers - 1;
                    var hintGeverNumber = App.targetPlayer < App.playerNumber ? App.playerNumber - 1 : App.playerNumber;
                    $('.point').addClass(hintGeverNumber >= Math.floor(aantalHintGevers / 2) ? "vertiPoint" : "horiPoint");
                  //  if (hintGeverNumber == aantalHintGevers - 1 || hintGeverNumber == 0) {
                        $('.point').each(function () { $(this).html($(this).attr('pointnr')); });
                   // }
                } else {
                    $('.point').addClass('targetPoint');
                    $('.game2container').addClass('targetContainer');
                }
                //game3
                for (var x = 0; x < 10; x++) {
                    for (var y = 0; y < 10; y++) {
                        $('.game3container .maze').append("<div class='" + (App.maze[x][y] == 1 ? 'muur' : 'open') + "'></div>");
                    }

                }
                $('.game3container .mazeplayer').css('left', App.game3position[0] * 15 + "px").css('top', App.game3position[1] * 15 + "px");
                var knopPlayer = 0;
                var richting = ['up', 'down', 'right', 'left'];
                var nummerknop = 0;
                for (var t = 0; t < Math.max(App.numberOfPlayers,4); t++) {
                    if (nummerknop > 3) {
                        nummerknop = 0;
                    }
                    if (App.playerNumber == knopPlayer) {
                        $('.game3container').append("<div class='mazeknop' richting='" + richting[nummerknop] + "'>" + richting[nummerknop] + "</div>");
                    }
                    knopPlayer++;
                    nummerknop++;
                    if (knopPlayer >= App.numberOfPlayers) {
                        knopPlayer = 0;
                    }
                }
                //game5
                for (var x = 0; x < 16; x++) {
                    for (var y = 0; y < 27; y++) {
                        $('.game5container .maze').append("<div class='" + (App.maze1[x][y] == 1 ? 'muur' : 'open') + "'></div>");
                    }

                }
                $('.game5container .mazeplayer').css('left', App.game5position[0] * 15 + "px").css('top', App.game5position[1] * 15 + "px");
                var knopPlayer = 0;
                var richting = ['down', 'right', 'left', 'up'];
                var nummerknop = 0;

                for (var t = 0; t < Math.max(App.numberOfPlayers,4); t++) {
                    if (nummerknop > 3) {
                        nummerknop = 0;
                    }
                    if (App.playerNumber == knopPlayer) {
                        $('.game5container').append("<div class='mazeknop' richting='" + richting[nummerknop] + "'></div>");
                    }
                    knopPlayer++;
                    nummerknop++;

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
                //game7
                if (App.playerNumber == 0) {
                    App.game7opacity = 1;
                } else {
                    App.game7opacity = 0;
                }
                $('.extraknoppen').show();
                $('.tijdScore').show();
                $("#gameArea").html("<div class=herego>Here we go!</div>");
                var opacity = 2;
                var intro = setInterval(function () {
                    opacity -= 0.01
                    $('.herego').css('opacity', 0);

                    window.radius += 0.002 * window.innerWidth;
                    if (window.radius > window.innerWidth * 1.2) {
                        App.startVraag();
                        $('body').css('background-color', '#894894');
                        $("canvas").prependTo(".overlay");
                        $('.background canvas').remove();


                        $('.background').addClass('postIntro');
                        clearInterval(intro);
                        window.radius = window.innerHeight / 3;

                    }
                }, 10);
            }
            //  $('#gameArea').html($('.game1').html());
        },
        playerPressedKnop: function (data) {
            App.Player.someonePressedKnop(data);
            console.log('playerPressedKnop', data);
        },
        countdown: function (data) {
            App.timeleft = data;
            // console.log('tijd: ' + data);
            $('.tijdScore .tijd').html(new Date(data * 1000).toISOString().substr(11, 8));
            $('.tijdScore .score').html(App.score);
        },
        huidigevraag: function (data) {
             console.log('huidigevraag: ' + data, App.vraagnummer);
            if (data != App.vraagnummer) {
                App.vraagnummer = data;
                App.startVraag();
           }
        },
        finished: function (data) {
            $("#win")[0].play();
            $("body").append(`<style>.extraknoppen {
                position: absolute;
                left: 0px;
                top: 60px;
                width: 400px;
                padding: 60px calc(50vw - 200px);
            }
            
            
            table {width: 380px !important;}
            table *{font-size:16px !important}
            
            
            .tussenscorescontent {
                width: 100%;
                height: auto !important;
                max-height: calc(100vh - 400px);
            }
            *{
                pointer-events:none !important;
            }
            .vraagAfbeelding,input,.btnCont,.tijd{
                display:none !important;
            }
            .popup *{
                display:block !important;
                pointer-events: all !important;
            }
            .btnCont{
                margin: 0px auto !important;
            }
            `);
            $('.postIntro').css('filter', 'none').css('background-image', 'url(./lucht.svg)');

            confetti();
            $('.ranking').html("GAME OVER").css('opacity',1);
            
        },
        klikGameClicked: function (data) {
            App.maxRabbit = Math.max(App.maxRabbit, data.klik+1);

            if (App.vragenJSON[App.vraagnummer].Vraag == "game4") {

                if (data.klik == App.playerNumber - 1) {
                    App.game4opacity = 1;

                }
            }
            if (App.vragenJSON[App.vraagnummer].Vraag == "game7") {
                if (data.klik == App.playerNumber - 1) {
                    App.game7opacity = 1;

                }
            }
          },
        playerPressedTarget: function (data) {
            $("#klik1")[0].play();

            $('#gameArea .point:first-of-type').remove();
            if (App.targetPlayer == App.playerNumber && $('#gameArea .point').length < 1 && !App.game2finished) {
                App.game2finished = true;
                var data = {
                    gameId: App.gameId,
                    vraagAntwoord: "Game completed",
                    uitkomst: "goed",
                    nummer:App.vraagnummer,
                };
               // App.Player.updateStatus(data);
                    IO.socket.emit('playerPressedAntwoordDoorvoeren', data);
            }
        },
        newPlayerPosition: function (data) {
            if (App.vragenJSON[App.vraagnummer].Vraag == "game5") {
                App.game5position = data.newPosition;
                $('#gameArea .mazeplayer').css('left', App.game5position[0] * 15 + "px").css('top', App.game5position[1] * 15 + "px");

            } else {
                App.game3position = data.newPosition;
                $('#gameArea .mazeplayer').css('left', App.game3position[0] * 15 + "px").css('top', App.game3position[1] * 15 + "px");

            }
            
        },
      
        playerPressedStart : function(data) {
            // App.Player.playerPressedStart(data);
             console.log('playerPressedStart',data);
        },
        someonePressedStart : function(data) {
            // App.Player.playerPressedStart(data);
            App.playersReady=data.playersReady;
            $(".players").html("");
            for (var p = 0; p < App.numberOfPlayers; p++){
                $('.players').append("<img src='man.svg' style='height:100px; "+(p<data.playersReady?"filter:invert(1);":"")+"'>");
            }
            if (App.numberOfPlayers == App.playersReady && App.playerNumber == 0) {
                App.Player.playerPressedStart(data);

                //IO.socket.emit('playerPressedStart', data);

            }
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
            $("#fout2")[0].play();

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
        lang:0,
        timeSinceAlert:0,
        playersReady:0,
        score:0,
        huidigeMuziek: '',
        huidigeVideo:'',
        game4final:0,
        game4opacity: 0,
        game7final:0,
        game7opacity: 0,
        stukjesX: [1000,0,0,0,0,0,0,0,0,0,0,0,0],
        stukjesY: [1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        puzzelgoed: false,
         ac : new (window.AudioContext || window.webkitAudioContext),
        switch: 0,
        oscs:[],
        maze: [
            [0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,1,1,1,0,0,0],
[0,0,1,1,0,0,0,1,1,0],
[0,1,0,0,0,1,0,0,0,1],
[1,0,0,1,1,0,1,1,0,1],
[1,0,1,1,0,0,0,1,0,0],
[1,0,0,0,0,1,0,1,0,1],
[0,1,1,0,1,0,0,0,1,0],
[0,0,0,1,1,0,1,1,0,0],
[0,0,0,0,0,1,0,0,0,0]],
            maze1: 
            [[0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,1,0,1,0,1,0,0,0,1,1,1,1,1,1,0,0,0,0],
            [0,0,0,1,1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,1,0,0],
            [0,0,1,0,1,0,1,0,0,0,1,0,0,1,0,1,0,1,1,0,0,0,1,0,0,1,0],
            [0,1,0,0,0,0,1,1,1,1,0,0,1,0,0,1,0,1,0,1,1,0,1,1,1,1,1],
            [0,1,0,1,1,1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0,1,0,0,0],
            [1,0,0,0,0,0,1,0,1,1,1,0,0,1,1,0,1,0,0,1,1,0,0,0,1,0,1],
            [1,0,1,1,1,1,1,0,0,0,1,0,1,1,0,0,0,0,1,1,1,0,1,0,1,0,1],
            [1,0,0,0,0,0,1,1,1,0,1,0,0,1,0,1,1,1,0,1,1,0,1,0,1,0,1],
            [1,0,1,1,1,0,0,1,0,0,1,1,0,1,0,1,0,0,0,1,1,0,1,0,1,0,1],
            [1,0,1,0,0,0,1,1,1,0,0,0,0,1,0,0,0,1,0,1,0,0,1,0,0,0,1],
            [1,0,0,1,0,1,0,0,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,0,1,1,0],
            [0,1,1,1,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,1,0,1,0,0,0],
            [0,0,0,0,1,1,1,0,1,0,0,0,1,1,1,0,0,1,0,0,0,1,0,1,0,0,0],
            [0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1,0,1,1,1,1,1,1,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0]],
            game3position:[5,8],
            game5position:[16,14],
            game2targetNr:1,
        game1finished: false,
        game2finished: false,
        game4finished: false,
        game7finished: false,
        numberOfPlayers: 0,
        targetPlayer: -1,
        mazePlayer: 0,
        vraagnummer:0,
        gameId: '',
        myRole: '',   // 'Player' or 'Host'
        playerNumber: 0,
        mySocketId: '',
        currentRound: 0,
        maxRabbit:0,
        freqs: [130.81,138.59,146.83,155.56,164.81,174.61,185.00,196.00,207.65,220.00,233.08,246.94,261.63,277.18,293.66,311.13,329.63,349.23,369.99,392.00,415.30,440.00,466.16,493.88,523.25],

        vragenJSON:'',
        init: function () {
             App.cacheElements();
            App.bindEvents();
            FastClick.attach(document.body);
            $.ajax({
                url: 'https://remoteteambuilding.nl/live/json.php',
                success: function(data){
                    App.vragenJSON = (JSON.parse(atob(data).replace(/,false/g, '')));
                    //console.log(App.vragenJSON);//dit uit in production
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
            App.$doc.on('click', '.konijn, .konijn1',App.Player.onGroteContainerClick);
            App.$doc.on('click', '.targetContainer', App.Player.onMisClick);

            App.$doc.on('mousemove', '.game6container,.game8container', App.Player.onMouseMove);
           
        },
        startVraag: function () {
            if (!App.vragenJSON[App.vraagnummer]) {
                $('.postIntro').css('filter', 'none').css('background-image', 'url(./lucht.svg)');
                confetti();
                $('.ranking').html("GAME OVER").css('opacity',1);

                $("#win")[0].play();
                $("body").append(`<style>.extraknoppen {
                    position: absolute;
                    left: 0px;
                    top: 60px;
                    width: 400px;
                    padding: 60px calc(50vw - 200px);
                }
                
                
                table {width: 380px !important;}
                table *{font-size:16px !important}
                
                
                .tussenscorescontent {
                    width: 100%;
                    height: auto !important;
                    max-height: calc(100vh - 400px);
                }
                *{
                    pointer-events:none !important;
                }
                .vraagAfbeelding,input,.btnCont,.tijd{
                    display:none !important;
                }
                .popup *{
                    display:block !important;
                    pointer-events: all !important;
                }
                .btnCont{
                    margin: 0px auto !important;
                }
                `);
                return;
            }
            console.log(App.vragenJSON[App.vraagnummer]);
            if (App.vragenJSON[App.vraagnummer].Soort == 'game') {
                $('.live').show();
                $('#gameArea').html($('.' + App.vragenJSON[App.vraagnummer].Vraag).html());
                if (App.vragenJSON[App.vraagnummer].Vraag == 'game1') {
                    $('.progress').css('width',($('#gameArea .knopactief').length/App.numberOfPlayers)*600+'px');

                    for (var i = 0; i < App.freqs.length; i++){
                    App.oscs[i]=App.ac.createOscillator();
                        App.oscs[i].frequency.value = App.freqs[i];
                        App.oscs[i].connect(App.ac.destination);
                    }

                        
            }
                if (App.vragenJSON[App.vraagnummer].Vraag == 'game8') {
                    $('.stukje').each(function () {
                        $(this).css('background-image', "url('puzzel2.jpg')").css('filter','none');
                    });
            }
           if (App.vragenJSON[App.vraagnummer].Vraag == 'game6' ||App.vragenJSON[App.vraagnummer].Vraag == 'game8' ||App.vragenJSON[App.vraagnummer].Vraag == 'game3' ||App.vragenJSON[App.vraagnummer].Vraag == 'game5'||App.vragenJSON[App.vraagnummer].Vraag == 'game1') {
                    $('body').css('background-color', "hsl(" + Math.random() * 255 + ",70%,25%)");
        
                      $('.background').css('background-image', 'url(https://remoteteambuilding.nl/achter/' + App.vragenJSON[App.vraagnummer].Achtergrond + ')');
           }
         
                if (App.vragenJSON[App.vraagnummer].Vraag == 'game7') {
                    $('#gameArea .groteKnopContainer').css('background-image','url(lucht.svg)');
                    App.animatie = setInterval(() => { $('.konijn1').each(function () { $(this).css('left', Math.random() * 90 + "vw").css('top', Math.random() * 90 + "vh"); }); }, 1000);

                }
                if (App.vragenJSON[App.vraagnummer].Vraag == 'game4') {
                    $('#gameArea .groteKnopContainer').css('background-image','url(groen.svg)');
                    App.animatie = setInterval(() => { $('.konijn').each(function () { $(this).css('left', Math.random() * 90 + "vw").css('top', Math.random() * 90 + "vh"); }); }, 1000);
                }
                
            } else {
                $('.live').hide();

                $('body').css('background-color', "hsl(" + Math.random() * 255 + ",70%,25%)");

                $('.vraagTekst').html(App.vragenJSON[App.vraagnummer].Vraag);
                $('.vraagAfbeelding, .background').css('background-image', 'url(https://remoteteambuilding.nl/achter/' + App.vragenJSON[App.vraagnummer].Achtergrond + ')');
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
                $('.btnStartCont').hide();
                $('.codeInput').hide();
                window.code = $('#inputGameId').val().toLowerCase();
                if(window.code.substr(0,3)=="nxt"){
                    window.location="https://next.remoteteambuilding.nl";
                }
                  if(window.code.substr(0,3)=="2.0"){
                    window.location="https://live.remoteteambuilding.nl";
                }
                 if((window.code.substr(0,4)=="xmas"||window.code.substr(0,8)=="pptbxmas") && window.hoho != "ho"){
                     if(window.lang!='en'){
                         if(window.code.substr(0,4)=='pptb'){
                                          window.location="https://remoteteambuilding.nl/?hoho=ho&custom=pptb";
            
                             }else{
                         window.location="https://kerst.remoteteambuilding.nl";
                         }
                    }else{
                          if(window.code.substr(0,4)=='pptb'){
                                          window.location="https://remoteteambuilding.nl/?hoho=ho&lang=en&custom=pptb";
            
                             }else{
                        window.location="https://xmas.remoteteambuildinggame.com";
                        }
                     
                     }
                } else  if(window.code.substr(0,3)=="rtb" && window.hoho == "ho"){
                     if(window.lang!='en'){
                         window.location="https://remoteteambuilding.nl";
                    }else{
                        window.location="https://remoteteambuildinggame.com";
                     
                     }
                 }
                
                 $.ajax({
                    method: "POST",
            
                     data: {code:$('#inputGameId').val().toLowerCase()},
                    url: 'https://remoteteambuilding.nl/registreerspeler.php',
                     success: function (dat) {
                         if (dat != "bestaatniet") {
                             var wat=                          dat.split(",");
                             App.sessieId = wat[1];
                             App.bedrijf = wat[4];
                             App.lang = wat[5];
                             App.geenfinale = wat[6];

                             if (wat[3] == 'aangemaakt') {
                                 if (App.lang == 0 || App.lang == 3) {
                                    $('#playerWaitingMessage').html('Speler aangemeld, druk pas op start als iedereen er is.');

                                 } else {                                     $('#playerWaitingMessage').html('Player joined, press start when everyone is here.');


                                 }
                                     var data = {
                                     gameId: ($('#inputGameId').val().toLowerCase()),
                                     playerName: $('#inputPlayerName').val() || 'NoName'
                                 };
                               
                             //    console.log(data)
                                 IO.socket.emit('playerJoinGame', data);
                                 App.gameId = data.gameId;
                                 App.totalTime = wat[7];
                                 $('.logo img').attr('src', 'https://remoteteambuilding.nl/' + wat[2]);
                                 //App.mySocketId = data.mySocketId;
                                 App.myRole = 'Player';
                                 App.Player.myName = data.playerName;
                                 $.ajax({
                                    url: 'https://remoteteambuilding.nl/live/json.php?lang='+wat[5]+'&digi='+(App.gameId.substr(0,4).toLowerCase()=='digi'?1:0),
                                    success: function(data){
                                        App.vragenJSON = (JSON.parse(atob(data).replace(/,false/g, '')));
                                        //console.log(App.vragenJSON);//dit uit in production
                                    }, error: function (er) {
                                        console.log("wat",er)
                                    }
                                 })
                                 
                             } else {
                                 if (App.lang == 0 || App.lang == 3) {
                                     $('#playerWaitingMessage').html('Dit spel is al begonnen');
   
                                 } else {
                                     $('#playerWaitingMessage').html('This game has already started.');
                                 }
                                $('.btnStartCont').show();
                                $('.codeInput').show();
    
                                 //console.log(wat)
                             }
                         } else {
                             if (App.lang == 0 || App.lang == 3) {
                                 $('#playerWaitingMessage').html('Deze code bestaat niet.');

                             } else {
                                 $('#playerWaitingMessage').html('This code doesn\'t exist');
                             }
                            $('.btnStartCont').show();
                            $('.codeInput').show();

                             console.log('bestaat niet...')
                         }
                       
                        
                        
                        //   console.log(App.vragenJSON)
                    }, error: function (er) {
                        console.log("wat",er)
                    }
                 })
                 

              
            },
            playerPressedStart: function () {
                console.log('Player clicked "Start"');
                 $('.startButtonCont').hide();
                 var data = {
                    gameId: ($('#inputGameId').val().toLowerCase()),
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
                             //console.log('data:', dat.split(","));
                             if (App.lang == 0 || App.lang == 3) {
                                 $('#playerWaitingMessage').html('1 speler aangemeld. Druk op start als iedereen er is.');

                             } else {
                                 $('#playerWaitingMessage').html('1 Player joined, press start when everyone is here.');
                             }
                              var data = {
                                  gameId: App.gameId,
                                  sessieId: App.sessieId,
                                  totalTime:App.totalTime
                              };
                               
                            //console.log(data)
                             

                             IO.socket.emit('playersPressedStart', data);

                         } else {
                             if (App.lang == 0 || App.lang == 3) {
                                $('#playerWaitingMessage').html('Deze code bestaat niet');

                             } else {
                                 $('#playerWaitingMessage').html('This code doesn\'t exist');
                             }
                            $('.btnStartCont').show();
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
                 $('.startButtonCont').hide();
                if (App.lang == 0 || App.lang == 3) {
                    $('#playerWaitingMessage').html("Het spel start als iedereen op de startknop heeft gedrukt");

                } else {
                    $('#playerWaitingMessage').html("The game will start when everybody pressed Start");

                }
                 var data = {
                    gameId: App.gameId,
                    totalTime:App.totalTime
                 };

                             IO.socket.emit('playerPressedStart', data);

                        
                
                          
                 
                 

              
            },
            onPlayerHintClick: function () {
                console.log('Player clicked "hint"');
                 var data = {
                     gameId: (App.gameId),
                     uitkomst:"hint"

                 };
              //   App.Player.updateStatus(data);

               IO.socket.emit('playerPressedHint', data);
            },
            onPlayerSkipClick: function () {
                console.log('Player clicked "skip"');
                 var data = {
                     gameId: (App.gameId),
                     vraagAntwoord: "SKIPPED",
                     uitkomst: "fout",
                     nummer:App.vraagnummer,
                 };
            //    App.Player.updateStatus(data);
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
                    //console.log(data);
                    //App.Player.updateStatus(data);

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
                        //console.log(data)
                        if (data.newPosition[0] == 26 && data.newPosition[1] == 5) {
                            data.uitkomst = "goed";
                            data.nummer = App.vraagnummer;

                          //  App.Player.updateStatus(data);

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
                
                } else  if (App.vragenJSON[App.vraagnummer].Vraag == "game3") {
                    console.log('Player clicked "maze" ' + $(this).attr('richting'));
                    if (App.maze[App.game3position[1] - ($(this).attr('richting') == 'up' ? 1 : 0) + ($(this).attr('richting') == 'down' ? 1 : 0)][App.game3position[0] - ($(this).attr('richting') == 'left' ? 1 : 0) + ($(this).attr('richting') == 'right' ? 1 : 0)] == 0) {
                        //kan bewegen
                        var data = {
                            gameId: App.gameId,
                            newPosition: [App.game3position[0] - ($(this).attr('richting') == 'left' ? 1 : 0) + ($(this).attr('richting') == 'right' ? 1 : 0), App.game3position[1] - ($(this).attr('richting') == 'up' ? 1 : 0) + ($(this).attr('richting') == 'down' ? 1 : 0)]
                        }
                        console.log(data)
                        if (data.newPosition[0] == 9 && data.newPosition[1] == 5) {
                            data.uitkomst = "goed";
                            data.nummer = App.vraagnummer;

                           // App.Player.updateStatus(data);
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
                if (!App.puzzelgoed) {
                    if (!wait) {
                        // fire the event
                        var data = {
                            gameId: App.gameId,
                            player: App.vragenJSON[App.vraagnummer].Vraag=='game8'?(App.playerNumber==0?(App.numberOfPlayers-1):App.playerNumber-1):App.playerNumber,
                            x: event.pageX,
                            y: event.pageY
                    
                        }
                        IO.socket.emit('stukjeMoved', data);
 
                        // stop any further events
                        wait = true;
                        // after a fraction of a second, allow events again
                        setTimeout(function () {
                            wait = false;
                        }, 1000 / timesPerSecond);
                    }
                    console.log(App.vragenJSON[App.vraagnummer].Vraag == 'game8' ? (App.playerNumber == 0 ? (App.numberOfPlayers - 1) : App.playerNumber - 1) : App.playerNumber);
                    $("#gameArea .stukje" + (App.vragenJSON[App.vraagnummer].Vraag=='game8'?(App.playerNumber==0?(App.numberOfPlayers-1):App.playerNumber-1):App.playerNumber)).css("left", event.pageX + "px").css("top", event.pageY + "px");
                }
            },
            someoneMovedStukje: function (data) {
               
                console.log('we moved', data.player);
                App.stukjesX[data.player] = data.x;
                App.stukjesY[data.player] = data.y;
                var allesgoed = true;

                for (var j = 0; j < App.numberOfPlayers; j++) {
                    if (App.playerNumber == 0) {
                        if (Math.abs(App.stukjesX[0] - App.stukjesX[j]) < 5 && Math.abs(App.stukjesY[0] - (App.stukjesY[j]-(j*(0.7*$('.stukje').height())))) < 5){
                            
                        } else {
                            allesgoed = false;
                        }
                        
                    }
                    if (j!= (App.vragenJSON[App.vraagnummer].Vraag=='game8'?(App.playerNumber==0?(App.numberOfPlayers-1):App.playerNumber-1):App.playerNumber)) {
                        $('#gameArea .stukje' + j).css("left", App.stukjesX[j]).css("top", App.stukjesY[j]);
                    }
                }
                if (allesgoed && App.playerNumber == 0) {
                    var data = {
                        gameId: App.gameId,
                        klik: App.playerNumber
                    }
              
                
                        data.uitkomst = "goed";
                    

                        IO.socket.emit('puzzelgoed', data);
                    setTimeout(() => {
                        data.nummer = App.vraagnummer;

                        IO.socket.emit('playerPressedAntwoordDoorvoeren', data); 
                        App.stukjesX = [1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        App.stukjesY = [1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    }, 2000);
                        
                }
            },

            onGroteClick: function () {
                if (App.vragenJSON[App.vraagnummer].Vraag == 'game7') {
                    if ($(this).css('opacity') > 0.4) {
                        $(this).addClass('bounce');
                        $(this).css('margin-left', Math.random() * 70 + "vw");
                        $(this).css('margin-top', Math.random() * 70 + "vh");
                        var data = {
                            gameId: App.gameId,
                            klik: App.playerNumber
                        }
              
                
                        if (App.game7final > 4 && !App.game7finished &&App.playerNumber==App.numberOfPlayers-1) {
                            App.game7finished = true;                            
                            data.uitkomst = "goed";

                            clearInterval(App.animatie);
                            data.nummer = App.vraagnummer;

                          //  App.Player.updateStatus(data);

                            IO.socket.emit('playerPressedAntwoordDoorvoeren', data);

                        } else {
                            if (App.playerNumber == App.numberOfPlayers - 1) {
                                App.game7final++;
                            } else {
                                IO.socket.emit('klikGame', data);

                            }

                        }
                        setTimeout(() => {
                            $(this).removeClass('bounce');
                        }, 1000);
                    }
                } else {
                    if ($(this).css('opacity') > 0.4) {
                        $(this).addClass('bounce');
                        $(this).css('margin-left', Math.random() * 70 + "vw");
                        $(this).css('margin-top', Math.random() * 70 + "vh");
                        var data = {
                            gameId: App.gameId,
                            klik: App.playerNumber
                        }
              
                
                        if (App.game4final > 4 && !App.game4finished &&App.playerNumber==App.numberOfPlayers-1) {
                            App.game4finished = true;
                            clearInterval(App.animatie);

                            data.uitkomst = "goed";
                            data.nummer = App.vraagnummer;

                         //   App.Player.updateStatus(data);

                            IO.socket.emit('playerPressedAntwoordDoorvoeren', data);

                        } else {
                            if (App.playerNumber == App.numberOfPlayers - 1) {
                                App.game4final++;
                            } else {
                                IO.socket.emit('klikGame', data);

                            }

                        }
                        setTimeout(() => {
                            $(this).removeClass('bounce');
                        }, 1000);
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
            someoneUpKnop: function (data) {
                
                $('.knop' + data.knopNr).removeClass('knopactief');
                // for (var i = 0; i < App.oscs.length; i++){
                //     console.log('stop '+i)
                // App.oscs[i].stop();
                // }
                $('.progress').css('width',($('#gameArea .knopactief').length/App.numberOfPlayers)*600+'px');

                App.oscs[(parseInt(data.knopNr) - 1)].frequency.value = 0;


                

            },
            someonePressedKnop: function (data) {
                
                $('.knop' + data.knopNr).addClass('knopactief');
                $('.progress').css('width',($('#gameArea .knopactief').length/App.numberOfPlayers)*600+'px');
                $('.knopactief').each(function () {
                    App.oscs[(parseInt(data.knopNr) - 1)].frequency.value = App.freqs[(parseInt(data.knopNr) - 1)];

                    try {
                        
                        App.oscs[(parseInt($(this).attr("knopNr")) - 1)].start(0);
                    }catch(err){}
                });
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
                            data.nummer = App.vraagnummer;

                          //  App.Player.updateStatus(data);

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
                App.Player.alertData("hint",App.vragenJSON[App.vraagnummer].Hint);

                App.score -= hintKosten;
               App.Player.updateStatus(data);

            },
            someonePressedSkip: function (data) {
                App.Player.alertData("skip",App.vragenJSON[App.vraagnummer].Antwoord.split("|")[0],App.vragenJSON[App.vraagnummer].Correct);
                var mus = document.querySelector("#muziek");

                mus.pause();
                                        mus.currentTime = 0;
              
                if (App.vragenJSON[App.vraagnummer].Vraag == 'game1') {
                    var sounds = document.getElementsByTagName("audio");
                    for (var i = 0; i < sounds.length; i++) {
                      sounds[i].pause();
                      sounds[i].currentTime = 0;
                    }
                    for (var i = 0; i < App.oscs.length; i++) {
                        console.log('stop ' + i)
                        try {
                            App.oscs[parseInt(i)].stop();
                        } catch (err) { }

                    
                    }
                    App.oscs = null;
                    App.ac = null;
                }
                if (App.vragenJSON[App.vraagnummer].Soort != 'game') {
                    App.score -= skipKosten;
                }
                App.Player.updateStatus(data);


                App.vraagnummer = data.nummer + 1;
                
                App.startVraag();

            },

        
            someonePressedAntwoordDoorvoeren: function (data) {
                App.Player.alertData(data.uitkomst,null,data.uitkomst=='goed'?App.vragenJSON[App.vraagnummer].Correct:App.vragenJSON[App.vraagnummer].Fout);
                var sounds = document.getElementsByTagName("audio");
                var mus = document.querySelector("#muziek");

mus.pause();
                        mus.currentTime = 0;
                if (App.vragenJSON[App.vraagnummer].Vraag == 'game1') {
                    for (var i = 0; i < sounds.length; i++) {
                        sounds[i].pause();
                        sounds[i].currentTime = 0;
                      }
                    for (var i = 0; i < App.oscs.length; i++) {
                        console.log('stop ' + i)
                        try {
                            App.oscs[parseInt(i)].stop();
                        } catch (err) { }

                    
                    }
                    App.oscs = null;
                    App.ac = null;
                }

                if (data.uitkomst == 'goed') {
                    App.puzzelgoed = false;
                    if (App.vragenJSON[App.vraagnummer].Soort == 'game') {
                        App.score += gameOpbrengst;
                    } else {
                        App.score += goedOpbrengst;
                    }
                    App.vraagnummer=data.nummer+1;
                    App.startVraag();

                } else {
                    App.score -= foutKosten;

                }
                App.Player.updateStatus(data);


                console.log(data)
           //     IO.socket.emit('playerPressedAntwoordDoorvoeren', data);
            },
            updateStatus: function (data) {
                if (App.playerNumber == 0) {
                    $.ajax({
                        method: "POST",
            
                        data: { id: App.sessieId, status: App.vraagnummer + ":" + data.uitkomst + (data.uitkomst == "fout" ? "(" + data.vraagAntwoord + ")" : ""), straftijd: App.score },
                        url: 'https://remoteteambuilding.nl/updatesessieNode.php',
                        success: function (dat) {
                            console.log(dat);
 
                            //   console.log(App.vragenJSON)
                        }, error: function (er) {
                            console.log("wat", er)
                        }
                    })
                }
            },
            alertData: function (uitkomst, uitleg = "", extra = "") {
                if (App.timeSinceAlert == 0) {
                    App.timeSinceAlert = 1;
                    setTimeout(()=> {App.timeSinceAlert=0 },5000);
                
                var uitkomsttekst = "";

                if (uitkomst == 'fout') {
                    $("#fout1")[0].play();

                    uitkomsttekst = "Wrong";
                    window.filly = "#a72346";
                } else if (uitkomst == 'goed') {
                    $("#goed1")[0].play();

                    uitkomsttekst = "Correct";

                    window.filly = "#08c768";
                } else if (uitkomst == 'skip') {
                        $("#skip2")[0].play();

                    uitkomsttekst = "Skipped";

                    window.filly = "#966b90";
                    if (App.lang == 0||App.lang==3) {
                        uitleg = "Het antwoord was: " + uitleg + ".<BR>" + extra;
                    } else {
                        uitleg = "The answer was: " + uitleg + ".<BR>" + extra;
                        
                    }
                } else if (uitkomst == 'hint') {
                    $("#hint")[0].play();

                    uitkomsttekst = "Hint";

                    window.filly = "#966b90";
                
                } else {
                    window.filly = "#966b90";
            
                }
                $('.overlay').show();
                $('.overlay .popup').html("<h1>"+uitkomsttekst+"</h1><p>"+(uitkomst=='goed'?extra:(uitkomst=='fout'?extra:uitleg))+"</p><div class='contCont'><div class='btnCont'><div onclick='$(\".overlay\").hide();' class='btn' label=\"Close\"></div></div></div>");
                }
            }
        }
    };

    IO.init();
    App.init();

    $("body").on("click", ".btn", function () {
                $("#klik1")[0].play();

    });
    $('body').on('click', '.piano li:not(.knop)', function () {
        $("#fout2")[0].play();

    });
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
    $(window).bind('beforeunload', function(){
        return 'Niet de pagina verlaten als het spel nog niet afgelopen is!';
      });


}($));
