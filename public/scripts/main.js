var socket = io();
$(function () {
    // VARIABLES
    var displayChat = false;
    var currentSessionId = '';
    var currentSessionName = '';
    var steps = 1;
    var hostGame = false;
    var sessionLobbies;

    // METHODS
    manageChatBoxToggle();
    manageGameViews();

    socket.on('set current user session id', function(session){
      if (currentSessionId == '' ) {
        currentSessionId = session;

        $('.currentSession').text('Current session ' + currentSessionId);
      }
    });

    /********** STEP ONE : SET PLAYER NAME **********/
    $('.playerNameForm').submit(function(e){
      e.preventDefault(); // prevents page reloading
      if ($('#playerName').val() != '') {
        socket.emit('set player name', $('#playerName').val());
      }
      return false;
    });

    socket.on('update player name', function(playerName, sessionId){
        if(currentSessionId == sessionId) {
          currentSessionName = playerName;
          steps = 2;
          manageGameViews();
  
          $('.currentSession').text('Current session ' + currentSessionName);
          $('#username').text(currentSessionName)
        }
    });

    /********** STEP 2 : GAME SETTINGS **********/
    $('#gameSettingsBtn').on('click', function() {
      if(!$('#gameSettings').is(':visible')) {
        $('#gameSettings').css('display', 'block');
      } else {
        $('#gameSettings').css('display', 'none');
      }
    });

    $('#gameSettings').submit(function(e) {
      e.preventDefault();
      socket.emit('save game configs', $('#selectNbPlayers').val(), $('#selectGridLength').val());
      $('#gameSettings').css('display', 'none');
    });

    // MANAGE VIEWS AND EMIT LAUNCHING GAME
    $('#createGame').on('click', function() {
      steps = 3;
      manageGameViews();
      socket.emit('init game');
    });

    $('#hostGame').on('click', function() {
      if (!hostGame) {
        $('#gameHosting').css('display', 'none')
        socket.emit('host game', currentSessionId);
        hostGame = true;
      }
    });
    
    socket.on('game session hosted', function(hostSessionId){
      $('#gameHosting').css('display', 'none')
      if(currentSessionId == hostSessionId && (!$('#gameHosting').is(':visible'))) {
        $('#gameHosting').css('display', 'block')
      } else {
        $('#joinGame').css('display', 'block');
      }
    });

    // CHOOSE GAME
    var gameSelected = 1;
    $('#game01').on('click', function(e) {
      e.preventDefault();
      $('#game02').css('border', 'none');
      $('#game01').css('border', '1px solid black');
      gameSelected = 1;
    });

    $('#game02').on('click', function(e) {
      e.preventDefault();
      $('#game01').css('border', 'none');
      $('#game02').css('border', '1px solid black');
      gameSelected = 2;
    });

    socket.on('display lobby', function(lobbies) {
      $('#gameHosting').css('display', 'none')
      $('#lobbyContainer').css('display', 'block');
      sessionLobbies = lobbies;
      lobbies.map((lobby) => {
        var gamebtn = $('<button>')
        .text(lobby.hostName+'\'s game')
        .addClass('btn btn-outline-dark')
        .attr('id', lobby.hostId);
        $('#globalLobby').append(gamebtn);
        document.getElementById(lobby.hostId).addEventListener('click', {
          handleEvent: function (event) {
            showLobby(lobby.hostId);
          }
        });
        $('#hostLobbyContainer').append($('<div>').attr('id', lobby.hostId).text('COUCOU '+lobby.hostName));
        if(lobby.hostId == currentSessionId) {
          $('#hostLobbyContainer').css('display', 'block');
          $('#hostLobbyContainer').find('#'+currentSessionId).css('display', 'block');
        }
      });
    });

    function showLobby(id) {
      $('#hostLobbyContainer').find('#'+id).css('display', 'block');
    }

    $('#joinGame').on('click', function(e){
      e.preventDefault();
      $('#globalLobby').css('display', 'block');
    });

    

    $('#gameSelectedBtn').on('click', function(e) {
      e.preventDefault();
      socket.emit('selected game', gameSelected, currentSessionId, currentSessionName);
    });

    // START GAME
    socket.on('start game', function() {
      $('#gameMenu').css('display', 'none');
      $('#gameView').css('display', 'block');
    });

    $('#inGameMenu').on('click', function() {
      socket.emit('quit game');
    });

    socket.on('user has quit game', function() {
      steps = 2;
      $('#message').empty();
      manageGameViews();
    });

    socket.on('hide action bar', function(){
      $('#toolbar').css('display', 'none');
    });

    socket.on('show action bar', function(){
      $('#toolbar').css('display', 'block');
    });
    /********** END STEP 2 : GAME SETTINGS **********/

    /********** CHAT **********/
    // Emit message when form submit
    $('.chatForm').submit(function(e){
        e.preventDefault(); // prevents page reloading
        if (currentSessionName != '') {
          socket.emit('chat message', currentSessionName + ' : ' + $('#m').val());
        } else {
          socket.emit('chat message', currentSessionId + ' : ' + $('#m').val());
        }
        $('#m').val('');
        return false;
    });

    // Display message
    socket.on('chat message', function(msg, color){
      if (displayChat == false) {
        $('#unreadMessages').css('display', 'block');
      }
      $('#messages').append($('<li>').text(msg).css({'background-color': color, 'color': 'white'}));
      var chatBoxHeight = $('#messages')[0].scrollHeight;
      $('#messages').scrollTop(chatBoxHeight);
    });

    // Show / Hide chatbox
    $('#toggleChat').click(function () {
      displayChat = !displayChat;
      manageChatBoxToggle();
      // window.location.replace("http://localhost:3000/game");
      // socket.emit('change template', 'game.html');
    });
    /********** END CHAT **********/

    function manageChatBoxToggle() {
      if (displayChat === true) {
        $('#unreadMessages').css('display', 'none');
        $('#liveChat').css('display', 'block');
        $('#toggleButton').text('X');
      } else {
        $('#liveChat').css('display', 'none');
        $('#toggleButton').text('O');
      }
    }

    function manageGameViews() {
      switch(steps) {
        case 1:
          $('#gameMenuStep1').css('display', 'block');
          $('#gameMenuStep2').css('display', 'none');
          $('#gameView').css('display', 'none');
          $('#gameMenu').css('display', 'block');
          break;
          
        case 2:
          $('#gameMenu').css('display', 'block');
          $('#gameMenuStep1').css('display', 'none');
          $('#gameMenuStep2').css('display', 'block');
          $('#gameView').css('display', 'none');
        break;

        case 3:
          $('#gameMenu').css('display', 'none');
          $('#gameView').css('display', 'block');
        break;
      }
    }
      
  });

  