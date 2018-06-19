'use strict';

const SAT = require('sat');
const Actor = require('./actor');

module.exports = class Bullet extends Actor {
	constructor(location, direction, playerIndex)
	{
		super(...arguments);
		this.type = 'bullet';
		this.direction = direction;
		this.playerIndex = playerIndex;
		this.speed = 150;
		this.mobility = 'moveable';
		this.polygon = new SAT.Circle(new SAT.Vector(this.location.x, this.location.y), 6);
	}

	toJSON()
	{
		let data = super.toJSON();
		data.index = this.playerIndex;
		return data;
	}

	hit(other, response)
	{
		switch (other.type)
		{
			case 'tank':
			{
				// inflict damage and destroy
				console.log("damage");
				other.damage(this, this.strength);
				this.destroy();
				break;
			}
			case 'block':
			{
				function round(value, step) {
					step || (step = 1.0);
					var inv = 1.0 / step;
					return Math.round(value * inv) / inv;
				}

				// reflect
				let direction = new SAT.V(this.direction.x, this.direction.y);
				console.log("bounce", this.direction, response.overlapN);
				direction.reflect(response.overlapN).reverse();
				this.direction = { x: Math.round(direction.x), y: Math.round(direction.y) };

				let location = new SAT.V(this.location.x, this.location.y);
				location.sub(response.overlapV);

				console.log("bounced", this.direction);
				break;
			}
		}
	}
}
