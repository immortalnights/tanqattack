ig.module(
  'tankattack.bullet'
).
requires(
  'impact.entity'
).
defines(function() {
  "use strict";
  
  var bulletMaximumVelocity = 280;

  window.Bullet = ig.Entity.extend({
    typeName: 'Bullet',
    size: { radius: 6, x: 12, y: 12 },
    animSheet: new ig.AnimationSheet('gfx/bullets.png', 12, 12),
    explosionAnimSheet: new ig.AnimationSheet('gfx/bullet_explosion.png', 20, 18),
    angle: 0,

    maxVel: {
      x: bulletMaximumVelocity,
      y: bulletMaximumVelocity
    },

    damage: 9,
    /** life timer kills the bullet when it expires */
    lifeTimer: null,

    state: 0,

    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.ACTIVE,

    sfx: new ig.Sound('sfx/fire.mp3'),

    init: function(x, y, settings)
    {
      // Center the position on the bullets radius
      x -= this.size.radius;
      y -= this.size.radius;

      this.parent(x, y, settings);

      this.addAnim('normal', 0.1, [this.frameStart] );

      this.state = Bullet.State.NORMAL;
      this.lifeTimer = new ig.Timer(3);

      this.initializePrimitive();

      // Set the entity velocity based on the directional vector
      this.vel.x = this.directionalVector.x * bulletMaximumVelocity;
      this.vel.y = this.directionalVector.y * bulletMaximumVelocity;

      this.sfx.play();
    },

    initializePrimitive: function()
    {
      this.primitive = new SAT.Circle(new SAT.Vector(this.pos.x+this.size.radius, this.pos.y+this.size.radius), this.size.radius);
      this.primitive.offset = this.size.radius;
    },

    explode: function()
    {
      // ignore further collisions
      this.collides = ig.Entity.COLLIDES.NONE;

      var explosionAnimation = new ig.Animation(new ig.AnimationSheet('gfx/bullet_explosion.png', 20, 18), 0.1, [0, 1, 2, 3, 4, 5, 6], true);

      // set the animation sheet
      // this.animSheet = this.explosionAnimSheet;
      // create the explosion animation
      // this.addAnim('explosion', 0.25, [0, 1, 2, 3, 4, 5], true);
      this.currentAnim = explosionAnimation;

      // set the state
      this.state = Bullet.State.EXPLODING;
      // stop movement
      this.vel.x = 0;
      this.vel.y = 0;
    },

    update: function()
    {
      this.parent();

      switch (this.state)
      {
        case Bullet.State.NORMAL:
        {
          // Set the entity velocity based on the directional vector
          this.vel.x = this.directionalVector.x * bulletMaximumVelocity;
          this.vel.y = this.directionalVector.y * bulletMaximumVelocity;

          // determine if the bullet has expired
          if (this.lifeTimer.delta() > 0)
          {
            this.explode();
          }
          break;
        }
        case Bullet.State.EXPLODING:
        {
          // on the last frame
          if (this.currentAnim.frame == this.currentAnim.sequence.length - 1)
          {
            this.state = Bullet.State.EXPLODED;
          }
          break;
        }
        case Bullet.State.EXPLODED:
        {
          this.kill();
          break;
        }
      }
    },

    /*
     * resolves bullet collisions
     *
     *
     */
    collideWith: function(other, sat)
    {
      if (other instanceof Bullet)
      {
        // Ignore other bullets
      }
      else if (other instanceof Block)
      {
        if (this.lastHit !== other)
        {
          this.lastHit = other;
          
          // bounce
          // trace("Collision vector", sat.overlapN);
          this.directionalVector.reflect(sat.overlapN).reverse();

          this.directionalVector.x = this.directionalVector.x.round();
          this.directionalVector.y = this.directionalVector.y.round();
          // trace("Result vector", this.directionalVector);

          var vector = new SAT.Vector(this.pos.x, this.pos.y);
          vector.sub(sat.overlapV);

          this.pos.x = vector.x;
          this.pos.y = vector.y;
        }
      }
      else if (other instanceof Tank)
      {
        if (this.origin === other)
        {
          // Ignore origin tank
        }
        else
        {
          other.receiveDamage(this.damage);
          this.explode();
        }
      }
    }
  });

  window.Bullet.State = {
    NORMAL: 1,
    EXPLODING: 2,
    EXPLODED: 3
  };

  // return Bullet;
});
