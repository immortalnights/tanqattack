'use struct';

const SAT = require('sat');
const utilities = require('./utilities');
const Actor = require('./actor');
const PowerUp = require('./powerup');


module.exports = class Game {
	constructor(io)
	{
		this.io = io;
		this.actors = [];

		this.players = [null, null, null, null];
		this.currentLevel = null;

		this.spectators = [];

		this.powerUpSpawnTimer = true;
	}

	static instance()
	{
		return utilities.singleton('tanq.game').instance;
	}

	spawnActor(actor, options)
	{
		if (typeof actor === 'function')
		{
			actor = new actor(options);
		}

		console.assert(actor instanceof Actor, "Cannot spawn object  which is not an instance of Actor");
		// console.log("Spawn", actor);

		this.actors.push(actor);
		this.io.emit('spawn', actor.toJSON());
		return actor;
	}

	destroyActor(actor, options)
	{
		// console.log("Destroy", actor);
		let index = this.actors.findIndex(function(other) { return other === actor; });

		console.assert(-1 !== index, "Failed to find actor in actor array");

		if (-1 !== index)
		{
			let actor = this.actors[index];

			this.io.emit('destroy', actor.toJSON());
			// console.log('destroy', index, actor);
			this.actors.splice(index, 1);

			if (actor.type === 'powerup')
			{
				this.powerUpSpawnTimer = true;
			}
		}
	}

	isFull()
	{
		return this.players.every(function(player) { return player !== null; });
	}

	get arena()
	{
		return {
			level: this.currentLevel.toJSON(),
			players: this.players.map((player, key) => {
				let result = null;
				if (player)
				{
					result = player.toJSON();
				}
				return result;
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
			this.join(connection);
		}

		let self = this;
		connection.on('disconnect', function(reason) {
			console.log("User diconnected");
			self.disconnected(this, reason);
		});
	}

	disconnected(socket, reason)
	{
		// remove spectator
		let spectatorsIndex = this.spectators.findIndex(function(s) {
			return s === socket;
		});

		console.log("spectatorsIndex", spectatorsIndex);
		if (-1 !== spectatorsIndex)
		{
			console.log("Spectator disconnected");
			this.spectators.splice(spectatorsIndex, 1);
		}

		let playerIndex = this.players.findIndex(function(p) {
			return p.socket === socket;
		});

		console.log("playerIndex", playerIndex);
		if (-1 !== playerIndex)
		{
			let player = this.players[playerIndex];

			console.log("A player has disconnected");
			console.log("Player %i destroyed", player.id);

			player.destroy();
			this.io.emit('left', { id: player.id });

			this.players[playerIndex] = null;

			if (this.spectators.length != 0)
			{
				let connection = this.spectators.pop();
				this.join(connection);
			}
		}
	}

	queue(connection)
	{
		console.log("Add spectator");
		connection.emit('arena', this.arena);
		this.spectators.push(connection);
		connection.emit('queued', {});
	}

	join(connection)
	{
		console.log("Add player");
		console.assert(!this.isFull(), "Game is full!");

		let index = this.players.findIndex(function(player) { return player === null; });
		if (index !== -1)
		{
			console.log("add player at", index);

			const Player = require('./player');

			let startLocation = this.currentLevel.startLocations[index];
			let player = new Player(index, connection);

			// send the arena to the new player
			player.send('arena', this.arena);
			this.players[index] = player;
			// send the joined message to the new player
			player.send('joined');
			player.spawn(startLocation);
		}
		else
		{
			console.warn("Failed to find index for new player");
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

		if (this.powerUpSpawnTimer === true)
		{
			// reset
			let duration = utilities.randomInt(1, 1);
			this.powerUpSpawnTimer = setTimeout(() => {
				let coordinants = this.currentLevel.getRandomLocation();
				this.spawnActor(PowerUp, {
					location: {
						x: coordinants.x * this.currentLevel.tileSize,
						y: (coordinants.y * this.currentLevel.tileSize) - (this.currentLevel.tileSize / 2)
					}
				});

				this.powerUpSpawnTimer = false;
			}, duration * 1000);
			console.log("Spawn power up in %i seconds", duration);
		}

		this.actors.forEach((actor) => {
			var dead = false;

			actor.update(delta);

			// destroy actor if it's dead
			if (actor.life <= 0)
			{
				pendingDestroy.push(actor);
			}
			else
			{
				if (actor.mobility !== 'static')
				{
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
						if (actor !== otherActor && otherActor.life > 0)
						{
							// console.log("***", actor.type, otherActor.type, !!actor.polygon, !!otherActor.polygon);
							if (actor.polygon && otherActor.polygon)
							{
								let response = new SAT.Response();

								if (actor.polygon instanceof SAT.Circle && otherActor.polygon instanceof SAT.Circle)
								{
									if (SAT.testCircleCircle(actor.polygon, otherActor.polygon, response))
									{
										actor.hit(otherActor, response);
									}
								}
								else if (actor.polygon instanceof SAT.Circle)
								{
									if (SAT.testCirclePolygon(actor.polygon, otherActor.polygon, response))
									{
										actor.hit(otherActor, response);
									}
								}
								else if (otherActor.polygon instanceof SAT.Circle)
								{
									if (SAT.testCirclePolygon(otherActor.polygon, actor.polygon, response))
									{
										actor.hit(otherActor, response);
									}
								}
								else if (actor.polygon instanceof SAT.Polygon && otherActor.polygon instanceof SAT.Polygon)
								{
									if (SAT.testPolygonPolygon(actor.polygon, otherActor.polygon, response))
									{
										actor.hit(otherActor, response);
									}
								}
								// if (otherActor.type === 'tanq')
								// {
								// 	// check if actor has hit a tanq
								// 	if (SAT.testCircleCircle(actor.polygon, otherActor.polygon, response))
								// 	{
								// 		actor.hit(otherActor, response);
								// 	}
								// }
								// else if (otherActor.type === 'bullet')
								// {
								// 	// check if actor has hit a bullet
								// 	if (SAT.testCircleCircle(actor.polygon, otherActor.polygon, response))
								// 	{
								// 		actor.hit(otherActor, response);
								// 	}
								// }
								// // fixme some blocks don't have polygons
								// else if (otherActor.type === 'block' && otherActor.polygon)
								// {
								// 	// moveable actor has hit a wall
								// 	if (SAT.testCirclePolygon(actor.polygon, otherActor.polygon, response))
								// 	{
								// 		actor.hit(otherActor, response);
								// 	}
								// }
							}
						}
					});
				}
			}
		});

		pendingDestroy.forEach((a) => {
			this.destroyActor(a);
		});
	}

	tick()
	{
		let lastTime = Date.now();
		setInterval(() => {
			const now = Date.now();
			let delta = (now - lastTime) / 1000;
			lastTime = now;
			this.update(delta);

			const actors = this.actors.filter((a) => { return a.type !== 'block'; });

			this.io.emit('update', {
				delta: delta,
				players: this.players.map(function(player) { return player ? player.toJSON() : null }),
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

	destroyPlayer(player)
	{
		// let playerActor = player.pawn;
		let pendingDestroy = [];
		this.actors.forEach(function(actor) {
			if (player.id === actor.owner)
			{
				pendingDestroy.push(actor);
			}
		});

		pendingDestroy.forEach((actor) => {
			this.destroyActor(actor);
		});
	}
}
