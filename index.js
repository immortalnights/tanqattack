const express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const Math = require('math');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html');
});

var playerCount = 0;
var players = [];

const randomInt = function(min, max) {
	return Math.floor(Math.random() * Math.floor(max)) + min;
}

io.on('connection', function(socket) {
	console.log("A user has connected");

	var player = {
		id: ++playerCount,
		location: { x: randomInt(25, 750), y: randomInt(25, 550) },
		direction: { x: 0, y: 0 }
	};

	players.push(player);

	socket.broadcast.emit('spawn', player);
	socket.emit('players', players);
	console.log("Player %i spawned", player.id);

	socket.on('disconnect', function(socket) {
		console.log("A user has disconnected");

		let index = players.findIndex((p) => {
			return p === player;
		});

		if (-1 !== index)
		{
			io.emit('destroy', { id: player.id });
			console.log("Player %i destroyed", player.id);

			players.splice(index, 1);
		}
	});

	socket.on('input', (msg) => {
		switch (msg.key)
		{
			case 'up':
			{
				player.direction.y = msg.pressed ? -1 : 0;
				break;
			}
			case 'right':
			{
				player.direction.x = msg.pressed ? 1 : 0;
				break;
			}
			case 'down':
			{
				player.direction.y = msg.pressed ? 1 : 0;
				break;
			}
			case 'left':
			{
				player.direction.x = msg.pressed ? -1 : 0;
				break;
			}
		}
	});
});

setInterval(() => {
	if (players.length === 0)
	{
		console.log("No players...")
	}
	else
	{
		console.log("*** %i Players", players.length);
		players.forEach((p, i) => {
			console.log("Player %i; x: %i y: %i (%i, %i)", i, p.location.x, p.location.y, p.direction.x, p.direction.y);
		});
	}
}, 1000);

// app.listen(8080, () => console.log('Example app listening on port 8080!'))
http.listen(8080, function() {
	console.log("Listening on port 8080");
});
