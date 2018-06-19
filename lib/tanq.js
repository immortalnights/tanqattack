'use strict';

const SAT = require('sat');
const Pawn = require('./pawn');

module.exports = class Tanq extends Pawn {
	constructor(location, direction, playerIndex)
	{
		super(...arguments);
		this.type = 'tanq';
		this.lastDirection = direction;
		this.playerIndex = playerIndex;
		this.speed = 100;
		this.life = 100;
		this.mobility = 'moveable';
		this.polygon = new SAT.Circle(new SAT.Vector(this.location.x, this.location.y), 16);
	}

	toJSON()
	{
		let data = super.toJSON();
		data.index = this.playerIndex;
		// console.log("Tanq", data);
		return data;
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
			console.log('bash!', response);
			console.log("***", normal.x, this.direction.x);

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

			console.log("result", result);

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
