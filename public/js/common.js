
const Loader = function() {
	this.images = {};
}

Loader.prototype.load = function(key, src) {
	var img = new Image();

	var p = new Promise(function (resolve, reject) {
		img.onload = function () {
			this.images[key] = img;
			console.debug("Image loaded successfully", src);

			resolve(img);
		}.bind(this);

		img.onerror = function () {
			reject('Could not load image: ' + src);
		};
	}.bind(this));

	img.src = src;
	return p;
}

Loader.prototype.get = function(key) {
	return this.images[key] || null;
}

window.loader = new Loader();


const Keyboard = function() {
}

Keyboard.prototype.init = function(socket) {
	var direction = { x: 0, y: 0 };
	window.addEventListener('keydown', (event) => {
		// console.log("keydown", event);
		var change = false;
		switch (event.key)
		{
			case 'ArrowUp':
			{
				if (direction.y !== -1)
				{
					direction.y = -1;
					change = true;
				}
				break;
			}
			case 'ArrowDown':
			{
				if (direction.y !== 1)
				{
					direction.y = 1;
					change = true;
				}
				break;
			}
			case 'ArrowLeft':
			{
				if (direction.x !== -1)
				{
					direction.x = -1;
					change = true;
				}
				break;
			}
			case 'ArrowRight':
			{
				if (direction.x !== 1)
				{
					direction.x = 1;
					change = true;
				}
				break;
			}
		}

		if (change)
		{
			socket.emit('move', direction);
		}
	});
	window.addEventListener('keyup', (event) => {
		// console.log("keyup", event);
		var change = false;
		switch (event.key)
		{
			case 'ArrowUp':/*
			{
				if (direction.y !== 0)
				{
					direction.y = 0;
					change = true;
				}
				break;
			}*/
			case 'ArrowDown':
			{
				if (direction.y !== 0)
				{
					direction.y = 0;
					change = true;
				}
				break;
			}
			case 'ArrowLeft':/*
			{
				if (direction.x !== -1)
				{
					direction.x = -1;
					change = true;
				}
				break;
			}*/
			case 'ArrowRight':
			{
				if (direction.x !== 0)
				{
					direction.x = 0;
					change = true;
				}
				break;
			}
		}

		if (change)
		{
			socket.emit('move', direction);
		}
	});
}

window.keyboard = new Keyboard();
