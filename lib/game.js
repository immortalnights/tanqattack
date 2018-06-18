'use struct';

const SAT = require('sat');
const utilities = require('./utilities');
const Tanq = require('./tanq');
const Bullet = require('./bullet');

module.exports = class Game {
	constructor(io)
	{
		this.io = io;
		this.actors = [];

		this.players = [];
		this.currentLevel = null;

		this.spectators = [];
	}

	static instance()
	{
		return utilities.singleton('tanq.game').instance;
	}

	spawnActor(actor)
	{
		this.actors.push(actor);
	}

	destroyActor(actor)
	{
		let index = this.actors.findIndex(function(other) { return other === actor; });
		if (-1 !== index)
		{
			this.actors.splice(index, 1);
		}
	}

	isFull()
	{
		return this.players.length === 4;
	}

	get arena()
	{
		return {
			level: this.currentLevel.toJSON(),
			players: this.players.map(function(player) {
				return player.pawn.toJSON();
			})
		};
	}

	connected(connection)
	{
		if (this.isFull())
		{
			// queue new player
			this.queue(connection);
		}
		else
		{
			// join new player
			const Player = require('./player');
			this.join(new Player(connection, this.players.length));
		}

		connection.on('disconnect', (reason) => {
			console.log("User diconnected");

			// remove spectator
			let spectatorsIndex = this.spectators.findIndex((s) => {
				return s === connection;
			});

			console.log("spectatorsIndex", spectatorsIndex);
			if (-1 !== spectatorsIndex)
			{
				console.log("Spectator disconnected");
				this.spectators.splice(spectatorsIndex, 1);
			}

			let playerIndex = this.players.findIndex((p) => {
				return p.socket === connection;
			});

			console.log("playerIndex", playerIndex);
			if (-1 !== playerIndex)
			{
				let player = this.players[playerIndex];

				console.log("A player has disconnected");
				this.io.emit('destroy', { id: player.id });
				console.log("Player %i destroyed", player.id);

				this.players.splice(playerIndex, 1);

				if (this.spectators.length != 0)
				{
					let connection = this.spectators.pop();
					this.join(new Player(connection));
				}
			}
		});
	}

	queue(connection)
	{
		console.log("Add spectator");
		connection.emit('arena', this.arena);
		this.spectators.push(connection);
		connection.emit('queued', {});
	}

	join(player)
	{
		console.log("Add player");
		console.assert(!this.isFull(), "Game is full!");

		let emptyIndex = null;
		for (let index = 0; index < 4; index++)
		{
			if (!this.players[index])
			{
				emptyIndex = index;
				break;
			}
		}

		if (emptyIndex !== null)
		{
			player.id = emptyIndex;
			player.location = this.currentLevel.startLocations[emptyIndex];

			player.send('arena', this.arena);
			this.players.splice(emptyIndex, 0, player);
			player.send('joined');
			this.io.emit('spawn', player.toJSON());
		}
	}

	run()
	{
		this.loadLevel(0);
		this.tick();
	}

	loadLevel(index)
	{
		const Level = require('./level');
		this.currentLevel = new Level(index);
	}

	update(delta)
	{
		let pendingDestroy = [];
		this.actors.forEach((actor) => {
			if (actor.mobility !== 'static')
			{
				actor.move(delta);

				// destroy the actor if it's gone off screen
				if ((actor.location.x < 0) || (actor.location.x > this.currentLevel.width))
				{
					pendingDestroy.push(actor);
				}

				if ((actor.location.y < 0) || (actor.location.y > this.currentLevel.height))
				{
					pendingDestroy.push(actor);
				}

				// handle collisions
				this.actors.forEach((otherActor) => {
					if (actor !== otherActor)
					{
						// console.log("***", actor.type, otherActor.type);
						let response = new SAT.Response();
						if (otherActor.type === 'tanq')
						{
							if (SAT.testCircleCircle(actor.polygon, otherActor.polygon, response))
							{
								// determine the direction of overlap
								let normal = response.overlapN;
								// let direction = (Math.abs(normal.x) > Math.abs(normal.y)) ? normal.x : normal.y;
								let result;

								// if the actor is moving
								if (actor.direction.x !== 0 || actor.direction.y !== 0)
								{
									console.log('bash!', response);
									console.log("***", normal.x, actor.direction.x);

									// up
									if (normal.y < 0 && actor.direction.y < 0)
									{
										// if the other player is trying to move in the opposite direction...
										if (otherActor.direction.y > 0)
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
									if (normal.y > 0 && actor.direction.y > 0)
									{
										// if the other player is trying to move in the opposite direction...
										if (otherActor.direction.y < 0)
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
									if (normal.x < 0 && actor.direction.x < 0)
									{
										// if the other player is trying to move in the opposite direction...
										if (otherActor.direction.x > 0)
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
									if (normal.x > 0 && actor.direction.x > 0)
									{
										// if the other player is trying to move in the opposite direction...
										if (otherActor.direction.x < 0)
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
											otherActor.location.x = otherActor.location.x + response.overlapV.x;
											break;
										}
										case 'pushY':
										{
											otherActor.location.y = otherActor.location.y + response.overlapV.y;
											break;
										}
										case 'block':
										{
											break;
										}
									}
								}

								// bounce
								// actor.location.x = actor.location.x - (response.overlapV.x / 2);
								// actor.location.y = actor.location.y - (response.overlapV.y / 2);
								// otherActor.location.x = otherActor.location.x - (response.overlapV.x / 2);
								// otherActor.location.y = otherActor.location.y - (response.overlapV.y / 2);
							}
						}
						else if (otherActor.type === 'bullet')
						{
							if (SAT.testCircleCircle(actor.polygon, otherActor.polygon, response))
							{
								console.log("Hit", actor.polygon, otherActor.polygon, response);
							}
						}
						// fixme some blocks don't have polygons
						else if (otherActor.type === 'block' && otherActor.polygon)
						{
							// console.log(actor.polygon, otherActor.polygon);
							if (SAT.testCirclePolygon(actor.polygon, otherActor.polygon, response))
							{
								// push the player back
								actor.location.x = actor.location.x - response.overlapV.x;
								actor.location.y = actor.location.y - response.overlapV.y;
							}
						}
					}
				});
			}
		});

		pendingDestroy.forEach((a) => {
			this.destroyActor(a);
		});
	}

	tick()
	{
		let lastTime = Date.now();
		// let updateTimer = 5000;
		setInterval(() => {
			const now = Date.now();
			let delta = now - lastTime;
			lastTime = now;
			this.update(delta);

			const actors = this.actors.filter((a) => { return a.type !== 'block'; });
			this.io.emit('update', {
				objects: actors.map((a) => { return a.toJSON(); })
			});

			// this.tick();

			// updateTimer = updateTimer - delta;
			// if (updateTimer < 0)
			// {
			// 	if (players.length === 0)
			// 	{
			// 		console.log("No players...")
			// 	}
			// 	else
			// 	{
			// 		console.log("*** %i Players", players.length);
			// 		players.forEach((p, i) => {
			// 			console.log("Player %i; x: %i y: %i (%i, %i)", i, p.location.x, p.location.y, p.direction.x, p.direction.y);
			// 		});
			// 	}

			// 	updateTimer = 5000;
			// }
		}, 16.6);
	}
}