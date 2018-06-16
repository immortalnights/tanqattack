'use strict';

const Pawn = require('./pawn');

module.exports = class Tanq extends Pawn {
	constructor(location, direction, playerIndex)
	{
		super(...arguments);
		this.type = 'tanq';
		this.playerIndex = playerIndex;
	}

	toJSON()
	{
		let data = super.toJSON();
		data.index = this.playerIndex;
		return data;
	}
};