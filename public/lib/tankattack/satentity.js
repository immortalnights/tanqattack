ig.module(
  'tankattack.satentity'
).
requires(
  'impact.entity'
).
defines(function() {
  "use strict";

  var SATResponse = new SAT.Response();

  ig.Entity.inject({
    primitive: null,

    /** sets this.primitive to an updated SAT primitive representing this object */
    updatePrimitive: function()
    {
      if (this.primitive)
      {
        this.primitive.pos.x = this.pos.x + (this.primitive.offset || 0);
        this.primitive.pos.y = this.pos.y + (this.primitive.offset || 0);
      }
    },

    update: function()
    {
      this.parent();

      this.updatePrimitive();
    },
    
    draw: function()
    {
      // trace("draw", this.typeName, this.primitive);
      this.parent();

      if (ig.game.getConfigutation('drawPrimitives') && this.primitive)
      {
        if (this.primitive instanceof SAT.Circle)
        {
          drawSATCircle(ig.system.context, this.primitive);
        }
        else
        {
          drawSATPolygon(ig.system.context, this.primitive);
        }
      }


      if (ig.game.getConfigutation('drawBoundingBoxes') && this.size.x && this.size.y)
      {
        ig.system.context.beginPath();
        ig.system.context.strokeStyle = '#00F';
        ig.system.context.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        ig.system.context.stroke();
      }

      if (ig.game.getConfigutation('drawEnitityPosition'))
      {
        ig.system.context.beginPath();
        ig.system.context.strokeStyle = '#F00';
        ig.system.context.rect(this.pos.x, this.pos.y, 1, 1);
        ig.system.context.stroke();
      }
    },

    /** Bullets collide against Tanks or Bullets */
    check: function(other)
    {
      return;
    },

    collideWith: function(other, response)
    {
      debugger;
    }
  });
  
  ig.Entity.solveCollision = function(a, b)
  {
    var response = new SAT.Response();

    if (calculateSATCollision(a.primitive, b.primitive, response))
    {
      a.collideWith(b, response);
      b.collideWith(a, response);
    }
  }

  // return Bullet;
});
