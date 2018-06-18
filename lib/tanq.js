'use strict';

const SAT = require('sat');
const Pawn = require('./pawn');

module.exports = class Tanq extends Pawn {
	constructor(location, direction, playerIndex)
	{
		super(...arguments);
		this.type = 'tanq';
		this.lastDirection = direction;
		this.playerIndex = playerIndex;
		this.speed = 100;
		this.mobility = 'moveable';
		this.polygon = new SAT.Circle(new SAT.Vector(this.location.x, this.location.y), 16);
	}

	toJSON()
	{
		let data = super.toJSON();
		data.index = this.playerIndex;
		// console.log("Tanq", data);
		return data;
	}
};