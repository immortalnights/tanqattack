ig.module(
	'tankattack.hud'
).
requires(
	'impact.system',
	'impact.font'
).
defines(function() {
	"use strict";

	function formatNumber(value)
	{
		var str = '' + Math.floor(value);

		while (str.length < 3)
		{
			str = '0' + str;
		}

		return str;
	}

	window.Hud = ig.Class.extend({

		height: 0,

		font: new ig.Font('gfx/font_white_22.png'),

		stats: null,
		/**
		 *
		 *
		 */
		init: function(settings)
		{
			ig.merge(this, settings);

			this.stats = [
				{
					energy: '100',
					gun: '100'
				},
				{
					energy: '100',
					gun: '100'
				},
				{
					energy: '100',
					gun: '100'
				},
				{
					energy: '100',
					gun: '100'
				}
			];
		},

		update: function()
		{
			for (var playerIndex = 0; playerIndex < 4; ++playerIndex)
			{
				var playerEntity = ig.game.namedEntities['player' + playerIndex];
				if (playerEntity)
				{
					this.stats[playerIndex].energy = formatNumber(playerEntity.health);
					this.stats[playerIndex].gun    = formatNumber(playerEntity.turret.energy);
				}
				else
				{
					this.stats[playerIndex].energy = '000';
					this.stats[playerIndex].gun    = '000';
				}
			}
		},

		draw: function()
		{
			var offsetY = ig.system.height - this.height;

			ig.system.context.fillStyle = 'black';
			ig.system.context.rect(0, offsetY, ig.system.width, this.height);
			ig.system.context.fill();

			// Player 1, 3
			this.font.draw("Energy " + this.stats[0].energy + "% Gun " + this.stats[0].gun + "%", 0, offsetY);
			this.font.draw("Energy " + this.stats[2].energy + "% Gun " + this.stats[2].gun + "%", 0, offsetY+20);

			// Level
			this.font.draw(ig.game.levelNumber, 320, offsetY+10, ig.Font.ALIGN.CENTER);

			// Player 2, 4
			this.font.draw("Energy " + this.stats[1].energy + "% Gun " + this.stats[1].gun + "%", ig.system.width, offsetY, ig.Font.ALIGN.RIGHT);
			this.font.draw("Energy " + this.stats[3].energy + "% Gun " + this.stats[3].gun + "%", ig.system.width, offsetY+20, ig.Font.ALIGN.RIGHT);
		}
	});
});
