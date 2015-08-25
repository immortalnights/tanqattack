ig.module(
  'tankattack.tank'
).
requires(
  'impact.entity'
).
defines(function() {
  "use strict";
  
  window.Tank = ig.Entity.extend({
    size: { x: 24, y: 24 },
    animSheet: new ig.AnimationSheet('gfx/tank.png', 24, 24), 
    angle: 0,

    init: function(x, y, settings)
    {
      this.parent(x, y, {});
      this.addAnim('idle', 0.1, [0] );

      this.name = settings.name;
      this.pos = settings.tank.pos;

      if (undefined !== settings.you && settings.you)
      {
        // this is you!
      }

      console.log("New tank", x, y);
    },

    update: function()
    {
      this.parent();

      this.pos.x = this.pos.x.limit(0, 640);
      this.pos.y = this.pos.y.limit(0, 480);
    }
  });
});
