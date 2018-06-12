'use strict';

const Game = function(canvas) {
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
}

Game.prototype.start = function() {
	this.players = [];
	this.bullets = [];
	this._lastTick = 0;
	this._debugTimer = 0;

	var deferred = this.load()

	Promise.all(deferred).then(() => {
		this.socket = io();
		window.keyboard.init(this.socket);

		this.socket.on('spawn', (msg) => {
			this.players.push(msg);
			console.log("Player spawned", msg);
		});

		this.socket.on('arena', (msg) => {
			this.arena = msg.arena;
			this.players = msg.players;

			// start the game tick
			this.tick();

			console.log("Loaded arena", this.arena);
		});

		this.socket.on('players', (msg) => {
			this.players = msg;
			// console.log("Updated players");
		});

		this.socket.on('bullets', (msg) => {
			this.bullets = msg;
			// console.log("Updated players");
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
	var ctx = this.ctx;

	var map = this.arena.map;
	for (var r = 0; r < map.rows; r++)
	{
		for (var c = 0; c < map.cols; c++)
		{
			var tile = map.data[r][c];

			// 0 => empty tile
			if (tile !== 0)
			{
				var tileMap = window.loader.get('tilemap');
				this.ctx.drawImage(tileMap, // image
				                   (tile - 1) * map.tileSize, // source x
				                   0, // source y
				                   map.tileSize, // source width
				                   map.tileSize, // source height
				                   c * map.tileSize, // target x
				                   r * map.tileSize, // target y
				                   map.tileSize, // target width
				                   map.tileSize); // target height
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

	ctx.save();

	var drawBoundingBoxes = false;
	if (drawBoundingBoxes)
	{
		ctx.strokeStyle = '#ff00ff';
	}

	this.players.forEach((p, i) => {
		let tanqs = window.loader.get('tanqs');

		// identify image based on direction
		let spriteOffset;
		if (p.direction.x === 0 && p.direction.y === 0)
		{
			spriteOffset = spriteFromDirection(p.lastDirection);
		}
		else
		{
			spriteOffset = spriteFromDirection(p.direction);
		}

		ctx.drawImage(tanqs, // image
		              (8 * 32) * (p.id % 4) + (spriteOffset * 32), // source x
		              0, // source y
		              32, // source width
		              36, // source height
		              p.location.x - 16, // target x
		              p.location.y - 16, // target y
		              32, // target width
		              36); // target height

		if (drawBoundingBoxes)
		{
			ctx.beginPath();
			ctx.arc(p.location.x, p.location.y, 16, 0, 2 * Math.PI);
			ctx.closePath();
			ctx.stroke();
		}
	});

	let bullets = window.loader.get('bullets');
	this.bullets.forEach((b, i) => {
		ctx.drawImage(bullets, // image
		              12 * b.image, // source x
		              0, // source y
		              12, // source width
		              16, // source height
		              b.location.x - 6, // target x
		              b.location.y - 6, // target y
		              12, // target width
		              16); // target height

		if (drawBoundingBoxes)
		{
			ctx.beginPath();
			ctx.arc(b.location.x, b.location.y, 6, 0, 2 * Math.PI);
			ctx.closePath();
			ctx.stroke();
		}
	});

	if (drawBoundingBoxes)
	{
		// collision map
		this.arena.blocks.forEach((b, i) => {
			// var start = b.points.shift();

			// console.log(b);
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.moveTo(b.pos.x, b.pos.y);
			b.points.forEach((p) => {
				ctx.lineTo(b.pos.x + p.x, b.pos.y + p.y);
			});
			ctx.closePath();
			ctx.stroke();
		});
	}

	ctx.restore();
}
