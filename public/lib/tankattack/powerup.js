ig.module(
	'tankattack.powerup'
).
requires(
	'impact.entity'
).
defines(function() {
	"use strict";

// Shield (4)
// Bullet split
// No bounce
// Speed
// Invisible (10)
// bullet Long life
// Slow and strong

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

		tankSfx: new ig.Sound('sfx/powerup_tank.mp3'),
		weaponSfx: new ig.Sound('sfx/powerup_weapon.mp3'),

		init: function(x, y, settings)
		{
			this.parent(x, y, settings);
			
			this.addAnim('normal', 0.1, [0] );

			this.lifeTimer = new ig.Timer(30);
		},

		applyTo: function(tank)
		{


			this.tankSfx.play();
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
});
