'use strict';

const SAT = require('sat');
const Actor = require('./actor');

module.exports = class Bullet extends Actor {
	constructor(location, direction, playerIndex)
	{
		super(...arguments);
		this.type = 'bullet';
		this.direction = direction;
		this.playerIndex = playerIndex;
		this.speed = 150;
		this.mobility = 'moveable';
		this.polygon = new SAT.Circle(new SAT.Vector(this.location.x, this.location.y), 6);
	}

	toJSON()
	{
		let data = super.toJSON();
		data.index = this.playerIndex;
		return data;
	}
}