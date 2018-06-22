'use strict';

const Actor = require('./actor');

module.exports = class Pawn extends Actor {
	constructor(options)
	{
		super(options);
		this.type = 'pawn';
	}
}