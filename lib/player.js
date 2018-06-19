'use strict';

const Game = require('./game');
const Tanq = require('./tanq');
const Bullet = require('./bullet');
const utilities = require('./utilities');

module.exports = class Player {
	constructor(socket, index)
	{
		this.id = undefined;
		this.socket = socket;
		this.pawn = new Tanq(undefined, { x: 0, y: -1 }, index);

		Game.instance().spawnActor(this.pawn);

		this.socket.on('move', (msg) => {
			console.log("Player %i moving", this.id, msg);
			// TODO check input
			this.direction = msg;
		});

		this.socket.on('fire', (msg) => {
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

			let bullet = new Bullet(Object.assign({}, this.pawn.location), direction, this.id);
			bullet.player = this;
			// console.log(bullet);
			Game.instance().spawnActor(bullet);
		});
	}

	destroy()
	{
		if (this.pawn)
		{
			Game.instance().destroyActor(this.pawn);
		}
	}

	toJSON()
	{
		return this.pawn.toJSON();
	}

	get location()
	{
		return this.pawn.location;
	}

	get direction()
	{
		return this.pawn.location;
	}

	set location(value)
	{
		// console.log("Set player (pawn) location");
		this.pawn.location = value;
	}

	set direction(value)
	{
		this.pawn.direction = value;
	}

	send(msg, data)
	{
		this.socket.emit(msg, data);
	}
};