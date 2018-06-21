// require(function(define) {
	'use strict';

	/*return*/ function Animation(image, w, h, frames)
	{
		this.image = image;
		this.w = w;
		this.h = h;
		this.frames = frames;

		this._frame = 0;
		this._running = false;
	}

	Animation.prototype.play = function(duration, repeat)
	{
		this._frame = 1;
		this.duration = duration || 1;
		this.repeat = repeat || false;
		this._running = true;

		if (this.repeat !== true || this.repeat !== false)
		{
			--this.repeat;
		}

		// console.log('duration %is', (this.duration * 1000));
		// console.log('%f frames per second', (this.frames / this.duration));
		// console.time('anim');
	}

	Animation.prototype.stop = function()
	{
		this._frame = 0;
		this._running = false;
		// console.timeEnd('anim');
	}

	Animation.prototype.frame = function(delta)
	{
		if (this._running)
		{
			this._frame = this._frame + (((this.frames - 1) / this.duration) * delta);
			if (this._frame > this.frames)
			{
				if (this.repeat === true || this.repeat > 0)
				{
					this._frame = 0;
					if (this.repeat !== true && this.repeat > 0)
					{
						--this.repeat;
					}
				}
				else
				{
					this.stop();
				}
			}
		}
	}

	Animation.prototype.draw = function(ctx, x, y)
	{
		if (this._running)
		{
			ctx.drawImage(this.image, // image
			              this.w * Math.floor(this._frame), // source x
			              0, // source y
			              this.w, // source width
			              this.h, // source height
			              x - (this.w / 2), // target x
			              x - (this.h / 2), // target y
			              this.w, // target width
			              this.h); // target height
		}
	}

// });
