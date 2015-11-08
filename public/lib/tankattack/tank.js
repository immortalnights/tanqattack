ig.module(
  'tankattack.tank'
).
requires(
  'impact.entity',
  'tankattack.bullet'
).
defines(function() {
  "use strict";

  /** Maximum tank velocity */
  var tankMaximumVelocity = 90;
  /** gun energy use per shot */
  var weaponEnergyUse = 10;

  window.Tank = ig.Entity.extend({
    typeName: 'Tank',
    zIndex: 10,
    size: { radius: 16, x: 32, y: 32 },
    animSheet: new ig.AnimationSheet('gfx/tank_sprite_sheet.png', 32, 34), 
    angle: 0,

    maxVel: {
      x: tankMaximumVelocity,
      y: tankMaximumVelocity
    },

    /** health */
    health: 100,
    /** weapon energy */
    weapon: 100,
    /** weapon re-fire cooldown timer */
    weaponCooldown: null,

    /** current SAT directional vector */
    directionalVector: null,
    /** previous SAT directional vector */
    previousDirectionalVector: null,

    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.BOTH,
    collides: ig.Entity.COLLIDES.ACTIVE,

    controlMap: null,

    sfx: {
      hit: new ig.Sound('sfx/tank_hit.mp3'),
      destroyed: new ig.Sound('sfx/tank_destroyed.mp3')
    },

    init: function(x, y, settings)
    {
      this.parent(x, y, settings);

      // Basic validation
      if (this.playerId === undefined)
      {
        console.error("Invalid playerId", settings);
        debugger;
      }

      this.name = 'player' + this.playerId,

      this.weaponCooldown = new ig.Timer(0.3);
      this.directionalVector = new SAT.Vector(0, 0);
      this.previousDirectionalVector = new SAT.Vector(0, -1);

      // Keyboard controls are only valid for the first two players
      if (this.playerId < 2)
      {
        this.initializeControls();
      }

      this.initializeAnimation();
      this.initializePrimitive();

      console.log("New tank", x, y);
    },

    initializeAnimation: function()
    {
      var framestart = this.playerId * 8;
      this.addAnim('00', 0.1, [framestart + 0] );
      this.addAnim('0-1', 0.1, [framestart + 0] );
      this.addAnim('1-1', 0.1, [framestart + 1] );
      this.addAnim('10', 0.1, [framestart + 2] );
      this.addAnim('11', 0.1, [framestart + 3] );
      this.addAnim('01', 0.1, [framestart + 4] );
      this.addAnim('-11', 0.1, [framestart + 5] );
      this.addAnim('-10', 0.1, [framestart + 6] );
      this.addAnim('-1-1', 0.1, [framestart + 7] );
    },

    initializePrimitive: function()
    {
      this.primitive = new SAT.Circle(new SAT.Vector(this.pos.x + this.size.radius, this.pos.y + this.size.radius), this.size.radius);
      this.primitive.offset = this.size.radius;
    },

    initializeControls: function()
    {
      this.controlMap = {};
      this.controlMap['up']    = window.Controls.getActionFor('up', this.playerId);
      this.controlMap['down']  = window.Controls.getActionFor('down', this.playerId);
      this.controlMap['left']  = window.Controls.getActionFor('left', this.playerId);
      this.controlMap['right'] = window.Controls.getActionFor('right', this.playerId);
      this.controlMap['fire']  = window.Controls.getActionFor('fire', this.playerId);

      trace(this.controlMap);
    },

    weaponRecharge: function(amount)
    {
      if (this.weapon < 100)
      {
        this.weapon += amount;
      }
    },

    fire: function()
    {
      // Prevent excessive ROF
      if (this.weaponCooldown.delta() < 0)
      {
        // trace("Weapon has not reloaded", this.weaponCooldown.delta());
      }
      else if (this.weapon < weaponEnergyUse)
      {
        // trace("Not enough energy to fire weapon", this.weapon, weaponEnergyUse);
      }
      else
      {
        // reset weapon cooldown
        this.weaponCooldown.set(0.30);
        // consume weapon energy
        this.weapon -= weaponEnergyUse;

        // initialize the bullet vector
        var bulletVector = new SAT.Vector();
        bulletVector.copy(this.previousDirectionalVector);

        // initialize the bullets settings
        var bulletSettings = {
          origin: this,
          directionalVector: bulletVector,
          frameStart: this.playerId
        };

        // initialize the bullets position
        var bulletPosition = {
          x: this.pos.x+(this.size.x/2),
          y: this.pos.y+(this.size.y/2)
        };

        // Spawn the bullet entity
        ig.game.spawnEntity(Bullet, bulletPosition.x, bulletPosition.y, bulletSettings);
      }
    },

    resetStats: function()
    {

    },

    receiveDamage: function(damage)
    {
      this.sfx.hit.play();

      this.parent(damage);

      if (this.health < 0)
      {
        this.sfx.destroyed.play();
      }
    },

    update: function()
    {
      this.parent();

      if (this.controlMap)
      {
        this.handleLocalControls();
      }
      else
      {
        // TODO Network input
      }

      // Set the entity velocity based on the current directionalVector
      this.vel.x = this.directionalVector.x * tankMaximumVelocity;
      this.vel.y = this.directionalVector.y * tankMaximumVelocity;

      this.setAnimFromDirection();

      // Limit to the canvas
      this.pos.x = this.pos.x.limit(0, ig.system.width - this.size.x);
      this.pos.y = this.pos.y.limit(0, ig.system.height - this.size.y);
    },

    handleLocalControls: function()
    {
      var xDirection = 0;
      if (ig.input.state(this.controlMap['left']))
      {
        xDirection = -1;
      }
      else if (ig.input.state(this.controlMap['right']))
      {
        xDirection = 1;
      }

      var yDirection = 0;
      if (ig.input.state(this.controlMap['up']))
      {
        yDirection = -1;
      }
      else if (ig.input.state(this.controlMap['down']))
      {
        yDirection = 1;
      }

      this.directionalVector.x = xDirection;
      this.directionalVector.y = yDirection;

      if (0 != this.directionalVector.x || 0 != this.directionalVector.y)
      {
        this.previousDirectionalVector.copy(this.directionalVector);
      }

      if (ig.input.state(this.controlMap['fire']))
      {
        // This won't be handled locally when the network code has been added
        this.fire();
      }
    },

    setAnimFromDirection: function()
    {
      // TODO set from directionalVelocity
      var directionalVectorString = this.previousDirectionalVector.x+''+this.previousDirectionalVector.y;
      this.currentAnim = this.anims[directionalVectorString];
    },

    check: function(other)
    {
      if (other instanceof Powerup)
      {
        ig.game.applyPowerup(this, other);
      }
      else if (other instanceof Tank)
      {
        var sat = new SAT.Response();
        if (calculateSATCollision(this.primitive, other.primitive, sat))
        {
          var vector = new SAT.Vector(this.pos.x, this.pos.y)
          vector.sub(sat.overlapV);

          this.pos.x = vector.x;
          this.pos.y = vector.y;
        }
      }
      else
      {

      }
    },

    /**
     * resolves Block or Tank collisions. Bullet collisions are ignored (handled by the bullet)
     *
     */
    collideWith: function(other, sat)
    {
      if (other instanceof Bullet)
      {
        // Ignore
      }
      else if (other instanceof Tank)
      {
        // var vector = new SAT.Vector(this.pos.x, this.pos.y)
        // vector.add(sat.overlapV);
        
        // FIXME - impactjs only collides one entity with another once per frame, so, when two 
        // tanks collide it's not possible to know which tank is moving towards the other without 
        // calculating it's movement vector before updating it's position. Maybe the movement
        // vector should be calculated in SATEntity.update.
        // Also - add directorial vector which can be used to calculate frame velocity

        // this.pos.x = vector.x;
        // this.pos.y = vector.y;
      }
      else if (other instanceof Block)
      {
        var vector = new SAT.Vector(this.pos.x, this.pos.y)
        vector.sub(sat.overlapV);

        this.pos.x = vector.x;
        this.pos.y = vector.y;
      }
    }
  });
});
