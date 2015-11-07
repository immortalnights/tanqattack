ig.module(
	'tankattack.game'
).
requires(
	'impact.game',
	'impact.input',
	'tankattack.controls',
	'tankattack.hud',
	'tankattack.satentity',
	'tankattack.tank',
	'tankattack.block',
	'tankattack.tiledtoimpact'
).
defines(function() {
	"use strict";

	
	window.TankAttack = ig.Game.extend({
		clearColor: '#fff',

		levelNumber: '01',

		socket: null,
		controls: null,

		configuration: {
			drawEnitityPosition: false,
			drawBoundingBoxes: false,
			drawPrimitives: false
		},

		startPositions: [
			{x: 64, y: 64},
			{x: 545, y: 385},
			{x: 64, y: 385},
			{x: 545, y: 64}
		],

		init: function()
		{
			xhr('lib/tankattack/levels/level1.json').get(this.onLevelLoaded.bind(this));
			
			this.controls = new Controls(2),
			this.hud = new Hud({ height: 46 });

			ig.input.bind(ig.KEY.MOUSE1, 'mouse1');

			// var bg = new ig.BackgroundMap( 16, data, 'media/tileset.png' );
			var io = io || null;

			// connect to the server
			if (io)
			{
				this.socket = io();

				// tie the socket events
				this.socket.on('connect', this.onConnect.bind(this));
				this.socket.on('disconnect', this.onDisconnect.bind(this));
				this.socket.on('error', this.onError.bind(this));

				this.socket.on('player connected', this.onPlayerConnected.bind(this));
				this.socket.on('player disconnected', this.onPlayerDisconnected.bind(this));

				this.socket.on('update', this.onUpdate.bind(this));
			}
		},

		getConfigutation: function(key)
		{
			return (this.configuration && this.configuration[key]) ? this.configuration[key] : undefined;
		},

		onLevelLoaded: function(status, tiledLevel)
		{
			if (status === 200 || status === 304)
			{
				var converter = new TiledToImpact();
				var level = converter.convert(tiledLevel);
				ig.game.loadLevel(level);

				var playerCount = 4;
				for (var playerIndex = 0; playerIndex < playerCount; ++playerIndex)
				{
					var startPosition = this.startPositions[playerIndex];

					var settings = {
						playerId: playerIndex
					};

					this.spawnEntity(Tank, startPosition.x, startPosition.y, settings);
				}
			}
			else
			{
				console.error("Failed to load level");
			}
		},

		// socket IO events
		onConnect: function(a, b, c)
		{
			console.log("Received 'connect'", a, b, c);
		},

		onDisconnect: function()
		{

		},

		onError: function(a,b, c)
		{
			console.log("Received 'error'", a, b, c);
		},

		onPlayerConnected: function(data)
		{
			console.log("Received 'player connected'", data);

			for (var index = 0, length = data.length; index < length; ++index)
			{
				this.spawnEntity(Tank, 0, 0, data[index]);
			}
		},
		
		onPlayerDisconnected: function(data)
		{
			console.log("Received 'player disconnected'", data);

			for (var index = 0, length = this.entities.length; index < length; ++index)
			{
				var tank = this.entities[index];

				if (tank.name === data.name)
				{
					// TODO explode!
					tank.kill();
				}
			}
		},

		onUpdate: function(data)
		{
			// console.log('onUpdate', data);

			for (var player_index = 0, total_players = data.players.length; player_index < total_players; ++player_index)
			{
				var player = data.players[player_index];

				// find the tank for the player
				var ok = false;
				for (var index = 0, length = this.entities.length; index < length; ++index)
				{
					var tank = this.entities[index];

					if (tank.name == player.name)
					{
						tank.vel = player.tank.vel;

						ok = true;
						// console.log("Update", tank.name, tank.vel, player.tank.vel);
					}
				}

				if (ok == false)
				{
					console.log("Failed to find tank for player", player.name);
				}
			}
		},

		// impact
		update: function()
		{
			// Socket controls
			// Movement controls sends an array of key-release and key-press values.
			// An array must be used to handle multiple key-down/release in a single frame

			// if (0 !== pressed.length || 0 !== released.length)
			// {
			// 	var control_update = { pressed: pressed, released: released };

			// 	if (this.socket)
			// 	{
			// 		this.socket.emit('player control', control_update);
			// 	}
			// 	else
			// 	{
			// 	}
			// }

			// if (ig.input.pressed('buildCollisionMap'))
			// {
			// 	console.log("Collision map!");
			// 	var rawData = ig.system.context.getImageData(0, 0, ig.system.width, ig.system.height);
			// 	console.log(rawData);
			// }

			if (ig.input.pressed('mouse1'))
			{
				var pix = { x: ig.input.mouse.x, y: ig.input.mouse.y};
				var rawData = ig.system.context.getImageData(pix.x, pix.y, 1, 1);
				console.log("Coordinations", ig.input.mouse);
			}

			this.parent();

			this.hud.update();
		},

		draw: function()
		{
			this.parent();

			this.hud.draw();

			// var player = this.getEntityByName('localtank');
			// if (player)
			// {
			// 	var font = new ig.Font('gfx/font.png');
			// 	var text1 = "Acc " + player.accel.x + ", " + player.accel.y;
			// 	var text2 = "Vel " + player.vel.x + ", " + player.vel.y;
			// 	font.draw(text1, 20, 400);
			// 	font.draw(text2, 20, 420);
			// }
		},

		XcheckEntities: function()
		{
			var response = new SAT.Response();

			// For now, check everything against everything
			for (var entityIndex = 0; entityIndex < this.entities.length; ++entityIndex)
			{
				var entity = this.entities[entityIndex];

				// if (entity instanceof Block)
				{
					// Don't check block as origin
				}
				// else
				{
					for (var opponentIndex = 0; opponentIndex < this.entities.length; ++opponentIndex)
					{
						var opponent = this.entities[opponentIndex];

						if (entity === opponent)
						{
							// Skip self
						}
						else
						{
							response.clear();
							var collided = entity.check(opponent, response);

							if (collided)
							{
								entity.collideWith(opponent, response);
								opponent.collideWith(entity, response);
							}
						}
					}
				}
			}
		}
	});
});
