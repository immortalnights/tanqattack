//
//
//
var util = require("util");

var Actions = require('..\\common\\actions');



function directionalVelocity(direction, speed)
{
	var new_vel = { x: 0, y: 0 };
	switch (direction)
	{
		case 'up':
		{
			new_vel.y = -speed;
			break;
		}
		case 'right':
		{
			new_vel.x = speed;
			break;
		}
		case 'down':
		{
			new_vel.y =  speed;
			break;
		}
		case 'left':
		{
			new_vel.x =  -speed;
			break;
		}
	}
	return new_vel;
}

function Tank(player)
{
	console.log("Tank initialized");

	this.name = "Unknown Player";
	this.size = { x: 24, y: 24 };
	this.speed = 30;
	this.pos = {
			x: Number.randomize(0, 640),
			y: Number.randomize(0, 480)
		};
	this.vel = { x: 0, y: 0 };

	this.move_stack = [];

	player.socket.on('player control', this.onPlayerControl.bind(this));
}

Tank.prototype.get = function(dataset)
{
	// dataset ignored; for optimization different attributes can be sent for different requests
	// E.G., "all" sends all details, "location" just provides locational based
	return {
			'name': this.name,
			'pos': this.pos,
			'vel': this.vel
		}
};

// socket io handlers
Tank.prototype.onPlayerControl = function(data)
{
	console.log(data);

	this.handleMovementControls(data);

	// if (undefined !== data.stop)
	// {
	// 	var index = this.move_stack.indexOf(data.stop);

	// 	if (-1 === index)
	// 	{
	// 		console.error("Invalid direction", data.stop);
	// 	}
	// 	else
	// 	{
	// 		if (index === this.move_stack.length - 1)
	// 		{
	// 			this.move_stack.pop();
	// 			var direction = this.move_stack[this.move_stack.length-1];
	// 			this.vel = directionalVelocity(direction, this.speed);
	// 		}
	// 		else
	// 		{
	// 			// If removing a key-press in the middle of the stack, don't affect the direction?
	// 			this.move_stack.splice(index, 1);
	// 		}
	// 	}
	// }
	
	// if (undefined !== data.move)
	// {
	// 	this.move_stack.push(data.move);

	// 	var new_vel = this.vel;
	// 	switch (data.move)
	// 	{
	// 		case 'up':
	// 		{
	// 			new_vel.y = -this.speed;
	// 			break;
	// 		}
	// 		case 'right':
	// 		{
	// 			new_vel.x = this.speed;
	// 			break;
	// 		}
	// 		case 'down':
	// 		{
	// 			new_vel.y =  this.speed;
	// 			break;
	// 		}
	// 		case 'left':
	// 		{
	// 			new_vel.x =  -this.speed;
	// 			break;
	// 		}
	// 	}

	// 	// this.vel = directionalVelocity(data.move, this.speed);
	// 	this.vel = new_vel;
	// }

	console.log(this.name, this.vel);
};

Tank.prototype.handleMovementControls = function(input)
{
	// Handle key-release
	if (undefined !== input.released && util.isArray(input.released) && 0 != input.released.length)
	{
		for (var index = 0, length = input.released.length; index < length; ++index)
		{
			this.onKeyReleased(input.released[index]);
		}
	}

	// handle key-press
	if (undefined !== input.pressed && util.isArray(input.pressed) && 0 != input.pressed.length)
	{
		for (var index = 0, length = input.pressed.length; index < length; ++index)
		{
			this.onKeyPressed(input.pressed[index]);
		}
	}

	this.vel = this.getMovementVelocity();
};

Tank.prototype.onKeyReleased = function(key)
{
	if ('full' === key)
	{
		// Clear the stack, no movement
		this.move_stack = [];
	}
	else
	{
		var index = this.move_stack.indexOf(key);

		if (-1 === index)
		{
			console.error("Invalid key", key);
		}
		else
		{
			// If the item is the last, pop it
			if (index === this.move_stack.length - 1)
			{
				this.move_stack.pop();
			}
			// Remove a key-press in the middle of the stack
			else
			{
				this.move_stack.splice(index, 1);
			}
		}
	}
};

Tank.prototype.onKeyPressed = function(key)
{
	// Add the key-press to the movement stack.
	this.move_stack.push(key);
};

Tank.prototype.getMovementVelocity = function()
{
	// Reverse iterate the movement stack and set the velocity accordingly
	var new_vel = { x: 0, y: 0 };
	console.log("have", this.move_stack.length);
	for (var index = 0, length = this.move_stack.length; index < length; ++index)
	{
		console.log("got", index, this.move_stack[index]);
		switch (this.move_stack[index])
		{
			case 'up':
			{
				new_vel.y = -this.speed;
				break;
			}
			case 'right':
			{
				new_vel.x = this.speed;
				break;
			}
			case 'down':
			{
				new_vel.y =  this.speed;
				break;
			}
			case 'left':
			{
				new_vel.x =  -this.speed;
				break;
			}
		}
	}
	// console.log(new_vel);
	return new_vel;
};

module.exports = Tank;
