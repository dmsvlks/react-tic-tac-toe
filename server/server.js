const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, '../dist')));

const playersOnline = new Set();
const playersInGame = new Set();

const winConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], 
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const didWin = ({ gameState, shape }) => {
  return winConditions.some(cond => cond.every(index => gameState[index] === shape));
}

const isDraw = gameState => !gameState.includes(null);

const disconnect = socket => {
  socket.leave(socket.roomName);
  playersInGame.delete(socket);
}

const cleanup = player => {
  disconnect(player);
  disconnect(player.opp);

  io.emit('playersInGame', playersInGame.size);
}

const startGame = socket => {
  socket.shape = 'X';
  socket.opp.shape = 'O';

  socket.emit('start', 'X');
  socket.opp.emit('start', 'O');

  playersInGame.add(socket);
  playersInGame.add(socket.opp);

  socket.myTurn(true);
};

io.on('connect', socket => {
  socket.myTurn = function(value) {
    this.isMyTurn = value;
    this.emit('myTurn', value);
  }

  socket.prepare = function(roomName, gameState, opp) {
    this.join(roomName);
    this.roomName = roomName;
    this.gameState = gameState;
    this.opp = opp;
  }

  playersOnline.add(socket);
  io.emit('playersOnline', playersOnline.size);
  io.emit('playersInGame', playersInGame.size);

  socket.on('play', () => {
    if (!socket.waitingToPlay && !playersInGame.has(socket)) {
      const availablePlayer = [...playersOnline].find(player => player.waitingToPlay);

      if (!availablePlayer) {
        socket.waitingToPlay = true;
        return socket.emit('noPlayers', 'Waiting for an opponent...');
      }

      availablePlayer.waitingToPlay = false;
      const opp = availablePlayer;
      const roomName = `room${socket.id}`;
      const gameState = [null, null, null, null, null, null, null, null, null];

      socket.prepare(roomName, gameState, opp);
      opp.prepare(roomName, gameState, socket);

      if (Math.round(Math.random())) {
        startGame(socket);
      } else {
        startGame(opp);
      }

      io.emit('playersInGame', playersInGame.size);
    }
  });

  socket.on('myMove', id => {
    if (playersInGame.has(socket) && socket.isMyTurn && socket.gameState[id] === null) {
      socket.gameState[id] = socket.shape;
      socket.to(socket.roomName).emit('oppMove', id, socket.shape);

      if (didWin(socket)) {
        socket.emit('result', 'Congratulations! You won!');
        socket.to(socket.roomName).emit('result', 'Ouch, you lost, try again!');
        cleanup(socket);
      } else if (isDraw(socket.gameState)) {
        io.in(socket.roomName).emit('result', `It's a draw!`);
        cleanup(socket);
      } else {
        socket.myTurn(false);
        socket.opp.myTurn(true);
      }
    }
  });

  socket.on('disconnect', () => {
    playersOnline.delete(socket);

    if (playersInGame.has(socket)) {
      playersInGame.delete(socket);
      playersInGame.delete(socket.opp);
    }

    socket.to(socket.roomName).emit('oppDisc', 'Opponent disconected');
    io.emit('playersOnline', playersOnline.size);
    io.emit('playersInGame', playersInGame.size);
  });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));

server.listen(port, () => console.log('Server started on port', port));
