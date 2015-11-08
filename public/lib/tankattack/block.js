ig.module(
	'tankattack.block'
).
requires(
	'impact.entity'
).
defines(function() {
	"use strict";

	window.Block = ig.Entity.extend({
		typeName: 'Block',
		hitColor: '#f00',

		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,

		init: function(x, y, settings)
		{
			this.parent(x, y, {});

			// this.settings = settings;
			if (settings.polygon)
			{
				this.primitive = SATPolygonFronTiltedPolygon(this.pos.x, this.pos.y, settings.polygon);

				var mar = minimumAreaRectangle(this.primitive);

				this.pos.x = mar.x;
				this.pos.y = mar.y;

				this.size.x = mar.width;
				this.size.y = mar.height;
			}
			else if (settings.width && settings.height)
			{
				this.size.x = settings.width;
				this.size.y = settings.height;
				this.primitive = (new SAT.Box(new SAT.Vector(~~this.pos.x, ~~this.pos.y), ~~settings.width, ~~settings.height)).toPolygon();
			}

			this.primitive.offset = 0;

			trace("Block", settings.name, this.pos, this.size);
		},

		updatePrimitive: function()
		{
			// Nothing to do, primitive is static
		},

		update: function()
		{
			this.parent();
			this.primitive.color = this.defaultColor;
		},

		receiveDamage: function(damage)
		{
			// All blocks are immune
		},

		/** Change the primitive color if a collision occurs */
		collideWith: function(other, response)
		{
			this.primitive.color = this.hitColor;
		}
	});
});
