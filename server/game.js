//
//
//
var Timer = require('./timer');
var Player = require('./player');

function Game(socketio)
{
	if (!(this instanceof Game))
	{
		console.warn("Game function must be initialized as a new instance");
		return new Game();
	}

	this.io = socketio;
	this.players = [];
	this.spectators = [];

	this.next_player_index = 0;

	this.options = {
		maximum_concurrent_players: 2
	};

	this.initialize();
}

Game.prototype.initialize = function()
{
	this.timer = new Timer(this.update.bind(this));
	this.timer.start();

// 	setInterval(this.display.bind(this), 2000);


	// handle when someone connects
	this.io.on('connection', this.onConnection.bind(this));
};

// socketio wrapper to boardcast a message to all (or everyone else)
Game.prototype.broadcast = function(message, data, exclude)
{
	if (undefined === exclude)
	{
		this.io.broadcast.emit(message, data);
	}
	else // FIXME if (exclude instanceof this.io.Socket)
	{
		exclude.broadcast.emit(message, data);
	}
};

Game.prototype.get = function(dataset)
{
	var data = {
			spectators: 0,
			tanks: [],
		};

	// dataset is ignored, returns all game data
	for (var index = 0, length = this.players.length; index < length; ++index)
	{
		var player = this.players[index];

		if (player.type === Player.Spectator)
		{
			++data.spectators;
		}
		else
		{
			data.tanks.push(player.tank.get());
		}
	}

	return data;
};

// socket io handlers
// handle 'connection' handler
Game.prototype.onConnection = function(socket)
{
	// create a new player instance for the connection
	var new_player = new Player("Guest" + (this.next_player_index++), socket);
	console.log("Player connection", new_player.name);

	// add the player the list of players
	this.players.push(new_player);
	// join as Tank or Player
	new_player.joinGame(this, Player.Tank);

	// send to the player details of everyone
	var connected_data = [];
	for (var index = 0, length = this.players.length; index < length; ++index)
	{
		var player = this.players[index];

		var player_data = player.get();
		if (player == new_player)
		{
			player_data.you = true;
		}

		connected_data.push(player_data);
	}
	player.send('player connected', connected_data);

	// broadcast to everyone (except the new player) there is a new player and provide Tank details
	this.broadcast('player connected', [ new_player.get() ] , socket);
};

// Game.prototype.join = function(player)
// {
// 	// TODO always add the player to the spectator list and require them to "join" the game when they are ready.
// 	// Timeout waiting for the "next" player and push them to the end of the queue if they don't go ready soon enough

// 	if (this.options.maximum_concurrent_players == this.players.length)
// 	{
// 		// Maximum concurrent players, add the player to the spectators list
// 		this.spectators.push(player);
// 		player.send('joined', { as: "spectator" } );
// 	}
// 	else
// 	{
// 		// Add the player to the players
// 		this.players.push(player);
// 		player.send('joined', { as: "player" } );
// 	}
// };

Game.prototype.removePlayer = function(player)
{
	// Attempt to find the player in the current players list
	var player_index = this.players.indexOf(player);

	if (-1 != player_index)
	{
		this.players.splice(player_index, 1);
		console.log("Player has left");
	}
	else
	{
		var spectator_index = this.spectators.indexOf(player);

		if (-1 != spectator_index)
		{
			this.spectators.splice(spectator_index, 1);
			console.log("Spectator has left");
		}
		else
		{
			throw RangeError("Failed to find player object!");
		}
	}

	console.log('player disconnected');
};

Game.prototype.update = function(delta)
{
	var update = {
		players: [],
		timestamp: (new Date)
	};

	for (var index = 0, length = this.players.length; index < length; ++index)
	{
		var player = this.players[index];

		player.update(delta);

		update.players.push(player.get());
	}

	// console.log("send update", update);
	this.io.emit('update', update);
};

// Game.prototype.display = function()
// {
// 	var update = {
// 		tanks: [],
// 		timestamp: (new Date)
// 	};

// 	for (var index = 0, length = this.players.length; index < length; ++index)
// 	{
// 		var player = this.players[index];

// 		update.tanks.push(player.getStats());
// 	}

// 	console.log(update.tanks);
// };

module.exports = Game;
