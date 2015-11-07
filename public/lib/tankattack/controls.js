ig.module(
	'tankattack.controls'
).
requires(
	'impact.input'
).
defines(function() {
	"use strict";

	// Move to some options/configuration
	var DefaultKeyMapping = [
		[
			{
				id: 'up',
				displayName: 'Up',
				defaultKey: ig.KEY.W,
				userKey: null,
			},
			{
				id: 'down',
				displayName: 'Down',
				defaultKey: ig.KEY.S,
				userKey: null,
			},
			{
				id: 'left',
				displayName: 'Left',
				defaultKey: ig.KEY.A,
				userKey: null,
			},
			{
				id: 'right',
				displayName: 'Right',
				defaultKey: ig.KEY.D,
				userKey: null,
			},
			{
				id: 'fire',
				displayName: 'Fire',
				defaultKey: ig.KEY.SPACE,
				userKey: null,
			}
		],
		[
			{
				id: 'up',
				displayName: 'Up',
				defaultKey: ig.KEY.NUMPAD_8,
				userKey: null,
			},
			{
				id: 'down',
				displayName: 'Down',
				defaultKey: ig.KEY.NUMPAD_5,
				userKey: null,
			},
			{
				id: 'left',
				displayName: 'Left',
				defaultKey: ig.KEY.NUMPAD_4,
				userKey: null,
			},
			{
				id: 'right',
				displayName: 'Right',
				defaultKey: ig.KEY.NUMPAD_6,
				userKey: null,
			},
			{
				id: 'fire',
				displayName: 'Fire',
				defaultKey: ig.KEY.NUMPAD_0,
				userKey: null,
			}
		]
	];

	window.Controls = ig.Class.extend({

		/**
		 *
		 *
		 */
		init: function(localPlayers)
		{
			ig.input.initKeyboard();

			// Ensure there is only one or two local players
			localPlayers = localPlayers.limit(1, 2);

			for (var playerIndex = 0; playerIndex < localPlayers; ++playerIndex)
			{
				var keyMapping = DefaultKeyMapping[playerIndex];

				for (var controlIndex = 0; controlIndex < keyMapping.length; ++controlIndex)
				{
					var control = keyMapping[controlIndex];

					var action = window.Controls.getActionFor(control.id, playerIndex);
					var key = control.userKey ? control.userKey : control.defaultKey;

					ig.input.bind(key, action);

					trace(control.displayName, action, key);
				}
			}
		}
	});

	/** @returns string representing the control action for the specified control and player ID */
	window.Controls.getActionFor = function(control, playerId)
	{
		return "p" + playerId + "_" + control;
	}

});
