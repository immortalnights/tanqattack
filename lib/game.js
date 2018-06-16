'use struct';

const utilities = require('./utilities');

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
		// console.log('update');
	}

	tick()
	{
		let lastTime = Date.now();
		// let updateTimer = 5000;
		setInterval(() => {
			const now = Date.now();
			let delta = now - lastTime;
			lastTime = now;
			this.update(this.delta);

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