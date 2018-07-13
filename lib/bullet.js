'use strict';

const SAT = require('sat');
const Actor = require('./actor');
const PowerUp = require('./powerup');

const DEFAULT_LIFE = 4;
const DEFAULT_SPEED = 200;

module.exports = class Bullet extends Actor {
	constructor(options)
	{
		super(options);
		this.type = 'bullet';
		this.life = DEFAULT_LIFE;
		this.speed = DEFAULT_SPEED;
		this.strength = 9;
		this.mobility = 'moveable';
		this.polygon = new SAT.Circle(new SAT.Vector(this.location.x, this.location.y), 6);
		// let box = new SAT.Box(new SAT.Vector(this.location.x-6, this.location.y-6), 12, 12);
		// this.polygon = box.toPolygon();

		switch (this.bonus)
		{
			case PowerUp.BONUSES.BULLETLIFE:
			{
				this.life = DEFAULT_LIFE * 1.5;
				break;
			}
		}
	}

	toJSON()
	{
		let data = super.toJSON();
		data.owner = this.owner;
		return data;
	}

	update(delta)
	{
		super.update(delta);
		this.life -= 1 * delta;
	}

	hit(other, response)
	{
		switch (other.type)
		{
			case 'tanq':
			{
				// console.log(this, other);
				 if (this.owner === other.owner)
				{
					// target is owner, ignore
				}
				else if (other.bonus === PowerUp.BONUSES.SHIELD)
				{
					// target shielded, ignore
				}
				else
				{
					// inflict damage and destroy
					// console.log("damage", this.owner, other.owner);
					other.takeDamage(this, this.strength);
					this.life = 0;
				}
				break;
			}
			case 'block':
			{
				if (this.bonus === PowerUp.BONUSES.NOBOUNCE)
				{
					this.life = 0;
				}
				else
				{
					if (this.bonus === PowerUp.BONUSES.BULLETSPLIT)
					{
						// TODO
					}

					// console.log("before", this.location, this.direction);
					// console.log("res", response, response.overlapV);
					// reflect
					let direction = new SAT.V(this.direction.x, this.direction.y);
					direction.reflect(response.overlapN).reverse();
					this.direction = { x: Math.round(direction.x), y: Math.round(direction.y) };

					// push back to break overlap
					let location = {}
					location.x = Math.round(this.location.x + response.overlapV.x);
					location.y = Math.round(this.location.y + response.overlapV.y);
					this.location = location;
					// console.log("after", this.location, this.direction);
				}
				break;
			}
		}
	}
}
