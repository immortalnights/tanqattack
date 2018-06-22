'use strict';

const Game = require('./game');
const Tanq = require('./tanq');
const Bullet = require('./bullet');
const utilities = require('./utilities');


module.exports = class Player {
	constructor(index, socket)
	{
		this.id = index;
		this.socket = socket;
		this.pawn = null;
		this.spawnedAt = Date.now();
		this.kills = 0;
		this.deaths = 0;

		this.socket.on('move', (msg) => {
			// console.log("Player %i moving", this.id, msg);
			// TODO check input
			this.pawn.direction = msg;
		});

		this.socket.on('fire', (msg) => {
			// console.log(this.pawn.toJSON());
			let direction = {};

			if (!utilities.isVectorEmpty(this.pawn.direction))
			{
				direction.x = this.pawn.direction.x;
				direction.y = this.pawn.direction.y;
			}
			else
			{
				direction.x = this.pawn.lastDirection.x;
				direction.y = this.pawn.lastDirection.y;
			}

			Game.instance().spawnActor(Bullet, {
				location: Object.assign({}, this.pawn.location),
				direction: direction,
				player: this,
				owner: this.id
			});
		});
	}

	spawn(startLocation)
	{
		this.pawn = Game.instance().spawnActor(Tanq, {
			lastDirection: { x: 0, y: -1 },
			location: startLocation,
			owner: this.id
		});
	}

	destroy()
	{
		if (this.pawn)
		{
			Game.instance().destroyActor(this.pawn, true);
		}
	}

	toJSON()
	{
		return {
			id: this.id,
			spawnedAt: this.spawnedAt,
			kills: this.kills,
			deaths: this.deaths,
		};
	}

	send(msg, data)
	{
		this.socket.emit(msg, data);
	}
};