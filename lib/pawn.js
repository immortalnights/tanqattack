'use strict';

const Actor = require('./actor');

module.exports = class Pawn extends Actor {
	constructor(location)
	{
		super(...arguments);
		this.type = 'pawn';
		console.log("Pawn", this);
	}
}