'use struct';

const express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const SAT = require('sat');
const utilities = require('./lib/utilities');
const Game = require('./lib/game');
const Actor = require('./lib/actor');
const Pawn = require('./lib/pawn');

app.use(express.static('public'));

// app.listen(8080, () => console.log('Example app listening on port 8080!'))
http.listen(8080, function() {
	console.log("Listening on port 8080");

	let singleton = utilities.instanceSingleton('tanq.game', Game, io);
	const game = singleton.instance;

	io.on('connection', (socket) => {
		console.log("Connection established");
		game.connected(socket);
	});

	game.run();
});
