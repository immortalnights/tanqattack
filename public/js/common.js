
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
