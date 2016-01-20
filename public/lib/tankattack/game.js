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
	'tankattack.powerup',
	'tankattack.tiledtoimpact'
).
defines(function() {
	"use strict";

	function rand(min, max)
	{
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var powerupSpawnTime = 0.1;
	
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

		/** array of tanks, player or CPU */
		tanks: null,
		/** tank weapon recharge timer */
		weaponEnergyRechargeTimer: new ig.Timer(),

		/** powerup spawn timer */
		powerupSpawnTimer: new ig.Timer(powerupSpawnTime),
		/** powerup duration timer */
		powerDownTimer: new ig.Timer(),

		init: function()
		{
			xhr('lib/tankattack/levels/level1.json').get(this.onLevelLoaded.bind(this));
			
			this.controls = new Controls(2),
			this.hud = new Hud({ height: 46 });
			this.tanks = [];

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
				this.tanks = [];

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

					var tank = this.spawnEntity(Tank, startPosition.x, startPosition.y, settings);
					this.tanks.push(tank);
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

		applyPowerup: function(tank, powerup)
		{
			this.poweredUp = tank;
			powerup.applyTo(tank);

			this.powerDownTimer.set(powerup.duration);

			powerup.kill();
		},

		/**
		 * remove a powerup applied to a tank
		 *
		 */
		powerDownTank: function()
		{
			if (this.poweredUp)
			{
				this.poweredUp.resetAttributes();

				this.poweredUp = null;
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

			this.parent();

			if (ig.input.pressed('mouse1'))
			{
				var pix = { x: ig.input.mouse.x, y: ig.input.mouse.y};
				var rawData = ig.system.context.getImageData(pix.x, pix.y, 1, 1);
				console.log("Coordinations", ig.input.mouse);
			}

			// recharge tank weapons
			if (this.weaponEnergyRechargeTimer.delta() > 0)
			{
				this.weaponEnergyRechargeTimer.set(0.20);
				for (var tankIndex = 0; tankIndex < this.tanks.length; ++tankIndex)
				{
					this.tanks[tankIndex].turret.recharge(1);
				}
			}

			if (this.powerupSpawnTimer.delta() > 0)
			{
				// Don't spawn more then one powerup
				var powerup = this.getEntityByName('powerup');
				if (!powerup)
				{
					this.powerupSpawnTimer.set(powerupSpawnTime);

					var levelMap = this.backgroundMaps[0];
					var tilesize = levelMap.tilesize;

					var x = rand(tilesize, ig.system.width);
					var y = rand(tilesize*2, (levelMap.height-1)*tilesize);

					var tile = levelMap.getTile(x, y);
					// trace("Tile at", x, y, tile);

					if (0 === tile)
					{
						var tx = Math.floor(x / tilesize) * tilesize;
						var ty = Math.floor(y / tilesize) * tilesize - (tilesize/2)+1;

						this.spawnEntity(Powerup, tx, ty);
						
						ig.game.sortEntitiesDeferred();
					}
				}
			}

			if (this.powerDownTimer.delta() > 0)
			{
				this.powerDownTank();
			}

			// update the Hud
			this.hud.update();
		},

		draw: function()
		{
			this.parent();

			this.hud.draw();
		}
	});
});
