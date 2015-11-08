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

    check: function(other, sat)
    {
      trace(this.typeName, "vs", other.typeName, "||", this.name, "vs", other.name);
      return;
    },

    collideWith: function(other, sat)
    {
      debugger;
    }
  });
  
  // /**
  //  * Copy of ig.Entity.checkPair but including SAT collision resolution detection
  //  *
  //  */
  // ig.Entity.checkPair = function (a, b)
  // {
  //   if (a.checkAgainst & b.type)
  //   {
  //     a.check(b);
  //   }
  //   if (b.checkAgainst & a.type)
  //   {
  //     b.check(a);
  //   }
  //   if (a.collides && b.collides && a.collides + b.collides > ig.Entity.COLLIDES.ACTIVE)
  //   {
  //     ig.Entity.solveCollision(a, b);
  //   }
  // };
  
  ig.Entity.solveCollision = function(a, b)
  {
    var response = new SAT.Response();

    if (!a.primitive)
    {

    }
    else if (!b.primitive)
    {

    }
    else if (calculateSATCollision(a.primitive, b.primitive, response))
    {
      // trace(a.typeName, "vs", b.typeName);
      a.collideWith(b, response);
      b.collideWith(a, response);
    }
  }

  // return Bullet;
});
