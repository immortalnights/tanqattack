'use strict';

const Game = function(canvas) {
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
}

Game.prototype.start = function() {
	this.players = [];
	this.bullets = [];
	this.objs = [];
	this._lastTick = 0;
	this._debugTimer = 0;

	var deferred = this.load();

	Promise.all(deferred).then(() => {
		this.socket = io();
		window.keyboard.init(this.socket);

		this.socket.on('queued', (msg) => {
			console.log("Queued", msg);
		});

		this.socket.on('joined', (msg) => {
			console.log("Joined game", msg);

			// start the game tick
			this.tick();
		});

		this.socket.on('spawn', (msg) => {
			this.players.push(msg);
			console.log("Player spawned", msg);
		});

		this.socket.on('arena', (msg) => {
			console.log("Loading arena", msg);
			this.level = msg.level;
			this.players = msg.players;
		});

		this.socket.on('players', (msg) => {
			this.players = msg;
			// console.log("Updated players");
		});

		this.socket.on('bullets', (msg) => {
			this.bullets = msg;
			// console.log("Updated players");
		});

		this.socket.on('update', (msg) => {
			// update objects
			this.objs = msg.objects
		});

		this.socket.on('destroy', (msg) => {
			let index = this.players.findIndex((e) => {
				return e.id === msg.id;
			});

			console.log("Player destroyed", this.players[index]);

			if (-1 !== index)
			{
				this.players.splice(index, 1);
			}
		});
	});

}

Game.prototype.load = function() {
	return [window.loader.load('tilemap', '/gfx/tileset.png'),
	  window.loader.load('tanqs', '/gfx/tanqs.png'),
	  window.loader.load('bullets', '/gfx/bullets.png'),
	  window.loader.load('bulletexplosion', '/gfx/bulletexplosion.png')];
}

Game.prototype.tick = function() {
	window.requestAnimationFrame(this.tick.bind(this));

	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	const now = Date.now();
	var delta = now - this._lastTick;
	delta = Math.min(delta, 0.25);
	this.update(delta);
	this.render();
}

Game.prototype.update = function(delta) {

}

Game.prototype.render = function() {
	let ctx = this.ctx;

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
				                   c * tileSize, // target x
				                   r * tileSize, // target y
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

	const renderTanq = (tanq) => {
		let image = window.loader.get('tanqs');

		// identify image based on direction
		let spriteOffset = spriteFromDirection(tanq.direction);
		ctx.drawImage(image, // image
		              (8 * 32) * tanq.index + (spriteOffset * 32), // source x
		              0, // source y
		              32, // source width
		              36, // source height
		              tanq.location.x - 16, // target x
		              tanq.location.y - 16, // target y
		              32, // target width
		              36); // target height

		if (drawBoundingBoxes)
		{
			ctx.beginPath();
			ctx.arc(tanq.location.x, tanq.location.y, 16, 0, 2 * Math.PI);
			ctx.closePath();
			ctx.stroke();
		}
	};

	const renderBullet = (bullet) => {
		let image = window.loader.get('bullets');
		ctx.drawImage(image, // image
		              12 * bullet.index, // source x
		              0, // source y
		              12, // source width
		              16, // source height
		              bullet.location.x - 6, // target x
		              bullet.location.y - 6, // target y
		              12, // target width
		              16); // target height

		if (drawBoundingBoxes)
		{
			// ctx.beginPath();
			// ctx.arc(bullet.location.x, bullet.location.y, 6, 0, 2 * Math.PI);
			// ctx.closePath();
			// ctx.stroke();
			ctx.beginPath();
			ctx.rect(bullet.location.x-6, bullet.location.y-6, 12, 12);
			ctx.closePath();
			ctx.stroke();
		}
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
		}
		
	});

	if (drawBoundingBoxes)
	{
		// collision map
		this.level.blocks.forEach((b, i) => {
			// var start = b.points.shift();

			if (b)
			{
				// console.log(b);
				ctx.beginPath();
				ctx.lineWidth = 1;
				ctx.moveTo(b.pos.x, b.pos.y);
				b.points.forEach((p) => {
					ctx.lineTo(b.pos.x + p.x, b.pos.y + p.y);
				});
				ctx.closePath();
				ctx.stroke();
			}
		});
	}

	ctx.restore();
}
