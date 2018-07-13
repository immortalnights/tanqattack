'use strict';

const Game = function(canvas) {
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');

	window.addEventListener('blur', function(event) {
		window.keyboard.reset();
	});

	this.offset = { x: 0, y: 46 }

	let self = this;
	this.canvas.addEventListener('mousedown', function(event) {
		var rect = this.getBoundingClientRect();
		var x = event.clientX - rect.left - self.offset.x;
		var y = event.clientY - rect.top - self.offset.y;
		console.log("x: " + x + " y: " + y);
	});
}

Game.prototype.start = function() {
	this.players = [];
	this.bullets = [];
	this.objs = [];
	this.animations = [];
	this._lastTick = 0;
	this._debugTimer = 0;

	var deferred = this.load();

	Promise.all(deferred).then(this._begin.bind(this));
}

Game.prototype._begin = function() {
	this.socket = io();
	window.keyboard.init(this.socket);

	this.socket.on('queued', (msg) => {
		console.log("Queued", msg);

		this._lastTick = performance.now();
		window.requestAnimationFrame(this.tick.bind(this));
	});

	this.socket.on('joined', (msg) => {
		console.log("Joined game", msg);

		// start the game tick
		this._lastTick = performance.now();
		window.requestAnimationFrame(this.tick.bind(this));
	});

	this.socket.on('left', (msg) => {
		console.log("Player game", msg);

		let index = this.players.findIndex((e) => {
			return e ? e.id === msg.id : false;
		});

		if (-1 !== index)
		{
			this.players[index] = null;
		}
	});

	this.socket.on('arena', (msg) => {
		console.log("Loading arena", msg);
		this.level = msg.level;
		this.players = msg.players;
	});

	// spawn a new actor
	this.socket.on('spawn', (actor) => {
		console.log("Actor spawned", actor);
		this.objs.push(actor);
	});

	// destroy a new actor
	this.socket.on('destroy', (actor) => {
		console.log("Actor destroyed", actor);
		// this.objs.push();

		if (actor.type === 'tanq')
		{
			let anim = new Animation(window.loader.get('tanqexplosion'), 65, 65, 10);
			anim.location = {};
			anim.location.x = actor.location.x;
			anim.location.y = actor.location.y;
			anim.play(0.5, false);
			this.animations.push(anim);
		}
		else if (actor.type === 'bullet')
		{
			let anim = new Animation(window.loader.get('bulletexplosion'), 20, 18, 7);
			anim.location = {};
			anim.location.x = actor.location.x;
			anim.location.y = actor.location.y;
			anim.play(0.5, false);
			this.animations.push(anim);
		}
	});

	// update all actors (TODO update scores)
	this.socket.on('update', (msg) => {
		// update objects
		this.players = msg.players;
		this.objs = msg.objects;
	});


	// update players
	this.socket.on('players', (msg) => {
		debugger;
		// this.players = msg;
		// console.log("Updated players");
	});

	// update bullets
	this.socket.on('bullets', (msg) => {
		debugger;
		// this.bullets = msg;
		// console.log("Updated players");
	});
}

Game.prototype.load = function() {
	return [window.loader.load('tilemap', '/gfx/tileset.png'),
	  window.loader.load('tanqs', '/gfx/tanqs.png'),
	  window.loader.load('tanqexplosion', '/gfx/tanqexplosion.png'),
	  window.loader.load('bullets', '/gfx/bullets.png'),
	  window.loader.load('bulletexplosion', '/gfx/bulletexplosion.png'),
	  window.loader.load('shield', '/gfx/shield.png'),
	  window.loader.load('powerup', '/gfx/powerup.png')];
}

Game.prototype.tick = function(delta) {

	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	var currentTime = performance.now();
	delta = (currentTime - this._lastTick) / 1000;
	this.update(delta);
	this.render(delta);

	this._lastTick = currentTime;
	window.requestAnimationFrame(this.tick.bind(this));
}

Game.prototype.update = function(delta) {
	const controller = window.keyboard.resolve();

	const keys = Object.keys(controller);

	// debug
	// if (keys.length)
	// {
	// 	console.log(controller);
	// }

	let direction = { x: 0, y: 0 };
	keys.forEach((control) => {
		switch (control)
		{
			case 'MoveUp':
			{
				direction.y = -1;
				break;
			}
			case 'MoveDown':
			{
				direction.y = 1;
				break;
			}
			case 'MoveLeft':
			{
				direction.x = -1;
				break;
			}
			case 'MoveRight':
			{
				direction.x = 1;
				break;
			}
			case 'Fire':
			{
				this.socket.emit('fire');
			}
		}
	});

	this.socket.emit('move', direction);
}

Game.prototype.render = function(delta) {
	let ctx = this.ctx;

	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, this.canvas.width, this.offset.y);

	const fontSize = 22;
	ctx.font = fontSize + 'px Lucida Console';
	ctx.textBaseline = 'top';
	ctx.fillStyle = '#fff';

	const renderPlayerStatistics = function(player, x, y) {
		let energy = player ? Math.floor(player.energy) : 0;
		let gun = player ? Math.floor(player.gun) : 0;

		if (energy < 10)
		{
			energy = '0' + energy;
		}
		if (gun < 10)
		{
			gun = '0' + gun;
		}

		ctx.fillText("ENERGY %" + energy + "  GUN %" + gun, x, y);
	};

	renderPlayerStatistics(this.players[0], 0, 0); // 1
	renderPlayerStatistics(this.players[2], 0, 22); // 2

	ctx.save();
	ctx.textAlign = 'center';
	ctx.fillText('0', this.canvas.width / 2, 11); // level
	ctx.restore();

	ctx.save();
	ctx.textAlign = 'right';
	renderPlayerStatistics(this.players[1], this.canvas.width, 0); // 3
	renderPlayerStatistics(this.players[3], this.canvas.width, 22); // 4
	ctx.restore();

	var drawBoundingBoxes = true;

	let map = this.level.map;
	let tileSize = this.level.tileSize;
	for (let r = 0; r < map.rows; r++)
	{
		for (let c = 0; c < map.columns; c++)
		{
			let tile = map.data[r][c];

			// 0 => empty tile
			if (tile !== 0)
			{
				let tileMap = window.loader.get('tilemap');
				this.ctx.drawImage(tileMap, // image
				                   (tile - 1) * tileSize, // source x
				                   0, // source y
				                   tileSize, // source width
				                   tileSize, // source height
				                   this.offset.x + c * tileSize, // target x
				                   this.offset.y + r * tileSize, // target y
				                   tileSize, // target width
				                   tileSize); // target height
			}
		}
	}

	const spriteFromDirection = function(direction) {
		var spriteOffset;
		if (direction.x === 0)
		{
			if (direction.y < 0)
			{
				spriteOffset = 0;
			}
			else
			{
				spriteOffset = 4;
			}
		}
		else if (direction.y === 0)
		{
			if (direction.x > 0)
			{
				spriteOffset = 2;
			}
			else
			{
				spriteOffset = 6;
			}
		}
		else
		{
			if (direction.x > 0)
			{
				if (direction.y > 0)
				{
					spriteOffset = 3;
				}
				else
				{
					spriteOffset = 1;
				}
			}
			else
			{
				if (direction.y > 0)
				{
					spriteOffset = 5;
				}
				else
				{
					spriteOffset = 7;
				}
			}
		}
		return spriteOffset;
	}

	const renderBounds = (polygon) => {
		if (drawBoundingBoxes && polygon)
		{
			ctx.beginPath();

			if (polygon.type === 'circle')
			{
				ctx.arc(this.offset.x + polygon.pos.x, this.offset.y + polygon.pos.y, polygon.r, 0, 2 * Math.PI);
			}
			else if (polygon.type === 'polygon')
			{
				ctx.moveTo(this.offset.x + polygon.pos.x, this.offset.y + polygon.pos.y);

				polygon.points.reverse().forEach((point, index) => {
					ctx.lineTo(this.offset.x + polygon.pos.x + point.x, this.offset.y + polygon.pos.y + point.y);
				});
				// ctx.rect(bullet.location.x-6, bullet.location.y-6, 12, 12);
				// ctx.closePath();
				// ctx.stroke();
			}

			ctx.closePath();
			ctx.stroke();
		}
	}

	const renderTanq = (tanq) => {
		if (tanq.location)
		{
			let image = window.loader.get('tanqs');

			// identify image based on direction
			let spriteOffset = spriteFromDirection(tanq.direction);
			ctx.drawImage(image, // image
			              (8 * 32) * tanq.owner + (spriteOffset * 32), // source x
			              0, // source y
			              32, // source width
			              36, // source height
			              this.offset.x + tanq.location.x - 16, // target x
			              this.offset.y + tanq.location.y - 16, // target y
			              32, // target width
			              36); // target height

			if (tanq.shield)
			{
				let shieldGfx = window.loader.get('shield');
				ctx.drawImage(shieldGfx,
					0,
					0,
					32,
					36,
					this.offset.x + tanq.location.x - 16,
					this.offset.y + tanq.location.y - 16,
					32,
					36);
			}

			renderBounds(tanq.polygon);
		}
	};

	const renderBullet = (bullet) => {
		let image = window.loader.get('bullets');
		ctx.drawImage(image, // image
		              12 * bullet.owner, // source x
		              0, // source y
		              12, // source width
		              16, // source height
		              this.offset.x + bullet.location.x - 6, // target x
		              this.offset.y + bullet.location.y - 6, // target y
		              12, // target width
		              16); // target height

		renderBounds(bullet.polygon);
	}

	const renderPowerUp = (powerUp) => {
		let image = window.loader.get('powerup');
		ctx.drawImage(image, // image
		              0, // source x
		              0, // source y
		              30, // source width
		              30, // source height
		              this.offset.x + powerUp.location.x, // target x
		              this.offset.y + powerUp.location.y, // target y
		              30, // target width
		              30); // target height

		renderBounds(powerUp.polygon);
	}

	ctx.save();

	if (drawBoundingBoxes)
	{
		ctx.strokeStyle = '#ff00ff';
	}

	this.objs.forEach((o, i) => {

		switch (o.type)
		{
			case 'tanq':
			{
				renderTanq(o);
				break
			}
			case 'bullet':
			{
				renderBullet(o);
				break;
			}
			case 'powerup':
			{
				renderPowerUp(o);
				break;
			}
		}
	});

	let destroyed = [];
	this.animations.forEach((a, i) => {
		if (a.isRunning())
		{
			a.frame(delta);
			a.draw(ctx, this.offset.x + a.location.x, this.offset.y + a.location.y);
		}
		else
		{
			destroyed.push(i);
		}
	});

	destroyed.forEach((index) => {
		this.animations.slice(index, 1);
	});

	if (drawBoundingBoxes)
	{
		// collision map
		this.level.blocks.forEach((block, i) => {
			if (block)
			{
				renderBounds(block.polygon);
			}
		});
	}

	ctx.restore();
}
