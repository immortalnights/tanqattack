'use struct';

const SAT = require('sat');
const utilities = require('./utilities');

module.exports = class Actor {
	constructor(location)
	{
		this._location = null;
		this._direction = null;

		this.type = 'actor';
		this.location = location || { x: 0, y: 0 };;
		this.direction = { x: 0, y: 0 };
		this.lastDirection = { x: 0, y: 0 };
		this.polygon = null;
		this.mobility = 'static';
		this.life = 1;
	}

	toJSON()
	{
		return {
			type: this.type,
			location: this.location,
			direction: !utilities.isVectorEmpty(this.direction) ? this.direction : this.lastDirection
		};
	}

	get direction()
	{
		return this._direction;
	}

	// when the direction is set, remember the last direction
	set direction(value)
	{
		this.lastDirection = this._direction;
		this._direction = value;
	}

	get location()
	{
		return this._location;
	}

	// when the direction is set, remember the last direction
	set location(value)
	{
		this._location = value;
		// console.log("Set actor location", this.location)

		if (this.polygon)
		{
			this.polygon.pos.x = this.location.x;
			this.polygon.pos.y = this.location.y;
			// console.log("Set actor polygon location", this.polygon.pos)
		}
	}

	move(delta)
	{
		var newLocation = { x: this.location.x, y: this.location.y };
		if (this.direction.x !== 0)
		{
			newLocation.x = this.location.x + (this.direction.x * ((this.speed / 1000) * delta));
		}

		if (this.direction.y !== 0)
		{
			newLocation.y = this.location.y + (this.direction.y * ((this.speed / 1000) * delta));
		}

		if (this.location.x !== newLocation.x || this.location.y !== newLocation.y)
		{
			this.location = newLocation;
		}
	}
};