ig.module(
  'tankattack.game'
).
requires(
  'impact.game',
  'impact.input',
  'tankattack.tank'
).
defines(function() {
  "use strict";

  // Move to some options/configuration
  var KeyMapping =
  {
    'up': ig.KEY.W,
    'down': ig.KEY.S,
    'left': ig.KEY.A,
    'right': ig.KEY.D,
    'fire': ig.KEY.SPACE
  };

  
  window.TankAttack = ig.Game.extend({
    clearColor: '#fff',

    socket: null,
    // valid player actions (movement and abilities )
    actions: [ 'up', 'down', 'left', 'right', 'fire' ],

    init: function()
    {
      var level_1 =
        {
          entities: [],
          layer: [
            {
              name: "background1",
              tilesetName: "gfx/tileset.png",
              repeat: false,
              distance: 1,
              tilesize: 32,
              foreground: false,
              data: [
                [ 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3],
                [ 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
                [ 4, 5, 5, 5, 5, 7, 9,10, 5, 5, 5, 5, 5, 7, 9,10, 5, 5, 5, 6],
                [ 4, 5, 5, 5, 5,11,13,14, 5, 5, 5, 5, 5,11,13,14, 5, 5, 5, 6],
                [ 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
                [ 4, 5, 7, 8, 9,10, 5,18,19, 7, 9,10,18,19, 5, 5, 7, 9,10, 6],
                [ 4, 5,27,25,28,21, 5,20,21,27,28,21,20,21, 5, 7,24,28,21, 6],
                [ 4, 5,11,26,28,21, 5,20,21,27,28,21,20,21, 5,27,25,28,21, 6],
                [ 4, 5, 5,11,13,14, 5,22,23,11,13,14,22,23, 5,11,12,13,14, 6],
                [ 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
                [ 4, 5, 5, 5, 5, 7, 9,10, 5, 5, 5, 5, 5, 7, 9,10, 5, 5, 5, 6],
                [ 4, 5, 5, 5, 5,11,13,14, 5, 5, 5, 5, 5,11,13,14, 5, 5, 5, 6],
                [ 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
                [ 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
                [15,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,17]
              ]
            }
          ]
        };
      
      this.loadLevel(level_1);

      // bind the player controls
      for (var index = 0, length = this.actions.length; index < length; ++index)
      {
      	var action = this.actions[index];
      	var key = KeyMapping[action];

      	if (key)
      	{
		      ig.input.bind(key, action);
		      console.log("Bound", key, "for", action);
		    }
	    }

      // var bg = new ig.BackgroundMap( 16, data, 'media/tileset.png' );

      // connect to the server
      this.socket = io();

      // tie the socket events
      this.socket.on('connect', this.onConnect.bind(this));
      this.socket.on('disconnect', this.onDisconnect.bind(this));
      this.socket.on('error', this.onError.bind(this));

      this.socket.on('player connected', this.onPlayerConnected.bind(this));
      this.socket.on('player disconnected', this.onPlayerDisconnected.bind(this));

      this.socket.on('update', this.onUpdate.bind(this));

      // setInterval(function() { console.log(that.tank.pos, that.tank.vel, that.tank.angle); }, 2000);
    },

    // socket IO events
    onConnect: function(a, b, c)
    {
      console.log("Received 'connect'", a, b, c);
    },

    onDisconnect: function()
    {

    },

    onError: function(a,b, c)
    {
      console.log("Received 'error'", a, b, c);
    },

    onPlayerConnected: function(data)
    {
      console.log("Received 'player connected'", data);

      for (var index = 0, length = data.length; index < length; ++index)
      {
        this.spawnEntity(Tank, 0, 0, data[index]);
      }
    },
    
    onPlayerDisconnected: function(data)
    {
      console.log("Received 'player disconnected'", data);

      for (var index = 0, length = this.entities.length; index < length; ++index)
      {
        var tank = this.entities[index];

        if (tank.name === data.name)
        {
          // TODO explode!
          tank.kill();
        }
      }
    },

    onUpdate: function(data)
    {
      // console.log('onUpdate', data);

      for (var player_index = 0, total_players = data.players.length; player_index < total_players; ++player_index)
      {
        var player = data.players[player_index];

        // find the tank for the player
        var ok = false;
        for (var index = 0, length = this.entities.length; index < length; ++index)
        {
          var tank = this.entities[index];

          if (tank.name == player.name)
          {
            tank.vel = player.tank.vel;

            ok = true;
            // console.log("Update", tank.name, tank.vel, player.tank.vel);
          }
        }

        if (ok == false)
        {
          console.log("Failed to find tank for player", player.name);
        }
      }
    },

    // impact
    update: function()
    {
      // Socket controls
      // Movement controls sends an array of key-release and key-press values.
      // An array must be used to handle multiple key-down/release in a single frame

      // iterate over the actions
      var pressed = [];
      var released = [];

      for (var index = 0, length = this.actions.length; index < length; ++index)
      {
      	var action = this.actions[index];

      	// handle the action specific key being pressed
	      if (ig.input.pressed(action))
	      {
	        pressed.push(action);
	      }

      	// handle the action specific key being released
	      if (ig.input.released(action))
	      {
	        released.push(action);
	      }
	    }

      if (0 !== pressed.length || 0 !== released.length)
      {
      	var control_update = { pressed: pressed, released: released };
      	console.log(control_update);
        this.socket.emit('player control', control_update);
      }

      this.parent();
    }

  });
});
