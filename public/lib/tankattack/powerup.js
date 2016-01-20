ig.module(
	'tankattack.powerup'
).
requires(
	'impact.entity'
).
defines(function() {
	"use strict";

	window.Powerup = ig.Entity.extend({
		typeName: 'Powerup',
		name: "powerup",
		zIndex: 0,
		size: { x: 30, y: 30 },
		animSheet: new ig.AnimationSheet('gfx/powerup.png', 30, 30),

		/** life timer kills the bullet when it expires */
		lifeTimer: null,

		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,

		duration: 1,

		sfx: {
			tank: new ig.Sound('sfx/powerup_tank.mp3'),
			turret: new ig.Sound('sfx/powerup_weapon.mp3'),
		},

		init: function(x, y, settings)
		{
			this.parent(x, y, settings);
			
			this.addAnim('normal', 0.1, [0] );

			this.lifeTimer = new ig.Timer(30);
		},

		applyTo: function(tank)
		{
			switch (this.powerup)
			{
				case Powerup.TYPE.SHIELD:
				{
					this.sfx.tank.play();
					break;
				}
				case Powerup.TYPE.INVISIBILITY:
				{
					this.sfx.tank.play();
					break;
				}
				case Powerup.TYPE.SPEED:
				{
					this.sfx.tank.play();
					break;
				}
				case Powerup.TYPE.BULLETSPLIT:
				{
					this.sfx.turret.play();
					break;
				}
				case Powerup.TYPE.NOBOUNCE:
				{
					this.sfx.turret.play();
					break;
				}
				case Powerup.TYPE.BULLETLIFE:
				{
					this.sfx.turret.play();
					break;
				}
			}

		},

		update: function()
		{
			this.parent();

			if (this.lifeTimer.delta() > 0)
			{
				this.kill();
			}
		},

		// collideWith: function(other, sat)
		// {
		// 	trace("Collided with powerup...");
		// }
	});
	window.Powerup.TYPE = {
		// Adds a shield
		SHIELD: 0,
		// Makes tank invisible (to other players for LAN/Internet, to all in local)
		INVISIBILITY: 1,
		// Increases tank speed
		SPEED: 2,
		// Increases bullet velocity
		BULLETSPLIT: 3,
		// Prevents bullets from bouncing
		NOBOUNCE: 4,
		// Increases bullet life
		BULLETLIFE: 5
	};
});
