;
jQuery(function($){    
    'use strict';

    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function,playerPressedKnop: Function, gameOver: Function, error: Function}}
     */
    var IO = {

        /**
         * This is called when the page is displayed. It connects the Socket.IO client
         * to the Socket.IO server
         */
        init: function () {
            IO.socket = io.connect();
            IO.bindEvents();
        },

        /**
         * While connected, Socket.IO will listen to the following events emitted
         * by the Socket.IO server, then run the appropriate function.
         */
        bindEvents: function () {
            IO.socket.on('connected', IO.onConnected);
            // IO.socket.on('newGameCreated', IO.onNewGameCreated );
            IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom);
            IO.socket.on('playerPressedKnop', IO.playerPressedKnop);
            IO.socket.on('playerUpKnop', IO.playerUpKnop);
            IO.socket.on('startGame', IO.startGame);

            // IO.socket.on('beginNewGame', IO.beginNewGame );
            // IO.socket.on('newWordData', IO.onNewWordData);
            // IO.socket.on('hostCheckAnswer', IO.hostCheckAnswer);
            // IO.socket.on('gameOver', IO.gameOver);
            // IO.socket.on('error', IO.error );
        },

        /**
         * The client is successfully connected!
         */
        onConnected: function () {
            // Cache a copy of the client's socket.IO session ID on the App
           

            
            App.mySocketId = IO.socket.id;
            console.log(App.mySocketId );
        },

        /**
         * A new game has been created and a random game ID has been generated.
         * @param data {{ gameId: int, mySocketId: * }}
         */
        // onNewGameCreated : function(data) {
        //     App.Host.gameInit(data);
        // },

        playerJoinedRoom: function (data) {
            // When a player joins a room, do the updateWaitingScreen funciton.
            // There are two versions of this function: one for the 'host' and
            // another for the 'player'.
            //
            // So on the 'host' browser window, the App.Host.updateWiatingScreen function is called.
            // And on the player's browser, App.Player.updateWaitingScreen is called.
            console.log('hooi', data);
        },
        startGame: function (data) {
            $('#gameArea').html($('.knoppen').html());
  
        },
        playerPressedKnop : function(data) {
            App.Player.someonePressedKnop(data);

            console.log('playerPressedKnop',data);
        },
        playerUpKnop : function(data) {
            App.Player.someoneUpKnop(data);

            console.log('someoneUpKnop',data);
        },
        error : function(data) {
          //  alert(data.message);
        }

    };

    var App = {

        /**
         * Keep track of the gameId, which is identical to the ID
         * of the Socket.IO Room used for the players and host to communicate
         *
         */
        gameId: '',

        /**
         * This is used to differentiate between 'Host' and 'Player' browsers.
         */
        myRole: '',   // 'Player' or 'Host'

        /**
         * The Socket.IO socket object identifier. This is unique for
         * each player and host. It is generated when the browser initially
         * connects to the server when the page loads for the first time.
         */
        mySocketId: '',

        /**
         * Identifies the current round. Starts at 0 because it corresponds
         * to the array of word data stored on the server.
         */
        currentRound: 0,

        /* *************************************
         *                Setup                *
         * *********************************** */

        /**
         * This runs when the page initially loads.
         */
        init: function () {
             App.cacheElements();
           // App.showInitScreen();
            App.bindEvents();

            // Initialize the fastclick library
            FastClick.attach(document.body);
        },

        /**
         * Create references to on-screen elements used throughout the game.
         */
        cacheElements: function () {
            App.$doc = $(document);

            // // Templates
            // App.$gameArea = $('#gameArea');
            // App.$templateIntroScreen = $('#intro-screen-template').html();
            // App.$templateNewGame = $('#create-game-template').html();
            // App.$templateJoinGame = $('#join-game-template').html();
            // App.$hostGame = $('#host-game-template').html();
        },

        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: function () {
            // Host
            // App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);

            // // Player
            //App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
            App.$doc.on('click', '#btnStart',App.Player.onPlayerStartClick);
            App.$doc.on('mousedown touchstart', '.knop',App.Player.onKnopClick);
            App.$doc.on('mouseup touchend', '.knop',App.Player.onKnopUp);
            // App.$doc.on('click', '.btnAnswer',App.Player.onPlayerAnswerClick);
            // App.$doc.on('click', '#btnPlayerRestart', App.Player.onPlayerRestart);
        },
        Player: {

            /**
             * A reference to the socket ID of the Host
             */
            hostSocketId: '',

            /**
             * The player's name entered on the 'Join' screen.
             */
            myName: '',

            /**
             * Click handler for the 'JOIN' button
             */
            // onJoinClick: function () {
            //     // console.log('Clicked "Join A Game"');

            //     // Display the Join Game HTML on the player's screen.
            //     App.$gameArea.html(App.$templateJoinGame);
            // },

            /**
             * The player entered their name and gameId (hopefully)
             * and clicked Start.
             */
             onPlayerStartClick: function () {
                console.log('Player clicked "Start"');
               $('#btnStart').hide();
               $('#playerWaitingMessage').html('Waiting until there are 3 players');
               // collect data to send to the server
               var data = {
                   gameId: ($('#inputGameId').val()),
                   playerName: $('#inputPlayerName').val() || 'anon'
               };
              console.log(data)
               // Send the gameId and playerName to the server
               IO.socket.emit('playerJoinGame', data);

               // Set the appropriate properties for the current player.
               App.gameId = data.gameId;
               App.mySocketId = data.mySocketId;
               App.myRole = 'Player';
               App.Player.myName = data.playerName;
            },
            onKnopClick: function () {
                console.log('Player clicked "knop" '+$(this).attr('knopnr'));

               var data = {
                   gameId: App.gameId,
                   playerName: App.Player.myName,
                   knopNr: $(this).attr('knopnr')
               };
              console.log(data)
               // Send the gameId and playerName to the server
                
               IO.socket.emit('playerPressedKnop', data);

               // Set the appropriate properties for the current player.
            //    App.myRole = 'Player';
            //    App.Player.myName = data.playerName;
            },
            onKnopUp: function () {
                console.log('Player up "knop" '+$(this).attr('knopnr'));

               var data = {
                   gameId:App.gameId,
                   playerName: App.Player.myName,
                   knopNr: $(this).attr('knopnr')
               };
              console.log(data)
               // Send the gameId and playerName to the server
                
               IO.socket.emit('playerUpKnop', data);

               // Set the appropriate properties for the current player.
            //    App.myRole = 'Player';
            //    App.Player.myName = data.playerName;
            },
            someonePressedKnop: function (data) {
                
                $('.knop' + data.knopNr).addClass('knopactief');
                if ($('#gameArea .knopactief').length > 2) {
                    alert('gefeliciteerd!');
                }
            },
            someoneUpKnop: function (data) {
                
                $('.knop' + data.knopNr).removeClass('knopactief');
            },

        }
        /* *************************************
         *             Game Logic              *
         * *********************************** */

        /**
         * Show the initial Anagrammatix Title Screen
         * (with Start and Join buttons)
         */
        // showInitScreen: function() {
        //     App.$gameArea.html(App.$templateIntroScreen);
        //     App.doTextFit('.title');
        // },


      

    };

    IO.init();
    App.init();

}($));
