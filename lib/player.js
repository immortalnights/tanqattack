'use strict';

const Game = require('./game');
const Tanq = require('./tanq');
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

		this.socket.on('move', this.moveTanq.bind(this));
		this.socket.on('fire', this.fireWeapon.bind(this));
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
			Game.instance().destroyPlayer(this, true);
		}
	}

	toJSON()
	{
		return {
			id: this.id,
			spawnedAt: this.spawnedAt,
			energy: this.pawn ? this.pawn.life : 0,
			gun: this.pawn ? this.pawn.energy : 0,
			kills: this.kills,
			deaths: this.deaths,
		};
	}

	moveTanq(direction)
	{
		this.pawn.direction = direction;
	}

	fireWeapon(msg)
	{
		if (this.pawn)
		{
			this.pawn.fire();
		}
	}

	send(msg, data)
	{
		this.socket.emit(msg, data);
	}
};