//
// A simple setInterval based timer which calls a callback and provides the delta time between each iteration
//
function Timer(tick_callback)
{
	if (!(this instanceof Timer))
	{
		console.warn("Timer function must be initialized as a new instance");
		return new Timer(tick_callback);
	}

	this.timer         = null;
	this.tick_callback = tick_callback || null;
	this.fps           = 60;
	this.last_tick     = null;

	this.started = null;
	this.stopped = null;
}

Timer.prototype.start = function()
{
	this.timer = setInterval(this.tick.bind(this), 1);
	// this.timer = setInterval(function() { that.tick() }, 1);
	this.started = (new Date);
};

Timer.prototype.stop = function()
{
	this.last_tick = null;
	clearInterval(this.timer);
	this.stopped = (new Date);
};

Timer.prototype.tick = function(first_argument)
{
	var now = (new Date);
  var delta = now - this.last_tick;
  this.last_tick = now;

	if (typeof this.tick_callback === 'function')
	{
		this.tick_callback(Math.floor(delta / (1000 / this.fps)));
	}
};

module.exports = Timer;
