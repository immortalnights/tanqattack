'use strict';

const SAT = require('sat');
const Actor = require('./actor');
const PowerUp = require('./powerup');

const DEFAULT_LIFE = 6;
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
				if (this.owner !== other.owner)
				{
					// inflict damage and destroy
					console.log("damage", this.owner, other.owner);
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

					// reflect
					// console.log('hit', this.polygon, 'vs');
					// console.log(other.polygon);
					let direction = new SAT.V(this.direction.x, this.direction.y);
					// console.log("bounce", this.location, this.direction, response);
					direction.reflect(response.overlapN).reverse();
					this.direction = { x: Math.round(direction.x), y: Math.round(direction.y) };

					// let location = new SAT.V(this.location.x, this.location.y);
					// location.sub(response.overlapV);
					// this.location = location;

					// console.log("bounced", this.location, this.direction);
				}
				break;
			}
		}
	}
}
