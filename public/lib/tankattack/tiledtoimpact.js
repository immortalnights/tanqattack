ig.module(
	'tankattack.tiledtoimpact'
).
requires().
defines(function() {
	"use strict";

	var TiledToImpact = ig.Class.extend({
		init: function()
		{

		},

		convert: function(tiledLevel)
		{
			var level = {
				entities: [],
				layer: [],
			};

			trace("Tiled", tiledLevel);

			for (var layerIndex = 0; layerIndex < tiledLevel.layers.length; ++layerIndex)
			{
				var layer = tiledLevel.layers[layerIndex];

				if ('Tiles' === layer.name)
				{
					var levelLayer = {};

					var originalPath = tiledLevel.tilesets[0].image;
					var separator = originalPath.lastIndexOf('/');

					levelLayer.tilesetName = 'gfx' + originalPath.substr(separator);
					levelLayer.tilesize = tiledLevel.tilewidth,
					levelLayer.distance = 1;

					this.processTiles(layer, levelLayer);

					level.layer.push(levelLayer);
				}
				else if ('Entities' === layer.name)
				{
					this.processEntities(layer, level.entities);
				}
				else
				{
					trace(layer);
				}
			}

			trace("Converted", level);
			return level;
		},

		processTiles: function(layer, level)
		{
			trace("%i x %i", layer.width, layer.height);

			level.data = [];

			for (var h = 0; h < layer.height; ++h)
			{
				var row = [];
				for (var w = 0; w < layer.width; ++w)
				{
					var tile = layer.data[w+(h*layer.width)];
					row.push(tile);
				}

				level.data.push(row);
			}
		},

		processEntities: function(layer, entities)
		{
			trace("Entities", layer);
			for (var objIndex = 0; objIndex < layer.objects.length; ++objIndex)
			{
				var layerEntity = layer.objects[objIndex];

				var impactEntity = {
					type: layerEntity.type,
					x: ~~layerEntity.x,
					y: ~~layerEntity.y,
					settings: {}
				};

				delete layerEntity.type;
				delete layerEntity.x;
				delete layerEntity.y;

				impactEntity.settings = ig.copy(layerEntity);

				entities.push(impactEntity);
			}
		}
	});

	window.TiledToImpact = TiledToImpact;


	// return TiledToImpact;
});

// var mapData = [];

// for (var y = 0; y < 14; ++y)
// {
//   mapData[y] = [];

//   for (var x = 0; x < tiled.width; ++x)
//   {
//     var thisIndex = (y*14) + x;
//     mapData[y][x] = tiled.layers[0].data[thisIndex];
//     console.log(thisIndex, tiled.layers[0].data, thisIndex);
//   }
// }
// console.log(mapData);

// var level_1 =
//         {
//           entities: [],
//           layer: [
//             {
//               name: "background1",
//               tilesetName: "gfx/tileset3.png",
//               repeat: false,
//               distance: 1,
//               tilesize: 32,
//               foreground: false,
//               data: mapData
//               // [
//               //   [ 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3],
//               //   [ 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
//               //   [ 4, 5, 5, 5, 5, 7, 9,10, 5, 5, 5, 5, 5, 7, 9,10, 5, 5, 5, 6],
//               //   [ 4, 5, 5, 5, 5,11,13,14, 5, 5, 5, 5, 5,11,13,14, 5, 5, 5, 6],
//               //   [ 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
//               //   [ 4, 5, 7, 8, 9,10, 5,18,19, 7, 9,10,18,19, 5, 5, 7, 9,10, 6],
//               //   [ 4, 5,27,25,28,21, 5,20,21,27,28,21,20,21, 5, 7,24,28,21, 6],
//               //   [ 4, 5,11,26,28,21, 5,20,21,27,28,21,20,21, 5,27,25,28,21, 6],
//               //   [ 4, 5, 5,11,13,14, 5,22,23,11,13,14,22,23, 5,11,12,13,14, 6],
//               //   [ 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
//               //   [ 4, 5, 5, 5, 5, 7, 9,10, 5, 5, 5, 5, 5, 7, 9,10, 5, 5, 5, 6],
//               //   [ 4, 5, 5, 5, 5,11,13,14, 5, 5, 5, 5, 5,11,13,14, 5, 5, 5, 6],
//               //   [ 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
//               //   [ 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
//               //   [15,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,17]
//               // ]
//             }
//           ]
//         };

        
//   var tiled = {
//     "height":14,
//  "layers":[
//         {
//          "data":[1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3,
//                  4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
//                  4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
//                  4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
//                  4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
//                  4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
//                  4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
//                  4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
//                  4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
//                  4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
//                  4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
//                  4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
//                  4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
//                  15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16,

//                  16, 16, 16, 16, 17],
//          "height":14,
//          "name":"Tile Layer 1",
//          "opacity":1,
//          "type":"tilelayer",
//          "visible":true,
//          "width":20,
//          "x":0,
//          "y":0
//         }],
//  "nextobjectid":1,
//  "orientation":"orthogonal",
//  "properties":
//     {

//     },
//  "renderorder":"right-down",
//  "tileheight":32,
//  "tilesets":[
//         {
//          "firstgid":1,
//          "image":"..\/..\/..\/gfx\/tileset3.png",
//          "imageheight":32,
//          "imagewidth":1280,
//          "margin":0,
//          "name":"tileset3",
//          "properties":
//             {

//             },
//          "spacing":0,
//          "tilecount":40,
//          "tileheight":32,
//          "tilewidth":32
//         }],
//  "tilewidth":32,
//  "version":1,
//  "width":20
// };
