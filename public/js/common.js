
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
	this.keys = {};
	this.mapping = {
		ArrowUp: 'MoveUp',
		ArrowDown: 'MoveDown',
		ArrowLeft: 'MoveLeft',
		ArrowRight: 'MoveRight',
		KeyW: 'MoveUp',
		KeyS: 'MoveDown',
		KeyA: 'MoveLeft',
		KeyD: 'MoveRight',
		ControlRight: 'Fire',
		Space: 'Fire'
	};
}

Keyboard.prototype.init = function() {
	var direction = { x: 0, y: 0 };
	window.addEventListener('keydown', (event) => {
		this.keys[event.code] = true;
	});
	window.addEventListener('keyup', (event) => {
		delete this.keys[event.code];
	});
}

Keyboard.prototype.reset = function() {
	this.keys = {};
}

Keyboard.prototype.resolve = function() {
	let result = {};
	Object.keys(this.keys).map((key) => {
		if (this.mapping[key])
		{
			result[this.mapping[key]] = true;
		}
	});

	return result;
}

window.keyboard = new Keyboard();
