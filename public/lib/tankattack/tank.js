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
    animSheet: new ig.AnimationSheet('gfx/tank_sprite_sheet.png', 32, 34), 
    angle: 0,

    init: function(x, y, settings)
    {
      this.parent(x, y, {});

      var tankset = 8;
      this.addAnim('n', 0.1, [tankset + 0] );
      this.addAnim('ne', 0.1, [tankset + 1] );
      this.addAnim('e', 0.1, [tankset + 2] );
      this.addAnim('se', 0.1, [tankset + 3] );
      this.addAnim('s', 0.1, [tankset + 4] );
      this.addAnim('sw', 0.1, [tankset + 5] );
      this.addAnim('w', 0.1, [tankset + 6] );
      this.addAnim('nw', 0.1, [tankset + 7] );

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

      this.setAnimFromDirection()

      // Limit to the canvas
      this.pos.x = this.pos.x.limit(0, 640);
      this.pos.y = this.pos.y.limit(0, 480);
    },

    setAnimFromDirection: function()
    {
      var compass = '';

      if (this.vel.x == 0 && this.vel.y == 0)
      {

      }
      else
      {
        if (this.vel.y < 0)
        {
          compass = 'n';
        }
        else if (this.vel.y > 0)
        {
          compass = 's';
        }

        if (this.vel.x < 0)
        {
          compass += 'w';
        }
        else if (this.vel.x > 0)
        {
          compass += 'e';
        }
      }

      if (compass)
      {
        this.currentAnim = this.anims[compass];
      }
    }
  });
});
