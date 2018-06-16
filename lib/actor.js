'use struct';

module.exports = class Actor {
	constructor(location, direction)
	{
		this.type = 'actor';
		this.location = location;
		this.direction = { x: 0, y: 0 };
		this.lastDirection = this.direction;
		this.polygon = null;
		this.mobility = 'static';
		this.life = 1;
	}

	toJSON()
	{
		return {
			type: this.type,
			location: this.location,
			direction: this.direction,
			lastDirection: this.lastDirection
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
};