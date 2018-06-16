'use strict';

const Actor = require('./actor');

module.exports = class Pawn extends Actor {
	constructor(location, direction)
	{
		super(...arguments);
		this.type = 'pawn';
	}
}