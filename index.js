const express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const SAT = require('sat');
// const Math = require('math');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html');
});

var arena = {
	w: 800,
	h: 600,
	blocks: []
};

var playerCount = 0;
var players = [];

const randomInt = function(min, max) {
	if (max === undefined)
	{
		max = min;
		min = 0;
	}

	return Math.floor(Math.random() * Math.floor(max)) + min;
}

// make some obstacles
for (var i = 0; i < 11; i++)
{
	arena.blocks.push({
		x: randomInt(50, arena.w - 50),
		y: randomInt(50, arena.h - 50),
		w: randomInt(10, 50),
		h: randomInt(10, 50),
	});
}

io.on('connection', function(socket) {
	console.log("A user has connected");

	var player = {
		id: ++playerCount,
		location: { x: randomInt(25, 750), y: randomInt(25, 550) },
		direction: { x: 0, y: 0 },
		speed: 100
	};

	players.push(player);

	socket.broadcast.emit('spawn', player);
	socket.emit('arena', {
		arena: arena,
		players: players
	});
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

	socket.on('move', (msg) => {
		// console.log("Player %i moving", player.id, msg);
		// TODO check input
		player.direction = msg;
	});
});

const update = function(delta) {
	if (players.length !== 0)
	{
		players.forEach((p, i) => {
			if (p.direction.x !== 0)
			{
				p.location.x += (p.direction.x * ((p.speed / 1000) * delta));
				if (p.location.x < 0)
				{
					p.location.x = 0;
				}
				else if (p.location.x > arena.w)
				{
					p.location.x = arena.w
				}
			}
			if (p.direction.y !== 0)
			{
				p.location.y += (p.direction.y * ((p.speed / 1000) * delta));
				if (p.location.y < 0)
				{
					p.location.y = 0;
				}
				else if (p.location.y > arena.h)
				{
					p.location.y = arena.h
				}
			}
		});

		// TODO don't recreate all the SAT objects each update...
		let actors = [];
		players.forEach((p, i) => {
			actors.push({
				poly: new SAT.Circle(new SAT.Vector(p.location.x, p.location.y), 10),
				player: true,
				parent: p
			});
		});
		arena.blocks.forEach((b, i) => {
			let box = new SAT.Box(new SAT.Vector(b.x, b.y), b.w, b.h);
			actors.push({
				poly: box.toPolygon(),
				player: false,
				parent: box
			});
		});

		// Check each player with each other player and each block
		actors.forEach((actor, index) => {
			// only check _from_ player actors
			if (actor.player)
			{
				actors.forEach((otherActor, otherIndex) => {
					if (actor !== otherActor)
					{
						let response = new SAT.Response();
						if (otherActor.player)
						{
							if (SAT.testCircleCircle(actor.poly, otherActor.poly, response))
							{
								// determine the direction of overlap
								let normal = response.overlapN;
								// let direction = (Math.abs(normal.x) > Math.abs(normal.y)) ? normal.x : normal.y;
								let result;

								// if the actor is moving
								if (actor.parent.direction.x !== 0 || actor.parent.direction.y !== 0)
								{
									console.log('bash!', response);
									console.log("***", normal.x, actor.parent.direction.x);

									// up
									if (normal.y < 0 && actor.parent.direction.y < 0)
									{
										// if the other player is trying to move in the opposite direction...
										if (otherActor.parent.direction.y > 0)
										{
											result = 'block';
										}
										else
										{
											// other actor is not moving this way, so push them
											result = 'pushY';
										}
									}

									// down
									if (normal.y > 0 && actor.parent.direction.y > 0)
									{
										// if the other player is trying to move in the opposite direction...
										if (otherActor.parent.direction.y < 0)
										{
											result = 'block';
										}
										else
										{
											// other actor is not moving this way, so push them
											result = 'pushY';
										}
									}

									// left
									if (normal.x < 0 && actor.parent.direction.x < 0)
									{
										// if the other player is trying to move in the opposite direction...
										if (otherActor.parent.direction.x > 0)
										{
											result = 'block';
										}
										else
										{
											// other actor is not moving this way, so push them
											result = 'pushX';
										}
									}

									// right
									if (normal.x > 0 && actor.parent.direction.x > 0)
									{
										// if the other player is trying to move in the opposite direction...
										if (otherActor.parent.direction.x < 0)
										{
											result = 'block';
										}
										else
										{
											// other actor is not moving this way, so push them
											result = 'pushX';
										}
									}

									console.log("result", result);

									switch (result)
									{
										case 'pushX':
										{
											otherActor.parent.location.x = otherActor.parent.location.x + response.overlapV.x;
											break;
										}
										case 'pushY':
										{
											otherActor.parent.location.y = otherActor.parent.location.y + response.overlapV.y;
											break;
										}
										case 'block':
										{
											break;
										}
									}
								}

								// bounce
								// actor.parent.location.x = actor.parent.location.x - (response.overlapV.x / 2);
								// actor.parent.location.y = actor.parent.location.y - (response.overlapV.y / 2);
								// otherActor.parent.location.x = otherActor.parent.location.x - (response.overlapV.x / 2);
								// otherActor.parent.location.y = otherActor.parent.location.y - (response.overlapV.y / 2);
							}
						}
						else if (SAT.testCirclePolygon(actor.poly, otherActor.poly, response))
						{
							// push the player back
							actor.parent.location.x = actor.parent.location.x - response.overlapV.x;
							actor.parent.location.y = actor.parent.location.y - response.overlapV.y;
						}
					}
				});
			}
		});

		io.emit('players', players);
	}
}

// game loop
let lastTime = Date.now();
let updateTimer = 5000;
setInterval(() => {
	const now = Date.now();
	let delta = now - lastTime;
	lastTime = now;
	update(delta);

	updateTimer = updateTimer - delta;
	if (updateTimer < 0)
	{
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
			updateTimer = 5000;
		}
	}
}, 16.6);


// app.listen(8080, () => console.log('Example app listening on port 8080!'))
http.listen(8080, function() {
	console.log("Listening on port 8080");
});
