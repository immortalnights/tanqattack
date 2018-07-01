'use strict';

const SAT = require('sat');
const Pawn = require('./pawn');
const Bullet = require('./bullet');
const utilities = require('./utilities');


module.exports = class Tanq extends Pawn {
	constructor(options)
	{
		super(options);
		this.type = 'tanq';
		this.speed = 10;
		this.life = 99;
		this.energy = 99;
		this.cooldown = 0;
		this.mobility = 'moveable';
		this.polygon = new SAT.Circle(new SAT.Vector(this.location.x, this.location.y), 16);
	}

	toJSON()
	{
		let data = super.toJSON();
		data.owner = this.owner;
		// console.log("Tanq", data);
		return data;
	}

	update(delta)
	{
		super.update(delta);

		if (this.energy < 99)
		{
			this.energy = Math.min(this.energy + 0.8 * delta, 99);
		}

		if (this.cooldown > 0)
		{
			this.cooldown = Math.max(this.cooldown - 0.25 * delta, 0);
		}
	}

	fire()
	{
		if (this.life < 0 && this.energy >= 9 && this.cooldown === 0)
		{
			this.cooldown = 1;
			this.energy = this.energy - 9;

			let direction = {};

			if (!utilities.isVectorEmpty(this.direction))
			{
				direction.x = this.direction.x;
				direction.y = this.direction.y;
			}
			else
			{
				direction.x = this.lastDirection.x;
				direction.y = this.lastDirection.y;
			}

			Bullet.spawn(Bullet, {
				location: Object.assign({}, this.location),
				direction: direction,
				owner: this.owner
			});
		}
	}

	takeDamage(from, amount)
	{
		this.life -= amount;
		this.lastHitBy = from;
	}

	hit(other, response)
	{
		switch (other.type)
		{
			case 'tanq':
			{
				// this tanq has collided with another tanq
				this.hitTanq(other, response);
				break;
			}
			case 'bullet':
			{
				break
			}
			case 'block':
			{
				this.hitBlock(other, response);
				break;
			}
		}
	}

	hitTanq(other, response)
	{
		// determine the direction of overlap
		let normal = response.overlapN;
		// let direction = (Math.abs(normal.x) > Math.abs(normal.y)) ? normal.x : normal.y;
		let result;

		// if the actor is moving
		if (this.direction.x !== 0 || this.direction.y !== 0)
		{
			// console.log('bash!', response);
			// console.log("***", normal.x, this.direction.x);

			// up
			if (normal.y < 0 && this.direction.y < 0)
			{
				// if the other player is trying to move in the opposite direction...
				if (other.direction.y > 0)
				{
					result = 'block';
				}
				else
				{
					// other actor is not moving this way, so push them
					result = 'pushY';
				}
			}

			// down
			if (normal.y > 0 && this.direction.y > 0)
			{
				// if the other player is trying to move in the opposite direction...
				if (other.direction.y < 0)
				{
					result = 'block';
				}
				else
				{
					// other actor is not moving this way, so push them
					result = 'pushY';
				}
			}

			// left
			if (normal.x < 0 && this.direction.x < 0)
			{
				// if the other player is trying to move in the opposite direction...
				if (other.direction.x > 0)
				{
					result = 'block';
				}
				else
				{
					// other actor is not moving this way, so push them
					result = 'pushX';
				}
			}

			// right
			if (normal.x > 0 && this.direction.x > 0)
			{
				// if the other player is trying to move in the opposite direction...
				if (other.direction.x < 0)
				{
					result = 'block';
				}
				else
				{
					// other actor is not moving this way, so push them
					result = 'pushX';
				}
			}

			// console.log("result", result);

			var otherActorLocation = other.location;
			switch (result)
			{
				case 'pushX':
				{
					otherActorLocation.x = otherActorLocation.x + response.overlapV.x;
					break;
				}
				case 'pushY':
				{
					otherActorLocation.y = otherActorLocation.y + response.overlapV.y;
					break;
				}
				case 'block':
				{
					break;
				}
			}

			other.location = otherActorLocation;
		}
	}

	hitBlock(other, response)
	{
		var actorLocation = this.location;
		// push the player back
		actorLocation.x = actorLocation.x - response.overlapV.x;
		actorLocation.y = actorLocation.y - response.overlapV.y;

		this.location = actorLocation
	}
};
