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

// class Bullet
// {
// 	constructor(location, direction, index)
// 	{
// 		this.location = location;
// 		this.direction = direction;
// 		this.life = 100;
// 		this.speed = 150;
// 		this.image = index;
// 	}
// }

// var arena = {
// 	w: 640,
// 	h: 480,
// 	blocks: [],
// 	map: {
// 		tileSize: 32,
// 		rows: 15,
// 		cols: 20,
// 		data: maps[0]
// 	}
// };

// var playerCount = 0;
// var players = [];
// var bullets = [];

io.on('Xconnection', function(socket) {
	console.log("A user has connected");

	let id = playerCount++;
	console.log(id % 4);
	var player = {
		id: id,
		location: { x: startLocations[(id % 4) + 1].x, y: startLocations[(id % 4) + 1].y },
		lastDirection: { x: 0, y: -1 },
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

		// socket.removeAllListeners();
	});

	socket.on('move', (msg) => {
		// console.log("Player %i moving", player.id, msg);
		// TODO check input
		player.lastDirection = player.direction;
		player.direction = msg;
	});

	socket.on('fire', (msg) => {
		let direction = {};
		direction.x = player.direction.x || player.lastDirection.x;
		direction.y = player.direction.y || player.lastDirection.y;

		let bullet = new Bullet(Object.assign({}, player.location), direction, (player.id % 4));
		bullets.push(bullet);
	});
});

const update = function(delta) {
	if (players.length !== 0)
	{
		let move = function(o) {
			if (o.direction.x !== 0)
			{
				o.location.x += (o.direction.x * ((o.speed / 1000) * delta));
				if (o.location.x < 0)
				{
					o.location.x = 0;
				}
				else if (o.location.x > arena.w)
				{
					o.location.x = arena.w
				}
			}
			if (o.direction.y !== 0)
			{
				o.location.y += (o.direction.y * ((o.speed / 1000) * delta));
				if (o.location.y < 0)
				{
					o.location.y = 0;
				}
				else if (o.location.y > arena.h)
				{
					o.location.y = arena.h
				}
			}
		};

		players.forEach((p, i) => {
			move(p);
		});

		bullets.forEach((b) => {
			move(b);
		});

		// TODO don't recreate all the SAT objects each update...
		let actors = [];
		players.forEach((p, i) => {
			actors.push({
				poly: new SAT.Circle(new SAT.Vector(p.location.x, p.location.y), 16),
				player: true,
				parent: p
			});
		});
		bullets.forEach((b) => {
			actors.push({
				poly: new SAT.Circle(new SAT.V(b.location.x, b.location.y), 6),
				player: false,
				parent: b
			});
		})
		arena.blocks.forEach((b, i) => {
			actors.push(b);
		});

		// Check each player with each other player and each block
		actors.forEach((actor, index) => {
			// only check _from_ player actors
			if (actor.player)
			{
				actors.forEach((otherActor, otherIndex) => {
					if (actor !== otherActor)
					{
						// console.log("***", actor.poly, otherActor.poly);
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
						else if (otherActor.parent instanceof Bullet)
						{
							if (SAT.testCircleCircle(actor.poly, otherActor.poly, response))
							{
								console.log("Hit", actor.poly, otherActor.poly, response);
							}
						}
						else if (SAT.testCirclePolygon(actor.poly, otherActor, response))
						{
							// console.log("Block", actor.poly, otherActor, response);
							// push the player back
							actor.parent.location.x = actor.parent.location.x - response.overlapV.x;
							actor.parent.location.y = actor.parent.location.y - response.overlapV.y;
						}
					}
				});
			}
		});

		io.emit('players', players);
		io.emit('bullets', bullets);
	}
}


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
