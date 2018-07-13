'use struct';

const SAT = require('sat');
const utilities = require('./utilities');


module.exports = class Actor {
	constructor(options)
	{
		this._location = null;
		this._direction = null;

		this.type = 'actor';
		this.location = { x: 0, y: 0 };
		this.direction = { x: 0, y: 0 };
		this.lastDirection = { x: 0, y: 0 };
		this.polygon = null;
		this.mobility = 'static';
		this.life = 1;

		Object.assign(this, options);
		// console.log("Actor", this);
	}

	static spawn(actor, options)
	{
		let Game = require('./game');
		return Game.instance().spawnActor(actor, options);
	}

	static destroy(actor, options)
	{
		let Game = require('./game');
		Game.instance().destroyActor(actor, options);
	}

	toJSON()
	{
		let data = {
			type: this.type,
			location: this.location,
			direction: !utilities.isVectorEmpty(this.direction) ? this.direction : this.lastDirection
		};

		if (process.env.NODE_DEBUG === '1')
		{
			if (this.polygon)
			{
				if (this.polygon instanceof SAT.Circle)
				{
					data.polygon = {
						type: 'circle',
						pos: this.polygon.pos,
						r: this.polygon.r
					}
				}
				else if (this.polygon instanceof SAT.Polygon)
				{
					data.polygon = {
						type: 'polygon',
						pos: this.polygon.pos,
						points: this.polygon.points
					}
				}
			}
		}

		return data;
	}

	get direction()
	{
		return this._direction;
	}

	// when the direction is set, remember the last direction
	set direction(direction)
	{
		if (this._direction)
		{
			if (this._direction.x !== direction.x || this._direction.y !== direction.y)
			{
				this.lastDirection = this._direction;
				this._direction = direction;
			}
		}
		else
		{
			this._direction = direction;
		}
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
			// console.log("move actor", this._location, this.polygon);
		}
	}

	update(delta)
	{
		if (this.mobility !== 'static')
		{
			this.move(delta);
		}
	}

	move(delta)
	{
		var newLocation = { x: this.location.x, y: this.location.y };
		if (this.direction.x !== 0)
		{
			newLocation.x = this.location.x + (this.direction.x * (this.speed * delta));
		}

		if (this.direction.y !== 0)
		{
			newLocation.y = this.location.y + (this.direction.y * (this.speed * delta));
		}

		if (this.location.x !== newLocation.x || this.location.y !== newLocation.y)
		{
			// console.log(this.direction);
			this.traceMovementTo(newLocation);
		}
	}

	traceMovementTo(destination)
	{
		// console.log("Trace from", this.location, "to", destination);
		this.location = destination;
	}

	hit(other, response)
	{
		// ignore...
	}
};
