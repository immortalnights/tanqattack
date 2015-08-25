//
//
//
var Tank = require('./tank');


function Player(name, socket)
{
	this.name = name;
	this.type = "";
	this.socket = socket;
	this.game = null;
	this.tank = null;

	this.socket.on('disconnect', this.onDisconnected.bind(this));
}

// Class enumerations
Player.prototype.Tank = 'Tank';
Player.prototype.Spectator = 'Spectator';

// socketio wrapper to sent this player information
Player.prototype.send = function(message, data)
{
	this.socket.emit(message, data)
};

// socketio wrapper to send the message to everyone except this player
Player.prototype.sendAll = function(message, data)
{
	this.socket.broadcast.emit(message, data)
};

Player.prototype.joinGame = function(game, as)
{
	this.game = game;
	this.type = as;

	// check if the socket has been closed before successfully joining a game
	if (this.socket === null)
	{
		console.log("Socket disconnected before joining game");
	}
	else
	{
		switch (this.type)
		{
			// this player is actually playing the game
			case Player.Tank:
			{
				this.tank = new Tank(this);
				break;
			}
			// this player is just watching
			case Player.Spectator:
			{
				break;
			}
		}
	}
};

Player.prototype.update = function(delta)
{
};

Player.prototype.get = function()
{
	return {
			'name': this.name,
			'you': false,
			'tank': this.tank.get('all')
		}
}

// socket io handlers
Player.prototype.onDisconnected = function(socket)
{
	if (this.game)
	{
		// broadcast to all players that this player has left
		this.sendAll('player disconnected', { 'name': this.name });
	}

	this.game.removePlayer(this);

	// this.tank contains an instance of this; so ensure it's destroyed
	this.tank = null;
	this.socket = null;

	console.log("Player", this.name, "disconnected");
};

module.exports = Player;
