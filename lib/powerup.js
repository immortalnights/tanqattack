'use strict';

const SAT = require('sat');
const Actor = require('./actor');
const utilities = require('./utilities');

class PowerUp extends Actor {
	constructor(options)
	{
		super(options);
		this.type = 'powerup';
		this.life = 120;
		let box = new SAT.Box(new SAT.Vector(this.location.x, this.location.y), 32, 32);
		this.polygon = box.toPolygon();

		switch (utilities.randomInt(0, 5))
		{
			case 0:
			{
				this.bonus = PowerUp.BONUSES.SHIELD;
				break;
			}
			case 1:
			{
				this.bonus = PowerUp.BONUSES.INVISIBILITY;
				break;
			}
			case 2:
			{
				this.bonus = PowerUp.BONUSES.SPEED;
				break;
			}
			case 3:
			{
				this.bonus = PowerUp.BONUSES.BULLETSPLIT;
				break;
			}
			case 4:
			{
				this.bonus = PowerUp.BONUSES.NOBOUNCE;
				break;
			}
			case 5:
			{
				this.bonus = PowerUp.BONUSES.BULLETLIFE;
				break;
			}
		}

		console.log("Spawned power up", this.location);
	}

	update(delta)
	{
		super.update(delta);
		this.life -= 1 * delta;
	}
}

PowerUp.BONUSES = {
	// Adds a shield
	SHIELD: 0,
	// Makes tank invisible
	INVISIBILITY: 1,
	// Increases tank speed
	SPEED: 2,
	// Increases bullet velocity
	BULLETSPLIT: 3,
	// Prevents bullets from bouncing
	NOBOUNCE: 4,
	// Increases bullet life
	BULLETLIFE: 5
}

module.exports = PowerUp;