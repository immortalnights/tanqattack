'use strict';

const Actor = require('./actor');

module.exports = class Bullet extends Actor {
	constructor(location, direction, playerIndex)
	{
		super(...arguments);
		this.type = 'bullet';
		this.playerIndex = playerIndex;
	}

	toJSON()
	{
		let data = super.toJSON();
		data.index = this.playerIndex;
		return data;
	}
}