ig.module(
  'tankattack.bullet'
).
requires(
  'impact.entity'
).
defines(function() {
  "use strict";
  
  var maxVelocity = 280;

  window.Bullet = ig.Entity.extend({
    typeName: 'Bullet',
    size: { radius: 6, x: 12, y: 12 },
    animSheet: new ig.AnimationSheet('gfx/bullets.png', 12, 12), 
    angle: 0,

    maxVel: {
      x: maxVelocity,
      y: maxVelocity
    },

    damage: 9,

    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.BOTH,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings)
    {
      this.parent(x, y, settings);

      this.addAnim('normal', 0.1, [0] );

      this.vel = settings.vel;
      // this.vel.y = this.maxVel.x;

      this.initializePrimitive();
    },

    initializePrimitive: function()
    {
      this.primitive = new SAT.Circle(new SAT.Vector(this.pos.x+this.size.radius, this.pos.y+this.size.radius), this.size.radius);
      this.primitive.offset = this.size.radius;
    },

    /** Bullets collide against Tanks or Blocks */
    check: function(other)
    {
      trace(this.typeName, "vs", other.typeName);
    },

    Xcheck: function(other, response)
    {
      var collided = false;
      if (this.origin === other)
      {
        // Can't hit self
      }
      else if (other instanceof Bullet)
      {
        // Ignore other bullets
      }
      else if (other instanceof Tank)
      {
        collided = SAT.testPolygonCircle(other.primitive, this.primitive, response);
        if (collided)
        {
          other.receiveDamage(this.damage);
          this.kill();
        }
        trace(other.typeName, "vs", this.typeName, collided);
      }
      else if (other instanceof Block)
      {

      }

      return collided;
    },

    /*
     * resolves bullet collisions
     *
     *
     */
    collideWith: function(other, response)
    {
      if (other instanceof Bullet)
      {
        // Ignore other bullets
      }
      else if (other instanceof Block)
      {
        // TODO bounce
        this.kill();
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
          this.kill();
        }
      }
    }
  });

  // return Bullet;
});
