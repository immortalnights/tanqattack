var express   = require('express');
var http      = require('http');
var path      = require('path');
var socket_io = require('socket.io');

var Game = require('./server/game');

var app = express();
var server = http.Server(app);
var io = socket_io(server);


Number.prototype.limit = function (min, max)
{
  return Math.min(max, Math.max(min, this));
};

Number.randomize = function(low, high)
{
  return Math.floor(Math.random() * (high - low + 1) + low);
};


function Player(socket)
{
	this.name = "Player";
	this.socket = socket;

	// control points affected by user input
	this.control = { 
		accellerating: false,
		breaking: false,
		turning: 0
	};

	// state values affected by control points
	this.pos = { x: 0, y: 0 };
	this.speed = 0;
	this.vel = { x: 0, y: 0 };
	this.angle = 0;
	this.last_pos = { x: 0, y: 0 };

	// constant values affecting control effect on state
	this.angle_per_second = 180; // can peform a full rotation in a second
	this.maximum_acceleration = 10; // maximum acceleration pixels per second
	this.maximum_breaking = 8; // maximum breaking pixels per second
	this.maximum_speed = 100;
	this.max_vel = { x: 100, y: 100 };

	// TODO does this closure leak?!
	var instance = this;
  this.socket.on('disconnect', function()
  {
  	console.log("Socket disconnected");
  	the_game.leave(instance);

  	// does doing this prevent the leak?
  	instance.socket = null;
  });

  this.socket.on('control', this.handleControl.bind(this));
}

Player.prototype.send = function(message, data)
{
	console.log("Sending", message, data);
	this.socket.emit(message, data);
};

Player.prototype.handleControl = function(data)
{
	// increase speed
	console.log(data);
	if (undefined !== data.accel)
	{
		console.log('accel', data.accel, this.control.accellerating);
		this.control.accellerating = (data.accel === true) ? true : false;
		console.log('accel', data.accel, this.control.accellerating);
	}
	// break
	else if (undefined !== data.break)
	{
		console.log('break', data.break, this.control.breaking);
		this.control.breaking = (data.break === true) ? true : false;
		console.log('break', data.break, this.control.breaking);
	}

	if (undefined !== data.turn)
	{
		if (data.turn === 0)
		{
			this.control.turning = 0; // Not turning
		}
		else if (data.turn === 1)
		{
			this.control.turning = 1; // Clockwise
		}
		else if (data.turn === -1)
		{
			this.control.turning = -1; // Anti-clockwise
		}
		else
		{
			// Invalid value for turn
		}
	}
};

//  update: function () {
//     this.last.x = this.pos.x;
//     this.last.y = this.pos.y;
//     this.vel.y += ig.game.gravity * ig.system.tick * this.gravityFactor;
//     this.vel.x = this.getNewVelocity(this.vel.x, this.accel.x, this.friction.x, this.maxVel.x);
//     this.vel.y = this.getNewVelocity(this.vel.y, this.accel.y, this.friction.y, this.maxVel.y);
//     var mx = this.vel.x * ig.system.tick;
//     var my = this.vel.y * ig.system.tick;
//     var res = ig.game.collisionMap.trace(this.pos.x, this.pos.y, mx, my, this.size.x, this.size.y);
//     this.handleMovementTrace(res);
//     if (this.currentAnim) {
//         this.currentAnim.update();
//     }
// },
// getNewVelocity: function (vel, accel, friction, max) {
//     if (accel) {
//         return (vel + accel * ig.system.tick).limit(-max, max);
//     } else if (friction) {
//         var delta = friction * ig.system.tick;
//         if (vel - delta > 0) {
//             return vel - delta;
//         } else if (vel + delta < 0) {
//             return vel + delta;
//         } else {
//             return 0;
//         }
//     }
//     return vel.limit(-max, max);
// },

Player.prototype.update = function(delta)
{
  this.last_pos.x = this.pos.x;
  this.last_pos.y = this.pos.y;

	if (this.control.accellerating === true)
	{
		this.speed += this.maximum_acceleration * delta;
		console.log('accellerating speed', this.maximum_acceleration, this.speed);
	}
	else if (this.control.breaking === true)
	{
		this.speed -= this.maximum_breaking * delta;
		console.log('breaking speed', this.speed);
	}

	if (this.control.turning != 0)
	{
		this.angle += this.angle_per_second * delta;
		if (this.angle > 360)
		{
			this.angle %= 360;
		}
		console.log('turning angle', this.angle);
	}

	var radians = (this.angle / 180) * Math.PI;
  this.vel.x = Math.cos(this.angle) * this.speed;
  this.vel.y = Math.sin(this.angle) * this.speed;

  this.vel.x = this.vel.x.limit(-this.max_vel.x, this.max_vel.x);
  this.vel.y = this.vel.y.limit(-this.max_vel.y, this.max_vel.y);

  var mx = this.vel.x * delta;
  var my = this.vel.y * delta;

  this.pos.x += mx.limit(0, 640);
  this.pos.y += my.limit(0, 480);
};


Player.prototype.getStats = function()
{
	return {
		'pos': this.pos,
		'vel': this.vel,
		'angle': this.angle
	};
};

var game = new Game(io);


app.get('/', function(req, res)
{
	// TODO forward to index.html
	var options = {
    root: __dirname + '/public/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };
  res.sendFile('index.html', options);
});

app.use(express.static(path.join(__dirname, 'public')));


server.listen(3000, function()
{
  console.log('listening on *:3000');
});
