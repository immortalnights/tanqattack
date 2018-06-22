'use strict';

const SAT = require('sat');
const Actor = require('./actor');


module.exports = class Bullet extends Actor {
	constructor(options)
	{
		super(options);
		this.type = 'bullet';
		this.speed = 150;
		this.mobility = 'moveable';
		// this.polygon = new SAT.Circle(new SAT.Vector(this.location.x, this.location.y), 6);
		let box = new SAT.Box(new SAT.Vector(this.location.x-6, this.location.y-6), 12, 12);
		this.polygon = box.toPolygon();
	}

	toJSON()
	{
		let data = super.toJSON();
		data.owner = this.owner;
		return data;
	}

	hit(other, response)
	{
		switch (other.type)
		{
			case 'tanq':
			{
				console.log(this, other)
				if (this.owner !== other.owner)
				{
					// inflict damage and destroy
					console.log("damage");
					// other.damage(this, this.strength);

					Actor.spawn(Actor, {
						type: 'explosion',
						location: this.location,
						life: -1
					});
					Actor.destroy(this);
				}
				break;
			}
			case 'block':
			{
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
				break;
			}
		}
	}
}
