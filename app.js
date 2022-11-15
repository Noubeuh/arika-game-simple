require('dotenv').config();
console.log(process.env);
var app = require('express')();
var express = require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'))

// var gameRoutePath = require('./app.route');
// app.use('/game', gameRoutePath);

var users = [];
var msgColors = ['#3B79BF', '#285180', '#4EA1FF', '#142840', '#4791E6'];
var gameColors = ['blue', 'purple', 'red', 'pink'];
var lobbies = [];

var gameSettings = {
  gridLength: 5,
  nbPlayers: 4
}

var mainView = 'main.html';

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/html/' + mainView);
});

io.on('connection', function(socket){
    /********* AUTH *********/
    console.log('user connected');
    if (!users.includes(socket.client.id)) {
      users.push({id: socket.client.id, name: ''});
      io.emit('set current user session id', socket.client.id);
      console.log(users);
    }

    socket.on('disconnect', function(){
      // remove current user session from users[]
      let index = users.find(user => user.id == socket.client.id);
      if(index != undefined) {
        users.splice(index.id, 1);
      }
    });

    /********* GLOBAL *********/
    socket.on('set player name', function(playerName) {
      users.map((user) => {
        if (user.id == socket.client.id) {
          return user.name = playerName;
        }
      });
      io.emit('update player name', playerName, socket.client.id);
    });

    /********* CHAT *********/
    socket.on('chat message', function(msg){
      var userEmitter = users.findIndex((user) => user.id == socket.client.id);
      if (userEmitter > msgColors.length) {
        userEmitter = 0;
      }
      io.emit('chat message', msg, msgColors[userEmitter], userEmitter);
    });

    /********* ROUTING *********/
    // Can do something when template is changing
    socket.on('change template', (tpl) => {
      // TODO: Do something when view changes
    });

    /********* GAME *********/
    socket.on('save game configs', (nbPlayers, gridLength) => {
      gameSettings.gridLength = gridLength;
      gameSettings.nbPlayers = nbPlayers;
      io.emit('update game settings', gameSettings);
    });

    socket.on('init game', function(){
      io.emit('start game');
    });

    socket.on('host game', (hostSession) => {
      io.emit('game session hosted', hostSession);
    });

    socket.on('selected game', (gameSelected, hostSessionId, hostSessionName) => {
      // gameselected 1 => teamplay game / gameselected 2 => 1v1v1v1
      if(gameSelected == 1) {
        lobbies.push(
          {
            hostId: hostSessionId,
            hostName: hostSessionName,
            gameType: gameSelected,
            group: [hostSessionId],
            maxPlayers: 2
          }
        );
        io.emit('display lobby', lobbies);
      }
      if(gameSelected == 2) {
        lobbies.push(
          {
            hostId: hostSessionId,
            hostName: hostSessionName,
            gameType: gameSelected,
            group: [hostSessionId],
            maxPlayers: 4
          }
        );
        io.emit('display lobby', lobbies);
      }
    });

    socket.on('quit game', () => {
      io.emit('user has quit game');
    });
    
    // TOOLBAR SOCKETS
    socket.on('live action', () => {
      io.emit('hide action bar');
    });

    socket.on('end live action', () => {
      io.emit('show action bar');
    });
    // END TOOLBAR SOCKETS

    // Emit each player action to everyone
    socket.on('emit action player', (action) => {
      io.emit('store action', action);
    });

});

http.listen(process.env.PORT, function(){
  console.log('listening on *:'+process.env.PORT);
});